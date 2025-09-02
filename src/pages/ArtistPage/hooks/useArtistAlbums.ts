import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Album {
  id: number;
  title: string;
  artist_id: number;
  artist_name: string;
  cover_url: string | null;
  release_date: string | null;
  description: string | null;
  genre: string | null;
  duration: number;
  tracks_count: number;
  album_type: 'single' | 'ep' | 'album' | 'unknown';
  auto_created: boolean;
  created_at: string;
  updated_at: string;
  preview_tracks: Array<{
    id: number;
    title: string;
    duration: number;
    cover_path: string;
  }>;
}

interface UseArtistAlbumsReturn {
  albums: Album[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useArtistAlbums = (artistId: number | null): UseArtistAlbumsReturn => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = useCallback(async () => {
    if (!artistId) {
      setAlbums([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/music/albums/artist/${artistId}`);
      
      if (response.data.success) {
        setAlbums(response.data.albums || []);
      } else {
        setError(response.data.message || 'Ошибка при загрузке альбомов');
      }
    } catch (err: any) {
      console.error('Error fetching albums:', err);
      if (err.response?.status === 404) {
        setError('Артист не найден');
      } else {
        setError(err.response?.data?.message || 'Ошибка при загрузке альбомов');
      }
    } finally {
      setIsLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const refetch = useCallback(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return {
    albums,
    isLoading,
    error,
    refetch,
  };
};
