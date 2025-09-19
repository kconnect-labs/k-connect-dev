import {
  clearMediaCache,
  getMediaCacheStats,
  listCachedUrls,
  preloadMediaUrls,
  getAllCachedMedia,
} from './mediaCache';

export interface CacheInfo {
  totalSize: number;
  itemCount: number;
  lastCleanup: number;
  formattedSize: string;
  formattedLastCleanup: string;
}

export class CacheManager {
  /**
   * Получить информацию о кеше
   */
  static async getCacheInfo(): Promise<CacheInfo> {
    try {
      const stats = await getMediaCacheStats();

      return {
        ...stats,
        formattedSize: this.formatBytes(stats.totalSize),
        formattedLastCleanup: this.formatDate(stats.lastCleanup),
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        lastCleanup: 0,
        formattedSize: '0 B',
        formattedLastCleanup: 'Never',
      };
    }
  }

  /**
   * Очистить весь кеш
   */
  static async clearCache(): Promise<boolean> {
    try {
      await clearMediaCache();
      console.log('✅ Media cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear media cache:', error);
      return false;
    }
  }

  /**
   * Получить список всех закешированных URL
   */
  static async getCachedUrls(): Promise<string[]> {
    try {
      return await listCachedUrls();
    } catch (error) {
      console.error('Failed to get cached URLs:', error);
      return [];
    }
  }

  /**
   * Предзагрузить список URL
   */
  static async preloadUrls(urls: string[]): Promise<void> {
    try {
      await preloadMediaUrls(urls);
      console.log(`✅ Preloaded ${urls.length} URLs`);
    } catch (error) {
      console.error('❌ Failed to preload URLs:', error);
    }
  }

  /**
   * Проверить, закеширован ли URL
   */
  static async isUrlCached(url: string): Promise<boolean> {
    try {
      const cachedUrls = await listCachedUrls();
      return cachedUrls.includes(url);
    } catch (error) {
      console.error('Failed to check if URL is cached:', error);
      return false;
    }
  }

