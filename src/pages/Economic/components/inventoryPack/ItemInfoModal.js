import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnequippedIcon,
  Search as SearchIcon,
  Upgrade as UpgradeIcon,
  Diamond as DiamondIcon,
  Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import {
  GlowEffect,
  AnimatedSparkle,
  AnimatedStar,
  EFFECTS_CONFIG,
  extractDominantColor,
  getFallbackColor,
  useUpgradeEffects
} from './upgradeEffectsConfig';

const UpgradeEffects = ({ item, children }) => {
  const { dominantColor, isUpgraded } = useUpgradeEffects(item);

  if (!isUpgraded) {
    return children;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <GlowEffect color={dominantColor} />
      {EFFECTS_CONFIG.sparkles.map((sparkle, idx) => (
        <AnimatedSparkle
          key={idx}
          color={dominantColor}
          delay={sparkle.delay}
          size={sparkle.size}
          sx={sparkle.position}
        />
      ))}
      {EFFECTS_CONFIG.stars.map((star, idx) => (
        <AnimatedStar
          key={idx}
          color={dominantColor}
          delay={star.delay}
          size={star.size}
          sx={star.position}
        />
      ))}
    </Box>
  );
};

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    width: 400,
    height: '66%',
    maxWidth: 'none',
    maxHeight: 'none',
    '@media (max-width: 768px)': {
      margin: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: 0,
    }
  }
}));

const ItemImage = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  margin: '0 auto 24px',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 'inherit',
  },
}));

const RarityChip = styled(Chip)(({ rarity, theme }) => {
  const colors = {
    common: { bg: '#95a5a6', color: '#fff' },
    rare: { bg: '#3498db', color: '#fff' },
    epic: { bg: '#9b59b6', color: '#fff' },
    legendary: { bg: '#f39c12', color: '#fff' },
  };
  
  return {
    background: colors[rarity]?.bg || colors.common.bg,
    color: colors[rarity]?.color || colors.common.color,
    fontWeight: 600,
    fontSize: '0.9rem',
    '& .MuiChip-label': {
      padding: '4px 12px',
    },
  };
});

const SuggestionsContainer = styled(Box)(() => ({
  backgroundColor: 'rgba(20, 20, 20, 0.4)',
  backdropFilter: 'blur(5px)',
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
    backgroundColor: 'rgba(40, 40, 40, 0.4)'
  }
}));

const UserAvatar = styled(Avatar)(() => ({
  width: 32,
  height: 32,
  fontSize: 14,
  marginRight: 12,
  backgroundColor: '#444444'
}));

