import React from 'react';

// Типы для стикеров
export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  url: string;
  mime_type?: string;
  pack_id: string;
}

export interface StickerPack {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  is_public: boolean;
  stickers: Sticker[];
  created_at: string;
  updated_at: string;
}

export interface StickerCacheEntry {
  data: string; // URL.createObjectURL или base64
  timestamp: number;
  type: 'blob' | 'base64';
}

export interface StickerCacheStats {
  totalPacks: number;
  totalStickers: number;
  cachedStickers: number;
  cacheSize: number; // в байтах
  lastUpdate: number;
}

class StickerCacheService {
  private cache = new Map<string, StickerCacheEntry>();
  private packsCache = new Map<string, StickerPack>();
  private isPreloading = false;
  private preloadQueue: string[] = [];
  private batchData: any = null;
  private stats: StickerCacheStats = {
    totalPacks: 0,
    totalStickers: 0,
    cachedStickers: 0,
    cacheSize: 0,
    lastUpdate: 0,
  };

  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly API_URL = `${(typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru'}/apiMes`;

  constructor() {
    this.loadFromStorage();
    this.startPeriodicCleanup();
  }

  // Загрузка кеша из localStorage
  private loadFromStorage(): void {
    try {
      const cached = localStorage.getItem('stickerCache');
      if (cached) {
        const data = JSON.parse(cached);
        this.cache = new Map(data.cache || []);
        this.packsCache = new Map(data.packs || []);
        this.stats = data.stats || this.stats;
        this.updateStats();
      }
    } catch (error) {
      console.warn('Failed to load sticker cache from storage:', error);
    }
  }

  // Сохранение кеша в localStorage
  private saveToStorage(): void {
    try {
      const data = {
        cache: Array.from(this.cache.entries()),
        packs: Array.from(this.packsCache.entries()),
        stats: this.stats,
      };
      localStorage.setItem('stickerCache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save sticker cache to storage:', error);
    }
  }

  // Получение авторизационных заголовков
  private getAuthHeaders(): Record<string, string> | null {
    const sessionKey = localStorage.getItem('session_key') || 
                      localStorage.getItem('jwt') || 
                      localStorage.getItem('token');
    
    if (!sessionKey) return null;

    return {
      'Authorization': `Bearer ${sessionKey}`,
      'Content-Type': 'application/json',
    };
  }

  // Загрузка стикерпаков пользователя
  async loadUserStickerPacks(): Promise<StickerPack[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      console.warn('No auth headers for loading sticker packs');
      return [];
    }

