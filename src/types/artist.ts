export interface Artist {
  id: number;
  name: string;
  bio?: string;
  avatar_url?: string;
  verified: boolean;
  user_id?: number | null;
  created_at: string;
  tracks_count?: number;
  api_source?: string | null;
  bound_user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
  } | null;
  genres?: string[];
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
  external_id?: string;
  updated_at?: string;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string;
  description?: string;
  plays_count: number;
  likes_count: number;
  verified: boolean;
  created_at: string;
  file_path?: string;
  cover_path?: string;
  user?: {
    id: number;
    name: string;
    username?: string;
    photo?: string;
    avatar_url?: string;
  };
  lyrics?: string;
  lyrics_length: number;
  description_length: number;
  is_suspicious: boolean;
  suspicious_reasons?: string[];
  has_synced_lyrics: boolean;
}
