/**
 * Система кеширования статических файлов в IndexedDB
 * Кеширует все файлы из static/uploads кроме видео и гифок
 */

interface StaticCacheEntry {
  blob: Blob;
  timestamp: number;
  type: 'image' | 'svg' | 'other';
  success: boolean;
  corsFailed: boolean;
  url: string;
  size: number;
}

class StaticCache {
  private readonly DB_NAME = 'k-connect-media-cache';
  private readonly DB_VERSION = 2;
  private readonly STORE_NAME = 'static';
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней
  private readonly MAX_CACHE_SIZE = 1000; // Максимум 1000 файлов в кеше
  private readonly MAX_CACHE_SIZE_MB = 500; // Максимум 500MB
  private db: IDBDatabase | null = null;

  // Поддерживаемые типы файлов
  private readonly SUPPORTED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.svg',
    '.pdf', '.txt', '.json', '.css', '.js', '.woff', '.woff2', '.ttf', '.eot'
  ];

  // Исключаем видео и гифки
  private readonly EXCLUDED_EXTENSIONS = [
    '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv',
    '.gif', '.gifv'
  ];

  /**
   * Инициализация IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        
        // Создаем store для статических файлов только если его нет
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          console.log('Creating static store in IndexedDB');
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('success', 'success', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
        
        // Если обновляемся с версии 1, убеждаемся что store создан
        if (oldVersion < 2) {
          console.log('Upgrading from version', oldVersion, 'to version 2');
        }
      };
    });
  }

  /**
   * Обеспечить инициализацию базы данных
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  /**
   * Проверить, поддерживается ли файл для кеширования
   */
  private isSupportedFile(url: string): boolean {
    const urlLower = url.toLowerCase();
    
    // Проверяем исключения
    for (const ext of this.EXCLUDED_EXTENSIONS) {
      if (urlLower.includes(ext)) {
        return false;
      }
    }
    
    // Проверяем поддержку
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
  private getFileType(url: string): 'image' | 'svg' | 'other' {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.svg')) return 'svg';
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
        urlLower.includes('.png') || urlLower.includes('.webp') || 
        urlLower.includes('.bmp') || urlLower.includes('.tiff')) {
      return 'image';
    }
    
    return 'other';
  }

  /**
   * Получить запись из IndexedDB
   */
  private async getFromDB(url: string): Promise<StaticCacheEntry | null> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(url);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.warn('Failed to get from IndexedDB:', error);
      return null;
    }
  }

  /**
   * Сохранить запись в IndexedDB
   */
  private async saveToDB(entry: StaticCacheEntry): Promise<void> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(entry);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.warn('Failed to save to IndexedDB:', error);
    }
  }

  /**
   * Удалить запись из IndexedDB
   */
  private async deleteFromDB(url: string): Promise<void> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.delete(url);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.warn('Failed to delete from IndexedDB:', error);
    }
  }

  /**
   * Получить все записи из IndexedDB
   */
  private async getAllFromDB(): Promise<StaticCacheEntry[]> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.warn('Failed to get all from IndexedDB:', error);
      return [];
    }
  }

  /**
   * Очистить устаревшие записи
   */
  private async cleanupExpiredEntries(): Promise<void> {
    try {
      const allEntries = await this.getAllFromDB();
      const now = Date.now();
      const expiredUrls: string[] = [];

      // Найти устаревшие записи
      allEntries.forEach(entry => {
        if (now - entry.timestamp > this.CACHE_DURATION) {
          expiredUrls.push(entry.url);
        }
      });

      // Удалить устаревшие записи
      for (const url of expiredUrls) {
        await this.deleteFromDB(url);
      }

      // Если записей слишком много, удалить самые старые
      const remainingEntries = await this.getAllFromDB();
      if (remainingEntries.length > this.MAX_CACHE_SIZE) {
        const sortedEntries = remainingEntries.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = sortedEntries.slice(0, remainingEntries.length - this.MAX_CACHE_SIZE);
        
        for (const entry of toDelete) {
          await this.deleteFromDB(entry.url);
        }
      }

      // Проверить размер кеша
      const finalEntries = await this.getAllFromDB();
      const totalSizeMB = finalEntries.reduce((sum, entry) => sum + entry.size, 0) / (1024 * 1024);
      
      if (totalSizeMB > this.MAX_CACHE_SIZE_MB) {
        // Удалить самые большие файлы
        const sortedBySize = finalEntries.sort((a, b) => b.size - a.size);
        const toDelete = sortedBySize.slice(0, Math.floor(finalEntries.length * 0.2)); // Удалить 20% самых больших
        
        for (const entry of toDelete) {
          await this.deleteFromDB(entry.url);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup expired entries:', error);
    }
  }

  /**
   * Получить файл из кеша
   */
  async getFile(url: string): Promise<string | null> {
    try {
      if (!this.isSupportedFile(url)) {
        console.log('File not supported for caching:', url);
        return null;
      }

      const cached = await this.getFromDB(url);
      if (!cached) {
        console.log('File not found in static cache:', url);
        return null;
      }
      
      console.log('File found in static cache:', url);

      // Проверить, не устарел ли кеш
      const now = Date.now();
      if (now - cached.timestamp > this.CACHE_DURATION) {
        await this.deleteFromDB(url);
        return null;
      }

      // Если была CORS ошибка, не возвращать кеш
      if (cached.corsFailed) {
        return null;
      }

      // Конвертировать Blob в data URL
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
        console.log('File not supported for caching:', url);
        return null;
      }

      // Сначала проверить кеш
      const cached = await this.getFile(url);
      if (cached) {
        console.log('Returning cached file:', url);
        return cached;
      }
      
      console.log('Loading file from server:', url);

      // Загрузить файл
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Определить тип файла
      const type = this.getFileType(url);

      // Сохранить в кеш
      const entry: StaticCacheEntry = {
        blob,
        timestamp: Date.now(),
        type,
        success: true,
        corsFailed: false,
        url,
        size: blob.size
      };

      console.log('Saving file to static cache:', url, 'size:', blob.size);
      await this.saveToDB(entry);
      await this.cleanupExpiredEntries();

      return blobUrl;
    } catch (error) {
      console.warn(`Failed to load file ${url}:`, error);
      
      // Сохранить информацию о CORS ошибке
      const entry: StaticCacheEntry = {
        blob: new Blob(),
        timestamp: Date.now(),
        type: this.getFileType(url),
        success: false,
        corsFailed: true,
        url,
        size: 0
      };

      await this.saveToDB(entry);
      return null;
    }
  }

  /**
   * Очистить кеш для конкретного файла
   */
  async clearFileCache(url: string): Promise<void> {
    try {
      await this.deleteFromDB(url);
    } catch (error) {
      console.warn(`Failed to clear cache for ${url}:`, error);
    }
  }

  /**
   * Очистить весь кеш
   */
  async clearCache(): Promise<void> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Получить статистику кеша
   */
  async getCacheStats(): Promise<{
    count: number;
    size: number;
    sizeMB: number;
    types: Record<string, number>;
    successCount: number;
    corsFailedCount: number;
  }> {
    try {
      const entries = await this.getAllFromDB();
      
      const stats = {
        count: entries.length,
        size: 0,
        sizeMB: 0,
        types: {} as Record<string, number>,
        successCount: 0,
        corsFailedCount: 0
      };

      entries.forEach(entry => {
        stats.size += entry.size;
        stats.types[entry.type] = (stats.types[entry.type] || 0) + 1;
        
        if (entry.success) {
          stats.successCount++;
        }
        if (entry.corsFailed) {
          stats.corsFailedCount++;
        }
      });

      stats.sizeMB = Math.round(stats.size / (1024 * 1024) * 100) / 100;
      
      return stats;
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        count: 0,
        size: 0,
        sizeMB: 0,
        types: {},
        successCount: 0,
        corsFailedCount: 0
      };
    }
  }

  /**
   * Очистить только CORS ошибки
   */
  async clearCorsErrors(): Promise<void> {
    try {
      const entries = await this.getAllFromDB();
      const corsFailedEntries = entries.filter(entry => entry.corsFailed);
      
      for (const entry of corsFailedEntries) {
        await this.deleteFromDB(entry.url);
      }
    } catch (error) {
      console.warn('Failed to clear CORS errors:', error);
    }
  }
}

// Создаем единственный экземпляр кеша
const staticCache = new StaticCache();

// Автоматически инициализируем кеш при загрузке модуля
staticCache.getCacheStats().catch(() => {
  // Игнорируем ошибки инициализации
});

export { staticCache };
export default staticCache;
