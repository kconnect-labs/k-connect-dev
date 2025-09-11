import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  Alert,
  CircularProgress,
  InputAdornment,
  Grid,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Warning as WarningIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { User, Warning, Ban } from '../types';
import UniversalModal from '../../../UIKIT/UniversalModal/UniversalModal';
import VerificationBadgeComponent from '../../../UIKIT/VerificationBadge';

// Типизированная версия компонента
const VerificationBadge = VerificationBadgeComponent as any;

const UsersTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const {
    getUsers,
    updateUserInfo,
    deleteUserAvatar,
    getUserWarnings,
    issueWarning,
    removeWarning,
    getUserBans,
    banUser,
    unbanUser,
    loading,
    error,
    clearError,
  } = useNitroApi();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [warningsModalOpen, setWarningsModalOpen] = useState(false);
  const [bansModalOpen, setBansModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [deleteAvatarModalOpen, setDeleteAvatarModalOpen] = useState(false);

  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userWarnings, setUserWarnings] = useState<Warning[]>([]);
  const [userBans, setUserBans] = useState<Ban[]>([]);

  
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
  });
  const [warningForm, setWarningForm] = useState({
    reason: '',
    details: '',
  });
  const [banForm, setBanForm] = useState({
    reason: '',
    details: '',
    duration_days: 1,
  });

  const canManage = permissions?.change_user_name || permissions?.change_username || false;
  const canDeleteAvatar = permissions?.delete_avatar || false;
  const canIssueWarning = permissions?.issue_warning || false;
  const canBan = permissions?.ban_user || false;

  const fetchUsers = useCallback(async (pageNum: number = 1, reset: boolean = true, searchQuery?: string) => {
    try {
      console.log('fetchUsers вызвана:', { pageNum, reset, searchQuery, search });
      if (reset) {
        setUsersLoading(true);
      } else {
        setLoadingMore(true);
      }
      setUsersError(null);

      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: '20',
        ...(searchQuery && { search: searchQuery }),
      });
      
      const response = await axios.get(`/api/moderator/users?${params}`);
      console.log('Ответ API:', response.data);
      
      if (response.data.success) {
        const newUsers = response.data.users || [];
        if (reset) {
          setUsers(newUsers);
        } else {
          setUsers(prev => [...prev, ...newUsers]);
        }
        setHasMore(response.data.has_next || false);
        setPage(pageNum);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки пользователей:', err);
      setUsersError(err.response?.data?.error || 'Ошибка загрузки пользователей');
    } finally {
      setUsersLoading(false);
      setLoadingMore(false);
    }
  }, [search]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1, false);
    }
  };

  const handleSearch = () => {
    console.log('Поиск пользователей:', search);
    setPage(1);
    setHasMore(true);
    fetchUsers(1, true, search);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      username: user.username,
    });
    setEditUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData: any = {};
      if (permissions?.change_user_name && editForm.name !== selectedUser.name) {
        updateData.name = editForm.name;
      }
      if (permissions?.change_username && editForm.username !== selectedUser.username) {
        updateData.username = editForm.username;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUserInfo(selectedUser.id, updateData);
        
        
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...updateData }
            : user
        ));
        
        setEditUserModalOpen(false);
      }
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Ошибка обновления пользователя');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!canDeleteAvatar || !selectedUser) return;

    try {
      await deleteUserAvatar(selectedUser.id);
      
      // Обновляем локальное состояние
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...u, avatar_url: undefined }
          : u
      ));
      
      setDeleteAvatarModalOpen(false);
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Ошибка удаления аватара');
    }
  };

  const handleViewWarnings = async (user: User) => {
    console.log('Opening warnings modal for user:', user);
    setSelectedUser(user);
    try {
      const response = await axios.get(`/api/user/${user.id}/warnings`);
      if (response.data.success) {
        setUserWarnings(response.data.warnings || []);
        setWarningsModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error loading warnings:', err);
      setUsersError(err.response?.data?.error || 'Ошибка загрузки предупреждений');
    }
  };

  const handleViewBans = async (user: User) => {
    console.log('Opening bans modal for user:', user);
    setSelectedUser(user);
    try {
      const response = await axios.get(`/api/user/${user.id}/bans`);
      if (response.data.success) {
        setUserBans(response.data.bans || []);
        setBansModalOpen(true);
      }
    } catch (err: any) {
      console.error('Error loading bans:', err);
      setUsersError(err.response?.data?.error || 'Ошибка загрузки банов');
    }
  };

  const handleIssueWarning = async () => {
    if (!selectedUser || !warningForm.reason.trim()) return;

    try {
      await issueWarning(selectedUser.id, warningForm.reason, warningForm.details);
      setWarningModalOpen(false);
      setWarningForm({ reason: '', details: '' });
      
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, warnings_count: (user.warnings_count || 0) + 1 }
          : user
      ));
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Ошибка выдачи предупреждения');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banForm.reason.trim() || banForm.duration_days < 1) return;

    try {
      await banUser(selectedUser.id, banForm.reason, banForm.duration_days, banForm.details);
      setBanModalOpen(false);
      setBanForm({ reason: '', details: '', duration_days: 1 });
      
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, is_banned: true, ban_reason: banForm.reason }
          : user
      ));
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Ошибка блокировки пользователя');
    }
  };

  const handleRemoveWarning = async (warningId: number) => {
    try {
      await removeWarning(warningId);
      
      
      setUserWarnings(prev => prev.filter(w => w.id !== warningId));
      setUsers(prev => prev.map(user => 
        user.id === selectedUser?.id 
          ? { ...user, warnings_count: Math.max((user.warnings_count || 0) - 1, 0) }
          : user
      ));
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Ошибка снятия предупреждения');
    }
  };

  const handleUnbanUser = async (banId: number) => {
    try {
      await unbanUser(banId);
      
      
      setUserBans(prev => prev.filter(b => b.id !== banId));
      setUsers(prev => prev.map(user => 
        user.id === selectedUser?.id 
          ? { ...user, is_banned: false, ban_reason: undefined }
          : user
      ));
    } catch (err: any) {
      setUsersError(err.response?.data?.error || 'Ошибка разблокировки пользователя');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Дата неизвестна';
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      {/* Поиск */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' },
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Поиск по имени, юзернейму или ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={usersLoading}
          sx={{
            minWidth: { xs: 40, sm: 80 },
            px: { xs: 0, sm: 2 },
            ml: 1,
            height: 40,

          }}
        >
          {usersLoading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <SearchIcon />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                Поиск
              </Box>
            </>
          )}
        </Button>
      </Box>

      {/* Ошибки */}
      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUsersError(null)}>
          {usersError}
        </Alert>
      )}

      {/* Список пользователей */}
      <Grid container spacing={1}>
        {users.map((user) => (
          <Grid item xs={5} sm={4} md={3} lg={3} key={user.id}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid var(--main-border-color)',
                borderRadius: 'var(--main-border-radius)',
                background: 'var(--theme-background)',
                backdropFilter: 'var(--theme-backdrop-filter)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Аватар и основная информация */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={user.avatar_url}
                    sx={{ width: 50, height: 50 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      {user.verification_level && user.verification_level > 0 && (
                        <VerificationBadge 
                          status={user.verification_level} 
                          size="small" 
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      ID: {user.id}
                    </Typography>
                  </Box>
                </Box>

                {/* Статус бана */}
                {user.is_banned && (
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<BlockIcon />}
                      label="Заблокирован"
                      color="error"
                      size="small"
                    />
                  </Box>
                )}

                {/* Статистика */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Подписчики: {user.followers_count || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Посты: {user.posts_count || 0}
                  </Typography>
                </Box>

                {/* Кнопки действий */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {canManage && (
                    <Tooltip title="Редактировать">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {canDeleteAvatar && (
                    <Tooltip title="Удалить аватар">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setDeleteAvatarModalOpen(true);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Предупреждения">
                    <IconButton
                      size="small"
                      onClick={() => handleViewWarnings(user)}
                      sx={{ color: 'warning.main' }}
                    >
                      <WarningIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Баны">
                    <IconButton
                      size="small"
                      onClick={() => handleViewBans(user)}
                      sx={{ color: 'error.main' }}
                    >
                      <BlockIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {canIssueWarning && (
                    <Tooltip title="Выдать предупреждение">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setWarningModalOpen(true);
                        }}
                        sx={{ color: 'warning.main' }}
                      >
                        <WarningIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {canBan && (
                    <Tooltip title="Заблокировать">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setBanModalOpen(true);
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <BlockIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : null}
          >
            Загрузить еще
          </Button>
        </Box>
      )}

      {/* Модалка редактирования пользователя */}
      <UniversalModal
        open={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        title="Редактировать пользователя"
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Имя"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            disabled={!permissions?.change_user_name}
            size="small"
          />
          
          <TextField
            fullWidth
            label="Юзернейм"
            value={editForm.username}
            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
            disabled={!permissions?.change_username}
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button onClick={() => setEditUserModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSaveUser}
              variant="contained"
              disabled={loading}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Модалка предупреждений */}
      <UniversalModal
        open={warningsModalOpen}
        onClose={() => {
          console.log('Closing warnings modal');
          setWarningsModalOpen(false);
        }}
        title={`Предупреждения - ${selectedUser?.name || 'Пользователь'}`}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Предупреждения</Typography>
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={() => {
                setWarningModalOpen(true);
                setWarningsModalOpen(false);
              }}
              startIcon={<WarningIcon />}
            >
              Выдать предупреждение
            </Button>
          </Box>
          {userWarnings.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {userWarnings.map((warning) => (
                <Card key={warning.id} elevation={0} sx={{ 
                  border: '1px solid var(--main-border-color)',
                  borderRadius: 'var(--main-border-radius)',
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {warning.reason}
                        </Typography>
                        <Chip
                          label={warning.is_active ? 'Активно' : 'Неактивно'}
                          color={warning.is_active ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                      {warning.details && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {warning.details}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          👤 {warning.admin_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📅 {formatDate(warning.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    {warning.is_active && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveWarning(warning.id)}
                        color="error"
                        title="Снять предупреждение"
                        sx={{ ml: 1 }}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              У пользователя нет предупреждений
            </Typography>
          )}
        </Box>
      </UniversalModal>

      {/* Модалка банов */}
      <UniversalModal
        open={bansModalOpen}
        onClose={() => setBansModalOpen(false)}
        title={`Баны - ${selectedUser?.name || 'Пользователь'}`}
        maxWidth="md"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Баны</Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                setBanModalOpen(true);
                setBansModalOpen(false);
              }}
              startIcon={<BlockIcon />}
            >
              Заблокировать
            </Button>
          </Box>
          {userBans.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {userBans.map((ban) => (
                <Card key={ban.id} elevation={0} sx={{ 
                  border: '1px solid var(--main-border-color)',
                  borderRadius: 'var(--main-border-radius)',
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {ban.reason}
                        </Typography>
                        <Chip
                          label={ban.is_active ? (ban.is_expired ? 'Истек' : 'Активен') : 'Неактивен'}
                          color={ban.is_active ? (ban.is_expired ? 'warning' : 'error') : 'default'}
                          size="small"
                        />
                      </Box>
                      {ban.details && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {ban.details}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          👤 {ban.admin_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📅 {formatDate(ban.start_date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ⏰ {ban.formatted_end_date}
                        </Typography>
                        {ban.remaining_days > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            ⏳ {ban.remaining_days} дн. осталось
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {ban.is_active && !ban.is_expired && (
                      <IconButton
                        size="small"
                        onClick={() => handleUnbanUser(ban.id)}
                        color="success"
                        title="Разблокировать"
                        sx={{ ml: 1 }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              У пользователя нет банов
            </Typography>
          )}
        </Box>
      </UniversalModal>

      {/* Модалка выдачи предупреждения */}
      <UniversalModal
        open={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        title={`Выдать предупреждение - ${selectedUser?.name || 'Пользователь'}`}
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Причина предупреждения"
            value={warningForm.reason}
            onChange={(e) => setWarningForm(prev => ({ ...prev, reason: e.target.value }))}
            required
            size="small"
          />
          
          <TextField
            fullWidth
            label="Детали (опционально)"
            value={warningForm.details}
            onChange={(e) => setWarningForm(prev => ({ ...prev, details: e.target.value }))}
            multiline
            rows={3}
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button onClick={() => setWarningModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleIssueWarning}
              variant="contained"
              color="warning"
              disabled={loading || !warningForm.reason.trim()}
            >
              Выдать предупреждение
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Модалка блокировки */}
      <UniversalModal
        open={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title={`Заблокировать пользователя - ${selectedUser?.name || 'Пользователь'}`}
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Причина блокировки"
            value={banForm.reason}
            onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
            required
            size="small"
          />
          
          <TextField
            fullWidth
            label="Детали (опционально)"
            value={banForm.details}
            onChange={(e) => setBanForm(prev => ({ ...prev, details: e.target.value }))}
            multiline
            rows={3}
            size="small"
          />

          <TextField
            fullWidth
            label="Длительность (дни)"
            type="number"
            value={banForm.duration_days}
            onChange={(e) => setBanForm(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
            inputProps={{ min: 1, max: 365 }}
            size="small"
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button onClick={() => setBanModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleBanUser}
              variant="contained"
              color="error"
              disabled={loading || !banForm.reason.trim() || banForm.duration_days < 1}
            >
              Заблокировать
            </Button>
          </Box>
        </Box>
      </UniversalModal>

      {/* Модалка подтверждения удаления аватарки */}
      <UniversalModal
        open={deleteAvatarModalOpen}
        onClose={() => setDeleteAvatarModalOpen(false)}
        title="Удалить аватар"
        maxWidth="sm"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography>
            Вы уверены, что хотите удалить аватар пользователя "{selectedUser?.name || 'Пользователь'}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Это действие нельзя отменить.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button onClick={() => setDeleteAvatarModalOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleDeleteAvatar}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              Удалить аватар
            </Button>
          </Box>
        </Box>
      </UniversalModal>
    </Box>
  );
};

export default UsersTab;
