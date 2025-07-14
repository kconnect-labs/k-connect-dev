import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { BlurOff as BlurOffIcon } from '@mui/icons-material';
import { useBlurOptimization } from '../../../../hooks/useBlurOptimization';

interface ExperimentalFeaturesFormProps {
  onSuccess?: () => void;
}

const ExperimentalFeaturesForm: React.FC<ExperimentalFeaturesFormProps> = ({ onSuccess }) => {
  const {
    isEnabled: blurOptimizationEnabled,
    isLoading: blurOptimizationLoading,
    toggleBlurOptimization
  } = useBlurOptimization();

  const containerStyle = {
    p: 3,
    borderRadius: 2,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    mb: 3
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
    }
  };

  const handleBlurToggle = async () => {
    try {
      await toggleBlurOptimization();
      onSuccess?.();
    } catch (error) {
      console.error('Error toggling blur optimization:', error);
    }
  };

  return (
    <Box sx={containerStyle}>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
        Экспериментальные функции
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Эти функции находятся в разработке и могут работать нестабильно. Используйте на свой страх и риск.
      </Alert>

      {/* Оптимизация блюра */}
      <Box sx={featureItemStyle}>
        <Switch
          checked={blurOptimizationEnabled}
          onChange={handleBlurToggle}
          disabled={blurOptimizationLoading}
          color="primary"
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
            Оптимизация блюра
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Отключает blur эффекты для модалок и боксов, заменяя их на сплошной цвет. Улучшает производительность на слабых устройствах.
          </Typography>
        </Box>
        {blurOptimizationLoading ? (
          <CircularProgress size={20} />
        ) : (
          <BlurOffIcon sx={{ color: 'text.secondary' }} />
        )}
      </Box>

      {/* Анимации (в разработке) */}
      <Box sx={featureItemStyle}>
        <Switch
          checked={false}
          disabled={true}
          color="primary"
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5, opacity: 0.6 }}>
            Анимации (в разработке)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6 }}>
            Настройка интенсивности анимаций интерфейса
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ExperimentalFeaturesForm; 