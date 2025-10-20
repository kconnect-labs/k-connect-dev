import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Tooltip,
  Fab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Star as StarIcon,
  Lock as LockIcon,
  Percent as PercentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import MCoinIcon from './MCoinIcon';
import BallsIcon from './BallsIcon';
import { Pack, PackContent } from './types';
import ProposePackModal from './ProposePackModal';
// import { useBackgroundGradients } from './useBackgroundGradients';
// import { getBackgroundGradient } from './utils';

// Компонент для эксклюзивного бейджа
const ExclusiveBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  background: 'linear-gradient(135deg, #d0bcff 0%, #9c64f2 100%)',
  color: '#fff',
  padding: '4px 12px',
  borderRadius: 'var(--main-border-radius) !important',
  fontSize: '0.75rem',
  fontWeight: 700,
  zIndex: 10,
  boxShadow: '0 2px 8px rgba(208, 188, 255, 0.3)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  overflow: 'visible',
  height: 480,
  minHeight: 480,
  maxHeight: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  '@media (max-width: 768px)': {
    height: 420,
    minHeight: 420,
    maxHeight: 420,
  },
}));

// Специальный стиль для эксклюзивного пака
const ExclusiveStyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '2px solid #d0bcff',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(208, 188, 255, 0.2), 0 0 20px rgba(208, 188, 255, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  overflow: 'visible',
  height: 480,
  minHeight: 480,
  maxHeight: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #d0bcff, #9c64f2, #d0bcff)',
    borderRadius: 22,
    zIndex: -1,
    opacity: 0.3,
    animation: 'exclusiveGlow 2s ease-in-out infinite alternate',
  },
  '@keyframes exclusiveGlow': {
    '0%': {
      opacity: 0.3,
    },
    '100%': {
      opacity: 0.6,
    },
  },
  '@media (max-width: 768px)': {
    height: 420,
    minHeight: 420,
    maxHeight: 420,
  },
}));

const PackImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 200,
  background:
    'var(--theme-background, linear-gradient(135deg, rgba(208, 188, 255, 0.2) 0%, rgba(156, 100, 242, 0.2) 100%))',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at center, rgba(208, 188, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

// Специальный стиль для изображения эксклюзивного пака
const ExclusivePackImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 200,
  background:
    'linear-gradient(135deg, rgba(208, 188, 255, 0.3) 0%, rgba(156, 100, 242, 0.3) 100%)',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'radial-gradient(circle at center, rgba(208, 188, 255, 0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(208, 188, 255, 0.1) 50%, transparent 70%)',
    animation: 'exclusiveShine 3s ease-in-out infinite',
    pointerEvents: 'none',
  },
  '@keyframes exclusiveShine': {
    '0%': {
      transform: 'translateX(-100%)',
    },
    '100%': {
      transform: 'translateX(100%)',
    },
  },
}));

const ItemContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

const MainItem = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: 'var(--main-border-radius) !important',
  background: 'var(--theme-background, rgba(208, 188, 255, 0.1))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(208, 188, 255, 0.3)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.1)',
    border: '2px solid rgba(208, 188, 255, 0.5)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 'inherit',
    position: 'relative',
    zIndex: 2,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: 'inherit',
    zIndex: 1,
  },
}));

const SideItem = styled(Box)(({ theme }) => ({
  width: 62.5,
  height: 62.5,
  borderRadius: 8,
  background: 'var(--theme-background, rgba(208, 188, 255, 0.08))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.05)',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 'inherit',
    position: 'relative',
    zIndex: 2,
    maxWidth: '100%',
    maxHeight: '100%',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: 'inherit',
    zIndex: 1,
  },
}));

const ItemImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  borderRadius: 'inherit',
});

const PriceChip = styled(Chip)(({ theme }) => ({
  background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
  color: 'text.primary',
  fontWeight: 500,
  fontSize: '0.8rem',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  '& .MuiChip-label': {
    padding: '4px 8px',
  },
}));

// Функция для получения иконки и текста валюты
const getCurrencyInfo = (currency?: string) => {
  if (currency === 'mcoin') {
    return {
      icon: <MCoinIcon sx={{ fontSize: 16, color: '#d0bcff' }} />,
      text: 'Мкоинов',
      color: '#d0bcff'
    };
  }
  return {
    icon: <BallsIcon sx={{ fontSize: 16 }} />,
    text: 'баллов',
    color: undefined
  };
};