    try {
      // Сначала пробуем batch API
      const batchResponse = await fetch(`${this.API_URL}/messenger/sticker-packs/my/batch`, {
        headers,
      });

      if (batchResponse.ok) {
        const batchData = await batchResponse.json();
        
        if (batchData.success && batchData.packs) {
          // Сохраняем паки в кеш
          batchData.packs.forEach((pack: StickerPack) => {
            this.packsCache.set(pack.id, pack);
          });

          // Если есть batch_data, используем его для предзагрузки
          if (batchData.batch_data && batchData.batch_data.stickers) {
            console.log(`Batch API returned ${batchData.batch_data.stickers.length} stickers`);
            // Сохраняем информацию о batch для последующего использования
            this.batchData = batchData.batch_data;
          }

          this.updateStats();
          this.saveToStorage();
          
          return batchData.packs;
        }
      }

      // Fallback к обычному API если batch не работает
      console.log('Batch API failed, falling back to regular API');
      const response = await fetch(`${this.API_URL}/messenger/sticker-packs/my`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.packs) {
        // Сохраняем паки в кеш
        data.packs.forEach((pack: StickerPack) => {
          this.packsCache.set(pack.id, pack);
        });

        this.updateStats();
        this.saveToStorage();
        
        return data.packs;
      }

      return [];
    } catch (error) {
      console.error('Failed to load user sticker packs:', error);
      return [];
    }
  }

  // Предзагрузка стикеров в фоне с низким приоритетом
  async preloadStickers(packs: StickerPack[]): Promise<void> {
    if (this.isPreloading) {
      console.log('🔄 Sticker preloading already in progress');
      return;
    }

    this.isPreloading = true;
    console.log(`🚀 Starting preload of ${packs.length} sticker packs`);

    try {
      // Создаем очередь для загрузки
      const stickersToLoad: string[] = [];
      
      packs.forEach(pack => {
        if (pack.stickers) {
          pack.stickers.forEach(sticker => {
            if (!this.isCached(sticker.url)) {
              stickersToLoad.push(sticker.url);
            }
          });
        }
      });

      this.preloadQueue = stickersToLoad;
      console.log(`🔄 Queued ${stickersToLoad.length} stickers for preloading`);

      // Загружаем стикеры с очень низким приоритетом
      await this.preloadWithLowPriority(stickersToLoad);

      console.log('✅ Sticker preloading completed');
    } catch (error) {
      console.error('❌ Error during sticker preloading:', error);
    } finally {
      this.isPreloading = false;
      this.preloadQueue = [];
    }
  }

  // Загрузка с низким приоритетом, не блокирующая UI
  private async preloadWithLowPriority(stickersToLoad: string[]): Promise<void> {
    const batchSize = 2; // Уменьшили размер батча
    const delayBetweenBatches = 2000; // Увеличили задержку до 2 секунд
    const delayBetweenStickers = 500; // Задержка между стикерами

    for (let i = 0; i < stickersToLoad.length; i += batchSize) {
      const batch = stickersToLoad.slice(i, i + batchSize);
      
      // Используем requestIdleCallback для загрузки в свободное время
      await this.waitForIdleTime();
      
      // Загружаем батч
      await Promise.allSettled(
        batch.map(async (url, index) => {
          // Добавляем задержку между стикерами в батче
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenStickers));
          }
          return this.preloadSticker(url);
        })
      );

      // Длинная пауза между батчами
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      
      // Проверяем, не нужно ли прервать загрузку
      if (this.shouldStopPreloading()) {
        console.log('Preloading stopped due to user activity');
        break;
      }
    }
  }

  // Ожидание свободного времени браузера
  private waitForIdleTime(): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => resolve(), { timeout: 1000 });
      } else {
        // Fallback для браузеров без requestIdleCallback
        setTimeout(resolve, 100);
      }
    });
  }

  // Проверка, нужно ли остановить предзагрузку
  private shouldStopPreloading(): boolean {
    // Останавливаем если пользователь активно взаимодействует с сайтом
    const now = Date.now();
    const lastActivity = this.lastUserActivity || 0;
    
    // Если прошло меньше 5 секунд с последней активности пользователя
    if (now - lastActivity < 5000) {
      return true;
    }
    
    // Проверяем загрузку сети
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log('Slow connection detected, stopping preloading');
        return true;
      }
    }
    
    return false;
  }

  // Отслеживание активности пользователя
  private lastUserActivity: number = 0;

  // Метод для обновления времени последней активности
  updateUserActivity(): void {
    this.lastUserActivity = Date.now();
  }

  // Предзагрузка из сжатого API (только статические изображения)
  private async preloadFromCompressed(): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      if (!headers) {
        console.warn('No auth headers for compressed preloading');
        return;
      }

      const userId = this.getUserId();
      if (!userId) {
        console.warn('No user ID available for compressed loading, falling back to regular preloading');
        throw new Error('No user ID available');
      }

      console.log('Loading static stickers from compressed API...');
      
      // Получаем сжатые данные стикеров (только статические)
      const response = await fetch(`${this.API_URL}/messenger/stickers-compressed/${userId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Compressed API failed: ${response.status}`);
      }

      // Получаем сжатые данные
      const compressedData = await response.arrayBuffer();
      
      // Распаковываем gzip
      const decompressedData = await this.decompressGzip(compressedData);
      
      // Парсим JSON
      const jsonText = new TextDecoder().decode(decompressedData);
      const data = JSON.parse(jsonText);
      
      if (data.success && data.stickers) {
        console.log(`Compressed API loaded: ${data.stickers.length} static stickers`);
        
        // Обрабатываем каждый стикер
        for (const sticker of data.stickers) {
          try {
            // Декодируем base64 данные
            const binaryData = atob(sticker.data);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            
            // Создаем blob и URL
            const blob = new Blob([bytes], { type: sticker.mime_type });
            const objectUrl = URL.createObjectURL(blob);

            // Сохраняем в кеш
            this.cache.set(sticker.url, {
              data: objectUrl,
              timestamp: Date.now(),
              type: 'blob',
            });

            console.log(`Compressed cached static sticker: ${sticker.name} (${sticker.mime_type})`);
          } catch (error) {
            console.warn(`Failed to process compressed sticker ${sticker.id}:`, error);
          }
        }

        this.updateStats();
        this.saveToStorage();
        console.log('Compressed preloading completed');
      }
    } catch (error) {
      console.error('Error during compressed preloading:', error);
      // Fallback к обычной предзагрузке
      throw error;
    }
  }

  // Предзагрузка из простого API (включая WebM, TGS)
  private async preloadFromSimpleBatch(): Promise<void> {
    try {
      const headers = this.getAuthHeaders();
      if (!headers) {
        console.warn('No auth headers for simple batch preloading');
        return;
      }

      const userId = this.getUserId();
      if (!userId) {
        console.warn('No user ID available for simple batch loading');
        return;
      }

      console.log('🔄 Loading all stickers from simple batch API...');
      
      // Получаем все стикеры без сжатия
      const response = await fetch(`${this.API_URL}/messenger/stickers-batch-simple/${userId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Simple batch API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.stickers) {
        console.log(`✅ Simple batch API loaded: ${data.stickers.length} stickers`);
        
        // Анализируем типы стикеров
        const typeBreakdown = data.stickers.reduce((acc: any, s: any) => {
          acc[s.mime_type] = (acc[s.mime_type] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Sticker types breakdown:', typeBreakdown);
        
        // Обрабатываем каждый стикер
        for (const sticker of data.stickers) {
          try {
            console.log(`🔄 Processing sticker ${sticker.id} (${sticker.mime_type})`);
            
            // Декодируем base64 данные
            const binaryData = atob(sticker.data);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            
            // Создаем blob и URL
            const blob = new Blob([bytes], { type: sticker.mime_type });
            const objectUrl = URL.createObjectURL(blob);

            // Сохраняем в кеш
            this.cache.set(sticker.url, {
              data: objectUrl,
              timestamp: Date.now(),
              type: 'blob',
            });

            console.log(`✅ Cached sticker: ${sticker.name} (${sticker.mime_type}) - ${sticker.file_size} bytes`);
            
            // Логируем для проблемных стикеров
            if (sticker.id === '70' || sticker.id === '71' || sticker.id === '494') {
              console.log(`🎯 Successfully cached problematic sticker ${sticker.id}:`, {
                mime_type: sticker.mime_type,
                file_size: sticker.file_size,
                url: sticker.url
              });
            }
          } catch (error) {
            console.error(`❌ Failed to process simple batch sticker ${sticker.id}:`, error);
          }
        }

        this.updateStats();
        this.saveToStorage();
        console.log('✅ Simple batch preloading completed');
      } else {
        console.warn('⚠️ Simple batch API returned no stickers');
      }
    } catch (error) {
      console.error('Error during simple batch preloading:', error);
      // Fallback к обычной предзагрузке
      throw error;
    }
  }

    // Распаковка gzip данных
  private async decompressGzip(compressedData: ArrayBuffer): Promise<Uint8Array> {
    try {
      // Пытаемся использовать встроенный CompressionStream API
      if ('CompressionStream' in window) {
        const stream = new (window as any).CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        // Записываем сжатые данные
        writer.write(new Uint8Array(compressedData));
        writer.close();
        
        // Читаем распакованные данные
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        // Объединяем чанки
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result;
      } else {
        // Fallback: если CompressionStream не поддерживается, возвращаем как есть
        // (предполагая, что сервер не сжимает данные)
        return new Uint8Array(compressedData);
      }
    } catch (error) {
      console.warn('Gzip decompression failed, trying fallback:', error);
      // Fallback: возвращаем данные как есть
      return new Uint8Array(compressedData);
    }
  }

  // Распаковка ZIP архива
  private async extractArchive(archiveBlob: Blob): Promise<{ metadata: any; files: Record<string, Uint8Array> }> {
    return new Promise((resolve, reject) => {
      // Пока используем простой fallback - возвращаем ошибку
      // В будущем можно добавить JSZip или использовать встроенный ZIP API
      reject(new Error('Archive extraction not implemented yet, falling back to regular loading'));
    });
  }

  // Получение ID пользователя из localStorage
  private getUserId(): string | null {
    // Пытаемся получить ID пользователя из различных источников
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.user_id;
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }
    
    // Пробуем получить из AuthContext или других источников
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        return user.id || user.user_id;
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }
    
    // Пробуем получить из session
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        return session.user_id || session.user?.id;
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }
    
    console.warn('Could not determine user ID for batch loading');
    return null;
  }

  // Предзагрузка одного стикера
  private async preloadSticker(url: string): Promise<void> {
    if (this.isCached(url)) {
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      this.cache.set(url, {
        data: objectUrl,
        timestamp: Date.now(),
        type: 'blob',
      });

      this.updateStats();
      this.saveToStorage();

      console.log(`Preloaded sticker: ${url}`);
      
      // Логируем для проблемных стикеров
      if (url.includes('/70') || url.includes('/71') || url.includes('/494')) {
        console.log(`Successfully preloaded problematic sticker: ${url}`, {
          blob_size: blob.size,
          blob_type: blob.type
        });
      }
    } catch (error) {
      console.warn(`Failed to preload sticker ${url}:`, error);
    }
  }

  // Получение стикера из кеша
  getSticker(url: string): string | null {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return null;
    }

    // Проверяем срок действия кеша
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(url);
      this.updateStats();
      this.saveToStorage();
      return null;
    }

    return entry.data;
  }

  // Проверка, есть ли стикер в кеше
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  // Получение статистики кеша
  getStats(): StickerCacheStats {
    return { ...this.stats };
  }

  // Обновление статистики
  private updateStats(): void {
    this.stats.totalPacks = this.packsCache.size;
    this.stats.cachedStickers = this.cache.size;
    this.stats.lastUpdate = Date.now();

    // Подсчитываем общее количество стикеров
    let totalStickers = 0;
    this.packsCache.forEach(pack => {
      totalStickers += pack.stickers?.length || 0;
    });
    this.stats.totalStickers = totalStickers;

    // Подсчитываем размер кеша (приблизительно)
    this.stats.cacheSize = this.cache.size * 50 * 1024; // Примерно 50KB на стикер
  }

  // Очистка устаревших записей
  private cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    this.cache.forEach((entry, url) => {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        entriesToDelete.push(url);
      }
    });

    entriesToDelete.forEach(url => {
      const entry = this.cache.get(url);
      if (entry && entry.type === 'blob') {
        URL.revokeObjectURL(entry.data);
      }
      this.cache.delete(url);
    });

    if (entriesToDelete.length > 0) {
      console.log(`Cleaned up ${entriesToDelete.length} expired sticker cache entries`);
      this.updateStats();
      this.saveToStorage();
    }
  }

  // Периодическая очистка кеша
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Каждый час
  }

  // Полная очистка кеша
  clearCache(): void {
    // Освобождаем blob URLs
    this.cache.forEach(entry => {
      if (entry.type === 'blob') {
        URL.revokeObjectURL(entry.data);
      }
    });

    this.cache.clear();
    this.packsCache.clear();
    this.updateStats();
    this.saveToStorage();

    console.log('Sticker cache cleared');
  }

  // Получение прогресса предзагрузки
  getPreloadProgress(): { current: number; total: number; percentage: number } {
    const total = this.preloadQueue.length;
    const current = total - this.preloadQueue.length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }

  // Проверка, идет ли предзагрузка
  isPreloadingInProgress(): boolean {
    return this.isPreloading;
  }
}

// Создаем единственный экземпляр сервиса
export const stickerCacheService = new StickerCacheService();

// Хук для использования в React компонентах
export const useStickerCache = () => {
  // Используем useMemo для стабильных ссылок на функции
  const getSticker = React.useCallback((url: string) => 
    stickerCacheService.getSticker(url), []);
  
  const isCached = React.useCallback((url: string) => 
    stickerCacheService.isCached(url), []);
  
  const getStats = React.useCallback(() => 
    stickerCacheService.getStats(), []);
  
  const clearCache = React.useCallback(() => 
    stickerCacheService.clearCache(), []);
  
  const getPreloadProgress = React.useCallback(() => 
    stickerCacheService.getPreloadProgress(), []);
  
  const isPreloadingInProgress = React.useCallback(() => 
    stickerCacheService.isPreloadingInProgress(), []);

  return {
    getSticker,
    isCached,
    getStats,
    clearCache,
    getPreloadProgress,
    isPreloadingInProgress,
  };
}; 