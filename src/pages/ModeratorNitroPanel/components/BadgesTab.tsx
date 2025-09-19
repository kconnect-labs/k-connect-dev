import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  EmojiEvents,
  Search,
  Edit,
  Delete,
  Person,
  AttachMoney,
  ShoppingCart,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { ShopBadge } from '../types';

const BadgesTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const { getBadges, updateBadge, deleteBadge, loading, error, clearError } =
    useNitroApi();

  const [badges, setBadges] = useState<ShopBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesLoadingMore, setBadgesLoadingMore] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);
  const [badgesPage, setBadgesPage] = useState(1);
  const [badgesTotal, setBadgesTotal] = useState(0);
  const [badgesHasNext, setBadgesHasNext] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingBadges, setDeletingBadges] = useState<Record<number, boolean>>(
    {}
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<ShopBadge | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    is_active: true,
    upgrade: false,
    color_upgrade: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  const canEditBadges = permissions?.edit_badges || false;
  const canDeleteBadges = permissions?.delete_badges || false;

  const fetchBadges = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setBadgesLoading(true);
      else setBadgesLoadingMore(true);
      setBadgesError(null);

      try {
        const response = await getBadges({
          page,
          per_page: 20,
          search: searchQuery || undefined,
        });

        if (response.badges) {
          setBadgesTotal(response.total);
          setBadgesPage(response.page);
          setBadgesHasNext(response.has_next);

          setBadges(prev => {
            const newBadges = response.badges;
            if (append) {
              const ids = new Set(prev.map((b: ShopBadge) => b.id));
              return [
                ...prev,
                ...newBadges.filter((b: ShopBadge) => !ids.has(b.id)),
              ];
            }
            return newBadges;
          });
        }
      } catch (err) {
        setBadgesError('Ошибка загрузки бейджей');
      } finally {
        setBadgesLoading(false);
        setBadgesLoadingMore(false);
      }
    },
    [getBadges, searchQuery]
  );

  useEffect(() => {
    if (canEditBadges || canDeleteBadges) {
      fetchBadges(1, false);
    }
  }, [fetchBadges, canEditBadges, canDeleteBadges]);

  useEffect(() => {
    if (!badgesHasNext || badgesLoading || badgesLoadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchBadges(badgesPage + 1, true);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [
    badgesHasNext,
    badgesLoading,
    badgesLoadingMore,
    badgesPage,
    fetchBadges,
  ]);

  const handleSearch = () => {
    setBadges([]);
    fetchBadges(1, false);
  };

  const openEditDialog = (badge: ShopBadge) => {
    setSelectedBadge(badge);
    setEditForm({
      name: badge.name,
      description: badge.description || '',
      price: badge.price.toString(),
      is_active: badge.is_active,
      upgrade: Boolean(badge.upgrade),
      color_upgrade: badge.color_upgrade || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditBadge = async () => {
    if (!selectedBadge) return;

    setEditLoading(true);
    try {
      await updateBadge(selectedBadge.id, {
        name: editForm.name,
        description: editForm.description,
        price: parseInt(editForm.price),
        is_active: editForm.is_active,
        upgrade: editForm.upgrade ? 'true' : '',
        color_upgrade: editForm.color_upgrade,
      });

      setBadges(prev =>
        prev.map(badge =>
          badge.id === selectedBadge.id
            ? {
                ...badge,
                name: editForm.name,
                description: editForm.description,
                price: parseInt(editForm.price),
                is_active: editForm.is_active,
                upgrade: editForm.upgrade ? 'true' : '',
                color_upgrade: editForm.color_upgrade,
              }
            : badge
        )
      );

      setEditDialogOpen(false);
      setSelectedBadge(null);
    } catch (err) {
      setBadgesError('Ошибка обновления бейджа');
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (badge: ShopBadge) => {
    setSelectedBadge(badge);
    setDeleteDialogOpen(true);
  };

  const handleDeleteBadge = async () => {
    if (!selectedBadge) return;

    setDeleteLoading(true);
    try {
      await deleteBadge(selectedBadge.id);
      setBadges(prev => prev.filter(badge => badge.id !== selectedBadge.id));
      setDeleteDialogOpen(false);
      setSelectedBadge(null);
    } catch (err) {
      setBadgesError('Ошибка удаления бейджа');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Дата неизвестна';
    }
  };

  if (!canEditBadges && !canDeleteBadges) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity='error' sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant='h6' gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>У вас нет прав на управление бейджами</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity='error' sx={{ mb: 1 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {badgesError && (
        <Alert
          severity='error'
          sx={{ mb: 1 }}
          onClose={() => setBadgesError(null)}
        >
          {badgesError}
        </Alert>
      )}

      {/* Поиск */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          background: 'var(--theme-background)',
          backdropFilter: 'var(--theme-backdrop-filter)',
          border: '1px solid var(--main-border-color)',
          borderRadius: 'var(--main-border-radius)',
          p: 2,
          mb: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder='Поиск по названию бейджа...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          size='small'
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button
          variant='contained'
          onClick={handleSearch}
          startIcon={<Search />}
          size='small'
        >
          Поиск
        </Button>
      </Box>

      {/* Список бейджей */}
      {badgesLoading && badges.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : badges.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 'var(--main-border-radius)',
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
          }}
        >
          <Typography variant='body1' color='text.secondary'>
            Нет бейджей
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1}>
          {badges.map((badge, idx) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <Card
                sx={{
                  background: 'var(--theme-background)',
                  backdropFilter: 'var(--theme-backdrop-filter)',
                  border: '1px solid var(--main-border-color)',
                  borderRadius: 'var(--main-border-radius)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Заголовок с действиями */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                      >
                        {badge.name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={badge.is_active ? 'Активен' : 'Неактивен'}
                          size='small'
                          color={badge.is_active ? 'success' : 'default'}
                          icon={
                            badge.is_active ? <Visibility /> : <VisibilityOff />
                          }
                        />
                        <Typography variant='caption' color='text.secondary'>
                          #{badge.id}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {canEditBadges && (
                        <Tooltip title='Редактировать'>
                          <IconButton
                            size='small'
                            onClick={() => openEditDialog(badge)}
                            sx={{
                              borderRadius: 'var(--main-border-radius)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                              },
                            }}
                          >
                            <Edit fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canDeleteBadges && (
                        <Tooltip title='Удалить'>
                          <IconButton
                            size='small'
                            onClick={() => openDeleteDialog(badge)}
                            disabled={deletingBadges[badge.id]}
                            sx={{
                              borderRadius: 'var(--main-border-radius)',
                              background: 'rgba(244, 67, 54, 0.05)',
                              '&:hover': {
                                background: 'rgba(244, 67, 54, 0.1)',
                              },
                            }}
                          >
                            {deletingBadges[badge.id] ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Delete fontSize='small' />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Изображение бейджа */}
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}
                  >
                    <Avatar
                      src={badge.image_path}
                      sx={{
                        width: 64,
                        height: 64,
                        border: '2px solid var(--main-border-color)',
                      }}
                      variant='rounded'
                    >
                      <EmojiEvents />
                    </Avatar>
                  </Box>

                  {/* Информация о создателе */}
                  {badge.creator && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Avatar
                        src={badge.creator.avatar_url || undefined}
                        sx={{ width: 20, height: 20 }}
                      >
                        {badge.creator.name
                          ? badge.creator.name.charAt(0)
                          : '?'}
                      </Avatar>
                      <Typography variant='caption' color='text.secondary'>
                        {badge.creator.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Статистика */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      alignItems: 'center',
                      mt: 'auto',
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <AttachMoney fontSize='small' color='action' />
                      <Typography variant='caption' color='text.secondary'>
                        {badge.price} монет
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <ShoppingCart fontSize='small' color='action' />
                      <Typography variant='caption' color='text.secondary'>
                        {badge.copies_sold} продано
                      </Typography>
                    </Box>
                  </Box>

                  {/* Дополнительные поля */}
                  {(badge.upgrade || badge.color_upgrade) && (
                    <Box sx={{ mt: 1 }}>
                      {badge.upgrade && (
                        <Chip
                          label='Upgrade'
                          size='small'
                          color='info'
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                      {badge.color_upgrade && (
                        <Chip
                          label={`Color: ${badge.color_upgrade}`}
                          size='small'
                          color='secondary'
                        />
                      )}
                    </Box>
                  )}

                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 1 }}
                  >
                    Создан: {formatDate(badge.created_at)}
                  </Typography>
                </CardContent>
              </Card>

              {idx === badges.length - 1 && badgesHasNext && (
                <div ref={loaderRef} style={{ height: 1 }} />
              )}
            </Grid>
          ))}

          {badgesLoadingMore && (
            <Grid
              item
              xs={12}
              sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
            >
              <CircularProgress size={24} />
            </Grid>
          )}
        </Grid>
      )}

      {/* Диалог редактирования бейджа */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
            borderRadius: 'var(--main-border-radius)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Редактирование бейджа</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label='Название'
              value={editForm.name}
              onChange={e =>
                setEditForm(prev => ({ ...prev, name: e.target.value }))
              }
              size='small'
            />
            <TextField
              fullWidth
              label='Описание'
              value={editForm.description}
              onChange={e =>
                setEditForm(prev => ({ ...prev, description: e.target.value }))
              }
              multiline
              rows={3}
              size='small'
            />
            <TextField
              fullWidth
              label='Цена (монеты)'
              type='number'
              value={editForm.price}
              onChange={e =>
                setEditForm(prev => ({ ...prev, price: e.target.value }))
              }
              size='small'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.upgrade}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      upgrade: e.target.checked,
                    }))
                  }
                />
              }
              label='Upgrade'
            />
            <TextField
              fullWidth
              label='Color Upgrade (hex код)'
              placeholder='#FF0000'
              value={editForm.color_upgrade}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  color_upgrade: e.target.value,
                }))
              }
              size='small'
              inputProps={{
                pattern: '^#[0-9A-Fa-f]{6}$',
                title: 'Введите hex код цвета (например: #FF0000)',
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.is_active}
                  onChange={e =>
                    setEditForm(prev => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                />
              }
              label='Активен'
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setEditDialogOpen(false)} size='small'>
            Отмена
          </Button>
          <Button
            onClick={handleEditBadge}
            variant='contained'
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : <Edit />}
            size='small'
          >
            {editLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления бейджа */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
            borderRadius: 'var(--main-border-radius)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Удаление бейджа</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            Вы уверены, что хотите удалить бейдж "{selectedBadge?.name}"?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Это действие нельзя отменить. Все связанные данные также будут
            удалены.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} size='small'>
            Отмена
          </Button>
          <Button
            onClick={handleDeleteBadge}
            variant='contained'
            color='error'
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? <CircularProgress size={20} /> : <Delete />
            }
            size='small'
          >
            {deleteLoading ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BadgesTab;
