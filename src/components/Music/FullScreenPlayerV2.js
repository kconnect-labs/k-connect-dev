import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  useMediaQuery, 
  useTheme, 
  IconButton, 
  Typography, 
  Slider,
  LinearProgress,
  Avatar,
  Chip,
  Fade,
  Zoom,
  Grow,
  CircularProgress
} from '@mui/material';
import { 
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  QueueMusic as QueueMusicIcon,
  Lyrics as LyricsIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../../context/MusicContext';
import { extractDominantColor } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from '@emotion/styled';
import { Lrc } from 'react-lrc';
import { 
  PlayIcon, 
  PauseIcon, 
  BackwardIcon, 
  ForwardIcon, 
  ShuffleIcon, 
  RepeatIcon,
  CloseIcon
} from '../icons/CustomIcons';

const defaultCover = '/static/uploads/system/album_placeholder.jpg';

// Функция для получения полного URL
const getFullUrl = (path) => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost');
  
  if (isLocalhost && !path.startsWith('http')) {
    return `https://k-connect.ru${path}`;
  }
  
  return path;
};

// Стилизованные компоненты
const PlayerContainer = styled(Box)(({ theme, dominantColor, coverPath }) => ({
  position: 'relative',
  width: '100%',
  height: '100vh',
  background: dominantColor 
    ? `linear-gradient(135deg, ${dominantColor}15 0%, ${dominantColor}08 50%, rgba(0,0,0,0.95) 100%)`
    : 'linear-gradient(135deg, rgba(140,82,255,0.1) 0%, rgba(0,0,0,0.95) 100%)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url(${coverPath || getFullUrl(defaultCover)}) center/cover`,
    opacity: 0.55,
    filter: 'blur(40px)',
    zIndex: -1
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3, 4),
  position: 'relative',
  zIndex: 2
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: 'rgba(255,255,255,0.8)',
  backgroundColor: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: 'scale(1.05)'
  },
  transition: 'all 0.2s ease'
}));

const AlbumArtContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
  padding: theme.spacing(4),
  position: 'relative'
}));

const AlbumArt = styled(motion.img)(({ theme }) => ({
  width: 'min(70vw, 400px)',
  height: 'min(70vw, 400px)',
  borderRadius: '20px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  objectFit: 'cover',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
  }
}));

const ControlsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4, 4, 6),
  gap: theme.spacing(3),
  position: 'relative',
  zIndex: 2
}));

const TrackInfo = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  maxWidth: '600px',
  marginBottom: theme.spacing(2)
}));

const TrackTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: 'white',
  marginBottom: theme.spacing(1),
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem'
  }
}));

const TrackArtist = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  color: 'rgba(255,255,255,0.8)',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: 'white',
    textDecoration: 'underline'
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem'
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const TimeDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.75rem',
  fontFamily: 'var(--FF_TITLE, inherit)',
  margin: '5px',
  userSelect: 'none'
}));

const MainControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2)
}));

// Apple Music style control button (без фона, бордеров, теней)
const ControlButton = styled(IconButton)(({ theme, active, play }) => ({
  background: 'none',
  border: 'none',
  boxShadow: 'none',
  borderRadius: 0,
  padding: play ? 8 : 4,
  margin: 0,
  color: active ? '#fff' : '#d3d3d3',
  transition: 'color 0.2s',
  '&:hover': {
    color: '#fff',
    background: 'none',
    boxShadow: 'none',
    border: 'none'
  },
  minWidth: 0,
  minHeight: 0
}));

const SecondaryControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

const VolumeControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: '120px'
}));

