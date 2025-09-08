import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Favorite,
  FavoriteBorder,
  Album,
  MoreHoriz,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { TrackListProps, TrackItemProps } from '../types';
import { formatDuration } from '../../../utils/formatters';

const StyledList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  padding: 0,
}));

const StyledListItem = styled(Box)<{ isCurrentTrack?: boolean }>(({ theme, isCurrentTrack }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderRadius: '18px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  backgroundColor: isCurrentTrack 
    ? 'rgba(182, 157, 248, 0.1)' 
    : 'transparent',
  border: '1px solid transparent',
  position: 'relative',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: 'translateX(1px)',
    '& .track-number': {
      opacity: 0,
    },
    '& .play-button': {
      opacity: 1,
    },
    '& .more-button': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5, 2),
  },
}));

const TrackNumber = styled(Typography)(({ theme }) => ({
  minWidth: 24,
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.875rem',
  fontWeight: 500,
  marginRight: theme.spacing(0),
  transition: 'opacity 0.2s ease',
}));

const PlayButtonOverlay = styled(Box)(({ theme }) => ({
  minWidth: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s ease',
  cursor: 'pointer',
  color: '#B69DF8',
}));

const TrackAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '6px',
  marginRight: theme.spacing(2),
  flexShrink: 0,
}));

const TrackInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const TrackTitle = styled(Typography)<{ isCurrentTrack?: boolean }>(({ theme, isCurrentTrack }) => ({
  fontWeight: 600,
  color: isCurrentTrack ? '#B69DF8' : '#ffffff',
  fontSize: '1rem',
  lineHeight: 1.3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  transition: 'color 0.2s ease',
}));

const TrackMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.875rem',
}));

const MetaText = styled(Typography)(({ theme }) => ({
  color: 'inherit',
  fontSize: 'inherit',
}));

const Duration = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.875rem',
  fontWeight: 500,
  minWidth: 'auto',
  textAlign: 'right',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const LikeButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.6)',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#B69DF8',
    backgroundColor: 'rgba(182, 157, 248, 0.1)',
    transform: 'scale(1.02)',
  },
}));

const MoreButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.4)',
  opacity: 0,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
}));

const TrackItem: React.FC<TrackItemProps> = ({
  track,
  index,
  isCurrentTrack,
  isPlaying,
  onTrackClick,
  onLikeTrack,
  isLast,
  lastTrackRef,
}) => {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeTrack(track.id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Здесь можно добавить функциональность меню
  };

  const handleTrackClick = () => {
    // Передаем контекст артиста для правильного переключения
    onTrackClick(track, 'artist');
  };

  return (
    <StyledListItem
      ref={isLast ? lastTrackRef : null}
      onClick={handleTrackClick}
      isCurrentTrack={isCurrentTrack}
    >


      {/* Обложка трека */}
      <TrackAvatar
        src={
          track.cover_path 
            ? (track.cover_path.startsWith('http') 
                ? track.cover_path 
                : `https://s3.k-connect.ru${track.cover_path}`)
            : undefined
        }
        variant="rounded"
      >
        <Album />
      </TrackAvatar>

      {/* Информация о треке */}
      <TrackInfo>
        <TrackTitle isCurrentTrack={isCurrentTrack}>
          {track.title}
        </TrackTitle>
        <TrackMeta>
          {track.album && (
            <>
              <MetaText>{track.album}</MetaText>
              <MetaText>•</MetaText>
            </>
          )}
          <MetaText>{(track.plays_count ?? 0).toLocaleString()} </MetaText>
        </TrackMeta>
      </TrackInfo>

      {/* Длительность */}
      <Duration>
        {formatDuration(track.duration || 0)}
      </Duration>

      {/* Действия */}
      <ActionButtons>
        <LikeButton onClick={handleLikeClick}>
          {track.is_liked ? (
            <Favorite sx={{ fontSize: 18, color: '#B69DF8' }} />
          ) : (
            <FavoriteBorder sx={{ fontSize: 18 }} />
          )}
        </LikeButton>

      </ActionButtons>
    </StyledListItem>
  );
};

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  onTrackClick,
  onLikeTrack,
  currentTrack,
  isPlaying,
  hasMoreTracks,
  loadingMoreTracks,
  onLoadMore,
}) => {
  const observer = React.useRef<IntersectionObserver>();
  
  const lastTrackElementRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (loadingMoreTracks) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMoreTracks && onLoadMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMoreTracks, hasMoreTracks, onLoadMore]
  );

  if (tracks.length === 0) {
    return (
      <LoadingContainer>
        <Typography color="text.secondary" variant="h6">
          Треки не найдены
        </Typography>
      </LoadingContainer>
    );
  }

  return (
    <StyledList>
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isCurrentTrack && isPlaying;
        const isLast = index === tracks.length - 1 && hasMoreTracks;

        return (
          <TrackItem
            key={track.id}
            track={track}
            index={index}
            isCurrentTrack={isCurrentTrack}
            isPlaying={isCurrentlyPlaying}
            onTrackClick={onTrackClick}
            onLikeTrack={onLikeTrack}
            isLast={isLast}
            lastTrackRef={isLast ? lastTrackElementRef : null}
          />
        );
      })}

      {loadingMoreTracks && (
        <LoadingContainer>
          <CircularProgress size={24} sx={{ color: '#B69DF8' }} />
        </LoadingContainer>
      )}
    </StyledList>
  );
};

export default TrackList;
