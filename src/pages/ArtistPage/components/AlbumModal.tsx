import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  MusicNote,
  AccessTime,
  Album as AlbumIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import UniversalModal from '../../../UIKIT/UniversalModal';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  cover_path: string;
  plays_count: number;
  is_liked: boolean;
}

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
  tracks?: Track[];
}

interface AlbumModalProps {
  album: Album | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackClick: (track: Track, context?: string) => void;
  onLikeTrack: (trackId: number) => void;
  currentTrack: any;
  isPlaying: boolean;
}

const AlbumHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: theme.spacing(2),
  },
}));

const AlbumCover = styled(Avatar)(({ theme }) => ({
  width: 160,
  height: 160,
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  background: 'linear-gradient(135deg, #B69DF8 0%, #D0BCFF 100%)',
  [theme.breakpoints.down('md')]: {
    width: 120,
    height: 120,
  },
}));

const AlbumInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  minWidth: 0,
}));

const AlbumTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.75rem',
  color: '#ffffff',
  lineHeight: 1.2,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem',
  },
}));

const ArtistName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.1rem',
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: theme.spacing(1),
}));

const AlbumMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}));

const AlbumTypeChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
  '&.single': {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    color: '#4CAF50',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  '&.ep': {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    color: '#FF9800',
    border: '1px solid rgba(255, 152, 0, 0.3)',
  },
  '&.album': {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    color: '#9C27B0',
    border: '1px solid rgba(156, 39, 176, 0.3)',
  },
}));

const AlbumStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.9rem',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}));

const PlayAlbumButton = styled(Button)(({ theme }) => ({
  borderRadius: '24px',
  padding: theme.spacing(1, 3),
  fontWeight: 700,
  fontSize: '0.9rem',
  textTransform: 'none',
  background: '#B69DF8',
  color: '#ffffff',
  boxShadow: '0 4px 12px rgba(182, 157, 248, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#D0BCFF',
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 16px rgba(182, 157, 248, 0.4)',
  },
}));

const TracksList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    borderRadius: '18px',
    marginBottom: '2px',
    background: 'transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.05)',
    },
    '&.current-track': {
      background: 'linear-gradient(135deg, rgba(182, 157, 248, 0.2) 0%, rgba(208, 188, 255, 0.1) 100%)',
      border: '1px solid rgba(182, 157, 248, 0.3)',
    },
  },
}));