// Новый компонент LyricsModernView
const LyricsModernView = ({ lyricsData, loading, currentTime, dominantColor, theme }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={46} thickness={4} sx={{ color: dominantColor || theme.palette.primary.main }} />
      </Box>
    );
  }
  if (!lyricsData) {
    return (
      <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', py: 6 }}>
        <Typography variant="h6">Нет текста песни для этого трека</Typography>
      </Box>
    );
  }
  if (lyricsData.has_synced_lyrics && Array.isArray(lyricsData.synced_lyrics)) {
    // Преобразуем в LRC-формат
    const lrcContent = lyricsData.synced_lyrics.map(line => {
      if (!line.text?.trim()) return '';
      const ms = line.startTimeMs || 0;
      const min = String(Math.floor(ms / 60000)).padStart(2, '0');
      const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
      const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
      return `[${min}:${sec}.${cs}]${line.text}`;
    }).join('\n');
    return (
      <Box sx={{ 
        width: '100%', 
        height: { xs: 600, sm: 700, md: 800 }, 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'flex-start', 
        background: 'unset', 
        p: { xs: 1, sm: 2, md: 3 }, 
        overflow: 'hidden',
        '& .lrc-container': {
          scrollBehavior: 'smooth',
          transition: 'scroll-behavior 0.3s ease-in-out',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '&::-webkit-scrollbar-track': {
            display: 'none'
          },
          '&::-webkit-scrollbar-thumb': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }
      }}>
        <Lrc
          lrc={lrcContent}
          currentMillisecond={currentTime * 1000}
          lineRenderer={({ line, active }) => (
            <Typography
              variant={active ? 'h5' : 'body1'}
              sx={{
                color: active ? 'white' : 'rgba(255,255,255,0.7)',
                fontWeight: active ? 600 : 400,
                fontSize: active ? { xs: '1.4rem', sm: '1.8rem' } : { xs: '1.2rem', sm: '1.4rem' },
                textAlign: 'left',
                opacity: active ? 1 : 0.6,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                py: 0.5,
                px: 1,
                mb: 0.5,
                transform: active ? 'scale(1.05)' : 'scale(1)',
                filter: active ? 'blur(0px)' : 'blur(1.5px)'
              }}
            >
              {line.content}
            </Typography>
          )}
          recoverAutoScrollInterval={3000}
          className="lrc-container"
          style={{ 
            width: '100%', 
            height: '100%', 
            overflow: 'auto', 
            scrollBehavior: 'smooth',
            scrollPaddingTop: '40%',
            scrollPaddingBottom: '40%'
          }}
        />
      </Box>
    );
  }
  if (lyricsData.lyrics) {
    return (
      <Box sx={{ width: '100%', height: { xs: 600, sm: 700, md: 800 }, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', background: 'unset', backdropFilter: 'blur(20px)', borderRadius: 1, p: { xs: 1, sm: 2, md: 3 }, overflow: 'auto' }}>
        <Typography variant="body1" sx={{ color: 'white', whiteSpace: 'pre-line', textAlign: 'left', fontSize: { xs: '1.2rem', sm: '1.4rem' }, lineHeight: 1.8 }}>
          {lyricsData.lyrics}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', py: 6 }}>
      <Typography variant="h6">Текст песни не найден</Typography>
    </Box>
  );
};

const FullScreenPlayerV2 = ({ open, onClose, ...props }) => {
  const [dominantColor, setDominantColor] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [lyricsData, setLyricsData] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadingLyrics, setUploadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();

  const { 
    currentTrack,
    currentSection,
    playlistTracks,
    playTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    audioRef,
    currentTime: contextCurrentTime,
    duration: contextDuration,
    volume: contextVolume,
    setVolume: setContextVolume,
    isShuffled,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = useMusic();

  // Синхронизация времени и громкости с контекстом
  useEffect(() => {
    setCurrentTime(contextCurrentTime || 0);
    setDuration(contextDuration || 0);
    setVolume(contextVolume || 1);
  }, [contextCurrentTime, contextDuration, contextVolume]);

  // Извлечение доминирующего цвета из обложки
  useEffect(() => {
    if (currentTrack?.cover_path) {
      extractDominantColor(
        currentTrack.cover_path || defaultCover,
        (color) => {
          setDominantColor(color);
        }
      );
    }
  }, [currentTrack]);

  // Загрузка текстов песен
  useEffect(() => {
    if (currentTrack?.id && open) {
      setLoadingLyrics(true);
      
      if (currentTrack.lyricsData) {
        setLyricsData(currentTrack.lyricsData);
        setLoadingLyrics(false);
      } else {
        fetch(`/api/music/${currentTrack.id}/lyrics`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Lyrics not found');
            }
            return response.json();
          })
          .then(data => {
            setLyricsData(data);
            setLoadingLyrics(false);
            
            if (currentTrack) {
              currentTrack.lyricsData = data;
            }
          })
          .catch(error => {
            console.error('Error fetching lyrics:', error);
            setLyricsData(null);
            setLoadingLyrics(false);
          });
      }
    } else {
      setLyricsData(null);
      setLoadingLyrics(false);
    }
  }, [currentTrack, open]);

  // Управление скроллом страницы
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Обработчики
  const handleTimeChange = (event, newValue) => {
    if (audioRef?.current) {
      audioRef.current.currentTime = newValue;
      setCurrentTime(newValue);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    setContextVolume(newValue);
    setIsMuted(newValue === 0);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(1);
      setContextVolume(1);
      setIsMuted(false);
    } else {
      setVolume(0);
      setContextVolume(0);
      setIsMuted(true);
    }
  };

  const handleToggleLike = async () => {
    if (!currentTrack?.id) return;
    
    try {
      const response = await axios.post(`/api/music/${currentTrack.id}/like`);
      setIsLiked(response.data.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && currentTrack) {
      navigator.share({
        title: currentTrack.title,
        text: `${currentTrack.title} - ${currentTrack.artist}`,
        url: `${window.location.origin}/music/${currentTrack.id}`
      });
    } else {
      // Fallback - copy to clipboard
      const url = `${window.location.origin}/music/${currentTrack.id}`;
      navigator.clipboard.writeText(url);
    }
  };

  const goToArtist = async (artistName) => {
    if (!artistName || artistName.trim() === '') return;
    
    try {
      const response = await axios.get(`/api/search/artists?query=${encodeURIComponent(artistName)}`);
      
      if (response.data?.artists?.length > 0) {
        const exactMatch = response.data.artists.find(
          a => a.name.toLowerCase() === artistName.toLowerCase()
        );
        
        if (exactMatch) {
          navigate(`/artist/${exactMatch.id}`);
          onClose();
          return;
        }
        
        navigate(`/artist/${response.data.artists[0].id}`);
        onClose();
      }
    } catch (error) {
      console.error('Error searching artist:', error);
    }
  };

  const handleUploadLyrics = async () => {
    if (!currentTrack?.id) return;
    
    setUploadingLyrics(true);
    setLyricsError(null);
    
    try {
      const response = await fetch(`/api/music/${currentTrack.id}/lyrics/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: `[ti:${currentTrack.title || 'Unknown Title'}]\n[ar:${currentTrack.artist || 'Unknown Artist'}]\n[al:${currentTrack.album || 'Unknown Album'}]\n[by:К-Коннект Авто-Генерация]\n\n[00:00.00]Текст песни будет добавлен здесь\n[00:05.00]Вы можете отредактировать этот шаблон\n[00:10.00]И добавить правильные временные метки`,
          source_url: 'manually_added'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Перезагружаем тексты после успешной загрузки
        const lyricsResponse = await fetch(`/api/music/${currentTrack.id}/lyrics`);
        if (lyricsResponse.ok) {
          const newLyricsData = await lyricsResponse.json();
          setLyricsData(newLyricsData);
          if (currentTrack) {
            currentTrack.lyricsData = newLyricsData;
          }
        }
        setShowLyrics(true);
      } else {
        setLyricsError(data.error || 'Не удалось загрузить текст песни');
      }
    } catch (error) {
      console.error('Error uploading lyrics:', error);
      setLyricsError('Ошибка при загрузке текста песни');
    } finally {
      setUploadingLyrics(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCoverPath = (track) => {
    if (!track?.cover_path) return getFullUrl(defaultCover);
    
    let coverPath = track.cover_path;
    
    // Если путь уже полный URL, возвращаем как есть
    if (coverPath.startsWith('http')) {
      return coverPath;
    }
    
    // Добавляем /static/ если нужно
    if (!coverPath.startsWith('/static/')) {
      if (coverPath.startsWith('static/')) {
        coverPath = `/${coverPath}`;
      } else {
        coverPath = `/static/music/${coverPath}`;
      }
    }
    
    return getFullUrl(coverPath);
  };

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
          overflow: 'hidden'
        }
      }}
    >
      <PlayerContainer dominantColor={dominantColor} coverPath={getCoverPath(currentTrack)}>
        {/* Header */}
        <HeaderSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CloseButton onClick={onClose}>
              <KeyboardArrowDownIcon />
            </CloseButton>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              Сейчас играет
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setShowLyrics(!showLyrics)}
              sx={{
                color: showLyrics ? theme.palette.primary.main : 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <LyricsIcon />
            </IconButton>
          </Box>
        </HeaderSection>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: theme.spacing(0, 4)
        }}>
          {/* Album Art */}
          <AlbumArtContainer sx={{maxHeight:'390px',}}>
            <AlbumArt
              src={getCoverPath(currentTrack)}
              alt={currentTrack.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
   
            />
          </AlbumArtContainer>

          {/* Track Info */}
          <TrackInfo>
            <TrackTitle variant="h3">
              {currentTrack.title}
            </TrackTitle>
            <TrackArtist 
              variant="h5" 
              onClick={() => goToArtist(currentTrack.artist)}
            >
              {currentTrack.artist}
            </TrackArtist>
            {currentTrack.album && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem'
                }}
              >
                {currentTrack.album}
              </Typography>
            )}
          </TrackInfo>

          {/* Progress Bar */}
          <ProgressContainer>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleTimeChange}
              sx={{
                color: 'white',
                '& .MuiSlider-track': {
                  backgroundColor: 'white',
                  height: 6,
                  borderRadius: '2.5px'
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  height: 6,
                  borderRadius: '2.5px'
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: 'white',
                  width: 16,
                  height: 16,
                  '&:hover': {
                    boxShadow: '0 0 0 8px rgba(255,255,255,0.2)'
                  }
                },
                '&:hover': {
                  '& .MuiSlider-track': {
                    height: 10,
                    borderRadius: '10px'
                  },
                  '& .MuiSlider-rail': {
                    height: 10,
                    borderRadius: '10px'
                  }
                },
              }}
            />
            <TimeDisplay>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </TimeDisplay>
          </ProgressContainer>

          {/* Main Controls */}
          <MainControls>
            <ControlButton onClick={toggleShuffle} active={isShuffled ? 1 : 0}>
              <ShuffleIcon size={28} color={isShuffled ? '#fff' : '#d3d3d3'} />
            </ControlButton>
            
            <ControlButton onClick={prevTrack}>
              <BackwardIcon size={32} color="#d3d3d3" />
            </ControlButton>
            
            <ControlButton 
              onClick={togglePlay}
              play={1}
              sx={{ mx: 2 }}
            >
              {isPlaying
                ? <PauseIcon size={48} color="#fff" />
                : <PlayIcon size={48} color="#fff" />}
            </ControlButton>
            
            <ControlButton onClick={nextTrack}>
              <ForwardIcon size={32} color="#d3d3d3" />
            </ControlButton>
            
            <ControlButton onClick={toggleRepeat} active={repeatMode !== 'off' ? 1 : 0}>
              <RepeatIcon size={28} color={repeatMode !== 'off' ? '#fff' : '#d3d3d3'} />
            </ControlButton>
          </MainControls>

          {/* Secondary Controls */}
          <SecondaryControls>
            <ControlButton
              onClick={handleToggleLike}
              className="secondary"
              sx={{
                color: isLiked ? '#ff2d55' : 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: isLiked ? '#ff2d55' : 'white'
                }
              }}
            >
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </ControlButton>
            
            <ControlButton
              onClick={handleShare}
              className="secondary"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { color: 'white' }
              }}
            >
              <ShareIcon />
            </ControlButton>
          </SecondaryControls>
        </Box>

        {/* Lyrics Panel */}
        <AnimatePresence>
          {showLyrics && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90%',
                background: dominantColor 
                  ? `linear-gradient(135deg, ${dominantColor}20 0%, ${dominantColor}10 50%, rgba(0,0,0,0.9) 100%)`
                  : 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(60px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: theme.spacing(3),
                overflow: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }}
            >
              <IconButton
                onClick={() => setShowLyrics(false)}
                sx={{ 
                  position: 'absolute',
                  top: theme.spacing(1),
                  left: theme.spacing(3),
                  color: 'rgba(255,255,255,0.7)', 
                  '&:hover': { color: 'white' },
                  zIndex: 1
                }}
              >
                <CloseIcon size={24} color="rgba(255,255,255,0.7)" />
              </IconButton>
              
              <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', position: 'relative', mt: 2.5 }}>
                {lyricsError && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'rgba(255,0,0,0.1)', 
                    borderRadius: 1, 
                    border: '1px solid rgba(255,0,0,0.3)',
                    color: 'rgba(255,255,255,0.9)'
                  }}>
                    {lyricsError}
                  </Box>
                )}
                
                {!lyricsData && !loadingLyrics && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    color: 'rgba(255,255,255,0.7)', 
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Typography variant="h6">Текст песни не найден</Typography>
                    <ControlButton
                      onClick={handleUploadLyrics}
                      disabled={uploadingLyrics}
                      sx={{
                        color: 'rgba(255,255,255,0.8)',
                        '&:hover': { color: 'white' },
                        '&:disabled': { color: 'rgba(255,255,255,0.4)' }
                      }}
                    >
                      {uploadingLyrics ? (
                        <CircularProgress size={20} sx={{ color: 'inherit' }} />
                      ) : (
                        <Typography variant="body2">
                          Загрузить текст песни
                        </Typography>
                      )}
                    </ControlButton>
                  </Box>
                )}
                
                <LyricsModernView
                  lyricsData={lyricsData}
                  loading={loadingLyrics}
                  currentTime={currentTime}
                  dominantColor={dominantColor}
                  theme={theme}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Playlist Panel */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: theme.spacing(3),
                overflow: 'auto'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                pb: 1,
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                  Плейлист ({playlistTracks[currentSection]?.length || 0})
                </Typography>
                <IconButton
                  onClick={() => setShowPlaylist(false)}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <CloseIcon size={24} color="rgba(255,255,255,0.7)" />
                </IconButton>
              </Box>
              
              <Box sx={{ maxHeight: 'calc(100% - 80px)', overflow: 'auto' }}>
                {playlistTracks[currentSection]?.length > 0 ? (
                  playlistTracks[currentSection].map((track, index) => (
                    <Box
                      key={track.id}
                      onClick={() => playTrack(track, currentSection)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: theme.spacing(1.5),
                        borderRadius: 1,
                        marginBottom: 0.5,
                        backgroundColor: currentTrack?.id === track.id 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: currentTrack?.id === track.id 
                            ? 'rgba(255,255,255,0.3)' 
                            : 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <Avatar 
                        src={getCoverPath(track)}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      >
                        <MusicNoteIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{
                            color: currentTrack?.id === track.id ? theme.palette.primary.main : 'white',
                            fontWeight: currentTrack?.id === track.id ? 600 : 400,
                            fontSize: '0.9rem'
                          }}
                        >
                          {track.title}
                        </Typography>
                        <Typography
                          noWrap
                          sx={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.8rem'
                          }}
                        >
                          {track.artist}
                        </Typography>
                      </Box>
                      {currentTrack?.id === track.id && (
                        <PlayIcon size={24} color={theme.palette.primary.main} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    color: 'rgba(255,255,255,0.7)',
                    py: 4
                  }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Плейлист пуст
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Добавьте треки в плейлист
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </PlayerContainer>
    </Dialog>
  );
};

export default FullScreenPlayerV2; 