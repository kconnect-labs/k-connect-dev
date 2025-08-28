import React, { memo, useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Dialog,
  Box,
  useMediaQuery,
  useTheme,
  IconButton,
  Typography,
  Slider,
  Alert,
  Snackbar,
  TextField,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useMusic } from '../../../context/MusicContext';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

// Импорт иконок
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  CloseIcon,
  LyricsIcon,
  ContentCopy,
} from '../../icons/CustomIcons';

// Импорт хуков
import {
  useFullScreenPlayer,
  useLyrics,
  usePortal,
  useDominantColor,
  usePlayerTime,
  useSnackbar,
} from './hooks';

// Импорт типов
import {
  FullScreenPlayerProps,
  PlayerHeaderProps,
  PlayerTrackInfoProps,
  AlbumArtLyricsContainerProps,
  LyricsModernViewProps,
  LyricsLineProps,
  StaticLyricsLineProps,
  ProgressSliderProps,
  MainPlayControlsProps,
  SecondaryPlayControlsProps,
  VolumeControlsProps,
  LyricsEditorContentProps,
  StyledComponentProps,
} from './types';

// Импорт утилит и констант
import * as utils from './utils';
import * as constants from './constants';

// Стилизованные компоненты
const PlayerContainer = memo(({ dominantColor, ...props }: { dominantColor?: any; [key: string]: any }) => (
  <Box
    {...props}
    sx={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      // Прозрачный фон, так как теперь используется анимированная обложка
      background: 'transparent',
      '@media (max-height: 600px)': {
        height: '100vh',
        minHeight: '100vh',
      },
      '@media (max-height: 500px)': {
        height: '100vh',
        minHeight: '100vh',
      },
    }}
  />
));

const HeaderSection = memo(
  styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    position: relative;
    z-index: 2;
    
    @media (max-height: 700px) {
      padding: 16px 24px;
    }
    
    @media (max-height: 600px) {
      padding: 12px 16px;
    }
    
    @media (max-height: 500px) {
      padding: 8px 12px;
    }
  `
);

const CloseButton = memo(
  styled(IconButton)`
    color: rgba(255,255,255,0.9);
    background: none;
    border: none;
    padding: 0;
    width: 80px;
    height: 30px;
    min-width: 80px;
    min-height: 30px;
    
    &:hover {
      background: none;
      opacity: 0.8;
    }
    
    transition: opacity 0.2s ease;
  `
);

const AlbumArtContainer = memo(
  styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 auto;
    position: relative;
    width: 100%;
    margin-bottom: 24px;
  `
);

const AlbumArt = memo(
  styled.img`
    width: ${constants.SIZES.ALBUM_ART.DESKTOP};
    height: ${constants.SIZES.ALBUM_ART.DESKTOP};
    border-radius: 20px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.1);
    transition: opacity 0.3s ease;
    
    @media (max-width: 768px) {
      @media (max-height: 850px) {
        width: min(67.5vw, 20rem);
        height: min(67.5vw, 20rem);
      }
      
      @media (max-height: 800px) {
        width: min(63.75vw, 18.75rem);
        height: min(63.75vw, 18.75rem);
      }
      
      @media (max-height: 700px) {
        width: min(60vw, 17.5rem);
        height: min(60vw, 17.5rem);
      }
      
      @media (max-height: 600px) {
        width: min(52.5vw, 15rem);
        height: min(52.5vw, 15rem);
      }
      
      @media (max-height: 500px) {
        width: min(45vw, 12.5rem);
        height: min(45vw, 12.5rem);
      }
      
      @media (max-height: 400px) {
        width: min(37.5vw, 10rem);
        height: min(37.5vw, 10rem);
      }
    }
    
    @media (min-width: 769px) {
      width: min(25vw, 20rem);
      height: min(25vw, 20rem);
    }
  `
);

const TrackInfo = memo(
  styled(Box)`
    text-align: center;
    max-width: 600px;
    margin-bottom: 16px;
    flex: 0 0 auto;
    
    @media (max-height: 850px) {
      margin-bottom: 12px;
    }
    
    @media (max-height: 800px) {
      margin-bottom: 10px;
    }
  `
);

const TrackTitle = memo(
  styled(Typography)`
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 6px;
    text-shadow: 0 1.5px 3px rgba(0,0,0,0.3);
    
    @media (max-width: 768px) {
      font-size: 1.125rem;
    }
    
    @media (max-height: 850px) {
      font-size: 1.35rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 800px) {
      font-size: 1.125rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 700px) {
      font-size: 1.35rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 600px) {
      font-size: 1.125rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 500px) {
      font-size: 0.9rem;
      margin-bottom: 1.5px;
    }
    
    @media (max-height: 400px) {
      font-size: 0.75rem;
      margin-bottom: 1.5px;
    }
  `
);

