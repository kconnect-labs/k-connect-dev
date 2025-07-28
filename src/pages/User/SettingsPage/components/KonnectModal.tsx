import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  alpha,
  useTheme,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface KonnectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface User {
  id: number;
  username: string;
  name: string;
  photo: string;
  is_connected?: boolean;
}

interface Connection {
  id: number;
  username: string;
  name: string;
  photo: string;
  connection_status: 'pending' | 'received' | 'confirmed';
  confirmed_at?: string;
}

const KonnectModal: React.FC<KonnectModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );
  const [receivedConnection, setReceivedConnection] =
    useState<Connection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<
    'search' | 'pending' | 'connected' | 'received'
  >('search');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuUserId, setMenuUserId] = useState<number | null>(null);

  // Загрузка коннектов при открытии модала
  useEffect(() => {
    if (open) {
      fetchConnections();
    }
  }, [open]);

  // Поиск пользователей
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Загрузка коннектов
  const fetchConnections = async () => {
    try {
      const response = await axios.get('/api/user/connections/list?type=love');
      const data = response.data;
      if (data.success) {
        const connectionsData: Connection[] = data.connections || [];
        setConnections(connectionsData);

        // Находим ожидающий коннект (который мы отправили)
        const pending = connectionsData.find(
          (conn: Connection) => conn.connection_status === 'pending'
        );
        setPendingConnection(pending || null);

        // Находим полученный коннект (который нам отправили)
        const received = connectionsData.find(
          (conn: Connection) => conn.connection_status === 'received'
        );
        setReceivedConnection(received || null);

        // Определяем, какой вид показывать
        if (pending) {
          setView('pending');
        } else if (received) {
          setView('received');
        } else if (
          connectionsData.some(
            (conn: Connection) => conn.connection_status === 'confirmed'
          )
        ) {
          setView('connected');
        } else {
          setView('search');
        }
      }
    } catch (err: any) {
      setError('Ошибка при загрузке коннектов');
    }
  };

  // Поиск пользователей
  const searchUsers = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        `/api/user/connections/search?query=${encodeURIComponent(query)}`
      );
      const data = response.data;
      if (data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      setError('Ошибка при поиске пользователей');
      setSearchResults([]);
    }
  };

  // Добавление коннекта
  const addConnection = async (username: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/user/connections/add', {
        username,
        connection_type: 'love',
      });
      const data = response.data;
      if (data.success) {
        await fetchConnections();
        setSearchQuery('');
        setSearchResults([]);
        onSuccess('Коннект отправлен!');
      } else {
        setError(data.message || 'Ошибка при добавлении коннекта');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при добавлении коннекта');
    } finally {
      setLoading(false);
    }
  };

  // Удаление коннекта
  const removeConnection = async (username: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/user/connections/remove', {
        username,
        connection_type: 'love',
      });
      const data = response.data;
      if (data.success) {
        await fetchConnections();
        onSuccess('Коннект удален');
      } else {
        setError(data.message || 'Ошибка при удалении коннекта');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при удалении коннекта');
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение коннекта
  const acceptConnection = async (username: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/user/connections/accept', {
        username,
        connection_type: 'love',
      });
      const data = response.data;
      if (data.success) {
        await fetchConnections();
        onSuccess('Коннект подтвержден!');
      } else {
        setError(data.message || 'Ошибка при подтверждении коннекта');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Ошибка при подтверждении коннекта'
      );
    } finally {
      setLoading(false);
    }
  };

  // Отклонение коннекта
  const rejectConnection = async (username: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/user/connections/reject', {
        username,
        connection_type: 'love',
      });
      const data = response.data;
      if (data.success) {
        await fetchConnections();
        onSuccess('Коннект отклонен');
      } else {
        setError(data.message || 'Ошибка при отклонении коннекта');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при отклонении коннекта');
    } finally {
      setLoading(false);
    }
  };

  // Функции для меню
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  // Вычисление дней с confirmed_at
  const getDaysSince = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  // Рендер ожидающего коннекта
  const renderPendingView = () => {
    if (!pendingConnection) return null;

    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant='h6' sx={{ mb: 2, color: '#fff' }}>
          Ожидание подтверждения
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Avatar
            src={`/static/uploads/avatar/${pendingConnection.id}/${pendingConnection.photo}`}
            alt={pendingConnection.username}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography sx={{ color: '#fff' }}>
              {pendingConnection.username}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {pendingConnection.name}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
          Ожидаем подтверждения от пользователя
        </Typography>
        <Button
          variant='outlined'
          onClick={() => removeConnection(pendingConnection.username)}
          disabled={loading}
          sx={{
            color: '#e57373',
            borderColor: '#e57373',
            '&:hover': {
              borderColor: '#e57373',
              bgcolor: 'rgba(229, 115, 115, 0.1)',
            },
          }}
        >
          Отменить коннект
        </Button>
      </Box>
    );
  };

  // Рендер полученного коннекта
  const renderReceivedView = () => {
    if (!receivedConnection) return null;

    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant='h6' sx={{ mb: 2, color: '#fff' }}>
          Новый коннект
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Avatar
            src={`/static/uploads/avatar/${receivedConnection.id}/${receivedConnection.photo}`}
            alt={receivedConnection.username}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography sx={{ color: '#fff' }}>
              {receivedConnection.username}
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {receivedConnection.name}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
          Пользователь хочет создать коннект с вами
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant='contained'
            onClick={() => acceptConnection(receivedConnection.username)}
            disabled={loading}
            sx={{
              bgcolor: 'rgba(76, 175, 80, 0.1)',
              color: '#4caf50',
              border: '1px solid #4caf50',
              '&:hover': {
                bgcolor: 'rgba(76, 175, 80, 0.2)',
              },
            }}
          >
            Принять
          </Button>
          <Button
            variant='outlined'
            onClick={() => rejectConnection(receivedConnection.username)}
            disabled={loading}
            sx={{
              color: '#e57373',
              borderColor: '#e57373',
              '&:hover': {
                borderColor: '#e57373',
                bgcolor: 'rgba(229, 115, 115, 0.1)',
              },
            }}
          >
            Отклонить
          </Button>
        </Box>
      </Box>
    );
  };

  // Рендер подключенных коннектов
  const renderConnectedView = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant='h6' sx={{ mb: 2, color: '#fff' }}>
        Ваши коннекты
      </Typography>
      {connections
        .filter((conn: Connection) => conn.connection_status === 'confirmed')
        .map((connection: Connection) => {
          const daysSince = getDaysSince(connection.confirmed_at || '');
          return (
            <Box
              key={connection.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                mb: 1,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={`/static/uploads/avatar/${connection.id}/${connection.photo}`}
                  alt={connection.username}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                    {connection.username}
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {connection.name}
                  </Typography>
                  {daysSince !== null && (
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                      }}
                    >
                      Коннект {daysSince} дней
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton
                onClick={e => handleMenuOpen(e, connection.id)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && menuUserId === connection.id}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={() => {
                    removeConnection(connection.username);
                    handleMenuClose();
                  }}
                  sx={{ color: '#e57373' }}
                >
                  Убрать соединение
                </MenuItem>
              </Menu>
            </Box>
          );
        })}
    </Box>
  );

  // Рендер поиска
  const renderSearchView = () => (
    <>
      <TextField
        fullWidth
        placeholder='Поиск пользователей...'
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            color: '#fff',
            '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
            '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#D0BCFF' },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#D0BCFF',
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.3)',
            },
          },
        }}
      >
        {searchQuery && searchResults.length > 0 && (
          <List>
            {searchResults.map((user: User) => (
              <ListItem
                key={user.id}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={`/static/uploads/avatar/${user.id}/${user.photo}`}
                    alt={user.username}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.username}
                  secondary={user.name}
                  sx={{
                    color: '#fff',
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
                <Button
                  variant='contained'
                  onClick={() => addConnection(user.username)}
                  disabled={loading || user.is_connected}
                  startIcon={user.is_connected ? undefined : <FavoriteIcon />}
                  sx={{
                    color: user.is_connected
                      ? 'rgba(255, 255, 255, 0.7)'
                      : '#D0BCFF',
                    bgcolor: user.is_connected
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {user.is_connected ? 'Подключено' : 'Коннект'}
                </Button>
              </ListItem>
            ))}
          </List>
        )}

        {searchQuery && searchResults.length === 0 && (
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              py: 2,
            }}
          >
            Пользователи не найдены
          </Typography>
        )}
      </Box>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: '100%' },
          maxWidth: { xs: '100%', sm: 550 },
          height: { xs: '100vh', sm: 'auto' },
          minHeight: { xs: '100vh', sm: 400 },
                      bgcolor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                      backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          borderRadius: { xs: 0, sm: '24px' },
          boxShadow: 24,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1300,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))',
          m: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='h6' sx={{ color: 'white', fontWeight: 600 }}>
          Коннектики
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {view === 'pending' && renderPendingView()}
        {view === 'received' && renderReceivedView()}
        {view === 'connected' && renderConnectedView()}
        {view === 'search' && renderSearchView()}
      </DialogContent>

      {error && (
        <Alert
          severity='error'
          onClose={() => setError(null)}
          sx={{
            m: 2,
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            color: '#f44336',
            border: '1px solid rgba(244, 67, 54, 0.3)',
          }}
        >
          {error}
        </Alert>
      )}
    </Dialog>
  );
};

export default KonnectModal;
