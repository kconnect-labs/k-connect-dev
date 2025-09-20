/**
 * Универсальная система кеширования на основе стандартного кеша браузера
 * Использует встроенные возможности браузера для кеширования медиа файлов
 */

interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
  type: 'image' | 'svg' | 'badge' | 'avatar' | 'other';
  size: number;
}

interface CacheStats {
  count: number;
  size: number;
  sizeMB: number;
  types: Record<string, number>;
}

class BrowserCache {
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней
  private readonly MAX_CACHE_SIZE = 10000; // Максимум 1000 записей
  private readonly MAX_CACHE_SIZE_MB = 1000; // Максимум 500MB
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Поддерживаемые расширения файлов
  private readonly SUPPORTED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.svg',
    '.gif', '.ico', '.avif'
  ];

  // Исключенные расширения (не кешируем)
  private readonly EXCLUDED_EXTENSIONS = [
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
    '.gifv', '.mp3', '.wav', '.ogg', '.m4a'
  ];

  constructor() {
    // Запускаем периодическую очистку кеша
    this.startCleanup();
  }

  /**
   * Проверить, поддерживается ли файл для кеширования
   */
  private isSupportedFile(url: string): boolean {
    if (!url) return false;
    
    const urlLower = url.toLowerCase();
    
    // Исключаем неподдерживаемые расширения
    for (const ext of this.EXCLUDED_EXTENSIONS) {
      if (urlLower.includes(ext)) {
        return false;
      }
    }
    
    // Проверяем поддерживаемые расширения
    for (const ext of this.SUPPORTED_EXTENSIONS) {
      if (urlLower.includes(ext)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Определить тип файла
   */
  private getFileType(url: string): CacheEntry['type'] {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('badge') || urlLower.includes('achievement')) {
      return 'badge';
    }
    
    if (urlLower.includes('avatar') || urlLower.includes('profile')) {
      return 'avatar';
    }
    
    if (urlLower.includes('.svg')) {
      return 'svg';
    }
    
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
        urlLower.includes('.png') || urlLower.includes('.webp') || 
        urlLower.includes('.bmp') || urlLower.includes('.tiff') ||
        urlLower.includes('.gif') || urlLower.includes('.ico') ||
        urlLower.includes('.avif')) {
      return 'image';
    }
    
    return 'other';
  }

  /**
   * Получить файл из кеша
   */
  async getFile(url: string): Promise<string | null> {
    try {
      if (!this.isSupportedFile(url)) {
        return null;
      }

      const cached = this.cache.get(url);
      if (!cached) {
        return null;
      }

      // Проверяем срок действия
      const now = Date.now();
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(url);
        return null;
      }

      // Конвертируем blob в data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(cached.blob);
      });
    } catch (error) {
      console.warn(`Failed to get file ${url}:`, error);
      return null;
    }
  }

  /**
   * Загрузить и кешировать файл
   */
  async loadFile(url: string): Promise<string | null> {
    try {
      if (!this.isSupportedFile(url)) {
        return url; // Возвращаем оригинальный URL для неподдерживаемых файлов
      }

      // Сначала проверяем кеш
      const cached = await this.getFile(url);
      if (cached) {
        return cached;
      }

      // Загружаем файл с правильными заголовками для кеширования
      const response = await fetch(url, {
        method: 'GET',
        cache: 'force-cache', // Используем кеш браузера
        headers: {
          'Accept': 'image/*,*/*;q=0.8'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Создаем blob URL для немедленного использования
      const blobUrl = URL.createObjectURL(blob);

      // Сохраняем в наш кеш
      const entry: CacheEntry = {
        url,
        blob,
        timestamp: Date.now(),
        type: this.getFileType(url),
        size: blob.size
      };

      this.cache.set(url, entry);
      
      // Периодическая очистка кеша
      if (Math.random() < 0.1) { // 10% вероятность
        this.cleanup();
      }

      return blobUrl;
    } catch (error) {
      console.warn(`Failed to load file ${url}:`, error);
      return null;
    }
  }

  /**
   * Предзагрузка файлов
   */
  async preloadFiles(urls: string[]): Promise<void> {
    const validUrls = urls.filter(url => this.isSupportedFile(url));
    
    // Загружаем файлы параллельно, но с ограничением
    const batchSize = 5;
    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(url => this.loadFile(url))
      );
    }
  }

  /**
   * Очистить кеш для конкретного файла
   */
  async clearFileCache(url: string): Promise<void> {
    try {
      this.cache.delete(url);
    } catch (error) {
      console.warn(`Failed to clear cache for ${url}:`, error);
    }
  }

  /**
   * Очистить весь кеш
   */
  async clearCache(): Promise<void> {
    try {
      // Очищаем blob URLs
      this.cache.forEach(entry => {
        if (entry.blob) {
          URL.revokeObjectURL(URL.createObjectURL(entry.blob));
        }
      });
      
      this.cache.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Очистка устаревших записей
   */
  private cleanup(): void {
    try {
      const now = Date.now();
      const entriesToDelete: string[] = [];

      // Удаляем устаревшие записи
      this.cache.forEach((entry, url) => {
        if (now - entry.timestamp > this.CACHE_DURATION) {
          entriesToDelete.push(url);
        }
      });

      entriesToDelete.forEach(url => this.cache.delete(url));

      // Если превышен лимит количества записей
      if (this.cache.size > this.MAX_CACHE_SIZE) {
        const entries = Array.from(this.cache.entries());
        const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toDelete = sortedEntries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
        
        toDelete.forEach(([url]) => this.cache.delete(url));
      }

      // Если превышен лимит размера
      const totalSizeMB = Array.from(this.cache.values())
        .reduce((sum, entry) => sum + entry.size, 0) / (1024 * 1024);
      
      if (totalSizeMB > this.MAX_CACHE_SIZE_MB) {
        const entries = Array.from(this.cache.entries());
        const sortedBySize = entries.sort((a, b) => b[1].size - a[1].size);
        const toDelete = sortedBySize.slice(0, Math.floor(entries.length * 0.2));
        
        toDelete.forEach(([url]) => this.cache.delete(url));
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  /**
   * Запустить периодическую очистку
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Очищаем кеш каждые 10 минут
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * Остановить периодическую очистку
   */
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Получить статистику кеша
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      const entries = Array.from(this.cache.values());
      
      const stats: CacheStats = {
        count: entries.length,
        size: 0,
        sizeMB: 0,
        types: {}
      };

      entries.forEach(entry => {
        stats.size += entry.size;
        stats.types[entry.type] = (stats.types[entry.type] || 0) + 1;
      });

      stats.sizeMB = Math.round(stats.size / (1024 * 1024) * 100) / 100;
      
      return stats;
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        count: 0,
        size: 0,
        sizeMB: 0,
        types: {}
      };
    }
  }

  /**
   * Проверить, есть ли файл в кеше
   */
  async hasFile(url: string): Promise<boolean> {
    try {
      const cached = this.cache.get(url);
      if (!cached) return false;
      
      const now = Date.now();
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(url);
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Уничтожить кеш
   */
  destroy(): void {
    this.stopCleanup();
    this.clearCache();
  }
}

// Создаем единственный экземпляр кеша
const browserCache = new BrowserCache();

// Очищаем кеш при выгрузке страницы
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    browserCache.destroy();
  });
}

// Экспортируем для использования
export { browserCache };
export default browserCache;
