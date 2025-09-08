import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Badge as BadgeType } from '../types';
import BadgeComponent from '../../../../UIKIT/Badge/Badge';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BadgeDialogProps {
  open: boolean;
  badge: BadgeType | null;
  userPoints: number;
  userId?: number;
  onClose: () => void;
  onPurchase: (badge: BadgeType) => void;
}

export const BadgeDialog: React.FC<BadgeDialogProps> = ({
  open,
  badge,
  userPoints,
  userId,
  onClose,
  onPurchase,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!badge) return null;

  const isSoldOut =
    badge.max_copies &&
    badge.copies_sold &&
    badge.copies_sold >= badge.max_copies;
  const isPurchased = badge.purchases?.some(
    purchase => purchase.buyer_id === userId
  );
  const canBuy = !isSoldOut && !isPurchased && userPoints >= badge.price;

  const handlePurchase = () => {
    onPurchase(badge);
  };

  const modalStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
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

        <Typography
          variant='h6'
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {badge.name}
        </Typography>

        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            p: 3,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {badge.is_upgraded || badge.upgrade ? (
            <BadgeComponent
              achievement={{
                image_path: badge.image_path,
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
              src={badge.image_path}
              alt={badge.name}
              style={{ width: 80, height: 80, objectFit: 'contain' }}
            />
          )}
        </Box>

        <Typography variant='body1' sx={{ mb: 3, textAlign: 'center' }}>
          {badge.description}
        </Typography>

        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
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
            Информация о бейджике
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {/* Цена */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src='/static/icons/KBalls.svg'
                  alt='KBalls'
                  style={{ width: 20, height: 20 }}
                />
                <Typography variant='body1'>Цена</Typography>
              </Box>
              <Typography
                variant='body1'
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                {badge.price} баллов
              </Typography>
            </Box>

            {/* Создатель */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color='action' />
                <Typography variant='body1'>Создатель</Typography>
              </Box>
              <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                {badge.creator?.name || 'Неизвестно'}
              </Typography>
            </Box>

            {/* Лимит копий */}
            {badge.max_copies && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: '8px',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon color='action' />
                  <Typography variant='body1'>Продано</Typography>
                </Box>
                <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                  {badge.copies_sold || 0} / {badge.max_copies}
                </Typography>
              </Box>
            )}

            {/* Баланс пользователя */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                },
                transition: 'background-color 0.2s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src='/static/icons/KBalls.svg'
                  alt='KBalls'
                  style={{ width: 20, height: 20 }}
                />
                <Typography variant='body1'>Ваш баланс</Typography>
              </Box>
              <Typography
                variant='body1'
                sx={{
                  fontWeight: 'bold',
                  color: canBuy ? 'success.main' : 'error.main',
                }}
              >
                {userPoints} баллов
              </Typography>
            </Box>
          </Box>

          {/* Статус */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {(badge.is_upgraded || badge.upgrade) && (
              <Chip
                label='Улучшенный'
                size='small'
                color='secondary'
                sx={{ backgroundColor: 'rgba(183, 0, 255, 0.9)' }}
              />
            )}
            {isSoldOut && (
              <Chip label='Распродано' size='small' color='error' />
            )}
            {isPurchased && (
              <Chip label='Куплено' size='small' color='success' />
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          color='inherit'
          sx={{
            borderRadius: 8,
            py: 1,
            px: 3,
          }}
        >
          Закрыть
        </Button>
        {!isSoldOut && !isPurchased && (
          <Button
            onClick={handlePurchase}
            variant='contained'
            disabled={!canBuy}
            startIcon={<ShoppingCartIcon />}
            sx={{
              borderRadius: 8,
              py: 1,
              px: 3,
              minWidth: 140,
            }}
          >
            {canBuy ? 'Купить' : 'Недостаточно баллов'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
