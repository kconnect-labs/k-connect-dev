import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Warning,
  Block,
  CheckCircle,
  Close,
  Refresh,
  Gavel,
  Security,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--background-color)',
  backdropFilter: 'var(--backdrop-filter)',
  border: '1px solid rgba(207, 188, 251, 0.12)',
  borderRadius: theme.spacing(2),
  color: 'var(--theme-text-primary)',
  '&:hover': {
    border: '1px solid rgba(207, 188, 251, 0.2)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(207, 188, 251, 0.1)',
  color: '#d0bcff',
  border: '1px solid rgba(207, 188, 251, 0.3)',
  '&.warning': {
    background: 'rgba(255, 193, 7, 0.1)',
    color: '#ffc107',
    border: '1px solid rgba(255, 193, 7, 0.3)',
  },
  '&.ban': {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  '&.expired': {
    background: 'rgba(156, 163, 175, 0.1)',
    color: '#9ca3af',
    border: '1px solid rgba(156, 163, 175, 0.3)',
  },
}));

interface Warning {
  id: number;
  reason: string;
  details: string;
  active: boolean;
  admin_id: number;
  admin_username: string;
  created_at: string;
}

interface Ban {
  id: number;
  reason: string;
  details: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  can_appeal: boolean;
  moderator_name: string;
}

interface AccountStatusFormProps {
  onClose: () => void;
}

