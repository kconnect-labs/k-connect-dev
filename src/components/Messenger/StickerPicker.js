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
  useMediaQuery,
} from '@mui/material';
import {
  EmojiEmotions as StickerIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useMessenger } from '../../contexts/MessengerContext';
import axios from 'axios';
// Lottie removed - too heavy
import pako from 'pako';
import { useStickerCache } from '../../services/stickerCache';

// API URL для мессенджера
const ORIGIN = (typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru';
const API_URL = `${ORIGIN}/apiMes`;

// Константы для ленивой загрузки
const STICKERS_PER_BATCH = 5; // Загружаем по 5 стикеров за раз
const LOAD_MORE_THRESHOLD = 100; // Пиксели до конца для подгрузки

// Функция для определения типа стикера
const getStickerType = sticker => {
  if (!sticker.url) return 'unknown';

  // Сначала проверяем данные стикера, если есть
  if (sticker.mime_type) {
    if (sticker.mime_type === 'application/x-tgsticker') return 'tgs';
    if (sticker.mime_type === 'video/webm') return 'webm';
    return 'static';
  }

  // Если данных нет, проверяем URL (менее надежно)
  const url = sticker.url.toLowerCase();
  // TGS и WebM поддержка временно отключена
  // if (url.includes('.tgs') || url.includes('tgsticker')) return 'tgs';
  // if (url.includes('.webm')) return 'webm';

  // Для API эндпоинтов делаем асинхронную проверку
  if (url.includes('/api/messenger/stickers/')) {
    return 'api_check_needed';
  }

  return 'static'; // webp, png, jpeg
};

// Компонент для TGS стикеров с кешированием
const TGSSticker = React.memo(
  ({ src, style, onClick }) => {
    const [animationData, setAnimationData] = useState(null);
    const [error, setError] = useState(false);
    const { getSticker, isCached } = useStickerCache();

    useEffect(() => {
      const loadTGS = async () => {
        try {
          // Сначала проверяем кеш
          const cachedData = getSticker(src);
          if (cachedData) {
            // Если есть в кеше, загружаем как blob
            const response = await fetch(cachedData);
            if (response.ok) {
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

              if (jsonData && jsonData.v && jsonData.fr) {
                setAnimationData(jsonData);
            return;
              }
            }
          }

          // Если нет в кеше или не удалось загрузить, загружаем оригинал
          const response = await fetch(src);
          if (!response.ok) {
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

          if (jsonData && jsonData.v && jsonData.fr) {
            setAnimationData(jsonData);
          } else {
            setError(true);
          }
        } catch (error) {
          console.error('Error loading TGS sticker:', error);
          setError(true);
        }
      };

      if (src) {
        loadTGS();
      }
    }, [src, getSticker]);

    // Мемоизируем title для предотвращения лишних рендеров
    const title = React.useMemo(() => 
      isCached(src) ? 'Кеширован' : 'Загружается...', 
      [isCached, src]
    );

    if (error || !animationData) {
      // Fallback к изображению если TGS не загрузился
      return <img src={src} style={style} onClick={onClick} alt='Стикер' />;
    }

    // TGS animation removed - fallback to image
    return <img src={src} style={style} onClick={onClick} alt='Стикер' title={title} />;
  }
);

// Упрощенный компонент для стикеров без кеширования
const AsyncStickerRenderer = React.memo(
  ({ src, style, onClick }) => {
    const [stickerType, setStickerType] = useState('loading');
    const [animationData, setAnimationData] = useState(null);
    const [isStatic, setIsStatic] = useState(true); // По умолчанию статичный режим

    useEffect(() => {
      const checkStickerType = async () => {
        try {
          // Определяем тип стикера по расширению файла
          const extension = src.split('.').pop()?.toLowerCase();
          
          if (extension === 'tgs') {
            setStickerType('tgs');
            // Загружаем TGS файл
          const response = await fetch(src);
            if (response.ok) {
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

              if (jsonData && jsonData.v && jsonData.fr) {
                setAnimationData(jsonData);
              } else {
                setStickerType('static');
              }
            } else {
              setStickerType('static');
            }
          } else if (extension === 'webm') {
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
        <div
          style={{
            ...style,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={24} />
        </div>
      );
    }

    if (stickerType === 'tgs' && animationData) {
      // TGS animation removed - fallback to image
      return <img src={src} style={style} onClick={onClick} alt='Стикер' />;
    } else if (stickerType === 'webm') {
      return (
        <video
          src={src}
          style={style}
          onClick={onClick}
          autoPlay={false} // Отключаем автовоспроизведение
          loop={false} // Отключаем зацикливание
          muted
          playsInline
          onMouseEnter={e => e.target.play()} // Воспроизводим при наведении
          onMouseLeave={e => {
            e.target.pause();
            e.target.currentTime = 0; // Возвращаем к началу
          }}
        />
      );
    } else {
      return <img src={src} style={style} onClick={onClick} alt='Стикер' />;
    }
  }
);

// Компонент для изображений с кешированием
const CachedImage = React.memo(({ src, alt, style, onClick }) => {
  const { getSticker, isCached } = useStickerCache();
  
  // Мемоизируем все вычисления для предотвращения лишних рендеров
  const cachedUrl = React.useMemo(() => getSticker(src), [getSticker, src]);
  const finalSrc = React.useMemo(() => cachedUrl || src, [cachedUrl, src]);
  const isCachedSticker = React.useMemo(() => isCached(src), [isCached, src]);
  const title = React.useMemo(() => 
    isCachedSticker ? 'Кеширован' : 'Загружается...', 
    [isCachedSticker]
  );
  
  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      style={style} 
      onClick={onClick}
      title={title}
    />
  );
});

// Компонент для видео с кешированием
const CachedVideo = React.memo(
  ({
    src,
    style,
    onClick,
    autoPlay = false,
    loop = false,
    muted = true,
    playsInline = true,
  }) => {
    const { getSticker, isCached } = useStickerCache();
    
    // Мемоизируем все вычисления для предотвращения лишних рендеров
    const cachedUrl = React.useMemo(() => getSticker(src), [getSticker, src]);
    const finalSrc = React.useMemo(() => cachedUrl || src, [cachedUrl, src]);
    const isCachedSticker = React.useMemo(() => isCached(src), [isCached, src]);
    const title = React.useMemo(() => 
      isCachedSticker ? 'Кеширован' : 'Загружается...', 
      [isCachedSticker]
    );
    
    return (
      <video
        src={finalSrc}
        style={style}
        onClick={onClick}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onMouseEnter={e => e.target.play()} // Воспроизводим при наведении
        onMouseLeave={e => {
          e.target.pause();
          e.target.currentTime = 0; // Возвращаем к началу
        }}
        title={title}
      />
    );
  }
);

// Компонент для ленивой загрузки стикеров
const LazyStickerGrid = React.memo(({ stickers, onStickerClick, pack }) => {
  const [visibleStickers, setVisibleStickers] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);
  const loadingRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Инициализация первых стикеров
  useEffect(() => {
    if (stickers && stickers.length > 0) {
      const initialBatch = stickers.slice(0, STICKERS_PER_BATCH);
      setVisibleStickers(initialBatch);
      setHasMore(stickers.length > STICKERS_PER_BATCH);
    }
  }, [stickers]);

  // Функция для загрузки следующей порции стикеров
  const loadMoreStickers = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Имитируем небольшую задержку для плавности
    setTimeout(() => {
      const currentCount = visibleStickers.length;
      const nextBatch = stickers.slice(currentCount, currentCount + STICKERS_PER_BATCH);
      
      setVisibleStickers(prev => [...prev, ...nextBatch]);
      setHasMore(currentCount + STICKERS_PER_BATCH < stickers.length);
      setLoadingMore(false);
    }, 50); // Уменьшили задержку для более быстрой загрузки
  }, [loadingMore, hasMore, visibleStickers.length, stickers]);

  // Intersection Observer для автоматической подгрузки
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && hasMore && !loadingMore) {
            loadMoreStickers();
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' } // Добавили rootMargin для ранней загрузки
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [hasMore, loadingMore, loadMoreStickers]);

  // Обработчик скролла с дебаунсингом
  const handleScroll = useCallback((e) => {
    // Очищаем предыдущий таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Устанавливаем новый таймаут для дебаунсинга
    scrollTimeoutRef.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD;
      
      if (isNearBottom && hasMore && !loadingMore) {
        loadMoreStickers();
      }
    }, 100); // Дебаунсинг 100ms
  }, [hasMore, loadingMore, loadMoreStickers]);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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
      ref={scrollRef}
      onScroll={handleScroll}
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
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {(() => {
                const stickerType = getStickerType(sticker);
                const commonStyle = {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                };

                const handleClick = () => onStickerClick(pack, sticker);

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
                    <CachedVideo
                      src={sticker.url}
                      style={commonStyle}
                      onClick={handleClick}
                      autoPlay={false}
                      loop={false}
                      muted
                      playsInline
                    />
                  );
                } else {
                  // Статичные стикеры (webp, png, jpeg) с кешированием
                  return (
                    <CachedImage
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
        
        {/* Индикатор загрузки */}
        {loadingMore && (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={24} sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Загружаем еще стикеры...
              </Typography>
            </Box>
          </Grid>
        )}
        
        {/* Индикатор прогресса */}
        {hasMore && !loadingMore && (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              {visibleStickers.length} из {stickers.length} стикеров
            </Typography>
          </Grid>
        )}
        
        {/* Невидимый элемент для отслеживания скролла */}
        {hasMore && (
          <Grid item xs={12}>
            <Box ref={loadingRef} sx={{ height: '20px' }} />
          </Grid>
        )}
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
    borderRadius: isMobile ? '16px 16px 0 0' : '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  // Упрощенная загрузка стикерпаков без кеширования
  const loadStickerPacks = useCallback(async () => {
    if (!sessionKey) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/messenger/sticker-packs/my`,
        {
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const packs = response.data.packs || [];
        setStickerPacks(packs);
      }
    } catch (error) {
      console.error('Error loading sticker packs:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  // Функция для принудительного обновления кеша
  const refreshStickerPacks = useCallback(async () => {
    if (!sessionKey) return;

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/messenger/sticker-packs/my`,
        {
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        const packs = response.data.packs || [];
        setStickerPacks(packs);
      }
    } catch (error) {
      console.error('Error refreshing sticker packs:', error);
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
            {/* Ленивая сетка стикеров */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {activePack && activePack.stickers && (
                <LazyStickerGrid
                  stickers={activePack.stickers}
                  onStickerClick={handleStickerClick}
                  pack={activePack}
                />
              )}
            </Box>

            {/* Вкладки стикерпаков внизу */}
            <Box
              sx={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                            borderRadius: '6px',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          {pack.stickers && pack.stickers[0] ? (
                            (() => {
                              const stickerType = getStickerType(
                                pack.stickers[0]
                              );
                              const commonStyle = {
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              };

                              // Для табов используем упрощенную логику - только статичные превью
                              // TGS и WEBM в табах могут быть ресурсозатратными
                              if (stickerType === 'api_check_needed') {
                                // Для API эндпоинтов показываем статичное изображение
                                return (
                                  <CachedImage
                                    src={pack.stickers[0].url}
                                    alt='pack preview'
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
                                  <CachedVideo
                                    src={pack.stickers[0].url}
                                    style={commonStyle}
                                    muted
                                    playsInline
                                    loop={false}
                                    autoPlay={false}
                                  />
                                );
                              } else {
                                return (
                                  <CachedImage
                                    src={pack.stickers[0].url}
                                    alt='pack preview'
                                    style={commonStyle}
                                  />
                                );
                              }
                            })()
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
