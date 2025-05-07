import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Slider, 
  Dialog, 
  DialogContent,
  Fade,
  useTheme,
  Button,
  useMediaQuery,
  alpha,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  Paper,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  SkipNext, 
  SkipPrevious, 
  Close, 
  VolumeUp, 
  VolumeOff,
  VolumeDown,
  Favorite,
  FavoriteBorder,
  RepeatOne,
  Repeat,
  Shuffle,
  Share,
  Lyrics,
  Edit,
  Save,

  Add,
  Delete,
  ContentCopy,
  MoreVert,
  ModeEdit,
  Schedule,
  Warning
} from '@mui/icons-material';
import { useMusic } from '../../context/MusicContext';
import { formatDuration } from '../../utils/formatters';
import { ThemeSettingsContext } from '../../App';
import { useContext } from 'react';
import clsx from 'clsx';


const getColorFromImage = (imgSrc, callback) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    
    context.drawImage(img, 0, 0);
    

    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    const points = [
      context.getImageData(centerX, centerY, 1, 1).data,
      context.getImageData(centerX / 2, centerY / 2, 1, 1).data,
      context.getImageData(centerX + centerX / 2, centerY + centerY / 2, 1, 1).data,
      context.getImageData(centerX / 3, centerY / 3, 1, 1).data
    ];
    

    let maxVibrance = 0;
    let vibrantColor = points[0];
    
    points.forEach(color => {
      const vibrance = Math.abs(color[0] - color[1]) + Math.abs(color[1] - color[2]) + Math.abs(color[0] - color[2]);
      if (vibrance > maxVibrance) {
        maxVibrance = vibrance;
        vibrantColor = color;
      }
    });
    
    callback(`${vibrantColor[0]}, ${vibrantColor[1]}, ${vibrantColor[2]}`);
  };
  
  img.onerror = () => {
    callback(null);
  };
  
  img.src = imgSrc;
};