const TrackNumber = styled(Box)(({ theme }) => ({
  width: 24,
  height: 24,
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.6)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
}));

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatAlbumDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м`;
};

const getAlbumTypeLabel = (type: string): string => {
  switch (type) {
    case 'single':
      return 'Сингл';
    case 'ep':
      return 'EP';
    case 'album':
      return 'Альбом';
    default:
      return 'Релиз';
  }
};

const AlbumModal: React.FC<AlbumModalProps> = ({
  album,
  isOpen,
  onClose,
  onTrackClick,
  onLikeTrack,
  currentTrack,
  isPlaying,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [albumDetails, setAlbumDetails] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    if (album && isOpen) {
      fetchAlbumDetails();
    }
  }, [album, isOpen]);

  const fetchAlbumDetails = async () => {
    if (!album) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/music/albums/${album.id}`);
      
      if (response.data.success) {
        setAlbumDetails(response.data.album);
      } else {
        setError(response.data.message || 'Ошибка при загрузке альбома');
      }
    } catch (err: any) {
      console.error('Error fetching album details:', err);
      setError('Ошибка при загрузке альбома');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAlbum = () => {
    if (albumDetails?.tracks && albumDetails.tracks.length > 0) {
      
      onTrackClick(albumDetails.tracks[0], `album_${albumDetails.id}`);
    }
  };

  const handleTrackClick = (track: Track) => {
    
    onTrackClick(track, `album_${albumDetails?.id}`);
  };

  if (!album) return null;

  return (
    <UniversalModal
      open={isOpen}
      onClose={onClose}
      title={album.title}
      maxWidth="md"
      maxWidthCustom={600}
      fullWidth={true}
    >
      {isLoading ? (
        <Box>
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Skeleton variant="rectangular" width={160} height={160} sx={{ borderRadius: '16px' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" height={32} width="70%" />
              <Skeleton variant="text" height={24} width="50%" />
              <Skeleton variant="text" height={20} width="80%" />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Skeleton variant="rectangular" height={28} width={90} sx={{ borderRadius: '18px' }} />
                <Skeleton variant="rectangular" height={28} width={90} sx={{ borderRadius: '18px' }} />
                <Skeleton variant="rectangular" height={28} width={110} sx={{ borderRadius: '18px' }} />
              </Box>
            </Box>
          </Box>
          <Box>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: '4px' }} />
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: '16px' }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={16} width="40%" />
                </Box>
                <Skeleton variant="text" height={16} width="40px" />
              </Box>
            ))}
          </Box>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button onClick={fetchAlbumDetails} variant="outlined">
            Попробовать снова
          </Button>
        </Box>
      ) : albumDetails ? (
        <>
          <AlbumHeader>
            <AlbumCover
              src={
                albumDetails.cover_url 
                  ? (albumDetails.cover_url.startsWith('http') 
                      ? albumDetails.cover_url 
                      : `https://s3.k-connect.ru${albumDetails.cover_url}`)
                  : 'https://s3.k-connect.ru/static/uploads/system/album_placeholder.jpg'
              }
              alt={albumDetails.title}
            >
              {!albumDetails.cover_url && (
                <AlbumIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.5)' }} />
              )}
            </AlbumCover>

            <AlbumInfo>
              <AlbumTitle>{albumDetails.title}</AlbumTitle>
              <ArtistName>{albumDetails.artist_name}</ArtistName>

              <AlbumMeta>
                <AlbumTypeChip
                  label={getAlbumTypeLabel(albumDetails.album_type)}
                  size="small"
                  className={albumDetails.album_type}
                />
                {albumDetails.release_date && (
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                    {new Date(albumDetails.release_date).getFullYear()}
                  </Typography>
                )}
                {albumDetails.genre && (
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                    {albumDetails.genre}
                  </Typography>
                )}
              </AlbumMeta>

              <AlbumStats>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {albumDetails.tracks && albumDetails.tracks.length > 0 && (
                    <PlayAlbumButton
                      onClick={handlePlayAlbum}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.5,
                        fontSize: 13,
                        borderRadius: '18px',
                        height: 28,
                        mr: 1,
                        background: 'rgba(182,157,248,0.12)',
                        color: '#B69DF8',
                        boxShadow: 'none',
                        '&:hover': {
                          background: 'rgba(182,157,248,0.22)',
                          boxShadow: 'none',

                        },
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 16, mr: 0.5 }} />
                      Слушать
                    </PlayAlbumButton>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <MusicNote sx={{ fontSize: 16 }} />
                    {albumDetails.tracks_count} треков
                  </Box>
                  {albumDetails.duration > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 16 }} />
                      {formatAlbumDuration(albumDetails.duration)}
                    </Box>
                  )}
                </Box>
              </AlbumStats>
            </AlbumInfo>
          </AlbumHeader>

          {albumDetails.description && (
            <>
              <Typography
                variant="body2"
                color="rgba(255, 255, 255, 0.8)"
                sx={{ mb: 2, lineHeight: 1.6 }}
              >
                {albumDetails.description}
              </Typography>
              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            </>
          )}

          {albumDetails.tracks && albumDetails.tracks.length > 0 && (
            <TracksList>
              {albumDetails.tracks.map((track, index) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isTrackPlaying = isCurrentTrack && isPlaying;

                return (
                  <ListItem
                    key={track.id}
                    className={isCurrentTrack ? 'current-track' : ''}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleTrackClick(track)}
                  >
                    <ListItemAvatar>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrackNumber>
                          {isTrackPlaying ? (
                            <Pause sx={{ fontSize: 14, color: '#B69DF8' }} />
                          ) : (
                            index + 1
                          )}
                        </TrackNumber>
                        <Avatar
                          src={
                            track.cover_path 
                              ? (track.cover_path.startsWith('http') 
                                  ? track.cover_path 
                                  : `https://s3.k-connect.ru${track.cover_path}`)
                              : undefined
                          }
                          alt={track.title}
                          sx={{ width: 40, height: 40, borderRadius: '16px', marginRight: '10px' }}
                        >
                          <MusicNote sx={{ fontSize: 20 }} />
                        </Avatar>
                      </Box>
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: isCurrentTrack ? '#B69DF8' : '#ffffff',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {track.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {formatDuration(track.duration)}
                        </Typography>
                      }
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikeTrack(track.id);
                        }}
                        sx={{
                          color: track.is_liked ? '#B69DF8' : 'rgba(255, 255, 255, 0.6)',
                          '&:hover': {
                            color: '#B69DF8',
                          },
                        }}
                      >
                        {track.is_liked ? <Favorite sx={{ fontSize: 20 }} /> : <FavoriteBorder sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </TracksList>
          )}
        </>
      ) : null}
    </UniversalModal>
  );
};

export default AlbumModal;