const TrackArtist = memo(
  styled(Typography)`
    font-size: 0.9rem;
    color: rgba(255,255,255,0.8);
    margin-bottom: 6px;
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
      color: white;
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      font-size: 0.75rem;
    }
    
    @media (max-height: 850px) {
      font-size: 0.825rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 800px) {
      font-size: 0.75rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 700px) {
      font-size: 0.825rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 600px) {
      font-size: 0.75rem;
      margin-bottom: 3px;
    }
    
    @media (max-height: 500px) {
      font-size: 0.675rem;
      margin-bottom: 1.5px;
    }
    
    @media (max-height: 400px) {
      font-size: 0.6rem;
      margin-bottom: 1.5px;
    }
  `
);

const ProgressContainer = memo(
  styled(Box)`
    width: 100%;
    max-width: 375px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    @media (max-width: 768px) {
      width: 95vw;
      max-width: 95vw;
    }
    
    @media (max-height: 850px) {
      max-width: 281.25px;
      gap: 4.5px;
    }
    
    @media (max-height: 800px) {
      max-width: 234.375px;
      gap: 3.375px;
    }
  `
);

const TimeDisplay = memo(
  styled(Box)`
    display: flex;
    justify-content: space-between;
    color: rgba(255,255,255,0.5);
    font-size: 0.5625rem;
    font-family: var(--FF_TITLE, inherit);
    margin: 3.75px;
    user-select: none;
    
    @media (max-height: 850px) {
      font-size: 0.525rem;
      margin: 2.25px;
    }
    
    @media (max-height: 800px) {
      font-size: 0.4875rem;
      margin: 1.5px;
    }
    
    @media (max-height: 700px) {
      font-size: 0.525rem;
      margin: 2.25px;
    }
    
    @media (max-height: 600px) {
      font-size: 0.4875rem;
      margin: 1.5px;
    }
    
    @media (max-height: 500px) {
      font-size: 0.45rem;
      margin: 0.75px;
    }
    
    @media (max-height: 400px) {
      font-size: 0.45rem;
      margin: 0.75px;
    }
  `
);

const MainControls = memo(
  styled(Box)`
    display: flex;
    align-items: center;
    gap: 36px;
    margin-bottom: 12px;
    
    @media (max-height: 850px) {
      gap: 24px;
      margin-bottom: 9px;
    }
    
    @media (max-height: 800px) {
      gap: 18px;
      margin-bottom: 6px;
    }
    
    @media (max-height: 700px) {
      gap: 24px;
      margin-bottom: 9px;
    }
    
    @media (max-height: 600px) {
      gap: 18px;
      margin-bottom: 6px;
    }
    
    @media (max-height: 500px) {
      gap: 12px;
      margin-bottom: 3px;
    }
    
    @media (max-height: 400px) {
      gap: 12px;
      margin-bottom: 1.5px;
    }
  `
);

const ControlButton = memo(({ active, play, ...props }: { active?: boolean; play?: boolean; [key: string]: any }) => (
  <IconButton
    {...props}
    sx={{
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      borderRadius: 0,
      padding: play ? '8px' : '4px',
      margin: 0,
      color: active ? '#fff' : '#d3d3d3',
      transition: constants.ANIMATIONS.DURATION.FAST,
      minWidth: 0,
      minHeight: 0,
      '&:hover': {
        color: '#fff',
        background: 'none',
        boxShadow: 'none',
        border: 'none',
      },
    }}
  />
));

const SecondaryControls = memo(
  styled(Box)`
    display: flex;
    align-items: center;
    gap: 36px;
    
    @media (max-width: 768px) {
      margin-bottom: 35px;
    }
  `
);





