import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  CircularProgress,
  TextField,
  Button,
  Alert,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material';
import { 
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  QueueMusic as QueueMusicIcon,
  Lyrics as LyricsIcon,
  MusicNote as MusicNoteIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  VolumeUp as VolumeUpIcon,
  VolumeDown as VolumeDownIcon,
  VolumeMute as VolumeMuteIcon,
  VolumeOff as VolumeOffIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../../context/MusicContext';
import { extractDominantColor } from '../../utils/imageUtils';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from '@emotion/styled';

// Remove complex AMLL imports for now and use simple solution
import { 
  PlayIcon, 
  PauseIcon, 
  BackwardIcon, 
  ForwardIcon, 
  ShuffleIcon, 
  RepeatIcon,
  CloseIcon,
  ShareIcon
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

const FullScreenPlayerV2 = ({ open, onClose, ...props }) => {
  const [dominantColor, setDominantColor] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [showTimestampEditor, setShowTimestampEditor] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [lyricsData, setLyricsData] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadingLyrics, setUploadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState(null);
  
  // New states for lyrics
  const [lyricsText, setLyricsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef(null);
  
  // New state for lyrics display mode
  const [lyricsDisplayMode, setLyricsDisplayMode] = useState(false); // false = cover mode, true = lyrics mode

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
    toggleRepeat,
    likeTrack
  } = useMusic();

  // Синхронизация времени и громкости с контекстом
  useEffect(() => {
    setCurrentTime(contextCurrentTime || 0);
    setDuration(contextDuration || 0);
    setVolume(contextVolume || 1);
  }, [contextCurrentTime, contextDuration, contextVolume]);

  // Более частое обновление времени для синхронизации текстов
  useEffect(() => {
    if (!open || !lyricsData?.has_synced_lyrics) return;

    let animationId;
    const updateTimeForLyrics = () => {
      // Используем прямое время из аудио элемента для точной синхронизации
      if (audioRef?.current && !audioRef.current.paused) {
        const actualCurrentTime = audioRef.current.currentTime;
        setCurrentTime(actualCurrentTime);
      } else if (contextCurrentTime !== undefined) {
        // Fallback to context time if audio ref is not available
        setCurrentTime(contextCurrentTime);
      }
      animationId = requestAnimationFrame(updateTimeForLyrics);
    };

    animationId = requestAnimationFrame(updateTimeForLyrics);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [open, lyricsData?.has_synced_lyrics, audioRef, contextCurrentTime]);

  // Дополнительный эффект для немедленного обновления при изменении времени через слайдер
  useEffect(() => {
    if (contextCurrentTime !== undefined) {
      setCurrentTime(contextCurrentTime);
    }
  }, [contextCurrentTime]);

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
      // Принудительно обновляем время в контексте
      if (setContextVolume && typeof newValue === 'number') {
        // Используем временный хак для обновления времени
        window.audioTiming = window.audioTiming || {};
        window.audioTiming.currentTime = newValue;
      }
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
      await likeTrack(currentTrack.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!currentTrack?.id) return;
    
    const url = `https://k-connect.ru/music/track/${currentTrack.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      // Можно добавить уведомление об успешном копировании
      console.log('Ссылка скопирована в буфер обмена');
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
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

  const handleOpenLyricsEditor = useCallback(() => {
    setShowLyricsEditor(true);
    setShowLyrics(false);
    setShowTimestampEditor(false);
    // Initialize lyrics text if available
    if (lyricsData?.has_lyrics && lyricsData.lyrics) {
      setLyricsText(lyricsData.lyrics);
    } else {
      setLyricsText('');
    }
  }, [lyricsData]);

  const handleOpenTimestampEditor = useCallback(() => {
    setShowTimestampEditor(true);
    setShowLyricsEditor(false);
    setShowLyrics(false);
  }, []);

  const handleLyricsChange = (e) => {
    setLyricsText(e.target.value);
  };

  const handleSaveLyrics = async () => {
    if (!currentTrack?.id) {
      setLyricsError('Трек не выбран');
      return;
    }
    
    if (!lyricsText.trim()) {
      setLyricsError('Текст песни не может быть пустым');
      return;
    }
    
    setIsSaving(true);
    setLyricsError('');
    
    try {
      const response = await fetch(`/api/music/${currentTrack.id}/lyrics/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: lyricsText,
          source_url: 'manually_added'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Текст успешно сохранен',
          severity: 'success'
        });
        
        // Reload lyrics data
        const lyricsResponse = await fetch(`/api/music/${currentTrack.id}/lyrics`);
        if (lyricsResponse.ok) {
          const newLyricsData = await lyricsResponse.json();
          setLyricsData(newLyricsData);
          if (currentTrack) {
            currentTrack.lyricsData = newLyricsData;
          }
        }
        
        setShowLyricsEditor(false);
        setShowLyrics(true);
      } else {
        setLyricsError(data.error || 'Не удалось сохранить текст');
        
        if (data.warning) {
          setSnackbar({
            open: true,
            message: data.warning,
            severity: 'warning'
          });
        }
      }
    } catch (error) {
      console.error('Error saving lyrics:', error);
      setLyricsError('Ошибка при сохранении текста. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const handleDownloadLyricsForSync = () => {
    if (!currentTrack?.id || !lyricsText.trim()) {
      setLyricsError('Нет доступного текста для скачивания');
      return;
    }

    try {
      const lines = lyricsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      let lrcContent = "[ti:" + (currentTrack.title || "Unknown Title") + "]\n";
      lrcContent += "[ar:" + (currentTrack.artist || "Unknown Artist") + "]\n";
      lrcContent += "[al:" + (currentTrack.album || "Unknown Album") + "]\n";
      lrcContent += "[by:К-Коннект Авто-Генерация LRC]\n\n";
      
      lines.forEach(line => {
        lrcContent += "[00:00.00]" + line + "\n";
      });
      
      const lrcBlob = new Blob([lrcContent], { type: 'text/plain' });
      const lrcUrl = URL.createObjectURL(lrcBlob);
      const lrcLink = document.createElement('a');
      lrcLink.href = lrcUrl;
      lrcLink.download = `${currentTrack.artist} - ${currentTrack.title}.lrc`;
      
      setSnackbar({
        open: true,
        message: 'Скачивание шаблона LRC для синхронизации',
        severity: 'info'
      });
      
      lrcLink.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(lrcUrl);
      }, 2000);
      
      handleCloseMenu();
    } catch (error) {
      console.error("Error generating download template:", error);
      setLyricsError('Ошибка при создании шаблона для синхронизации');
    }
  };

  const handleOpenFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleCloseMenu();
  };

  const handleFileSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    uploadSyncFile(file);
  };

  const uploadSyncFile = async (file) => {
    if (!file || !currentTrack?.id) {
      setLyricsError('Нет файла для загрузки или трек не выбран');
      return;
    }
    
    setUploading(true);
    setLyricsError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/music/${currentTrack.id}/lyrics/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить файл синхронизации');
      }
      
      const result = await response.json();
      
      setSnackbar({
        open: true,
        message: 'Синхронизация успешно загружена',
        severity: 'success'
      });
      
      // Reload lyrics data
      const lyricsResponse = await fetch(`/api/music/${currentTrack.id}/lyrics`);
      if (lyricsResponse.ok) {
        const newLyricsData = await lyricsResponse.json();
        setLyricsData(newLyricsData);
        if (currentTrack) {
          currentTrack.lyricsData = newLyricsData;
        }
      }
      
      setShowLyricsEditor(false);
      setShowLyrics(true);
      
    } catch (error) {
      console.error("Error uploading sync file:", error);
      setLyricsError(`Ошибка при загрузке файла: ${error.message}`);
      
      setSnackbar({
        open: true,
        message: `Ошибка при загрузке синхронизации: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getActiveColor = () => {
    if (dominantColor) {
      return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    }
    return '#9a7ace';
  };
  
  const getButtonBackgroundColor = () => {
    if (dominantColor) {
      return `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.15)`;
    }
    return 'rgba(255, 45, 85, 0.15)';
  };

  const handleToggleLyricsDisplay = () => {
    setLyricsDisplayMode(!lyricsDisplayMode);
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
              onClick={handleOpenLyricsEditor}
              sx={{
                color: showLyricsEditor ? theme.palette.primary.main : 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <EditIcon />
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
          {/* Album Art or Lyrics Display */}
          <AlbumArtContainer sx={{maxHeight:'390px', width: '100%'}}>
            <AnimatePresence mode="wait">
              {lyricsDisplayMode && (lyricsData?.has_synced_lyrics || lyricsData?.lyrics) ? (
                <Box
                  key="lyrics-display"
                  sx={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <LyricsModernView
                    lyricsData={lyricsData}
                    loading={loadingLyrics}
                    currentTime={currentTime}
                    dominantColor={dominantColor}
                    theme={theme}
                    isMainDisplay={true}
                  />
                </Box>
              ) : (
                <AlbumArt
                  key="album-cover"
                  src={getCoverPath(currentTrack)}
                  alt={currentTrack.title}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 0.9, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                />
              )}
            </AnimatePresence>
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
                color: currentTrack?.is_liked ? '#ff2d55' : 'rgba(255,255,255,0.8)',
                '&:hover': { 
                  color: currentTrack?.is_liked ? '#ff2d55' : 'white'
                }
              }}
            >
              {currentTrack?.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </ControlButton>
            
            {(lyricsData?.has_synced_lyrics || lyricsData?.lyrics) && (
              <ControlButton
                onClick={handleToggleLyricsDisplay}
                className="secondary"
                sx={{
                  color: lyricsDisplayMode ? '#9a7ace' : 'rgba(255,255,255,0.8)',
                  '&:hover': { color: lyricsDisplayMode ? '#9a7ace' : 'white' }
                }}
              >
                <LyricsIcon />
              </ControlButton>
            )}
            
            <ControlButton
              onClick={handleCopyLink}
              className="secondary"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { color: 'white' }
              }}
            >
              <ShareIcon size={24} color="rgba(255,255,255,0.8)" />
            </ControlButton>
          </SecondaryControls>

          {/* Desktop Volume Control */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mt: 2,
              maxWidth: '500px',
              width: '100%'
            }}>
              <ControlButton
                onClick={handleToggleMute}
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': { color: 'white' },
                  mr: 1,
                  transition: 'color 0.2s ease'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.1)' }
                }}>
                  {isMuted || volume === 0 ? (
                    <VolumeOffIcon sx={{ fontSize: 20 }} />
                  ) : volume < 0.3 ? (
                    <VolumeMuteIcon sx={{ fontSize: 20 }} />
                  ) : volume < 0.7 ? (
                    <VolumeDownIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VolumeUpIcon sx={{ fontSize: 20 }} />
                  )}
                </Box>
              </ControlButton>
              
              <Slider
                value={isMuted ? 0 : volume}
                min={0}
                max={1}
                step={0.01}
                onChange={handleVolumeChange}
                sx={{
                  color: 'white',
                  flex: 1,
                  mx: 2,
                  '& .MuiSlider-track': {
                    backgroundColor: 'white',
                    height: 4,
                    borderRadius: '2px',
                    transition: 'height 0.2s ease'
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    height: 4,
                    borderRadius: '2px',
                    transition: 'height 0.2s ease'
                  },
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'white',
                    width: 14,
                    height: 14,
                    border: 'none',
                    '&:hover': {
                      boxShadow: '0 0 0 8px rgba(255,255,255,0.12)'
                    },
                    '&.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(255,255,255,0.12)'
                    },
                    '&:before': {
                      display: 'none'
                    }
                  },
                  '&:hover': {
                    '& .MuiSlider-track': {
                      height: 6,
                      borderRadius: '3px'
                    },
                    '& .MuiSlider-rail': {
                      height: 6,
                      borderRadius: '3px'
                    },
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16
                    }
                  }
                }}
              />
              
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '0.75rem',
                  minWidth: '32px',
                  textAlign: 'right',
                  fontFamily: 'var(--FF_TITLE, inherit)',
                  ml: 1
                }}
              >
                {Math.round((isMuted ? 0 : volume) * 100)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Lyrics Panel - Only for Editor */}
        <AnimatePresence>
          {showLyricsEditor && (
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
                onClick={() => setShowLyricsEditor(false)}
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
                  getActiveColor={getActiveColor}
                  getButtonBackgroundColor={getButtonBackgroundColor}
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
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

// Lyrics Editor Content Component
const LyricsEditorContent = ({
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
  onOpenTimestampEditor
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ 
        color: 'white', 
        mb: 3, 
        fontWeight: 600,
        textAlign: 'center'
      }}>
        Редактирование текста
      </Typography>

      {lyricsError && (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ mb: 2 }}
        >
          {lyricsError}
        </Alert>
      )}
      
      <Alert 
        severity="info" 
        icon={<WarningIcon />}
        variant="outlined"
        sx={{ 
          mb: 3,
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.9)'
        }}
      >
        Вы можете найти тексты песен на Genius или других сервисах. 
        Пожалуйста, соблюдайте авторские права при добавлении текстов.
      </Alert>
      
      <TextField
        multiline
        fullWidth
        variant="outlined"
        value={lyricsText}
        onChange={handleLyricsChange}
        placeholder="Введите текст песни здесь..."
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
            borderColor: `${getActiveColor()} !important`,
            borderWidth: '1px',
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(255,255,255,0.5)',
            opacity: 1
          }
        }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Button
          variant="outlined"
          onClick={handleOpenMenu}
          startIcon={<ScheduleIcon />}
          sx={{
            borderColor: getButtonBackgroundColor(),
            color: getActiveColor(),
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: getButtonBackgroundColor(),
              borderColor: getActiveColor()
            }
          }}
        >
          Синхронизация
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onCancel}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Отмена
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSaveLyrics}
            disabled={isSaving || uploading}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ 
              backgroundColor: getActiveColor(),
              boxShadow: dominantColor ? `0 4px 12px rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.3)` : undefined,
              '&:hover': {
                backgroundColor: getActiveColor(),
                filter: 'brightness(1.1)'
              }
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
            backgroundColor: 'rgba(25, 25, 25, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            color: 'white',
            minWidth: '250px'
          }
        }}
      >
        <MenuItem 
          onClick={handleDownloadLyricsForSync}
          sx={{
            padding: '12px',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
          }}
        >
          <DownloadIcon sx={{ marginRight: '12px', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }} />
          <Typography variant="body2">Скачать LRC шаблон для синхронизации</Typography>
        </MenuItem>
        
        <MenuItem 
          onClick={handleOpenFileSelector}
          sx={{
            padding: '12px',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
          }}
        >
          <UploadIcon sx={{ marginRight: '12px', fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }} />
          <Typography variant="body2">Загрузить синхронизацию (LRC/JSON)</Typography>
        </MenuItem>
      </Menu>
      
      {/* Hidden file input for upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".lrc,.json"
        style={{ display: 'none' }}
      />
    </Box>
  );
};

// Clean, simple lyrics display component
const LyricsModernView = ({ lyricsData, loading, currentTime, dominantColor, theme, isMainDisplay = false }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  
  // Update current line based on time for synced lyrics with improved seeking support
  useEffect(() => {
    if (!lyricsData?.has_synced_lyrics || !lyricsData.synced_lyrics || !Array.isArray(lyricsData.synced_lyrics)) {
      return;
    }

    const lines = lyricsData.synced_lyrics.filter(line => line && typeof line.startTimeMs === 'number');
    if (lines.length === 0) return;

    // Проверяем, произошла ли перемотка (скачок времени больше чем на 2 секунды)
    const timeDifference = Math.abs(currentTime - lastUpdateTime);
    const isSeekJump = timeDifference > 2;
    
    setLastUpdateTime(currentTime);

    // Конвертируем текущее время в миллисекунды
    const currentTimeMs = currentTime * 1000;
    
    // Находим правильную строку для текущего времени
    let newLineIndex = -1;
    
    // Ищем активную строку - последнюю строку, время которой <= текущему времени
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startTimeMs <= currentTimeMs) {
        newLineIndex = i;
        break;
      }
    }
    
    // Если не нашли подходящую строку и время больше 0, берем первую строку
    if (newLineIndex === -1 && currentTimeMs > 0 && lines.length > 0) {
      newLineIndex = 0;
    }
    
    // Убеждаемся, что индекс в допустимых пределах и обновляем только при изменении
    if (newLineIndex >= 0 && newLineIndex < lines.length && newLineIndex !== currentLineIndex) {
      setCurrentLineIndex(newLineIndex);
    }
  }, [currentTime, lyricsData, currentLineIndex, lastUpdateTime]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: isMainDisplay ? '100%' : 400,
        width: '100%'
      }}>
        <CircularProgress 
          size={46} 
          thickness={4} 
          sx={{ 
            color: dominantColor ? `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})` : theme.palette.primary.main 
          }} 
        />
      </Box>
    );
  }
  
  if (!lyricsData) {
    if (isMainDisplay) return null;
    return (
      <Box sx={{ 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.7)', 
        py: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Нет текста песни для этого трека
        </Typography>
      </Box>
    );
  }

  if (lyricsData.has_synced_lyrics && Array.isArray(lyricsData.synced_lyrics)) {
    const lines = lyricsData.synced_lyrics.filter(line => line && line.text !== undefined);
    
    if (lines.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ width: '100%', height: '100%' }}
      >
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}>
          {/* Previous line above */}
          {currentLineIndex > 0 && lines[currentLineIndex - 1] && (
            <Box
              key={`prev-${currentLineIndex}`}
              sx={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                top: '20%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                opacity: 0.4,
                transition: 'opacity 0.3s ease'
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: isMainDisplay ? { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' } : { xs: '1.2rem', sm: '1.4rem' },
                  fontWeight: 400,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                  textShadow: 'none',
                  width: '100%',
                  maxWidth: isMainDisplay ? { xs: '92%', sm: '87%', md: '82%', lg: '75%' } : { xs: '96%', sm: '92%' },
                  margin: '0 auto',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  filter: 'blur(2.2px)',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {lines[currentLineIndex - 1].text}
              </Typography>
            </Box>
          )}

          {/* Current line in center */}
          <AnimatePresence mode="wait">
            {currentLineIndex >= 0 && currentLineIndex < lines.length && lines[currentLineIndex] && (
              <motion.div
                key={currentLineIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  textAlign: 'center',
                  top: '45%',
                  transform: 'translateY(-50%)',
                  zIndex: 10
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontSize: isMainDisplay ? { xs: '2rem', sm: '2.4rem', md: '2.8rem' } : { xs: '1.6rem', sm: '1.8rem' },
                    fontWeight: 600,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em',
                    textShadow: 'none',
                    width: '100%',
                    maxWidth: isMainDisplay ? { xs: '95%', sm: '90%', md: '85%', lg: '80%' } : { xs: '98%', sm: '95%' },
                    margin: '0 auto',
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    minHeight: isMainDisplay ? '3.5em' : '2.5em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {lines[currentLineIndex].text}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next line below */}
          {currentLineIndex < lines.length - 1 && lines[currentLineIndex + 1] && (
            <Box
              key={`next-${currentLineIndex}`}
              sx={{
                position: 'absolute',
                width: '100%',
                textAlign: 'center',
                top: '75%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                opacity: 0.3,
                transition: 'opacity 0.3s ease'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: isMainDisplay ? { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } : { xs: '1rem', sm: '1.2rem' },
                  fontWeight: 400,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                  textShadow: 'none',
                  width: '100%',
                  maxWidth: isMainDisplay ? { xs: '90%', sm: '85%', md: '80%', lg: '70%' } : { xs: '94%', sm: '90%' },
                  margin: '0 auto',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  filter: 'blur(2.5px)',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {lines[currentLineIndex + 1].text}
              </Typography>
            </Box>
          )}

          {/* Progress dots */}
          <Box sx={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            zIndex: 10
          }}>
            {Array.from({ length: Math.min(lines.length, 15) }, (_, i) => (
              <Box
                key={i}
                sx={{
                  width: i === currentLineIndex ? '16px' : '4px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: i === currentLineIndex ? 'white' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Box>
        </Box>
      </motion.div>
    );
  }

  // Static lyrics
  if (lyricsData.lyrics) {
    const lines = lyricsData.lyrics.split('\n').filter(line => line.trim());
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ width: '100%', height: '100%' }}
      >
        <Box sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          width: '100%',
          textAlign: 'left',
          overflow: 'auto',
          padding: isMainDisplay ? '20px 0' : '10px 0',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          {lines.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.25 }}
              style={{ width: '100%' }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontSize: isMainDisplay ? { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' } : { xs: '1.2rem', sm: '1.4rem' },
                  fontWeight: 500,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                  mb: 0,
                  textShadow: 'none',
                  width: '100%',
                  maxWidth: isMainDisplay ? { xs: '95%', sm: '90%', md: '85%', lg: '75%' } : { xs: '98%', sm: '95%' },
                  margin: '0 auto',
                  wordBreak: 'break-word',
                  hyphens: 'auto',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: '0.5rem'
                }}
              >
                {line}
              </Typography>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    );
  }
  
  return null;
};

export default FullScreenPlayerV2; 