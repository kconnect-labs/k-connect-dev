import { Track } from '../types';

const defaultCover = '/static/uploads/system/album_placeholder.jpg';

// Функция для получения полного URL
export const getFullUrl = (path: string): string => {
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

// Функция для получения пути к обложке
export const getCoverPath = (track: Track | null): string => {
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

// Функция для форматирования времени
export const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0 || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Функция для копирования в буфер обмена
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Ошибка при копировании в буфер обмена:', error);
    // Fallback для старых браузеров
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback копирование также не удалось:', fallbackError);
      return false;
    }
  }
};

// Функция для создания URL трека
export const createTrackUrl = (trackId: number): string => {
  const origin = (typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru';
  return `${origin}/music/${trackId}`;
};

// Функция для проверки валидности времени
export const isValidTime = (time: number): boolean => {
  return !isNaN(time) && time >= 0 && isFinite(time);
};

// Функция для нормализации громкости
export const normalizeVolume = (volume: number): number => {
  return Math.max(0, Math.min(1, volume));
};

// Функция для получения процента громкости
export const getVolumePercentage = (volume: number, isMuted: boolean): number => {
  return Math.round((isMuted ? 0 : volume) * 100);
};

// Функция для создания уникального ключа
export const createUniqueKey = (prefix: string, index: number, text: string): string => {
  return `${prefix}-${index}-${text.slice(0, 10)}`;
};

// Функция для фильтрации и обработки строк текста
export const processLyricsLines = (lyrics: string): string[] => {
  return lyrics
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

// Функция для создания LRC контента
export const createLrcContent = (track: Track, lyrics: string): string => {
  const lines = processLyricsLines(lyrics);
  
  let lrcContent = '[ti:' + (track.title || 'Unknown Title') + ']\n';
  lrcContent += '[ar:' + (track.artist || 'Unknown Artist') + ']\n';
  lrcContent += '[al:' + (track.album || 'Unknown Album') + ']\n';
  lrcContent += '[by:К-Коннект Авто-Генерация LRC]\n\n';

  lines.forEach(line => {
    lrcContent += '[00:00.00]' + line + '\n';
  });

  return lrcContent;
};

// Функция для скачивания файла
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Очищаем URL через некоторое время
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
  }
};

// Функция для управления скроллом страницы
export const managePageScroll = (preventScroll: boolean): void => {
  if (preventScroll) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
};

// Функция для управления viewport на мобильных устройствах
export const manageViewport = (preventZoom: boolean): void => {
  try {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      if (preventZoom) {
        viewport.setAttribute(
          'content',
          viewport.getAttribute('content') + ', user-scalable=no'
        );
      } else {
        const content = viewport
          .getAttribute('content')
          ?.replace(', user-scalable=no', '') || '';
        viewport.setAttribute('content', content);
      }
    }
  } catch (error) {
    console.warn('Не удалось управлять viewport:', error);
  }
};
