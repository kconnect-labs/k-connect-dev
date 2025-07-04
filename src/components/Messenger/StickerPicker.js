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
import Lottie from 'lottie-react';
import pako from 'pako';

// API URL для мессенджера
const API_URL = 'https://k-connect.ru/apiMes';

// Функция для определения типа стикера
const getStickerType = (sticker) => {
  if (!sticker.url) return 'unknown';
  
  // Сначала проверяем данные стикера, если есть
  if (sticker.mime_type) {
    if (sticker.mime_type === 'application/x-tgsticker') return 'tgs';
    if (sticker.mime_type === 'video/webm') return 'webm';
    return 'static';
  }
  
  // Если данных нет, проверяем URL (менее надежно)
  const url = sticker.url.toLowerCase();
  if (url.includes('.tgs') || url.includes('tgsticker')) return 'tgs';
  if (url.includes('.webm')) return 'webm';
  
  // Для API эндпоинтов делаем асинхронную проверку
  if (url.includes('/api/messenger/stickers/')) {
    return 'api_check_needed';
  }
  
  return 'static'; // webp, png, jpeg
};

// Компонент для TGS стикера с улучшенной загрузкой
const TGSSticker = ({ src, style, onClick }) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadTGS = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const response = await fetch(src);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        
        // Проверяем, действительно ли это TGS файл
        if (contentType !== 'application/x-tgsticker') {
          console.log('Not a TGS file, falling back to image:', contentType);
          setError(true);
          return;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        let jsonData;
        
        try {
          // Пробуем распаковать как gzip
          const decompressed = pako.inflate(arrayBuffer);
          const textDecoder = new TextDecoder();
          jsonData = JSON.parse(textDecoder.decode(decompressed));
        } catch (gzipError) {
          // Если не gzip, пробуем как обычный JSON
          const textDecoder = new TextDecoder();
          jsonData = JSON.parse(textDecoder.decode(arrayBuffer));
        }
        
        setAnimationData(jsonData);
      } catch (error) {
        console.error('Error loading TGS:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (src) {
      loadTGS();
    }
  }, [src]);

  if (loading) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </div>
    );
  }

  if (error || !animationData) {
    // Fallback to image if TGS loading failed
    return (
      <img
        src={src}
        style={style}
        onClick={onClick}
        alt="Стикер"
      />
    );
  }

  return (
    <div style={style} onClick={onClick}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

// Компонент для асинхронной проверки типа стикера
const AsyncStickerRenderer = ({ src, style, onClick }) => {
  const [stickerType, setStickerType] = useState('loading');
  const [animationData, setAnimationData] = useState(null);
  
  useEffect(() => {
    const checkStickerType = async () => {
      try {
        // Сначала пробуем загрузить как TGS
        const response = await fetch(src);
        
        if (!response.ok) {
          setStickerType('static');
          return;
        }
        
        const contentType = response.headers.get('content-type');
        
        if (contentType === 'application/x-tgsticker') {
          // Это TGS файл, пробуем его загрузить
          try {
            const arrayBuffer = await response.arrayBuffer();
            let jsonData;
            
            try {
              // Пробуем распаковать как gzip
              const decompressed = pako.inflate(arrayBuffer);
              const textDecoder = new TextDecoder();
              jsonData = JSON.parse(textDecoder.decode(decompressed));
            } catch (gzipError) {
              // Если не gzip, пробуем как обычный JSON
              const textDecoder = new TextDecoder();
              jsonData = JSON.parse(textDecoder.decode(arrayBuffer));
            }
            
            setAnimationData(jsonData);
            setStickerType('tgs');
          } catch (error) {
            console.error('Error loading TGS data:', error);
            setStickerType('static');
          }
        } else if (contentType === 'video/webm') {
          setStickerType('webm');
        } else {
          setStickerType('static');
        }
      } catch (error) {
        console.error('Error checking sticker type:', error);
        setStickerType('static');
      }
    };
    
    checkStickerType();
  }, [src]);
  
  if (stickerType === 'loading') {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={24} />
      </div>
    );
  }
  
  if (stickerType === 'tgs' && animationData) {
    return (
      <div style={style} onClick={onClick}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  } else if (stickerType === 'webm') {
    return (
      <video
        src={src}
        style={style}
        onClick={onClick}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  } else {
    return (
      <img
        src={src}
        style={style}
        onClick={onClick}
        alt="Стикер"
      />
    );
  }
};

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

  // Рендерим содержимое только если пикер открыт
  if (!isOpen) {
    return null;
  }

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
                          }
                        }}
                      >
                        {(() => {
                          const stickerType = getStickerType(sticker);
                          const commonStyle = {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          };

                          const handleClick = () => handleStickerClick(activePack, sticker);

                          // Для API эндпоинтов используем асинхронную проверку
                          if (stickerType === 'api_check_needed') {
                            return (
                              <AsyncStickerRenderer
                                src={sticker.url}
                                style={commonStyle}
                                onClick={handleClick}
                              />
                            );
                          }

                          // Для известных типов используем прямой рендеринг
                          if (stickerType === 'tgs') {
                            return (
                              <TGSSticker
                                src={sticker.url}
                                style={commonStyle}
                                onClick={handleClick}
                              />
                            );
                          } else if (stickerType === 'webm') {
                            return (
                              <video
                                src={sticker.url}
                                style={commonStyle}
                                onClick={handleClick}
                                autoPlay
                                loop
                                muted
                                playsInline
                              />
                            );
                          } else {
                            // Статичные стикеры (webp, png, jpeg)
                            return (
                              <img
                                src={sticker.url}
                                alt={sticker.name}
                                style={commonStyle}
                                onClick={handleClick}
                              />
                            );
                          }
                        })()}
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
                          {pack.stickers && pack.stickers[0] ? (() => {
                            const stickerType = getStickerType(pack.stickers[0]);
                            const commonStyle = {
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            };

                            // Для табов используем упрощенную логику - только статичные превью
                            // TGS и WEBM в табах могут быть ресурсозатратными
                            if (stickerType === 'api_check_needed') {
                              // Для API эндпоинтов показываем статичное изображение
                              return (
                                <img
                                  src={pack.stickers[0].url}
                                  alt="pack preview"
                                  style={commonStyle}
                                />
                              );
                            } else if (stickerType === 'tgs') {
                              // Для TGS в табах показываем иконку или первый кадр
                              return (
                                <TGSSticker
                                  src={pack.stickers[0].url}
                                  style={commonStyle}
                                  onClick={() => {}}
                                />
                              );
                            } else if (stickerType === 'webm') {
                              return (
                                <video
                                  src={pack.stickers[0].url}
                                  style={commonStyle}
                                  muted
                                  playsInline
                                  loop
                                />
                              );
                            } else {
                              return (
                                <img
                                  src={pack.stickers[0].url}
                                  alt="pack preview"
                                  style={commonStyle}
                                />
                              );
                            }
                          })() : (
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