const AccountStatusForm: React.FC<AccountStatusFormProps> = ({ onClose }) => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountStatus();
  }, []);

  const fetchAccountStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем предупреждения
      const warningsResponse = await fetch('/api/user/warnings', {
        credentials: 'include',
      });
      const warningsData = await warningsResponse.json();

      // Загружаем баны
      const bansResponse = await fetch('/api/user/bans', {
        credentials: 'include',
      });
      const bansData = await bansResponse.json();

      if (warningsData.success) {
        setWarnings(warningsData.warnings || []);
      }

      if (bansData.success) {
        setBans(bansData.bans || []);
      }
    } catch (err) {
      setError('Ошибка при загрузке данных');
      console.error('Error fetching account status:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Истекло';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} дн. ${hours} ч.`;
    } else if (hours > 0) {
      return `${hours} ч. ${minutes} мин.`;
    } else {
      return `${minutes} мин.`;
    }
  };

  const getStatusIcon = (item: Warning | Ban) => {
    if ('active' in item) {
      // Это предупреждение
      if (!item.active) {
        return <CheckCircle sx={{ color: '#10b981' }} />;
      }
      return <Warning sx={{ color: '#ffc107' }} />;
    } else {
      // Это бан
      if (!item.is_active) {
        return <CheckCircle sx={{ color: '#10b981' }} />;
      }
      return <Block sx={{ color: '#ef4444' }} />;
    }
  };

  const getStatusChip = (item: Warning | Ban) => {
    if ('active' in item) {
      // Это предупреждение
      if (!item.active) {
        return <StyledChip label='Истекло' className='expired' size='small' />;
      }
      return (
        <StyledChip label='Предупреждение' className='warning' size='small' />
      );
    } else {
      // Это бан
      if (!item.is_active) {
        return <StyledChip label='Истекло' className='expired' size='small' />;
      }
      return <StyledChip label='Бан' className='ban' size='small' />;
    }
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='200px'
      >
        <CircularProgress sx={{ color: '#d0bcff' }} />
      </Box>
    );
  }

  // Для предупреждений: активные = active = true, истекшие = active = false
  const activeWarnings = warnings.filter(w => w.active);
  const expiredWarnings = warnings.filter(w => !w.active);

  // Для банов: активные = is_active = true, истекшие = is_active = false
  const activeBans = bans.filter(b => b.is_active);
  const expiredBans = bans.filter(b => !b.is_active);

  return (
    <Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography
          variant='h5'
          sx={{ color: 'var(--theme-text-primary)', fontWeight: 600 }}
        >
          Состояние аккаунта
        </Typography>
        <Box display='flex' gap={1}>
          <Tooltip title='Обновить'>
            <IconButton onClick={fetchAccountStatus} sx={{ color: '#d0bcff' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Активные предупреждения */}
      {activeWarnings.length > 0 && (
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Box display='flex' alignItems='center' gap={1} mb={2}>
              <Warning sx={{ color: '#ffc107' }} />
              <Typography
                variant='h6'
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Активные предупреждения ({activeWarnings.length})
              </Typography>
            </Box>
            <List>
              {activeWarnings.map((warning, index) => (
                <React.Fragment key={warning.id}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(warning)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          display='flex'
                          alignItems='center'
                          gap={1}
                          flexWrap='wrap'
                        >
                          <Typography
                            variant='body1'
                            sx={{ color: 'var(--theme-text-primary)' }}
                          >
                            {warning.reason}
                          </Typography>
                          {getStatusChip(warning)}
                          <Typography
                            variant='caption'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            {new Date(warning.created_at).toLocaleDateString(
                              'ru-RU'
                            )}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography
                            variant='body2'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Модератор: {warning.admin_username}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Выдано: {formatDate(warning.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activeWarnings.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      )}

      {/* Активные баны */}
      {activeBans.length > 0 && (
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Box display='flex' alignItems='center' gap={1} mb={2}>
              <Block sx={{ color: '#ef4444' }} />
              <Typography
                variant='h6'
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Активные баны ({activeBans.length})
              </Typography>
            </Box>
            <List>
              {activeBans.map((ban, index) => (
                <React.Fragment key={ban.id}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(ban)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          display='flex'
                          alignItems='center'
                          gap={1}
                          flexWrap='wrap'
                        >
                          <Typography
                            variant='body1'
                            sx={{ color: 'var(--theme-text-primary)' }}
                          >
                            {ban.reason}
                          </Typography>
                          {getStatusChip(ban)}
                          <Typography
                            variant='caption'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            {ban.is_active
                              ? `Осталось: ${getTimeRemaining(ban.expires_at)}`
                              : 'Истек'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography
                            variant='body2'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Модератор: {ban.moderator_name}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Выдан: {formatDate(ban.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activeBans.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      )}

      {/* История предупреждений */}
      {expiredWarnings.length > 0 && (
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Box display='flex' alignItems='center' gap={1} mb={2}>
              <CheckCircle sx={{ color: '#10b981' }} />
              <Typography
                variant='h6'
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                История предупреждений ({expiredWarnings.length})
              </Typography>
            </Box>
            <List>
              {expiredWarnings.map((warning, index) => (
                <React.Fragment key={warning.id}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(warning)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          display='flex'
                          alignItems='center'
                          gap={1}
                          flexWrap='wrap'
                        >
                          <Typography
                            variant='body1'
                            sx={{ color: 'var(--theme-text-primary)' }}
                          >
                            {warning.reason}
                          </Typography>
                          {getStatusChip(warning)}
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography
                            variant='body2'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Модератор: {warning.admin_username}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Выдано: {formatDate(warning.created_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < expiredWarnings.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      )}

      {/* История банов */}
      {expiredBans.length > 0 && (
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Box display='flex' alignItems='center' gap={1} mb={2}>
              <CheckCircle sx={{ color: '#10b981' }} />
              <Typography
                variant='h6'
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                История банов ({expiredBans.length})
              </Typography>
            </Box>
            <List>
              {expiredBans.map((ban, index) => (
                <React.Fragment key={ban.id}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(ban)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          display='flex'
                          alignItems='center'
                          gap={1}
                          flexWrap='wrap'
                        >
                          <Typography
                            variant='body1'
                            sx={{ color: 'var(--theme-text-primary)' }}
                          >
                            {ban.reason}
                          </Typography>
                          {getStatusChip(ban)}
                        </Box>
                      }
                      secondary={
                        <Box mt={1}>
                          <Typography
                            variant='body2'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Модератор: {ban.moderator_name}
                          </Typography>
                          <Typography
                            variant='caption'
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            Выдан: {formatDate(ban.created_at)} | Истек:{' '}
                            {formatDate(ban.expires_at)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < expiredBans.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </StyledCard>
      )}

      {/* Если нет никаких предупреждений и банов */}
      {warnings.length === 0 && bans.length === 0 && (
        <StyledCard>
          <CardContent>
            <Box
              display='flex'
              flexDirection='column'
              alignItems='center'
              py={4}
            >
              <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
              <Typography
                variant='h6'
                sx={{ color: 'var(--theme-text-primary)', mb: 1 }}
              >
                Аккаунт в порядке
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--theme-text-secondary)',
                  textAlign: 'center',
                }}
              >
                У вас нет активных предупреждений или банов
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      )}
    </Box>
  );
};
export default AccountStatusForm;
