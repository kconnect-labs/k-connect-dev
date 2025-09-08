import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

interface UniversalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  maxWidthCustom?: string | number; // Кастомная максимальная ширина
  fullWidth?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  disableEscapeKeyDown?: boolean;
  className?: string;
  contentClassName?: string;
  disablePadding?: boolean;
  addBottomPadding?: boolean;
}

const UniversalModal: React.FC<UniversalModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  maxWidthCustom,
  fullWidth = true,
  showBackButton = false,
  onBack,
  disableEscapeKeyDown = false,
  className = '',
  contentClassName = '',
  disablePadding = false,
  addBottomPadding = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isAnimating, setIsAnimating] = useState(false);

  // Управляем состоянием анимации при открытии / закрытии
  useEffect(() => {
    if (open) {
      // Запускаем анимацию появления
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      // Компонент может быть размонтирован родителем извне. Чтобы 
      // предотвратить "jump cut", сразу выставляем состояние на скрытое.
      setIsAnimating(false);
    }
  }, [open]);

  const closeWithAnimation = () => {
    // Запускаем анимацию закрытия
    setIsAnimating(false);

    // Через время анимации вызываем onClose, чтобы родитель убрал модалку из DOM
    const timeout = isMobile ? 200 : 300;
    setTimeout(() => {
    onClose();
    }, timeout);
  };

  const handleDialogClose = (
    _event: unknown,
    _reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick' | undefined,
  ) => {
    if (disableEscapeKeyDown && _reason === 'escapeKeyDown') return;
    closeWithAnimation();
  };

  const modalStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: maxWidthCustom 
      ? (typeof maxWidthCustom === 'number' ? `${maxWidthCustom}px` : maxWidthCustom)
      : (maxWidth === false ? 'none' : '450px'),
    width: fullWidth ? '100%' : 'auto',
    maxHeight: isMobile ? '100vh' : '90vh',
    margin: isMobile ? 0 : 'auto',
    overflow: 'hidden',
    // Анимация для модалки
    transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
    opacity: isAnimating ? 1 : 0,
    transition: isMobile 
      ? 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    // Оптимизация для мобильных устройств
    willChange: 'transform, opacity',
    // Убираем аппаратное ускорение на мобильных для экономии ресурсов
    transformStyle: isMobile ? 'flat' : 'preserve-3d',
  };

  const backdropStyle = {
    backgroundColor: isAnimating
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(0, 0, 0, 0)',
    backdropFilter: isAnimating ? 'blur(4px)' : 'blur(0px)',
    transition:
      'background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 16px' : '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'var(--theme-background, rgba(255, 255, 255, 0.02))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
    minHeight: isMobile ? '56px' : '64px',
    // Анимация для заголовка
    transform: isAnimating ? 'translateY(0)' : 'translateY(-10px)',
    opacity: isAnimating ? 1 : 0,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
  };

  const contentStyle = {
    transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
    opacity: isAnimating ? 1 : 0,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.15s, opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: modalStyle,
        className,
      }}
      fullScreen={isMobile}
      disableEscapeKeyDown={disableEscapeKeyDown}
      BackdropProps={{
        sx: backdropStyle,
      }}
      TransitionComponent={isMobile ? Slide : Fade}
      TransitionProps={
        (isMobile
          ? { direction: 'up', timeout: 200 }
          : { timeout: 300 }) as any
      }
    >
      <Box sx={headerStyle}>
        {isMobile || showBackButton ? (
          <IconButton 
            onClick={onBack || closeWithAnimation} 
            sx={{ 
              color: 'var(--theme-text-primary)',
              transition: 'transform 0.15s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Typography
          variant='h6'
          sx={{ 
            fontWeight: 600, 
            color: 'var(--theme-text-primary)',
            transition: 'opacity 0.2s ease',
          }}
        >
          {title}
        </Typography>

        <IconButton 
          onClick={closeWithAnimation} 
          sx={{ 
            color: 'var(--theme-text-primary)',
            transition: 'transform 0.15s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent 
        sx={{ 
          p: disablePadding ? 0 : (isMobile ? '16px' : '24px'), 
          pb: addBottomPadding && isMobile ? '120px' : undefined,
          overflow: 'auto',
          ...contentStyle,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
        className={contentClassName}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default UniversalModal; 