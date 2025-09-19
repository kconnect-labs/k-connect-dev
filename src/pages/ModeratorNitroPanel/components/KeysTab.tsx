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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import { VpnKey, Add, ContentCopy, Delete, Refresh } from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { RedemptionKey } from '../types';

const KeysTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const { generateKeys, loading, error, clearError } = useNitroApi();

  const [keys, setKeys] = useState<RedemptionKey[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysLoadingMore, setKeysLoadingMore] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [keysPage, setKeysPage] = useState(1);
  const [keysTotal, setKeysTotal] = useState(0);
  const [keysHasNext, setKeysHasNext] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [deletingKeys, setDeletingKeys] = useState<Record<number, boolean>>({});

  const [form, setForm] = useState({
    type: 'points' as 'points' | 'mcoin' | 'subscription',
    points: 1000,
    mcoin_amount: 100,
    subscription_type: 'basic',
    subscription_duration_days: 30,
    max_uses: 1,
    count: 1,
    expires_days: 30,
    description: '',
  });

  const loaderRef = useRef<HTMLDivElement>(null);

  // Проверяем права на генерацию ключей
  const canGenerateKeys = permissions?.can_generate_keys || false;

  const fetchKeys = useCallback(async (page = 1, append = false) => {
    if (page === 1) setKeysLoading(true);
    else setKeysLoadingMore(true);
    setKeysError(null);

    try {
      const response = await fetch(
        `/api/moderator/keys?page=${page}&per_page=20`
      );
      const data = await response.json();

      if (data.success) {
        setKeysTotal(data.total);
        setKeysPage(data.page);
        setKeysHasNext(data.has_next);

        setKeys(prev => {
          const newKeys = data.keys || [];
          if (append) {
            const ids = new Set(prev.map((k: RedemptionKey) => k.id));
            return [
              ...prev,
              ...newKeys.filter((k: RedemptionKey) => !ids.has(k.id)),
            ];
          }
          return newKeys;
        });
      } else {
        setKeysError(data.error || 'Ошибка загрузки ключей');
      }
    } catch (err) {
      setKeysError('Ошибка загрузки ключей');
    } finally {
      setKeysLoading(false);
      setKeysLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (canGenerateKeys) {
      fetchKeys(1, false);
    }
  }, [fetchKeys, canGenerateKeys]);

  // Infinite scroll
  useEffect(() => {
    if (!keysHasNext || keysLoading || keysLoadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchKeys(keysPage + 1, true);
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
  }, [keysHasNext, keysLoading, keysLoadingMore, keysPage, fetchKeys]);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = () => {
    setForm({
      type: 'points',
      points: 1000,
      mcoin_amount: 100,
      subscription_type: 'basic',
      subscription_duration_days: 30,
      max_uses: 1,
      count: 1,
      expires_days: 30,
      description: '',
    });
    setGeneratedKeys([]);
    setCreateError(null);
    setCreateSuccess(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setGeneratedKeys([]);
    setCreateError(null);
    setCreateSuccess(null);
  };

  const handleGenerateKeys = async () => {
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const payload = {
        key_type: form.type,
        points_value: form.type === 'points' ? Number(form.points) : undefined,
        mcoin_amount:
          form.type === 'mcoin' ? Number(form.mcoin_amount) : undefined,
        subscription_type:
          form.type === 'subscription' ? form.subscription_type : undefined,
        subscription_duration_days:
          form.type === 'subscription'
            ? Number(form.subscription_duration_days)
            : undefined,
        max_uses: Number(form.max_uses),
        count: Number(form.count),
        expires_days: Number(form.expires_days),
        description: form.description,
      };

      // Удаляем undefined значения
      Object.keys(payload).forEach(
        (k: string) =>
          (payload as any)[k] === undefined && delete (payload as any)[k]
      );

      const response = await fetch('/api/moderator/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (Array.isArray(data.keys)) {
          setGeneratedKeys(data.keys.map((k: any) => k.key || k));
        } else if (data.key && data.key.key) {
          setGeneratedKeys([data.key.key]);
        }
        setCreateSuccess('Ключ(и) успешно созданы!');
        fetchKeys();
      } else {
        setCreateError(data.error || 'Ошибка создания ключа');
      }
    } catch (err) {
      setCreateError('Ошибка создания ключа');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    setDeletingKeys(prev => ({ ...prev, [keyId]: true }));

    try {
      const response = await fetch(`/api/moderator/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchKeys();
      } else {
        const data = await response.json();
        setKeysError(data.error || 'Ошибка удаления ключа');
      }
    } catch (err) {
      setKeysError('Ошибка удаления ключа');
    } finally {
      setDeletingKeys(prev => ({ ...prev, [keyId]: false }));
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      // Можно добавить уведомление
    });
  };

  const getKeyTypeLabel = (type: string) => {
    switch (type) {
      case 'points':
        return 'Баллы';
      case 'mcoin':
        return 'MCoin';
      case 'subscription':
        return 'Подписка';
      default:
        return type;
    }
  };

  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case 'points':
        return 'primary';
      case 'mcoin':
        return 'secondary';
      case 'subscription':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!canGenerateKeys) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity='error' sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant='h6' gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>У вас нет прав на генерацию ключей</Typography>
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

      {keysError && (
        <Alert
          severity='error'
          sx={{ mb: 1 }}
          onClose={() => setKeysError(null)}
        >
          {keysError}
        </Alert>
      )}

      {/* Кнопка создания ключа */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant='subtitle1'>
          Ключи активации ({keysTotal})
        </Typography>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={handleOpenDialog}
          size='small'
        >
          Создать ключ
        </Button>
      </Box>

      {/* Список ключей */}
      {keysLoading && keys.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : keys.length === 0 ? (
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
            Нет созданных ключей
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1}>
          {keys.map((key, idx) => (
            <Grid item xs={12} sm={6} md={4} key={key.id}>
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
                    p: 1.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Ключ */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        flex: 1,
                      }}
                    >
                      {key.key}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyKey(key.key)}
                      sx={{
                        borderRadius: 'var(--main-border-radius)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ContentCopy fontSize='small' />
                    </IconButton>
                  </Box>

                  {/* Информация о ключе */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      mb: 1,
                      flex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Chip
                        label={getKeyTypeLabel(key.key_type)}
                        color={getKeyTypeColor(key.key_type) as any}
                        size='small'
                      />
                    </Box>

                    {key.key_type === 'points' && key.points_value && (
                      <Typography variant='caption' color='text.secondary'>
                        {key.points_value} баллов
                      </Typography>
                    )}

                    {key.key_type === 'mcoin' && key.mcoin_amount && (
                      <Typography variant='caption' color='text.secondary'>
                        {key.mcoin_amount} MCoin
                      </Typography>
                    )}

                    {key.key_type === 'subscription' &&
                      key.subscription_type && (
                        <Typography variant='caption' color='text.secondary'>
                          {key.subscription_type}
                        </Typography>
                      )}

                    <Typography variant='caption' color='text.secondary'>
                      {key.current_uses}/{key.max_uses} использований
                    </Typography>

                    {key.expires_at && (
                      <Typography variant='caption' color='text.secondary'>
                        до {new Date(key.expires_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>

                  {/* Кнопка удаления */}
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={() => handleDeleteKey(key.id)}
                    disabled={deletingKeys[key.id]}
                    startIcon={
                      deletingKeys[key.id] ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Delete />
                      )
                    }
                    sx={{
                      width: '100%',
                      mt: 'auto',
                      borderRadius: 'var(--main-border-radius)',
                      background: 'rgba(244, 67, 54, 0.05)',
                      border: '1px solid rgba(244, 67, 54, 0.2)',
                      color: 'rgba(244, 67, 54, 0.8)',
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 0.1)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                      },
                    }}
                  >
                    {deletingKeys[key.id] ? 'Удаление...' : 'Удалить'}
                  </Button>
                </CardContent>
              </Card>

              {idx === keys.length - 1 && keysHasNext && (
                <div ref={loaderRef} style={{ height: 1 }} />
              )}
            </Grid>
          ))}

          {keysLoadingMore && (
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

      {/* Диалог создания ключа */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth='md'
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
        <DialogTitle sx={{ pb: 1 }}>Создание ключа активации</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            {/* Тип ключа */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Тип ключа</InputLabel>
                <Select
                  value={form.type}
                  label='Тип ключа'
                  onChange={e => handleFormChange('type', e.target.value)}
                >
                  <MenuItem value='points'>Баллы</MenuItem>
                  <MenuItem value='mcoin'>MCoin</MenuItem>
                  <MenuItem value='subscription'>Подписка</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Количество баллов */}
            {form.type === 'points' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Количество баллов'
                  type='number'
                  fullWidth
                  size='small'
                  value={form.points}
                  onChange={e => handleFormChange('points', e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
            )}

            {/* Количество MCoin */}
            {form.type === 'mcoin' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Количество MCoin'
                  type='number'
                  fullWidth
                  size='small'
                  value={form.mcoin_amount}
                  onChange={e =>
                    handleFormChange('mcoin_amount', e.target.value)
                  }
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
            )}

            {/* Тип подписки */}
            {form.type === 'subscription' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Тип подписки</InputLabel>
                    <Select
                      value={form.subscription_type}
                      label='Тип подписки'
                      onChange={e =>
                        handleFormChange('subscription_type', e.target.value)
                      }
                    >
                      <MenuItem value='basic'>Базовая</MenuItem>
                      <MenuItem value='premium'>Премиум</MenuItem>
                      <MenuItem value='ultimate'>Ультимат</MenuItem>
                      <MenuItem value='max'>Макс</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='Срок действия подписки (дней)'
                    type='number'
                    fullWidth
                    size='small'
                    value={form.subscription_duration_days}
                    onChange={e =>
                      handleFormChange(
                        'subscription_duration_days',
                        e.target.value
                      )
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
              </>
            )}

            {/* Максимальное количество использований */}
            <Grid item xs={12} sm={6}>
              <TextField
                label='Максимальное количество использований'
                type='number'
                fullWidth
                size='small'
                value={form.max_uses}
                onChange={e => handleFormChange('max_uses', e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            {/* Количество ключей */}
            <Grid item xs={12} sm={6}>
              <TextField
                label='Количество ключей'
                type='number'
                fullWidth
                size='small'
                value={form.count}
                onChange={e => handleFormChange('count', e.target.value)}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </Grid>

            {/* Срок действия */}
            <Grid item xs={12} sm={6}>
              <TextField
                label='Срок действия (дней)'
                type='number'
                fullWidth
                size='small'
                value={form.expires_days}
                onChange={e => handleFormChange('expires_days', e.target.value)}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            {/* Описание */}
            <Grid item xs={12}>
              <TextField
                label='Описание (необязательно)'
                fullWidth
                size='small'
                multiline
                rows={2}
                value={form.description}
                onChange={e => handleFormChange('description', e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Сообщения об ошибках и успехе */}
          {createError && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {createError}
            </Alert>
          )}

          {createSuccess && (
            <Alert severity='success' sx={{ mt: 2 }}>
              {createSuccess}
            </Alert>
          )}

          {/* Сгенерированные ключи */}
          {generatedKeys.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant='subtitle2'>
                  Сгенерированные ключи:
                </Typography>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<ContentCopy />}
                  onClick={() => {
                    const allKeys = generatedKeys.join('\n');
                    navigator.clipboard.writeText(allKeys);
                  }}
                >
                  Копировать все
                </Button>
              </Box>
              <Paper
                sx={{
                  p: 2,
                  maxHeight: 200,
                  overflow: 'auto',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {generatedKeys.map((key, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant='body2'
                      fontFamily='monospace'
                      sx={{ flex: 1, mr: 1 }}
                    >
                      {key}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={() => handleCopyKey(key)}
                      sx={{
                        borderRadius: 'var(--main-border-radius)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <ContentCopy fontSize='small' />
                    </IconButton>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={handleCloseDialog} size='small'>
            Отмена
          </Button>
          <Button
            onClick={handleGenerateKeys}
            variant='contained'
            disabled={createLoading}
            startIcon={
              createLoading ? <CircularProgress size={20} /> : <VpnKey />
            }
            size='small'
          >
            {createLoading ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeysTab;
