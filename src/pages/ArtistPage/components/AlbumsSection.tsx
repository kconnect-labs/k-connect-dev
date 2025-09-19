import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  PlayArrow,
  Album as AlbumIcon,
  MusicNote,
  AccessTime,
  ExpandMore,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import InfoBlock from '../../../UIKIT/InfoBlock';

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

interface AlbumsSectionProps {
  albums: Album[];
  isLoading: boolean;
  error: string | null;
  onAlbumClick: (album: Album) => void;
}

const AlbumsGrid = styled(Grid)(({ theme }) => ({
  '& .MuiGrid-item': {
    padding: '2.5px',
  },
}));

const AlbumCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  borderRadius: '16px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-1px)',
    borderColor: 'rgba(182, 157, 248, 0.3)',
  },
}));

const AlbumCover = styled(CardMedia)(({ theme }) => ({
  aspectRatio: '1',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const PlayOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'all 0.3s ease',
  '.album-card:hover &': {
    opacity: 1,
  },
}));

const PlayButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#B69DF8',
  color: '#ffffff',
  width: 56,
  height: 56,
  '&:hover': {
    backgroundColor: '#D0BCFF',
    transform: 'scale(1.1)',
  },
}));

const AlbumContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: `${theme.spacing(2)} !important`,
}));

const AlbumTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  color: '#ffffff',
  marginBottom: theme.spacing(0.5),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const AlbumMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  flexWrap: 'wrap',
}));

const AlbumStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.8rem',
}));

const AlbumTypeChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: '0.7rem',
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

const formatDuration = (seconds: number): string => {
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

const LoadingSkeleton: React.FC = () => (
  <AlbumsGrid container spacing={0}>
    {[...Array(4)].map((_, index) => (
      <Grid item xs={6} sm={4} md={3} lg={3} key={index}>
        <Card sx={{ background: 'var(--theme-background)', border: '1px solid rgba(66, 66, 66, 0.5)' }}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent>
            <Skeleton variant="text" height={24} />
            <Skeleton variant="text" height={16} width="60%" />
            <Skeleton variant="text" height={16} width="80%" />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </AlbumsGrid>
);

const ShowAllButton = styled(Button)(({ theme }) => ({
  borderRadius: '18px',
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none',
  backgroundColor: 'rgba(182, 157, 248, 0.1)',
  color: '#B69DF8',
  border: '1px solid rgba(182, 157, 248, 0.3)',
  transition: 'all 0.3s ease',
  marginTop: theme.spacing(2),
  '&:hover': {
    backgroundColor: 'rgba(182, 157, 248, 0.2)',
    borderColor: 'rgba(182, 157, 248, 0.5)',
    transform: 'translateY(-1px)',
  },
}));

const AlbumsSection: React.FC<AlbumsSectionProps> = ({
  albums,
  isLoading,
  error,
  onAlbumClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showAll, setShowAll] = useState(false);

  
  const getAlbumsPerRow = () => {
    if (isMobile) return 2; 
    return 4; 
  };

  const albumsPerRow = getAlbumsPerRow();
  const displayedAlbums = showAll ? albums : albums.slice(0, albumsPerRow);
  const hasMoreAlbums = albums.length > albumsPerRow;

  if (error) {
    return null; 
  }

  if (isLoading) {
    return (
      <InfoBlock
        title="Альбомы"
        description=""
        children={<LoadingSkeleton />}
        useTheme={true}
        style={{ marginBottom: '5px', padding: '16px' }}
        styleVariant="default"
        titleStyle={{}}
        descriptionStyle={{}}
        customStyle={false}
        className=""
      />
    );
  }

  if (!albums || albums.length === 0) {
    return null; 
  }

  return (
    <InfoBlock
      title="Альбомы"
      description=""
      children={
        <Box>
          <AlbumsGrid container spacing={0}>
            {displayedAlbums.map((album) => (
              <Grid item xs={6} sm={4} md={3} lg={3} key={album.id}>
                <AlbumCard
                  className="album-card"
                  onClick={() => onAlbumClick(album)}
                >
                  <AlbumCover
                    image={
                      album.cover_url 
                        ? (album.cover_url.startsWith('http') 
                            ? album.cover_url 
                            : `https://s3.k-connect.ru${album.cover_url}`)
                        : 'https://s3.k-connect.ru/static/uploads/system/album_placeholder.jpg'
                    }
                    title={album.title}
                  >
                    {!album.cover_url && (
                      <AlbumIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)' }} />
                    )}
                    <PlayOverlay>
                      <PlayButton>
                        <PlayArrow sx={{ fontSize: 24 }} />
                      </PlayButton>
                    </PlayOverlay>
                  </AlbumCover>

                  <AlbumContent>
                    <AlbumTitle>{album.title}</AlbumTitle>
                    
                    <AlbumMeta>
                      <AlbumTypeChip
                        label={getAlbumTypeLabel(album.album_type)}
                        size="small"
                        className={album.album_type}
                      />
                      {album.release_date && (
                        <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                          {new Date(album.release_date).getFullYear()}
                        </Typography>
                      )}
                    </AlbumMeta>

                    <AlbumStats>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MusicNote sx={{ fontSize: 14 }} />
                        {album.tracks_count} треков
                      </Box>
                      {album.duration > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 14 }} />
                          {formatDuration(album.duration)}
                        </Box>
                      )}
                    </AlbumStats>
                  </AlbumContent>
                </AlbumCard>
              </Grid>
            ))}
          </AlbumsGrid>

          {/* Кнопка "Показать все" */}
          {hasMoreAlbums && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <ShowAllButton
                onClick={() => setShowAll(!showAll)}
                startIcon={<ExpandMore sx={{ 
                  transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} />}
              >
                {showAll ? 'Скрыть' : `Показать все (${albums.length})`}
              </ShowAllButton>
            </Box>
          )}
        </Box>
      }
      useTheme={true}
      style={{ marginBottom: '5px', padding: '16px' }}
      styleVariant="default"
      titleStyle={{}}
      descriptionStyle={{}}
      customStyle={false}
      className=""
    />
  );
};

export default AlbumsSection;
