import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Grid,
} from '@mui/material';
import {
  BlurOn,
  BlurOff,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  DarkMode,
  NightsStay,
  WaterDrop,
  WbSunny,
  Forest,
  AcUnit,
  AutoAwesome,
  Lightbulb,
  Coffee,
  Favorite,
  LightMode,
} from '@mui/icons-material';
import { useThemeManager, ThemeType } from '../../../../hooks/useThemeManager';

interface ThemeSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    currentTheme, 
    isApplying, 
    isInitialized, 
    switchToDefaultTheme, 
    switchToBlurTheme,
    switchToAmoledTheme,
    switchToMidnightTheme,
    switchToOceanTheme,
    switchToSunsetTheme,
    switchToForestTheme,
    switchToAuroraTheme,
    switchToCosmicTheme,
    switchToNeonTheme,
    switchToVintageTheme,
    switchToPickmeTheme,
    switchToLightTheme
  } = useThemeManager();

  const handleClose = () => {
    onClose();
  };

  const handleThemeChange = async (themeType: ThemeType) => {
    switch (themeType) {
      case 'default':
        await switchToDefaultTheme();
        break;
      case 'blur':
        await switchToBlurTheme();
        break;
      case 'amoled':
        await switchToAmoledTheme();
        break;
      case 'light':
        await switchToLightTheme();
        break;
      case 'midnight':
        await switchToMidnightTheme();
        break;
      case 'ocean':
        await switchToOceanTheme();
        break;
      case 'sunset':
        await switchToSunsetTheme();
        break;
      case 'forest':
        await switchToForestTheme();
        break;
      case 'aurora':
        await switchToAuroraTheme();
        break;
      case 'cosmic':
        await switchToCosmicTheme();
        break;
      case 'neon':
        await switchToNeonTheme();
        break;
      case 'vintage':
        await switchToVintageTheme();
        break;
      case 'pickme':
        await switchToPickmeTheme();
        break;
    }
  };

  const modalStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: isMobile ? '100vh' : 'auto',
    margin: isMobile ? 0 : 'auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(10px)',
  };

  const getThemeButtonStyle = (themeType: ThemeType) => ({
    py: 2,
    px: 3,
    background: currentTheme === themeType 
      ? getThemeBackground(themeType)
      : 'rgba(255, 255, 255, 0.05)',
    backdropFilter: currentTheme === themeType 
      ? getThemeBackdropFilter(themeType)
      : 'none',
    border: '1px solid rgba(66, 66, 66, 0.5)',
    color: 'var(--theme-text-primary)',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: currentTheme === themeType 
        ? getThemeBackground(themeType)
        : 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-1px)',
    },
    '&:disabled': {
      opacity: 0.7,
    },
  });

  const getThemeBackground = (themeType: ThemeType) => {
    switch (themeType) {
      case 'default': return 'rgba(15, 15, 15, 0.98)';
      case 'blur': return 'rgba(255, 255, 255, 0.03)';
      case 'amoled': return 'rgba(0, 0, 0, 1)';
      case 'light': return 'rgba(255, 255, 255, 0.95)';
      case 'midnight': return 'rgba(5, 8, 20, 0.95)';
      case 'ocean': return 'rgba(8, 25, 40, 0.92)';
      case 'sunset': return 'rgba(40, 15, 8, 0.94)';
      case 'forest': return 'rgba(8, 30, 15, 0.93)';
      case 'aurora': return 'rgba(12, 35, 25, 0.91)';
      case 'cosmic': return 'rgba(30, 8, 35, 0.96)';
      case 'neon': return 'rgba(8, 20, 45, 0.89)';
      case 'vintage': return 'rgba(35, 20, 8, 0.95)';
      case 'pickme': return 'rgba(131, 61, 96, 0.93)';
      default: return 'rgba(15, 15, 15, 0.98)';
    }
  };

  const getThemeBackdropFilter = (themeType: ThemeType) => {
    switch (themeType) {
      case 'default': return 'none';
      case 'blur': return 'blur(20px)';
      case 'amoled': return 'none';
      case 'light': return 'none';
      case 'midnight': return 'blur(20px)';
      case 'ocean': return 'blur(20px)';
      case 'sunset': return 'blur(20px)';
      case 'forest': return 'blur(20px)';
      case 'aurora': return 'blur(20px)';
      case 'cosmic': return 'blur(20px)';
      case 'neon': return 'blur(20px)';
      case 'vintage': return 'blur(20px)';
      case 'pickme': return 'blur(20px)';
      default: return 'none';
    }
  };

  const getThemeIcon = (themeType: ThemeType) => {
    switch (themeType) {
      case 'default': return <BlurOff />;
      case 'blur': return <BlurOn />;
      case 'amoled': return <DarkMode />;
      case 'light': return <LightMode />;
      case 'midnight': return <DarkMode />;
      case 'ocean': return <WaterDrop />;
      case 'sunset': return <WbSunny />;
      case 'forest': return <Forest />;
      case 'aurora': return <AcUnit />;
      case 'cosmic': return <AutoAwesome />;
      case 'neon': return <Lightbulb />;
      case 'vintage': return <Coffee />;
      case 'pickme': return <Favorite />;
      default: return <BlurOff />;
    }
  };

  const getThemeName = (themeType: ThemeType) => {
    switch (themeType) {
      case 'default': return 'Классическая';
      case 'blur': return 'Blur Glass';
      case 'amoled': return 'Amoled';
      case 'light': return 'Light';
      case 'midnight': return 'Midnight';
      case 'ocean': return 'Ocean';
      case 'sunset': return 'Sunset';
      case 'forest': return 'Forest';
      case 'aurora': return 'Aurora';
      case 'cosmic': return 'Cosmic';
      case 'neon': return 'Neon';
      case 'vintage': return 'Vintage';
      case 'pickme': return 'pickme';
      default: return 'Классическая';
    }
  };

  const getThemeDescription = (themeType: ThemeType) => {
    switch (themeType) {
      case 'default': return 'Темная тема без эффектов';
      case 'blur': return 'Прозрачная с размытием';
      case 'amoled': return 'Чисто черная тема';
      case 'light': return '!!ALARM!! Не использовать, еще в разработке';
      case 'midnight': return 'Глубокий темно-синий с фиолетовым';
      case 'ocean': return 'Яркий синий с бирюзовым оттенком';
      case 'sunset': return 'Яркий красно-оранжевый закат';
      case 'forest': return 'Яркий зеленый лес';
      case 'aurora': return 'Яркий зелено-голубой северные сияния';
      case 'cosmic': return 'Яркий пурпурно-розовый космос';
      case 'neon': return 'Яркий электрический синий';
      case 'vintage': return 'Теплый коричнево-золотой';
      case 'pickme': return 'Нежно-розовый приятный';
      default: return 'Темная тема без эффектов';
    }
  };

  // Показываем загрузку пока тема не инициализирована
  if (!isInitialized) {
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: modalStyle,
        }}
        fullScreen={isMobile}
      >
        <Box sx={headerStyle}>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}>
            Загрузка темы...
          </Typography>
        </Box>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography sx={{ color: 'var(--theme-text-primary)' }}>Инициализация темы...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const themes: ThemeType[] = ['default', 'blur', 'amoled', 'light', 'midnight', 'ocean', 'sunset', 'forest', 'aurora', 'cosmic', 'neon', 'vintage', 'pickme'];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: modalStyle,
      }}
      fullScreen={isMobile}
    >
      <Box sx={headerStyle}>
        {isMobile ? (
          <IconButton onClick={handleClose} sx={{ color: 'var(--theme-text-primary)' }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Typography
          variant='h6'
          sx={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}
        >
          Выберите тему интерфейса
        </Typography>

        <IconButton onClick={handleClose} sx={{ color: 'var(--theme-text-primary)' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)', textAlign: 'center' }}>
            Текущая тема: {getThemeName(currentTheme)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
            Выберите одну из доступных тем для изменения внешнего вида интерфейса
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 0.5,
          maxWidth: '100%',
        }}>
          {themes.map((themeType) => (
            <Button
              key={themeType}
              onClick={() => handleThemeChange(themeType)}
              disabled={isApplying || currentTheme === themeType}
              startIcon={getThemeIcon(themeType)}
              variant={currentTheme === themeType ? 'contained' : 'outlined'}
              sx={getThemeButtonStyle(themeType)}
              fullWidth
            >
              <Box sx={{ textAlign: 'left', width: '100%' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}>
                  {getThemeName(themeType)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', color: 'var(--theme-text-secondary)' }}>
                  {getThemeDescription(themeType)}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettingsModal; 