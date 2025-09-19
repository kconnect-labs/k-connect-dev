import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Slider,
  styled,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { PlayIcon, PauseIcon, ForwardIcon } from '../icons/CustomIcons';
import { useMusic } from '../../context/MusicContext';
import { ThemeSettingsContext } from '../../App';
import { useContext } from 'react';
import { extractDominantColor } from '../../utils/imageUtils';

const PlayerContainer = styled(Paper)<{ covercolor?: string | null }>(
  ({ theme, covercolor }) => ({
    position: 'fixed',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 1000,
    zIndex: theme.zIndex.appBar - 1,
    backgroundColor: covercolor
      ? `rgba(${covercolor}, 0.15)`
      : 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(40px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    borderRadius: 24,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&.hidden': {
      display: 'none !important',
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: covercolor
        ? `radial-gradient(circle at center, rgba(${covercolor}, 0.2) 0%, rgba(0, 0, 0, 0.1) 70%)`
        : 'none',
      opacity: 0.6,
      pointerEvents: 'none',
      borderRadius: 24,
    },
    '@media (min-width: 700px)': {
      width: 'calc(100% - 300px)',
      left: 'calc(50% + 140px)',
    },
    '@media (max-width: 700px)': {
      width: 'calc(100% - 40px)',
      left: '50%',
      transform: 'translateX(-50%)',
      minWidth: 'auto',
    },
  })
);

// Таймлайн сверху как отдельный элемент
const TopTimeline = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  cursor: 'pointer',
  zIndex: 10,
  borderRadius: '0',
  transition: 'height 0.2s ease',
  '&:hover': {
    height: 8,
  },
}));

// -style кнопки
const ControlButton = memo(
  ({
    icon,
    onClick,
    ariaLabel,
    color = 'white',
    active = false,
    activeColor = null,
    size = 'medium',
  }: {
    icon: React.ReactNode;
    onClick: (e: React.MouseEvent) => void;
    ariaLabel: string;
    color?: string;
    active?: boolean;
    activeColor?: string | null;
    size?: 'small' | 'medium' | 'large';
  }) => {
    const buttonSize = size === 'large' ? 48 : size === 'medium' ? 40 : 32;

    return (
      <IconButton
        onClick={onClick}
        aria-label={ariaLabel}
        sx={{
          color: active ? activeColor || 'primary.main' : color,
          width: buttonSize,
          height: buttonSize,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {icon}
      </IconButton>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.active === nextProps.active &&
      prevProps.color === nextProps.color &&
      prevProps.activeColor === nextProps.activeColor &&
      prevProps.onClick === nextProps.onClick &&
      prevProps.ariaLabel === nextProps.ariaLabel &&
      prevProps.size === nextProps.size &&
      React.isValidElement(prevProps.icon) &&
      React.isValidElement(nextProps.icon) &&
      prevProps.icon.type === nextProps.icon.type
    );
  }
);

const getColorFromImage = extractDominantColor;

// Мемоизированная информация о треке
const TrackInfoSection = memo(
  ({
    currentTrack,
    titleOverflowing,
    artistOverflowing,
    isPlayerHovered,
    onFullScreenOpen,
    titleRef,
    artistRef,
    onLikeClick,
    isTrackChanging,
  }: {
    currentTrack: any;
    titleOverflowing: boolean;
    artistOverflowing: boolean;
    isPlayerHovered: boolean;
    onFullScreenOpen: () => void;
    titleRef: React.RefObject<HTMLDivElement>;
    artistRef: React.RefObject<HTMLDivElement>;
    onLikeClick: (e: React.MouseEvent) => void;
    isTrackChanging: boolean;
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        width: '100%',
        minWidth: 0,
      }}
      onClick={onFullScreenOpen}
    >
      <Box
        sx={{
          position: 'relative',
          width: 60,
          height: 60,
          marginRight: 2,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <Box
          component='img'
          src={
            (currentTrack as any)?.cover_path ||
            '/static/uploads/system/album_placeholder.jpg'
          }
          alt={(currentTrack as any)?.title || ''}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isTrackChanging ? 'scale(1.1)' : 'scale(1)',
            filter: isTrackChanging ? 'brightness(1.2)' : 'brightness(1)',
          }}
        />

        {/* Overlay при наведении или смене трека */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isTrackChanging ? 1 : 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <ControlButton
              icon={
                (currentTrack as any)?.is_liked ? (
                  <FavoriteIcon sx={{ fontSize: 24 }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 24 }} />
                )
              }
              onClick={e => {
                e.stopPropagation();
                onLikeClick(e);
              }}
              ariaLabel='Toggle like'
              color={(currentTrack as any)?.is_liked ? 'white' : 'white'}
              active={(currentTrack as any)?.is_liked}
              activeColor='white'
              size='medium'
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          overflow: 'hidden',
          flex: 1,
          minWidth: 0,
          maxWidth: '300px', // Увеличиваем ширину текста
        }}
      >
        <Typography
          variant='h6'
          ref={titleRef}
          sx={{
            fontSize: '1.1rem',
            color: 'white',
            marginBottom: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontWeight: 600,
          }}
        >
          {(currentTrack as any)?.title || 'Unknown Title'}
        </Typography>

        <Typography
          variant='body2'
          ref={artistRef}
          sx={{
            fontSize: '0.9rem',
            opacity: 0.7,
            color: 'white',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {(currentTrack as any)?.artist || 'Unknown Artist'}
        </Typography>
      </Box>
    </Box>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.currentTrack?.id === nextProps.currentTrack?.id &&
      prevProps.currentTrack?.title === nextProps.currentTrack?.title &&
      prevProps.currentTrack?.artist === nextProps.currentTrack?.artist &&
      prevProps.currentTrack?.cover_path ===
        nextProps.currentTrack?.cover_path &&
      prevProps.currentTrack?.is_liked === nextProps.currentTrack?.is_liked &&
      prevProps.titleOverflowing === nextProps.titleOverflowing &&
      prevProps.artistOverflowing === nextProps.artistOverflowing &&
      prevProps.isPlayerHovered === nextProps.isPlayerHovered &&
      prevProps.isTrackChanging === nextProps.isTrackChanging &&
      prevProps.onFullScreenOpen === nextProps.onFullScreenOpen &&
      prevProps.onLikeClick === nextProps.onLikeClick
    );
  }
);

