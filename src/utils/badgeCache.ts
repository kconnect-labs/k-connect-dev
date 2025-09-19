/**
 * Система кеширования бейджей в IndexedDB для избежания CORS ошибок
 */

interface BadgeCacheEntry {
  blob: Blob;
  timestamp: number;
  type: 'svg' | 'image';
  success: boolean; 
  corsFailed: boolean; 
  url: string; 
}

class BadgeCache {
  private readonly DB_NAME = 'k-connect-media-cache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'badges';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; 
  private readonly MAX_CACHE_SIZE = 100; 
  private db: IDBDatabase | null = null;

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
        
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('success', 'success', { unique: false });
        }
      };
    });
  }

  /**
   * Инициализация кеша (вызывается автоматически при первом использовании)
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }
  }

  /**
   * Получить запись из IndexedDB
   */
  private async getFromDB(url: string): Promise<BadgeCacheEntry | null> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve, reject) => {
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
  private async saveToDB(entry: BadgeCacheEntry): Promise<void> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve, reject) => {
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
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve, reject) => {
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
  private async getAllFromDB(): Promise<BadgeCacheEntry[]> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve, reject) => {
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

      
      allEntries.forEach(entry => {
        if (now - entry.timestamp > this.CACHE_DURATION) {
          expiredUrls.push(entry.url);
        }
      });

      
      for (const url of expiredUrls) {
        await this.deleteFromDB(url);
      }

      
      const remainingEntries = await this.getAllFromDB();
      if (remainingEntries.length > this.MAX_CACHE_SIZE) {
        const sortedEntries = remainingEntries.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = sortedEntries.slice(0, remainingEntries.length - this.MAX_CACHE_SIZE);
        
        for (const entry of toDelete) {
          await this.deleteFromDB(entry.url);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup expired entries:', error);
    }
  }

  /**
   * Получить бейдж из кеша
   */
  async getBadge(imagePath: string): Promise<string | null> {
    try {
      const cached = await this.getFromDB(imagePath);
      
      if (!cached) {
        return null;
      }

      
      const now = Date.now();
      if (now - cached.timestamp > this.CACHE_DURATION) {
        await this.deleteFromDB(imagePath);
        return null;
      }

      
      if (cached.corsFailed) {
        return null;
      }

      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(cached.blob);
      });
    } catch (error) {
      console.warn('Failed to get badge from cache:', error);
      return null;
    }
  }

  /**
   * Загрузить и кешировать бейдж
   */
  async loadBadge(imagePath: string): Promise<string | null> {
    try {
      
      const cached = await this.getBadge(imagePath);
      if (cached) {
        return cached;
      }

      
      const response = await fetch(imagePath, {
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      
      const type = imagePath.toLowerCase().includes('.svg') ? 'svg' : 'image';

      
      const entry: BadgeCacheEntry = {
        blob,
        timestamp: Date.now(),
        type,
        success: true,
        corsFailed: false,
        url: imagePath
      };

      await this.saveToDB(entry);
      await this.cleanupExpiredEntries();

      return blobUrl;
    } catch (error) {
      console.warn(`Failed to load badge ${imagePath}:`, error);
      
      
      const entry: BadgeCacheEntry = {
        blob: new Blob(),
        timestamp: Date.now(),
        type: 'image',
        success: false,
        corsFailed: true,
        url: imagePath
      };

      await this.saveToDB(entry);
      return null;
    }
  }

  /**
   * Очистить кеш для конкретного бейджа
   */
  async clearBadgeCache(imagePath: string): Promise<void> {
    try {
      await this.deleteFromDB(imagePath);
    } catch (error) {
      console.warn('Failed to clear badge cache:', error);
    }
  }

  /**
   * Очистить весь кеш
   */
  async clearCache(): Promise<void> {
    try {
      await this.ensureInitialized();
      const db = this.db!;
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve, reject) => {
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
   * Очистить только CORS ошибки
   */
  async clearCorsErrors(): Promise<void> {
    try {
      const allEntries = await this.getAllFromDB();
      const corsFailedUrls = allEntries
        .filter(entry => entry.corsFailed)
        .map(entry => entry.url);

      for (const url of corsFailedUrls) {
        await this.deleteFromDB(url);
      }
    } catch (error) {
      console.warn('Failed to clear CORS errors:', error);
    }
  }

  /**
   * Получить статистику кеша
   */
  async getCacheStats(): Promise<{
    total: number;
    successful: number;
    corsFailed: number;
    expired: number;
    size: number;
  }> {
    try {
      const allEntries = await this.getAllFromDB();
      const now = Date.now();
      
      let totalSize = 0;
      let successful = 0;
      let corsFailed = 0;
      let expired = 0;

      allEntries.forEach(entry => {
        totalSize += entry.blob.size;
        
        if (entry.corsFailed) {
          corsFailed++;
        } else if (entry.success) {
          successful++;
        }
        
        if (now - entry.timestamp > this.CACHE_DURATION) {
          expired++;
        }
      });

      return {
        total: allEntries.length,
        successful,
        corsFailed,
        expired,
        size: totalSize
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return {
        total: 0,
        successful: 0,
        corsFailed: 0,
        expired: 0,
        size: 0
      };
    }
  }

  /**
   * Получить детальную статистику кеша
   */
  async getDetailedCacheStats(): Promise<{
    entries: Array<{
      url: string;
      timestamp: number;
      type: string;
      success: boolean;
      corsFailed: boolean;
      size: number;
      age: number;
    }>;
    summary: {
      total: number;
      successful: number;
      corsFailed: number;
      expired: number;
      totalSize: number;
    };
  }> {
    try {
      const allEntries = await this.getAllFromDB();
      const now = Date.now();
      
      const entries = allEntries.map(entry => ({
        url: entry.url,
        timestamp: entry.timestamp,
        type: entry.type,
        success: entry.success,
        corsFailed: entry.corsFailed,
        size: entry.blob.size,
        age: now - entry.timestamp
      }));

      const summary = {
        total: entries.length,
        successful: entries.filter(e => e.success && !e.corsFailed).length,
        corsFailed: entries.filter(e => e.corsFailed).length,
        expired: entries.filter(e => e.age > this.CACHE_DURATION).length,
        totalSize: entries.reduce((sum, e) => sum + e.size, 0)
      };

      return { entries, summary };
    } catch (error) {
      console.warn('Failed to get detailed cache stats:', error);
      return {
        entries: [],
        summary: {
          total: 0,
          successful: 0,
          corsFailed: 0,
          expired: 0,
          totalSize: 0
        }
      };
    }
  }
}


const badgeCache = new BadgeCache();


badgeCache.getCacheStats().catch(() => {
  
});

export { badgeCache };
export default badgeCache;