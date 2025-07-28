import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Badge as BadgeType } from '../types';
import BadgeComponent from '../../../../UIKIT/Badge/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface PurchaseDialogProps {
  open: boolean;
  badge: BadgeType | null;
  userPoints: number;
  purchaseStep: number;
  isPurchasing: boolean;
  purchaseSuccess: boolean;
  error: string;
  onClose: () => void;
  onPurchase: (badge: BadgeType) => void;
}

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  open,
  badge,
  userPoints,
  purchaseStep,
  isPurchasing,
  purchaseSuccess,
  error,
  onClose,
  onPurchase,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!badge) return null;

  const canAfford = userPoints >= badge.price;

  const handlePurchase = () => {
    if (canAfford && !isPurchasing) {
      onPurchase(badge);
    }
  };

  const modalStyle = {
    background: 'rgba(15, 15, 15, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: '550px',
    width: '100%',
    maxHeight: isMobile ? '100vh' : '90vh',
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

  const getStepText = () => {
    if (purchaseStep === 0) return 'Подтверждение покупки';
    if (purchaseStep === 1.5) return 'Обработка платежа...';
    if (purchaseStep === 2) return 'Покупка завершена!';
    return 'Подготовка...';
  };

  const getStepIcon = () => {
    if (purchaseSuccess) return <CheckCircleIcon color='success' />;
    if (error) return <ErrorIcon color='error' />;
    if (purchaseStep > 0) return <CircularProgress size={20} />;
    return <ShoppingCartIcon />;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: modalStyle,
      }}
      fullScreen={isMobile}
    >
      <Box sx={headerStyle}>
        {isMobile ? (
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getStepIcon()}
          <Typography
            variant='h6'
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {getStepText()}
          </Typography>
        </Box>

        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {purchaseSuccess && (
          <Alert severity='success' sx={{ mb: 2 }}>
            Бейджик успешно куплен! Теперь он доступен в вашей коллекции.
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              p: 2,
              bgcolor: 'rgba(15, 15, 15, 0.98)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {badge.is_upgraded || badge.upgrade ? (
              <BadgeComponent
                achievement={{
                  image_path: `shop/${badge.image_path}`,
                  upgrade: badge.is_upgraded || badge.upgrade ? 'upgraded' : '',
                  color_upgrade:
                    badge.particle_color || badge.color_upgrade || '#FFD700',
                  bage: badge.name || 'Бейджик',
                }}
                size='shop'
                className=''
                onError={() => {}}
                showTooltip={false}
                tooltipText={badge.name || 'Бейджик'}
              />
            ) : (
              <img
                src={`/static/images/bages/shop/${badge.image_path}`}
                alt={badge.name}
                style={{ width: 80, height: 80, objectFit: 'contain' }}
              />
            )}
          </Box>
          <Box>
            <Typography variant='h6'>{badge.name}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {badge.description}
            </Typography>
          </Box>
        </Box>

        {purchaseStep > 0 && purchaseStep < 2 && (
          <Box
            sx={{
              mb: 3,
              p: 3,
              bgcolor: 'rgba(15, 15, 15, 0.98)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}
            >
              Обработка покупки...
            </Typography>
            <LinearProgress
              variant='determinate'
              value={(purchaseStep / 2) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant='body2'
              sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}
            >
              {Math.round((purchaseStep / 2) * 100)}% завершено
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            background: 'rgba(15, 15, 15, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <Typography
            variant='h6'
            sx={{
              mb: 3,
              color: 'text.primary',
              fontSize: '1.2rem',
              fontWeight: 600,
            }}
          >
            Детали покупки
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(15, 15, 15, 0.98)',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Typography variant='body1'>Цена бейджика:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src='/static/icons/KBalls.svg'
                  alt='KBalls'
                  style={{ width: 20, height: 20 }}
                />
                <Typography
                  variant='body1'
                  fontWeight='bold'
                  color='primary.main'
                >
                  {badge.price} баллов
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: 'rgba(15, 15, 15, 0.98)',
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Typography variant='body1'>Ваш баланс:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src='/static/icons/KBalls.svg'
                  alt='KBalls'
                  style={{ width: 20, height: 20 }}
                />
                <Typography
                  variant='body1'
                  fontWeight='bold'
                  color={canAfford ? 'success.main' : 'error.main'}
                >
                  {userPoints} баллов
                </Typography>
              </Box>
            </Box>

            {!canAfford && (
              <Alert severity='warning'>
                Недостаточно баллов для покупки. Необходимо: {badge.price},
                доступно: {userPoints}
              </Alert>
            )}

            {canAfford && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(15, 15, 15, 0.98)',
                  borderRadius: '8px',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(76, 175, 80, 0.05)',
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Typography variant='body1'>Остаток после покупки:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <img
                    src='/static/icons/KBalls.svg'
                    alt='KBalls'
                    style={{ width: 20, height: 20 }}
                  />
                  <Typography
                    variant='body1'
                    fontWeight='bold'
                    color='success.main'
                  >
                    {userPoints - badge.price} баллов
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {purchaseStep === 0 && (
          <>
            <Button
              onClick={onClose}
              color='inherit'
              sx={{
                borderRadius: 8,
                py: 1,
                px: 3,
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handlePurchase}
              variant='contained'
              disabled={!canAfford || isPurchasing}
              startIcon={<ShoppingCartIcon />}
              sx={{
                borderRadius: 8,
                py: 1,
                px: 3,
                minWidth: 140,
              }}
            >
              Подтвердить покупку
            </Button>
          </>
        )}

        {purchaseStep > 0 && purchaseStep < 2 && (
          <Button
            onClick={onClose}
            color='inherit'
            disabled
            sx={{
              borderRadius: 8,
              py: 1,
              px: 3,
            }}
          >
            Отмена
          </Button>
        )}

        {purchaseSuccess && (
          <Button
            onClick={onClose}
            variant='contained'
            color='success'
            sx={{
              borderRadius: 8,
              py: 1,
              px: 3,
              minWidth: 140,
            }}
          >
            Отлично!
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
