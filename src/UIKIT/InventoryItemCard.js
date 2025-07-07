import React, { memo, useMemo, useCallback } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import OptimizedImage from '../components/OptimizedImage';

// Utilities to determine rarity presentation
const getRarityColor = (rarity = 'common') => {
  switch (rarity) {
    case 'legendary':
      return '#f39c12';
    case 'epic':
      return '#9b59b6';
    case 'rare':
      return '#3498db';
    case 'common':
    default:
      return '#95a5a6';
  }
};

const getRarityLabel = (rarity = 'common') => {
  switch (rarity) {
    case 'legendary':
      return 'Легендарный';
    case 'epic':
      return 'Эпический';
    case 'rare':
      return 'Редкий';
    case 'common':
    default:
      return 'Обычный';
  }
};

// Styled components
const CardWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: 8,
  transition: 'transform 0.3s ease, background 0.3s ease',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    background: 'rgba(255, 255, 255, 0.05)',
  },
}));

const ImageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'backgroundurl',
})(({ backgroundurl, theme }) => ({
  width: '100%',
  aspectRatio: '1',
  borderRadius: 6,
  background: 'rgba(208, 188, 255, 0.1)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(0.5),
  overflow: 'hidden',
  ...(backgroundurl && {
    '::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${backgroundurl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: 'inherit',
      zIndex: 1,
    },
  }),
}));

/**
 * InventoryItemCard – оптимизированный, мемоизированный компонент карточки предмета/подарка.
 * Подходит для мобильных устройств, lazy-loads изображение и переиспользует кеш OptimizedImage.
 */
const InventoryItemCard = memo(({ item, onClick, sx = {}, ...other }) => {
  const rarityColor = useMemo(() => getRarityColor(item.rarity), [item.rarity]);
  const rarityLabel = useMemo(() => getRarityLabel(item.rarity), [item.rarity]);

  const handleClick = useCallback(() => {
    if (onClick) onClick(item);
  }, [onClick, item]);

  return (
    <CardWrapper onClick={handleClick} sx={sx} {...other}>
      <ImageContainer backgroundurl={item.background_url}>
        <OptimizedImage
          src={item.image_url}
          alt={item.item_name}
          width="75%"
          height="75%"
          loading="lazy"
          fallbackText="Предмет недоступен"
          showSkeleton
          style={{ position: 'relative', zIndex: 2, objectFit: 'contain' }}
        />
        {item.marketplace && (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              padding: '2px 6px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 3,
            }}
          >
            <img
              src="/static/icons/KBalls.svg"
              alt="KBalls"
              style={{ width: 12, height: 12 }}
            />
            <Typography
              variant="caption"
              sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.65rem' }}
            >
              {item.marketplace.price}
            </Typography>
          </Box>
        )}
      </ImageContainer>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          display: 'block',
          textAlign: 'center',
          mb: 0.5,
          fontSize: '0.7rem',
          lineHeight: 1.2,
        }}
      >
        {item.item_name}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
        <Chip
          label={rarityLabel}
          size="small"
          sx={{
            backgroundColor: `${rarityColor}20`,
            color: rarityColor,
            fontWeight: 'bold',
            fontSize: '0.6rem',
            height: 16,
            '& .MuiChip-label': { padding: '0 4px' },
          }}
        />
      </Box>
    </CardWrapper>
  );
});

export default InventoryItemCard; 