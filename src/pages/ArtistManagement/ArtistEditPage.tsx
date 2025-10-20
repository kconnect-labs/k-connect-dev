import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Button, 
  Grid, 

  CircularProgress, 
  Alert,
  TextField,

  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,

  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Icon } from '@iconify/react';
import { AuthContext } from '../../context/AuthContext';
import { useArtistManagement } from './hooks/useArtistManagement';
import InfoBlock from '../../UIKIT/InfoBlock/';
import UniversalModal from '../../UIKIT/UniversalModal/';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

// Временный интерфейс
interface Artist {
  id: number;
  name: string;
  bio?: string;
  avatar_url?: string;
  verified: boolean;
  user_id?: number | null;
  created_at: string;
  tracks_count?: number;
  api_source?: string | null;
  genres?: string[];
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
}

interface Track {
  id: number;
  title: string;
  artist_id: number;
  file_path: string;
  duration?: number;
  plays_count: number;
  likes_count: number;
  created_at: string;
  cover_path?: string;
  artist?: string;
  album?: string;
}

const ArtistEditPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { getMyArtists, updateArtist, deleteArtist, getArtistTracks, assignTrack, unassignTrack } = useArtistManagement();
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();

  // Общие стили для TextField
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      background: 'var(--theme-background, rgba(255,255,255,0.03))',
      borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
      borderRadius: 'var(--theme-border-radius, 8px)',
      color: 'var(--theme-text-primary, inherit)',
      '&:hover': {
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
      },
      '&.Mui-focused': {
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
      }
    },
    '& .MuiInputLabel-root': {
      color: 'var(--theme-text-secondary, rgba(255,255,255,0.7))'
    }
  };

  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Состояние для редактирования
  const [editMode, setEditMode] = useState(false);
  const [editedArtist, setEditedArtist] = useState<Partial<Artist>>({});
  
  // Диалоги
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addTrackDialogOpen, setAddTrackDialogOpen] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [loadingAvailableTracks, setLoadingAvailableTracks] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [searchMode, setSearchMode] = useState('artist');

  useEffect(() => {
    if (user && artistId) {
      loadArtistData();
    }
  }, [user, artistId]);

  const loadArtistData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Загружаем артистов пользователя
      const response = await getMyArtists();
      if (response.success && response.artists) {
        const foundArtist = response.artists.find(a => a.id === parseInt(artistId!));
        if (foundArtist) {
          setArtist(foundArtist);
          setEditedArtist(foundArtist);
          
          // Загружаем треки артиста
          await loadArtistTracks(foundArtist.id);
        } else {
          setError('Артист не найден или не принадлежит вам');
        }
      } else {
        setError('Ошибка загрузки данных артиста');
      }
    } catch (err) {
      console.error('Error loading artist data:', err);
      setError('Ошибка загрузки данных артиста');
    } finally {
      setLoading(false);
    }
  };

  const loadArtistTracks = async (artistId: number) => {
    try {
      const response = await getArtistTracks(artistId);
      if (response.success) {
        setTracks((response as any).tracks || []);
      }
    } catch (err) {
      console.error('Error loading artist tracks:', err);
    }
  };

  const handleSave = async () => {
    if (!artist) return;
    
    try {
      setSaving(true);
      const response = await updateArtist(artist.id, editedArtist);
      if (response.success) {
        setArtist({ ...artist, ...editedArtist });
        setEditMode(false);
      } else {
        setError(response.error || 'Ошибка сохранения');
      }
    } catch (err) {
      console.error('Error saving artist:', err);
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!artist) return;
    
    try {
      setSaving(true);
      const response = await deleteArtist(artist.id);
      if (response.success) {
        navigate('/artist-management');
      } else {
        setError(response.error || 'Ошибка удаления');
      }
    } catch (err) {
      console.error('Error deleting artist:', err);
      setError('Ошибка удаления');
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAssignTrack = async (trackId: number) => {
    if (!artist) return;
    
    try {
      const response = await assignTrack(artist.id, trackId);
      if (response.success) {
        await loadArtistTracks(artist.id);
        setAddTrackDialogOpen(false);
      } else {
        setError(response.error || 'Ошибка добавления трека');
      }
    } catch (err) {
      console.error('Error assigning track:', err);
      setError('Ошибка добавления трека');
    }
  };

  const handleUnassignTrack = async (trackId: number) => {
    if (!artist) return;
    
    try {
      const response = await unassignTrack(artist.id, trackId);
      if (response.success) {
        await loadArtistTracks(artist.id);
      } else {
        setError(response.error || 'Ошибка удаления трека');
      }
    } catch (err) {
      console.error('Error unassigning track:', err);
      setError('Ошибка удаления трека');
    }
  };

  const openAddTrackDialog = async () => {
    // Очищаем предыдущие результаты поиска
    setAvailableTracks([]);
    setSelectedTracks([]);
    setTrackSearch('');
    setAddTrackDialogOpen(true);
  };

  const searchTracks = async () => {
    if (!trackSearch || trackSearch.trim().length < 2) return;
    
    try {
      setLoadingAvailableTracks(true);
      
      const searchResponse = await axios.get(`/api/music/search?query=${encodeURIComponent(trackSearch.trim())}`);
      if (Array.isArray(searchResponse.data)) {
        const foundTracks = searchResponse.data || [];
        const assignedTrackIds = tracks.map(track => track.id);
        const availableTracks = foundTracks.filter((track: any) => 
          !assignedTrackIds.includes(track.id)
        );

        setAvailableTracks(availableTracks);
        console.log(`🔍 Найдено треков: ${foundTracks.length}, доступно для добавления: ${availableTracks.length}`);
      }
    } catch (error) {
      console.error('Ошибка поиска треков:', error);
      setAvailableTracks([]);
    } finally {
      setLoadingAvailableTracks(false);
    }
  };

  const handleToggleTrackSelection = (trackId: number) => {
    setSelectedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const handleSelectAllSearchedTracks = () => {
    if (selectedTracks.length === availableTracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(availableTracks.map(track => track.id));
    }
  };

  const handleAssignTracks = async () => {
    if (!artist || selectedTracks.length === 0) return;
    
    try {
      setLoadingAvailableTracks(true);
      for (const trackId of selectedTracks) {
        await handleAssignTrack(trackId);
      }
      setSelectedTracks([]);
      setAvailableTracks([]);
    } catch (error) {
      console.error('Ошибка назначения треков:', error);
    } finally {
      setLoadingAvailableTracks(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: 'transparent' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, background: 'transparent' }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/artist-management')} sx={{ mt: 2 }}>
          Вернуться к списку артистов
        </Button>
      </Box>
    );
  }

  if (!artist) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', background: 'transparent' }}>
        <Typography variant="h6" gutterBottom>Артист не найден</Typography>
        <Button onClick={() => navigate('/artist-management')}>
          Вернуться к списку артистов
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, minHeight: '100vh', background: 'transparent' }}>
      {/* Заголовок */}
      <InfoBlock 
        title={`Редактирование: ${artist.name}`}
        description="Управление информацией и треками артиста"
        style={{ marginBottom: 16 }}
        useTheme={true}
        styleVariant="default"
        customStyle={false}
        className=""
        titleStyle={{}}
        descriptionStyle={{}}
      >
        {null}
      </InfoBlock>

      <Grid container spacing={2}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Card sx={{ 
            mb: 2,
            background: 'var(--theme-background, rgba(255,255,255,0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--theme-border-radius, 16px)',
            color: 'var(--theme-text-primary, inherit)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Основная информация
                </Typography>
                {!editMode ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                      color: 'var(--theme-text-primary, inherit)',
                      '&:hover': {
                        background: 'var(--theme-background, rgba(255,255,255,0.05))',
                        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
                      }
                    }}
                  >
                    Редактировать
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      variant="contained"
                      size="small"
                      disabled={saving}
                      sx={{
                        background: 'var(--main-accent-color)',
                        '&:hover': {
                          background: 'var(--main-accent-color-hover)'
                        }
                      }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      onClick={() => {
                        setEditMode(false);
                        setEditedArtist(artist);
                      }}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                        color: 'var(--theme-text-primary, inherit)',
                        '&:hover': {
                          background: 'var(--theme-background, rgba(255,255,255,0.05))',
                          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
                        }
                      }}
                    >
                      Отмена
                    </Button>
                  </Box>
                )}
              </Box>

              {editMode ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Имя артиста"
                    value={editedArtist.name || ''}
                    onChange={(e) => setEditedArtist({ ...editedArtist, name: e.target.value })}
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Биография"
                    value={editedArtist.bio || ''}
                    onChange={(e) => setEditedArtist({ ...editedArtist, bio: e.target.value })}
                    multiline
                    rows={4}
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Instagram"
                    value={editedArtist.instagram || ''}
                    onChange={(e) => setEditedArtist({ ...editedArtist, instagram: e.target.value })}
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Twitter"
                    value={editedArtist.twitter || ''}
                    onChange={(e) => setEditedArtist({ ...editedArtist, twitter: e.target.value })}
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Facebook"
                    value={editedArtist.facebook || ''}
                    onChange={(e) => setEditedArtist({ ...editedArtist, facebook: e.target.value })}
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <TextField
                    label="Веб-сайт"
                    value={editedArtist.website || ''}
                    onChange={(e) => setEditedArtist({ ...editedArtist, website: e.target.value })}
                    fullWidth
                    sx={textFieldStyles}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Имя:</strong> {artist.name}
                  </Typography>
                  {artist.bio && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Биография:</strong> {artist.bio}
                    </Typography>
                  )}
                  {artist.instagram && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Instagram:</strong> {artist.instagram}
                    </Typography>
                  )}
                  {artist.twitter && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Twitter:</strong> {artist.twitter}
                    </Typography>
                  )}
                  {artist.facebook && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Facebook:</strong> {artist.facebook}
                    </Typography>
                  )}
                  {artist.website && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Веб-сайт:</strong> {artist.website}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Треки */}
          <Card sx={{
            background: 'var(--theme-background, rgba(255,255,255,0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--theme-border-radius, 16px)',
            color: 'var(--theme-text-primary, inherit)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  Треки ({tracks.length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={openAddTrackDialog}
                  variant="contained"
                  size="small"
                  sx={{
                    background: 'var(--main-accent-color)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 'var(--small-border-radius)',
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      background: 'var(--main-accent-color-hover)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      transform: 'translateY(-1px)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Добавить трек
                </Button>
              </Box>

              {tracks.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6,
                    px: 3,
                    textAlign: 'center'
                  }}
                >
                  <MusicNoteIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Нет треков
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                    У артиста пока нет привязанных треков
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {tracks.map((track) => (
                    <Grid item xs={12} sm={6} md={4} key={track.id}>
                      <Card
                        sx={{
                          background: 'var(--theme-background, rgba(255,255,255,0.03))',
                          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                          borderRadius: 'var(--theme-border-radius, 12px)',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Обложка трека */}
                        <Box
                          sx={{
                            position: 'relative',
                            height: 160,
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, rgba(63,81,181,0.1) 0%, rgba(0,0,0,0.2) 100%)'
                          }}
                        >
                          <Avatar
                            variant="rounded"
                            src={track.cover_path}
                            sx={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 0
                            }}
                          >
                            <MusicNoteIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                          </Avatar>
                        </Box>

                        {/* Информация о треке */}
                        <CardContent sx={{ p: 2 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'var(--theme-text-primary, inherit)'
                            }}
                          >
                            {track.title}
                          </Typography>
                          
                          {track.artist && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem'
                              }}
                            >
                              {track.artist}
                            </Typography>
                          )}

                          {track.album && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                mb: 1.5,
                                opacity: 0.7,
                                fontSize: '0.75rem'
                              }}
                            >
                              {track.album}
                            </Typography>
                          )}

                          {/* Статистика */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 'var(--small-border-radius)',
                                  background: 'var(--theme-background, rgba(255,255,255,0.05))',
                                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
                                }}
                              >
                                <Icon icon="solar:play-outline" width={14} height={14} />
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                  {track.plays_count}
                                </Typography>
                              </Box>
                              
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 'var(--small-border-radius)',
                                  background: 'var(--theme-background, rgba(255,255,255,0.05))',
                                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
                                }}
                              >
                                <Icon icon="solar:heart-outline" width={14} height={14} />
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                  {track.likes_count}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Длительность */}
                            {track.duration && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: '0.7rem',
                                  opacity: 0.7
                                }}
                              >
                                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                              </Typography>
                            )}
                          </Box>

                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Боковая панель */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            mb: 2,
            background: 'var(--theme-background, rgba(255,255,255,0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--theme-border-radius, 16px)',
            color: 'var(--theme-text-primary, inherit)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Avatar 
                  src={artist.avatar_url} 
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{artist.name}</Typography>
                  {artist.verified && <VerifiedIcon sx={{ color: 'var(--main-accent-color)' }} />}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {artist.tracks_count || 0} треков
                </Typography>

              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Диалог удаления */}
      <UniversalModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Удаление артиста"
      >
        <Box sx={{ p: 2 }}>
          <Typography sx={{ mb: 3 }}>
            Вы уверены, что хотите удалить артиста "{artist.name}"? 
            Это действие нельзя отменить.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{
                borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                color: 'var(--theme-text-primary, inherit)',
                '&:hover': {
                  background: 'var(--theme-background, rgba(255,255,255,0.05))',
                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)'
                }
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              disabled={saving}
              sx={{
                background: 'var(--error-color, #f44336)',
                '&:hover': {
                  background: 'var(--error-color-hover, #d32f2f)'
                }
              }}
            >
              {saving ? <CircularProgress size={20} /> : 'Удалить'}
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Модалка добавления трека */}
      <Dialog
        open={addTrackDialogOpen}
        onClose={() => setAddTrackDialogOpen(false)}
        fullWidth
        fullScreen={isMobile}
        maxWidth="md"
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderRadius: { xs: 0, sm: 'var(--main-border-radius)' },
            border: { xs: 'none', sm: '1px solid var(--main-border-color)' },
            height: { xs: '100vh', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '80vh' },
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: 2,
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            background: 'linear-gradient(90deg, rgba(63,81,181,0.2) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: 'var(--avatar-border-radius)',
              background: 'radial-gradient(circle, rgba(63,81,181,0.2) 0%, rgba(63,81,181,0) 70%)',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LibraryMusicIcon
              sx={{ mr: 1.5, fontSize: 28, color: 'primary.light' }}
            />
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary.light">
                Добавление треков к артисту
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                {artist?.name} ({tracks.length} треков)
              </Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'calc(100vh - 140px)', sm: '60vh' },
            overflow: 'auto',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography variant="subtitle1" gutterBottom>
              Треки артиста
            </Typography>

            {tracks.length > 0 ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  bgcolor: 'rgba(0,0,0,0.2)',
                  maxHeight: 250,
                  overflow: 'auto',
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        Альбом
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        Длительность
                      </TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tracks.map(track => (
                      <TableRow key={track.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              variant="rounded"
                              src={track.cover_path}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            >
                              <AudiotrackIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {track.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {track.artist}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          {track.album || '—'}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {track.duration ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}` : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleUnassignTrack(track.id)}
                            startIcon={<DeleteIcon />}
                            sx={{
                              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                              color: 'var(--error-color, #f44336)',
                              fontWeight: 600,
                              textTransform: 'none',
                              borderRadius: 'var(--small-border-radius)',
                              px: 1.5,
                              py: 0.5,
                              minWidth: '80px',
                              '&:hover': {
                                background: 'var(--error-color, #f44336)',
                                color: 'white',
                                borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.25)'
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.15)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--main-border-radius)',
                }}
              >
                <AudiotrackIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">
                  У артиста еще нет привязанных треков
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Добавление треков
            </Typography>

            <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Поиск ваших треков..."
                value={trackSearch}
                onChange={e => setTrackSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    searchTracks();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={searchTracks}
                disabled={loadingAvailableTracks || !trackSearch || trackSearch.trim().length < 2}
                size="small"
              >
                {loadingAvailableTracks ? <CircularProgress size={24} /> : 'Поиск'}
              </Button>
            </Box>

            {availableTracks.length > 0 ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Найдено треков: {availableTracks.length}
                  </Typography>

                  <Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleSelectAllSearchedTracks}
                      disabled={availableTracks.length === 0}
                    >
                      {selectedTracks.length === availableTracks.length
                        ? 'Снять выделение'
                        : 'Выбрать все'}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAssignTracks}
                      disabled={selectedTracks.length === 0}
                      color="success"
                      sx={{ ml: 1 }}
                    >
                      Добавить выбранные ({selectedTracks.length})
                    </Button>
                  </Box>
                </Box>

                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.2)',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={
                              selectedTracks.length === availableTracks.length &&
                              availableTracks.length > 0
                            }
                            indeterminate={
                              selectedTracks.length > 0 &&
                              selectedTracks.length < availableTracks.length
                            }
                            onChange={handleSelectAllSearchedTracks}
                          />
                        </TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          Альбом
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          Длительность
                        </TableCell>
                        <TableCell align="right">Добавить</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {availableTracks.map(track => (
                        <TableRow key={track.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedTracks.includes(track.id)}
                              onChange={() => handleToggleTrackSelection(track.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                variant="rounded"
                                src={track.cover_path}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              >
                                <AudiotrackIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {track.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {track.artist}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            {track.album || '—'}
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            {track.duration
                              ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                              : '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleAssignTrack(track.id)}
                              disabled={loadingAvailableTracks}
                              startIcon={<AddIcon />}
                            >
                              Добавить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : availableTracks.length === 0 && trackSearch && !loadingAvailableTracks ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 3,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--main-border-radius)',
                }}
              >
                <SearchIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">
                  Не найдено треков для привязки
                </Typography>
              </Box>
            ) : null}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Button
            onClick={() => setAddTrackDialogOpen(false)}
            variant="contained"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArtistEditPage;
