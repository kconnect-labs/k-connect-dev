import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  EmojiEmotions as StickerIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useMessenger } from '../../contexts/MessengerContext';
import axios from 'axios';

// API URL для мессенджера
const API_URL = 'https://k-connect.ru/apiMes';

const StickerPicker = ({ onStickerSelect, onClose, isOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sessionKey } = useMessenger();
  
  const [stickerPacks, setStickerPacks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const stickerGridRef = useRef(null);
  
  // Стили как в Телеграме
  const pickerStyles = {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    width: isMobile ? '100vw' : '320px',
    height: isMobile ? '50vh' : '400px',
    background: 'rgba(18, 18, 18, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: isMobile ? '16px 16px 0 0' : '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  // Загрузка стикерпаков
  const loadStickerPacks = useCallback(async () => {
    if (!sessionKey) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messenger/sticker-packs/my`, {
        headers: {
          'Authorization': `Bearer ${sessionKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setStickerPacks(response.data.packs || []);
      }
    } catch (error) {
      console.error('Error loading sticker packs:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    if (isOpen && sessionKey) {
      loadStickerPacks();
    }
  }, [isOpen, sessionKey, loadStickerPacks]);

  // Обработка клика по стикеру
  const handleStickerClick = (pack, sticker) => {
    onStickerSelect({
      pack_id: pack.id,
      sticker_id: sticker.id,
      name: sticker.name,
      emoji: sticker.emoji
    });
    onClose();
  };

  if (!isOpen) return null;

  const activePack = stickerPacks[activeTab];

  return (
    <Box sx={pickerStyles}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
          Стикеры
        </Typography>
        <IconButton 
          onClick={onClose} 
          size="small"
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Контент */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: 1 
          }}>
            <CircularProgress size={24} sx={{ color: 'white' }} />
          </Box>
        ) : stickerPacks.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: 1,
            gap: 2
          }}>
            <StickerIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              У вас пока нет стикерпаков
            </Typography>
          </Box>
        ) : (
          <>
            {/* Сетка стикеров */}
            <Box 
              ref={stickerGridRef}
              sx={{ 
                flex: 1, 
                overflowY: 'auto',
                p: 1,
                '&::-webkit-scrollbar': {
                  width: '4px'
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px'
                }
              }}
            >
              {activePack && activePack.stickers && (
                <Grid container spacing={0.5}>
                  {activePack.stickers.map((sticker) => (
                    <Grid item xs={3} sm={2.4} key={sticker.id}>
                      <Box
                        onClick={() => handleStickerClick(activePack, sticker)}
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            background: 'rgba(255, 255, 255, 0.1)'
                          },
                          '&:active': {
                            transform: 'scale(0.95)'
                          }
                        }}
                      >
                        {/* Определяем тип стикера по URL или имени файла */}
                        {sticker.url && sticker.url.toLowerCase().includes('.webm') ? (
                          <video
                            src={sticker.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <img
                            src={sticker.url}
                            alt={sticker.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Вкладки стикерпаков внизу */}
            <Box sx={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.3)'
            }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: isMobile ? '56px' : '48px',
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main'
                  },
                  '& .MuiTab-root': {
                    minWidth: isMobile ? '48px' : '40px',
                    minHeight: isMobile ? '56px' : '48px',
                    padding: '8px 12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': {
                      color: 'primary.main'
                    }
                  }
                }}
              >
                {stickerPacks.map((pack, index) => (
                  <Tab
                    key={pack.id}
                    icon={
                      <Tooltip title={pack.name} placement="top">
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '6px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255, 255, 255, 0.1)'
                        }}>
                          {pack.stickers && pack.stickers[0] ? (
                            // Проверяем тип первого стикера для превью в табе
                            pack.stickers[0].url && pack.stickers[0].url.toLowerCase().includes('.webm') ? (
                              <video
                                src={pack.stickers[0].url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            ) : (
                              <img
                                src={pack.stickers[0].url}
                                alt={pack.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain'
                                }}
                              />
                            )
                          ) : (
                            <StickerIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.5)' }} />
                          )}
                        </Box>
                      </Tooltip>
                    }
                  />
                ))}
              </Tabs>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default StickerPicker; 