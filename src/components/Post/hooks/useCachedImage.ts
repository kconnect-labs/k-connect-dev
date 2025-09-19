/**
 * Хук для использования кешированных изображений в компонентах Post
 */

import { useState, useEffect } from 'react';
import { getCachedImageUrl } from '../utils/postUtils';

interface UseCachedImageResult {
  src: string;
  loading: boolean;
  error: boolean;
}

export const useCachedImage = (originalUrl: string): UseCachedImageResult => {
  const [src, setSrc] = useState<string>(originalUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!originalUrl) {
      setSrc('/static/uploads/avatar/system/avatar.png');
      return;
    }

    const loadCachedImage = async () => {
      setLoading(true);
      setError(false);

      try {
        const cachedUrl = await getCachedImageUrl(originalUrl);
        setSrc(cachedUrl);
      } catch (err) {
        console.warn('Failed to load cached image:', err);
        setError(true);
        setSrc(originalUrl); // Fallback на оригинальный URL
      } finally {
        setLoading(false);
      }
    };

    loadCachedImage();
  }, [originalUrl]);

  return {
    src,
    loading,
    error
  };
};

export default useCachedImage;
