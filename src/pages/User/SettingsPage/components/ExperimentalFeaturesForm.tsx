import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Button,
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
  const [showReloadButton, setShowReloadButton] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(() => getMediaCacheStatus());

  const containerStyle = {
    p: 3,
    borderRadius: 2,
    background: 'rgba(15, 15, 15, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    mb: 3,
  };

  const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    borderRadius: 1.5,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    mb: 2,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.05)',
    },
  };



  const handleReload = () => {
    window.location.reload();
  };

  const handleDismissReload = () => {
    setShowReloadButton(false);
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

  // Автоматически скрываем кнопку перезагрузки через 30 секунд
  useEffect(() => {
    if (showReloadButton) {
      const timer = setTimeout(() => {
        setShowReloadButton(false);
      }, 30000); // 30 секунд

      return () => clearTimeout(timer);
    }
  }, [showReloadButton]);

  return (
    <Box sx={containerStyle}>
      <Typography
        variant='h6'
        sx={{
          mb: 3,
          color: 'text.primary',
          fontSize: '1.2rem',
          fontWeight: 600,
        }}
      >
        Экспериментальные функции
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        Эти функции находятся в разработке и могут работать нестабильно.
        Используйте на свой страх и риск.
      </Alert>



      {/* Управление кешем медиа */}
      <Box sx={featureItemStyle}>
        <Switch
          checked={cacheStatus.enabled}
          onChange={handleCacheToggle}
          color='primary'
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant='body1' fontWeight={500} sx={{ mb: 0.5 }}>
            Кеш медиа-файлов
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Кеширование изображений и медиа для ускорения загрузки. 
            {cacheStatus.enabled && (
              <span style={{ color: '#ff9800' }}>
                {' '}Активно: {cacheStatus.queueLength} в очереди, {cacheStatus.activeOperations} операций
              </span>
            )}
          </Typography>
        </Box>
        {cacheStatus.enabled && (
          <Switch
            checked={cacheStatus.performanceMode}
            onChange={handlePerformanceModeToggle}
            size='small'
            color='secondary'
          />
        )}
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

      {/* Кнопка перезагрузки */}
      {showReloadButton && (
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          borderRadius: 1.5,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative'
        }}>
          <Button
            size='small'
            onClick={handleDismissReload}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              minWidth: 'auto',
              p: 0.5,
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                background: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon fontSize='small' />
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Alert severity='warning' sx={{ flex: 1, mb: 0 }}>
              Для корректного применения настроек оптимизации блюра рекомендуется перезагрузить страницу.
            </Alert>
            <Button
              variant='contained'
              color='primary'
              startIcon={<RefreshIcon />}
              onClick={handleReload}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                minWidth: '140px'
              }}
            >
              Перезагрузить
            </Button>
          </Box>
        </Box>
      )}

      {/* Анимации (в разработке) */}
      <Box sx={featureItemStyle}>
        <Switch checked={false} disabled={true} color='primary' />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant='body1'
            fontWeight={500}
            sx={{ mb: 0.5, opacity: 0.6 }}
          >
            Анимации (в разработке)
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', opacity: 0.6 }}
          >
            Настройка интенсивности анимаций интерфейса
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ExperimentalFeaturesForm;
