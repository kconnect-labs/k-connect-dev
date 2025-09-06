import React from 'react';
import {
  Grid,
  Box,
  Typography,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  MoreHoriz,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { FeaturedTrackGridProps, FeaturedTrackItemProps } from '../types';
import { formatDuration } from '../../../utils/formatters';

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '5px',
  marginBottom: '5px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  },
}));

const TrackCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  '&:hover': {
    transform: 'translateY(-1px) scale(1.01)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    '& .track-overlay': {
      opacity: 1,
    },
  },
}));

const TrackImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1/1',
  overflow: 'hidden',
  backgroundColor: '#0a0a0a',
  borderRadius: '8px',
}));

const TrackImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}));

const PlayOverlay = styled(Box)<{ isPlaying?: boolean }>(({ theme, isPlaying }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: isPlaying 
    ? 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))'
    : 'linear-gradient(135deg, rgba(0,0,0,0), rgba(0,0,0,0))',
  opacity: isPlaying ? 1 : 0,
  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
}));

const PlayButton = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #B69DF8 0%, #D0BCFF 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#000',
  boxShadow: '0 8px 24px rgba(182, 157, 248, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 32px rgba(182, 157, 248, 0.6)',
  },
}));

const DurationBadge = styled(Box)<{ isCurrentTrack?: boolean }>(({ theme, isCurrentTrack }) => ({
  position: 'absolute',
  bottom: 8,
  right: 8,
  padding: theme.spacing(0.5, 1),
  backgroundColor: isCurrentTrack 
    ? theme.palette.primary.main 
    : 'rgba(0, 0, 0, 0.8)',
  color: isCurrentTrack ? '#000' : '#fff',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 500,
  backdropFilter: 'blur(10px)',
}));

const TrackInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const TrackHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
}));

const TrackTitle = styled(Typography)<{ isCurrentTrack?: boolean }>(({ theme, isCurrentTrack }) => ({
  fontWeight: 600,
  color: isCurrentTrack ? '#B69DF8' : '#ffffff',
  fontSize: '1rem',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flex: 1,
  transition: 'color 0.2s ease',
}));

const TrackMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const PlaysCount = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const LikeButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.75),
  color: 'rgba(255, 255, 255, 0.6)',
  transition: 'all 0.2s ease',
  borderRadius: '8px',
  '&:hover': {
    color: '#B69DF8',
    backgroundColor: 'rgba(182, 157, 248, 0.1)',
    transform: 'scale(1.05)',
  },
}));

const MoreButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.75),
  color: 'rgba(255, 255, 255, 0.4)',
  transition: 'all 0.2s ease',
  borderRadius: '8px',
  opacity: 0,
  '.track-card:hover &': {
    opacity: 1,
  },
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const FeaturedTrackItem: React.FC<FeaturedTrackItemProps> = ({
  track,
  isCurrentTrack,
  isPlaying,
  onTrackClick,
  onLikeTrack,
}) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeTrack(track.id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
  };

  const handleTrackClick = () => {
    
    onTrackClick(track, 'artist');
  };

  return (
    <TrackCard
      className="track-card"
      onClick={handleTrackClick}
    >
      <TrackImageContainer>
        <TrackImage
          src={
            track.cover_path 
              ? (track.cover_path.startsWith('http') 
                  ? track.cover_path 
                  : `https://s3.k-connect.ru${track.cover_path}`)
              : 'https://s3.k-connect.ru/static/uploads/system/album_placeholder.jpg'
          }
          alt={track.title}
        />
        <PlayOverlay className="track-overlay" isPlaying={isPlaying}>
          <PlayButton>
            {isPlaying ? (
              <Pause sx={{ fontSize: 32 }} />
            ) : (
              <PlayArrow sx={{ fontSize: 32, marginLeft: '3px' }} />
            )}
          </PlayButton>
        </PlayOverlay>
      </TrackImageContainer>

      <TrackInfo>
        <TrackHeader>
          <TrackTitle isCurrentTrack={isCurrentTrack}>
            {track.title}
          </TrackTitle>
          <MoreButton onClick={handleMoreClick}>
            <MoreHoriz sx={{ fontSize: 18 }} />
          </MoreButton>
        </TrackHeader>
        
        <TrackMeta>
          <PlaysCount>
            {(track.plays_count || 0).toLocaleString()}
          </PlaysCount>
          <ActionButtons>
            <LikeButton onClick={handleLikeClick}>
              {track.is_liked ? (
                <Favorite sx={{ fontSize: 18, color: '#B69DF8' }} />
              ) : (
                <FavoriteBorder sx={{ fontSize: 18 }} />
              )}
            </LikeButton>
          </ActionButtons>
        </TrackMeta>
      </TrackInfo>
    </TrackCard>
  );
};

const FeaturedTrackGrid: React.FC<FeaturedTrackGridProps> = ({
  tracks,
  onTrackClick,
  onLikeTrack,
  currentTrack,
  isPlaying,
}) => {
  return (
    <GridContainer>
      {tracks.map((track) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;

        return (
          <FeaturedTrackItem
            key={track.id}
            track={track}
            isCurrentTrack={isCurrentTrack}
            isPlaying={isCurrentlyPlaying}
            onTrackClick={onTrackClick}
            onLikeTrack={onLikeTrack}
          />
        );
      })}
    </GridContainer>
  );
};

export default FeaturedTrackGrid;
