import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  Grid,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  MusicNote as MusicIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Verified as VerifiedIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon,
  TextFields as TextFieldsIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Track } from '../types';

const TracksModerationTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const { getTracks, deleteTrack, clearTrackDescription, clearTrackLyrics } = useNitroApi();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackIdInput, setTrackIdInput] = useState('');
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [clearDescriptionDialogOpen, setClearDescriptionDialogOpen] = useState(false);
  const [clearLyricsDialogOpen, setClearLyricsDialogOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [actionsDialogOpen, setActionsDialogOpen] = useState(false);

  const fetchTracks = useCallback(async (pageNum: number = 1, reset: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const trackId = trackIdInput ? parseInt(trackIdInput) : undefined;
      const response = await getTracks(pageNum, searchQuery, trackId, suspiciousOnly) as any;
      
      if (reset) {
        setTracks(response.tracks || []);
      } else {
        setTracks(prev => [...prev, ...(response.tracks || [])]);
      }
      
      setPage(response.pagination?.page || 1);
      setHasMore(response.pagination?.has_next || false);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError('Ошибка загрузки треков');
      console.error('Error fetching tracks:', err);
    } finally {
      setLoading(false);
    }
  }, [getTracks, searchQuery, trackIdInput, suspiciousOnly]);

  useEffect(() => {
    fetchTracks(1, true);
  }, [fetchTracks]);

  const handleSearch = () => {
    setTracks([]);
    fetchTracks(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchTracks(page + 1, false);
    }
  };

  const handleDeleteTrack = async () => {
    if (!selectedTrack) return;
    
    setDeleteLoading(true);
    try {
      await deleteTrack(selectedTrack.id);
      setTracks(prev => prev.filter(track => track.id !== selectedTrack.id));
      setDeleteDialogOpen(false);
      setSelectedTrack(null);
    } catch (err) {
      console.error('Error deleting track:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearDescription = async () => {
    if (!selectedTrack) return;
    
    setClearLoading(true);
    try {
      await clearTrackDescription(selectedTrack.id);
      setTracks(prev => 
        prev.map(track => 
          track.id === selectedTrack.id 
            ? { ...track, description: undefined, description_length: 0, is_suspicious: true }
            : track
        )
      );
      setClearDescriptionDialogOpen(false);
      setSelectedTrack(null);
    } catch (err) {
      console.error('Error clearing description:', err);
    } finally {
      setClearLoading(false);
    }
  };

  const handleClearLyrics = async () => {
    if (!selectedTrack) return;
    
    setClearLoading(true);
    try {
      await clearTrackLyrics(selectedTrack.id);
      setTracks(prev => 
        prev.map(track => 
          track.id === selectedTrack.id 
            ? { ...track, lyrics: undefined, lyrics_length: 0, is_suspicious: true }
            : track
        )
      );
      setClearLyricsDialogOpen(false);
      setSelectedTrack(null);
    } catch (err) {
      console.error('Error clearing lyrics:', err);
    } finally {
      setClearLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Неизвестно';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Дата неизвестна';
    }
  };

  const canModerate = permissions?.delete_posts || false;

  return (
    <Box sx={{ p: 0 }}>
      {/* Поиск и фильтры */}
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'var(--theme-background)',
          backdropFilter: 'var(--theme-backdrop-filter)',
          borderRadius: 'var(--main-border-radius)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Поиск по названию, артисту, альбому..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="ID трека"
              value={trackIdInput}
              onChange={(e) => setTrackIdInput(e.target.value)}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={suspiciousOnly}
                  onChange={(e) => setSuspiciousOnly(e.target.checked)}
                />
              }
              label="Без обложки"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              Поиск
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Статистика */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip 
          label={`Всего треков: ${total}`} 
          color="primary" 
          variant="outlined" 
        />
        {suspiciousOnly && (
          <Chip 
            label="Показаны только без обложки" 
            color="warning" 
            icon={<WarningIcon />}
          />
        )}
      </Box>

      {/* Список треков */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={1}>
        {tracks.map((track) => (
          <Grid item xs={12} key={track.id}>
            <Card 
              sx={{ 
                background: 'var(--theme-background)',
                backdropFilter: 'var(--theme-backdrop-filter)',
                borderRadius: 'var(--main-border-radius)',
                borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                '&:hover': {
                  borderColor: 'var(--main-accent-color)',
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  {/* Обложка трека */}
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={track.cover_path}
                      alt={`Обложка ${track.title}`}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 'var(--main-border-radius)',
                        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://s3.k-connect.ru/static/uploads/system/album_placeholder.jpg';
                      }}
                    />
                    {/* Аватар пользователя поверх обложки */}
                    <Avatar
                      src={track.user?.avatar_url}
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        border: '2px solid var(--theme-background)'
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </Box>

                  {/* Основная информация */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--main-accent-color)' }}>
                        {track.title}
                      </Typography>
                      {track.verified && (
                        <VerifiedIcon sx={{ color: 'var(--main-accent-color)', fontSize: 20 }} />
                      )}
                      {track.is_suspicious && (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label="Подозрительный" 
                            size="small" 
                            color="warning" 
                            icon={<WarningIcon />}
                          />
                          {track.suspicious_reasons?.map((reason, index) => (
                            <Chip 
                              key={index}
                              label={reason} 
                              size="small" 
                              color="error" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Артист:</strong> {track.artist}
                      {track.album && ` • Альбом: ${track.album}`}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{track.plays_count}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FavoriteIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{track.likes_count}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDuration(track.duration)}
                      </Typography>
                      {track.genre && (
                        <Chip label={track.genre} size="small" variant="outlined" />
                      )}
                    </Box>

                    {/* Описание */}
                    {track.description && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: track.description_length < 20 ? 'warning.main' : 'text.primary'
                        }}>
                          <strong>Описание:</strong> {track.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Символов: {track.description_length}
                        </Typography>
                      </Box>
                    )}

                    {/* Текст песни */}
                    {track.lyrics && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: track.lyrics_length < 20 ? 'warning.main' : 'text.primary'
                        }}>
                          <strong>Текст:</strong> {track.lyrics}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Символов: {track.lyrics_length}
                          </Typography>
                          {track.has_synced_lyrics && (
                            <Chip 
                              label="Синхронный текст" 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Информация о пользователе */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Загружен пользователем:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {track.user?.name || 'Неизвестный пользователь'}
                      </Typography>
                      {track.user?.username && (
                        <Typography variant="caption" color="text.secondary">
                          (@{track.user.username})
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Создан: {formatDate(track.created_at)}
                    </Typography>
                  </Box>

                  {/* Кнопка действий */}
                  {canModerate && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedTrack(track);
                        setActionsDialogOpen(true);
                      }}
                      startIcon={<SettingsIcon />}
                    >
                      Действия
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Кнопка "Загрузить еще" */}
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Загрузить еще
          </Button>
        </Box>
      )}

      {/* Диалог удаления трека */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить трек</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить трек "{selectedTrack?.title}" от {selectedTrack?.artist}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            color="error"
            onClick={handleDeleteTrack}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог очистки описания */}
      <Dialog open={clearDescriptionDialogOpen} onClose={() => setClearDescriptionDialogOpen(false)}>
        <DialogTitle>Очистить описание</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите очистить описание трека "{selectedTrack?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDescriptionDialogOpen(false)}>Отмена</Button>
          <Button
            color="warning"
            onClick={handleClearDescription}
            disabled={clearLoading}
            startIcon={clearLoading ? <CircularProgress size={20} /> : <ClearIcon />}
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог очистки текста песни */}
      <Dialog open={clearLyricsDialogOpen} onClose={() => setClearLyricsDialogOpen(false)}>
        <DialogTitle>Очистить текст песни</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите очистить текст песни для трека "{selectedTrack?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearLyricsDialogOpen(false)}>Отмена</Button>
          <Button
            color="warning"
            onClick={handleClearLyrics}
            disabled={clearLoading}
            startIcon={clearLoading ? <CircularProgress size={20} /> : <ClearIcon />}
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог действий */}
      <Dialog open={actionsDialogOpen} onClose={() => setActionsDialogOpen(false)}>
        <DialogTitle>Действия с треком</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Выберите действие для трека "{selectedTrack?.title}" от {selectedTrack?.artist}
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setActionsDialogOpen(false);
                  setDeleteDialogOpen(true);
                }}
              >
                <ListItemIcon>
                  <DeleteIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Удалить трек" 
                  secondary="Полное удаление трека из системы"
                />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setActionsDialogOpen(false);
                  setClearDescriptionDialogOpen(true);
                }}
                disabled={!selectedTrack?.description}
              >
                <ListItemIcon>
                  <ClearIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Удалить текст" 
                  secondary="Очистить описание трека"
                />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setActionsDialogOpen(false);
                  setClearLyricsDialogOpen(true);
                }}
                disabled={!selectedTrack?.lyrics}
              >
                <ListItemIcon>
                  <SyncIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Удалить синхрон текст" 
                  secondary="Очистить текст песни и синхронизацию"
                />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionsDialogOpen(false)}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TracksModerationTab;
