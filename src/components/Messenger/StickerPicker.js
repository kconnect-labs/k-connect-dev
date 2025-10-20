import React, { useState, useEffect, useCallback } from 'react';
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
  useMediaQuery,
} from '@mui/material';
import {
  EmojiEmotions as StickerIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useMessenger } from '../../contexts/MessengerContext';
import axios from 'axios';

// API URL для мессенджера
const ORIGIN = (typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru';
const API_URL = `${ORIGIN}/apiMes`;

// Упрощенный компонент для мгновенного отображения стикеров

// Компонент для мгновенной загрузки стикеров
const InstantStickerGrid = React.memo(({ stickers, onStickerClick, pack }) => {
  // Загружаем все стикеры сразу без ленивой загрузки
  const visibleStickers = stickers || [];

  if (!stickers || stickers.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Нет стикеров в этом паке
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
        },
      }}
    >
      <Grid container spacing={0.5} sx={{ p: 1 }}>
        {visibleStickers.map(sticker => (
          <Grid item xs={3} sm={2.4} key={sticker.id}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 'var(--small-border-radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {(() => {
                const commonStyle = {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                };

                const handleClick = () => onStickerClick(pack, sticker);

                // Упрощенный рендеринг - все стикеры как изображения
                return (
                  <img
                    src={sticker.url}
                    alt={sticker.name}
                    style={commonStyle}
                    onClick={handleClick}
                  />
                );
              })()}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

const StickerPicker = ({ onStickerSelect, onClose, isOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sessionKey } = useMessenger();

  const [stickerPacks, setStickerPacks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Стили как в Телеграме
  const pickerStyles = {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    width: isMobile ? '100vw' : '320px',
    height: isMobile ? '50vh' : '400px',
    background: 'var(--theme-background, rgba(18, 18, 18, 0.95))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    borderRadius: isMobile ? '16px 16px 0 0' : 'var(--main-border-radius) !important',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  // Упрощенная загрузка стикерпаков без кеширования
  const loadStickerPacks = useCallback(async () => {
    // Временно отключена загрузка стикерпаков
    console.log('🚫 Sticker packs loading temporarily disabled');
    setStickerPacks([]);
    setLoading(false);
  }, []);

  // Функция для принудительного обновления кеша
  const refreshStickerPacks = useCallback(async () => {
    // Временно отключено обновление стикерпаков
    console.log('🚫 Sticker packs refresh temporarily disabled');
    setStickerPacks([]);
    setLoading(false);
  }, []);

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
      emoji: sticker.emoji,
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='h6' sx={{ color: 'white', fontWeight: 500 }}>
            Стикеры
          </Typography>

          {loading && (
            <Typography
              variant='caption'
              sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              (загрузка...)
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={refreshStickerPacks}
            size='small'
            disabled={loading}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            title='Обновить стикеры'
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            size='small'
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Контент */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress size={24} sx={{ color: 'white' }} />
          </Box>
        ) : stickerPacks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
              gap: 2,
            }}
          >
            <StickerIcon
              sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)' }}
            />
            <Typography
              variant='body2'
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              У вас пока нет стикерпаков
            </Typography>
          </Box>
        ) : (
          <>
            {/* Мгновенная сетка стикеров */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {activePack && activePack.stickers && (
                <InstantStickerGrid
                  stickers={activePack.stickers}
                  onStickerClick={handleStickerClick}
                  pack={activePack}
                />
              )}
            </Box>

            {/* Вкладки стикерпаков внизу */}
            <Box
              sx={{
                borderTop: '1px solid rgba(66, 66, 66, 0.5)',
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant='scrollable'
                scrollButtons='auto'
                sx={{
                  minHeight: isMobile ? '56px' : '48px',
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                  },
                  '& .MuiTab-root': {
                    minWidth: isMobile ? '48px' : '40px',
                    minHeight: isMobile ? '56px' : '48px',
                    padding: '8px 12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                {stickerPacks.map((pack, index) => (
                  <Tab
                    key={pack.id}
                    icon={
                      <Tooltip title={pack.name} placement='top'>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 'var(--small-border-radius)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {pack.stickers && pack.stickers[0] ? (
                            <img
                              src={pack.stickers[0].url}
                              alt='pack preview'
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <StickerIcon
                              sx={{
                                fontSize: 20,
                                color: 'rgba(255, 255, 255, 0.5)',
                              }}
                            />
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