const RarityChip = styled(Chip)<{ rarity?: string }>(({ rarity, theme }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    common: { bg: '#95a5a6', color: '#fff' },
    rare: { bg: '#3498db', color: '#fff' },
    epic: { bg: '#9b59b6', color: '#fff' },
    legendary: { bg: '#f39c12', color: '#fff' },
  };

  return {
    background: colors[rarity || 'common']?.bg || colors.common.bg,
    color: colors[rarity || 'common']?.color || colors.common.color,
    fontWeight: 600,
    fontSize: '0.8rem',
    '& .MuiChip-label': {
      padding: '2px 8px',
    },
  };
});

const DiscountChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  background: 'var(--theme-background, #e74c3c)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.85rem',
  zIndex: 2,
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
  '& .MuiChip-icon': {
    color: '#fff',
    marginRight: 4,
  },
}));

const ItemPreview = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'var(--theme-background, rgba(0, 0, 0, 0.5))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px 16px 0 0',
  zIndex: 3,
}));

interface PackCardProps {
  pack: Pack;
  userPoints: number;
  onBuy: () => Promise<void>;
  disabled: boolean;
  onPackClick?: (pack: Pack, packContents: PackContent[]) => void;
  showProposeButton?: boolean;
  onProposeSuccess?: () => void;
}

