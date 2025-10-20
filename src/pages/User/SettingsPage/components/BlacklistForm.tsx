import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from '@mui/material';
import {
  PersonRemove,
  Search,
  Block,
  PersonAdd,
} from '@mui/icons-material';
import axios from 'axios';

interface BlockedUser {
  id: number;
  name: string;
  username: string;
  photo: string;
  blocked_at: string;
}

interface BlacklistFormProps {
  onClose?: () => void;
}

const BlacklistForm: React.FC<BlacklistFormProps> = ({ onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
  const [unblockLoading, setUnblockLoading] = useState(false);
  const [stats, setStats] = useState<{
    total_blocked: number;
    total_blocked_by: number;
  } | null>(null);

  // Загружаем список заблокированных пользователей
  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get('/api/blacklist/list'),
        axios.get('/api/blacklist/stats')
      ]);

      if (usersResponse.data.success) {
        setBlockedUsers(usersResponse.data.blocked_users || []);
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке черного списка:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  // Разблокировка пользователя
  const handleUnblockUser = async (user: BlockedUser) => {
    try {
      setUnblockLoading(true);
      
      const response = await axios.post('/api/blacklist/remove', {
        user_id: user.id
      });

      if (response.data.success) {
        // Удаляем пользователя из списка
        setBlockedUsers(prev => prev.filter(u => u.id !== user.id));
        
        // Обновляем статистику
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            total_blocked: prev.total_blocked - 1
          } : null);
        }
        
        setUnblockDialogOpen(false);
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error('Ошибка при разблокировке пользователя:', err);
      setError(err.response?.data?.error || 'Ошибка при разблокировке пользователя');
    } finally {
      setUnblockLoading(false);
    }
  };

  // Открытие диалога разблокировки
  const openUnblockDialog = (user: BlockedUser) => {
    setSelectedUser(user);
    setUnblockDialogOpen(true);
  };

  // Закрытие диалога разблокировки
  const closeUnblockDialog = () => {
    setUnblockDialogOpen(false);
    setSelectedUser(null);
  };

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = blockedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ mb: 3, color: 'var(--theme-text-primary)' }}>
        Черный список
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      {stats && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={`Заблокировано: ${stats.total_blocked}`}
            color="error"
            variant="outlined"
          />
          <Chip
            label={`Заблокировали вас: ${stats.total_blocked_by}`}
            color="warning"
            variant="outlined"
          />
        </Box>
      )}

      {/* Поиск */}
      <TextField
        fullWidth
        placeholder="Поиск по имени или юзернейму..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ mb: 2 }} />

      {/* Список заблокированных пользователей */}
      {filteredUsers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Block sx={{ fontSize: 48, color: 'var(--theme-text-secondary)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
            {searchQuery ? 'Пользователи не найдены' : 'Черный список пуст'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
            {searchQuery 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Заблокированные пользователи будут отображаться здесь'
            }
          </Typography>
        </Box>
      ) : (
        <List>
          {filteredUsers.map((user) => (
            <ListItem
              key={user.id}
              sx={{
                borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                borderRadius: 'var(--main-border-radius)',
                mb: 1,
                backgroundColor: 'var(--theme-background-secondary)',
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={user.photo ? `https://s3.k-connect.ru/static/uploads/avatar/${user.id}/${user.photo}` : undefined}
                  sx={{ width: 48, height: 48 }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                    {user.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                      @{user.username}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--theme-text-tertiary)' }}>
                      Заблокирован: {formatDate(user.blocked_at)}
                    </Typography>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => openUnblockDialog(user)}
                  sx={{ color: 'var(--theme-text-secondary)' }}
                  title="Разблокировать"
                >
                  <PersonRemove />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Диалог подтверждения разблокировки */}
      <Dialog
        open={unblockDialogOpen}
        onClose={closeUnblockDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Разблокировать пользователя
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Avatar
                src={selectedUser.photo ? `https://s3.k-connect.ru/static/uploads/avatar/${selectedUser.id}/${selectedUser.photo}` : undefined}
                sx={{ width: 48, height: 48 }}
              >
                {selectedUser.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedUser.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{selectedUser.username}
                </Typography>
              </Box>
            </Box>
          )}
          <Typography sx={{ mt: 2 }}>
            Вы уверены, что хотите разблокировать этого пользователя? 
            После разблокировки вы снова сможете видеть его посты в ленте.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUnblockDialog} disabled={unblockLoading}>
            Отмена
          </Button>
          <Button
            onClick={() => selectedUser && handleUnblockUser(selectedUser)}
            color="error"
            variant="contained"
            disabled={unblockLoading}
            startIcon={unblockLoading ? <CircularProgress size={16} /> : <PersonAdd />}
          >
            {unblockLoading ? 'Разблокировка...' : 'Разблокировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlacklistForm;
