import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  InputAdornment,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { 
  Diamond as DiamondIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnequippedIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import InfoBlock from '../../../../UIKIT/InfoBlock';
import StyledTabs from '../../../../UIKIT/StyledTabs';
import ItemInfoModal from './ItemInfoModal';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

const ItemImage = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  margin: '0 auto 16px',
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 'inherit',
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  fontWeight: 700,
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
    fontSize: '0.8rem',
    '& .MuiChip-label': {
      padding: '2px 8px',
    },
  };
});

const SuggestionsContainer = styled(Box)(() => ({
  backgroundColor: 'rgba(20, 20, 20, 0.4)',
  backdropFilter: 'blur(5px)',
  borderRadius: 8,
  marginBottom: 24,
  maxHeight: 200,
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

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedItemForTransfer, setSelectedItemForTransfer] = useState(null);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [userSearch, setUserSearch] = useState({
    loading: false,
    exists: false,
    suggestions: []
  });
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  const debounceTimerRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInventory();
      fetchUserPoints();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/my-inventory');
      const data = await response.json();
      
      if (data.success) {
        setInventory(data.items);
      } else {
        setError('Ошибка загрузки инвентаря');
      }
    } catch (err) {
      setError('Ошибка сети');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleEquipItem = async (itemId) => {
    try {
      const response = await fetch(`/api/inventory/equip/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchInventory(); // Обновляем инвентарь
      } else {
        showNotification(data.message || 'Ошибка надевания предмета');
      }
    } catch (err) {
      showNotification('Ошибка сети', 'error');
      console.error('Error equipping item:', err);
    }
  };

  const handleUnequipItem = async (itemId) => {
    try {
      const response = await fetch(`/api/inventory/unequip/${itemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchInventory(); // Обновляем инвентарь
      } else {
        showNotification(data.message || 'Ошибка снятия предмета');
      }
    } catch (err) {
      showNotification('Ошибка сети', 'error');
      console.error('Error unequipping item:', err);
    }
  };

  const handleTransferItem = (item) => {
    setSelectedItemForTransfer(item);
    setRecipientUsername('');
    setTransferError('');
    setTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setTransferModalOpen(false);
    setSelectedItemForTransfer(null);
    setRecipientUsername('');
    setTransferError('');
    setUserSearch({
      loading: false,
      exists: false,
      suggestions: []
    });
    setSelectedRecipientId(null);
  };

  const searchUser = (query) => {
    setUserSearch(prev => ({...prev, loading: true}));
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const url = `/api/search/recipients?query=${encodeURIComponent(query)}`;
      
      axios.get(url)
        .then(response => {
          if (response.data && response.data.users && response.data.users.length > 0) {
            const exactMatch = response.data.users.find(u => 
              u.username.toLowerCase() === query.toLowerCase()
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
          console.error('Error searching for user:', error);
          setUserSearch(prev => ({
            ...prev,
            loading: false,
            exists: false,
            suggestions: [],
          }));
          setSelectedRecipientId(null);
        });
    }, 300); 
  };

  const handleUsernameChange = (e) => {
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

  const selectSuggestion = (username, userId) => {
    setRecipientUsername(username);
    setSelectedRecipientId(userId);
    setUserSearch(prev => ({
      ...prev,
      loading: false,
      exists: true,
      suggestions: []
    }));
  };

  const handleConfirmTransfer = async () => {
    if (!recipientUsername.trim()) {
      setTransferError('Введите имя пользователя');
      return;
    }

    if (!selectedRecipientId) {
      setTransferError('Пользователь не найден');
      return;
    }

    if (userPoints < 5000) {
      setTransferError('Недостаточно баллов для передачи (требуется 5000)');
      return;
    }

    setTransferLoading(true);
    setTransferError('');

    try {
      const response = await fetch(`/api/inventory/transfer/${selectedItemForTransfer.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_username: recipientUsername.trim()
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUserPoints(data.remaining_points);
        handleCloseTransferModal();
        fetchInventory(); // Обновляем инвентарь
        showNotification(data.message);
      } else {
        setTransferError(data.message || 'Ошибка передачи предмета');
      }
    } catch (err) {
      setTransferError('Ошибка сети');
      console.error('Error transferring item:', err);
    } finally {
      setTransferLoading(false);
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return <DiamondIcon sx={{ fontSize: 16 }} />;
      case 'epic':
        return <StarIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getRarityColor = (rarity) => {
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

  const getRarityLabel = (rarity) => {
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

  const filteredItems = activeTab === 0 
    ? inventory 
    : activeTab === 1 
    ? inventory.filter(item => item.is_equipped)
    : inventory.filter(item => !item.is_equipped);

  const tabs = [
    {
      value: 0,
      label: `Все (${inventory.length})`
    },
    {
      value: 1,
      label: `Надетые (${inventory.filter(item => item.is_equipped).length})`
    },
    {
      value: 2,
      label: `Не надетые (${inventory.filter(item => !item.is_equipped).length})`
    }
  ];

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

  if (!user) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography variant="h5">
            Необходимо авторизоваться для просмотра инвентаря
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <StyledCard>
          <CardContent>
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
            <Button 
              onClick={fetchInventory} 
              variant="contained" 
              sx={{ mt: 2, display: 'block', mx: 'auto' }}
            >
              Попробовать снова
            </Button>
          </CardContent>
        </StyledCard>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <InfoBlock
        title="Мой Инвентарь"
        description="Лимитированные вещи в коннекте - коллекционные предметы, которые можно получить из паков и сундуков"
        styleVariant="dark"
        sx={{ 
          textAlign: 'center',
          mb: 1,
          '& .MuiTypography-h5': {
            textAlign: 'center',
            fontWeight: 600
          },
          '& .MuiTypography-body2': {
            textAlign: 'center',
            opacity: 0.8
          }
        }}
      />

      <Box sx={{ mb: 1 }}>
        <StyledTabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          tabs={tabs}
          variant="standard"
          centered
          fullWidth
        />
      </Box>

      {filteredItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" mb={2}>
            {activeTab === 0 
              ? 'У вас пока нет предметов в инвентаре'
              : activeTab === 1 
              ? 'У вас нет надетых предметов'
              : 'У вас нет ненадетых предметов'
            }
          </Typography>
          {activeTab === 0 && (
            <Button 
              variant="contained"
              href="/economic/packs"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              Купить Пачки
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          '& .MuiGrid-item': {
            flex: '0 0 calc(25% - 12px)',
            maxWidth: 'calc(25% - 12px)',
            minWidth: 'calc(25% - 12px)',
            margin: '6px !important',
            '@media (max-width: 768px)': {
              flex: '0 0 calc(50% - 12px)',
              maxWidth: 'calc(50% - 12px)',
              minWidth: 'calc(50% - 12px)',
            }
          }
        }}>
          {filteredItems.map((item) => (
            <Grid item key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <StyledCard>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <ItemImage>
                      <img 
                        src={item.image_url}
                        alt={item.item_name}
                        onError={(e) => {
                          console.error(`Failed to load image: ${item.image_url}`);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded image: ${item.image_url}`);
                        }}
                      />
                    </ItemImage>

                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        fontSize: '1rem'
                      }}
                    >
                      {item.item_name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <RarityChip
                        rarity={item.rarity || 'common'}
                        label={getRarityLabel(item.rarity || 'common')}
                        icon={getRarityIcon(item.rarity || 'common')}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                      <Chip
                        icon={item.is_equipped ? <CheckCircleIcon /> : <UnequippedIcon />}
                        label={item.is_equipped ? 'Надет' : 'Не надет'}
                        size="small"
                        sx={{
                          background: item.is_equipped 
                            ? 'rgba(76, 175, 80, 0.2)' 
                            : 'rgba(208, 188, 255, 0.1)',
                          color: item.is_equipped ? '#4caf50' : 'primary.main',
                          border: item.is_equipped 
                            ? '1px solid rgba(76, 175, 80, 0.3)' 
                            : '1px solid rgba(208, 188, 255, 0.3)',
                        }}
                      />
                    </Box>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        display: 'block',
                        mb: 2
                      }}
                    >
                      Получен: {new Date(item.obtained_at).toLocaleDateString()}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => item.is_equipped 
                          ? handleUnequipItem(item.id) 
                          : handleEquipItem(item.id)
                        }
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
                        {item.is_equipped ? 'Снять' : 'Надеть'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<SendIcon />}
                        onClick={() => handleTransferItem(item)}
                        disabled={userPoints < 5000}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'text.primary',
                          fontSize: '0.8rem',
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
                        Передать
                      </Button>
                    </Box>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Модалка передачи предмета */}
      <Dialog
        open={transferModalOpen}
        onClose={handleCloseTransferModal}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth <= 768}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: window.innerWidth <= 768 ? 0 : 1,
            '@media (max-width: 768px)': {
              margin: 0,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'text.primary',
          pb: 1
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Передать предмет
          </Typography>
          <IconButton
            onClick={handleCloseTransferModal}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 0 }}>
          {selectedItemForTransfer && (
            <>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <ItemImage sx={{ width: 100, height: 100, mb: 2 }}>
                  <img 
                    src={selectedItemForTransfer.image_url}
                    alt={selectedItemForTransfer.item_name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </ItemImage>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedItemForTransfer.item_name}
                </Typography>
                
                <RarityChip
                  rarity={selectedItemForTransfer.rarity || 'common'}
                  label={getRarityLabel(selectedItemForTransfer.rarity || 'common')}
                  icon={getRarityIcon(selectedItemForTransfer.rarity || 'common')}
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
    </StyledContainer>
  );
};

export default InventoryPage; 