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
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings,
  PersonSearch,
  Add,
  Edit,
  Search,
  Security,
  Delete,
  Block,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { User, ModeratorPermission } from '../types';
import VerificationBadge from '../../../UIKIT/VerificationBadge';

const ModeratorsTab: React.FC = () => {
  const { assignModerator, getModerators, searchUsers, loading, error, clearError } = useNitroApi();
  const { currentUser, hasAdminAccess } = useCurrentUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [moderators, setModerators] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<ModeratorPermission>({
    user_id: 0,
    delete_posts: false,
    delete_music: false,
    delete_comments: false,
    delete_avatar: false,
    change_user_name: false,
    change_username: false,
    manage_bug_reports: false,
    delete_bug_reports: false,
    edit_badges: false,
    delete_badges: false,
    manage_artists: false,
    delete_artists: false,
    can_generate_keys: false,
    verify_users: false,
    assign_moderators: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    loadModerators();
  }, []);

  const loadModerators = async () => {
    try {
      const response = await getModerators();
      setModerators(response.moderators);
    } catch (err) {
      console.error('Ошибка загрузки модераторов:', err);
    }
  };

  // Проверяем доступ только для пользователя ID 3
  if (!hasAdminAccess(3)) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>
            Управление модераторами доступно только главному администратору
          </Typography>
        </Alert>
      </Box>
    );
  }

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

  const handleAssignModerator = async () => {
    if (!selectedUser) return;

    try {
      await assignModerator(selectedUser.id, permissions);
      setDialogOpen(false);
      setSelectedUser(null);
      // Сбрасываем права
      setPermissions({
        user_id: 0,
        delete_posts: false,
        delete_music: false,
        delete_comments: false,
        delete_avatar: false,
        change_user_name: false,
        change_username: false,
        manage_bug_reports: false,
        delete_bug_reports: false,
        edit_badges: false,
        delete_badges: false,
        manage_artists: false,
        delete_artists: false,
        can_generate_keys: false,
        verify_users: false,
        assign_moderators: false,
      });
      // Обновляем список модераторов и пользователей
      loadModerators();
      handleSearch();
    } catch (err) {
      console.error('Ошибка назначения модератора:', err);
    }
  };

  const openModeratorDialog = (user: User) => {
    setSelectedUser(user);
    
    // Если это существующий модератор, загружаем его текущие права
    const existingModerator = moderators.find(mod => mod.id === user.id);
    if (existingModerator) {
      setPermissions({
        user_id: user.id,
        delete_posts: existingModerator.permissions.delete_posts || false,
        delete_music: existingModerator.permissions.delete_music || false,
        delete_comments: existingModerator.permissions.delete_comments || false,
        delete_avatar: existingModerator.permissions.delete_avatar || false,
        change_user_name: existingModerator.permissions.change_user_name || false,
        change_username: existingModerator.permissions.change_username || false,
        manage_bug_reports: existingModerator.permissions.manage_bug_reports || false,
        delete_bug_reports: existingModerator.permissions.delete_bug_reports || false,
        edit_badges: existingModerator.permissions.edit_badges || false,
        delete_badges: existingModerator.permissions.delete_badges || false,
        manage_artists: existingModerator.permissions.manage_artists || false,
        delete_artists: existingModerator.permissions.delete_artists || false,
        can_generate_keys: existingModerator.permissions.can_generate_keys || false,
        verify_users: existingModerator.permissions.verify_users || false,
        assign_moderators: existingModerator.permissions.assign_moderators || false,
      });
    } else {
      // Если это новый пользователь, сбрасываем права
      setPermissions({
        user_id: user.id,
        delete_posts: false,
        delete_music: false,
        delete_comments: false,
        delete_avatar: false,
        change_user_name: false,
        change_username: false,
        manage_bug_reports: false,
        delete_bug_reports: false,
        edit_badges: false,
        delete_badges: false,
        manage_artists: false,
        delete_artists: false,
        can_generate_keys: false,
        verify_users: false,
        assign_moderators: false,
      });
    }
    
    setDialogOpen(true);
  };

  const handlePermissionChange = (permission: keyof ModeratorPermission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const permissionGroups = [
    {
      title: 'Управление контентом',
      permissions: [
        { key: 'delete_posts', label: 'Удаление постов', icon: <Delete /> },
        { key: 'delete_music', label: 'Удаление музыки', icon: <Delete /> },
        { key: 'delete_comments', label: 'Удаление комментариев', icon: <Delete /> },
        { key: 'delete_avatar', label: 'Удаление аватаров', icon: <Delete /> },
      ]
    },
    {
      title: 'Управление пользователями',
      permissions: [
        { key: 'change_user_name', label: 'Изменение имени пользователя', icon: <Edit /> },
        { key: 'change_username', label: 'Изменение username', icon: <Edit /> },
        { key: 'verify_users', label: 'Верификация пользователей', icon: <Security /> },
        { key: 'assign_moderators', label: 'Назначение модераторов', icon: <AdminPanelSettings /> },
      ]
    },
    {
      title: 'Управление системой',
      permissions: [
        { key: 'manage_bug_reports', label: 'Управление баг-репортами', icon: <Security /> },
        { key: 'delete_bug_reports', label: 'Удаление баг-репортов', icon: <Delete /> },
        { key: 'edit_badges', label: 'Редактирование бейджей', icon: <Edit /> },
        { key: 'delete_badges', label: 'Удаление бейджей', icon: <Delete /> },
        { key: 'manage_artists', label: 'Управление артистами', icon: <AdminPanelSettings /> },
        { key: 'delete_artists', label: 'Удаление артистов', icon: <Delete /> },
        { key: 'can_generate_keys', label: 'Генерация ключей', icon: <Security /> },
      ]
    }
  ];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Поиск пользователей */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', border: '1px solid var(--main-border-color)', borderRadius: 'var(--main-border-radius)', p: 2, mb: 1 }}>
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
        <List sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', border: '1px solid var(--main-border-color)', borderRadius: 'var(--main-border-radius)', p: 1 }}>
          {users.map((user) => (
            <ListItem
              key={user.id}
              sx={{
                border: '1px solid var(--main-border-color)',
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
                <Tooltip title="Назначить модератором">
                  <IconButton
                    edge="end"
                    onClick={() => openModeratorDialog(user)}
                    color="primary"
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Список модераторов */}
      {moderators.length > 0 && (
        <List sx={{ background: 'var(--theme-background)', backdropFilter: 'var(--theme-backdrop-filter)', border: '1px solid var(--main-border-color)', borderRadius: 'var(--main-border-radius)', p: 1, mb: 1 }}>
          {moderators.map((moderator) => (
            <ListItem
              key={moderator.id}
              sx={{
                border: '1px solid var(--main-border-color)',
                borderRadius: 'var(--main-border-radius)',
                mb: 1,
                background: 'var(--theme-background)',
              }}
            >
              <ListItemAvatar>
                <Avatar src={moderator.avatar_url || undefined} alt={moderator.name}>
                  {moderator.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={moderator.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      @{moderator.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      {moderator.status > 0 && (
                        <VerificationBadge status={moderator.status} size="small" {...({} as any)} />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {Object.values(moderator.permissions).filter(Boolean).length} прав
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="Просмотреть права">
                  <IconButton
                    edge="end"
                    onClick={() => openModeratorDialog(moderator)}
                    color="primary"
                  >
                    <Security />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Диалог назначения модератора */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
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
        <DialogTitle sx={{ pb: 1 }}>
          Назначение модератора
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectedUser && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={selectedUser.avatar_url || undefined} alt={selectedUser.name}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedUser.username}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Права модератора
              </Typography>

              {permissionGroups.map((group, groupIndex) => (
                <Box key={groupIndex}>
                  <Typography variant="body2" sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }}>
                    {group.title}
                  </Typography>
                  <Grid container spacing={0.5}>
                    {group.permissions.map((permission) => (
                      <Grid item xs={12} sm={6} key={permission.key}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={permissions[permission.key as keyof ModeratorPermission] as boolean}
                              onChange={() => handlePermissionChange(permission.key as keyof ModeratorPermission)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {permission.icon}
                              <Typography variant="caption">
                                {permission.label}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {groupIndex < permissionGroups.length - 1 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setDialogOpen(false)} size="small">
            Отмена
          </Button>
          <Button
            onClick={handleAssignModerator}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
            size="small"
          >
            Назначить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModeratorsTab;
