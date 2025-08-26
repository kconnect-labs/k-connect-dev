import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMusic } from '../../../../context/MusicContext';

export const usePlayerTime = (open: boolean, audioRef: React.RefObject<HTMLAudioElement>) => {
  const {
    currentTime: contextCurrentTime,
    duration: contextDuration,
    volume: contextVolume,
    setVolume: setContextVolume,
  } = useMusic();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  // Мемоизированные значения
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
      if ((audioRef as any)?.current) {
        (audioRef as any).current.currentTime = time;
        setCurrentTime(time);
        // Принудительно обновляем время в контексте
        if (typeof time === 'number') {
          (window as any).audioTiming = (window as any).audioTiming || {};
          (window as any).audioTiming.currentTime = time;
        }
      }
    },
    [audioRef]
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

  const updateTimeForLyrics = useCallback((time: number) => {
    if (!isDragging) {
      setCurrentTime(time);
    }
  }, [isDragging]);

  return {
    // Состояния
    currentTime,
    duration,
    volume,
    isMuted,

    // Мемоизированные значения
    formattedCurrentTime,
    formattedDuration,
    safeCurrentTime,
    safeDuration,
    volumePercentage,

    // Обработчики
    handleTimeChange,
    handleTimeChangeCommitted,
    handleVolumeChange,
    handleToggleMute,
    updateTimeForLyrics,

    // Сеттеры
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setIsDragging,
    setDragValue,
  };
};

// Утилита для форматирования времени
const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0 || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
