interface CachedMedia {
  url: string;
  blob: Blob;
  timestamp: number;
  size: number;
  type: string;
  originalSize?: number;
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
  private maxCacheSize = 1000 * 1024 * 1024;
  private maxAge = 7 * 24 * 60 * 60 * 1000;
  private isInitialized = false;
  

  private imageCompressionSettings = {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'image/webp' as const,
    enableCompression: true,

    minSizeToCompress: 100 * 1024,
    maxSizeToCompress: 10 * 1024 * 1024,
    compressionTimeout: 5000,
    useWebWorkers: false
  };

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


        if (!db.objectStoreNames.contains(this.storeName)) {
          const mediaStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
          mediaStore.createIndex('timestamp', 'timestamp', { unique: false });
          mediaStore.createIndex('size', 'size', { unique: false });
        }


        if (!db.objectStoreNames.contains(this.statsStoreName)) {
          db.createObjectStore(this.statsStoreName, { keyPath: 'id' });
        }
      };
    });
  }

  private setupInterceptors(): void {

    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      

      let normalizedUrl = url;
      
      try {

        if (url.startsWith('http')) {
          const urlObj = new URL(url);
          normalizedUrl = urlObj.pathname;
        }

        else if (url.startsWith('/')) {
          normalizedUrl = url;
        }
      } catch (error) {
        console.warn('Failed to normalize URL:', url, error);
        normalizedUrl = url;
      }
      

      if (this.isMediaFile(normalizedUrl)) {
        try {

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


    const originalCreateElement = document.createElement.bind(document);
    const self = this;
    document.createElement = function(tagName: string): HTMLElement {
      const element = originalCreateElement(tagName);
      
      if (tagName.toLowerCase() === 'img') {
        const originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name: string, value: string) {
          if (name === 'src') {

            let normalizedValue = value;
            
            try {

              if (value.startsWith('http')) {
                const urlObj = new URL(value);
                normalizedValue = urlObj.pathname;
              }

              else if (value.startsWith('/')) {
                normalizedValue = value;
              }
            } catch (error) {
              console.warn('Failed to normalize img src URL:', value, error);
              normalizedValue = value;
            }
            
            if (self.isMediaFile(normalizedValue)) {

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
    

    const hasMediaExtension = mediaExtensions.some(ext => lowerUrl.includes(ext));
    

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

  private async compressImage(blob: Blob, url: string): Promise<Blob> {

    if (!this.imageCompressionSettings.enableCompression || !this.isImageFile(url)) {
      return blob;
    }


    if (this.shouldSkipCompression(url)) {
      console.log(`Skipping compression for special file type: ${url}`);
      return blob;
    }


    if (blob.size < this.imageCompressionSettings.minSizeToCompress) {
      console.log(`Skipping compression for small file: ${this.formatBytes(blob.size)}`);
      return blob;
    }

    if (blob.size > this.imageCompressionSettings.maxSizeToCompress) {
      console.log(`Skipping compression for large file: ${this.formatBytes(blob.size)}`);
      return blob;
    }

    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        

        const timeout = setTimeout(() => {
          console.warn('Image compression timeout, using original');
          resolve(blob);
        }, this.imageCompressionSettings.compressionTimeout);

        img.onload = () => {
          clearTimeout(timeout);
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(blob);
            return;
          }


          let { width, height } = img;
          const { maxWidth, maxHeight } = this.imageCompressionSettings;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;


          ctx.drawImage(img, 0, 0, width, height);


          canvas.toBlob(
            (compressedBlob) => {
              if (compressedBlob) {

                const compressionRatio = compressedBlob.size / blob.size;
                if (compressionRatio < 0.95) {
                  console.log(`Image compressed: ${this.formatBytes(blob.size)} → ${this.formatBytes(compressedBlob.size)} (${Math.round((1 - compressionRatio) * 100)}% reduction)`);
                  resolve(compressedBlob);
                } else {
                  console.log(`Compression not effective, using original`);
                  resolve(blob);
                }
              } else {
                resolve(blob);
              }
            },
            this.imageCompressionSettings.format,
            this.imageCompressionSettings.quality
          );
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.warn('Failed to load image for compression, using original');
          resolve(blob);
        };
        
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.warn('Failed to compress image:', error);
      return blob;
    }
  }

  private isImageFile(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  private shouldSkipCompression(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    

    if (lowerUrl.includes('/icons/') || 
        lowerUrl.includes('/favicon') || 
        lowerUrl.includes('/emoji') ||
        lowerUrl.includes('/small/')) {
      return true;
    }
    

    if (lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif')) {
      return true;
    }
    
    return false;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      }, this.imageCompressionSettings.format, this.imageCompressionSettings.quality);
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
            this.delete(url);
          }
          resolve(null);
        }
      };
    });
  }

  async set(url: string, blob: Blob): Promise<void> {
    if (!this.db) return;

    const originalSize = blob.size;
    

    const compressedBlob = await this.compressImage(blob, url);
    
    const cachedMedia: CachedMedia = {
      url,
      blob: compressedBlob,
      timestamp: Date.now(),
      size: compressedBlob.size,
      type: compressedBlob.type,
      originalSize: originalSize !== compressedBlob.size ? originalSize : undefined,
    };


    await this.ensureCacheSize(compressedBlob.size);

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

          const deletePromises = itemsToDelete.map(url => this.delete(url));
          Promise.all(deletePromises).then(() => {
            this.updateStats();
            resolve();
          });
        }
      };
    });
  }


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


  updateCompressionSettings(settings: Partial<typeof this.imageCompressionSettings>): void {
    this.imageCompressionSettings = { ...this.imageCompressionSettings, ...settings };
  }

  getCompressionSettings(): typeof this.imageCompressionSettings {
    return { ...this.imageCompressionSettings };
  }


  async recompressAllImages(): Promise<void> {
    const allMedia = await this.getAllCachedMedia();
    const imageMedia = allMedia.filter(item => this.isImageFile(item.url));
    
    console.log(`Recompressing ${imageMedia.length} images...`);
    
    for (const media of imageMedia) {
      try {

        await this.delete(media.url);
        

        await this.set(media.url, media.blob);
      } catch (error) {
        console.warn(`Failed to recompress ${media.url}:`, error);
      }
    }
    
    console.log('Recompression completed');
  }
}


const mediaCacheService = new MediaCacheService();


export const initMediaCache = () => mediaCacheService.init();
export const clearMediaCache = () => mediaCacheService.clear();
export const getMediaCacheStats = () => mediaCacheService.getStats();
export const listCachedUrls = () => mediaCacheService.listCachedUrls();
export const preloadMediaUrls = (urls: string[]) => mediaCacheService.preloadUrls(urls);
export const getAllCachedMedia = () => mediaCacheService.getAllCachedMedia();


export const updateImageCompressionSettings = (settings: any) => mediaCacheService.updateCompressionSettings(settings);
export const getImageCompressionSettings = () => mediaCacheService.getCompressionSettings();
export const recompressAllImages = () => mediaCacheService.recompressAllImages();


export default mediaCacheService; 