const FullScreenPlayer = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { themeSettings } = useContext(ThemeSettingsContext);
  const [seekPosition, setSeekPosition] = useState(0);
  const [tempSeekPosition, setTempSeekPosition] = useState(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); 
  const [shuffleMode, setShuffleMode] = useState(false);
  const [dominantColor, setDominantColor] = useState(null);
  const progressRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [shareSnackbar, setShareSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsData, setLyricsData] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [lyricsText, setLyricsText] = useState('');
  const [showTimestampEditor, setShowTimestampEditor] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [lyricsEditorMenuAnchor, setLyricsEditorMenuAnchor] = useState(null);
  const [savingLyrics, setSavingLyrics] = useState(false);
  const [lyricsEditorError, setLyricsEditorError] = useState('');
  const isDesktop = useMediaQuery('(min-width:960px)');

  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    currentTime,
    duration,
    seekTo,
    likeTrack,
    audioRef
  } = useMusic();


  const handleVolumeChange = useCallback((event, newValue) => {
    setVolume(newValue / 100);
  }, [setVolume]);

  const handleClickProgress = useCallback((event) => {
    if (progressRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const position = ((event.clientX - rect.left) / rect.width) * 100;
      const clampedPosition = Math.min(Math.max(position, 0), 100);
      setSeekPosition(clampedPosition);
      seekTo((clampedPosition * duration) / 100);
    }
  }, [progressRef, duration, seekTo]);

  const handleRepeatClick = useCallback(() => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  }, [repeatMode]);

  const handleShuffleClick = useCallback(() => {
    setShuffleMode(!shuffleMode);
  }, [shuffleMode]);

  const toggleLikeTrack = useCallback((e) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (currentTrack?.id) {
      try {
        const likeButton = e.currentTarget;
        likeButton.style.transform = 'scale(1.3)';
        setTimeout(() => {
          likeButton.style.transform = 'scale(1)';
        }, 150);
        
        likeTrack(currentTrack.id)
          .then(result => {
            console.log("Like result:", result);
          })
          .catch(error => {
            console.error("Error liking track:", error);
          });
      } catch (error) {
        console.error("Error liking track:", error);
      }
    }
  }, [currentTrack, likeTrack]);
  
  const handleShare = useCallback(() => {
    if (!currentTrack) return;
    
    const trackLink = `${window.location.origin}/music?track=${currentTrack.id}`;
    
    copyToClipboard(trackLink);
  }, [currentTrack]);
  
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShareSnackbar({
          open: true,
          message: 'Ссылка на трек скопирована в буфер обмена',
          severity: 'success'
        });
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку:', err);
        setShareSnackbar({
          open: true,
          message: 'Не удалось скопировать ссылку',
          severity: 'error'
        });
      });
  }, []);

  const toggleLyrics = useCallback(() => {
    setShowLyrics(prev => !prev);
    setShowLyricsEditor(false);
    setShowTimestampEditor(false);
  }, []);

  const openLyricsEditor = useCallback(() => {
    setLyricsEditorError('');
    setShowLyricsEditor(true);
    setShowLyrics(false);
  }, []);

  const handleLyricsEditorChange = useCallback((e) => {
    setLyricsText(e.target.value);
  }, []);

  const handleOpenLyricsEditorMenu = useCallback((event) => {
    setLyricsEditorMenuAnchor(event.currentTarget);
  }, []);

  const handleCloseLyricsEditorMenu = useCallback(() => {
    setLyricsEditorMenuAnchor(null);
  }, []);

  const handleTimestampEditorOpen = useCallback(() => {
    if (!lyricsText.trim()) {
      setLyricsEditorError('Сначала добавьте текст песни');
      return;
    }
    handleCloseLyricsEditorMenu();
    setShowTimestampEditor(true);
    setShowLyricsEditor(false);
  }, [lyricsText, handleCloseLyricsEditorMenu]);

  const handleSavePlainLyrics = useCallback(async () => {
    if (!currentTrack?.id) {
      setLyricsEditorError('Трек не выбран');
      return;
    }
    
    if (!lyricsText.trim()) {
      setLyricsEditorError('Текст песни не может быть пустым');
      return;
    }
    
    handleCloseLyricsEditorMenu();
    setSavingLyrics(true);
    
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

        const updatedLyricsResponse = await fetch(`/api/music/${currentTrack.id}/lyrics`);
        const updatedLyricsData = await updatedLyricsResponse.json();
        setLyricsData(updatedLyricsData);
        

        setShowLyricsEditor(false);
        setShowLyrics(true);
        
        setShareSnackbar({
          open: true,
          message: 'Текст песни успешно сохранен',
          severity: 'success'
        });
        

        if (data.copyright_notice) {
          setTimeout(() => {
            setShareSnackbar({
              open: true,
              message: data.copyright_notice,
              severity: 'warning'
            });
          }, 3000);
        }
      } else {
        setLyricsEditorError(data.error || 'Ошибка при сохранении текста');
        

        if (data.warning) {
          setTimeout(() => {
            setShareSnackbar({
              open: true,
              message: data.warning,
              severity: 'warning'
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error saving lyrics:', error);
      setLyricsEditorError('Ошибка при сохранении текста');
    } finally {
      setSavingLyrics(false);
    }
  }, [currentTrack, lyricsText, handleCloseLyricsEditorMenu]);

  const handleSetTimestamp = useCallback((index) => {
    if (!lyricsData || !lyricsData.synced_lyrics || !Array.isArray(lyricsData.synced_lyrics)) {
      return;
    }
    
    try {
      const updatedLyrics = [...lyricsData.synced_lyrics];
      const line = updatedLyrics[index];
      
      if (!line) return;
      
      updatedLyrics[index] = {
        ...line,
        startTimeMs: Math.round(currentTime * 1000)
      };
      
      setLyricsData({
        ...lyricsData,
        synced_lyrics: updatedLyrics
      });
      

      const nextLines = updatedLyrics.slice(index + 1);
      const nextUntimestampedIndex = nextLines.findIndex(line => !line?.startTimeMs);
      
      if (nextUntimestampedIndex !== -1) {
        setCurrentLyricIndex(index + 1 + nextUntimestampedIndex);
      }
    } catch (error) {
      console.error("Error setting timestamp:", error);
      setLyricsEditorError("Произошла ошибка при установке временной метки");
    }
  }, [lyricsData, currentTime]);

  const handleSaveSyncedLyrics = useCallback(async () => {
    if (!currentTrack?.id || !lyricsData) {
      setLyricsEditorError("Нет данных для сохранения");
      return;
    }
    
    try {
      setSavingLyrics(true);
      setLyricsEditorError('');
      

      if (!lyricsData.synced_lyrics || !Array.isArray(lyricsData.synced_lyrics) || lyricsData.synced_lyrics.length === 0) {
        setLyricsEditorError("Нет синхронизированных текстов для сохранения");
        setSavingLyrics(false);
        return;
      }
      

      const lyricsToSave = {
        track_id: currentTrack.id,
        synced_lyrics: lyricsData.synced_lyrics.map(line => ({
          text: line?.text || '',
          startTimeMs: line?.startTimeMs || 0
        })),
        has_synced_lyrics: true
      };
      

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/music/lyrics/${currentTrack.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lyricsToSave)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save synced lyrics');
      }
      
      const result = await response.json();
      

      setLyricsData(result.data);
      

      setShowTimestampEditor(false);
      

      setShareSnackbar({
        open: true,
        message: 'Синхронизированный текст сохранен',
        severity: 'success'
      });
      
    } catch (error) {
      console.error("Error saving synced lyrics:", error);
      setLyricsEditorError('Ошибка при сохранении синхронизированного текста');
    } finally {
      setSavingLyrics(false);
    }
  }, [currentTrack, lyricsData]);

  const handleCancelTimestampEditor = useCallback(() => {
    setShowTimestampEditor(false);
    setShowLyricsEditor(true);
  }, []);

  const handleCancelLyricsEditor = useCallback(() => {
    setShowLyricsEditor(false);
    setLyricsText('');
    setLyricsEditorError('');
  }, []);

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShareSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const getVolumeIcon = useMemo(() => {
    if (isMuted || volume === 0) return <VolumeOff />;
    if (volume < 0.5) return <VolumeDown />;
    return <VolumeUp />;
  }, [isMuted, volume]);

  const getRepeatIcon = useMemo(() => {
    if (repeatMode === 'one') return <RepeatOne />;
    return <Repeat />;
  }, [repeatMode]);
  

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (event, newValue) => {
    setTempSeekPosition(newValue);
  };

  const handleSeekEnd = (event, newValue) => {
    const finalPosition = tempSeekPosition !== null ? tempSeekPosition : newValue;
    setSeekPosition(finalPosition);
    seekTo((finalPosition * duration) / 100);
    setTempSeekPosition(null);
    setIsSeeking(false);
  };
  
  useEffect(() => {
    if (currentTrack?.cover_path) {
      getColorFromImage(
        currentTrack.cover_path || '/static/uploads/system/album_placeholder.jpg',
        (color) => {
          setDominantColor(color);
        }
      );
    }
  }, [currentTrack]);


  useEffect(() => {
    const enableScroll = () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      enableScroll();
      setTimeout(enableScroll, 300);
    }
    
    return enableScroll;
  }, [open]);

  useEffect(() => {
    const updateDisplays = () => {
      if (isSeeking) return;
      
      if (window.audioTiming) {
        setSeekPosition(window.audioTiming.progress);
      }
      
      animationFrameRef.current = requestAnimationFrame(updateDisplays);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateDisplays);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSeeking]);
  
  useEffect(() => {
    if (currentTrack?.id && open) {
      setLoadingLyrics(true);
      fetch(`/api/music/${currentTrack.id}/lyrics`)
        .then(response => response.json())
        .then(data => {
          setLyricsData(data);
          setLoadingLyrics(false);
          
          if (data.has_synced_lyrics) {
            setShowLyrics(true);
          }
        })
        .catch(error => {
          console.error('Error fetching lyrics:', error);
          setLoadingLyrics(false);
        });
    }
  }, [currentTrack, open]);
  
  useEffect(() => {
    if (!showLyrics || !lyricsData?.has_synced_lyrics || !lyricsData?.synced_lyrics || !Array.isArray(lyricsData.synced_lyrics)) {
      return;
    }

    const updateCurrentLyric = () => {
      try {
        const syncedLyrics = lyricsData.synced_lyrics;
        const currentTimeMs = (window.audioTiming?.currentTime || currentTime) * 1000;
        

        let start = 0;
        let end = syncedLyrics.length - 1;
        let foundIndex = -1;
        
        while (start <= end) {
          const mid = Math.floor((start + end) / 2);
          const midTime = syncedLyrics[mid]?.startTimeMs || 0;
          const nextTime = mid < syncedLyrics.length - 1 ? (syncedLyrics[mid + 1]?.startTimeMs || Infinity) : Infinity;
          
          if (currentTimeMs >= midTime && currentTimeMs < nextTime) {
            foundIndex = mid;
            break;
          } else if (currentTimeMs < midTime) {
            end = mid - 1;
          } else {
            start = mid + 1;
          }
        }
        

        if (foundIndex === -1 && syncedLyrics.length > 0) {

          const lastLyricTimeMs = syncedLyrics[syncedLyrics.length - 1]?.startTimeMs || 0;
          
          if (currentTimeMs >= lastLyricTimeMs) {

            foundIndex = syncedLyrics.length - 1;
          } else {

            for (let i = syncedLyrics.length - 1; i >= 0; i--) {
              if ((syncedLyrics[i]?.startTimeMs || 0) <= currentTimeMs) {
                foundIndex = i;
                break;
              }
            }
          }
        }
        

        if (foundIndex !== -1 && foundIndex !== currentLyricIndex && (syncedLyrics[foundIndex]?.text?.trim() || '') !== '') {
          setCurrentLyricIndex(foundIndex);
        }
        

        animationFrameRef.current = requestAnimationFrame(updateCurrentLyric);
      } catch (error) {
        console.error("Error updating current lyric:", error);

        animationFrameRef.current = requestAnimationFrame(updateCurrentLyric);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(updateCurrentLyric);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showLyrics, lyricsData, currentLyricIndex, currentTime]);
  
  useEffect(() => {
    if (!open) {
      setShowLyrics(false);
      setCurrentLyricIndex(-1);
    }
  }, [open]);
  
  useEffect(() => {
    if (showLyricsEditor && lyricsData?.has_lyrics) {
      setLyricsText(lyricsData.lyrics || '');
    }
    if (showLyricsEditor && !lyricsData?.has_lyrics) {
      setLyricsText('');
    }
  }, [showLyricsEditor, lyricsData]);
  
  useEffect(() => {
    if (showTimestampEditor && lyricsText) {
      
      const lines = lyricsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      
      const initialParsedLyrics = lines.map((text, index) => ({
        startTimeMs: 0,
        text,
        index
      }));
      
      
      initialParsedLyrics.unshift({ startTimeMs: 0, text: "", index: -1 });
      initialParsedLyrics.push({ startTimeMs: 0, text: "", index: lines.length });
      
      setParsedLyrics(initialParsedLyrics);
    }
  }, [showTimestampEditor, lyricsText]);
  
  useEffect(() => {
    if (duration > 0 && currentTime >= duration - 0.1 && isPlaying) {
      
      if (repeatMode === 'one') {
        seekTo(0);
      } else {
        togglePlay();
        seekTo(0);
      }
    }
  }, [currentTime, duration, isPlaying, togglePlay, seekTo, repeatMode]);


  if (!currentTrack) {
    return null;
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      transitionDuration={300}
      PaperProps={{
        sx: {
          background: 'rgba(15, 15, 15, 0.97)',
          backgroundImage: 'none',
          boxShadow: 'none',
          overflow: 'hidden',
          margin: 0,
          width: '100vw',
          height: '100vh',
          maxHeight: '100vh',
          maxWidth: '100vw',
          borderRadius: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 12000
        }
      }}
      sx={{
        zIndex: 12000,
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center' 
        }
      }}
    >
      <DialogContent sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 0,
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Enhanced Background Layer */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          {/* Album art blurred background */}
          <Box
            sx={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '120%',
              height: '120%',
              backgroundImage: `url(${currentTrack.cover_path || '/static/uploads/system/album_placeholder.jpg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(60px) saturate(150%)',
              opacity: 0.6,
              transform: 'scale(1.1)',
            }}
          />
          
          {/* Gradient overlay - minimal */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: dominantColor
                ? `linear-gradient(135deg, rgba(${dominantColor}, 0.1) 0%, rgba(10, 10, 10, 0.7) 100%)`
                : 'linear-gradient(135deg, rgba(45, 45, 45, 0.1) 0%, rgba(10, 10, 10, 0.7) 100%)',
              zIndex: 1,
            }}
          />
          
          {/* Removed vignette effect */}
          
          {/* Minimal noise texture */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.01,
              backgroundImage: 'url(/static/images/noise.png)',
              backgroundRepeat: 'repeat',
              mixBlendMode: 'overlay',
              zIndex: 3,
            }}
          />
        </Box>
        
        {/* Main Content Container */}
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 3, sm: 4, md: 5 },
          overflow: 'hidden',
          maxHeight: '100vh',
        }}>
          {/* Top Bar with Controls */}
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: { xs: 1, sm: 2, md: 3 }
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={handleShare}
                sx={{ 
                  color: 'white',
                  backdropFilter: 'blur(8px)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Share sx={{ fontSize: isMobile ? 18 : 20 }} />
              </IconButton>
              
              <IconButton 
                onClick={toggleLyrics}
                sx={{ 
                  color: showLyrics ? (dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main) : 'white',
                  backdropFilter: 'blur(8px)',
                  bgcolor: showLyrics ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Lyrics sx={{ fontSize: isMobile ? 18 : 20 }} />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Редактировать текст">
                <IconButton 
                  onClick={openLyricsEditor}
                  sx={{ 
                    mr: 1,
                    color: showLyricsEditor ? (dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main) : 'white',
                    backdropFilter: 'blur(8px)',
                    bgcolor: showLyricsEditor ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Edit sx={{ fontSize: isMobile ? 18 : 20 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Закрыть">
                <IconButton 
                  onClick={onClose}
                  sx={{ 
                    color: 'white',
                    backdropFilter: 'blur(8px)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <Close sx={{ fontSize: isMobile ? 18 : 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Center Content Area (Lyrics or Album Art) */}
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            maxHeight: { xs: 'calc(100vh - 280px)', sm: 'calc(100vh - 300px)', md: 'calc(100vh - 320px)' },
            overflow: 'hidden',
          }}>
            {showLyricsEditor ? (
              <Fade in={showLyricsEditor}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '600px', md: '650px' },
                    height: '100%',
                    background: 'rgba(20, 20, 20, 0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 2, 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    pb: 1.5
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      Редактор текста песни
                    </Typography>
                    <Box>
                      <Tooltip title="Инструменты">
                        <IconButton 
                          onClick={handleOpenLyricsEditorMenu}
                          sx={{ 
                            color: 'white', 
                            mr: 1,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={lyricsEditorMenuAnchor}
                        open={Boolean(lyricsEditorMenuAnchor)}
                        onClose={handleCloseLyricsEditorMenu}
                        sx={{
                          zIndex: 13000,
                          '& .MuiPaper-root': {
                            backgroundColor: 'rgba(25, 25, 25, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            color: 'white',
                            minWidth: '250px'
                          }
                        }}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                      >
                        <MenuItem 
                          onClick={handleTimestampEditorOpen}
                          sx={{
                            py: 1.5,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                          }}
                        >
                          <Schedule sx={{ mr: 1.5, fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }} />
                          <Typography variant="body2">Создать синхронизированный текст</Typography>
                        </MenuItem>
                      </Menu>
                      
                      <Button
                        variant="contained"
                        onClick={handleSavePlainLyrics}
                        disabled={savingLyrics}
                        startIcon={savingLyrics ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        sx={{
                          backgroundColor: dominantColor ? `rgba(${dominantColor}, 0.8)` : theme.palette.primary.main,
                          color: 'white',
                          borderRadius: '10px',
                          px: 2,
                          py: 0.8,
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.dark,
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      >
                        {savingLyrics ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                      
                      <Tooltip title="Отмена">
                        <IconButton 
                          onClick={handleCancelLyricsEditor}
                          sx={{ 
                            color: 'white', 
                            ml: 1,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {lyricsEditorError && (
                    <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ 
                        mb: 2,
                        borderRadius: '10px',
                        '& .MuiAlert-message': {
                          fontSize: '0.85rem'
                        }
                      }}
                    >
                      {lyricsEditorError}
                    </Alert>
                  )}
                  
                  <Alert 
                    severity="info" 
                    icon={<Warning />} 
                    variant="outlined"
                    sx={{ 
                      width: '100%',
                      mb: 2,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(13, 59, 102, 0.2)',
                      borderColor: 'rgba(41, 98, 255, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': {
                        color: 'rgb(41, 98, 255)'
                      },
                      '& .MuiAlert-message': {
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    Вы можете найти текст песни на Genius и скопировать его сюда. 
                    Убедитесь, что вы не нарушаете авторские права.
                  </Alert>
                  
                  <TextField
                    multiline
                    fullWidth
                    variant="outlined"
                    value={lyricsText}
                    onChange={handleLyricsEditorChange}
                    placeholder="Вставьте текст песни сюда..."
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        height: '100%',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        '& textarea': {
                          height: '100% !important',
                          padding: 2,
                          fontSize: '0.95rem',
                          lineHeight: 1.6
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '12px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)'
                      },
                      '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: dominantColor ? `rgba(${dominantColor}, 0.8)` : 'rgba(41, 98, 255, 0.6)',
                        borderWidth: '1px'
                      }
                    }}
                  />
                </Paper>
              </Fade>
            ) : showTimestampEditor ? (
              <Fade in={showTimestampEditor}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '600px', md: '650px' },
                    height: '100%',
                    background: 'rgba(20, 20, 20, 0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 2, 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    pb: 1.5
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      Синхронизация текста
                    </Typography>
                    <Box>
                      <Button
                        variant="contained"
                        onClick={handleSaveSyncedLyrics}
                        disabled={savingLyrics}
                        startIcon={savingLyrics ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        sx={{
                          backgroundColor: dominantColor ? `rgba(${dominantColor}, 0.8)` : theme.palette.primary.main,
                          color: 'white',
                          borderRadius: '10px',
                          px: 2,
                          py: 0.8,
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.dark,
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.3)'
                          }
                        }}
                      >
                        {savingLyrics ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                      
                      <Tooltip title="Назад">
                        <IconButton 
                          onClick={handleCancelTimestampEditor}
                          sx={{ 
                            color: 'white', 
                            ml: 1,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  {lyricsEditorError && (
                    <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ 
                        mb: 2,
                        borderRadius: '10px',
                        '& .MuiAlert-message': {
                          fontSize: '0.85rem'
                        }
                      }}
                    >
                      {lyricsEditorError}
                    </Alert>
                  )}
                  
                  <Alert 
                    severity="info" 
                    variant="outlined"
                    sx={{ 
                      width: '100%',
                      mb: 2,
                      borderRadius: '10px',
                      backgroundColor: 'rgba(13, 59, 102, 0.2)',
                      borderColor: 'rgba(41, 98, 255, 0.3)',
                      color: 'white',
                      '& .MuiAlert-icon': {
                        color: 'rgb(41, 98, 255)'
                      },
                      '& .MuiAlert-message': {
                        fontSize: '0.85rem'
                      }
                    }}
                  >
                    Воспроизведите трек и нажимайте кнопку с иконкой часов рядом с каждой строкой в нужный момент.
                  </Alert>
                  
                  <Box 
                    sx={{ 
                      flex: 1, 
                      overflowY: 'auto',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(0,0,0,0.2)',

                      msOverflowStyle: 'none', /* IE and Edge */
                      scrollbarWidth: 'none', /* Firefox */
                      '&::-webkit-scrollbar': {
                        display: 'none', /* Chrome, Safari, Opera */
                      } 
                    }}
                  >
                    <List sx={{ width: '100%', py: 0 }}>
                      {lyricsData?.synced_lyrics && Array.isArray(lyricsData.synced_lyrics) ? 
                        lyricsData.synced_lyrics.map((line, index) => {
                          const distance = Math.abs(index - currentLyricIndex);
                          const isCurrent = index === currentLyricIndex;
                          
                          if (distance > 8) return null;
                          
                          return (
                            <ListItem 
                              key={`synced-line-${index}`}
                              className="timestamp-list-item"
                              sx={{ 
                                py: 1.5,
                                px: 2, 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s ease',
                                backgroundColor: isCurrent ? 'rgba(255,255,255,0.08)' : 'transparent',
                                '&:hover': {
                                  backgroundColor: 'rgba(255,255,255,0.05)'
                                }
                              }}
                            >
                              <Box sx={{ 
                                flexGrow: 1, 
                                overflow: 'hidden', 
                                mr: 2,
                                maxWidth: 'calc(100% - 64px)'
                              }}>
                                <Typography
                                  sx={{
                                    color: 'white',
                                    opacity: line?.text ? 1 : 0.5,
                                    fontStyle: line?.text ? 'normal' : 'italic',
                                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                                    fontWeight: 400,
                                    wordBreak: 'break-word',
                                    lineHeight: 1.6
                                  }}
                                >
                                  {line?.text || "(Пустая строка)"}
                                </Typography>
                                
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: line?.startTimeMs > 0 ? 
                                      (dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main) : 
                                      'rgba(255,255,255,0.5)',
                                    fontSize: '0.75rem',
                                    mt: 0.5,
                                    fontWeight: line?.startTimeMs > 0 ? 600 : 400,
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  {line?.startTimeMs > 0 ? formatDuration(line.startTimeMs/1000) : '--:--'}
                                </Typography>
                              </Box>
                              
                              <IconButton
                                onClick={() => handleSetTimestamp(index)}
                                disabled={!isPlaying}
                                sx={{
                                  backgroundColor: line?.startTimeMs > 0 ? 
                                    (dominantColor ? `rgba(${dominantColor}, 0.3)` : 'rgba(41, 98, 255, 0.2)') : 
                                    'rgba(255,255,255,0.1)',
                                  color: 'white',
                                  width: '40px',
                                  height: '40px',
                                  minWidth: '40px',
                                  p: 0,
                                  flexShrink: 0,
                                  '&:hover': {
                                    backgroundColor: line?.startTimeMs > 0 ? 
                                      (dominantColor ? `rgba(${dominantColor}, 0.5)` : 'rgba(41, 98, 255, 0.4)') : 
                                      'rgba(255,255,255,0.15)',
                                    transform: 'scale(1.05)'
                                  },
                                  '&.Mui-disabled': {
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.2)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Schedule fontSize="small" />
                              </IconButton>
                            </ListItem>
                          );
                        })
                      : 
                        <Typography sx={{ textAlign: 'center', color: 'white', opacity: 0.7, p: 3 }}>
                          Нет данных для отображения
                        </Typography>
                      }
                    </List>
                  </Box>
                </Paper>
              </Fade>
            ) : !showLyrics ? (
              <Fade in={!showLyrics}>
                <Box sx={{ 
                  width: '100%',
                  maxWidth: { xs: '280px', sm: '320px', md: '380px' },
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'none',
                  aspectRatio: '1/1',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  transform: 'translateZ(0)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '0',
                    background: 'none',
                    zIndex: 1,
                    pointerEvents: 'none'
                  },
                  '&:hover': {
                    transform: isPlaying ? 'scale(1.02) rotate(1deg)' : 'scale(1.02)',
                    boxShadow: 'none'
                  }
                }}>
                  <Box
                    component="img"
                    src={currentTrack.cover_path || '/static/uploads/system/album_placeholder.jpg'} 
                    alt={currentTrack.title} 
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'all 15s ease',
                      animation: isPlaying ? 'pulse 4s infinite ease-in-out' : 'none',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.03)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }}
                  />
                </Box>
              </Fade>
            ) : (
              <Fade in={showLyrics}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '600px', md: '650px' },
                    height: '100%',
                    background: 'rgba(20, 20, 20, 0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    boxShadow: 'none',

                    msOverflowStyle: 'none', /* IE and Edge */
                    scrollbarWidth: 'none', /* Firefox */
                    '&::-webkit-scrollbar': {
                      display: 'none', /* Chrome, Safari, Opera */
                    }
                  }}
                >
                  {loadingLyrics ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      p: 4
                    }}>
                      <CircularProgress 
                        size={36} 
                        thickness={4}
                        sx={{ 
                          color: dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main,
                          mb: 2
                        }} 
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '0.9rem',
                          textAlign: 'center'
                        }}
                      >
                        Загрузка текста песни...
                      </Typography>
                    </Box>
                  ) : lyricsData ? (
                    <>
                      {lyricsData.has_synced_lyrics && lyricsData.synced_lyrics && Array.isArray(lyricsData.synced_lyrics) ? (
                        <Box 
                          sx={{ 
                            width: '100%', 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            px: { xs: 2, sm: 4 },
                            py: { xs: 3, sm: 6 }
                          }}
                        >
                          {lyricsData.synced_lyrics.map((line, index) => {
                            if (!line) return null;
                            
                            const distance = Math.abs(index - currentLyricIndex);
                            const isCurrent = index === currentLyricIndex;
                            
                            if (distance > 8) return null;
                            
                            return (
                              <Box 
                                key={`synced-line-${index}`}
                                sx={{
                                  textAlign: 'center',
                                  py: 1,
                                  position: 'relative',
                                  zIndex: isCurrent ? 2 : 1,
                                  transition: 'all 0.5s cubic-bezier(0.17, 0.67, 0.3, 1)',
                                  transform: isCurrent 
                                    ? 'scale(1.05) translateY(0)' 
                                    : `scale(${Math.max(0.8, 1 - distance * 0.05)}) translateY(${distance > 0 ? (distance * (index < currentLyricIndex ? -15 : 15)) : 0}px)`,
                                  opacity: isCurrent ? 1 : Math.max(0.2, 1 - distance * 0.15),
                                  mx: 'auto',
                                  maxWidth: isMobile ? '100%' : '90%'
                                }}
                              >
                                <Typography 
                                  variant="body1" 
                                  component="div"
                                  sx={{
                                    color: isCurrent 
                                      ? (dominantColor ? `rgba(${dominantColor}, 1)` : 'rgb(41, 98, 255)') 
                                      : 'white',
                                    fontWeight: isCurrent ? 700 : 400,
                                    fontSize: isCurrent 
                                      ? { xs: '1.15rem', sm: '1.35rem' }
                                      : { xs: '0.9rem', sm: '1rem' },
                                    lineHeight: 1.5,
                                    letterSpacing: isCurrent ? '0.01em' : 'normal',
                                    textShadow: 'none',
                                    userSelect: 'none'
                                  }}
                                >
                                  {line?.text || ''}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      ) : lyricsData.plain_lyrics ? (
                        <Box sx={{ p: { xs: 3, sm: 4 } }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              whiteSpace: 'pre-line', 
                              lineHeight: 1.8,
                              color: 'white',
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              textAlign: 'center',
                              userSelect: 'none'
                            }}
                          >
                            {lyricsData.plain_lyrics}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100%',
                          p: 4,
                          textAlign: 'center'
                        }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.7)',
                              mb: 3,
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            Нет доступных текстов для этого трека
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={openLyricsEditor}
                            sx={{
                              color: 'white',
                              borderColor: dominantColor ? `rgba(${dominantColor}, 0.7)` : 'rgba(255,255,255,0.3)',
                              borderRadius: '10px',
                              py: 1,
                              px: 3,
                              textTransform: 'none',
                              fontWeight: 500,
                              '&:hover': {
                                borderColor: dominantColor ? `rgba(${dominantColor}, 1)` : 'rgba(255,255,255,0.5)',
                                backgroundColor: 'rgba(255,255,255,0.05)'
                              }
                            }}
                          >
                            Добавить текст
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      p: 4
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          textAlign: 'center'
                        }}
                      >
                        Данные о тексте песни недоступны
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Fade>
            )}
          </Box>
        </Box>

        {/* Bottom Player Controls - adjusted to take less vertical space */}
        <Box sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '600px', md: '700px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: { xs: 1, sm: 2, md: 3 },
          boxShadow: 'none',
        }}>
          {/* Track title area - reduced margins */}
          <Box sx={{ 
            width: '100%', 
            mb: 2, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              width: '100%'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontSize: { xs: '1.35rem', sm: '1.6rem' },
                  letterSpacing: '-0.02em',
                  maxWidth: { xs: '85%', sm: '80%' },
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {currentTrack.title}
              </Typography>
              
              <IconButton 
                onClick={toggleLikeTrack}
                aria-label={currentTrack.is_liked ? 'Unlike track' : 'Like track'}
                sx={{ 
                  color: currentTrack.is_liked ? '#ff3b70' : 'rgba(255,255,255,0.7)',
                  ml: 1.5,
                  '&:hover': {
                    color: currentTrack.is_liked ? '#ff5c85' : '#ff3b70',
                    transform: currentTrack.is_liked ? 'scale(1.1)' : 'scale(1.15)'
                  },
                  transition: 'all 0.2s',
                }}
              >
                {currentTrack.is_liked ? (
                  <Favorite 
                    sx={{ 
                      fontSize: { xs: 22, sm: 24 },
                      filter: 'drop-shadow(0 0 3px rgba(255,0,0,0.3))',
                    }} 
                  />
                ) : (
                  <FavoriteBorder 
                    sx={{ 
                      fontSize: { xs: 22, sm: 24 } 
                    }}
                  />
                )}
              </IconButton>
            </Box>
            
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
                textAlign: 'center',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                mt: 0.5,
                maxWidth: '85%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
            >
              {currentTrack.artist}
              {currentTrack.album && ` • ${currentTrack.album}`}
            </Typography>
          </Box>

          {/* Progress slider - adjusted margins */}
          <Box 
            sx={{ 
              width: '100%', 
              px: { xs: 1, sm: 2 },
              mb: 1.5,
              position: 'relative',
              boxShadow: 'none',
            }} 
            ref={progressRef} 
            onClick={handleClickProgress}
          >
            <Slider
              value={tempSeekPosition !== null ? tempSeekPosition : seekPosition}
              onChange={handleSeekChange}
              onChangeCommitted={handleSeekEnd}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              aria-labelledby="track-progress"
              sx={{
                color: dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main,
                height: 4,
                padding: '15px 0',
                '& .MuiSlider-thumb': {
                  width: isSeeking ? 16 : 0,
                  height: isSeeking ? 16 : 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isSeeking ? `0 0 0 6px ${alpha(dominantColor ? `rgb(${dominantColor})` : theme.palette.primary.main, 0.2)}` : 'none',
                  '&:hover, &.Mui-active': {
                    boxShadow: `0 0 0 8px ${alpha(dominantColor ? `rgb(${dominantColor})` : theme.palette.primary.main, 0.3)}`,
                    width: 16,
                    height: 16,
                  }
                },
                '& .MuiSlider-rail': {
                  opacity: 0.3,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                },
                '&:hover': {
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    boxShadow: 'none',
                  }
                },
                '& .MuiSlider-track': {
                  transition: 'box-shadow 0.3s ease',
                  border: 'none',
                }
              }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mt: 0.5,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'monospace'
            }}>
              <Typography variant="body2" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                {window.audioTiming?.formattedCurrentTime || formatDuration(currentTime)}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 'inherit', color: 'inherit' }}>
                {window.audioTiming?.formattedDuration || formatDuration(duration)}
              </Typography>
            </Box>
          </Box>
          
          {/* Playback controls - adjusted margins */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            mb: { xs: 2, sm: 2.5 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              width: { xs: '90%', sm: '75%', md: '65%' },
              position: 'relative'
            }}>
              <IconButton 
                onClick={handleShuffleClick}
                sx={{ 
                  color: shuffleMode 
                    ? (dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main) 
                    : 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Shuffle sx={{ fontSize: { xs: 22, sm: 24 } }} />
              </IconButton>
              
              <IconButton 
                onClick={prevTrack}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <SkipPrevious sx={{ fontSize: { xs: 30, sm: 34 } }} />
              </IconButton>
              
              <IconButton
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                sx={{ 
                  backgroundColor: dominantColor 
                    ? `rgba(${dominantColor}, 0.85)` 
                    : theme.palette.primary.main,
                  color: 'white',
                  width: { xs: 64, sm: 72 },
                  height: { xs: 64, sm: 72 },
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: dominantColor 
                      ? `rgba(${dominantColor}, 1)` 
                      : theme.palette.primary.dark,
                    boxShadow: 'none',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              >
                {isPlaying ? 
                  <Pause sx={{ fontSize: { xs: 32, sm: 38 } }} /> : 
                  <PlayArrow sx={{ 
                    fontSize: { xs: 32, sm: 38 },
                    position: 'relative',
                    left: '2px'  
                  }} />
                }
              </IconButton>
              
              <IconButton 
                onClick={nextTrack}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <SkipNext sx={{ fontSize: { xs: 30, sm: 34 } }} />
              </IconButton>
              
              <IconButton 
                onClick={handleRepeatClick}
                sx={{ 
                  color: repeatMode !== 'off' 
                    ? (dominantColor ? `rgba(${dominantColor}, 1)` : theme.palette.primary.main) 
                    : 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {getRepeatIcon}
              </IconButton>
            </Box>
          </Box>
          
          {/* Volume control */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: { xs: '75%', sm: '50%', md: '40%' },
            mx: 'auto',
            mb: 1
          }}>
            <IconButton 
              onClick={toggleMute}
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                mr: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {getVolumeIcon}
            </IconButton>
            
            <Slider
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              aria-label="Volume"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  '&:hover, &.Mui-active': {
                    boxShadow: `0 0 0 8px ${alpha('rgb(255, 255, 255)', 0.2)}`,
                  }
                },
                '& .MuiSlider-rail': {
                  opacity: 0.4,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                },
                '&:hover': {
                  '& .MuiSlider-track': {
                    backgroundColor: dominantColor ? `rgba(${dominantColor}, 0.9)` : 'rgba(255,255,255,0.9)', 
                  }
                }
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      
      <Snackbar
        open={shareSnackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={shareSnackbar.severity}
          variant="filled"
          sx={{ 
            borderRadius: '10px',
            boxShadow: 'none'
          }}
        >
          {shareSnackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default FullScreenPlayer; 