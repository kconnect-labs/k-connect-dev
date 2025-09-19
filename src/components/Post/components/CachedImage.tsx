/**
 * Компонент для отображения кешированных изображений в постах
 */

import React from 'react';
import { Box, Skeleton } from '@mui/material';
import { useCachedImage } from '../hooks/useCachedImage';

interface CachedImageProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
  showSkeleton?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const CachedImage: React.FC<CachedImageProps> = ({
  src,
  alt = '',
  style = {},
  className = '',
  width,
  height,
  showSkeleton = true,
  onLoad,
  onError,
  fallbackSrc = '/static/uploads/avatar/system/avatar.png'
}) => {
  const { src: cachedSrc, loading, error } = useCachedImage(src);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  if (loading && showSkeleton) {
    return (
      <Skeleton
        variant="rectangular"
        width={width || '100%'}
        height={height || '100%'}
        animation="wave"
        sx={{
          borderRadius: 1,
          ...style
        }}
      />
    );
  }

  return (
    <img
      src={error ? fallbackSrc : cachedSrc}
      alt={alt}
      style={{
        width: width || '100%',
        height: height || 'auto',
        objectFit: 'contain',
        ...style
      }}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default CachedImage;
