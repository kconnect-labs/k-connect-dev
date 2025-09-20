/**
 * Хук для использования кеша статических файлов
 */

import { useState, useEffect, useCallback } from 'react';
import { browserCache } from '../utils/browserCache';

interface UseStaticCacheResult {
  src: string | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
  clearCache: () => void;
}

export const useStaticCache = (url: string | null): UseStaticCacheResult => {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadFile = useCallback(async (fileUrl: string) => {
    if (!fileUrl) return;

    setLoading(true);
    setError(false);

    try {
      const cachedSrc = await browserCache.loadFile(fileUrl);
      if (cachedSrc) {
        setSrc(cachedSrc);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      console.warn('Failed to load file:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    if (url) {
      loadFile(url);
    }
  }, [url, loadFile]);

  const clearCache = useCallback(async () => {
    if (url) {
      await browserCache.clearFileCache(url);
      setSrc(null);
      setError(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      loadFile(url);
    } else {
      setSrc(null);
      setError(false);
      setLoading(false);
    }
  }, [url, loadFile]);

  return {
    src,
    loading,
    error,
    retry,
    clearCache
  };
};

export default useStaticCache;
