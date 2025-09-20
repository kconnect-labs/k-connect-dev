/**
 * Хук для удобного использования универсального кеша
 * Предоставляет методы для работы с кешированием медиа файлов
 */

import { useState, useEffect, useCallback } from 'react';
import { browserCache } from '../utils/browserCache';

interface UseUnifiedCacheReturn {
  getFile: (url: string) => Promise<string | null>;
  loadFile: (url: string) => Promise<string | null>;
  hasFile: (url: string) => Promise<boolean>;
  clearFileCache: (url: string) => Promise<void>;
  clearAllCache: () => Promise<void>;
  preloadFiles: (urls: string[]) => Promise<void>;
  getCacheStats: () => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const useUnifiedCache = (): UseUnifiedCacheReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFile = useCallback(async (url: string): Promise<string | null> => {
    try {
      setError(null);
      return await browserCache.getFile(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to get file from cache:', errorMessage);
      return null;
    }
  }, []);

  const loadFile = useCallback(async (url: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await browserCache.loadFile(url);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to load file:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasFile = useCallback(async (url: string): Promise<boolean> => {
    try {
      setError(null);
      return await browserCache.hasFile(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to check if file exists in cache:', errorMessage);
      return false;
    }
  }, []);

  const clearFileCache = useCallback(async (url: string): Promise<void> => {
    try {
      setError(null);
      await browserCache.clearFileCache(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to clear file cache:', errorMessage);
    }
  }, []);

  const clearAllCache = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await browserCache.clearCache();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to clear all cache:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const preloadFiles = useCallback(async (urls: string[]): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await browserCache.preloadFiles(urls);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to preload files:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCacheStats = useCallback(async () => {
    try {
      setError(null);
      return await browserCache.getCacheStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.warn('Failed to get cache stats:', errorMessage);
      return null;
    }
  }, []);

  return {
    getFile,
    loadFile,
    hasFile,
    clearFileCache,
    clearAllCache,
    preloadFiles,
    getCacheStats,
    isLoading,
    error,
  };
};

export default useUnifiedCache;