const PlayerTrackInfo: React.FC<PlayerTrackInfoProps> = memo(({ currentTrack, onArtistClick }) => {
  const artists = React.useMemo(() => {
    if (!currentTrack.artist) return [];
    return currentTrack.artist
      .split(',')
      .map(artist => artist.trim())
      .filter(artist => artist.length > 0);
  }, [currentTrack.artist]);

  return (
    <TrackInfo>
      <TrackTitle variant='h3'>{currentTrack.title}</TrackTitle>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {artists.map((artist, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <TrackArtist
              variant='h5'
              onClick={() => onArtistClick(artist)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: constants.ANIMATIONS.DURATION.FAST + ' ease',
                '&:hover': {
                  color: 'white',
                  textDecoration: 'underline',
                },
                '@media (max-width: 768px)': {
                  fontSize: '1rem',
                },
                display: 'inline',
                marginBottom: 0,
              }}
            >
              {artist}
            </TrackArtist>
            {index < artists.length - 1 && (
              <Typography
                variant='h5'
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1.2rem',
                  mx: 0.5,
                  cursor: 'default',
                  '@media (max-width: 768px)': {
                    fontSize: '1rem',
                  },
                }}
              >
                ,
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </TrackInfo>
  );
});

// Основной компонент
const FullScreenPlayerCore: React.FC<FullScreenPlayerProps> = memo(({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(constants.BREAKPOINTS.MOBILE);
  const navigate = useNavigate();

  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    likeTrack,
  } = useMusic();

  // Использование хуков
  const {
    dominantColor,
    showLyrics,
    showLyricsEditor,
    showTimestampEditor,
    showPlaylist,
    lyricsData,
    loadingLyrics,
    currentTime,
    duration,
    volume,
    isMuted,
    uploadingLyrics,
    lyricsError,
    lyricsText,
    isSaving,
    menuAnchorEl,
    uploading,
    lyricsDisplayMode,
    snackbar,
    coverPath,
    trackId,
    formattedCurrentTime,
    formattedDuration,
    safeCurrentTime,
    safeDuration,
    volumePercentage,
    activeColor,
    buttonBackgroundColor,
    handleTimeChange,
    handleTimeChangeCommitted,
    handleVolumeChange,
    handleToggleMute,
    handleToggleLike,
    handleCopyLink,
    goToArtist,
    handleUploadLyrics,
    handleOpenLyricsEditor,
    handleOpenTimestampEditor,
    handleLyricsChange,
    handleSaveLyrics,
    handleOpenMenu,
    handleCloseMenu,
    handleSnackbarClose,
    handleToggleLyricsDisplay,
    handleDownloadLyricsForSync,
    handleOpenFileSelector,
    handleFileSelected,
    uploadSyncFile,
    fileInputRef,
    filteredLines,
    setShowLyrics,
    setShowLyricsEditor,
    setShowTimestampEditor,
    setShowPlaylist,
    setLyricsData,
    setLoadingLyrics,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setUploadingLyrics,
    setLyricsError,
    setLyricsText,
    setIsSaving,
    setMenuAnchorEl,
    setUploading,
    setLyricsDisplayMode,
    setIsDragging,
    setSnackbar,
  } = useFullScreenPlayer(open, onClose);



  if (!open || !currentTrack) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
        },
      }}
    >
      <PlayerContainer dominantColor={dominantColor}>
        {/* Анимированный фон с обложкой альбома */}
        <div style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 0,
        }}>
          <div style={{
            zIndex: -1,
            content: "",
            position: 'fixed',
            top: '-50%',
            left: '-50%',
            width: '300%',
            height: '300%',
            overflow: 'visible',
            backgroundImage: `url(${coverPath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(80px)',
            animation: 'rotating 100s linear infinite',
          }} />
          
          {/* Темный оверлей для контраста */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: dominantColor 
              ? `linear-gradient(135deg, 
                  rgba(0,0,0,0.3) 0%, 
                  rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.2) 25%,
                  rgba(0,0,0,0.5) 50%, 
                  rgba(${Math.max(0, dominantColor.r - 50)}, ${Math.max(0, dominantColor.g - 50)}, ${Math.max(0, dominantColor.b - 50)}, 0.3) 75%,
                  rgba(0,0,0,0.7) 100%)`
              : 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)',
            zIndex: 0,
          }} />
          
          {/* Дополнительный радиальный градиент для глубины */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: dominantColor 
              ? `radial-gradient(circle at 30% 20%, 
                  rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.1) 0%, 
                  transparent 50%),
                  radial-gradient(circle at 70% 80%, 
                  rgba(0,0,0,0.3) 0%, 
                  transparent 50%)`
              : 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.3) 0%, transparent 50%)',
            zIndex: 0,
          }} />
        </div>

        {/* CSS анимация вращения */}
        <style>
          {`
            @keyframes rotating {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>

        {/* Плавный эффект появления */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.5s ease-out forwards',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
              },
              '100%': {
                opacity: 1,
              },
            },
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile || !lyricsDisplayMode ? 'column' : 'row',
            flex: 1,
            justifyContent: isMobile ? 'flex-start' : 'center',
            alignItems: isMobile || !lyricsDisplayMode ? 'center' : 'stretch',
            padding: isMobile ? '0 10px' : '0 32px',
            gap: isMobile || !lyricsDisplayMode ? 0 : '32px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left Side - Album Art and Controls (Desktop) or Full Content (Mobile) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: isMobile || !lyricsDisplayMode ? 1 : '0 0 50%',
              alignItems: 'center',
              justifyContent: isMobile && lyricsDisplayMode ? 'flex-end' : (isMobile ? 'flex-start' : 'center'),
              minHeight: isMobile ? 'auto' : '100%',
            }}
          >
            {/* Album Art or Lyrics Display */}
            <AlbumArtContainer sx={{ 
              minHeight: isMobile && lyricsDisplayMode ? '0' : '350px', 
              width: '100%',
              flex: isMobile && lyricsDisplayMode ? '1 1 auto' : (isMobile || !lyricsDisplayMode ? '0 0 auto' : '1 1 auto'),
              marginTop: isMobile && !lyricsDisplayMode ? '99px' : '0px',
            }}>
              {isMobile && lyricsDisplayMode && (lyricsData?.has_synced_lyrics || lyricsData?.lyrics) ? (
                <Box
                  key='lyrics-display-mobile'
                  sx={{
                    width: '100%',
                    height: '65vh',
                    maxHeight: '65vh',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    padding: '0px',
                  }}
                >
                <LyricsModernView
                  lyricsData={lyricsData}
                  loading={loadingLyrics}
                  currentTime={currentTime}
                  dominantColor={dominantColor}
                  theme={theme}
                  filteredLines={filteredLines}
                  isMainDisplay={true}
                />
                </Box>
              ) : (
                <AlbumArt key='album-cover' src={coverPath} alt={(currentTrack as any)?.title || 'Track'} />
              )}
            </AlbumArtContainer>

            {/* Track Info and Controls Container */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                flex: '0 0 auto',
                paddingBottom: isMobile && lyricsDisplayMode ? '20px' : '0',
              }}
            >
              {/* Track Info */}
              <PlayerTrackInfo
                currentTrack={currentTrack}
                onArtistClick={goToArtist}
              />

              {/* Controls Section */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  flex: '0 0 auto',
                }}
              >
              {/* Progress Bar */}
              <ProgressContainer>
                <Slider
                  value={safeCurrentTime}
                  max={safeDuration}
                  onChange={handleTimeChange}
                  onChangeCommitted={handleTimeChangeCommitted}
                  onMouseDown={() => setIsDragging(true)}
                  onTouchStart={() => setIsDragging(true)}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-track': {
                      backgroundColor: 'white',
                      height: 6,
                      borderRadius: '2.5px',
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      height: 6,
                      borderRadius: '2.5px',
                    },
                    '& .MuiSlider-thumb': {
                      backgroundColor: 'white',
                      width: 16,
                      height: 16,
                      '&:hover': {
                        boxShadow: '0 0 0 8px rgba(255,255,255,0.2)',
                      },
                    },
                    '&:hover': {
                      '& .MuiSlider-track': {
                        height: 10,
                        borderRadius: '10px',
                      },
                      '& .MuiSlider-rail': {
                        height: 10,
                        borderRadius: '10px',
                      },
                    },
                  }}
                />
                <TimeDisplay>
                  <span>{formattedCurrentTime}</span>
                  <span>{formattedDuration}</span>
                </TimeDisplay>
              </ProgressContainer>

              {/* Main Controls */}
              <MainControls>
                <ControlButton onClick={prevTrack}>
                  <BackwardIcon size={32} color='#d3d3d3' className="" />
                </ControlButton>

                <ControlButton onClick={togglePlay} play={true} sx={{ mx: 2 }}>
                  {isPlaying ? (
                    <PauseIcon size={48} color='#fff' className="" />
                  ) : (
                    <PlayIcon size={48} color='#fff' className="" />
                  )}
                </ControlButton>

                <ControlButton onClick={nextTrack}>
                  <ForwardIcon size={32} color='#d3d3d3' className="" />
                </ControlButton>
              </MainControls>

              {/* Secondary Controls */}
              <SecondaryControls>
                <ControlButton
                  onClick={handleToggleLike}
                  className='secondary'
                  sx={{
                    color: (currentTrack as any)?.is_liked ? '#ff2d55' : 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      color: (currentTrack as any)?.is_liked ? '#ff2d55' : 'white',
                    },
                  }}
                >
                  {(currentTrack as any)?.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </ControlButton>

                {(lyricsData?.has_synced_lyrics || lyricsData?.lyrics) && (
                  <ControlButton
                    onClick={handleToggleLyricsDisplay}
                    className='secondary'
                    sx={{
                      color: lyricsDisplayMode ? '#9a7ace' : 'rgba(255,255,255,0.8)',
                      '&:hover': { color: lyricsDisplayMode ? '#9a7ace' : 'white' },
                    }}
                  >
                    <LyricsIcon className="" />
                  </ControlButton>
                )}

                <ControlButton
                  onClick={handleCopyLink}
                  className='secondary'
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    '&:hover': { color: 'white' },
                  }}
                >
                  <ContentCopy size={24} color='rgb(255, 255, 255)' className="" />
                </ControlButton>

                <ControlButton
                  onClick={handleOpenLyricsEditor}
                  className='secondary'
                  sx={{
                    color: showLyricsEditor ? '#9a7ace' : 'rgba(255,255,255,0.8)',
                    '&:hover': { color: showLyricsEditor ? '#9a7ace' : 'white' },
                  }}
                >
                  <EditIcon sx={{ fontSize: 24 }} />
                </ControlButton>
              </SecondaryControls>
              

            </Box>
          </Box>
          </Box>

          {/* Right Side - Lyrics Display (Desktop only) */}
          {!isMobile && lyricsDisplayMode && (lyricsData?.has_synced_lyrics || lyricsData?.lyrics) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: '0 0 50%',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                maxHeight: '100vh',
                paddingLeft: '32px',
                paddingRight: '16px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <LyricsModernView
                  lyricsData={lyricsData}
                  loading={loadingLyrics}
                  currentTime={currentTime}
                  dominantColor={dominantColor}
                  theme={theme}
                  filteredLines={filteredLines}
                  isMainDisplay={true}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Lyrics Editor Panel */}
        {showLyricsEditor && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'rgba(25, 25, 25, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '24px',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <IconButton
              onClick={() => setShowLyricsEditor(false)}
              sx={{
                position: 'absolute',
                top: '8px',
                left: '24px',
                color: 'rgba(255,255,255,0.7)',
                '&:hover': { color: 'white' },
                zIndex: 1,
              }}
            >
              <CloseIcon size={24} color='rgba(255,255,255,0.7)' className="" />
            </IconButton>

            <Box
              sx={{
                width: '100%',
                maxWidth: 800,
                mx: 'auto',
                position: 'relative',
                mt: 2.5,
              }}
            >
              <LyricsEditorContent
                lyricsData={lyricsData}
                currentTrack={currentTrack}
                lyricsText={lyricsText}
                lyricsError={lyricsError}
                isSaving={isSaving}
                uploading={uploading}
                menuAnchorEl={menuAnchorEl}
                fileInputRef={fileInputRef}
                dominantColor={dominantColor}
                getActiveColor={activeColor}
                getButtonBackgroundColor={buttonBackgroundColor}
                handleLyricsChange={handleLyricsChange}
                handleSaveLyrics={handleSaveLyrics}
                handleOpenMenu={handleOpenMenu}
                handleCloseMenu={handleCloseMenu}
                handleDownloadLyricsForSync={handleDownloadLyricsForSync}
                handleOpenFileSelector={handleOpenFileSelector}
                handleFileSelected={handleFileSelected}
                onCancel={() => setShowLyricsEditor(false)}
                onOpenTimestampEditor={handleOpenTimestampEditor}
              />
            </Box>
          </Box>
        )}

        {/* Close Button - Always at Bottom */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '30px',
            width: '120px',
          }}
        >
          <CloseButton onClick={onClose}>
          <svg width="59" height="15" viewBox="0 0 59 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M59 1.86043L54.8542 3.57628e-07L29.4613 11.06L26.753 9.88068L26.7679 9.88656L4.20833 0.0594871L-9.53674e-07 1.89312C6.23512 4.6092 23.6429 12.192 29.4613 14.7266C33.7857 12.8441 29.5714 14.6799 59 1.86043Z" fill="white"/>
