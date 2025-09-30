import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, IconButton, Slider, Typography, styled } from '@mui/material';
import { PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen, FullscreenExit } from '@mui/icons-material';
import { PlayIcon } from '../icons/CustomIcons';

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoaded: boolean;
  showControls: boolean;
  buffering: boolean;
}

const PlayerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: 'var(--main-border-radius)',
  overflow: 'hidden',
  backgroundColor: '#000',
  aspectRatio: '16/9',
  cursor: 'pointer',
  '&:hover .controls-overlay': {
    opacity: 1,
  },
  '@media (max-width: 768px)': {
    borderRadius: 'var(--small-border-radius)',
  },
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  backgroundColor: '#000',
});

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  padding: '2px 4px 2px 4px',
  backdropFilter: 'blur(10px)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  '@media (max-width: 768px)': {
    padding: '1px 3px 1px 3px',
  },
}));

const ProgressContainer = styled(Box)({
  width: '100%',
  position: 'absolute',
  top: '0',
  left: 0,
  right: 0,
  height: '0px',
  zIndex: 1,
});

const ProgressSlider = styled(Slider)(({ theme }) => ({
  color: '#d0bcff',
  padding: '0px 0 !important',
  height: '6px',
  margin: '0',
  position: 'static',
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: '#d0bcff',
    height: '6px',
    borderRadius: 'var(--main-border-radius)',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: '6px',
    borderRadius: 'var(--main-border-radius)',
  },
  '& .MuiSlider-thumb': {
    display: 'none',
  },
  '&:hover': {
    '& .MuiSlider-track': {
      height: '9px',
    },
    '& .MuiSlider-rail': {
      height: '9px',
    },
  },
  '@media (max-width: 768px)': {
    height: '6px',
    padding: '4px 0 !important',
    '& .MuiSlider-track': {
      height: '6px',
    },
    '& .MuiSlider-rail': {
      height: '6px',
    },
    '&:hover': {
      '& .MuiSlider-track': {
        height: '8px',
      },
      '& .MuiSlider-rail': {
        height: '8px',
      },
    },
  },
  '@media (pointer: coarse)': {
    padding: '0px 0 !important',
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: '10px',
    borderRadius: 'var(--small-border-radius)',
  },
}));

const ControlsRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  '@media (max-width: 768px)': {
    gap: '4px',
    marginTop: '10px',
    marginBottom: '5px',
  },
});

const LeftControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  '@media (max-width: 768px)': {
    gap: '4px',
  },
});

const RightControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  '@media (max-width: 768px)': {
    gap: '4px',
  },
});

const ControlButton = styled(IconButton)(({ theme }) => ({
  color: '#fff',
  width: 32,
  height: 32,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.05)',
  },
  '@media (max-width: 768px)': {
    width: 24,
    height: 24,
  },
}));

const VolumeSlider = styled(Slider)(({ theme }) => ({
  color: '#fff',
  width: 60,
  height: 10,
  margin: '0',
  padding: '0px 0 !important',
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: '#fff',
    height: 6,
    borderRadius: '3px',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 6,
    borderRadius: '3px',
  },
  '& .MuiSlider-thumb': {
    display: 'none',
  },
  '&:hover': {
    '& .MuiSlider-track': {
      height: 9,
    },
    '& .MuiSlider-rail': {
      height: 9,
    },
  },
  '@media (pointer: coarse)': {
    padding: '0px 0 !important',
  },
}));

const TimeDisplay = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontSize: '12px',
  fontWeight: 500,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  '@media (max-width: 768px)': {
    fontSize: '11px',
  },
}));

const BufferingIndicator = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 40,
  height: 40,
  border: '3px solid rgba(255, 255, 255, 0.3)',
  borderTop: '3px solid #fff',
  borderRadius: 'var(--avatar-border-radius)',
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
    '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
  },
});

const CenterPlayButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 80,
  height: 80,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 'var(--avatar-border-radius)',
  padding: '12px 4px 12px 12px',
  color: '#fff',
  transition: 'all 0.3s ease',
  zIndex: 10,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    transform: 'translate(-50%, -50%) scale(1.1)',
  },
  '&:active': {
    transform: 'translate(-50%, -50%) scale(0.95)',
  },
  '@media (max-width: 768px)': {
    width: 60,
    height: 60,
  },
}));

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AppleStyleVideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  poster,
  autoplay = false,
  muted = false,
  loop = false,
  onPlay,
  onPause,
  onEnded,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isMuted: muted,
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isLoaded: false,
    showControls: false,
    buffering: false,
  });

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [posterError, setPosterError] = useState(false);

  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth < 768;
  }, []);

  // Сбрасываем ошибку превьюшки при изменении poster
  useEffect(() => {
    setPosterError(false);
  }, [poster]);

  const showControls = useCallback(() => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState.isPlaying) {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  }, [playerState.isPlaying]);

  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setPlayerState(prev => ({ ...prev, showControls: false }));
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (playerState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [playerState.isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !playerState.isMuted;
    videoRef.current.muted = newMuted;
    setPlayerState(prev => ({ ...prev, isMuted: newMuted }));
  }, [playerState.isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current || !videoRef.current) return;

    if (!playerState.isFullscreen) {
      // Сначала пробуем наш полноэкранный режим
      const element = containerRef.current as any;
      const enterFullscreen = () => {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        } else {
          // Fallback: используем родной полноэкранный режим видео
          (videoRef.current as any).webkitEnterFullscreen();
        }
      };

      // Пробуем наш полноэкранный режим с обработкой ошибок
      try {
        enterFullscreen();
      } catch (error) {
        console.log('Fullscreen API failed, trying native video fullscreen');
        // Fallback на родной полноэкранный режим видео
        const video = videoRef.current as any;
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      }
    } else {
      // Выход из полноэкранного режима
      const doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }, [playerState.isFullscreen]);

  const handleTimeChange = useCallback((event: any, value: number | number[]) => {
    // При начале перетаскивания
    if (!isSeeking) {
      setIsSeeking(true);
    }
    const newTime = Array.isArray(value) ? value[0] : value;
    // Ограничиваем время в пределах длительности видео
    const clampedTime = Math.max(0, Math.min(newTime, playerState.duration));
    setSeekValue(clampedTime);
  }, [isSeeking, playerState.duration]);

  const handleVolumeChange = useCallback((event: any, value: number | number[]) => {
    if (!videoRef.current) return;
    const newVolume = Array.isArray(value) ? value[0] : value;
    videoRef.current.volume = newVolume;
    setPlayerState(prev => ({ 
      ...prev, 
      volume: newVolume,
      isMuted: newVolume === 0 
    }));
  }, []);

  const handleSeek = useCallback((event: any, value: number | number[]) => {
    // Перематываем видео только после отпускания ползунка
    if (!videoRef.current) return;
    const newTime = Array.isArray(value) ? value[0] : value;
    // Ограничиваем время в пределах длительности видео
    const clampedTime = Math.max(0, Math.min(newTime, playerState.duration));
    
    // Сначала обновляем состояние, чтобы избежать прыжка
    setPlayerState(prev => ({ 
      ...prev, 
      currentTime: clampedTime 
    }));
    
    // Затем перематываем видео
    videoRef.current.currentTime = clampedTime;
    setIsSeeking(false);
    setSeekValue(0);
  }, [playerState.duration]);

  // Event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setPlayerState(prev => ({ 
      ...prev, 
      duration: videoRef.current!.duration,
      isLoaded: true 
    }));
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isSeeking) return;
    setPlayerState(prev => ({ 
      ...prev, 
      currentTime: videoRef.current!.currentTime 
    }));
  }, [isSeeking]);

  const handlePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    onEnded?.();
  }, [onEnded]);

  const handleWaiting = useCallback(() => {
    setPlayerState(prev => ({ ...prev, buffering: true }));
  }, []);

  const handleCanPlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, buffering: false }));
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('Video error:', error);
    onError?.(error);
  }, [onError]);

  const handleFullscreenChange = useCallback(() => {
    const doc = document as any;
    const isFullscreen = !!(
      doc.fullscreenElement || 
      doc.webkitFullscreenElement || 
      doc.mozFullScreenElement || 
      doc.msFullscreenElement
    );
    setPlayerState(prev => ({ 
      ...prev, 
      isFullscreen 
    }));
  }, []);

  // Effects
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Добавляем обработчики для родного полноэкранного режима видео
    video.addEventListener('webkitbeginfullscreen', () => {
      setPlayerState(prev => ({ ...prev, isFullscreen: true }));
    });
    video.addEventListener('webkitendfullscreen', () => {
      setPlayerState(prev => ({ ...prev, isFullscreen: false }));
    });

    // Set initial properties
    video.muted = muted;
    video.volume = playerState.volume;
    if (autoplay) {
      video.play().catch(console.error);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      // Удаляем обработчики для родного полноэкранного режима
      video.removeEventListener('webkitbeginfullscreen', () => {});
      video.removeEventListener('webkitendfullscreen', () => {});
    };
  }, [autoplay, muted, playerState.volume]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleContainerClick = useCallback(() => {
    if (playerState.showControls) {
      togglePlay();
    } else {
      showControls();
    }
  }, [playerState.showControls, togglePlay, showControls]);

  const handleContainerMouseMove = useCallback(() => {
    showControls();
  }, [showControls]);

  const handleContainerMouseLeave = useCallback(() => {
    if (playerState.isPlaying) {
      hideControls();
    }
  }, [playerState.isPlaying, hideControls]);

  return (
    <PlayerContainer
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      onTouchStart={showControls}
    >
      <VideoElement
        ref={videoRef}
        poster={posterError ? '/static/images/video_placeholder.png' : poster}
        loop={loop}
        playsInline
        preload="metadata"
        onError={(e) => {
          if (e.target === videoRef.current) {
            setPosterError(true);
          }
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает HTML5 видео.
      </VideoElement>

      {playerState.buffering && (
        <BufferingIndicator />
      )}

      {/* Центральная кнопка PLAY - показывается только когда видео не играет */}
      {!playerState.isPlaying && !playerState.buffering && (
        <CenterPlayButton 
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          size="large"
        >
          <PlayIcon size={40} color="#fff" />
        </CenterPlayButton>
      )}

      <ControlsOverlay 
        className="controls-overlay"
        sx={{ 
          opacity: playerState.showControls ? 1 : 0,
          pointerEvents: playerState.showControls ? 'auto' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ProgressContainer>
          <ProgressSlider
            value={isSeeking ? seekValue : playerState.currentTime}
            max={playerState.duration || 0.1}
            min={0}
            step={0.01}
            onChange={handleTimeChange}
            onChangeCommitted={handleSeek}
            size="small"
          />
        </ProgressContainer>

        <ControlsRow>
          <LeftControls>
            <ControlButton onClick={togglePlay} size="small">
              {playerState.isPlaying ? <Pause /> : <PlayArrow />}
            </ControlButton>
            
            <TimeDisplay>
              {formatTime(isSeeking ? seekValue : playerState.currentTime)} / {formatTime(playerState.duration)}
            </TimeDisplay>
          </LeftControls>

          <RightControls>
            {!isMobile && (
              <>
                <ControlButton onClick={toggleMute} size="small">
                  {playerState.isMuted ? <VolumeOff /> : <VolumeUp />}
                </ControlButton>
                
                <VolumeSlider
                  value={playerState.isMuted ? 0 : playerState.volume}
                  max={1}
                  step={0.1}
                  onChange={handleVolumeChange}
                  size="small"
                />
              </>
            )}

            <ControlButton onClick={toggleFullscreen} size="small">
              {playerState.isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </ControlButton>
          </RightControls>
        </ControlsRow>
      </ControlsOverlay>
    </PlayerContainer>
  );
};

export default AppleStyleVideoPlayer;