// Мемоизированная секция контролов
const ControlsSection = memo(
  ({
    shuffleMode,
    handleShuffleClick,
    isPlaying,
    togglePlay,
    nextTrack,
    repeatMode,
    handleRepeatClick,
    dominantColor,
  }: {
    shuffleMode: boolean;
    handleShuffleClick: () => void;
    isPlaying: boolean;
    togglePlay: () => void;
    nextTrack: () => void;
    repeatMode: string;
    handleRepeatClick: () => void;
    dominantColor: string | null;
  }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <ControlButton
        icon={
          isPlaying ? (
            <PauseIcon size={48} className='' />
          ) : (
            <PlayIcon size={48} className='' />
          )
        }
        onClick={e => togglePlay()}
        ariaLabel={isPlaying ? 'Pause' : 'Play'}
        active={true}
        activeColor='white'
        size='large'
      />

      <ControlButton
        icon={<ForwardIcon size={48} className='' />}
        onClick={e => nextTrack()}
        ariaLabel='Next track'
        size='large'
      />
    </Box>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.shuffleMode === nextProps.shuffleMode &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.repeatMode === nextProps.repeatMode &&
      prevProps.dominantColor === nextProps.dominantColor &&
      prevProps.handleShuffleClick === nextProps.handleShuffleClick &&
      prevProps.handleRepeatClick === nextProps.handleRepeatClick &&
      prevProps.togglePlay === nextProps.togglePlay &&
      prevProps.nextTrack === nextProps.nextTrack
    );
  }
);

interface DesktopPlayerProps {
  isMobile: boolean;
}

