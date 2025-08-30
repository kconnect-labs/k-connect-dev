// Основные типы для музыкального плеера
export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  cover_path?: string;
  duration?: number;
  is_liked?: boolean;
  lyricsData?: LyricsData;
}

export interface LyricsData {
  has_lyrics: boolean;
  has_synced_lyrics: boolean;
  lyrics?: string;
  synced_lyrics?: SyncedLyricLine[];
  source_url?: string;
}

export interface SyncedLyricLine {
  text: string;
  startTimeMs: number;
  endTimeMs?: number;
  key?: string;
}

export interface DominantColor {
  r: number;
  g: number;
  b: number;
}

// Типы для состояния плеера
export interface PlayerState {
  currentTrack: Track | null;
  currentSection: string;
  playlistTracks: Record<string, Track[]>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

// Типы для контекста музыки
export interface MusicContextType {
  currentTrack: Track | null;
  currentSection: string;
  playlistTracks: Record<string, Track[]>;
  playTrack: (track: Track, section?: string) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (volume: number) => void;
  isShuffled: boolean;
  toggleShuffle: () => void;
  repeatMode: 'off' | 'all' | 'one';
  toggleRepeat: () => void;
  likeTrack: (trackId: number) => Promise<void>;
}

// Типы для пропсов компонентов
export interface FullScreenPlayerProps {
  open: boolean;
  onClose: () => void;
}

export interface PlayerHeaderProps {
  onClose: () => void;
  onOpenLyricsEditor: () => void;
  showLyricsEditor: boolean;
  theme: any;
}

export interface PlayerTrackInfoProps {
  currentTrack: Track;
  onArtistClick: (artistName: string) => void;
}

export interface AlbumArtLyricsContainerProps {
  lyricsDisplayMode: boolean;
  lyricsData: LyricsData | null;
  loadingLyrics: boolean;
  currentTime: number;
  dominantColor: DominantColor | null;
  theme: any;
  coverPath: string;
  currentTrack: Track;
  filteredLines: SyncedLyricLine[];
}

export interface LyricsModernViewProps {
  lyricsData: LyricsData | null;
  loading: boolean;
  currentTime: number;
  dominantColor: DominantColor | null;
  theme: any;
  filteredLines: SyncedLyricLine[];
  isMainDisplay?: boolean;
}

export interface LyricsLineProps {
  text: string;
  isActive: boolean;
  isPrevious: boolean;
  isNext: boolean;
  lineKey: string;
  isMainDisplay: boolean;
}

export interface StaticLyricsLineProps {
  text: string;
  index: number;
  isMainDisplay: boolean;
}

export interface ProgressSliderProps {
  currentTime: number;
  duration: number;
  onTimeChange: (event: Event, newValue: number | number[]) => void;
  formattedCurrentTime: string;
  formattedDuration: string;
}

export interface MainPlayControlsProps {
  isShuffled: boolean;
  toggleShuffle: () => void;
  prevTrack: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  nextTrack: () => void;
  repeatMode: 'off' | 'all' | 'one';
  toggleRepeat: () => void;
}

export interface SecondaryPlayControlsProps {
  currentTrack: Track | null;
  onToggleLike: () => void;
  lyricsData: LyricsData | null;
  lyricsDisplayMode: boolean;
  onToggleLyricsDisplay: () => void;
  onCopyLink: () => void;
}

export interface VolumeControlsProps {
  isMuted: boolean;
  volume: number;
  volumePercentage: number;
  onToggleMute: () => void;
  onVolumeChange: (event: Event, newValue: number | number[]) => void;
}

export interface LyricsEditorContentProps {
  lyricsData: LyricsData | null;
  currentTrack: Track;
  lyricsText: string;
  lyricsError: string | null;
  isSaving: boolean;
  uploading: boolean;
  menuAnchorEl: HTMLElement | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  dominantColor: DominantColor | null;
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
}

export interface LyricsProgressDotsProps {
  total: number;
  current: number;
}

// Типы для утилит
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Типы для API ответов
export interface ArtistSearchResponse {
  artists: Array<{
    id: number;
    name: string;
  }>;
}

export interface LyricsUploadResponse {
  success: boolean;
  error?: string;
  warning?: string;
}

// Типы для стилизованных компонентов
export interface StyledComponentProps {
  theme?: any;
  dominantColor?: DominantColor;
  active?: boolean;
  play?: boolean;
  lyricsDisplayMode?: boolean;
}
