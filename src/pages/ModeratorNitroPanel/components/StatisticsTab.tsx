import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Alert,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Verified as VerifiedIcon,
  FiberManualRecord as OnlineIcon,
  Gavel as BanIcon,
  Warning as ScamIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface StatisticsData {
  users?: {
    total: number;
    last_24h: number;
    last_hour: number;
    last_3_days: number;
    verified: number;
    online_now: number;
    banned: number;
    scam: number;
  };
  posts?: {
    total: number;
    last_24h: number;
    last_hour: number;
    last_3_days: number;
    with_images: number;
    with_videos: number;
    with_music: number;
  };
  tracks?: {
    total: number;
    last_24h: number;
    last_hour: number;
    last_3_days: number;
    verified: number;
    unverified: number;
  };
  comments?: {
    total: number;
    last_24h: number;
    last_hour: number;
    last_3_days: number;
  };
  badges?: {
    total: number;
    active: number;
    inactive: number;
    users_with_badges: number;
  };
  artists?: {
    total: number;
    verified: number;
    unverified: number;
    last_24h: number;
  };
  bug_reports?: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    last_24h: number;
  };
  keys?: {
    total: number;
    active: number;
    expired: number;
    used: number;
  };
  subscriptions?: {
    total: number;
    active: number;
    expired: number;
    last_24h: number;
  };
}

interface RecentUser {
  id: number;
  username: string;
  display_name: string;
  avatar: string | null;
  created_at: string;
  is_verified: boolean;
  is_online: boolean;
  ban: number;
  scam: number;
  profile_url: string;
}