</svg>


          </CloseButton>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={constants.TIMING.SNACKBAR_AUTO_HIDE}
          onClose={handleSnackbarClose}
          sx={{ zIndex: 1002 }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PlayerContainer>
    </Dialog>
  );
});

// Компонент портала
const FullScreenPlayerPortal: React.FC<FullScreenPlayerProps> = memo(({ open, onClose }) => {
  const portalContainer = usePortal(open);

  if (!open || !portalContainer) return null;

  return ReactDOM.createPortal(
    <FullScreenPlayerCore open={open} onClose={onClose} />,
    portalContainer
  );
});

// Компонент для отдельной строки текста с fade эффектом
const LyricsLine: React.FC<{
  text: string;
  isActive?: boolean;
  isPrevious?: boolean;
  isNext?: boolean;
  isAfterNext?: boolean;
  isPrevPrev?: boolean;
  lineKey: string;
  isMainDisplay?: boolean;
  isNewLine?: boolean;
}> = memo(({
  text,
  isActive,
  isPrevious,
  isNext,
  isAfterNext,
  isPrevPrev,
  lineKey,
  isMainDisplay,
  isNewLine = false,
}) => {
  const baseStyles = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    lineHeight: isActive ? 1.2 : 1.1,
    letterSpacing: isActive ? '-0.02em' : '-0.01em',
    textShadow: 'none',
    width: '100%',
    margin: '0 auto',
    wordBreak: 'break-word',
    textAlign: 'left' as const,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute' as const,
    transform: 'translateY(-50%)',
    zIndex: isActive ? 10 : 5,

  };

      if (isActive) {
      return (
        <Box
          key={`active-${lineKey}`}
          className='lyrics-line'
          sx={{
            ...baseStyles,
            top: '50%',
            opacity: 1,
            filter: 'none',
            transform: 'translateY(-50%) scale(1)',
            transition: 'transform 0.3s ease-out',
          }}
        >
        <Typography
          variant='h3'
          sx={{
            color: 'white',
            fontSize: isMainDisplay
              ? { xs: '2rem', sm: '2.4rem', md: '2.8rem' }
              : { xs: '1.6rem', sm: '1.8rem' },
            fontWeight: 600,
            ...baseStyles,
            maxWidth: isMainDisplay
              ? { xs: '95%', sm: '90%', md: '100%', lg: '100%' }
              : { xs: '98%', sm: '95%' },
            minHeight: isMainDisplay ? '3.5em' : '2.5em',
            position: 'static',
            textShadow:
              '0 4px 20px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.1)',
          }}
        >
          {text}
        </Typography>
      </Box>
    );
  }

      if (isPrevious) {
      return (
        <Box
          key={`prev-${lineKey}`}
          className='lyrics-line'
          sx={{
            ...baseStyles,
            top: '25%',
            opacity: 0.5,
            filter: 'blur(0.5px)',
            transform: 'translateY(-50%) scale(0.9)',
          }}
        >
        <Typography
          variant='h5'
          sx={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: isMainDisplay
              ? { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' }
              : { xs: '1rem', sm: '1.2rem' },
            fontWeight: 700,
            ...baseStyles,
            maxWidth: isMainDisplay
              ? { xs: '92%', sm: '87%', md: '82%', lg: '75%' }
              : { xs: '96%', sm: '92%' },
            position: 'static',
          }}
        >
          {text}
        </Typography>
      </Box>
    );
  }

      if (isNext) {
      return (
        <Box
          key={`next-${lineKey}`}
          className='lyrics-line'
          sx={{
            ...baseStyles,
            top: '60%',
            opacity: 0.5,
            filter: 'blur(0.5px)',
            transform: 'translateY(-50%) scale(0.9)',
          }}
        >
        <Typography
          variant='h6'
          sx={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: isMainDisplay
              ? { xs: '1rem', sm: '1.2rem', md: '1.4rem' }
              : { xs: '0.9rem', sm: '1rem' },
            fontWeight: 700,
            ...baseStyles,
            maxWidth: '100%',
            position: 'static',
          }}
        >
          {text}
        </Typography>
      </Box>
    );
  }

  if (isPrevPrev) {
    return (
      <Box
        key={`prev-prev-${lineKey}`}
        className='lyrics-line'
        sx={{
          ...baseStyles,
          top: '15%',
          opacity: 0.3,
          filter: 'none',
          transform: 'translateY(-50%) scale(0.85)',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            color: 'rgba(255,255,255,0.25)',
            fontSize: isMainDisplay
              ? { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
              : { xs: '0.7rem', sm: '0.8rem' },
            fontWeight: 700,
            ...baseStyles,
            maxWidth: '100%',

            position: 'static',
          }}
        >
          {text}
        </Typography>
      </Box>
    );
  }

  if (isAfterNext) {
    return (
      <Box
        key={`after-next-${lineKey}`}
        className='lyrics-line'
        sx={{
          ...baseStyles,
          top: '70%',
          opacity: 0.35,
          filter: 'none',
          transform: 'translateY(-50%) scale(0.85)',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: isMainDisplay
              ? { xs: '0.9rem', sm: '1rem', md: '1.2rem' }
              : { xs: '0.8rem', sm: '0.9rem' },
            fontWeight: 700,
            ...baseStyles,
            maxWidth: '100%',
            position: 'static',
          }}
        >
          {text}
        </Typography>
      </Box>
    );
  }

  return null;
},
(prevProps, nextProps) => {
  // Предотвращаем ненужные обновления во время анимаций
  return (
    prevProps.text === nextProps.text &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isPrevious === nextProps.isPrevious &&
    prevProps.isNext === nextProps.isNext &&
    prevProps.isAfterNext === nextProps.isAfterNext &&
    prevProps.isPrevPrev === nextProps.isPrevPrev &&
    prevProps.lineKey === nextProps.lineKey &&
    prevProps.isMainDisplay === nextProps.isMainDisplay &&
    prevProps.isNewLine === nextProps.isNewLine
  );
});


