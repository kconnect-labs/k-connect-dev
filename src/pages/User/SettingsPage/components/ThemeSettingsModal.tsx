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
} from '@mui/material';
import {
  BlurOn,
  BlurOff,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
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
  const { currentTheme, isApplying, isInitialized, switchToDefaultTheme, switchToBlurTheme } = useThemeManager();

  const handleClose = () => {
    onClose();
  };

  const handleThemeChange = async (themeType: ThemeType) => {
    if (themeType === 'default') {
      await switchToDefaultTheme();
    } else {
      await switchToBlurTheme();
    }
    onSuccess?.('Тема изменена');
    onClose();
  };

  const modalStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: '400px',
    width: '100%',
    maxHeight: isMobile ? '100vh' : 'auto',
    margin: isMobile ? 0 : 'auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(10px)',
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
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
            Загрузка темы...
          </Typography>
        </Box>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography>Инициализация темы...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

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
          <IconButton onClick={handleClose} sx={{ color: 'text.primary' }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Typography
          variant='h6'
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          Тема интерфейса
        </Typography>

        <IconButton onClick={handleClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            onClick={() => handleThemeChange('default')}
            disabled={isApplying || currentTheme === 'default'}
            startIcon={<BlurOff />}
            variant={currentTheme === 'default' ? 'contained' : 'outlined'}
            sx={{
              py: 2,
              px: 3,
              background: currentTheme === 'default' 
                ? 'rgba(15, 15, 15, 0.98)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                background: currentTheme === 'default' 
                  ? 'rgba(15, 15, 15, 0.98)' 
                  : 'rgba(255, 255, 255, 0.1)',
              },
              '&:disabled': {
                opacity: 0.7,
              },
            }}
          >
            Дефолтная тема
          </Button>

          <Button
            onClick={() => handleThemeChange('blur')}
            disabled={isApplying || currentTheme === 'blur'}
            startIcon={<BlurOn />}
            variant={currentTheme === 'blur' ? 'contained' : 'outlined'}
            sx={{
              py: 2,
              px: 3,
              background: currentTheme === 'blur' 
                ? 'rgba(255, 255, 255, 0.03)' 
                : 'rgba(255, 255, 255, 0.05)',
              backdropFilter: currentTheme === 'blur' 
                ? 'blur(20px)' 
                : 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                background: currentTheme === 'blur' 
                  ? 'rgba(255, 255, 255, 0.03)' 
                  : 'rgba(255, 255, 255, 0.1)',
              },
              '&:disabled': {
                opacity: 0.7,
              },
            }}
          >
            Blur Glass
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettingsModal; 