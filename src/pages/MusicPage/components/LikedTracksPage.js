import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  CircularProgress, 
  Alert, 
  IconButton, 
  Tooltip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useMusic } from '../../../context/MusicContext';
import apiClient from '../../../services/axiosConfig';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const TrackListItem = styled(ListItem)(({ theme, isActive }) => ({
  borderRadius: 12,
  background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(0.25), // 2px отступ между треками
  padding: theme.spacing(0.75, 2), // Еще меньше паддинг для компактности
  transition: 'background 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
  },
  '&:last-child': {
    marginBottom: 0,
  },
  // Адаптивность для телефонов
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1.5), // Еще меньше паддинг на телефонах
  },
}));

const TrackAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginRight: theme.spacing(2), // Добавляем расстояние между обложкой и названиями
  // Адаптивность для телефонов
  [theme.breakpoints.down('sm')]: {
    width: 48,
    height: 48,
    marginRight: theme.spacing(1.5),
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: 'text.secondary',
  width: 40,
  height: 40,
  marginLeft: theme.spacing(0.5), // Добавляем отступ между кнопками
  '&:hover': {
    color: 'text.primary',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Адаптивность для телефонов
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    marginLeft: theme.spacing(0.25),
  },
}));

const LikedTracksPage = ({ onBack }) => {
  const { playTrack, isPlaying, currentTrack, togglePlay } = useMusic();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLikedTracks();
  }, []);

  const fetchLikedTracks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/music/liked');
      if (response.data.success) {
        setTracks(response.data.tracks);
      } else {
        setError('Не удалось загрузить любимые треки');
      }
    } catch (err) {
      console.error('Error fetching liked tracks:', err);
      setError('Ошибка при загрузке любимых треков');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = useCallback((track) => {
    if (isPlaying && currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  }, [isPlaying, currentTrack, playTrack, togglePlay]);

  const handleLikeTrack = async (trackId) => {
    try {
      const response = await apiClient.post(`/api/music/${trackId}/like`);
      if (response.data.success) {
        // Обновляем состояние трека
        setTracks(prevTracks => 
          prevTracks.map(track => 
            track.id === trackId 
              ? { ...track, is_liked: !track.is_liked, likes_count: response.data.likes_count }
              : track
          )
        );
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <PageContainer maxWidth="xl" disableGutters sx={{ pb: 10 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress color="primary" />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl" disableGutters sx={{ pb: 10 }}>
      <HeaderCard>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <IconButton 
              onClick={onBack} 
              sx={{ 
                mr: 2, 
                color: 'text.primary',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                Мои любимые
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {tracks.length} треков в вашей коллекции
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </HeaderCard>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 12 }}>
          {error}
        </Alert>
      )}

      {tracks.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          minHeight="40vh"
          sx={{ 
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            У вас пока нет любимых треков
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Лайкайте треки, которые вам нравятся, и они появятся здесь
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {tracks.map((track, index) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            const isTrackPlaying = isPlaying && isCurrentTrack;

            return (
              <React.Fragment key={track.id}>
                <TrackListItem 
                  isActive={isCurrentTrack}
                  onClick={() => handlePlayTrack(track)}
                >
                  <ListItemAvatar>
                    <TrackAvatar
                      src={track.cover_path}
                      alt={track.title}
                    />
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body1" 
                          fontWeight={isCurrentTrack ? 600 : 500}
                          sx={{ 
                            color: isCurrentTrack ? 'primary.main' : 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {track.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {track.artist}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDuration(track.duration)}
                          </Typography>
                          {track.genre && (
                            <>
                              <Typography variant="caption" color="text.secondary">•</Typography>
                              <Chip 
                                label={track.genre} 
                                size="small" 
                                sx={{ 
                                  height: 20,
                                  fontSize: '0.7rem',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  color: 'text.secondary',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }} 
                              />
                            </>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLikeTrack(track.id);
                        }}
                      >
                        {track.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </ActionButton>
                      
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(track);
                        }}
                        sx={{ 
                          color: isCurrentTrack ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        {isTrackPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                      </ActionButton>
                    </Box>
                  </ListItemSecondaryAction>
                </TrackListItem>
                {index < tracks.length - 1 && (
                  <Divider sx={{ 
                    mx: 2, 
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    opacity: 0.5 
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </PageContainer>
  );
};

export default LikedTracksPage; 