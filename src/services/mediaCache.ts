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
  
  // Performance optimizations
  private isIntercepting = false;
  private pendingCacheOperations = new Set<string>();
  private cacheQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private maxConcurrentOperations = 3;
  private activeOperations = 0;
  
  // Rate limiting
  private lastCacheOperation = 0;
  private minCacheInterval = 100; // ms between cache operations
  private maxCacheOperationsPerSecond = 10;
  private cacheOperationCount = 0;
  private lastCacheReset = Date.now();
  
  // Cache control
  private isCacheEnabled = true;
  private performanceMode = false;
  

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

  // Rate limiting and queue management
  private canPerformCacheOperation(): boolean {
    // Check if cache is enabled
    if (!this.isCacheEnabled) {
      return false;
    }
    
    const now = Date.now();
    
    // Reset counter every second
    if (now - this.lastCacheReset > 1000) {
      this.cacheOperationCount = 0;
      this.lastCacheReset = now;
    }
    
    // Check rate limits
    if (this.cacheOperationCount >= this.maxCacheOperationsPerSecond) {
      return false;
    }
    
    // Check minimum interval
    if (now - this.lastCacheOperation < this.minCacheInterval) {
      return false;
    }
    
    return true;
  }

  private async queueCacheOperation(operation: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cacheQueue.push(async () => {
        try {
          await operation();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.activeOperations >= this.maxConcurrentOperations) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.cacheQueue.length > 0 && this.activeOperations < this.maxConcurrentOperations) {
      const operation = this.cacheQueue.shift();
      if (operation) {
        this.activeOperations++;
        operation().finally(() => {
          this.activeOperations--;
          this.processQueue();
        });
      }
    }
    
    this.isProcessingQueue = false;
  }

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
    if (this.isIntercepting) return;
    this.isIntercepting = true;

    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Skip if not a media file or rate limited
      if (!this.isMediaFile(url) || !this.canPerformCacheOperation()) {
        return originalFetch(input, init);
      }

      let normalizedUrl = url;
      
      try {
        if (url.startsWith('http')) {
          const urlObj = new URL(url);
          normalizedUrl = urlObj.pathname;
        } else if (url.startsWith('/')) {
          normalizedUrl = url;
        }
      } catch (error) {
        return originalFetch(input, init);
      }
      
      // Skip if already pending
      if (this.pendingCacheOperations.has(normalizedUrl)) {
        return originalFetch(input, init);
      }

        try {
        // Check cache first
          const cached = await this.get(normalizedUrl);
          if (cached) {
          this.cacheOperationCount++;
          this.lastCacheOperation = Date.now();
            return new Response(cached.blob, {
              status: 200,
              headers: {
                'Content-Type': cached.type,
                'X-Cache': 'HIT',
                'Cache-Control': 'public, max-age=31536000',
              },
            });
          }

        // Mark as pending
        this.pendingCacheOperations.add(normalizedUrl);

          const response = await originalFetch(input, init);
        
        if (response.ok && this.canPerformCacheOperation()) {
          // Queue cache operation instead of blocking
          this.queueCacheOperation(async () => {
            try {
            const blob = await response.clone().blob();
            await this.set(normalizedUrl, blob);
            } catch (error) {
              console.warn('Failed to cache media:', error);
            } finally {
              this.pendingCacheOperations.delete(normalizedUrl);
            }
          });
        } else {
          this.pendingCacheOperations.delete(normalizedUrl);
          }
          
          return response;
        } catch (error) {
        this.pendingCacheOperations.delete(normalizedUrl);
          return originalFetch(input, init);
      }
    };


    // Only intercept img elements and only for specific media files
    const originalCreateElement = document.createElement.bind(document);
    const self = this;
    document.createElement = function(tagName: string): HTMLElement {
      const element = originalCreateElement(tagName);
      
      if (tagName.toLowerCase() === 'img') {
        const originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name: string, value: string) {
          if (name === 'src' && self.canPerformCacheOperation()) {
            let normalizedValue = value;
            
            try {
              if (value.startsWith('http')) {
                const urlObj = new URL(value);
                normalizedValue = urlObj.pathname;
              } else if (value.startsWith('/')) {
                normalizedValue = value;
              }
            } catch (error) {
              return originalSetAttribute(name, value);
            }
            
            // Only cache specific media types to reduce overhead
            if (self.isPriorityMediaFile(normalizedValue)) {
              element.addEventListener('load', () => {
                if (self.canPerformCacheOperation()) {
                  self.queueCacheOperation(async () => {
                    try {
                      await self.cacheImageFromElement(element as HTMLImageElement, normalizedValue);
                    } catch (error) {
                      // Ошибка уже обработана в cacheImageFromElement
                      console.debug('Cache operation failed for:', normalizedValue);
                    }
                  });
                }
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
      '.mp4', '.ogg', '.mp3', '.wav',
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
                           lowerUrl.includes('/bages/') ||
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

  private isPriorityMediaFile(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    
    // Исключаем внешние домены, которые могут вызывать CORS проблемы
    // Но разрешаем s3.k-connect.ru (наш S3 сервер)
    if (lowerUrl.startsWith('http') && 
        !lowerUrl.includes(window.location.hostname) && 
        !lowerUrl.includes('s3.k-connect.ru')) {
      return false;
    }
    
    // Бейджики всегда кешируем (они имеют уникальные названия и часто используются)
    if (lowerUrl.includes('/bages/') && lowerUrl.endsWith('.svg')) {
      return true;
    }
    
    // Only cache high-priority media files to reduce overhead
    const priorityExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const hasPriorityExtension = priorityExtensions.some(ext => lowerUrl.includes(ext));
    
    // Only cache from specific high-priority folders
    const isPriorityFolder = lowerUrl.includes('/uploads/avatar/') ||
                            lowerUrl.includes('/uploads/post/') ||
                            lowerUrl.includes('/uploads/prof_back/') ||
                            lowerUrl.includes('/images/') ||
                            lowerUrl.includes('/avatars/') ||
                            lowerUrl.includes('/static/');
    
    return hasPriorityExtension && isPriorityFolder;
  }

  private async compressImage(blob: Blob, url: string): Promise<Blob> {
    if (!this.imageCompressionSettings.enableCompression || !this.isImageFile(url)) {
      return blob;
    }

    if (this.shouldSkipCompression(url)) {
      return blob;
    }

    if (blob.size < this.imageCompressionSettings.minSizeToCompress) {
      return blob;
    }

    if (blob.size > this.imageCompressionSettings.maxSizeToCompress) {
      return blob;
    }

    try {
      return new Promise((resolve, reject) => {
        const img = new Image();

        const timeout = setTimeout(() => {
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
                  resolve(compressedBlob);
                } else {
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
          resolve(blob);
        };
        
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      return blob;
    }
  }

  private async compressImageNonBlocking(blob: Blob, url: string): Promise<Blob> {
    // For non-blocking compression, use requestIdleCallback or setTimeout
    return new Promise((resolve) => {
      const compress = async () => {
        try {
          const compressed = await this.compressImage(blob, url);
          resolve(compressed);
        } catch (error) {
          resolve(blob);
        }
      };

      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(compress, { timeout: 1000 });
      } else {
        setTimeout(compress, 0);
      }
    });
  }

  private isImageFile(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  }

  private shouldSkipCompression(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    

    if (lowerUrl.includes('/icons/') || 
        lowerUrl.includes('/favicon') || 
        lowerUrl.includes('/emoji') ||
        lowerUrl.includes('/small/') ||
        lowerUrl.includes('/bages/')) {
      return true;
    }
    

    if (lowerUrl.endsWith('.webp') || lowerUrl.endsWith('.gif') || lowerUrl.endsWith('.svg')) {
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
      // Проверяем, не является ли изображение "tainted" (загрязненным)
      if (this.isImageTainted(img)) {
        // Для S3 изображений не показываем предупреждение, так как это ожидаемое поведение
        if (!img.src.includes('s3.k-connect.ru')) {
          console.warn('Image is tainted, cannot cache:', img.src);
        }
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Проверяем, не стал ли canvas "tainted" после рисования
      if (this.isCanvasTainted(canvas)) {
        // Для S3 изображений не показываем предупреждение
        if (!img.src.includes('s3.k-connect.ru')) {
          console.warn('Canvas became tainted, cannot export:', img.src);
        }
        return;
      }

      canvas.toBlob(async (blob) => {
        if (blob) {
          const urlToCache = normalizedUrl || img.src;
          await this.set(urlToCache, blob);
        }
      }, this.imageCompressionSettings.format, this.imageCompressionSettings.quality);
    } catch (error) {
      // Для S3 изображений не показываем предупреждение
      if (!img.src.includes('s3.k-connect.ru')) {
        console.warn('Failed to cache image from element:', error);
      }
    }
  }

  private isImageTainted(img: HTMLImageElement): boolean {
    try {
      // Проверяем, является ли изображение с S3 сервера
      const isS3Image = img.src.includes('s3.k-connect.ru');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0);
      
      // Пытаемся получить данные - если canvas tainted, это вызовет ошибку
      ctx.getImageData(0, 0, 1, 1);
      return false;
    } catch (error) {
      // Для S3 изображений логируем более подробную информацию
      if (img.src.includes('s3.k-connect.ru')) {
        console.debug('S3 image is tainted (CORS issue):', img.src);
      }
      return true;
    }
  }

  private isCanvasTainted(canvas: HTMLCanvasElement): boolean {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return true;
      
      // Пытаемся получить данные - если canvas tainted, это вызовет ошибку
      ctx.getImageData(0, 0, 1, 1);
      return false;
    } catch (error) {
      return true;
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
    
    // Use non-blocking compression
    const compressedBlob = await this.compressImageNonBlocking(blob, url);
    
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

  // Cache control methods
  enableCache(): void {
    this.isCacheEnabled = true;
    console.log('✅ Media cache enabled');
  }

  disableCache(): void {
    this.isCacheEnabled = false;
    console.log('❌ Media cache disabled');
  }

  setPerformanceMode(enabled: boolean): void {
    this.performanceMode = enabled;
    if (enabled) {
      this.maxCacheOperationsPerSecond = 5;
      this.minCacheInterval = 200;
      this.maxConcurrentOperations = 2;
    } else {
      this.maxCacheOperationsPerSecond = 10;
      this.minCacheInterval = 100;
      this.maxConcurrentOperations = 3;
    }
    console.log(`🎯 Performance mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  getCacheStatus(): {
    enabled: boolean;
    performanceMode: boolean;
    queueLength: number;
    activeOperations: number;
    pendingOperations: number;
  } {
    return {
      enabled: this.isCacheEnabled,
      performanceMode: this.performanceMode,
      queueLength: this.cacheQueue.length,
      activeOperations: this.activeOperations,
      pendingOperations: this.pendingCacheOperations.size,
    };
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

// Cache control exports
export const enableMediaCache = () => mediaCacheService.enableCache();
export const disableMediaCache = () => mediaCacheService.disableCache();
export const setMediaCachePerformanceMode = (enabled: boolean) => mediaCacheService.setPerformanceMode(enabled);
export const getMediaCacheStatus = () => mediaCacheService.getCacheStatus();


export default mediaCacheService; 