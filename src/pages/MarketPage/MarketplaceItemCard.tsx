import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { MarketplaceListing } from './types';
import BallsIcon from '../Economic/components/inventoryPack/BallsIcon';
import MCoinIcon from '../Economic/components/inventoryPack/MCoinIcon';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  },
}));

const ItemImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  marginBottom: theme.spacing(1),
  backgroundImage: 'var(--item-background)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const PriceBadge = styled(Box)({
  position: 'absolute',
  top: 8,
  right: 8,
  padding: '4px 8px',
  borderRadius: 'var(--main-border-radius) !important',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  color: '#fff',
  background: 'var(--theme-background, rgba(0, 0, 0, 0.7))',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  zIndex: 3,
});

const KBallsIcon = styled('img')({
  width: '16px',
  height: '16px',
  marginRight: '2px',
});

const RarityChip = styled(Chip)<{ rarity: string }>(({ theme, rarity }) => {
  const colors = {
    common: { bg: 'rgba(156, 163, 175, 0.2)', color: '#9CA3AF' },
    rare: { bg: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' },
    epic: { bg: 'rgba(147, 51, 234, 0.2)', color: '#9333EA' },
    legendary: { bg: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' },
  };

  const color = colors[rarity as keyof typeof colors] || colors.common;

  return {
    backgroundColor: color.bg,
    color: color.color,
    border: `1px solid ${color.color}20`,
    fontWeight: 600,
    fontSize: '0.75rem',
  };
});

interface MarketplaceItemCardProps {
  listing: MarketplaceListing;
  onClick: (listing: MarketplaceListing) => void;
}

const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({ listing, onClick }) => {
  const { item, price, seller_name, currency } = listing;
  
  // Функция для получения иконки валюты
  const getCurrencyIcon = (currency?: string) => {
    if (currency === 'mcoin') {
      return <MCoinIcon sx={{ fontSize: 16, color: '#d0bcff' }} />;
    }
    return <BallsIcon sx={{ fontSize: 16 }} />;
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: 'Обычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный',
    };
    return labels[rarity as keyof typeof labels] || rarity;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StyledCard onClick={() => onClick(listing)}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <ItemImageContainer
            sx={{
              '--item-background': item.background_url ? `url(${item.background_url})` : 'none',
            }}
          >
            <img
              src={item.image_url}
              alt={item.item_name}
              width="80%"
              height="80%"
              style={{
                objectFit: 'contain',
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
            <PriceBadge>
              {getCurrencyIcon(currency)}
              {formatPrice(price)}
            </PriceBadge>
          </ItemImageContainer>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
                textAlign: 'center',
                minHeight: 32,
                maxHeight: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '1rem',
                lineHeight: 1.2,
              }}
            >
              {item.item_name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <RarityChip
                rarity={item.rarity}
                label={getRarityLabel(item.rarity)}
                size="small"
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 1 }}
            >
              Продавец: {seller_name}
            </Typography>

          </Box>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

export default MarketplaceItemCard;
