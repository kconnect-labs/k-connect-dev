import React from 'react';


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
  data: string; 
  timestamp: number;
  type: 'blob' | 'base64';
}

export interface StickerCacheStats {
  totalPacks: number;
  totalStickers: number;
  cachedStickers: number;
  cacheSize: number; 
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

  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; 
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; 
  private readonly API_URL = `${(typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru'}/apiMes`;

  constructor() {
    this.loadFromStorage();
    this.startPeriodicCleanup();
  }

  
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

  
  async loadUserStickerPacks(): Promise<StickerPack[]> {
    
    console.log('🚫 Sticker packs loading temporarily disabled');
    return [];
  }

  
  async preloadStickers(packs: StickerPack[]): Promise<void> {
    
    console.log('🚫 Sticker preloading temporarily disabled');
    return;
  }

  
  private async preloadWithLowPriority(stickersToLoad: string[]): Promise<void> {
    const batchSize = 5; 
    const delayBetweenBatches = 1000; 
    const delayBetweenStickers = 200; 

    for (let i = 0; i < stickersToLoad.length; i += batchSize) {
      const batch = stickersToLoad.slice(i, i + batchSize);
      
      
      await this.waitForIdleTime();
      
      
      await Promise.allSettled(
        batch.map(async (url, index) => {
          
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenStickers));
          }
          return this.preloadSticker(url);
        })
      );

      
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      
      
      if (this.shouldStopPreloading()) {
        console.log('Preloading stopped due to user activity');
        break;
      }
    }
  }

  
  private waitForIdleTime(): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => resolve(), { timeout: 1000 });
      } else {
        
        setTimeout(resolve, 100);
      }
    });
  }

  
  private shouldStopPreloading(): boolean {
    
    const now = Date.now();
    const lastActivity = this.lastUserActivity || 0;
    
    
    if (now - lastActivity < 5000) {
      return true;
    }
    
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        console.log('Slow connection detected, stopping preloading');
        return true;
      }
    }
    
    return false;
  }

  
  private lastUserActivity: number = 0;

  
  updateUserActivity(): void {
    this.lastUserActivity = Date.now();
  }

  
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
      
      
      const response = await fetch(`${this.API_URL}/messenger/stickers-compressed/${userId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Compressed API failed: ${response.status}`);
      }

      
      const compressedData = await response.arrayBuffer();
      
      
      const decompressedData = await this.decompressGzip(compressedData);
      
      
      const jsonText = new TextDecoder().decode(decompressedData);
      const data = JSON.parse(jsonText);
      
      if (data.success && data.stickers) {
        console.log(`Compressed API loaded: ${data.stickers.length} static stickers`);
        
        
        for (const sticker of data.stickers) {
          try {
            
            const binaryData = atob(sticker.data);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            
            
            const blob = new Blob([bytes], { type: sticker.mime_type });
            const objectUrl = URL.createObjectURL(blob);

            
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
      
      throw error;
    }
  }

  
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
      
      
      const response = await fetch(`${this.API_URL}/messenger/stickers-batch-simple/${userId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Simple batch API failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.stickers) {
        console.log(`✅ Simple batch API loaded: ${data.stickers.length} stickers`);
        
        
        const typeBreakdown = data.stickers.reduce((acc: any, s: any) => {
          acc[s.mime_type] = (acc[s.mime_type] || 0) + 1;
          return acc;
        }, {});
        console.log('📊 Sticker types breakdown:', typeBreakdown);
        
        
        for (const sticker of data.stickers) {
          try {
            console.log(`🔄 Processing sticker ${sticker.id} (${sticker.mime_type})`);
            
            
            const binaryData = atob(sticker.data);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            
            
            const blob = new Blob([bytes], { type: sticker.mime_type });
            const objectUrl = URL.createObjectURL(blob);

            
            this.cache.set(sticker.url, {
              data: objectUrl,
              timestamp: Date.now(),
              type: 'blob',
            });

            console.log(`✅ Cached sticker: ${sticker.name} (${sticker.mime_type}) - ${sticker.file_size} bytes`);
            
            
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
      
      throw error;
    }
  }

    
  private async decompressGzip(compressedData: ArrayBuffer): Promise<Uint8Array> {
    try {
      
      if ('CompressionStream' in window) {
        const stream = new (window as any).CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        
        writer.write(new Uint8Array(compressedData));
        writer.close();
        
        
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        
        return result;
      } else {
        
        
        return new Uint8Array(compressedData);
      }
    } catch (error) {
      console.warn('Gzip decompression failed, trying fallback:', error);
      
      return new Uint8Array(compressedData);
    }
  }

  
  private async extractArchive(archiveBlob: Blob): Promise<{ metadata: any; files: Record<string, Uint8Array> }> {
    return new Promise((resolve, reject) => {
      
      
      reject(new Error('Archive extraction not implemented yet, falling back to regular loading'));
    });
  }

  
  private getUserId(): string | null {
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.user_id;
      } catch (e) {
        
      }
    }
    
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        return user.id || user.user_id;
      } catch (e) {
        
      }
    }
    
    
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        return session.user_id || session.user?.id;
      } catch (e) {
        
      }
    }
    
    console.warn('Could not determine user ID for batch loading');
    return null;
  }

  
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

  
  getSticker(url: string): string | null {
    const entry = this.cache.get(url);
    
    if (!entry) {
      return null;
    }

    
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(url);
      this.updateStats();
      this.saveToStorage();
      return null;
    }

    return entry.data;
  }

  
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  
  getStats(): StickerCacheStats {
    return { ...this.stats };
  }

  
  private updateStats(): void {
    this.stats.totalPacks = this.packsCache.size;
    this.stats.cachedStickers = this.cache.size;
    this.stats.lastUpdate = Date.now();

    
    let totalStickers = 0;
    this.packsCache.forEach(pack => {
      totalStickers += pack.stickers?.length || 0;
    });
    this.stats.totalStickers = totalStickers;

    
    this.stats.cacheSize = this.cache.size * 50 * 1024; 
  }

  
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

  
  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); 
  }

  
  clearCache(): void {
    
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

  
  getPreloadProgress(): { current: number; total: number; percentage: number } {
    const total = this.preloadQueue.length;
    const current = total - this.preloadQueue.length;
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  }

  
  isPreloadingInProgress(): boolean {
    return this.isPreloading;
  }
}


export const stickerCacheService = new StickerCacheService();


export const useStickerCache = () => {
  
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