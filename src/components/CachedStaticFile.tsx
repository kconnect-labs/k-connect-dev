/**
 * Компонент для отображения кешированных статических файлов
 */

import React from 'react';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { Refresh, Error } from '@mui/icons-material';
import { useStaticCache } from '../hooks/useStaticCache';

interface CachedStaticFileProps {
  url: string | null;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  width?: number | string;
  height?: number | string;
  showRetryButton?: boolean;
  fallbackComponent?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

const CachedStaticFile: React.FC<CachedStaticFileProps> = ({
  url,
  alt = '',
  style = {},
  className = '',
  width,
  height,
  showRetryButton = true,
  fallbackComponent,
  onLoad,
  onError
}) => {
  const { src, loading, error, retry, clearCache } = useStaticCache(url);

  const handleLoad = () => {
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  const handleRetry = async () => {
    await clearCache();
    retry();
  };

  // Если нет URL, не рендерим ничего
  if (!url) {
    return fallbackComponent || null;
  }

  // Определяем тип файла
  const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/);
  const isSvg = url.toLowerCase().endsWith('.svg');

  if (loading) {
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: width || '100%',
          height: height || '100%',
          ...style
        }}
        className={className}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: width || '100%',
          height: height || '100%',
          backgroundColor: '#f5f5f5',
          border: '1px dashed #ccc',
          ...style
        }}
        className={className}
      >
        {showRetryButton ? (
          <Tooltip title="Перезагрузить файл">
            <IconButton
              onClick={handleRetry}
              size="small"
              style={{ color: '#666' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        ) : (
          <Error style={{ color: '#666', fontSize: 24 }} />
        )}
      </Box>
    );
  }

  if (!src) {
    return fallbackComponent || null;
  }

  // Рендерим изображение
  if (isImage) {
    return (
      <img
        src={src}
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
  }

  // Рендерим SVG
  if (isSvg) {
    return (
      <Box
        style={{
          width: width || '100%',
          height: height || '100%',
          ...style
        }}
        className={className}
        dangerouslySetInnerHTML={{ __html: src }}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  // Для других типов файлов показываем ссылку
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: width || '100%',
        height: height || '100%',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        ...style
      }}
      className={className}
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          color: '#1976d2',
          fontSize: '14px'
        }}
      >
        Открыть файл
      </a>
    </Box>
  );
};

export default CachedStaticFile;
