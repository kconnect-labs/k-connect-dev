import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
} from '@mui/icons-material';
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

const StatisticsTab: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchStatistics();
  }, []);

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
          borderRadius: '8px',
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
      )}
    </Box>
  );
};

export default StatisticsTab;
