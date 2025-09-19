import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useMusic } from '../../../context/MusicContext';
import { Track } from '../../../components/Music/FullScreenPlayer/types';
import { Artist, UseArtistActionsReturn } from '../types';

export const useArtistActions = (
  artist: Artist | null
): UseArtistActionsReturn => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    currentTrack,
    isPlaying,
    playTrack,
    likeTrack,
    openFullScreenPlayer,
  } = useMusic();

  const handleTrackClick = useCallback((track: Track, context?: string) => {
    handlePlayTrack(track, context);
  }, []);

  const handlePlayTrack = useCallback(
    (track: Track, context?: string) => {
      const playContext = context || 'artist';
      playTrack(track, playContext);
      if (isMobile) {
        openFullScreenPlayer();
      }
    },
    [playTrack, isMobile, openFullScreenPlayer]
  );

  const handleLikeTrack = useCallback(
    async (trackId: number) => {
      try {
        await likeTrack(trackId);
      } catch (error) {
        console.error('Error liking track:', error);
      }
    },
    [likeTrack]
  );

  const handleTogglePlay = useCallback(
    (track: Track) => {
      if (currentTrack && currentTrack.id === track.id) {
        if (isPlaying) {
        } else {
        }
      } else {
        handlePlayTrack(track);
      }
    },
    [currentTrack, isPlaying, handlePlayTrack]
  );

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const shareArtist = useCallback((artistToShare: Artist) => {
    if (navigator.share) {
      navigator
        .share({
          title: `${artistToShare.name} - K-Connect Music`,
          text: `Послушайте треки исполнителя ${artistToShare.name}`,
          url: window.location.href,
        })
        .catch(error => {
          console.error('Error sharing:', error);

          fallbackShare();
        });
    } else {
      fallbackShare();
    }
  }, []);

  const fallbackShare = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          console.log('Link copied to clipboard');
        })
        .catch(error => {
          console.error('Error copying to clipboard:', error);

          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            console.log('Link copied to clipboard (fallback)');
          } catch (err) {
            console.error('Fallback copy failed:', err);
          }
          document.body.removeChild(textArea);
        });
    }
  }, []);

  return {
    handleTrackClick,
    handlePlayTrack,
    handleLikeTrack,
    handleTogglePlay,
    handleBackClick,
    shareArtist,
  };
};