const ItemInfoModal = ({ 
  open, 
  onClose, 
  item, 
  userPoints, 
  onItemUpdate,
  onTransferSuccess 
}) => {
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeConfirmOpen, setUpgradeConfirmOpen] = useState(false);
  const [userSearch, setUserSearch] = useState({
    loading: false,
    exists: false,
    suggestions: []
  });
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (!open) {
      setTransferModalOpen(false);
      setRecipientUsername('');
      setTransferError('');
      setUserSearch({ loading: false, exists: false, suggestions: [] });
      setSelectedRecipientId(null);
    }
  }, [open]);

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'legendary': return <DiamondIcon />;
      case 'epic': return <StarIcon />;
      case 'rare': return <StarIcon />;
      default: return null;
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Обычный';
      case 'rare': return 'Редкий';
      case 'epic': return 'Эпический';
      case 'legendary': return 'Легендарный';
      default: return 'Обычный';
    }
  };

  const handleEquipItem = async () => {
    try {
      const response = await fetch(`/api/inventory/equip/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        onItemUpdate();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при надевании предмета', 'error');
    }
  };

  const handleUnequipItem = async () => {
    try {
      const response = await fetch(`/api/inventory/unequip/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        onItemUpdate();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Ошибка при снятии предмета', 'error');
    }
  };

  const handleUpgradeItem = async () => {
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
        showNotification(data.message, 'success');
        onItemUpdate();
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
    setTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setRecipientUsername('');
    setTransferError('');
    setUserSearch({ loading: false, exists: false, suggestions: [] });
    setSelectedRecipientId(null);
  };

  const searchUser = async (query) => {
    if (query.length < 2) {
      setUserSearch({ loading: false, exists: false, suggestions: [] });
      return;
    }

    try {
      setUserSearch(prev => ({ ...prev, loading: true }));
      const response = await axios.get(`/api/user/search?q=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        const users = response.data.users;
        const exactMatch = users.find(user => 
          user.username.toLowerCase() === query.toLowerCase()
        );
        
        setUserSearch({
          loading: false,
          exists: !!exactMatch,
          suggestions: exactMatch ? [] : users.slice(0, 5)
        });
        
        if (exactMatch) {
          setSelectedRecipientId(exactMatch.id);
        }
      }
    } catch (error) {
      setUserSearch({ loading: false, exists: false, suggestions: [] });
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setRecipientUsername(value);
    setSelectedRecipientId(null);
    
    if (value.trim()) {
      searchUser(value.trim());
    } else {
      setUserSearch({ loading: false, exists: false, suggestions: [] });
    }
  };

  const selectSuggestion = (username, userId) => {
    setRecipientUsername(username);
    setSelectedRecipientId(userId);
    setUserSearch({ loading: false, exists: true, suggestions: [] });
  };

  const handleConfirmTransfer = async () => {
    if (!recipientUsername.trim() || !selectedRecipientId) {
      setTransferError('Выберите получателя');
      return;
    }

    try {
      setTransferLoading(true);
      setTransferError('');
      
      const response = await fetch(`/api/inventory/transfer/${item.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_username: recipientUsername
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(data.message, 'success');
        handleCloseTransferModal();
        onTransferSuccess();
        onClose();
      } else {
        setTransferError(data.message);
      }
    } catch (error) {
      setTransferError('Ошибка при передаче предмета');
    } finally {
      setTransferLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (!item) return null;

  return (
    <>
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <UpgradeEffects item={item}>
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Информация о предмете
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 0 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <ItemImage sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                transition: 'all 0.3s ease'
              }}>
                <img 
                  src={item.image_url}
                  alt={item.item_name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </ItemImage>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                {item.item_name}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                <RarityChip 
                  rarity={item.rarity} 
                  label={getRarityLabel(item.rarity)}
                  icon={getRarityIcon(item.rarity)}
                />
                {item.upgrade_level === 1 && (
                  <Chip label="Улучшено" color="success" size="small" sx={{ ml: 1, fontWeight: 600 }} />
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Пак: {item.pack_name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Статус: {item.is_equipped ? 'Экипировано' : 'Не экипировано'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {!item.is_equipped ? (
                  <Button
                    variant="outlined"
                    onClick={handleEquipItem}
                    disabled={upgradeLoading}
                    startIcon={upgradeLoading ? <CircularProgress size={16} /> : null}
                    fullWidth
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'text.primary',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Экипировать
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={handleUnequipItem}
                    disabled={upgradeLoading}
                    startIcon={upgradeLoading ? <CircularProgress size={16} /> : null}
                    fullWidth
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'text.primary',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Снять
                  </Button>
                )}

                {item.upgradeable && item.upgrade_level === 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setUpgradeConfirmOpen(true)}
                    disabled={upgradeLoading || userPoints < Math.floor(item.pack_price ? item.pack_price / 2 : 0)}
                    startIcon={upgradeLoading ? <CircularProgress size={16} /> : <UpgradeIcon />}
                    fullWidth
                    sx={{
                      borderColor: 'rgba(255, 152, 0, 0.3)',
                      color: '#ff9800',
                      fontWeight: 500,
                      '&:hover': {
                        borderColor: 'rgba(255, 152, 0, 0.5)',
                        backgroundColor: 'rgba(255, 152, 0, 0.05)',
                      },
                    }}
                  >
                    {upgradeLoading ? 'Улучшение...' : `Улучшить (${Math.floor(item.pack_price ? item.pack_price / 2 : 0)} очков)`}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={handleTransferItem}
                  startIcon={<SendIcon />}
                  fullWidth
                  disabled={userPoints < 5000}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'text.secondary',
                    },
                  }}
                >
                  Передать (5000 баллов)
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </UpgradeEffects>
      </StyledDialog>

      {/* Модалка передачи предмета */}
      <Dialog
        open={transferModalOpen}
        onClose={handleCloseTransferModal}
        maxWidth="sm"
        fullWidth
        PaperComponent={StyledDialog}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Передать предмет
          </Typography>
        </DialogTitle>
        
        <UpgradeEffects item={item}>
          <DialogContent sx={{ pt: 0 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <UpgradeEffects item={item}>
                <ItemImage sx={{ 
                  width: 80, 
                  height: 80, 
                  mb: 2,
                  transition: 'all 0.3s ease'
                }}>
                  <img 
                    src={item.image_url}
                    alt={item.item_name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </ItemImage>
              </UpgradeEffects>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {item.item_name}
              </Typography>
              
              <RarityChip
                rarity={item.rarity || 'common'}
                label={getRarityLabel(item.rarity || 'common')}
                icon={getRarityIcon(item.rarity || 'common')}
                size="small"
              />
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Стоимость передачи: 5000 баллов
            </Alert>

            {transferError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {transferError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Имя пользователя получателя"
              value={recipientUsername}
              onChange={handleUsernameChange}
              placeholder="Введите username получателя"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {userSearch.loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    )}
                  </InputAdornment>
                )
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
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    Похожие пользователи:
                  </Typography>
                </Box>
                {userSearch.suggestions.map((user) => (
                  <SuggestionItem
                    key={user.id}
                    onClick={() => selectSuggestion(user.username, user.id)}
                  >
                    <UserAvatar 
                      src={user.photo ? `/static/uploads/avatar/${user.id}/${user.photo}` : undefined}
                      alt={user.username}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </UserAvatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </SuggestionItem>
                ))}
              </SuggestionsContainer>
            )}

            {userSearch.exists && selectedRecipientId && (
              <Box sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: 'rgba(40, 40, 40, 0.4)', 
                backdropFilter: 'blur(5px)',
                borderRadius: 2,
                border: '1px solid rgba(60, 60, 60, 0.4)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <CheckCircleIcon sx={{ color: '#4CAF50', mr: 1 }} />
                <Typography variant="body2">
                  Получатель подтвержден: <strong>{recipientUsername}</strong>
                </Typography>
              </Box>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirmTransfer}
              disabled={transferLoading || !recipientUsername.trim() || !selectedRecipientId || userPoints < 5000}
              variant="contained"
              startIcon={transferLoading ? <CircularProgress size={16} /> : <SendIcon />}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'text.primary',
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'text.secondary',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {transferLoading ? 'Передача...' : 'Передать'}
            </Button>
          </DialogActions>
        </UpgradeEffects>
      </Dialog>

      {/* Модалка подтверждения улучшения */}
      <Dialog open={upgradeConfirmOpen} onClose={() => setUpgradeConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '1.1rem', fontWeight: 600, pb: 1 }}>Вы уверены?</DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Typography variant="body2">Потратить {Math.floor(item.pack_price ? item.pack_price / 2 : 0)} очков на улучшение этого предмета?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeConfirmOpen(false)} color="secondary" size="small">Нет</Button>
          <Button onClick={handleUpgradeItem} color="primary" size="small" disabled={upgradeLoading}>{upgradeLoading ? <CircularProgress size={16} /> : 'Да'}</Button>
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
            background: notification.severity === 'error' 
              ? 'rgba(244, 67, 54, 0.9)' 
              : notification.severity === 'warning'
              ? 'rgba(255, 152, 0, 0.9)'
              : notification.severity === 'info'
              ? 'rgba(33, 150, 243, 0.9)'
              : 'rgba(76, 175, 80, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            fontWeight: 500,
          }
        }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ 
            width: '100%',
            background: 'transparent',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ItemInfoModal; 