  /**
   * Получить статистику по типам файлов
   */
  static async getFileTypeStats(): Promise<Record<string, number>> {
    try {
      const cachedUrls = await listCachedUrls();
      const stats: Record<string, number> = {};

      cachedUrls.forEach(url => {
        const extension = this.getFileExtension(url);
        stats[extension] = (stats[extension] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get file type stats:', error);
      return {};
    }
  }

  /**
   * Получить статистику по папкам
   */
  static async getFolderStats(): Promise<Record<string, number>> {
    try {
      const cachedMedia = await getAllCachedMedia();
      const folderStats: Record<string, number> = {};

      cachedMedia.forEach(media => {
        const folder = this.getFolderFromUrl(media.url);
        folderStats[folder] = (folderStats[folder] || 0) + media.size;
      });

      return folderStats;
    } catch (error) {
      console.error('Failed to get folder stats:', error);
      return {};
    }
  }

  /**
   * Получить размер кеша по типам файлов
   */
  static async getFileTypeSizes(): Promise<Record<string, number>> {
    try {
      const cachedMedia = await getAllCachedMedia();
      const fileTypeSizes: Record<string, number> = {};

      // Группируем файлы по расширению и суммируем их размеры
      cachedMedia.forEach(media => {
        const extension = this.getFileExtension(media.url);
        fileTypeSizes[extension] = (fileTypeSizes[extension] || 0) + media.size;
      });

      return fileTypeSizes;
    } catch (error) {
      console.error('Failed to get file type sizes:', error);
      return {};
    }
  }

  /**
   * Форматировать байты в читаемый вид
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Форматировать дату
   */
  private static formatDate(timestamp: number): string {
    if (timestamp === 0) return 'Never';

    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Получить расширение файла из URL
   */
  private static getFileExtension(url: string): string {
    const match = url.match(/\.([^.]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * Получить папку из URL
   */
  private static getFolderFromUrl(url: string): string {
    // Проверяем, содержит ли URL /static/
    if (url.includes('/static/')) {
      const staticMatch = url.match(/\/static\/([^?]+)/);
      if (!staticMatch) return 'other';

      const path = staticMatch[1];
      const parts = path.split('/');

      // Определяем основную папку
      if (parts[0] === 'uploads') {
        if (parts[1] === 'avatar') return 'avatars';
        if (parts[1] === 'post') return 'posts';
        if (parts[1] === 'comments') return 'comments';
        if (parts[1] === 'prof_back') return 'profile_backgrounds';
        if (parts[1] === 'banner') return 'banners';
        if (parts[1] === 'reply') return 'replies';
        if (parts[1] === 'artists') return 'artists';
        if (parts[1] === 'lyrics') return 'lyrics';
        if (parts[1] === 'background') return 'backgrounds';
        if (parts[1] === 'playlists') return 'playlists';
        if (parts[1] === 'system') return 'system';
        if (parts[1] === 'BugUpload') return 'bug_uploads';
        return 'uploads_other';
      }

      if (parts[0] === 'music') return 'music';
      if (parts[0] === 'inventory') return 'inventory';
      if (parts[0] === 'images') {
        if (parts[1] === 'bages') return 'badges';
        return 'images_other';
      }
      if (parts[0] === 'sounds') return 'sounds';
      if (parts[0] === 'icons') return 'icons';
      if (parts[0] === 'preview') return 'previews';
      if (parts[0] === 'moderators') return 'moderators';
      if (parts[0] === 'medals') return 'medals';
      if (parts[0] === 'decoration') return 'decoration';
      if (parts[0] === 'font') return 'fonts';
      if (parts[0] === 'subs') return 'subscriptions';
      if (parts[0] === 'receipt') return 'receipts';
      if (parts[0] === 'badge_prev') return 'badge_previews';
      if (parts[0] === 'leaderboard_snapshots') return 'leaderboard';
      if (parts[0] === 'street_blacklist') return 'blacklist';
      if (parts[0] === 'spider') return 'spider';
      if (parts[0] === '404') return 'error_pages';
      if (parts[0] === 'json') return 'json_files';
      if (parts[0] === 'pdf_templates') return 'pdf_templates';
      if (parts[0] === 'playlists') return 'playlists_static';
      if (parts[0] === 'BugUpload') return 'bug_uploads_static';
    } else {
      // Для путей без /static/
      const parts = url.split('/').filter(part => part.length > 0);

      if (parts[0] === 'inventory') return 'inventory';
      if (parts[0] === 'music') return 'music';
      if (parts[0] === 'images') {
        if (parts[1] === 'bages') return 'badges';
        return 'images_other';
      }
      if (parts[0] === 'sounds') return 'sounds';
      if (parts[0] === 'icons') return 'icons';
      if (parts[0] === 'preview') return 'previews';
      if (parts[0] === 'moderators') return 'moderators';
      if (parts[0] === 'medals') return 'medals';
      if (parts[0] === 'decoration') return 'decoration';
      if (parts[0] === 'font') return 'fonts';
      if (parts[0] === 'subs') return 'subscriptions';
      if (parts[0] === 'receipt') return 'receipts';
      if (parts[0] === 'badge_prev') return 'badge_previews';
      if (parts[0] === 'leaderboard_snapshots') return 'leaderboard';
      if (parts[0] === 'street_blacklist') return 'blacklist';
      if (parts[0] === 'spider') return 'spider';
      if (parts[0] === '404') return 'error_pages';
      if (parts[0] === 'json') return 'json_files';
      if (parts[0] === 'pdf_templates') return 'pdf_templates';
      if (parts[0] === 'playlists') return 'playlists_static';
      if (parts[0] === 'BugUpload') return 'bug_uploads_static';
    }

    return 'other';
  }

  /**
   * Проверить, поддерживается ли кеширование в браузере
   */
  static isSupported(): boolean {
    return 'indexedDB' in window;
  }

  /**
   * Получить информацию о поддержке браузера
   */
  static getBrowserSupportInfo(): {
    indexedDB: boolean;
    serviceWorker: boolean;
    cache: boolean;
  } {
    return {
      indexedDB: 'indexedDB' in window,
      serviceWorker: 'serviceWorker' in navigator,
      cache: 'caches' in window,
    };
  }
}

// Экспортируем функции для удобного использования
export const getCacheInfo = () => CacheManager.getCacheInfo();
export const clearCache = () => CacheManager.clearCache();
export const getCachedUrls = () => CacheManager.getCachedUrls();
export const preloadUrls = (urls: string[]) => CacheManager.preloadUrls(urls);
export const isUrlCached = (url: string) => CacheManager.isUrlCached(url);
export const getFileTypeStats = () => CacheManager.getFileTypeStats();
export const getFileTypeSizes = () => CacheManager.getFileTypeSizes();
export const getFolderStats = () => CacheManager.getFolderStats();
export const isSupported = () => CacheManager.isSupported();
export const getBrowserSupportInfo = () => CacheManager.getBrowserSupportInfo();

export default CacheManager;
