/**
 * Система кеширования бейджей для избежания CORS ошибок
 */

interface BadgeCacheEntry {
  data: string; // base64 или blob URL
  timestamp: number;
  type: 'svg' | 'image';
}

class BadgeCache {
  private cache = new Map<string, BadgeCacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа
  private readonly MAX_CACHE_SIZE = 100; // Максимум 100 бейджей в кеше

  /**
   * Получить бейдж из кеша или загрузить и закешировать
   */
  async getBadge(imagePath: string): Promise<string | null> {
    const cacheKey = this.getCacheKey(imagePath);

    // Проверяем кеш
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    // Загружаем и кешируем
    try {
      const badgeData = await this.loadBadge(imagePath);
      if (badgeData) {
        this.setCache(cacheKey, badgeData, this.getFileType(imagePath));
        return badgeData;
      }
    } catch (error) {
      console.warn('Failed to load badge:', imagePath, error);
    }

    return null;
  }

  /**
   * Загрузить бейдж с сервера
   */
  private async loadBadge(imagePath: string): Promise<string | null> {
    const fullUrl = imagePath.startsWith('http')
      ? imagePath
      : `/static/images/bages/${imagePath}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        cache: 'force-cache', // Принудительное использование кеша браузера
        headers: {
          'Cache-Control': 'max-age=86400', // 24 часа
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      // Fallback: попробуем загрузить как base64
      return this.loadAsBase64(fullUrl);
    }
  }

  /**
   * Fallback загрузка как base64
   */
  private async loadAsBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'force-cache',
      });

      if (!response.ok) {
        return null;
      }

      const blob = await response.blob();
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Получить ключ кеша
   */
  private getCacheKey(imagePath: string): string {
    return imagePath.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Проверить валидность кеша
   */
  private isCacheValid(entry: BadgeCacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  /**
   * Получить тип файла
   */
  private getFileType(imagePath: string): 'svg' | 'image' {
    return imagePath.toLowerCase().endsWith('.svg') ? 'svg' : 'image';
  }

  /**
   * Установить значение в кеш
   */
  private setCache(key: string, data: string, type: 'svg' | 'image'): void {
    // Очищаем старые записи если кеш переполнен
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      type,
    });
  }

  /**
   * Очистить кеш
   */
  clearCache(): void {
    // Освобождаем blob URLs
    for (const entry of this.cache.values()) {
      if (entry.data.startsWith('blob:')) {
        URL.revokeObjectURL(entry.data);
      }
    }
    this.cache.clear();
  }

  /**
   * Получить статистику кеша
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Создаем глобальный экземпляр кеша
export const badgeCache = new BadgeCache();

// Очищаем кеш при выгрузке страницы
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    badgeCache.clearCache();
  });
}