// Компонент для статических текстов
const StaticLyricsLine: React.FC<{ text: string; index: number; isMainDisplay?: boolean }> = memo(({ text, index, isMainDisplay }) => (
  <Typography
    variant='h5'
    className='lyrics-line'
    sx={{
      color: 'white',
      fontSize: isMainDisplay
        ? { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' }
        : { xs: '1.2rem', sm: '1.4rem' },
      fontWeight: 500,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.1,
      letterSpacing: '-0.01em',
      mb: 0,
      textShadow: '0 2px 8px rgba(0,0,0,0.2)',
      width: '100%',
      maxWidth: '100%',

      margin: '0 auto',
      wordBreak: 'break-word',
      hyphens: 'auto',
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
      overflowWrap: 'break-word',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: '0.8rem',
      paddingTop: '0.4rem',
      opacity: 1,
    }}
  >
    {text}
  </Typography>
));

// Основной компонент для отображения лириков
const LyricsModernView: React.FC<{
  lyricsData: any;
  loading: boolean;
  currentTime: number;
  dominantColor: any;
  theme: any;
  filteredLines: any[];
  isMainDisplay?: boolean;
}> = memo(({
  lyricsData,
  loading,
  currentTime,
  dominantColor,
  theme,
  filteredLines,
  isMainDisplay = false,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isNewLine, setIsNewLine] = useState(false);
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  // Оптимизированное обновление строк с fade эффектом
  const updateCurrentLine = useCallback(
    (time: number) => {
      if (
        !lyricsData?.has_synced_lyrics ||
        !filteredLines ||
        filteredLines.length === 0
      )
        return;

      const currentTimeMs = time * 1000;

      // Бинарный поиск для оптимизации
      let left = 0;
      let right = filteredLines.length - 1;
      let newLineIndex = -1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (filteredLines[mid].startTimeMs <= currentTimeMs) {
          newLineIndex = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }



      if (newLineIndex !== currentLineIndex && newLineIndex >= 0) {
        setCurrentLineIndex(newLineIndex);
        setIsNewLine(true);
        
        // Плавный fade in для новой строки (уменьшено время)
        setTimeout(() => {
          setIsNewLine(false);
        }, 50);
      }
    },
    [lyricsData, filteredLines, currentLineIndex]
  );

  useEffect(() => {
    updateCurrentLine(currentTime);
  }, [currentTime, updateCurrentLine]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: isMainDisplay ? '100%' : 400,
          minHeight: isMainDisplay ? '350px' : 400,
          width: '100%',
        }}
      >
        <CircularProgress
          size={46}
          thickness={4}
          sx={{
            color: dominantColor
              ? `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`
              : theme.palette.primary.main,
          }}
        />
      </Box>
    );
  }

  if (!lyricsData || !filteredLines || filteredLines.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
          py: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '350px',
        }}
      >
        <Typography variant='h6' sx={{ mb: 2 }}>
          Нет текста песни для этого трека
        </Typography>
      </Box>
    );
  }

  // Синхронизированные тексты
  if (lyricsData.has_synced_lyrics && filteredLines.length > 0) {
    return (
      <Box
        className='lyrics-container'
        sx={{
          width: '100%',
          height: '100%',
          minHeight: '350px',
          display: 'flex',
          maxWidth: isMainDisplay ? '650px' : '850px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Весь текст создается сразу и поднимается вверх */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: `${filteredLines.length * (isMainDisplay ? 130 : 115)}px`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            transform: `translateY(calc(50% - ${(currentLineIndex * (isMainDisplay ? 130 : 115)) + (isMainDisplay ? 65 : 57.5)}px))`,
            transition: 'transform 0.4s ease-out',
            gap: isMainDisplay ? '40px' : '25px',
          }}
        >
          {filteredLines.map((line, index) => {
            const distanceFromCurrent = index - currentLineIndex;
            const isActive = index === currentLineIndex;
            const isNearby = Math.abs(distanceFromCurrent) <= 2;
            
            // Определяем стили в зависимости от позиции
            let lineStyles = {
              opacity: 0.3,
              fontSize: isMainDisplay 
                ? { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                : { xs: '0.8rem', sm: '0.9rem' },
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              filter: 'blur(1.5px)',
              transform: 'scale(0.9)',
            };

            if (isActive) {
              lineStyles = {
                opacity: 1,
                fontSize: isMainDisplay 
                  ? { xs: '1.8rem', sm: '2.2rem', md: '2.6rem' }
                  : { xs: '1.4rem', sm: '1.6rem' },
                fontWeight: 700,
                color: 'white',
                filter: 'none',
                transform: 'scale(1)',
              };
            } else if (distanceFromCurrent === -1) {
              // Предыдущая строка
              lineStyles = {
                opacity: 0.6,
                fontSize: isMainDisplay 
                  ? { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                  : { xs: '0.9rem', sm: '1.1rem' },
                fontWeight: 700,
                color: 'rgba(255,255,255,0.6)',
                filter: 'blur(0.5px)',
                transform: 'scale(0.95)',
              };
            } else if (distanceFromCurrent === 1) {
              // Следующая строка
              lineStyles = {
                opacity: 0.5,
                fontSize: isMainDisplay 
                  ? { xs: '0.9rem', sm: '1.1rem', md: '1.3rem' }
                  : { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                filter: 'blur(0.5px)',
                transform: 'scale(0.92)',
              };
            }

            return (
              <Box
                key={line.key}
                sx={{
                  width: '100%',
                  minHeight: isMainDisplay ? '90px' : '70px',
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.3s ease-out',
                  padding: isMainDisplay ? '0px' : '0 16px',
                  boxSizing: 'border-box',
                  ...lineStyles,
                }}
              >
                <Typography
                  variant={isActive ? 'h4' : 'h4'}
                  sx={{
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                    lineHeight: 1.2,
                    letterSpacing: isActive ? '-0.02em' : '-0.01em',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: isActive 
                      ? '100%'
                      : distanceFromCurrent === -1 || distanceFromCurrent === 1
                      ? '100%'
                      : '100%',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',

                    fontWeight: 'var(--font-weight-black, 700)',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  {line.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // Статические тексты
  if (lyricsData.lyrics && filteredLines.length > 0) {
    return (
      <Box
        className='lyrics-container'
        sx={{
          width: '100%',
          height: '100%',
          minHeight: '350px',
          maxHeight: '350px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'auto',
          padding: isMainDisplay ? '20px 16px' : '15px 12px',
          '&::-webkit-scrollbar': { 
            width: '6px',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '3px',
          },
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ 
          width: '100%',
          maxWidth: isMainDisplay ? '100%' : '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
        }}>
          {filteredLines.map((line, index) => (
            <StaticLyricsLine
              key={line.key}
              text={line.text}
              index={index}
              isMainDisplay={isMainDisplay}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return null;
});

// Lyrics Editor Content Component
const LyricsEditorContent: React.FC<{
  lyricsData: any;
  currentTrack: any;
  lyricsText: string;
  lyricsError: string | null;
  isSaving: boolean;
  uploading: boolean;
  menuAnchorEl: HTMLElement | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dominantColor: any;
  getActiveColor: string;
  getButtonBackgroundColor: string;
  handleLyricsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveLyrics: () => void;
  handleOpenMenu: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseMenu: () => void;
  handleDownloadLyricsForSync: () => void;
  handleOpenFileSelector: () => void;
  handleFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onOpenTimestampEditor: () => void;
}> = memo(({
  lyricsData,
  currentTrack,
  lyricsText,
  lyricsError,
  isSaving,
  uploading,
  menuAnchorEl,
  fileInputRef,
  dominantColor,
  getActiveColor,
  getButtonBackgroundColor,
  handleLyricsChange,
  handleSaveLyrics,
  handleOpenMenu,
  handleCloseMenu,
  handleDownloadLyricsForSync,
  handleOpenFileSelector,
  handleFileSelected,
  onCancel,
  onOpenTimestampEditor,
}) => {
  return (
    <Box sx={{ width: '100%', zIndex: 99000 }}>
      <Typography
        variant='h5'
        sx={{
          color: 'white',
          mb: 3,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Редактирование текста
      </Typography>

      {lyricsError && (
        <Alert severity='error' variant='filled' sx={{ mb: 2 }}>
          {lyricsError}
        </Alert>
      )}

      <Alert
        severity='info'
        icon={<WarningIcon />}
        variant='outlined'
        sx={{
          mb: 3,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        Вы можете найти тексты песен на Genius или других сервисах.
        Пожалуйста, соблюдайте авторские права при добавлении текстов.
      </Alert>

      <TextField
        multiline
        fullWidth
        variant='outlined'
        value={lyricsText}
        onChange={handleLyricsChange}
        placeholder='Введите текст песни здесь...'
        minRows={10}
        maxRows={20}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.05)',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.15)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.3)',
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: `${getActiveColor} !important`,
            borderWidth: '1px',
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255,255,255,0.5)',
            opacity: 1,
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Button
          variant='outlined'
          onClick={handleOpenMenu}
          startIcon={<ScheduleIcon />}
          sx={{
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.8)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderColor: 'rgba(255,255,255,0.5)',
            },
          }}
        >
          Синхронизация
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onCancel}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
              },
            }}
          >
            Отмена
          </Button>

          <Button
            variant='contained'
            onClick={handleSaveLyrics}
            disabled={isSaving || uploading}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Box>
      </Box>

      {/* LRC File handling menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: {
            backgroundColor: 'var(--theme-background, rgba(25, 25, 25, 0.95))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            color: 'white',
            minWidth: '250px',
          },
        }}
      >
        <MenuItem
          onClick={handleDownloadLyricsForSync}
          sx={{
            padding: '12px',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <DownloadIcon
            sx={{
              marginRight: '12px',
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.7)',
            }}
          />
          <Typography variant='body2'>
            Скачать LRC шаблон для синхронизации
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={handleOpenFileSelector}
          sx={{
            padding: '12px',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
          }}
        >
          <UploadIcon
            sx={{
              marginRight: '12px',
              fontSize: '1.2rem',
              color: 'rgba(255,255,255,0.7)',
            }}
          />
          <Typography variant='body2'>
            Загрузить синхронизацию (LRC/JSON)
          </Typography>
        </MenuItem>
      </Menu>

      {/* Hidden file input for upload */}
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept='.lrc,.json'
        style={{ display: 'none' }}
      />
    </Box>
  );
});

export default FullScreenPlayerPortal;
