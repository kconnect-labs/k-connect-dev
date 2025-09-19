/**
 * Утилиты для оптимизации производительности
 */

/**
 * Throttle функция для ограничения частоты вызовов
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(
        () => {
          func(...args);
          lastExecTime = Date.now();
        },
        delay - (currentTime - lastExecTime)
      );
    }
  };
}

/**
 * Debounce функция для задержки вызовов
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Оптимизированный обработчик resize с throttling
 */
export function createOptimizedResizeHandler(
  callback: () => void,
  delay: number = 100
): () => void {
  const throttledCallback = throttle(callback, delay);

  return () => {
    window.addEventListener('resize', throttledCallback, { passive: true });
    return () => window.removeEventListener('resize', throttledCallback);
  };
}

/**
 * Мемоизированная функция для обработки контента
 */
export function createContentProcessor() {
  const cache = new Map<string, any>();

  return function processContent(content: string, regexes: RegExp[]) {
    if (!content) return { processedContent: '', urls: [] };

    const cacheKey = `${content}_${regexes.map(r => r.source).join('|')}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    let processedContent = content;
    const urls: string[] = [];

    regexes.forEach(regex => {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        urls.push(match[0]);
      }
    });

    const result = { processedContent, urls };

    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    cache.set(cacheKey, result);

    return result;
  };
}

/**
 * Оптимизированный Intersection Observer
 */
export function createOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Batch обновления состояния для уменьшения ререндеров
 */
export function createBatchedStateUpdater<T>(
  setState: React.Dispatch<React.SetStateAction<T>>
) {
  let pendingUpdates: Partial<T> = {};
  let timeoutId: NodeJS.Timeout | null = null;

  return (updates: Partial<T>) => {
    Object.assign(pendingUpdates, updates);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      setState(prev => ({ ...prev, ...pendingUpdates }));
      pendingUpdates = {};
      timeoutId = null;
    }, 16);
  };
}

/**
 * Проверка производительности устройства
 */
export function getDevicePerformanceLevel(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium';

  const connection = (navigator as any).connection;
  const memory = (performance as any).memory;

  if (connection) {
    if (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g'
    ) {
      return 'low';
    }
    if (connection.effectiveType === '3g') {
      return 'medium';
    }
  }

  if (memory) {
    const usedMemory = memory.usedJSHeapSize / memory.totalJSHeapSize;
    if (usedMemory > 0.8) {
      return 'low';
    }
    if (usedMemory > 0.6) {
      return 'medium';
    }
  }

  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return 'low';
  }

  return 'high';
}

/**
 * Адаптивные настройки производительности
 */
export function getPerformanceSettings() {
  const level = getDevicePerformanceLevel();

  switch (level) {
    case 'low':
      return {
        animationDuration: 200,
        throttleDelay: 200,
        debounceDelay: 300,
        maxCacheSize: 50,
        preloadImages: false,
        enableAnimations: false,
        enableTransitions: false,
        maxConcurrentRequests: 2,
        imageQuality: 'low',
      };
    case 'medium':
      return {
        animationDuration: 300,
        throttleDelay: 100,
        debounceDelay: 150,
        maxCacheSize: 100,
        preloadImages: true,
        enableAnimations: true,
        enableTransitions: true,
        maxConcurrentRequests: 4,
        imageQuality: 'medium',
      };
    case 'high':
    default:
      return {
        animationDuration: 500,
        throttleDelay: 50,
        debounceDelay: 100,
        maxCacheSize: 200,
        preloadImages: true,
        enableAnimations: true,
        enableTransitions: true,
        maxConcurrentRequests: 8,
        imageQuality: 'high',
      };
  }
}

/**
 * Оптимизированный обработчик скролла
 */
export function createOptimizedScrollHandler(
  callback: (event: Event) => void,
  delay: number = 16
): () => void {
  let isScrolling = false;

  const throttledCallback = throttle(callback, delay);

  return () => {
    const handler = (event: Event) => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          throttledCallback(event);
          isScrolling = false;
        });
        isScrolling = true;
      }
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  };
}

/**
 * Мемоизированный селектор для Redux/Context
 */
export function createMemoizedSelector<T, R>(
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
) {
  let lastResult: R;
  let lastState: T;

  return (state: T): R => {
    if (state === lastState) {
      return lastResult;
    }

    const result = selector(state);

    if (equalityFn ? equalityFn(result, lastResult) : result === lastResult) {
      return lastResult;
    }

    lastState = state;
    lastResult = result;
    return result;
  };
}

/**
 * Оптимизированная загрузка изображений
 */
export function createImagePreloader(maxConcurrent: number = 3) {
  const queue: string[] = [];
  let loading = 0;

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const processQueue = async () => {
    if (loading >= maxConcurrent || queue.length === 0) {
      return;
    }

    const src = queue.shift();
    if (!src) return;

    loading++;
    try {
      await loadImage(src);
    } catch (error) {
      console.warn('Failed to preload image:', src);
    } finally {
      loading--;
      processQueue();
    }
  };

  return {
    preload: (src: string) => {
      if (!queue.includes(src)) {
        queue.push(src);
        processQueue();
      }
    },
    preloadBatch: (srcs: string[]) => {
      srcs.forEach(src => {
        if (!queue.includes(src)) {
          queue.push(src);
        }
      });
      processQueue();
    },
  };
}

/**
 * Оптимизированный обработчик кликов с предотвращением двойных кликов
 */
export function createClickHandler(
  callback: (event: MouseEvent) => void,
  delay: number = 300
) {
  let lastClickTime = 0;

  return (event: MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime < delay) {
      event.preventDefault();
      return;
    }
    lastClickTime = now;
    callback(event);
  };
}

/**
 * Утилита для измерения производительности
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  if (process.env.NODE_ENV === 'development') {
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
  }

  return result;
}

/**
 * Оптимизированная функция для работы с localStorage
 */
export function createOptimizedStorage(key: string) {
  let cache: any = null;
  let lastAccess = 0;
  const CACHE_DURATION = 1000; // 1 секунда

  return {
    get: () => {
      const now = Date.now();
      if (cache && now - lastAccess < CACHE_DURATION) {
        return cache;
      }

      try {
        const item = localStorage.getItem(key);
        cache = item ? JSON.parse(item) : null;
        lastAccess = now;
        return cache;
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
        return null;
      }
    },

    set: (value: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        cache = value;
        lastAccess = Date.now();
      } catch (error) {
        console.warn('Failed to write to localStorage:', error);
      }
    },

    remove: () => {
      try {
        localStorage.removeItem(key);
        cache = null;
        lastAccess = 0;
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    },
  };
}
