import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
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
  InputAdornment,
} from '@mui/material';
import {
  VerifiedUser,
  PersonSearch,
  CheckCircle,
  Cancel,
  Search,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { User, Verification } from '../types';
import VerificationBadge from '../../../UIKIT/VerificationBadge';

const VerificationTab: React.FC = () => {
  const { verifyUser, searchUsers, loading, error, clearError } = useNitroApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verificationLevel, setVerificationLevel] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const verificationLevels = [
    { value: 0, label: 'Без верификации', color: 'default' },
    { value: 1, label: 'Верифицированный аккаунт', color: 'primary' },
    { value: 2, label: 'Официальный аккаунт', color: 'secondary' },
    { value: 3, label: 'VIP аккаунт', color: 'error' },
    { value: 4, label: 'Модератор', color: 'warning' },
    { value: 5, label: 'Поддержка', color: 'success' },
    { value: 6, label: 'Канал (Верифицированный)', color: 'info' },
    { value: 7, label: 'Канал (Премиум)', color: 'secondary' },
  ];

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

  const handleVerifyUser = async () => {
    if (!selectedUser) return;

    try {
      await verifyUser(selectedUser.id, verificationLevel);
      setDialogOpen(false);
      setSelectedUser(null);
      setVerificationLevel(0);
      // Обновляем список пользователей
      handleSearch();
    } catch (err) {
      console.error('Ошибка верификации:', err);
    }
  };

  const openVerificationDialog = (user: User) => {
    setSelectedUser(user);
    setVerificationLevel(user.verification_level);
    setDialogOpen(true);
  };

  const getVerificationChip = (user: User) => {
    if (user.verification_level === 0) {
      return (
        <Chip
          label="Не верифицирован"
          color="default"
          size="small"
        />
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VerificationBadge status={user.verification_level} size="small" {...({} as any)} />
        <Typography variant="caption" color="text.secondary">
          {verificationLevels.find(l => l.value === user.verification_level)?.label || 'Неизвестный статус'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Поиск пользователей */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', border: '1px solid var(--main-border-color)', borderRadius: 'var(--main-border-radius)', p: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={searchLoading || !searchQuery.trim()}
          startIcon={searchLoading ? <CircularProgress size={20} /> : <PersonSearch />}
        >
        </Button>
      </Box>

      {/* Список пользователей */}
      {users.length > 0 && (
        <List>
              {users.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    background: 'var(--theme-background)',
                    backdropFilter: 'var(--theme-backdrop-filter)',
                    border: '1px solid var(--main-border-color)',
                    borderRadius: 'var(--main-border-radius)',
                    mb: 1,
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
                        <Box sx={{ mt: 1 }}>
                          {getVerificationChip(user)}
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => openVerificationDialog(user)}
                      color="primary"
                    >
                      <VerifiedUser />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
        </List>
      )}

      {/* Диалог верификации */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
            borderRadius: 'var(--main-border-radius)',
          }
        }}
      >
        <DialogTitle>
          Верификация пользователя
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={selectedUser.photo && selectedUser.photo.trim() !== '' ? selectedUser.photo : undefined} alt={selectedUser.name}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedUser.username}
                  </Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Уровень верификации</InputLabel>
                <Select
                  value={verificationLevel}
                  onChange={(e) => setVerificationLevel(Number(e.target.value))}
                  label="Уровень верификации"
                >
                  {verificationLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={level.label}
                          color={level.color as any}
                          size="small"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleVerifyUser}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
          >
            {verificationLevel === 0 ? 'Удалить верификацию' : 'Верифицировать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerificationTab;
