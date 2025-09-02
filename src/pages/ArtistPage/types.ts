// TypeScript типы для ArtistPage
import { Track } from '../../components/Music/FullScreenPlayer/types';

export interface Artist {
  id: number;
  name: string;
  avatar_url?: string;
  verified?: boolean;
  bio?: string;
  genres?: string[];
  followers_count?: number;
  monthly_listeners?: number;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
  tracks?: Track[];
  tracks_pages?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ArtistPageProps {
  // Пропсы если понадобятся
}

export interface ArtistResponse {
  success: boolean;
  artist: Artist;
  message?: string;
}

export interface TrackSection {
  id: string;
  title: string;
  tracks: Track[];
  featured?: boolean;
}

export interface ArtistPageState {
  artist: Artist | null;
  tracks: Track[];
  mostListenedTracks: Track[];
  newestTracks: Track[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMoreTracks: boolean;
  loadingMoreTracks: boolean;
}

export interface UseArtistDataParams {
  artistParam: string;
}

export interface UseArtistDataReturn extends ArtistPageState {
  fetchArtistData: (page?: number, append?: boolean) => Promise<void>;
  loadMoreTracks: () => void;
  refetchArtist: () => Promise<void>;
}

export interface UseArtistActionsReturn {
  handleTrackClick: (track: Track) => void;
  handlePlayTrack: (track: Track) => void;
  handleLikeTrack: (trackId: number) => Promise<void>;
  handleTogglePlay: (track: Track) => void;
  handleBackClick: () => void;
  shareArtist: (artist: Artist) => void;
}

export interface ArtistHeaderProps {
  artist: Artist;
  tracks: Track[];
  onBackClick: () => void;
  onShareClick: () => void;
  onPlayClick: () => void;
}

export interface ArtistBiographyProps {
  bio: string;
  isMobile: boolean;
}

export interface TrackSectionProps {
  title: string;
  tracks: Track[];
  featured?: boolean;
  onTrackClick: (track: Track) => void;
  onLikeTrack: (trackId: number) => Promise<void>;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export interface TrackListProps {
  tracks: Track[];
  onTrackClick: (track: Track) => void;
  onLikeTrack: (trackId: number) => Promise<void>;
  currentTrack: Track | null;
  isPlaying: boolean;
  hasMoreTracks: boolean;
  loadingMoreTracks: boolean;
  onLoadMore?: () => void;
}

export interface FeaturedTrackGridProps {
  tracks: Track[];
  onTrackClick: (track: Track) => void;
  onLikeTrack: (trackId: number) => Promise<void>;
  currentTrack: Track | null;
  isPlaying: boolean;
}

export interface TrackItemProps {
  track: Track;
  index: number;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onTrackClick: (track: Track) => void;
  onLikeTrack: (trackId: number) => Promise<void>;
  isLast?: boolean;
  lastTrackRef?: ((node: any) => void) | null;
}

export interface FeaturedTrackItemProps {
  track: Track;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  onTrackClick: (track: Track) => void;
  onLikeTrack: (trackId: number) => Promise<void>;
}

export interface NotFoundCardProps {
  artist: Artist | null;
  onNavigateToMusic: () => void;
}

export interface LoadingStateProps {
  // Пропсы для состояния загрузки
}

export interface ErrorStateProps {
  error: string;
  onBackClick: () => void;
}
