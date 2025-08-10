import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface CacheItem {
  data: any;
  expiry: number | null;
}

interface RequestCache {
  cache: Map<string, CacheItem>;
  get(key: string): any;
  set(key: string, data: any, ttlSeconds?: number): void;
  generateKey(config: AxiosRequestConfig): string;
  clear(): void;
  clearByUrlPrefix(urlPrefix: string): void;
  clearPostsCache(): void;
}

interface LoadingManager {
  requests: Map<string, number>;
  startRequest(url: string): void;
  finishRequest(url: string): void;
  updateGlobalState(): void;
  getActiveRequests(): string[];
}

interface StateChangingPattern {
  method: string;
  urlPattern: string;
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  requestId?: string;
  cache?: boolean;
  forceRefresh?: boolean;
  _cacheKey?: string;
  _invalidatesCache?: boolean;
}

const requestCache: RequestCache = {
  cache: new Map(),

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  },

  set(key: string, data: any, ttlSeconds: number = 15): void {
    const expiry = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { data, expiry });
  },

  generateKey(config: AxiosRequestConfig): string {
    const { url, method, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
  },

  clear(): void {
    this.cache.clear();
  },

  clearByUrlPrefix(urlPrefix: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      const [method, url] = key.split(':');
      if (url && url.startsWith(urlPrefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  },

  clearPostsCache(): void {
    const prefixesToClear = [
      '/api/posts',
      '/api/feed',
      '/api/profile',
      '/api/profile/posts',
      '/api/profile/wall',
      '/api/profile/pinned_post',
      '/api/users',
      '/api/reposts',
      '/api/stories',
    ];

    for (const prefix of prefixesToClear) {
      this.clearByUrlPrefix(prefix);
    }
  },
};

const loadingManager: LoadingManager = {
  requests: new Map(),

  startRequest(url: string): void {
    const count = this.requests.get(url) || 0;
    this.requests.set(url, count + 1);
    this.updateGlobalState();
  },

  finishRequest(url: string): void {
    const count = this.requests.get(url) || 1;
    if (count > 1) {
      this.requests.set(url, count - 1);
    } else {
      this.requests.delete(url);
    }
    this.updateGlobalState();
  },

  updateGlobalState(): void {
    const isLoading = this.requests.size > 0;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('api-loading-changed', {
          detail: { isLoading, activeRequests: this.getActiveRequests() },
        })
      );
    }
  },

  getActiveRequests(): string[] {
    return Array.from(this.requests.keys());
  },
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const instance = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axios.defaults.withCredentials = true;

const STATE_CHANGING_PATTERNS: StateChangingPattern[] = [
  { method: 'post', urlPattern: '/api/posts/create' },
  { method: 'post', urlPattern: '/api/posts' },
  { method: 'delete', urlPattern: '/api/posts/' },
  { method: 'post', urlPattern: '/api/posts/*/like' },
  { method: 'post', urlPattern: '/api/posts/*/dislike' },
  { method: 'post', urlPattern: '/api/comments/create' },
  { method: 'post', urlPattern: '/api/comments/*/like' },
  { method: 'post', urlPattern: '/api/posts/*/edit' },
];

instance.interceptors.request.use(
  (config: any) => {
    config.requestId = Math.random().toString(36).substring(2, 9);

    if (config.method === 'get' && config.cache !== false) {
      // Disable caching for all post-related requests
      if (
        config.url &&
        (config.url.includes('/api/posts') ||
          config.url.includes('/api/feed') ||
          config.url.includes('/api/profile/posts') ||
          config.url.includes('/api/profile/wall') ||
          config.url.includes('/api/profile/pinned_post'))
      ) {
        config.cache = false;
        return config;
      }

      const cacheKey = requestCache.generateKey(config);
      const cachedData = requestCache.get(cacheKey);

      const forceRefresh = config.forceRefresh === true;

      if (cachedData && !forceRefresh) {
        const source = axios.CancelToken.source();
        // Убираем setTimeout для мгновенного возврата кэшированных данных
        source.cancel(
          JSON.stringify({
            status: 200,
            data: cachedData,
            fromCache: true,
          })
        );

        config.cancelToken = source.token;
        return config;
      }

      config._cacheKey = cacheKey;
    }

    if (config.method !== 'get') {
      const url = config.url || '';
      for (const pattern of STATE_CHANGING_PATTERNS) {
        if (config.method === pattern.method) {
          // Более безопасная логика для совместимости с Safari
          const urlPattern = pattern.urlPattern;
          let matches = false;

          try {
            // Простая проверка без сложных regex конструкций
            if (urlPattern.includes('*')) {
              const simplePattern = urlPattern.replace(/\*/g, '');
              matches = url.includes(simplePattern);
            } else {
              matches = url.includes(urlPattern);
            }
          } catch (e) {
            // Fallback для очень старых браузеров
            matches = url.indexOf(urlPattern.replace(/\*/g, '')) !== -1;
          }

          if (matches) {
            config._invalidatesCache = true;
            break;
          }
        }
      }
    }

    const url = config.url?.split('?')[0] || 'unknown';
    loadingManager.startRequest(url);

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request configuration error:', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const url = response.config.url?.split('?')[0] || 'unknown';
    loadingManager.finishRequest(url);

    if ((response.config as ExtendedAxiosRequestConfig)._invalidatesCache) {
      requestCache.clearPostsCache();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('data-updated', {
            detail: {
              url: response.config.url,
              method: response.config.method,
            },
          })
        );
      }
    }

    if (
      response.config.method === 'get' &&
      (response.config as ExtendedAxiosRequestConfig)._cacheKey &&
      response.status === 200
    ) {
      requestCache.set(
        (response.config as ExtendedAxiosRequestConfig)._cacheKey!,
        response.data,
        300 // 5 minutes cache
      );
    }

    return response;
  },
  (error: AxiosError) => {
    if (error.config) {
      const url = error.config.url?.split('?')[0] || 'unknown';
      loadingManager.finishRequest(url);
    }

    if (axios.isCancel(error)) {
      try {
        const cancelData = JSON.parse(error.message);
        if (cancelData.fromCache) {
          return Promise.resolve({
            status: cancelData.status,
            data: cancelData.data,
            config: error.config,
            headers: {},
            statusText: 'OK',
            request: null,
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const retryRequest = async (
  config: AxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<AxiosResponse> => {
  try {
    return await instance(config);
  } catch (error: any) {
    if (
      retries > 0 &&
      axios.isAxiosError(error) &&
      error.response?.status &&
      error.response.status >= 500
    ) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(config, retries - 1);
    }
    throw error;
  }
};

// Enhanced request methods with retry logic
export const api = {
  get: (url: string, config?: AxiosRequestConfig) =>
    retryRequest({ ...config, method: 'get', url }),
  post: (url: string, data?: any, config?: AxiosRequestConfig) =>
    retryRequest({ ...config, method: 'post', url, data }),
  put: (url: string, data?: any, config?: AxiosRequestConfig) =>
    retryRequest({ ...config, method: 'put', url, data }),
  delete: (url: string, config?: AxiosRequestConfig) =>
    retryRequest({ ...config, method: 'delete', url }),
  patch: (url: string, data?: any, config?: AxiosRequestConfig) =>
    retryRequest({ ...config, method: 'patch', url, data }),

  // Cache management
  clearCache: () => requestCache.clear(),
  clearPostsCache: () => requestCache.clearPostsCache(),

  // Loading state
  getLoadingState: () => ({
    isLoading: loadingManager.requests.size > 0,
    activeRequests: loadingManager.getActiveRequests(),
  }),

  // Enhanced request with progress tracking
  async loadData(
    config: AxiosRequestConfig,
    onProgress?: (progress: number) => void,
    onError?: (error: any) => void
  ) {
    try {
      const response = await retryRequest(config);
      if (onProgress) onProgress(100);
      return response.data;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  },
};

export default instance;
