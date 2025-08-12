import React from 'react';
import { Box, Typography, LinearProgress, IconButton, Tooltip } from '@mui/material';
import { Download, CheckCircle, Error, Refresh } from '@mui/icons-material';
import { useStickerPreloader } from '../hooks/useStickerPreloader';

interface StickerPreloadIndicatorProps {
  showStats?: boolean;
  compact?: boolean;
}

export const StickerPreloadIndicator: React.FC<StickerPreloadIndicatorProps> = ({
  showStats = false,
  compact = false,
}) => {
  const { isPreloading, progress, stats, error, forcePreload, clearCache } = useStickerPreloader();

  // Не показываем индикатор, если нет стикеров
  if (stats.totalStickers === 0 && !isPreloading) {
    return null;
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    if (timestamp === 0) return 'Никогда';
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (compact) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: 2,
          background: 'var(--theme-background, rgba(255,255,255,0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          minWidth: 200,
        }}
      >
        {isPreloading ? (
          <>
            <Download sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {progress.percentage}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{ flex: 1, height: 4, borderRadius: 2 }}
            />
          </>
        ) : error ? (
          <>
            <Error sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Ошибка загрузки
            </Typography>
            <Tooltip title="Повторить загрузку">
              <IconButton size="small" onClick={forcePreload}>
                <Refresh sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {stats.cachedStickers}/{stats.totalStickers}
            </Typography>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: 'var(--theme-background, rgba(255,255,255,0.03))',
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Кеш стикеров
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Обновить кеш">
            <IconButton size="small" onClick={forcePreload} disabled={isPreloading}>
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Очистить кеш">
            <IconButton size="small" onClick={clearCache} disabled={isPreloading}>
              <Error sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isPreloading && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Download sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Загрузка стикеров...
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {progress.current} из {progress.total} ({progress.percentage}%)
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: 'error.dark' }}>
          <Typography variant="body2" sx={{ color: 'error.light' }}>
            Ошибка загрузки: {error}
          </Typography>
        </Box>
      )}

      {showStats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Стикерпаки
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {stats.totalPacks}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Всего стикеров
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {stats.totalStickers}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              В кеше
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {stats.cachedStickers}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Размер кеша
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {formatBytes(stats.cacheSize)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Последнее обновление
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {formatDate(stats.lastUpdate)}
            </Typography>
          </Box>
        </Box>
      )}

      {!isPreloading && !error && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Кеш готов: {stats.cachedStickers} из {stats.totalStickers} стикеров
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StickerPreloadIndicator; 