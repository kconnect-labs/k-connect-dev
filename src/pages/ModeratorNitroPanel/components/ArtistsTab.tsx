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
  Grid,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Verified as VerifiedIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
  LibraryMusic as LibraryMusicIcon,
  Audiotrack as AudiotrackIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Artist } from '../types';
import UniversalModal from '../../../UIKIT/UniversalModal/UniversalModal';

const ArtistsTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const {
    getArtists,
    createArtist,
    updateArtist,
    deleteArtist,
    getArtistTracks,
    searchTracksForArtist,
    assignTracksToArtist,
    removeTrackFromArtist,
    bindArtistToUser,
    unbindArtistFromUser,
    getUnboundArtists,
    getBoundArtists,
    searchUsers,
  } = useNitroApi();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [artistName, setArtistName] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [artistAvatar, setArtistAvatar] = useState<File | null>(null);
  const [artistAvatarPreview, setArtistAvatarPreview] = useState('');
  const [artistVerified, setArtistVerified] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [manageTracksModalOpen, setManageTracksModalOpen] = useState(false);
  const [artistTracks, setArtistTracks] = useState<any[]>([]);
  const [searchableTracks, setSearchableTracks] = useState<any[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('artist');

  // Состояние для привязки артистов к пользователям
  const [bindModalOpen, setBindModalOpen] = useState(false);
  const [unbindModalOpen, setUnbindModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [bindLoading, setBindLoading] = useState(false);
  const [boundUsers, setBoundUsers] = useState<{ [key: number]: any }>({});

  const canManage = permissions?.manage_artists || false;
  const canDelete = permissions?.delete_artists || false;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchArtists = useCallback(
    async (pageNum: number = 1, reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getArtists(pageNum, searchQuery);

        if (reset) {
          setArtists((response as any).artists || []);
        } else {
          setArtists(prev => [...prev, ...((response as any).artists || [])]);
        }

        setHasMore((response as any).has_next || false);
        setTotal((response as any).total || 0);
        setPage(pageNum);

        // Обновляем информацию о привязанных пользователях из ответа API
        updateBoundUsersFromArtists((response as any).artists || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Ошибка загрузки артистов');
      } finally {
        setLoading(false);
      }
    },
    [getArtists, searchQuery]
  );

  const updateBoundUsersFromArtists = (artistsList: any[]) => {
    const usersMap: { [key: number]: any } = {};

    artistsList.forEach(artist => {
      if (artist.user_id && artist.bound_user) {
        usersMap[artist.user_id] = artist.bound_user;
      }
    });

    setBoundUsers(prev => ({ ...prev, ...usersMap }));
  };

  useEffect(() => {
    if (canManage || canDelete) {
      fetchArtists(1, true);
    }
  }, [fetchArtists, canManage, canDelete]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchArtists(page + 1, false);
    }
  };

  const handleDeleteArtist = async () => {
    if (!selectedArtist) return;

    try {
      setDeleteLoading(true);
      await deleteArtist(selectedArtist.id);

      setArtists(prev =>
        prev.filter(artist => artist.id !== selectedArtist.id)
      );
      setDeleteDialogOpen(false);
      setSelectedArtist(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка удаления артиста');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArtistAvatar(file);

      const reader = new FileReader();
      reader.onload = e => {
        setArtistAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);

      const formData = new FormData();
      formData.append('name', artistName);
      formData.append('bio', artistBio);
      formData.append('verified', artistVerified.toString());

      if (artistAvatar) {
        formData.append('avatar_file', artistAvatar);
      }

      if (selectedArtist) {
        await updateArtist(selectedArtist.id, formData);
      } else {
        await createArtist(formData);
      }

      setEditDialogOpen(false);
      resetForm();
      fetchArtists(1, true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сохранения артиста');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setArtistName('');
    setArtistBio('');
    setArtistAvatar(null);
    setArtistAvatarPreview('');
    setArtistVerified(false);
    setSelectedArtist(null);
  };

  const openEditDialog = (artist?: Artist) => {
    if (artist) {
      setSelectedArtist(artist);
      setArtistName(artist.name);
      setArtistBio(artist.bio || '');
      setArtistAvatar(null);
      setArtistAvatarPreview(artist.avatar_url || '');
      setArtistVerified(artist.verified);
    } else {
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const openManageTracksDialog = async (artist: Artist) => {
    setSelectedArtist(artist);
    setManageTracksModalOpen(true);
    setArtistTracks([]);
    setSearchableTracks([]);
    setSelectedTracks([]);
    setTrackSearch('');

    try {
      setTracksLoading(true);
      const response = (await getArtistTracks(artist.id)) as any;
      if (response.success) {
        setArtistTracks(response.tracks || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки треков артиста');
    } finally {
      setTracksLoading(false);
    }
  };

  const searchTracks = async () => {
    if (!trackSearch || trackSearch.trim().length < 2) return;

    try {
      setTracksLoading(true);
      const response = (await searchTracksForArtist(
        trackSearch.trim(),
        false,
        50
      )) as any;
      if (response.success) {
        setSearchableTracks(response.tracks || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка поиска треков');
    } finally {
      setTracksLoading(false);
    }
  };

  const handleAssignTracks = async () => {
    if (!selectedArtist || selectedTracks.length === 0) return;

    try {
      setTracksLoading(true);
      await assignTracksToArtist(selectedTracks, selectedArtist.id);

      const response = (await getArtistTracks(selectedArtist.id)) as any;
      if (response.success) {
        setArtistTracks(response.tracks || []);
      }

      setSelectedTracks([]);
      setSearchableTracks([]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка назначения треков');
    } finally {
      setTracksLoading(false);
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    if (!selectedArtist) return;

    try {
      setTracksLoading(true);
      await removeTrackFromArtist(trackId, selectedArtist.id);

      const response = (await getArtistTracks(selectedArtist.id)) as any;
      if (response.success) {
        setArtistTracks(response.tracks || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка удаления трека');
    } finally {
      setTracksLoading(false);
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
    if (selectedTracks.length === searchableTracks.length) {
      setSelectedTracks([]);
    } else {
      setSelectedTracks(searchableTracks.map(track => track.id));
    }
  };

  const handleAssignTrackToArtist = async (trackId: number) => {
    if (!selectedArtist) return;

    try {
      setTracksLoading(true);
      await assignTracksToArtist([trackId], selectedArtist.id);

      const response = (await getArtistTracks(selectedArtist.id)) as any;
      if (response.success) {
        setArtistTracks(response.tracks || []);
      }

      setSearchableTracks(prev => prev.filter(track => track.id !== trackId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка назначения трека');
    } finally {
      setTracksLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Дата неизвестна';
    }
  };

  // Функции для привязки артистов к пользователям
  const searchUsersForBinding = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setFoundUsers([]);
      return;
    }

    try {
      setUserSearchLoading(true);
      const users = await searchUsers(query.trim());
      setFoundUsers(users);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка поиска пользователей');
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleBindArtistToUser = async () => {
    if (!selectedArtist || !selectedUser) return;

    try {
      setBindLoading(true);
      await bindArtistToUser(selectedUser.id, selectedArtist.id);

      // Обновляем информацию о привязанном пользователе
      setBoundUsers(prev => ({
        ...prev,
        [selectedUser.id]: selectedUser,
      }));

      setBindModalOpen(false);
      setSelectedUser(null);
      setUserSearchQuery('');
      setFoundUsers([]);
      fetchArtists(1, true); // Обновляем список артистов
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Ошибка привязки артиста к пользователю'
      );
    } finally {
      setBindLoading(false);
    }
  };

  const handleUnbindArtistFromUser = async () => {
    if (!selectedArtist || !selectedArtist.user_id) return;

    try {
      setBindLoading(true);
      await unbindArtistFromUser(selectedArtist.user_id, selectedArtist.id);

      // Удаляем информацию о привязанном пользователе
      setBoundUsers(prev => {
        const newBoundUsers = { ...prev };
        delete newBoundUsers[selectedArtist.user_id!];
        return newBoundUsers;
      });

      setUnbindModalOpen(false);
      fetchArtists(1, true); // Обновляем список артистов
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Ошибка отвязки артиста от пользователя'
      );
    } finally {
      setBindLoading(false);
    }
  };

  const openBindModal = (artist: Artist) => {
    setSelectedArtist(artist);
    setBindModalOpen(true);
    setSelectedUser(null);
    setUserSearchQuery('');
    setFoundUsers([]);
  };

  const openUnbindModal = (artist: Artist) => {
    setSelectedArtist(artist);
    setUnbindModalOpen(true);
  };

  if (!canManage && !canDelete) {
    return (
      <Alert severity='warning' sx={{ mt: 2 }}>
        У вас нет прав на управление артистами
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 0, pb: 5 }}>
      {/* Поиск и кнопка добавления */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          alignItems: 'center',
        }}
      >
        <TextField
          fullWidth
          placeholder='Поиск по артистам...'
          value={searchQuery}
          onChange={e => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => handleSearchChange('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          size='small'
        />

        {canManage && (
          <Button
            variant='contained'
            color='primary'
            startIcon={<AddIcon />}
            onClick={() => openEditDialog()}
            sx={{ minWidth: 'auto' }}
          >
            Добавить
          </Button>
        )}
      </Box>

      {/* Статистика */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          label={`Всего артистов: ${total}`}
          color='primary'
          variant='outlined'
        />
      </Box>

      {/* Список артистов */}
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={1}>
        {artists.map(artist => (
          <Grid item xs={6} sm={4} md={3} lg={3} key={artist.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--main-border-radius)',
                background: 'var(--theme-background)',
                backdropFilter: 'var(--theme-backdrop-filter)',
                border: '1px solid var(--main-border-color)',
              }}
            >
              <CardContent
                sx={{
                  p: 1.5,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                {/* Аватар и имя */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Avatar
                    src={artist.avatar_url}
                    sx={{ width: 50, height: 50, flexShrink: 0 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.875rem',
                        }}
                      >
                        {artist.name}
                      </Typography>
                      {artist.verified && (
                        <VerifiedIcon
                          sx={{
                            color: 'var(--main-accent-color)',
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: '0.75rem' }}
                      >
                        {formatDate(artist.created_at)}
                      </Typography>
                      {artist.user_id && (
                        <Chip
                          label='Привязан'
                          size='small'
                          color='success'
                          variant='outlined'
                          sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Информация о привязанном пользователе */}
                {artist.user_id && boundUsers[artist.user_id] && (
                  <Box
                    sx={{
                      mb: 1.5,
                      p: 1,
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      borderRadius: 1,
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={
                          boundUsers[artist.user_id].avatar_url ||
                          boundUsers[artist.user_id].photo
                        }
                        sx={{ width: 24, height: 24 }}
                      >
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            fontWeight: 600,
                            color: 'success.main',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {boundUsers[artist.user_id].name}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontSize: '0.65rem',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          @{boundUsers[artist.user_id].username}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Биография */}
                {artist.bio && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.8rem',
                      lineHeight: 1.3,
                      flexGrow: 1,
                    }}
                  >
                    {artist.bio}
                  </Typography>
                )}

                {/* Кнопки действий */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    mt: 'auto',
                    flexWrap: 'wrap',
                  }}
                >
                  {canManage && (
                    <>
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<EditIcon />}
                        onClick={() => openEditDialog(artist)}
                        sx={{
                          fontSize: '0.75rem',
                          minWidth: 'auto',
                          px: 1,
                          flex: 1,
                        }}
                      >
                        Ред.
                      </Button>
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<SettingsIcon />}
                        onClick={() => openManageTracksDialog(artist)}
                        sx={{
                          fontSize: '0.75rem',
                          minWidth: 'auto',
                          px: 1,
                          flex: 1,
                        }}
                      >
                        Треки
                      </Button>
                    </>
                  )}

                  {/* Кнопки привязки/отвязки */}
                  {canManage && (
                    <>
                      {artist.user_id ? (
                        <Button
                          size='small'
                          variant='outlined'
                          color='warning'
                          startIcon={<PersonIcon />}
                          onClick={() => openUnbindModal(artist)}
                          sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1,
                            flex: 1,
                          }}
                        >
                          Отвязать
                        </Button>
                      ) : (
                        <Button
                          size='small'
                          variant='outlined'
                          color='success'
                          startIcon={<PersonAddIcon />}
                          onClick={() => openBindModal(artist)}
                          sx={{
                            fontSize: '0.75rem',
                            minWidth: 'auto',
                            px: 1,
                            flex: 1,
                          }}
                        >
                          Привязать
                        </Button>
                      )}
                    </>
                  )}

                  {canDelete && (
                    <Button
                      size='small'
                      variant='contained'
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        setSelectedArtist(artist);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{
                        fontSize: '0.75rem',
                        minWidth: 'auto',
                        px: 1,
                        flex: 1,
                      }}
                    >
                      Удалить
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
            variant='outlined'
            onClick={handleLoadMore}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Загрузить еще
          </Button>
        </Box>
      )}

      {/* Диалог редактирования/создания */}
      <UniversalModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        title={selectedArtist ? 'Редактировать артиста' : 'Добавить артиста'}
        maxWidth='sm'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Аватар */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={
                artistAvatarPreview
                  ? artistAvatarPreview.startsWith('data:')
                    ? artistAvatarPreview
                    : `https://s3.k-connect.ru${artistAvatarPreview}`
                  : undefined
              }
              sx={{ width: 80, height: 80 }}
            >
              <PersonIcon />
            </Avatar>
            <Box>
              <input
                accept='image/*'
                style={{ display: 'none' }}
                id='avatar-upload'
                type='file'
                onChange={handleAvatarChange}
              />
              <label htmlFor='avatar-upload'>
                <Button variant='outlined' component='span' size='small'>
                  Выбрать аватар
                </Button>
              </label>
              {artistAvatarPreview && (
                <Button
                  size='small'
                  color='error'
                  onClick={() => {
                    setArtistAvatar(null);
                    setArtistAvatarPreview('');
                  }}
                  sx={{ ml: 1 }}
                >
                  Удалить
                </Button>
              )}
            </Box>
          </Box>

          {/* Имя */}
          <TextField
            label='Имя артиста'
            value={artistName}
            onChange={e => setArtistName(e.target.value)}
            fullWidth
            required
            size='small'
          />

          {/* Биография */}
          <TextField
            label='Биография'
            value={artistBio}
            onChange={e => setArtistBio(e.target.value)}
            multiline
            rows={4}
            fullWidth
            size='small'
          />

          {/* Верификация */}
          <FormControlLabel
            control={
              <Switch
                checked={artistVerified}
                onChange={e => setArtistVerified(e.target.checked)}
              />
            }
            label='Верифицированный артист'
          />

          {/* Кнопки действий */}
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}
          >
            <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleSubmit}
              variant='contained'
              disabled={formLoading || !artistName.trim()}
              startIcon={formLoading ? <CircularProgress size={20} /> : null}
            >
              {selectedArtist ? 'Сохранить' : 'Создать'}
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Диалог удаления */}
      <UniversalModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title='Удалить артиста'
        maxWidth='sm'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography>
            Вы уверены, что хотите удалить артиста "{selectedArtist?.name}"?
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Это действие нельзя отменить.
          </Typography>

          {/* Кнопки действий */}
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}
          >
            <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
            <Button
              onClick={handleDeleteArtist}
              color='error'
              variant='contained'
              disabled={deleteLoading}
              startIcon={
                deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />
              }
            >
              Удалить
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Модалка управления треками */}
      <Dialog
        open={manageTracksModalOpen}
        onClose={() => setManageTracksModalOpen(false)}
        fullWidth
        fullScreen={isMobile}
        maxWidth='md'
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderRadius: { xs: 0, sm: 'var(--main-border-radius)' },
            border: { xs: 'none', sm: '1px solid var(--main-border-color)' },
            height: { xs: '100vh', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '80vh' },
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: 2,
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            background:
              'linear-gradient(90deg, rgba(63,81,181,0.2) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(63,81,181,0.2) 0%, rgba(63,81,181,0) 70%)',
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
              <Typography variant='h6' fontWeight='bold' color='primary.light'>
                Управление треками артиста
              </Typography>
              {selectedArtist && (
                <Typography variant='body2' color='rgba(255,255,255,0.7)'>
                  {selectedArtist.name} ({artistTracks.length} треков)
                </Typography>
              )}
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
            <Typography variant='subtitle1' gutterBottom>
              Треки артиста
            </Typography>

            {artistTracks.length > 0 ? (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  bgcolor: 'rgba(0,0,0,0.2)',
                  maxHeight: 250,
                  overflow: 'auto',
                }}
              >
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        Альбом
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: 'none', md: 'table-cell' } }}
                      >
                        Длительность
                      </TableCell>
                      <TableCell align='right'>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {artistTracks.map(track => (
                      <TableRow key={track.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              variant='rounded'
                              src={track.cover_path}
                              sx={{ width: 32, height: 32, mr: 1 }}
                            >
                              <AudiotrackIcon />
                            </Avatar>
                            <Box>
                              <Typography
                                variant='body2'
                                sx={{ fontWeight: 'medium' }}
                              >
                                {track.title}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {track.artist}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          {track.album || '—'}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {track.duration
                            ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                            : '—'}
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            color='error'
                            size='small'
                            onClick={() => handleRemoveTrack(track.id)}
                            disabled={tracksLoading}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
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
                <AudiotrackIcon
                  sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                />
                <Typography color='text.secondary'>
                  У артиста еще нет привязанных треков
                </Typography>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2, flexGrow: 1 }}>
            <Typography variant='subtitle1' gutterBottom>
              Добавление треков
            </Typography>

            <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id='search-mode-label'>Искать по</InputLabel>
                <Select
                  labelId='search-mode-label'
                  value={searchMode}
                  onChange={e => setSearchMode(e.target.value)}
                  size='small'
                  sx={{ minWidth: 130 }}
                >
                  <MenuItem value='artist'>Имени артиста</MenuItem>
                  <MenuItem value='title'>Названию трека</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size='small'
                placeholder='Поиск треков...'
                value={trackSearch}
                onChange={e => setTrackSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
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
                variant='contained'
                onClick={searchTracks}
                disabled={
                  tracksLoading || !trackSearch || trackSearch.trim().length < 2
                }
                size='small'
              >
                {tracksLoading ? <CircularProgress size={24} /> : 'Поиск'}
              </Button>
            </Box>

            {searchableTracks.length > 0 ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    Найдено треков: {searchableTracks.length}
                  </Typography>

                  <Box>
                    <Button
                      size='small'
                      variant='outlined'
                      onClick={handleSelectAllSearchedTracks}
                      disabled={searchableTracks.length === 0}
                    >
                      {selectedTracks.length === searchableTracks.length
                        ? 'Снять выделение'
                        : 'Выбрать все'}
                    </Button>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<AddIcon />}
                      onClick={handleAssignTracks}
                      disabled={selectedTracks.length === 0}
                      color='success'
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
                  <Table size='small' stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding='checkbox'>
                          <Checkbox
                            checked={
                              selectedTracks.length ===
                                searchableTracks.length &&
                              searchableTracks.length > 0
                            }
                            indeterminate={
                              selectedTracks.length > 0 &&
                              selectedTracks.length < searchableTracks.length
                            }
                            onChange={handleSelectAllSearchedTracks}
                          />
                        </TableCell>
                        <TableCell>Название</TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          Альбом
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          Длительность
                        </TableCell>
                        <TableCell align='right'>Добавить</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchableTracks.map(track => (
                        <TableRow key={track.id}>
                          <TableCell padding='checkbox'>
                            <Checkbox
                              checked={selectedTracks.includes(track.id)}
                              onChange={() =>
                                handleToggleTrackSelection(track.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                variant='rounded'
                                src={track.cover_path}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              >
                                <AudiotrackIcon />
                              </Avatar>
                              <Box>
                                <Typography
                                  variant='body2'
                                  sx={{ fontWeight: 'medium' }}
                                >
                                  {track.title}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {track.artist}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                          >
                            {track.album || '—'}
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: 'none', md: 'table-cell' } }}
                          >
                            {track.duration
                              ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                              : '—'}
                          </TableCell>
                          <TableCell align='right'>
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() =>
                                handleAssignTrackToArtist(track.id)
                              }
                              disabled={tracksLoading}
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
            ) : searchableTracks.length === 0 &&
              trackSearch &&
              !tracksLoading ? (
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
                <SearchIcon
                  sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                />
                <Typography color='text.secondary'>
                  Не найдено треков для привязки
                </Typography>
              </Box>
            ) : null}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Button
            onClick={() => setManageTracksModalOpen(false)}
            variant='contained'
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Модальное окно привязки артиста к пользователю */}
      <UniversalModal
        open={bindModalOpen}
        onClose={() => setBindModalOpen(false)}
        title='Привязать артиста к пользователю'
        maxWidth='md'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant='body1'>
            Привязка артиста "{selectedArtist?.name}" к пользователю
          </Typography>

          {/* Поиск пользователя */}
          <TextField
            label='Поиск пользователя'
            placeholder='Введите имя пользователя или username...'
            value={userSearchQuery}
            onChange={e => {
              setUserSearchQuery(e.target.value);
              searchUsersForBinding(e.target.value);
            }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Список найденных пользователей */}
          {foundUsers.length > 0 && (
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Найденные пользователи:
              </Typography>
              <List>
                {foundUsers.map(user => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton
                      selected={selectedUser?.id === user.id}
                      onClick={() => setSelectedUser(user)}
                    >
                      <ListItemIcon>
                        <Avatar
                          src={user.avatar_url}
                          sx={{ width: 32, height: 32 }}
                        >
                          <PersonIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={user.name}
                        secondary={`@${user.username} (ID: ${user.id})`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {userSearchLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {selectedUser && (
            <Alert severity='info'>
              Выбран пользователь: <strong>{selectedUser.name}</strong> (@
              {selectedUser.username})
            </Alert>
          )}

          {/* Кнопки действий */}
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}
          >
            <Button onClick={() => setBindModalOpen(false)}>Отмена</Button>
            <Button
              onClick={handleBindArtistToUser}
              variant='contained'
              color='success'
              disabled={bindLoading || !selectedUser}
              startIcon={
                bindLoading ? <CircularProgress size={20} /> : <PersonAddIcon />
              }
            >
              Привязать
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Модальное окно отвязки артиста от пользователя */}
      <UniversalModal
        open={unbindModalOpen}
        onClose={() => setUnbindModalOpen(false)}
        title='Отвязать артиста от пользователя'
        maxWidth='sm'
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography>
            Вы уверены, что хотите отвязать артиста "{selectedArtist?.name}" от
            пользователя?
          </Typography>

          {/* Информация о привязанном пользователе */}
          {selectedArtist?.user_id && boundUsers[selectedArtist.user_id] && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                borderRadius: 1,
                border: '1px solid rgba(255, 152, 0, 0.3)',
              }}
            >
              <Typography variant='subtitle2' gutterBottom color='warning.main'>
                Привязанный пользователь:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={
                    boundUsers[selectedArtist.user_id].avatar_url ||
                    boundUsers[selectedArtist.user_id].photo
                  }
                  sx={{ width: 40, height: 40 }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant='body1' sx={{ fontWeight: 600 }}>
                    {boundUsers[selectedArtist.user_id].name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    @{boundUsers[selectedArtist.user_id].username} (ID:{' '}
                    {selectedArtist.user_id})
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Typography variant='body2' color='text.secondary'>
            При отвязке все треки артиста будут отвязаны от него, а тип аккаунта
            пользователя изменится на "user".
          </Typography>

          {/* Кнопки действий */}
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}
          >
            <Button onClick={() => setUnbindModalOpen(false)}>Отмена</Button>
            <Button
              onClick={handleUnbindArtistFromUser}
              color='warning'
              variant='contained'
              disabled={bindLoading}
              startIcon={
                bindLoading ? <CircularProgress size={20} /> : <PersonIcon />
              }
            >
              Отвязать
            </Button>
          </Box>
        </Box>
      </UniversalModal>
    </Box>
  );
};

export default ArtistsTab;
