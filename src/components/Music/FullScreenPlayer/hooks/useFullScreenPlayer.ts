import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMusic } from '../../../../context/MusicContext';
import { extractDominantColor } from '../../../../utils/imageUtils';
import {
  Track,
  LyricsData,
  DominantColor,
  SnackbarState,
  ArtistSearchResponse,
  LyricsUploadResponse,
} from '../types';

const defaultCover = '/static/uploads/system/album_placeholder.jpg';

// Утилиты
const getFullUrl = (path: string): string => {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost');

  if (isLocalhost && !path.startsWith('http')) {
    const origin = (typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru';
    return `${origin}${path}`;
  }

  return path;
};

const getCoverPath = (track: Track | null): string => {
  if (!track?.cover_path) return getFullUrl(defaultCover);

  let coverPath = track.cover_path;

  if (coverPath.startsWith('http')) {
    return coverPath;
  }

  if (!coverPath.startsWith('/static/')) {
    if (coverPath.startsWith('static/')) {
      coverPath = `/${coverPath}`;
    } else {
      coverPath = `/static/music/${coverPath}`;
    }
  }

  return getFullUrl(coverPath);
};

const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0 || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const useFullScreenPlayer = (open: boolean, onClose: () => void) => {
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
    likeTrack,
  } = useMusic();

  // Состояния
  const [dominantColor, setDominantColor] = useState<DominantColor | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [showTimestampEditor, setShowTimestampEditor] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [uploadingLyrics, setUploadingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [lyricsText, setLyricsText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lyricsDisplayMode, setLyricsDisplayMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Мемоизированные значения
  const coverPath = useMemo(() => getCoverPath(currentTrack as any), [currentTrack]);
  const trackId = useMemo(() => (currentTrack as any)?.id, [currentTrack]);
  const formattedCurrentTime = useMemo(() => formatTime(currentTime), [currentTime]);
  const formattedDuration = useMemo(() => formatTime(duration), [duration]);
  const safeCurrentTime = useMemo(() => {
    if (isDragging) {
      return isNaN(dragValue) ? 0 : dragValue;
    }
    return isNaN(currentTime) ? 0 : currentTime;
  }, [currentTime, dragValue, isDragging]);
  const safeDuration = useMemo(() => (isNaN(duration) ? 100 : duration), [duration]);
  const volumePercentage = useMemo(() => Math.round((isMuted ? 0 : volume) * 100), [volume, isMuted]);

  // Синхронизация с контекстом
  useEffect(() => {
    if (contextCurrentTime !== undefined) {
      setCurrentTime(contextCurrentTime);
    }
  }, [contextCurrentTime]);

  useEffect(() => {
    if (contextDuration !== undefined) {
      setDuration(contextDuration);
    }
  }, [contextDuration]);

  useEffect(() => {
    if (contextVolume !== undefined) {
      setVolume(contextVolume);
    }
  }, [contextVolume]);

  // Сброс времени при смене трека
  useEffect(() => {
    if (currentTrack) {
      setCurrentTime(0);
      setDragValue(0);
    }
  }, [(currentTrack as any)?.id]);

  // Обновление времени для синхронизации текстов
  useEffect(() => {
    if (!open || !lyricsData?.has_synced_lyrics || isDragging) return;

    let rafId: number;
    let lastTime = 0;

    const updateTimeForLyrics = () => {
      if ((audioRef as any)?.current && !(audioRef as any).current.paused) {
        const actualCurrentTime = (audioRef as any).current.currentTime;
        
        // Проверяем, что время не "застряло" на старом значении
        if (actualCurrentTime !== lastTime || actualCurrentTime === 0) {
          setCurrentTime(actualCurrentTime);
          lastTime = actualCurrentTime;
        }
      }
      rafId = requestAnimationFrame(updateTimeForLyrics);
    };

    rafId = requestAnimationFrame(updateTimeForLyrics);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [open, lyricsData?.has_synced_lyrics, audioRef, isDragging]);

  // Извлечение доминирующего цвета
  useEffect(() => {
    if ((currentTrack as any)?.cover_path) {
      extractDominantColor(
        (currentTrack as any).cover_path || defaultCover,
        (colorString: string) => {
          if (colorString) {
            const [r, g, b] = colorString.split(',').map(c => parseInt(c.trim()));
            
            const brightness = (r + g + b) / 3;
            const isTooLight = brightness > 180;
            const isTooWhite = r > 220 && g > 220 && b > 220;
            
            if (isTooLight || isTooWhite) {
              setDominantColor({ r: 87, g: 63, b: 135 });
            } else {
              const darkenedColor: DominantColor = {
                r: Math.max(20, Math.round(r * 0.6)),
                g: Math.max(20, Math.round(g * 0.6)),
                b: Math.max(20, Math.round(b * 0.6)),
              };
              setDominantColor(darkenedColor);
            }
          } else {
            setDominantColor(null);
          }
        }
      );
    } else {
      setDominantColor(null);
    }
  }, [currentTrack]);

  // Загрузка текстов песен
  useEffect(() => {
    if (!trackId || !open) {
      setLyricsData(null);
      setLoadingLyrics(false);
      return;
    }

    setLoadingLyrics(true);

    if ((currentTrack as any)?.lyricsData) {
      setLyricsData((currentTrack as any).lyricsData);
      setLoadingLyrics(false);
    } else {
      fetch(`/api/music/${trackId}/lyrics`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Lyrics not found');
          }
          return response.json();
        })
        .then((data: LyricsData) => {
          setLyricsData(data);
          setLoadingLyrics(false);

          if (currentTrack) {
            (currentTrack as any).lyricsData = data;
          }
        })
        .catch(error => {
          console.error('Error fetching lyrics:', error);
          setLyricsData(null);
          setLoadingLyrics(false);
        });
    }
  }, [trackId, open, currentTrack]);

  // Управление скроллом страницы
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Обработчики
  const handleTimeChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      const time = Array.isArray(newValue) ? newValue[0] : newValue;
      setDragValue(time);
    },
    []
  );

  const handleTimeChangeCommitted = useCallback(
    (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
      const time = Array.isArray(newValue) ? newValue[0] : newValue;
      setIsDragging(false);
      if ((audioRef as any)?.current) {
        (audioRef as any).current.currentTime = time;
        setCurrentTime(time);
        if (typeof time === 'number') {
          (window as any).audioTiming = (window as any).audioTiming || {};
          (window as any).audioTiming.currentTime = time;
        }
      }
    },
    [audioRef, setIsDragging]
  );

  const handleVolumeChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      const vol = Array.isArray(newValue) ? newValue[0] : newValue;
      setVolume(vol);
      (setContextVolume as any)(vol);
      setIsMuted(vol === 0);
    },
    [setContextVolume]
  );

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      setVolume(1);
      (setContextVolume as any)(1);
      setIsMuted(false);
    } else {
      setVolume(0);
      (setContextVolume as any)(0);
      setIsMuted(true);
    }
  }, [isMuted, setContextVolume]);

  const handleToggleLike = useCallback(async () => {
    if (!trackId) return;

    try {      (likeTrack as any)(trackId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [trackId, likeTrack]);

  const handleCopyLink = useCallback(async () => {
    if (!trackId) return;

    const origin = (typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru';
    const url = `${origin}/music/${trackId}`;

    try {
      await navigator.clipboard.writeText(url);
      console.log('Ссылка скопирована в буфер обмена');
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }, [trackId]);

  const goToArtist = useCallback(
    async (artistName: string) => {
      if (!artistName || artistName.trim() === '') return;

      try {
        const response = await axios.get<ArtistSearchResponse>(
          `/api/search/artists?query=${encodeURIComponent(artistName)}`
        );

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
    },
    [navigate, onClose]
  );

  const handleUploadLyrics = useCallback(async () => {
    if (!trackId || !currentTrack) return;

    setUploadingLyrics(true);
    setLyricsError(null);

    try {
      const response = await fetch(`/api/music/${trackId}/lyrics/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: `[ti:${(currentTrack as any)?.title || 'Неизвестный трек'}]\n[ar:${(currentTrack as any)?.artist || 'Неизвестный исполнитель'}]\n[al:${(currentTrack as any)?.album || 'Неизвестный альбом'}]\n[by:К-Коннект Авто-Генерация]\n\n[00:00.00]Текст песни будет добавлен здесь\n[00:05.00]Вы можете отредактировать этот шаблон\n[00:10.00]И добавить правильные временные метки`,
          source_url: 'manually_added',
        }),
      });

      const data: LyricsUploadResponse = await response.json();

      if (response.ok) {
        const lyricsResponse = await fetch(`/api/music/${trackId}/lyrics`);
        if (lyricsResponse.ok) {
          const newLyricsData: LyricsData = await lyricsResponse.json();
          setLyricsData(newLyricsData);
          if (currentTrack) {
            (currentTrack as any).lyricsData = newLyricsData;
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
  }, [trackId, currentTrack]);

  const handleOpenLyricsEditor = useCallback(() => {
    setShowLyricsEditor(true);
    setShowLyrics(false);
    setShowTimestampEditor(false);
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

  const handleLyricsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLyricsText(e.target.value);
  }, []);

  const handleSaveLyrics = useCallback(async () => {
    if (!trackId) {
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
      const response = await fetch(`/api/music/${trackId}/lyrics/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: lyricsText,
          source_url: 'manually_added',
        }),
      });

      const data: LyricsUploadResponse = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Текст успешно сохранен',
          severity: 'success',
        });

        const lyricsResponse = await fetch(`/api/music/${trackId}/lyrics`);
        if (lyricsResponse.ok) {
          const newLyricsData: LyricsData = await lyricsResponse.json();
          setLyricsData(newLyricsData);
          if (currentTrack) {
            (currentTrack as any).lyricsData = newLyricsData;
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
            severity: 'warning',
          });
        }
      }
    } catch (error) {
      console.error('Error saving lyrics:', error);
      setLyricsError('Ошибка при сохранении текста. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  }, [trackId, lyricsText, currentTrack]);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  const handleSnackbarClose = useCallback((event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleToggleLyricsDisplay = useCallback(() => {
    setLyricsDisplayMode(prev => !prev);
  }, []);

  const handleDownloadLyricsForSync = useCallback(() => {
    if (!trackId || !lyricsText.trim()) {
      setLyricsError('Нет доступного текста для скачивания');
      return;
    }

    try {
      const lines = lyricsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      let lrcContent = '[ti:' + ((currentTrack as any)?.title || 'Unknown Title') + ']\n';
      lrcContent += '[ar:' + ((currentTrack as any)?.artist || 'Unknown Artist') + ']\n';
      lrcContent += '[al:' + ((currentTrack as any)?.album || 'Unknown Album') + ']\n';
      lrcContent += '[by:К-Коннект Авто-Генерация LRC]\n\n';

      lines.forEach(line => {
        lrcContent += '[00:00.00]' + line + '\n';
      });

      const lrcBlob = new Blob([lrcContent], { type: 'text/plain' });
      const lrcUrl = URL.createObjectURL(lrcBlob);
      const lrcLink = document.createElement('a');
      lrcLink.href = lrcUrl;
      lrcLink.download = `${(currentTrack as any)?.artist} - ${(currentTrack as any)?.title}.lrc`;

      setSnackbar({
        open: true,
        message: 'Скачивание шаблона LRC для синхронизации',
        severity: 'info',
      });

      lrcLink.click();

      setTimeout(() => {
        URL.revokeObjectURL(lrcUrl);
      }, 2000);

      handleCloseMenu();
    } catch (error) {
      console.error('Error generating download template:', error);
      setLyricsError('Ошибка при создании шаблона для синхронизации');
    }
  }, [trackId, lyricsText, currentTrack, handleCloseMenu]);

  const handleOpenFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleCloseMenu();
  }, [handleCloseMenu]);

  const handleFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    uploadSyncFile(file);
  }, []);

  const uploadSyncFile = useCallback(
    async (file: File) => {
      if (!file || !trackId) {
        setLyricsError('Нет файла для загрузки или трек не выбран');
        return;
      }

      setUploading(true);
      setLyricsError('');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/music/${trackId}/lyrics/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || 'Не удалось загрузить файл синхронизации'
          );
        }

        const result = await response.json();

        setSnackbar({
          open: true,
          message: 'Синхронизация успешно загружена',
          severity: 'success',
        });

        // Reload lyrics data
        const lyricsResponse = await fetch(`/api/music/${trackId}/lyrics`);
        if (lyricsResponse.ok) {
          const newLyricsData: LyricsData = await lyricsResponse.json();
          setLyricsData(newLyricsData);
          if (currentTrack) {
            (currentTrack as any).lyricsData = newLyricsData;
          }
        }

        setShowLyricsEditor(false);
        setShowLyrics(true);
      } catch (error) {
        console.error('Error uploading sync file:', error);
        setLyricsError(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);

        setSnackbar({
          open: true,
          message: `Ошибка при загрузке синхронизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
          severity: 'error',
        });
      } finally {
        setUploading(false);
      }
    },
    [trackId, currentTrack]
  );

  // Мемоизированные цветовые значения
  const activeColor = useMemo(() => {
    if (dominantColor) {
      return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    }
    return '#9a7ace';
  }, [dominantColor]);

  const buttonBackgroundColor = useMemo(() => {
    if (dominantColor) {
      return `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.15)`;
    }
    return 'rgba(255, 45, 85, 0.15)';
  }, [dominantColor]);

  // Мемоизированные отфильтрованные строки
  const filteredLines = useMemo((): any[] => {
    if (lyricsData?.has_synced_lyrics && Array.isArray(lyricsData.synced_lyrics)) {
      return lyricsData.synced_lyrics
        .filter(line => line && line.text !== undefined)
        .map((line, index) => ({
          ...line,
          key: `${index}-${line.text.slice(0, 10)}`,
        }));
    }
    if (lyricsData?.lyrics) {
      return lyricsData.lyrics
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          text: line,
          startTimeMs: 0,
          key: `static-${index}-${line.slice(0, 10)}`,
        }));
    }
    return [];
  }, [lyricsData]);

  return {
    // Состояния
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
    
    // Мемоизированные значения
    coverPath,
    trackId,
    formattedCurrentTime,
    formattedDuration,
    safeCurrentTime,
    safeDuration,
    volumePercentage,
    activeColor,
    buttonBackgroundColor,
    fileInputRef,
    filteredLines,
    
    // Обработчики
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
    
    // Сеттеры
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
    setDragValue,
    setSnackbar,
  };
};
