import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Alert,
  Avatar,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnequippedIcon,
  Search as SearchIcon,
  Upgrade as UpgradeIcon,
  Star as StarIcon,
  Store as StoreIcon,
  RemoveShoppingCart as RemoveFromMarketIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import BallsIcon from './BallsIcon';
import MCoinIcon from './MCoinIcon';
import CurrencyToggle from './CurrencyToggle';
import axios from 'axios';
import {
  GlowEffect,
  AnimatedSparkle,
  AnimatedStar,
  EFFECTS_CONFIG,
  extractDominantColor,
  getFallbackColor,
  useUpgradeEffects,
} from './upgradeEffectsConfig';
import { InventoryItem, ItemAction } from './types';
// import { useBackgroundGradients } from './useBackgroundGradients';
// import { getBackgroundGradient, createTwoCirclePattern } from './utils';

// Utility to check if item is overlay item (levels 2, 3, 4)
const isOverlayItem = (item: InventoryItem) => {
  const upgradeable = String(item.upgradeable);
  return upgradeable === '2' || upgradeable === '3' || upgradeable === '4';
};

interface UpgradeEffectsProps {
  item: InventoryItem;
  children: React.ReactNode;
}

interface UserSuggestion {
  id: number;
  username: string;
  name: string;
  photo?: string;
}

const UpgradeEffects = ({ item, children }: UpgradeEffectsProps) => {
  const { dominantColor, isUpgraded } = useUpgradeEffects(item);

  // Убираем эффекты для улучшенных предметов, чтобы не мешали скроллу
  return <>{children}</>;
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    borderRadius: 16,
    overflow: 'hidden',
    width: 400,
    height: '80vh', // Уменьшил с 90vh до 80vh
    maxWidth: 'none',
    maxHeight: 'none',
    '@media (max-width: 768px)': {
      margin: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: 0,
    },
  },
}));

const ItemImage = styled(Box)(({ theme }) => ({
  width: 200, // Уменьшил с 250 до 200
  height: 200, // Уменьшил с 250 до 200
  borderRadius: 'var(--main-border-radius) !important', // Уменьшил с 16 до 12
  background: 'var(--theme-background, rgba(255, 255, 255, 0.1))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  margin: '0 auto 16px', // Уменьшил отступ с 24px до 16px
  overflow: 'hidden',
  position: 'relative',
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
    fontSize: '0.75rem', // Уменьшил с 0.9rem до 0.75rem
    height: '24px', // Добавил фиксированную высоту
    '& .MuiChip-label': {
      padding: '2px 8px', // Уменьшил отступы с 4px 12px до 2px 8px
    },
    '& .MuiChip-icon': {
      fontSize: '0.875rem', // Уменьшил размер иконки
    },
  };
});

const SuggestionsContainer = styled(Box)(() => ({
  backgroundColor: 'var(--theme-background, rgba(20, 20, 20, 0.4))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(5px))',
  borderRadius: 8,
  marginBottom: 16,
  maxHeight: 150,
  overflow: 'auto',
}));

const SuggestionItem = styled(Box)(() => ({
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'var(--theme-background, rgba(40, 40, 40, 0.4))',
  },
}));

const UserAvatar = styled(Avatar)(() => ({
  width: 32,
  height: 32,
  fontSize: 14,
  marginRight: 12,
  backgroundColor: '#444444',
}));

const MarketPriceChip = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 6, // Уменьшил с 8 до 6
  right: 6, // Уменьшил с 8 до 6
  background: 'var(--theme-background, rgba(0, 0, 0, 0.7))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(5px))',
  borderRadius: 'var(--small-border-radius)', // Уменьшил с 20px до 16px
  padding: '4px 8px', // Уменьшил отступы с 6px 12px до 4px 8px
  display: 'flex',
  alignItems: 'center',
  gap: '3px', // Уменьшил с 4px до 3px
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.75rem', // Уменьшил с 0.9rem до 0.75rem
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  zIndex: 2,
}));

