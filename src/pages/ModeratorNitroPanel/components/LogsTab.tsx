import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  ListAlt as ListAltIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface LogEntry {
  id: number;
  moderator_id: number;
  action_type: string;
  target_id?: number;
  details?: string;
  created_at: string | undefined;
  timestamp?: string;
  moderator?: {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    avatar_url?: string;
  };
}

const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/moderator/logs');

      if (response.data.success) {
        setLogs(response.data.logs);
      } else {
        setError('Ошибка загрузки логов');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Ошибка при загрузке логов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionTypeLabel = (actionType: string): string => {
    const labels: { [key: string]: string } = {
      delete_post: 'Удаление поста',
      delete_track: 'Удаление трека',
      delete_comment: 'Удаление комментария',
      delete_avatar: 'Удаление аватара',
      update_user: 'Обновление пользователя',
      delete_bug_report: 'Удаление баг-репорта',
      update_bug_report: 'Обновление баг-репорта',
      edit_badge: 'Редактирование бейджа',
      delete_badge: 'Удаление бейджа',
      manage_artist: 'Управление артистом',
      delete_artist: 'Удаление артиста',
      create_key: 'Создание ключа',
      verify_user: 'Верификация пользователя',
      assign_moderator: 'Назначение модератора',
      issue_warning: 'Выдача предупреждения',
      ban_user: 'Блокировка пользователя',
      unban_user: 'Разблокировка пользователя',
      review_complaint: 'Обработка жалобы',
    };
    return labels[actionType] || `Выполнено действие: ${actionType}`;
  };

  const getActionTypeColor = (actionType: string): string => {
    const colors: { [key: string]: string } = {
      delete_post: 'rgba(244, 67, 54, 0.8)',
      delete_track: 'rgba(244, 67, 54, 0.8)',
      delete_comment: 'rgba(244, 67, 54, 0.8)',
      delete_avatar: 'rgba(244, 67, 54, 0.8)',
      update_user: 'rgba(33, 150, 243, 0.8)',
      delete_bug_report: 'rgba(244, 67, 54, 0.8)',
      update_bug_report: 'rgba(33, 150, 243, 0.8)',
      edit_badge: 'rgba(156, 39, 176, 0.8)',
      delete_badge: 'rgba(244, 67, 54, 0.8)',
      manage_artist: 'rgba(76, 175, 80, 0.8)',
      delete_artist: 'rgba(244, 67, 54, 0.8)',
      create_key: 'rgba(255, 152, 0, 0.8)',
      verify_user: 'rgba(76, 175, 80, 0.8)',
      assign_moderator: 'rgba(156, 39, 176, 0.8)',
      issue_warning: 'rgba(255, 193, 7, 0.8)',
      ban_user: 'rgba(244, 67, 54, 0.8)',
      unban_user: 'rgba(76, 175, 80, 0.8)',
      review_complaint: 'rgba(33, 150, 243, 0.8)',
    };
    return colors[actionType] || 'rgba(158, 158, 158, 0.8)';
  };

  const getActionTypeDescription = (actionType: string): string => {
    const descriptions: { [key: string]: string } = {
      delete_post: 'Модератор удалил пост',
      delete_track: 'Модератор удалил трек',
      delete_comment: 'Модератор удалил комментарий',
      delete_avatar: 'Модератор удалил аватар пользователя',
      update_user: 'Модератор обновил информацию о пользователе',
      delete_bug_report: 'Модератор удалил баг-репорт',
      update_bug_report: 'Модератор обновил статус баг-репорта',
      edit_badge: 'Модератор отредактировал бейдж',
      delete_badge: 'Модератор удалил бейдж',
      manage_artist: 'Модератор управлял артистом',
      delete_artist: 'Модератор удалил артиста',
      create_key: 'Модератор создал ключ',
      verify_user: 'Модератор верифицировал пользователя',
      assign_moderator: 'Модератор назначил нового модератора',
      issue_warning: 'Модератор выдал предупреждение пользователю',
      ban_user: 'Модератор заблокировал пользователя',
      unban_user: 'Модератор разблокировал пользователя',
      review_complaint: 'Модератор обработал жалобу',
    };
    return descriptions[actionType] || `Выполнено действие: ${actionType}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
          Логи действий модераторов
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchLogs}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <ListAltIcon />}
          sx={{
            borderRadius: 8,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.7)',
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
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : logs.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 2,
            borderRadius: 'var(--main-border-radius)',
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <ListAltIcon
            sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }}
          />
          <Typography
            variant="h6"
            color="rgba(255, 255, 255, 0.5)"
            gutterBottom
          >
            Логи отсутствуют
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.4)">
            Нажмите "Обновить" для загрузки логов
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 0 }}>
          {logs.map((log) => (
            <Box
              key={log.id}
              sx={{
                mb: 2,
                p: 3,
                borderRadius: 'var(--main-border-radius)',
                background: 'var(--theme-background)',
                backdropFilter: 'var(--theme-backdrop-filter)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={log.moderator?.avatar || log.moderator?.avatar_url || undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                    }}
                  >
                    {log.moderator?.name
                      ? log.moderator.name.charAt(0).toUpperCase()
                      : 'M'}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.87)',
                        fontWeight: 500,
                      }}
                    >
                      {log.moderator?.name || 'Неизвестный модератор'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      @{log.moderator?.username || 'unknown'}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                >
                  {new Date(log.created_at || log.timestamp || '').toLocaleString('ru-RU')}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={getActionTypeLabel(log.action_type)}
                  size="small"
                  sx={{
                    borderRadius: 'var(--main-border-radius)',
                    background: getActionTypeColor(log.action_type),
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>

              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
              >
                <strong>Действие:</strong>{' '}
                {getActionTypeDescription(log.action_type)}
              </Typography>

              {log.target_id && (
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}
                >
                  <strong>ID объекта:</strong> {log.target_id}
                </Typography>
              )}

              {log.details && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 'var(--main-border-radius)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(66, 66, 66, 0.5)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    {log.details}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LogsTab;
