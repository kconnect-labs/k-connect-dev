import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Public as PublicIcon,
  EmojiEmotions as EmojiIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useMessenger } from '../../contexts/MessengerContext';
import axios from 'axios';

// API URL для мессенджера
const API_URL = 'https://k-connect.ru/apiMes';

// Стили в вашем стиле
const cardStyles = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  color: 'inherit'
};

const buttonStyles = {
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: 'inherit',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
  }
};

const StickerPackModal = ({ open, onClose, packId, stickerId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sessionKey, isChannel } = useMessenger();
  
  const [packData, setPackData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);

  // Загрузка данных о стикерпаке
  const loadPackData = async () => {
    if (!packId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Получаем детальную информацию о паке через новый API
      const response = await axios.get(`${API_URL}/messenger/sticker-packs/${packId}/public`);
      
      if (response.data.success) {
        const pack = response.data.pack;
        setPackData(pack);
        
        // Проверяем, установлен ли пак у пользователя
        if (sessionKey) {
          try {
            const myPacksResponse = await axios.get(`${API_URL}/messenger/sticker-packs/my`, {
              headers: {
                'Authorization': `Bearer ${sessionKey}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (myPacksResponse.data.success) {
              const installedPacks = myPacksResponse.data.packs || [];
              setIsInstalled(installedPacks.some(p => p.id === packId));
            }
          } catch (e) {
            console.log('Error checking installed packs:', e);
          }
        }
      } else {
        setError(response.data.error || 'Стикерпак не найден');
      }
    } catch (error) {
      console.error('Error loading pack data:', error);
      setError('Ошибка загрузки стикерпака');
    } finally {
      setLoading(false);
    }
  };

  // Установка стикерпака
  const handleInstallPack = async () => {
    if (!sessionKey || !packData || isChannel) return;
    
    try {
      setInstalling(true);
      setError('');
      
      const response = await axios.post(`${API_URL}/messenger/sticker-packs/${packData.id}/install`, {}, {
        headers: {
          'Authorization': `Bearer ${sessionKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccess('Стикерпак добавлен в вашу коллекцию!');
        setIsInstalled(true);
        
        // Закрываем модалку через 1.5 секунды
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(response.data.error || 'Ошибка установки стикерпака');
      }
    } catch (error) {
      console.error('Error installing pack:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Войдите в систему.');
      } else {
        setError('Ошибка установки стикерпака');
      }
    } finally {
      setInstalling(false);
    }
  };

  useEffect(() => {
    if (open && packId) {
      loadPackData();
    }
  }, [open, packId]);

  const handleClose = () => {
    setError('');
    setSuccess('');
    setPackData(null);
    setIsInstalled(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ 
        sx: {
          ...cardStyles,
          minHeight: isMobile ? '100vh' : '500px'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Стикерпак
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={cardStyles}>
            {error}
          </Alert>
        ) : packData ? (
          <Box>
            {/* Информация о стикерпаке */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {packData.name}
              </Typography>
              
              {packData.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {packData.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  size="small"
                  icon={<PublicIcon />}
                  label="Публичный"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${packData.sticker_count || packData.stickers?.length || 0} стикеров`}
                  variant="outlined"
                />
                {packData.owner_name && (
                  <Chip
                    size="small"
                    icon={<PersonIcon />}
                    label={packData.owner_name}
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>

            {/* Алерты */}
            {success && (
              <Alert severity="success" sx={{ mb: 2, ...cardStyles }}>
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, ...cardStyles }}>
                {error}
              </Alert>
            )}

            {/* Сетка стикеров */}
            {packData.stickers && packData.stickers.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Стикеры в паке
                </Typography>
                <Grid container spacing={1}>
                  {packData.stickers.map((sticker) => (
                    <Grid item xs={4} sm={3} key={sticker.id}>
                      <Box
                        sx={{
                          ...cardStyles,
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          border: sticker.id === stickerId ? '2px solid #2196F3' : cardStyles.border,
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        <img
                          src={sticker.url}
                          alt={sticker.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <EmojiIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  В этом стикерпаке нет стикеров
                </Typography>
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} sx={buttonStyles}>
          Закрыть
        </Button>
        
        {packData && sessionKey && !isChannel && (
          <Button
            onClick={handleInstallPack}
            variant="contained"
            disabled={installing || isInstalled}
            startIcon={installing ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{
              ...buttonStyles,
              ...(isInstalled ? {} : {
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              })
            }}
          >
            {installing ? 'Добавляется...' : isInstalled ? 'Уже добавлен' : 'Добавить стикерпак'}
          </Button>
        )}
        
        {!sessionKey && (
          <Button
            onClick={() => window.location.href = '/login'}
            variant="contained"
            sx={{
              ...buttonStyles,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            Войти для добавления
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StickerPackModal; 