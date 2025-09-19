// Константы для FullScreenPlayer

// Пути к файлам
export const DEFAULT_COVER_PATH =
  '/static/uploads/system/album_placeholder.jpg';

// Цвета по умолчанию
export const DEFAULT_COLORS = {
  PRIMARY: '#9a7ace',
  BACKGROUND: 'rgb(87, 63, 135)',
  BUTTON_BACKGROUND: 'rgba(255, 45, 85, 0.15)',
  OVERLAY: 'rgba(87, 63, 135, 0.1)',
} as const;

// Размеры и отступы
export const SIZES = {
  ALBUM_ART: {
    DESKTOP: 'min(80vw, 26rem)',
    MOBILE: 'min(80vw, 20rem)',
  },
  CONTROLS: {
    BUTTON_SIZE: 48,
    ICON_SIZE: 24,
  },
} as const;

// Анимации
export const ANIMATIONS = {
  DURATION: {
    FAST: '0.2s',
    NORMAL: '0.3s',
    SLOW: '0.5s',
  },
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  LYRICS: (trackId: number) => `/api/music/${trackId}/lyrics`,
  LYRICS_UPLOAD: (trackId: number) => `/api/music/${trackId}/lyrics/upload`,
  ARTIST_SEARCH: (query: string) =>
    `/api/search/artists?query=${encodeURIComponent(query)}`,
} as const;

// Сообщения
export const MESSAGES = {
  SUCCESS: {
    LYRICS_SAVED: 'Текст успешно сохранен',
    SYNC_UPLOADED: 'Синхронизация успешно загружена',
    LINK_COPIED: 'Ссылка скопирована в буфер обмена',
  },
  ERROR: {
    TRACK_NOT_SELECTED: 'Трек не выбран',
    LYRICS_EMPTY: 'Текст песни не может быть пустым',
    LYRICS_NOT_FOUND: 'Не удалось загрузить текст песни',
    SAVE_FAILED: 'Не удалось сохранить текст',
    UPLOAD_FAILED: 'Не удалось загрузить файл синхронизации',
    COPY_FAILED: 'Ошибка при копировании ссылки',
  },
  WARNING: {
    COPYRIGHT:
      'Вы можете найти тексты песен на Genius или других сервисах. Пожалуйста, соблюдайте авторские права при добавлении текстов.',
  },
  INFO: {
    LRC_TEMPLATE: 'Скачивание шаблона LRC для синхронизации',
  },
} as const;

// Типы файлов
export const FILE_TYPES = {
  LRC: '.lrc',
  JSON: '.json',
} as const;

// Состояния плеера
export const PLAYER_STATES = {
  REPEAT_MODES: {
    OFF: 'off',
    ALL: 'all',
    ONE: 'one',
  },
} as const;

// Ключи для localStorage
export const STORAGE_KEYS = {
  VOLUME: 'player_volume',
  MUTED: 'player_muted',
  REPEAT_MODE: 'player_repeat_mode',
  SHUFFLE: 'player_shuffle',
} as const;

// Временные интервалы
export const TIMING = {
  LYRICS_UPDATE_INTERVAL: 100, // ms
  ANIMATION_FRAME_RATE: 60, // fps
  SNACKBAR_AUTO_HIDE: 6000, // ms
  FILE_CLEANUP_DELAY: 2000, // ms
} as const;

// Медиа-запросы
export const BREAKPOINTS = {
  MOBILE: '(max-width: 768px)',
  TABLET: '(max-width: 1024px)',
  DESKTOP: '(min-width: 1025px)',
} as const;

// Высота экрана
export const HEIGHT_BREAKPOINTS = {
  EXTRA_SMALL: '(max-height: 400px)',
  SMALL: '(max-height: 500px)',
  MEDIUM: '(max-height: 600px)',
  LARGE: '(max-height: 700px)',
  EXTRA_LARGE: '(max-height: 800px)',
  HUGE: '(max-height: 850px)',
} as const;

// Z-index значения
export const Z_INDEX = {
  PLAYER: 1000,
  LYRICS_EDITOR: 99000,
  SNACKBAR: 100000,
} as const;
