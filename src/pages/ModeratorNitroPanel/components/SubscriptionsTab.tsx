import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  CardMembership,
  PersonSearch,
  Add,
  Delete,
  Search,
  Star,
  Diamond,
  WorkspacePremium,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { User, Subscription, SubscriptionType } from '../types';
import VerificationBadge from '../../../UIKIT/VerificationBadge';

const SubscriptionsTab: React.FC = () => {
  const { 
    getUserSubscriptions, 
    giveSubscription, 
    deleteSubscription, 
    getSubscriptionTypes,
    searchUsers,
    loading, 
    error, 
    clearError 
  } = useNitroApi();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [availableSubscriptionTypes, setAvailableSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [selectedSubscriptionType, setSelectedSubscriptionType] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionTypes();
  }, []);

  const loadSubscriptionTypes = async () => {
    try {
      const response = await getSubscriptionTypes();
      setAvailableSubscriptionTypes(response.subscription_types);
    } catch (err) {
      console.error('Ошибка загрузки типов подписок:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const foundUsers = await searchUsers(searchQuery);
      setUsers(foundUsers);
    } catch (err) {
      console.error('Ошибка поиска пользователей:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewUserSubscriptions = async (user: User) => {
    setSelectedUser(user);
    try {
      const response = await getUserSubscriptions(user.id);
      setUserSubscriptions(response.subscriptions);
      setDialogOpen(true);
    } catch (err) {
      console.error('Ошибка загрузки подписок пользователя:', err);
    }
  };

  const handleGiveSubscription = async () => {
    if (!selectedUser || !selectedSubscriptionType) return;

    try {
      await giveSubscription(selectedUser.id, selectedSubscriptionType);
      // Обновляем список подписок пользователя
      const response = await getUserSubscriptions(selectedUser.id);
      setUserSubscriptions(response.subscriptions);
      setSelectedSubscriptionType('');
    } catch (err) {
      console.error('Ошибка выдачи подписки:', err);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: number) => {
    try {
      await deleteSubscription(subscriptionId);
      // Обновляем список подписок пользователя
      if (selectedUser) {
        const response = await getUserSubscriptions(selectedUser.id);
        setUserSubscriptions(response.subscriptions);
      }
    } catch (err) {
      console.error('Ошибка удаления подписки:', err);
    }
  };

  const getSubscriptionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'basic':
        return <CardMembership color="primary" />;
      case 'premium':
        return <Star color="secondary" />;
      case 'ultimate':
        return <Diamond color="warning" />;
      case 'max':
        return <WorkspacePremium color="error" />;
      default:
        return <CardMembership />;
    }
  };

  const getSubscriptionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'basic':
        return 'primary';
      case 'premium':
        return 'secondary';
      case 'ultimate':
        return 'warning';
      case 'max':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSubscriptionTypeInfo = (type: string) => {
    return availableSubscriptionTypes.find(st => st.id === type);
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Статистика подписок */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CardMembership sx={{ fontSize: 24, color: 'primary.main', mb: 0.5 }} />
              <Typography variant="body2">Базовая</Typography>
              <Typography variant="h6" color="primary">
                {availableSubscriptionTypes.find(st => st.id === 'basic')?.users_count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Star sx={{ fontSize: 24, color: 'secondary.main', mb: 0.5 }} />
              <Typography variant="body2">Премиум</Typography>
              <Typography variant="h6" color="secondary">
                {availableSubscriptionTypes.find(st => st.id === 'premium')?.users_count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Diamond sx={{ fontSize: 24, color: 'warning.main', mb: 0.5 }} />
              <Typography variant="body2">Ультимейт</Typography>
              <Typography variant="h6" color="warning.main">
                {availableSubscriptionTypes.find(st => st.id === 'ultimate')?.users_count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <WorkspacePremium sx={{ fontSize: 24, color: 'error.main', mb: 0.5 }} />
              <Typography variant="body2">MAX</Typography>
              <Typography variant="h6" color="error.main">
                {availableSubscriptionTypes.find(st => st.id === 'max')?.users_count || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Поиск пользователей */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)', p: 2, mb: 1 }}>
        <TextField
          fullWidth
          placeholder="Поиск по имени или username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={searchLoading || !searchQuery.trim()}
          startIcon={searchLoading ? <CircularProgress size={20} /> : <PersonSearch />}
          size="small"
        >
          Поиск
        </Button>
      </Box>

      {/* Список пользователей */}
      {users.length > 0 && (
        <List sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)', p: 1 }}>
              {users.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                    borderRadius: 'var(--main-border-radius)',
                    mb: 1,
                    background: 'var(--theme-background)',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.avatar_url || undefined} alt={user.name}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          @{user.username}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          {user.verification_level > 0 ? (
                            <VerificationBadge status={user.verification_level} size="small" {...({} as any)} />
                          ) : (
                            <Chip
                              label="Не верифицирован"
                              color="default"
                              size="small"
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {user.followers_count} подписчиков
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Просмотреть подписки">
                      <IconButton
                        edge="end"
                        onClick={() => handleViewUserSubscriptions(user)}
                        color="primary"
                      >
                        <CardMembership />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
        </List>
      )}

      {/* Диалог управления подписками */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--main-border-radius)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Подписки пользователя
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          {selectedUser && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar src={selectedUser.avatar_url || undefined} alt={selectedUser.name}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="medium">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedUser.username}
                  </Typography>
                </Box>
              </Box>

              {/* Выдача новой подписки */}
              <Box sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', borderRadius: 'var(--main-border-radius)', p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl fullWidth>
                      <InputLabel>Тип подписки</InputLabel>
                      <Select
                        value={selectedSubscriptionType}
                        onChange={(e) => setSelectedSubscriptionType(e.target.value)}
                        label="Тип подписки"
                      >
                        {availableSubscriptionTypes.map((subscriptionType) => (
                          <MenuItem key={subscriptionType.id} value={subscriptionType.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getSubscriptionIcon(subscriptionType.id)}
                              <Box>
                                <Typography variant="body2">{subscriptionType.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {subscriptionType.duration_days} дней
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      onClick={handleGiveSubscription}
                      disabled={loading || !selectedSubscriptionType}
                      startIcon={loading ? <CircularProgress size={20} /> : <Add />}
                    >
                      Выдать
                    </Button>
                  </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Список подписок пользователя */}
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                Текущие подписки ({userSubscriptions.length})
              </Typography>
              {userSubscriptions.length > 0 ? (
                <List>
                  {userSubscriptions.map((subscription) => {
                    const typeInfo = getSubscriptionTypeInfo(subscription.subscription_type);
                    return (
                      <ListItem
                        key={subscription.id}
                        sx={{
                          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                          borderRadius: 'var(--main-border-radius)',
                          mb: 1,
                          background: 'var(--theme-background)',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${getSubscriptionColor(subscription.subscription_type)}.main` }}>
                            {getSubscriptionIcon(subscription.subscription_type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {typeInfo?.name || subscription.subscription_type}
                              </Typography>
                              <Chip
                                label={subscription.subscription_type}
                                color={getSubscriptionColor(subscription.subscription_type) as any}
                                size="small"
                              />
                              <Chip
                                label={subscription.is_active ? 'Активна' : 'Просрочена'}
                                color={subscription.is_active ? 'success' : 'error'}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Выдана: {new Date(subscription.subscription_date).toLocaleDateString()}
                              </Typography>
                              {subscription.expiration_date && (
                                <Typography variant="body2" color="text.secondary">
                                  Истекает: {new Date(subscription.expiration_date).toLocaleDateString()}
                                </Typography>
                              )}
                              {typeInfo?.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {typeInfo.description}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Удалить подписку">
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteSubscription(subscription.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Alert severity="info">
                  У пользователя пока нет подписок
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionsTab;
