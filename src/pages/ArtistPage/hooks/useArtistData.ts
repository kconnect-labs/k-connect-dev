import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Artist, ArtistResponse, UseArtistDataParams, UseArtistDataReturn } from '../types';
import { Track } from '../../../components/Music/FullScreenPlayer/types';

export const useArtistData = ({ artistParam }: UseArtistDataParams): UseArtistDataReturn => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mostListenedTracks, setMostListenedTracks] = useState<Track[]>([]);
  const [newestTracks, setNewestTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [loadingMoreTracks, setLoadingMoreTracks] = useState(false);

  const observer = useRef<IntersectionObserver>();
  const lastTrackElementRef = useRef<HTMLElement>(null);

  
  const fetchArtistData = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        setError(null);
      } else {
        setLoadingMoreTracks(true);
      }

      const response = await axios.get<ArtistResponse>(
        `/api/music/artist?id=${artistParam}&page=${page}&per_page=40`
      );

      if (response.data.success) {
        const { artist: artistData } = response.data;
        setArtist(artistData);

        if (append) {
          setTracks(prev => [...prev, ...(artistData.tracks || [])]);
        } else {
          setTracks(artistData.tracks || []);
        }

        setHasMoreTracks(page < (artistData.tracks_pages || 1));
        setCurrentPage(page);
      } else {
        setError('Не удалось загрузить данные об исполнителе');
      }
    } catch (err) {
      console.error('Error fetching artist data:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('Исполнитель не найден');
        } else {
          setError('Произошла ошибка при загрузке данных');
        }
      } else {
        setError('Произошла ошибка при загрузке данных');
      }
    } finally {
      setIsLoading(false);
      setLoadingMoreTracks(false);
    }
  }, [artistParam]);

  
  const loadMoreTracks = useCallback(() => {
    if (!loadingMoreTracks && hasMoreTracks) {
      const nextPage = currentPage + 1;
      fetchArtistData(nextPage, true);
    }
  }, [loadingMoreTracks, hasMoreTracks, currentPage, fetchArtistData]);

  
  const refetchArtist = useCallback(async () => {
    setCurrentPage(1);
    await fetchArtistData(1, false);
  }, [fetchArtistData]);

  
  const prepareMostListenedTracks = useCallback(() => {
    const sorted = [...tracks]
      .sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0))
      .slice(0, 5);
    setMostListenedTracks(sorted);
  }, [tracks]);

  
  const prepareNewestTracks = useCallback(() => {
    const sorted = [...tracks]
      .sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
    setNewestTracks(sorted);
  }, [tracks]);

  
  const lastTrackRef = useCallback(
    (node: HTMLElement | null) => {
      if (loadingMoreTracks) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreTracks) {
          loadMoreTracks();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMoreTracks, hasMoreTracks, loadMoreTracks]
  );

  
  useEffect(() => {
    if (artistParam) {
      fetchArtistData();
    }
  }, [artistParam, fetchArtistData]);

  
  useEffect(() => {
    if (tracks.length > 0) {
      prepareMostListenedTracks();
      prepareNewestTracks();
    }
  }, [tracks, prepareMostListenedTracks, prepareNewestTracks]);

  return {
    artist,
    tracks,
    mostListenedTracks,
    newestTracks,
    isLoading,
    error,
    currentPage,
    hasMoreTracks,
    loadingMoreTracks,
    fetchArtistData,
    loadMoreTracks,
    refetchArtist,
  };
};
