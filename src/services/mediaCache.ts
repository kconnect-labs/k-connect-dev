interface CachedMedia {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  type: string;
}

interface CacheStats {
  totalSize: number;
  itemCount: number;
  lastCleanup: number;
}

class MediaCacheService {
  private dbName = 'KConnectMediaCache';
  private dbVersion = 1;
  private storeName = 'media';
  private statsStoreName = 'stats';
  private db: IDBDatabase | null = null;
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        this.setupInterceptors();
        this.cleanupOldEntries();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Создаем хранилище для медиа
        if (!db.objectStoreNames.contains(this.storeName)) {
          const mediaStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
          mediaStore.createIndex('timestamp', 'timestamp', { unique: false });
          mediaStore.createIndex('size', 'size', { unique: false });
        }

        // Создаем хранилище для статистики
        if (!db.objectStoreNames.contains(this.statsStoreName)) {
          db.createObjectStore(this.statsStoreName, { keyPath: 'id' });
        }
      };
    });
  }

  private setupInterceptors(): void {
    // Перехватываем все запросы к /static/ файлам
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Нормализуем URL - извлекаем путь из полного URL
      let normalizedUrl = url;
      
      try {
        // Если это полный URL, извлекаем путь
        if (url.startsWith('http')) {
          const urlObj = new URL(url);
          normalizedUrl = urlObj.pathname;
        }
        // Если это относительный путь, оставляем как есть
        else if (url.startsWith('/')) {
          normalizedUrl = url;
        }
      } catch (error) {
        console.warn('Failed to normalize URL:', url, error);
        normalizedUrl = url;
      }
      
      // Проверяем, является ли это медиа файлом
      if (this.isMediaFile(normalizedUrl)) {
        try {
          // Сначала пытаемся получить из кеша
          const cached = await this.get(normalizedUrl);
          if (cached) {
            return new Response(cached.blob, {
              status: 200,
              headers: {
                'Content-Type': cached.type,
                'X-Cache': 'HIT',
                'Cache-Control': 'public, max-age=31536000',
              },
            });
          }

          // Если нет в кеше, загружаем и кешируем
          const response = await originalFetch(input, init);
          if (response.ok) {
            const blob = await response.clone().blob();
            await this.set(normalizedUrl, blob);
          }
          
          return response;
        } catch (error) {
          console.warn('Media cache error:', error);
          return originalFetch(input, init);
        }
      }

      return originalFetch(input, init);
    };

    // Перехватываем создание Image элементов
    const originalCreateElement = document.createElement.bind(document);
    const self = this;
    document.createElement = function(tagName: string): HTMLElement {
      const element = originalCreateElement(tagName);
      
      if (tagName.toLowerCase() === 'img') {
        const originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name: string, value: string) {
          if (name === 'src') {
            // Нормализуем URL для относительных путей
            let normalizedValue = value;
            
            try {
              // Если это полный URL, извлекаем путь
              if (value.startsWith('http')) {
                const urlObj = new URL(value);
                normalizedValue = urlObj.pathname;
              }
              // Если это относительный путь, оставляем как есть
              else if (value.startsWith('/')) {
                normalizedValue = value;
              }
            } catch (error) {
              console.warn('Failed to normalize img src URL:', value, error);
              normalizedValue = value;
            }
            
            if (self.isMediaFile(normalizedValue)) {
              // Добавляем обработчик загрузки для кеширования
              element.addEventListener('load', () => {
                self.cacheImageFromElement(element as HTMLImageElement, normalizedValue);
              });
            }
          }
          return originalSetAttribute(name, value);
        };
      }
      
      return element;
    };
  }

  private isMediaFile(url: string): boolean {
    const mediaExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
      '.mp4', '.webm', '.ogg', '.mp3', '.wav',
      '.ico', '.bmp', '.tiff'
    ];
    
    const lowerUrl = url.toLowerCase();
    
    // Проверяем расширения файлов
    const hasMediaExtension = mediaExtensions.some(ext => lowerUrl.includes(ext));
    
    // Проверяем папки (с /static/ или без)
    const isInMediaFolder = lowerUrl.includes('/uploads/') ||
                           lowerUrl.includes('/images/') ||
                           lowerUrl.includes('/avatars/') ||
                           lowerUrl.includes('/inventory/') ||
                           lowerUrl.includes('/music/') ||
                           lowerUrl.includes('/sounds/') ||
                           lowerUrl.includes('/icons/') ||
                           lowerUrl.includes('/preview/') ||
                           lowerUrl.includes('/moderators/') ||
                           lowerUrl.includes('/medals/') ||
                           lowerUrl.includes('/decoration/') ||
                           lowerUrl.includes('/font/') ||
                           lowerUrl.includes('/subs/') ||
                           lowerUrl.includes('/receipt/') ||
                           lowerUrl.includes('/badge_prev/') ||
                           lowerUrl.includes('/leaderboard_snapshots/') ||
                           lowerUrl.includes('/street_blacklist/') ||
                           lowerUrl.includes('/spider/') ||
                           lowerUrl.includes('/404/') ||
                           lowerUrl.includes('/json/') ||
                           lowerUrl.includes('/pdf_templates/') ||
                           lowerUrl.includes('/playlists/') ||
                           lowerUrl.includes('/BugUpload/');
    
    return hasMediaExtension || isInMediaFolder;
  }

  private async cacheImageFromElement(img: HTMLImageElement, normalizedUrl?: string): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const urlToCache = normalizedUrl || img.src;
          await this.set(urlToCache, blob);
        }
      }, 'image/webp', 0.9);
    } catch (error) {
      console.warn('Failed to cache image from element:', error);
    }
  }

  async get(url: string): Promise<CachedMedia | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedMedia | undefined;
        if (result && Date.now() - result.timestamp < this.maxAge) {
          resolve(result);
        } else {
          if (result) {
            this.delete(url); // Удаляем устаревший кеш
          }
          resolve(null);
        }
      };
    });
  }

  async set(url: string, blob: Blob): Promise<void> {
    if (!this.db) return;

    const cachedMedia: CachedMedia = {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
      type: blob.type,
    };

    // Проверяем размер кеша перед добавлением
    await this.ensureCacheSize(blob.size);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cachedMedia);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.updateStats();
        resolve();
      };
    });
  }

  async delete(url: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.updateStats();
        resolve();
      };
    });
  }

  async getStats(): Promise<CacheStats> {
    if (!this.db) return { totalSize: 0, itemCount: 0, lastCleanup: 0 };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.statsStoreName], 'readonly');
      const store = transaction.objectStore(this.statsStoreName);
      const request = store.get('stats');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || { totalSize: 0, itemCount: 0, lastCleanup: 0 });
      };
    });
  }

  private async updateStats(): Promise<void> {
    if (!this.db) return;

    const stats = await this.calculateStats();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.statsStoreName], 'readwrite');
      const store = transaction.objectStore(this.statsStoreName);
      const request = store.put({ id: 'stats', ...stats });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async calculateStats(): Promise<Omit<CacheStats, 'id'>> {
    if (!this.db) return { totalSize: 0, itemCount: 0, lastCleanup: 0 };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const items = request.result as CachedMedia[];
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        resolve({
          totalSize,
          itemCount: items.length,
          lastCleanup: Date.now(),
        });
      };
    });
  }

  private async ensureCacheSize(newItemSize: number): Promise<void> {
    const stats = await this.getStats();
    const projectedSize = stats.totalSize + newItemSize;

    if (projectedSize > this.maxCacheSize) {
      await this.cleanupOldEntries();
      
      // Если все еще слишком много, удаляем самые старые файлы
      const newStats = await this.getStats();
      if (newStats.totalSize + newItemSize > this.maxCacheSize) {
        await this.removeOldestEntries(newItemSize);
      }
    }
  }

  private async cleanupOldEntries(): Promise<void> {
    if (!this.db) return;

    const cutoffTime = Date.now() - this.maxAge;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          this.updateStats();
          resolve();
        }
      };
    });
  }

  private async removeOldestEntries(requiredSpace: number): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor();

      let freedSpace = 0;
      const itemsToDelete: string[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && freedSpace < requiredSpace) {
          const item = cursor.value as CachedMedia;
          itemsToDelete.push(item.url);
          freedSpace += item.size;
          cursor.continue();
        } else {
          // Удаляем собранные элементы
          const deletePromises = itemsToDelete.map(url => this.delete(url));
          Promise.all(deletePromises).then(() => {
            this.updateStats();
            resolve();
          });
        }
      };
    });
  }

  // Методы для отладки и управления
  async listCachedUrls(): Promise<string[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
    });
  }

  async preloadUrls(urls: string[]): Promise<void> {
    const promises = urls.map(url => {
      if (url.includes('/static/')) {
        return fetch(url).catch(() => null);
      }
      return Promise.resolve();
    });

    await Promise.all(promises);
  }

  async getAllCachedMedia(): Promise<CachedMedia[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result as CachedMedia[]);
      };
    });
  }
}

// Создаем единственный экземпляр сервиса
const mediaCacheService = new MediaCacheService();

// Экспортируем функции для использования в App.tsx
export const initMediaCache = () => mediaCacheService.init();
export const clearMediaCache = () => mediaCacheService.clear();
export const getMediaCacheStats = () => mediaCacheService.getStats();
export const listCachedUrls = () => mediaCacheService.listCachedUrls();
export const preloadMediaUrls = (urls: string[]) => mediaCacheService.preloadUrls(urls);
export const getAllCachedMedia = () => mediaCacheService.getAllCachedMedia();

// Экспортируем сам сервис для прямого доступа (если нужно)
export default mediaCacheService; 