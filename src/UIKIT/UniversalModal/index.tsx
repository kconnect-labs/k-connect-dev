import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
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
  fullWidth?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  disableEscapeKeyDown?: boolean;
  className?: string;
  contentClassName?: string;
}

const UniversalModal: React.FC<UniversalModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  showBackButton = false,
  onBack,
  disableEscapeKeyDown = false,
  className = '',
  contentClassName = '',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    onClose();
  };

  const modalStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: maxWidth === false ? 'none' : undefined,
    width: fullWidth ? '100%' : 'auto',
    maxHeight: isMobile ? '100vh' : '90vh',
    margin: isMobile ? 0 : 'auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'var(--theme-background, rgba(255, 255, 255, 0.02))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: modalStyle,
        className,
      }}
      fullScreen={isMobile}
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      <Box sx={headerStyle}>
        {isMobile || showBackButton ? (
          <IconButton 
            onClick={onBack || handleClose} 
            sx={{ color: 'text.primary' }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Typography
          variant='h6'
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {title}
        </Typography>

        <IconButton onClick={handleClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent 
        sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}
        className={contentClassName}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default UniversalModal; 