const DesktopPlayer: React.FC<DesktopPlayerProps> = memo(({ isMobile }) => {
  // DesktopPlayer рендерится только на PC
  if (isMobile) {
    return null;
  }

  const theme = useTheme();
  const { themeSettings } = useContext(ThemeSettingsContext);
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    likeTrack,
    currentTime,
    duration,
    seekTo,
    getCurrentTimeRaw,
    getDurationRaw,
    audioRef,
    openFullScreenPlayer,
    closeFullScreenPlayer,
    isFullScreenPlayerOpen,
  } = useMusic();

  const [seekValue, setSeekValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [isPlayerHovered, setIsPlayerHovered] = useState(false);
  const [isTrackChanging, setIsTrackChanging] = useState(false);

  // Отслеживаем изменение трека для анимации
  useEffect(() => {
    if (currentTrack) {
      setIsTrackChanging(true);
      const timer = setTimeout(() => {
        setIsTrackChanging(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [(currentTrack as any)?.id]);

  // Принудительное обновление времени для таймлайна (как в FullScreenPlayer)
  useEffect(() => {
    const updateTime = () => {
      if ((audioRef as any)?.current && !isSeeking) {
        const audioTime = (audioRef as any).current.currentTime;
        const audioDuration = (audioRef as any).current.duration;

        if (!isNaN(audioTime) && !isNaN(audioDuration) && audioDuration > 0) {
          const progress = (audioTime / audioDuration) * 100;
          if (progress !== currentSeekValueRef.current) {
            setSeekValue(progress);
            currentSeekValueRef.current = progress;
          }
        }
      }
    };

    const interval = setInterval(updateTime, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isSeeking, audioRef]);

  const [titleOverflowing, setTitleOverflowing] = useState(false);
  const [artistOverflowing, setArtistOverflowing] = useState(false);

  const [shareSnackbar, setShareSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const progressRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const artistRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef(0);
  const currentSeekValueRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const updateDisplays = () => {
      try {
        if (!isMounted) return;

        const currentTimeEl = document.getElementById('desktop-current-time');
        const durationEl = document.getElementById('desktop-duration');

        if (
          currentTimeEl &&
          (window as any).audioTiming &&
          (window as any).audioTiming.formattedCurrentTime
        ) {
          currentTimeEl.textContent = (
            window as any
          ).audioTiming.formattedCurrentTime;
        }

        if (
          durationEl &&
          (window as any).audioTiming &&
          (window as any).audioTiming.formattedDuration
        ) {
          durationEl.textContent = (
            window as any
          ).audioTiming.formattedDuration;
        }

        if (isMounted) {
          requestAnimationFrame(updateDisplays);
        }
      } catch (error) {
        console.error('Error updating player displays:', error);

        if (isMounted) {
          requestAnimationFrame(updateDisplays);
        }
      }
    };

    const animationId = requestAnimationFrame(updateDisplays);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    if (titleRef.current) {
      setTitleOverflowing(
        titleRef.current.scrollWidth > titleRef.current.clientWidth
      );
    }
    if (artistRef.current) {
      setArtistOverflowing(
        artistRef.current.scrollWidth > artistRef.current.clientWidth
      );
    }
  }, [currentTrack]);

  useEffect(() => {
    if ((currentTrack as any)?.cover_path) {
      getColorFromImage(
        (currentTrack as any).cover_path ||
          '/static/uploads/system/album_placeholder.jpg',
        (color: string) => {
          setDominantColor(color);
        }
      );
    }
  }, [(currentTrack as any)?.cover_path]);

  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      if (!isSeeking && event.detail && event.detail.progressPercent) {
        setSeekValue(event.detail.progressPercent);
        currentSeekValueRef.current = event.detail.progressPercent;
      }
    };

    document.addEventListener(
      'audioProgressUpdate',
      handleProgressUpdate as EventListener
    );

    if ((window as any).currentAudioProgress !== undefined && !isSeeking) {
      setSeekValue((window as any).currentAudioProgress);
      currentSeekValueRef.current = (window as any).currentAudioProgress;
    }

    return () => {
      document.removeEventListener(
        'audioProgressUpdate',
        handleProgressUpdate as EventListener
      );
    };
  }, [isSeeking]);

  if (!currentTrack) {
    return null;
  }

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekChange = useCallback(
    (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
      setSeekValue(newValue as number);
    },
    []
  );

  const handleSeekEnd = useCallback(
    (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
      try {
        let durationValue = 0;

        if (typeof getDurationRaw === 'function') {
          const rawDuration = getDurationRaw();
          if (typeof rawDuration === 'number' && rawDuration > 0) {
            durationValue = rawDuration;
          } else if (typeof duration === 'number' && duration > 0) {
            durationValue = duration;
          }
        } else if (typeof duration === 'number' && duration > 0) {
          durationValue = duration;
        } else if (
          audioRef &&
          (audioRef as any).current &&
          (audioRef as any).current.duration
        ) {
          durationValue = (audioRef as any).current.duration;
        }

        if (durationValue > 0) {
          (seekTo as any)(((newValue as number) * durationValue) / 100);
        }

        setIsSeeking(false);
      } catch (error) {
        console.error('Error in handleSeekEnd:', error);
        setIsSeeking(false);
      }
    },
    [seekTo, getDurationRaw, duration, audioRef]
  );

  const handleClickProgress = useCallback(
    (event: React.MouseEvent) => {
      try {
        if (progressRef.current) {
          let durationValue = 0;

          if (typeof getDurationRaw === 'function') {
            const rawDuration = getDurationRaw();
            if (typeof rawDuration === 'number' && rawDuration > 0) {
              durationValue = rawDuration;
            } else if (typeof duration === 'number' && duration > 0) {
              durationValue = duration;
            }
          } else if (typeof duration === 'number' && duration > 0) {
            durationValue = duration;
          } else if (
            audioRef &&
            (audioRef as any).current &&
            (audioRef as any).current.duration
          ) {
            durationValue = (audioRef as any).current.duration;
          }

          if (durationValue > 0) {
            const rect = progressRef.current.getBoundingClientRect();
            const position = ((event.clientX - rect.left) / rect.width) * 100;
            const clampedPosition = Math.min(Math.max(position, 0), 100);
            setSeekValue(clampedPosition);
            (seekTo as any)((clampedPosition * durationValue) / 100);
          }
        }
      } catch (error) {
        console.error('Error in handleClickProgress:', error);
      }
    },
    [progressRef, seekTo, getDurationRaw, duration, audioRef]
  );

  const toggleLikeTrack = useCallback(
    (e: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }

      if ((currentTrack as any)?.id) {
        try {
          const likeButton = e.currentTarget as HTMLElement;
          likeButton.style.transform = 'scale(1.3)';
          setTimeout(() => {
            likeButton.style.transform = 'scale(1)';
          }, 150);

          (likeTrack as any)((currentTrack as any).id);
        } catch (error) {
          console.error('Error liking track:', error);
        }
      }
    },
    [currentTrack, likeTrack]
  );

  const handleRepeatClick = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const handleShuffleClick = useCallback(() => {
    setShuffleMode(prev => !prev);
  }, []);

  const openFullScreen = useCallback(() => {
    openFullScreenPlayer();
  }, [openFullScreenPlayer]);

  const handleCloseSnackbar = useCallback(
    (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setShareSnackbar(prev => ({ ...prev, open: false }));
    },
    []
  );

  return (
    <React.Fragment>
      <PlayerContainer
        elevation={0}
        covercolor={dominantColor}
        onMouseEnter={() => setIsPlayerHovered(true)}
        onMouseLeave={() => setIsPlayerHovered(false)}
        sx={{ display: isFullScreenPlayerOpen ? 'none' : 'block' }}
        className={isFullScreenPlayerOpen ? 'hidden' : ''}
      >
        {/* Таймлайн сверху как отдельный элемент */}
        <TopTimeline
          style={{ '--progress-width': `${seekValue}%` } as React.CSSProperties}
          onClick={handleClickProgress}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: 'var(--progress-width, 0%)',
              backgroundColor: dominantColor
                ? `rgba(${dominantColor}, 1)`
                : 'white',
              transition: 'width 0.1s ease, height 0.2s ease',
              borderRadius: '0',
            }}
          />
          {/* Невидимый слайдер для интерактивности */}
          <Slider
            value={seekValue}
            max={100}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onChangeCommitted={handleSeekEnd}
            onTouchStart={handleSeekStart}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              color: 'transparent',
              '& .MuiSlider-thumb': {
                display: 'none', // Полностью убираем thumb
              },
              '& .MuiSlider-rail': {
                opacity: 0,
              },
              '& .MuiSlider-track': {
                opacity: 0,
              },
            }}
          />
        </TopTimeline>

        {/* Основной контент */}
        <Box
          sx={{
            padding: '16px 24px',
            paddingTop: '24px', // Отступ сверху для таймлайна
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '80px',
          }}
        >
          {/* Левая часть - Трек-информация */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: '1 1 auto',
              minWidth: 0,
              gap: 1,
            }}
          >
            <TrackInfoSection
              currentTrack={currentTrack}
              titleOverflowing={titleOverflowing}
              artistOverflowing={artistOverflowing}
              isPlayerHovered={isPlayerHovered}
              onFullScreenOpen={openFullScreen}
              titleRef={titleRef}
              artistRef={artistRef}
              onLikeClick={toggleLikeTrack}
              isTrackChanging={isTrackChanging}
            />
          </Box>

          {/* Центр - Кнопки управления */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flex: '0 0 auto',
            }}
          >
            <ControlsSection
              shuffleMode={shuffleMode}
              handleShuffleClick={handleShuffleClick}
              isPlaying={isPlaying}
              togglePlay={togglePlay}
              nextTrack={nextTrack}
              repeatMode={repeatMode}
              handleRepeatClick={handleRepeatClick}
              dominantColor={dominantColor}
            />
          </Box>
        </Box>
      </PlayerContainer>

      <Snackbar
        open={shareSnackbar.open && !isFullScreenPlayerOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={shareSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {shareSnackbar.message}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
});

DesktopPlayer.displayName = 'DesktopPlayer';

export default DesktopPlayer;
