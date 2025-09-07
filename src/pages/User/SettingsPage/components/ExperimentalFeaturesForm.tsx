import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Button,
  Paper,
} from '@mui/material';
import { Refresh as RefreshIcon, Close as CloseIcon } from '@mui/icons-material';
import { 
  enableMediaCache, 
  disableMediaCache, 
  setMediaCachePerformanceMode,
  getMediaCacheStatus 
} from '../../../../services/mediaCache';

interface ExperimentalFeaturesFormProps {
  onSuccess?: () => void;
}

const ExperimentalFeaturesForm: React.FC<ExperimentalFeaturesFormProps> = ({
  onSuccess,
}) => {
  const [cacheStatus, setCacheStatus] = useState(() => getMediaCacheStatus());

  const containerStyle = {
    p: 3,
    borderRadius: 2,
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };


  const handleCacheToggle = () => {
    if (cacheStatus.enabled) {
      disableMediaCache();
    } else {
      enableMediaCache();
    }
    setCacheStatus(getMediaCacheStatus());
  };

  const handlePerformanceModeToggle = () => {
    setMediaCachePerformanceMode(!cacheStatus.performanceMode);
    setCacheStatus(getMediaCacheStatus());
  };

  return (
    <Box >
      <Typography
        variant='h6'
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'var(--theme-text-primary)',
        }}
      >
        Экспериментальные функции
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
          Экспериментальные функции могут быть нестабильными и изменяться без предупреждения
        </Typography>
      </Alert>

      {/* Управление кешем медиа */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)' }}>
                Кеш медиа-файлов
              </Typography>
              <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                Кеширование изображений и медиа для ускорения загрузки. 
                {cacheStatus.enabled && (
                  <span style={{ color: '#ff9800' }}>
                    {' '}Активно: {cacheStatus.queueLength} в очереди, {cacheStatus.activeOperations} операций
                  </span>
                )}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={cacheStatus.enabled}
                onChange={handleCacheToggle}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {cacheStatus.enabled && (
        <Box sx={{ 
          mt: 1, 
          p: 1.5, 
          borderRadius: 1,
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.8rem',
          color: 'text.secondary'
        }}>
          <Typography variant='body2'>
            Режим производительности: {cacheStatus.performanceMode ? 'Включен' : 'Выключен'}
            {cacheStatus.performanceMode && ' (ограниченная нагрузка на сеть)'}
          </Typography>
        </Box>
      )}

      {/* Анимации (в разработке) */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)', opacity: 0.6 }}>
                Анимации (в разработке)
              </Typography>
              <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)', opacity: 0.6 }}>
                Настройка интенсивности анимаций интерфейса
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch checked={false} disabled={true} />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ExperimentalFeaturesForm;
