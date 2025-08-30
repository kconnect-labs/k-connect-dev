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
  Divider,
  Switch,
  FormControlLabel,
  Snackbar,
  Button,
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MusicUploadDialog from '../../../components/Music/MusicUploadDialog';
import UploadIcon from '@mui/icons-material/Upload';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MoreHoriz } from '@mui/icons-material';

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: 12,
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const TrackListItem = styled(ListItem)(({ theme, isActive, ...props }) => ({
  borderRadius: 12,
  background: isActive
    ? 'var(--theme-background, rgba(255, 255, 255, 0.05))'
    : 'var(--theme-background, rgba(255, 255, 255, 0.02))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(0.25), // 2px отступ между треками
  padding: theme.spacing(0.75, 2), // Еще меньше паддинг для компактности
  transition: 'background 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.08))',
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
    backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.1))',
  },
  // Адаптивность для телефонов
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    marginLeft: theme.spacing(0.25),
  },
}));

const DragHandle = styled('div')(({ theme }) => ({
  color: 'text.secondary',
  width: 32,
  height: 32,
  marginRight: theme.spacing(1),
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  touchAction: 'none',
  '&:active': {
    cursor: 'grabbing',
  },
  '&:hover': {
    color: 'text.primary',
  },
}));

const DraggableTrackListItem = styled(ListItem)(({ theme, isActive, isDragging, ...props }) => ({
  borderRadius: 12,
  background: isActive
    ? 'var(--theme-background, rgba(255, 255, 255, 0.05))'
    : isDragging
    ? 'var(--theme-background, rgba(255, 255, 255, 0.08))'
    : 'var(--theme-background, rgba(255, 255, 255, 0.02))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(0.25),
  padding: theme.spacing(0.75, 2),
  transition: 'all 0.15s ease',
  cursor: 'pointer',
  opacity: isDragging ? 0.9 : 1,
  transform: isDragging ? 'rotate(2deg) scale(1.02)' : 'none',
  zIndex: isDragging ? 1000 : 'auto',
  boxShadow: isDragging ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
  '&:hover': {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.08))',
  },
  '&:last-child': {
    marginBottom: 0,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1.5),
  },
}));

const LikedTracksPage = ({ onBack }) => {
  const { playTrack, isPlaying, currentTrack, togglePlay, currentSection } = useMusic();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Уменьшаем дистанцию для мобильных
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchLikedTracks();
  }, []);

  const fetchLikedTracks = async (page = 1, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }
      
      const response = await apiClient.get('/api/music/liked/order', {
        params: {
          page: page,
          per_page: 20
        }
      });
      
      if (response.data.success) {
        const newTracks = response.data.tracks;
        
        if (append) {
          setTracks(prevTracks => [...prevTracks, ...newTracks]);
        } else {
          setTracks(newTracks);
        }
        
        setPagination({
          currentPage: response.data.current_page,
          totalPages: response.data.pages,
          total: response.data.total,
          hasMore: response.data.current_page < response.data.pages,
        });
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

  const handlePlayTrack = useCallback(
    track => {
      if (isPlaying && currentTrack?.id === track.id) {
        togglePlay();
      } else {
        playTrack(track, 'liked');
      }
    },
    [isPlaying, currentTrack, playTrack, togglePlay]
  );

  const handleLikeTrack = async trackId => {
    try {
      const response = await apiClient.post(`/api/music/${trackId}/like`);
      if (response.data.success) {
        setTracks(prevTracks => {
          const track = prevTracks.find(t => t.id === trackId);
          if (track && track.is_liked) {
            return prevTracks.filter(t => t.id !== trackId);
          } else {
            return prevTracks.map(track =>
              track.id === trackId
                ? {
                    ...track,
                    is_liked: !track.is_liked,
                    likes_count: response.data.likes_count,
                  }
                : track
            );
          }
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tracks.findIndex(track => track.id === active.id);
      const newIndex = tracks.findIndex(track => track.id === over.id);

      const newTracks = arrayMove(tracks, oldIndex, newIndex);
      setTracks(newTracks);

      // Отправляем новый порядок на сервер
      try {
        const trackOrder = newTracks.map(track => track.id);
        console.log('Отправляем новый порядок:', trackOrder);
        await apiClient.post('/api/music/liked/reorder', {
          track_order: trackOrder
        });
        
        // Убираем уведомление об успехе - показываем только ошибки
      } catch (err) {
        console.error('Error updating track order:', err);
        setSnackbar({
          open: true,
          message: 'Ошибка при обновлении порядка треков',
          severity: 'error',
        });
        // Восстанавливаем исходный порядок при ошибке
        fetchLikedTracks();
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const loadMoreTracks = async () => {
    if (pagination.hasMore && !loading) {
      const nextPage = pagination.currentPage + 1;
      await fetchLikedTracks(nextPage, true);
    }
  };



  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Sortable Track Item Component
  const SortableTrackItem = ({ track, isActive, onPlay, onLike, onTrackClick }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: track.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <DraggableTrackListItem
        ref={setNodeRef}
        style={style}
        isActive={isActive}
        isDragging={isDragging}
        onClick={() => onTrackClick(track)}
      >
        <DragHandle
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </DragHandle>
        
        <ListItemAvatar>
          <TrackAvatar src={track.cover_path} alt={track.title} />
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography
                variant="body1"
                component="span"
                fontWeight={isActive ? 600 : 500}
                sx={{
                  color: isActive ? 'primary.main' : 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {track.title}
              </Typography>
            </span>
          }
          secondary={
            <span>
              <Typography
                variant="body2"
                component="span"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {track.artist}
              </Typography>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                <AccessTimeIcon
                  sx={{ fontSize: 14, color: 'text.secondary' }}
                />
                <Typography variant="caption" component="span" color="text.secondary">
                  {formatDuration(track.duration)}
                </Typography>
                {track.genre && (
                  <>
                    <Typography
                      variant="caption"
                      component="span"
                      color="text.secondary"
                    >
                      •
                    </Typography>
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
              </span>
            </span>
          }
        />
        

      </DraggableTrackListItem>
    );
  };

  // Upload dialog handlers
  const handleOpenUploadDialog = () => setUploadDialogOpen(true);
  const handleCloseUploadDialog = () => setUploadDialogOpen(false);

  // Menu handlers
  const handleOpenMenu = (event, track) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTrack(track);
  };
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setSelectedTrack(null);
  };

  if (loading) {
    return (
      <PageContainer maxWidth='xl' disableGutters sx={{ pb: 10 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='60vh'
        >
          <CircularProgress color='primary' />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth='xl' disableGutters sx={{ pb: 10 }}>
      <HeaderCard
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: '4px',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            p: 2,
            pb: '16px !important',
          }}
        >
          <IconButton
            onClick={onBack}
            sx={{
              mr: 2,
              color: 'text.primary',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h4' fontWeight={700} sx={{ mb: 0.5 }}>
              Мои любимые
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {tracks.length} треков в вашей коллекции • Перетаскивайте треки для изменения порядка
            </Typography>
          </Box>
          <Tooltip title='Загрузить трек'>
            <IconButton
              onClick={handleOpenUploadDialog}
              sx={{
                ml: 2,
                color: 'primary.main',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                transition: 'background 0.2s',
                '&:hover': {
                  background: 'rgba(255,255,255,0.08)',
                },
              }}
              size='large'
            >
              <UploadIcon fontSize='medium' />
            </IconButton>
          </Tooltip>
        </CardContent>
      </HeaderCard>

      <MusicUploadDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        onSuccess={fetchLikedTracks}
      />

      {error && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 12 }}>
          {error}
        </Alert>
      )}

      {tracks.length === 0 ? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='40vh'
          sx={{
            borderRadius: 12,
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03)) ',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h6' color='text.secondary' sx={{ mb: 1 }}>
            У вас пока нет любимых треков
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Лайкайте треки, которые вам нравятся, и они появятся здесь
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={tracks.map(track => track.id)}
            strategy={verticalListSortingStrategy}
            transitionDuration={150}
          >
            <List sx={{ p: 0 }}>
              {tracks.map((track) => {
                const isCurrentTrack = currentTrack?.id === track.id;
                const isTrackPlaying = isPlaying && isCurrentTrack;

                return (
                  <SortableTrackItem
                    key={track.id}
                    track={track}
                    isActive={isCurrentTrack && currentSection === 'liked'}
                    onPlay={handlePlayTrack}
                    onLike={handleLikeTrack}
                    onTrackClick={handlePlayTrack}
                  />
                );
              })}
            </List>
          </SortableContext>
        </DndContext>
      )}

      {/* Кнопка "Загрузить еще" */}
      {pagination.hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <Button
            variant="outlined"
            onClick={loadMoreTracks}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: 120,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : null}
            Загрузить еще
          </Button>
        </Box>
      )}
      
      {/* Информация о пагинации */}
      {pagination.total > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Показано {tracks.length} из {pagination.total} треков
          </Typography>
        </Box>
      )}

      {/* Меню для трека */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 2,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          },
        }}
      >
        {selectedTrack && (
          <MenuItem
            onClick={() => {
              handlePlayTrack(selectedTrack);
              handleCloseMenu();
            }}
          >
            <PlayArrowIcon fontSize='small' sx={{ mr: 1 }} /> Воспроизвести
          </MenuItem>
        )}
        {selectedTrack && (
          <MenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                window.location.origin + '/music/' + selectedTrack.id
              );
              handleCloseMenu();
            }}
          >
            <FavoriteBorderIcon fontSize='small' sx={{ mr: 1 }} /> Копировать
            ссылку
          </MenuItem>
        )}
        {/* Добавьте другие пункты меню по необходимости */}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default LikedTracksPage;