const PackCard = ({
  pack,
  userPoints,
  onBuy,
  disabled,
  onPackClick,
  showProposeButton = false,
  onProposeSuccess,
}: PackCardProps) => {
  // const { getGradient, getItemId } = useBackgroundGradients();
  const [packContents, setPackContents] = useState<PackContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [items, setItems] = useState<PackContent[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [proposeModalOpen, setProposeModalOpen] = useState(false);

  useEffect(() => {
    fetchPackContents();
  }, [pack.id]);

  const fetchPackContents = async () => {
    try {
      const response = await fetch(`/api/inventory/packs/${pack.id}`);
      const data = await response.json();

      if (data.success && data.pack.contents) {
        setPackContents(data.pack.contents);
      }
    } catch (err) {
      console.error('Error fetching pack contents:', err);
    }
  };

  const handleBuyClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    if (disabled) return;

    setLoading(true);
    try {
      await onBuy();
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onPackClick) {
      onPackClick(pack, packContents);
    }
  };

  const handleViewDetails = () => {
    if (onPackClick) {
      onPackClick(pack, packContents);
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <BallsIcon sx={{ fontSize: 16 }} />;
      case 'epic':
        return <StarIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '#f39c12';
      case 'epic':
        return '#9b59b6';
      case 'rare':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'Легендарный';
      case 'epic':
        return 'Эпический';
      case 'rare':
        return 'Редкий';
      case 'common':
        return 'Обычный';
      default:
        return rarity;
    }
  };

  // Выбираем 3 предмета для отображения
  const displayItems = packContents.slice(0, 3);
  const mainItem = displayItems[0];
  const sideItems = displayItems.slice(1, 3);

  // Функция для сокращения длинных описаний
  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const isSoldOut =
    pack.is_limited &&
    pack.max_quantity &&
    pack.sold_quantity &&
    pack.max_quantity - pack.sold_quantity <= 0;

  // Проверяем, является ли пак эксклюзивным (ID 48)
  const isExclusivePack = pack.id === 2222 || pack.id === 22222;

    return (
    <>
      {showProposeButton && (
        <Fab
          color="primary"
          aria-label="Предложить пак"
          onClick={() => setProposeModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            background: 'var(--theme-primary, #7c3aed)',
            '&:hover': {
              background: 'var(--theme-primary-dark, #6d28d9)',
            },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      <ProposePackModal
        open={proposeModalOpen}
        onClose={() => setProposeModalOpen(false)}
        onSuccess={() => {
          onProposeSuccess?.();
          setProposeModalOpen(false);
        }}
      />

      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}

      >
        {isExclusivePack ? (
          <ExclusiveStyledCard
            onClick={handleViewDetails}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <ExclusiveBadge>Эксклюзив</ExclusiveBadge>
            {/* Все по 1000 */}
            {/* <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.85)', borderRadius: 'var(--main-border-radius)', px: 1.5, py: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <PercentIcon sx={{ color: '#7c3aed', fontSize: 20, mr: 1 }} />
              <Typography variant="subtitle2" sx={{ color: '#222', fontWeight: 700, fontSize: '0.95rem' }}>Все по 1000</Typography>
            </Box> */}
            <ExclusivePackImage>
              {pack.image_path ? (
                <img
                  src={pack.image_path}
                  alt={pack.display_name}
                  width='100%'
                  height='100%'
                />
              ) : (
                <ItemContainer>
                  {sideItems[0] && (
                    <SideItem>
                      <Tooltip
                        title={`${sideItems[0].item_name} (${getRarityLabel(sideItems[0].rarity)})`}
                      >
                        <ItemImage
                          src={`/inventory/pack/${pack.id}/${sideItems[0].item_name}`}
                          alt={sideItems[0].item_name}
                        />
                      </Tooltip>
                    </SideItem>
                  )}
                  <MainItem>
                    {mainItem ? (
                      <Tooltip
                        title={`${mainItem.item_name} (${getRarityLabel(mainItem.rarity)})`}
                      >
                        <ItemImage
                          src={`/inventory/pack/${pack.id}/${mainItem.item_name}`}
                          alt={mainItem.item_name}
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        ???
                      </Typography>
                    )}
                  </MainItem>
                  {sideItems[1] && (
                    <SideItem>
                      <Tooltip
                        title={`${sideItems[1].item_name} (${getRarityLabel(sideItems[1].rarity)})`}
                      >
                        <ItemImage
                          src={`/inventory/pack/${pack.id}/${sideItems[1].item_name}`}
                          alt={sideItems[1].item_name}
                        />
                      </Tooltip>
                    </SideItem>
                  )}
                </ItemContainer>
              )}

              {/* Показываем предметы при наведении */}
              {showItems && packContents.length > 0 && (
                <ItemPreview>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                    }}
                  >
                    {packContents.slice(0, 6).map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 37.5,
                          height: 37.5,
                          position: 'relative',
                          borderRadius: 4,
                          overflow: 'hidden',
                          backgroundImage: item.background_url ? `url(${item.background_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        <img
                          src={`/inventory/pack/${pack.id}/${item.item_name}`}
                          alt={item.item_name}
                          width='75%'
                          height='75%'
                          style={{
                            position: 'relative',
                            zIndex: 3,
                            objectFit: 'contain',
                          }}
                        />
                      </Box>
                    ))}
                    {packContents.length > 6 && (
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary' }}
                      >
                        +{packContents.length - 6}
                      </Typography>
                    )}
                  </Box>
                </ItemPreview>
              )}
            </ExclusivePackImage>

            <CardContent
              sx={{
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
              }}
            >
              <Typography
                variant='h6'
                component='h3'
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
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#d0bcff',
                  textShadow: '0 0 10px rgba(208, 188, 255, 0.5)',
                }}
              >
                {pack.display_name}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'rgba(208, 188, 255, 0.8)',
                  mb: 2,
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  flex: '0 0 40px',
                  minHeight: 40,
                  maxHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {truncateDescription(pack.description)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                  gap: 1,
                  flexWrap: 'wrap',
                  minHeight: 36,
                  maxHeight: 36,
                }}
              >
                <PriceChip 
                  icon={getCurrencyInfo(pack.currency).icon} 
                  label={`${pack.price} ${getCurrencyInfo(pack.currency).text}`}
                  sx={{
                    ...(getCurrencyInfo(pack.currency).color && {
                      '& .MuiChip-icon': {
                        color: getCurrencyInfo(pack.currency).color,
                      },
                    }),
                  }}
                />
                {pack.is_limited && (
                  <Chip
                    icon={<LockIcon />}
                    label={`Осталось: ${(pack.max_quantity || 0) - (pack.sold_quantity || 0)}`}
                    sx={{
                      background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                      '& .MuiChip-label': {
                        padding: '2px 6px',
                      },
                    }}
                  />
                )}
              </Box>
              <Box sx={{ flex: 1 }} /> {/* Spacer to push button down */}
              <Button
                variant='outlined'
                fullWidth
                disabled={!!disabled || !!loading || !!isSoldOut}
                onClick={handleBuyClick}
                sx={{
                  borderColor: '#d0bcff',
                  color: '#d0bcff',
                  fontWeight: 500,
                  borderRadius: 'var(--main-border-radius)',
                  py: 1,
                  fontSize: '0.85rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9c64f2',
                    backgroundColor: 'rgba(208, 188, 255, 0.1)',
                  },
                  '&:disabled': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'text.secondary',
                  },
                  minHeight: 40,
                  maxHeight: 40,
                  mt: 'auto',
                }}
              >
                {loading ? (
                  <CircularProgress size={16} />
                ) : isSoldOut ? (
                  'Закончился'
                ) : disabled ? (
                  `Недостаточно ${getCurrencyInfo(pack.currency).text}`
                ) : (
                  'Купить'
                )}
              </Button>
            </CardContent>
          </ExclusiveStyledCard>
        ) : (
      <StyledCard
        onClick={handleViewDetails}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Все по 1000 */}
        {/* <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.85)', borderRadius: 'var(--main-border-radius)', px: 1.5, py: 0.5, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <PercentIcon sx={{ color: '#7c3aed', fontSize: 20, mr: 1 }} />
          <Typography variant="subtitle2" sx={{ color: '#222', fontWeight: 700, fontSize: '0.95rem' }}>Все по 1000</Typography>
        </Box> */}
        <PackImage>
          {pack.image_path ? (
            <img
              src={pack.image_path}
              alt={pack.display_name}
              width='100%'
              height='100%'
            />
          ) : (
            <ItemContainer>
              {sideItems[0] && (
                <SideItem>
                  <Tooltip
                    title={`${sideItems[0].item_name} (${getRarityLabel(sideItems[0].rarity)})`}
                  >
                    <ItemImage
                      src={`/inventory/pack/${pack.id}/${sideItems[0].item_name}`}
                      alt={sideItems[0].item_name}
                    />
                  </Tooltip>
                </SideItem>
              )}
              <MainItem>
                {mainItem ? (
                  <Tooltip
                    title={`${mainItem.item_name} (${getRarityLabel(mainItem.rarity)})`}
                  >
                    <ItemImage
                      src={`/inventory/pack/${pack.id}/${mainItem.item_name}`}
                      alt={mainItem.item_name}
                    />
                  </Tooltip>
                ) : (
                  <Typography variant='body2' color='text.secondary'>
                    ???
                  </Typography>
                )}
              </MainItem>
              {sideItems[1] && (
                <SideItem>
                  <Tooltip
                    title={`${sideItems[1].item_name} (${getRarityLabel(sideItems[1].rarity)})`}
                  >
                    <ItemImage
                      src={`/inventory/pack/${pack.id}/${sideItems[1].item_name}`}
                      alt={sideItems[1].item_name}
                    />
                  </Tooltip>
                </SideItem>
              )}
            </ItemContainer>
          )}

          {/* Показываем предметы при наведении */}
          {showItems && packContents.length > 0 && (
            <ItemPreview>
              <Box
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {packContents.slice(0, 6).map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 37.5,
                      height: 37.5,
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      backgroundImage: item.background_url ? `url(${item.background_url})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <img
                      src={`/inventory/pack/${pack.id}/${item.item_name}`}
                      alt={item.item_name}
                      width='75%'
                      height='75%'
                      style={{
                        position: 'relative',
                        zIndex: 3,
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                ))}
                {packContents.length > 6 && (
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary' }}
                  >
                    +{packContents.length - 6}
                  </Typography>
                )}
              </Box>
            </ItemPreview>
          )}
        </PackImage>

        <CardContent
          sx={{
            p: 2,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
          }}
        >
          <Typography
            variant='h6'
            component='h3'
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
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {pack.display_name}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
              mb: 2,
              textAlign: 'center',
              fontSize: '0.85rem',
              flex: '0 0 40px',
              minHeight: 40,
              maxHeight: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {truncateDescription(pack.description)}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              gap: 1,
              flexWrap: 'wrap',
              minHeight: 36,
              maxHeight: 36,
            }}
          >
            <PriceChip 
              icon={getCurrencyInfo(pack.currency).icon} 
              label={`${pack.price} ${getCurrencyInfo(pack.currency).text}`}
              sx={{
                ...(getCurrencyInfo(pack.currency).color && {
                  '& .MuiChip-icon': {
                    color: getCurrencyInfo(pack.currency).color,
                  },
                }),
              }}
            />
            {pack.is_limited && (
              <Chip
                icon={<LockIcon />}
                label={`Осталось: ${(pack.max_quantity || 0) - (pack.sold_quantity || 0)}`}
                sx={{
                  background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                  '& .MuiChip-label': {
                    padding: '2px 6px',
                  },
                }}
              />
            )}
          </Box>
          <Box sx={{ flex: 1 }} /> {/* Spacer to push button down */}
          <Button
            variant='outlined'
            fullWidth
            disabled={!!disabled || !!loading || !!isSoldOut}
            onClick={handleBuyClick}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'text.primary',
              fontWeight: 500,
              borderRadius: 'var(--main-border-radius)',
              py: 1,
              fontSize: '0.85rem',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
              },
              '&:disabled': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'text.secondary',
              },
              minHeight: 40,
              maxHeight: 40,
              mt: 'auto',
            }}
          >
            {loading ? (
              <CircularProgress size={16} />
            ) : isSoldOut ? (
              'Закончился'
            ) : disabled ? (
              `Недостаточно ${getCurrencyInfo(pack.currency).text}`
            ) : (
              'Купить'
            )}
          </Button>
        </CardContent>
      </StyledCard>
        )}
    </motion.div>
    </>
  );
};

export default PackCard;
