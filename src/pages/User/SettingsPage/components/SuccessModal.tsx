import React from 'react';
import {
  Box,
  Dialog,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  message = 'Обновлено',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Автоматически закрывается через 2 секунды

      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: isMobile ? '12px' : '16px',
          maxWidth: '300px',
          width: '100%',
          margin: isMobile ? '16px' : 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px',
          gap: 2,
          background:
            'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
          borderBottom: '1px solid rgba(76, 175, 80, 0.2)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            animation: 'pulse 0.6s ease-in-out',
          }}
        >
          <CheckIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>

        <Typography
          variant='h6'
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '1.1rem',
            textAlign: 'center',
            flex: 1,
          }}
        >
          {message}
        </Typography>
      </Box>
    </Dialog>
  );
};

export default SuccessModal;