const KBallsIcon = styled('img')({
  width: '12px', // Уменьшил с 16px до 12px
  height: '12px', // Уменьшил с 16px до 12px
  marginRight: '3px', // Уменьшил с 4px до 3px
});

interface ItemInfoModalProps {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  loading?: boolean;
  error?: string;
  readOnly?: boolean;
  userPoints: number;
  onItemUpdate?: (updatedItem: InventoryItem, action: ItemAction) => void;
  onTransferSuccess?: (itemId: number) => void;
}

const ItemInfoModal = ({
  open,
  onClose,
  item,
  userPoints,
  onItemUpdate,
  onTransferSuccess,
}: ItemInfoModalProps) => {
  // const { getGradient, getItemId, getGradientData } = useBackgroundGradients();
  
  // Получаем corner_color для фона модалки
  // const gradientData = item?.background_id ? getGradientData(item.background_id) : null;
  const cornerColor = '#974835'; // fallback цвет
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeConfirmOpen, setUpgradeConfirmOpen] = useState(false);
  const [userSearch, setUserSearch] = useState<{
    loading: boolean;
    exists: boolean;
    suggestions: UserSuggestion[];
  }>({
    loading: false,
    exists: false,
    suggestions: [],
  });
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(
    null
  );
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'points' | 'mcoin'>('points');
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [recycleConfirmOpen, setRecycleConfirmOpen] = useState(false);
  const [recycleLoading, setRecycleLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTransferModalOpen(false);
      setRecipientUsername('');
      setTransferError('');
      setUserSearch({ loading: false, exists: false, suggestions: [] });
      setSelectedRecipientId(null);
    }
  }, [open]);

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <DiamondIcon sx={{ fontSize: '0.875rem' }} />;
      case 'epic':
        return <StarIcon sx={{ fontSize: '0.875rem' }} />;
      case 'rare':
        return <StarIcon sx={{ fontSize: '0.875rem' }} />;
      default:
        return null;
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Обычный';
      case 'rare':
        return 'Редкий';
      case 'epic':
        return 'Эпический';
      case 'legendary':
        return 'Легендарный';
      default:
        return 'Обычный';
    }
  };

  const handleEquipItem = async () => {
    if (!item) return;
    try {
      const response = await fetch(`/api/inventory/equip/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showNotification(data.message);

        // Создаем обновленный предмет
        const updatedItem: InventoryItem = {
          ...item,
          is_equipped: true,
        };

        // Вызываем onItemUpdate с обновленным предметом
        if (onItemUpdate) {
          onItemUpdate(updatedItem, 'equip');
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при надевании предмета', 'error');
    }
  };

  const handleUnequipItem = async () => {
    if (!item) return;
    try {
      const response = await fetch(`/api/inventory/unequip/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showNotification(data.message);

        // Создаем обновленный предмет
        const updatedItem: InventoryItem = {
          ...item,
          is_equipped: false,
        };

        // Вызываем onItemUpdate с обновленным предметом
        if (onItemUpdate) {
          onItemUpdate(updatedItem, 'unequip');
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при снятии предмета', 'error');
    }
  };

  const handleUpgradeItem = async () => {
    if (!item || !item.upgradeable || item.upgrade_level >= 1) {
      return;
    }

    setUpgradeConfirmOpen(false);
    try {
      setUpgradeLoading(true);
      const response = await fetch(`/api/inventory/upgrade/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        showNotification(data.message);

        // Создаем обновленный предмет
        const updatedItem: InventoryItem = {
          ...item,
          upgrade_level: data.upgrade_level,
        };

        // Вызываем onItemUpdate с обновленным предметом
        if (onItemUpdate) {
          onItemUpdate(updatedItem, 'upgrade');
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при улучшении предмета', 'error');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleTransferItem = () => {
    setRecipientUsername('');
    setTransferError('');
    setTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setRecipientUsername('');
    setTransferError('');
    setUserSearch(prev => ({
      loading: false,
      exists: false,
      suggestions: [],
    }));
    setSelectedRecipientId(null);
  };

  const searchUser = (query: string) => {
    setUserSearch(prev => ({ ...prev, loading: true }));
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      const url = `/api/search/recipients?query=${encodeURIComponent(query)}`;
      axios
        .get(url)
        .then(response => {
          if (
            response.data &&
            response.data.users &&
            response.data.users.length > 0
          ) {
            const exactMatch = response.data.users.find(
              (u: any) => u.username.toLowerCase() === query.toLowerCase()
            );
            if (exactMatch) {
              setSelectedRecipientId(exactMatch.id);
            } else {
              setSelectedRecipientId(null);
            }
            setUserSearch(prev => ({
              ...prev,
              loading: false,
              exists: !!exactMatch,
              suggestions: response.data.users.slice(0, 3),
            }));
          } else {
            setUserSearch(prev => ({
              ...prev,
              loading: false,
              exists: false,
              suggestions: [],
            }));
            setSelectedRecipientId(null);
          }
        })
        .catch(error => {
          setUserSearch(prev => ({
            ...prev,
            loading: false,
            exists: false,
            suggestions: [],
          }));
          setSelectedRecipientId(null);
        });
    }, 300) as NodeJS.Timeout;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setRecipientUsername(username);
    if (username.trim()) {
      searchUser(username.trim());
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setUserSearch(prev => ({
        ...prev,
        loading: false,
        exists: false,
        suggestions: [],
      }));
      setSelectedRecipientId(null);
    }
  };

  const selectSuggestion = (username: string, userId: number) => {
    setRecipientUsername(username);
    setSelectedRecipientId(userId);
    setUserSearch(prev => ({
      ...prev,
      loading: false,
      exists: true,
      suggestions: [],
    }));
  };

  const handleConfirmTransfer = async () => {
    if (
      !item ||
      !recipientUsername.trim() ||
      !selectedRecipientId ||
      userPoints < 5000
    ) {
      return;
    }

    setTransferLoading(true);
    setTransferError('');
    try {
      const response = await fetch(`/api/inventory/transfer/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: selectedRecipientId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification(data.message);

        // Вызываем onTransferSuccess для мгновенного удаления предмета
        if (typeof onTransferSuccess === 'function') {
          onTransferSuccess(item.id);
        }

        if (typeof onClose === 'function') onClose();
      } else {
        setTransferError(data.message || 'Ошибка передачи предмета');
      }
    } catch (error) {
      setTransferError('Ошибка при передаче предмета');
    } finally {
      setTransferLoading(false);
    }
  };

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleListOnMarketplace = async () => {
    if (!item) return;
    try {
      setMarketplaceLoading(true);
      const response = await axios.post(`/api/marketplace/list/${item.id}`, {
        price: parseInt(price),
        currency: currency,
      });

      if (response.data.success) {
        showNotification('Предмет выставлен на маркетплейс', 'success');

        // Создаем обновленный предмет
        const updatedItem: InventoryItem = {
          ...item,
          marketplace: {
            id: response.data.listing_id,
            status: 'active',
            price: parseInt(price),
          },
        };

        // Вызываем onItemUpdate с обновленным предметом
        if (onItemUpdate) {
          onItemUpdate(updatedItem, 'marketplace_list');
        }

        setMarketplaceModalOpen(false);
        setPrice('');
      }
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || 'Ошибка при выставлении предмета',
        'error'
      );
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleRemoveFromMarketplace = async () => {
    if (!item?.marketplace) return;
    try {
      setMarketplaceLoading(true);
      const response = await axios.post(
        `/api/marketplace/cancel/${item.marketplace.id}`
      );

      if (response.data.success) {
        showNotification('Предмет снят с маркетплейса', 'success');

        // Создаем обновленный предмет
        const updatedItem: InventoryItem = {
          ...item,
          marketplace: null,
        };

        // Вызываем onItemUpdate с обновленным предметом
        if (onItemUpdate) {
          onItemUpdate(updatedItem, 'marketplace_remove');
        }
      }
    } catch (error: any) {
      showNotification(
        error.response?.data?.message || 'Ошибка при снятии предмета',
        'error'
      );
    } finally {
      setMarketplaceLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!item) return;
    const origin = (typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru';
    const url = `${origin}/item/${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('Скопировано!');
      setTimeout(() => setCopyStatus(''), 1500);
    });
  };

  const handleRecycleItem = async () => {
    if (!item) return;
    setRecycleConfirmOpen(false);
    try {
      setRecycleLoading(true);
      const response = await fetch(`/api/inventory/recycle/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        showNotification(data.message);

        // Вызываем onTransferSuccess для мгновенного удаления предмета
        if (typeof onTransferSuccess === 'function') {
          onTransferSuccess(item.id);
        }

        if (typeof onClose === 'function') onClose();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при утилизации предмета', 'error');
    } finally {
      setRecycleLoading(false);
    }
  };

  if (!item) return null;

  return (
    <>
      <StyledDialog 
        open={open} 
        onClose={onClose} 
        maxWidth='sm' 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            background: cornerColor,
            border: `1px solid ${cornerColor}4D`,
          }
        }}
      >
        <UpgradeEffects item={item}>
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              pb: 1,
            }}
          >
            <Box component='div' sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
              Информация о предмете
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.1))',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: 0, overflow: 'auto', maxHeight: 'calc(80vh - 120px)' }}>
            <Box sx={{ mb: 2, textAlign: 'center' }}> {/* Уменьшил отступ с mb: 3 до mb: 2 */}
              <Box position='relative'>
                <Box
                  sx={{
                    width: 250,
                    height: 250,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    mb: 2,
                    margin: 'auto',
                    backgroundImage: item?.background_url ? `url(${item.background_url})` : 'none',
                  }}
                >
                  <img
                    src={item?.image_url}
                    alt={item?.item_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: 'inherit',
                      position: 'relative',
                      zIndex: 10,
                      display: 'block',
                      margin: 'auto',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  />
                                     {item?.marketplace?.status === 'active' && (
                     <MarketPriceChip>
                       <KBallsIcon src='/static/icons/KBalls.svg' alt='KBalls' />
                       {item.marketplace.price}
                     </MarketPriceChip>
                   )}
                 </Box>
               </Box>

              <Typography
                variant='h6' // Уменьшил с h5 до h6
                sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }} // Уменьшил отступ с mb: 2 до mb: 1
              >
                {item.item_name}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1, // Уменьшил с gap: 2 до gap: 1
                  mb: 2, // Уменьшил с mb: 3 до mb: 2
                }}
              >
                <RarityChip
                  rarity={item.rarity}
                  label={getRarityLabel(item.rarity)}
                  icon={getRarityIcon(item.rarity) || undefined}
                />
                {item.upgrade_level === 1 && (
                  <Chip
                    label='Улучшено'
                    color='success'
                    size='small'
                    sx={{ 
                      ml: 0.5, // Уменьшил с ml: 1 до ml: 0.5
                      fontWeight: 600,
                      fontSize: '0.7rem', // Добавил уменьшенный размер шрифта
                      height: '20px', // Добавил фиксированную высоту
                    }}
                  />
                )}
              </Box>

              <Box sx={{ mb: 2 }}> {/* Уменьшил отступ с mb: 3 до mb: 2 */}
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', mb: 0.5 }} // Уменьшил отступ с mb: 1 до mb: 0.5
                >
                  Пак: {item.pack_name}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', mb: 0.5 }} // Уменьшил отступ с mb: 1 до mb: 0.5
                >
                  Статус: {(isOverlayItem(item) || item.is_equipped) ? 
                    (isOverlayItem(item) && item.is_equipped ? 'Оверлей + Экипировано' : 
                     isOverlayItem(item) ? 'Оверлей' : 'Экипировано') 
                    : 'Не экипировано'}
                </Typography>
                {item.item_number && item.total_count && (
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary', mb: 0.5 }} // Уменьшил отступ с mb: 1 до mb: 0.5
                  >
                    Экземпляр: {item.item_number} из {item.total_count}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mt: 0.5, // Уменьшил с mt: 1 до mt: 0.5
                }}
              >
                <Button
                  size='small'
                  variant='text'
                  startIcon={<ContentCopyIcon fontSize='small' />}
                  onClick={handleCopyLink}
                  sx={{ minWidth: 0, px: 1, fontSize: '0.8rem' }} // Уменьшил шрифт с 0.85rem до 0.8rem
                >
                  {copyStatus || 'Скопировать'}
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              flexWrap: 'wrap',
              gap: 0.5,
              justifyContent: 'center',
              pb: 2,
              px: 2,
              '& .MuiButton-root': {
                marginLeft: '0px !important',
                minHeight: '40px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
              },
            }}
          >
            {!item.is_equipped ? (
              <Button
                variant='outlined'
                onClick={handleEquipItem}
                disabled={upgradeLoading}
                startIcon={
                  upgradeLoading ? <CircularProgress size={16} /> : null
                }
                fullWidth
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                  },
                }}
              >
                {isOverlayItem(item) ? 'Надеть в оверлей' : 'Экипировать'}
              </Button>
            ) : (
              <Button
                variant='outlined'
                onClick={handleUnequipItem}
                disabled={upgradeLoading}
                startIcon={
                  upgradeLoading ? <CircularProgress size={16} /> : null
                }
                fullWidth
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                  },
                }}
              >
                Снять
              </Button>
            )}
            {item.upgradeable && item.upgrade_level === 0 && (
              <Button
                variant='outlined'
                onClick={() => setUpgradeConfirmOpen(true)}
                disabled={
                  upgradeLoading ||
                  userPoints <
                    Math.floor(item.pack_price ? item.pack_price / 2 : 0)
                }
                startIcon={
                  upgradeLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <UpgradeIcon />
                  )
                }
                fullWidth
                sx={{
                  borderColor: 'rgba(255, 152, 0, 0.3)',
                  color: '#ff9800',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'rgba(255, 152, 0, 0.5)',
                    backgroundColor: 'var(--theme-background, rgba(255, 152, 0, 0.05))',
                  },
                }}
              >
                {upgradeLoading
                  ? 'Улучшение...'
                  : `Улучшить (${Math.floor(item.pack_price ? item.pack_price / 2 : 0)} очков)`}
              </Button>
            )}
            <Button
              variant='outlined'
              onClick={handleTransferItem}
              startIcon={<SendIcon />}
              fullWidth
              disabled={userPoints < 5000}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                },
                '&:disabled': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'text.secondary',
                },
              }}
            >
              Передать (5000 баллов)
            </Button>
            {!item?.is_equipped &&
              (item?.marketplace?.status === 'active' ? (
                <Button
                  variant='outlined'
                  color='error'
                  startIcon={<RemoveFromMarketIcon />}
                  onClick={handleRemoveFromMarketplace}
                  disabled={marketplaceLoading}
                  fullWidth
                  sx={{
                    '&:hover': {
                      backgroundColor: 'var(--theme-background, rgba(244, 67, 54, 0.05))',
                    },
                  }}
                >
                  {marketplaceLoading ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : (
                    'Снять с продажи'
                  )}
                </Button>
              ) : (
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<StoreIcon />}
                  onClick={() => setMarketplaceModalOpen(true)}
                  fullWidth
                  sx={{
                    '&:hover': {
                      backgroundColor: 'var(--theme-background, rgba(33, 150, 243, 0.05))',
                    },
                  }}
                >
                  Выставить на маркетплейс
                </Button>
              ))}
            <Button
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={() => setRecycleConfirmOpen(true)}
              disabled={recycleLoading}
              fullWidth
              sx={{
                borderColor: 'rgba(244, 67, 54, 0.3)',
                color: '#f44336',
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'rgba(244, 67, 54, 0.5)',
                  backgroundColor: 'var(--theme-background, rgba(244, 67, 54, 0.05))',
                },
              }}
            >
              {recycleLoading ? 'Утилизация...' : 'Утилизировать'}
            </Button>
          </DialogActions>
        </UpgradeEffects>
      </StyledDialog>

      {/* Модалка передачи предмета */}
      <Dialog
        open={transferModalOpen}
        onClose={handleCloseTransferModal}
        maxWidth='sm'
        fullWidth
        fullScreen={window.innerWidth <= 768}
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: window.innerWidth <= 768 ? 0 : 1,
            '@media (max-width: 768px)': {
              margin: 0,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'text.primary',
            pb: 1,
          }}
        >
          <Box component='div' sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Передать предмет
          </Box>
          <IconButton
            onClick={handleCloseTransferModal}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {item && (
            <>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <ItemImage
                  sx={{
                    width: 125,
                    height: 125,
                    mb: 2,
                    backgroundImage: item.background_url ? `url(${item.background_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative',
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    style={{ 
                      position: 'relative', 
                      zIndex: 10,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </ItemImage>
                <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
                  {item.item_name}
                </Typography>
                <RarityChip
                  rarity={item.rarity || 'common'}
                  label={getRarityLabel(item.rarity || 'common')}
                  icon={getRarityIcon(item.rarity || 'common') || undefined}
                  size='small'
                />
              </Box>
              <Alert severity='info' sx={{ mb: 3 }}>
                Стоимость передачи: 5000 баллов
              </Alert>
              {transferError && (
                <Alert severity='error' sx={{ mb: 3 }}>
                  {transferError}
                </Alert>
              )}
              <TextField
                fullWidth
                label='Имя пользователя получателя'
                value={recipientUsername}
                onChange={handleUsernameChange}
                placeholder='Введите username получателя'
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      {userSearch.loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      )}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.primary',
                  },
                }}
              />
              {userSearch.suggestions.length > 0 && !userSearch.exists && (
                <SuggestionsContainer>
                  <Box sx={{ p: 2, pb: 1 }}>
                    <Typography
                      variant='subtitle2'
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.85rem',
                      }}
                    >
                      Похожие пользователи:
                    </Typography>
                  </Box>
                  {userSearch.suggestions.map(user => (
                    <SuggestionItem
                      key={user.id}
                      onClick={() => selectSuggestion(user.username, user.id)}
                    >
                      <UserAvatar
                        src={
                          user.photo
                            ? `/static/uploads/avatar/${user.id}/${user.photo}`
                            : undefined
                        }
                        alt={user.username}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </UserAvatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 'bold' }}
                        >
                          {user.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          @{user.username}
                        </Typography>
                      </Box>
                    </SuggestionItem>
                  ))}
                </SuggestionsContainer>
              )}
              {userSearch.exists && selectedRecipientId && (
                <Box
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'var(--theme-background, rgba(40, 40, 40, 0.4))',
                    backdropFilter: 'var(--theme-backdrop-filter, blur(5px))',
                    borderRadius: 'var(--main-border-radius)',
                    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                  <Typography variant='body2'>
                    Получатель подтвержден: <strong>{recipientUsername}</strong>
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseTransferModal}
            sx={{
              color: 'text.secondary',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
              },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmTransfer}
            disabled={
              transferLoading ||
              !recipientUsername.trim() ||
              !selectedRecipientId ||
              userPoints < 5000
            }
            variant='contained'
            startIcon={
              transferLoading ? <CircularProgress size={16} /> : <SendIcon />
            }
            sx={{
              background: 'var(--theme-background, rgba(255, 255, 255, 0.1))',
              color: 'text.primary',
              fontWeight: 500,
              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
              '&:hover': {
                background: 'var(--theme-background, rgba(255, 255, 255, 0.15))',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:disabled': {
                background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                color: 'text.secondary',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {transferLoading ? 'Передача...' : 'Передать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка подтверждения улучшения */}
      <Dialog
        open={upgradeConfirmOpen}
        onClose={() => setUpgradeConfirmOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 600, pb: 1 }}>
          Вы уверены?
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant='body2'>
            Потратить {Math.floor(item.pack_price ? item.pack_price / 2 : 0)}{' '}
            очков на улучшение этого предмета?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUpgradeConfirmOpen(false)}
            color='secondary'
            size='small'
          >
            Нет
          </Button>
          <Button
            onClick={handleUpgradeItem}
            color='primary'
            size='small'
            disabled={upgradeLoading}
          >
            {upgradeLoading ? <CircularProgress size={16} /> : 'Да'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модалка подтверждения утилизации */}
      <Dialog
        open={recycleConfirmOpen}
        onClose={() => setRecycleConfirmOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            borderRadius: 'var(--main-border-radius)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            pb: 1,
            color: 'text.primary',
          }}
        >
          Утилизировать предмет?
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Вы получите{' '}
            {Math.floor(item.pack_price ? item.pack_price * 0.05 : 0)} баллов
            (5% от стоимости пака)
          </Typography>
          <Typography variant='body2' color='error'>
            Это действие нельзя отменить!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRecycleConfirmOpen(false)}
            color='inherit'
            sx={{ color: 'text.secondary' }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleRecycleItem}
            color='error'
            variant='contained'
            disabled={recycleLoading}
            startIcon={
              recycleLoading ? <CircularProgress size={16} /> : <DeleteIcon />
            }
          >
            {recycleLoading ? 'Утилизация...' : 'Утилизировать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Marketplace Modal */}
      <Dialog
        open={marketplaceModalOpen}
        onClose={() => {
          setMarketplaceModalOpen(false);
          setPrice('');
          setCurrency('points');
        }}
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            borderRadius: 'var(--main-border-radius)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          },
        }}
      >
        <DialogTitle>Выставить на маркетплейс</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' mb={2}>
            Укажите цену, за которую хотите продать предмет
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <CurrencyToggle
              value={currency}
              onChange={(value) => {
                if (value === 'points' || value === 'mcoin') {
                  setCurrency(value);
                }
              }}
              showAllOption={false}
            />
          </Box>
          
          <TextField
            key={`price-field-${currency}`} // Принудительный перерендер при изменении валюты
            fullWidth
            type='number'
            label='Цена'
            value={price}
            onChange={e => setPrice(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {currency === 'mcoin' ? (
                      <MCoinIcon sx={{ fontSize: 16, color: '#d0bcff' }} />
                    ) : (
                      <BallsIcon sx={{ fontSize: 16 }} />
                    )}
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setMarketplaceModalOpen(false);
              setPrice('');
              setCurrency('points');
            }}
            color='inherit'
          >
            Отмена
          </Button>
          <Button
            onClick={handleListOnMarketplace}
            variant='contained'
            color='primary'
            disabled={!price || marketplaceLoading}
          >
            {marketplaceLoading ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Выставить'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background:
              notification.severity === 'error'
                ? 'rgba(244, 67, 54, 0.9)'
                : notification.severity === 'warning'
                  ? 'rgba(255, 152, 0, 0.9)'
                  : notification.severity === 'info'
                    ? 'rgba(33, 150, 243, 0.9)'
                    : 'rgba(76, 175, 80, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--main-border-radius)',
            fontWeight: 500,
          },
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={
            notification.severity as 'success' | 'error' | 'warning' | 'info'
          }
          sx={{
            width: '100%',
            background: 'transparent',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ItemInfoModal;