const StatisticsTab: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/stat/all');

      if (response.data.success) {
        setStatistics(response.data.data);
      } else {
        setError('Ошибка загрузки статистики');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.get('/api/stat/recent-users');

      if (response.data.success) {
        setRecentUsers(response.data.data.users);
      } else {
        console.error('Ошибка загрузки последних пользователей');
      }
    } catch (error) {
      console.error('Error fetching recent users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchRecentUsers();
  }, []);

  const handleUserClick = (user: RecentUser) => {
    navigate(user.profile_url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Только что';
    } else if (diffInHours < 24) {
      return `${diffInHours}ч назад`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}д назад`;
    }
  };

  const StatCard: React.FC<{
    title: string;
    data: any;
    fields: { label: string; key: string }[];
  }> = ({ title, data, fields }) => (
    <Grid item xs={12} sm={6} lg={4}>
      <Box
        sx={{
          p: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--small-border-radius)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            fontSize: '1rem',
            mb: 2,
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h3"
          sx={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 300,
            fontSize: '2rem',
            mb: 3,
            letterSpacing: '-0.01em',
          }}
        >
          {data?.total?.toLocaleString() || '0'}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {fields.map((field) => (
            <Box key={field.key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.875rem',
                }}
              >
                {field.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {(data?.[field.key] || 0).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            fontSize: '1.5rem',
          }}
        >
          Статистика
        </Typography>
        <Button
          variant="text"
          onClick={fetchStatistics}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.875rem',
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 4,
        }}>
          <CircularProgress size={24} sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
        </Box>
      ) : !statistics ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <Typography variant="body1">
            Статистика не загружена
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={0.625}>
            <StatCard
            title="Пользователи"
            data={statistics.users}
            fields={[
              { label: 'За 24ч', key: 'last_24h' },
              { label: 'За час', key: 'last_hour' },
              { label: 'За 3 дня', key: 'last_3_days' },
              { label: 'Верифицированы', key: 'verified' },
              { label: 'Онлайн', key: 'online_now' },
              { label: 'Забанены', key: 'banned' },
              { label: 'Скам', key: 'scam' },
            ]}
          />

          <StatCard
            title="Посты"
            data={statistics.posts}
            fields={[
              { label: 'За 24ч', key: 'last_24h' },
              { label: 'За час', key: 'last_hour' },
              { label: 'За 3 дня', key: 'last_3_days' },
              { label: 'С изображениями', key: 'with_images' },
              { label: 'С видео', key: 'with_videos' },
              { label: 'С музыкой', key: 'with_music' },
            ]}
          />

          <StatCard
            title="Треки"
            data={statistics.tracks}
            fields={[
              { label: 'За 24ч', key: 'last_24h' },
              { label: 'За час', key: 'last_hour' },
              { label: 'За 3 дня', key: 'last_3_days' },
              { label: 'Верифицированы', key: 'verified' },
              { label: 'Не верифицированы', key: 'unverified' },
            ]}
          />

          <StatCard
            title="Комментарии"
            data={statistics.comments}
            fields={[
              { label: 'За 24ч', key: 'last_24h' },
              { label: 'За час', key: 'last_hour' },
              { label: 'За 3 дня', key: 'last_3_days' },
            ]}
          />

          <StatCard
            title="Бейджи"
            data={statistics.badges}
            fields={[
              { label: 'Активные', key: 'active' },
              { label: 'Неактивные', key: 'inactive' },
              { label: 'Пользователи с бейджами', key: 'users_with_badges' },
            ]}
          />

          <StatCard
            title="Артисты"
            data={statistics.artists}
            fields={[
              { label: 'Верифицированы', key: 'verified' },
              { label: 'Не верифицированы', key: 'unverified' },
              { label: 'За 24ч', key: 'last_24h' },
            ]}
          />

          <StatCard
            title="Баг репорты"
            data={statistics.bug_reports}
            fields={[
              { label: 'Открыты', key: 'open' },
              { label: 'В работе', key: 'in_progress' },
              { label: 'Решены', key: 'resolved' },
              { label: 'За 24ч', key: 'last_24h' },
            ]}
          />

          <StatCard
            title="Ключи"
            data={statistics.keys}
            fields={[
              { label: 'Активные', key: 'active' },
              { label: 'Истекшие', key: 'expired' },
              { label: 'Использованные', key: 'used' },
            ]}
          />

          <StatCard
            title="Подписки"
            data={statistics.subscriptions}
            fields={[
              { label: 'Активные', key: 'active' },
              { label: 'Истекшие', key: 'expired' },
              { label: 'За 24ч', key: 'last_24h' },
            ]}
          />
          </Grid>

          {/* Список последних пользователей */}
          <Box sx={{ mt: 4 }}>
            <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 500,
              fontSize: '1.25rem',
              mb: 2,
            }}
          >
            Последние 30 зарегистрированных пользователей
          </Typography>
          
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--small-border-radius)',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {usersLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  py: 4,
                }}>
                  <CircularProgress size={24} sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </Box>
              ) : recentUsers.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {recentUsers.map((user) => (
                    <ListItem
                      key={user.id}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                      onClick={() => handleUserClick(user)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={user.avatar || undefined}
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="body1"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontWeight: 500,
                              }}
                            >
                              {user.display_name}
                            </Typography>
                            {user.is_verified && (
                              <Tooltip title="Верифицирован">
                                <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
                              </Tooltip>
                            )}
                            {user.is_online && (
                              <Tooltip title="Онлайн">
                                <OnlineIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
                              </Tooltip>
                            )}
                            {user.ban === 0 && (
                              <Tooltip title="Забанен">
                                <BanIcon sx={{ color: '#f44336', fontSize: 16 }} />
                              </Tooltip>
                            )}
                            {user.scam === 1 && (
                              <Tooltip title="Скам">
                                <ScamIcon sx={{ color: '#ff9800', fontSize: 16 }} />
                              </Tooltip>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.875rem',
                              }}
                            >
                              @{user.username}
                            </Typography>
                            <Chip
                              label={formatDate(user.created_at)}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.7)',
                              }}
                            />
                          </Box>
                        }
                      />
                      <Tooltip title="Открыть профиль">
                        <IconButton
                          size="small"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            '&:hover': {
                              color: 'rgba(255, 255, 255, 0.8)',
                            },
                          }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  <Typography variant="body1">
                    Пользователи не найдены
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          </Box>
        </>
      )}
    </Box>
  );
};

export default StatisticsTab;
