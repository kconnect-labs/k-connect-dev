import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assignment,
  CheckCircle,
  Close,
  Person,
  History,
  Warning,
  Block,
} from '@mui/icons-material';

interface ModerationLog {
  id: number;
  action_type: string;
  details: string;
  created_at: string;
  moderator: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
}

interface TicketModerationHistoryProps {
  ticketId: number;
  onClose: () => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  maxHeight: '70vh',
  overflow: 'auto',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.08)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.12)',
  },
}));

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'ticket_assigned':
      return <Assignment sx={{ color: '#d0bcff' }} />;
    case 'ticket_resolved':
      return <CheckCircle sx={{ color: '#4CAF50' }} />;
    case 'ticket_closed':
      return <Close sx={{ color: '#f44336' }} />;
    case 'warning_issued':
      return <Warning sx={{ color: '#FF9800' }} />;
    case 'user_banned':
      return <Block sx={{ color: '#f44336' }} />;
    case 'post_deleted':
      return <Close sx={{ color: '#f44336' }} />;
    default:
      return <History sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />;
  }
};

const getActionLabel = (actionType: string) => {
  switch (actionType) {
    case 'ticket_assigned':
      return 'Назначен';
    case 'ticket_resolved':
      return 'Решен';
    case 'ticket_closed':
      return 'Закрыт';
    case 'warning_issued':
      return 'Предупреждение';
    case 'user_banned':
      return 'Бан';
    case 'post_deleted':
      return 'Пост удален';
    default:
      return actionType;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'ticket_assigned':
      return 'primary';
    case 'ticket_resolved':
      return 'success';
    case 'ticket_closed':
      return 'error';
    case 'warning_issued':
      return 'warning';
    case 'user_banned':
      return 'error';
    case 'post_deleted':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TicketModerationHistory: React.FC<TicketModerationHistoryProps> = ({
  ticketId,
  onClose,
}) => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModerationHistory();
  }, [ticketId]);

  const fetchModerationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/moderator/logs?target_id=${ticketId}&target_type=ticket`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'liquide-gg-v2',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs || []);
        } else {
          setError(data.error || 'Ошибка загрузки истории');
        }
      } else {
        setError('Ошибка загрузки истории');
      }
    } catch (error) {
      console.error('Ошибка загрузки истории модерации:', error);
      setError('Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StyledPaper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress sx={{ color: '#d0bcff' }} />
        </Box>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: '#d0bcff' }}>
          <History />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            История модерации
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Тикет #{ticketId}
          </Typography>
        </Box>
      </Box>

      {logs.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            История модерации пуста
          </Typography>
        </Box>
      ) : (
        <List>
          {logs.map((log, index) => (
            <React.Fragment key={log.id}>
              <StyledListItem>
                <ListItemIcon>
                  {getActionIcon(log.action_type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                        {getActionLabel(log.action_type)}
                      </Typography>
                      <Chip
                        label={log.moderator.name}
                        size="small"
                        sx={{
                          background: 'rgba(207, 188, 251, 0.2)',
                          color: '#d0bcff',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        {log.details}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {formatDate(log.created_at)}
                      </Typography>
                    </Box>
                  }
                />
                <Avatar src={log.moderator.avatar || 'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png'} alt={log.moderator.name} sx={{ width: 32, height: 32 }} />
              </StyledListItem>
              {index < logs.length - 1 && (
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </StyledPaper>
  );
};

export default TicketModerationHistory; 