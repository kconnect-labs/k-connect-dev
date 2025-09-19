import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { OpenInNew, Article, Flag, Person } from '@mui/icons-material';

interface Complaint {
  id: number;
  target_type: string;
  target_id: number;
  reason: string;
  description?: string;
  evidence?: string;
  created_at: string;
  status: string;
  reviewed_at?: string;
  reviewed_by?: {
    id: number;
    name: string;
    username: string;
  };
  ticket?: {
    id: number;
    status: string;
  };
}

interface ComplaintHistoryProps {
  userId: number;
  userName: string;
  onClose: () => void;
  onOpenTicket: (ticketId: number) => void;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'reviewed':
      return 'success';
    case 'rejected':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Ожидает';
    case 'reviewed':
      return 'Рассмотрена';
    case 'rejected':
      return 'Отклонена';
    default:
      return status;
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

const ComplaintHistory: React.FC<ComplaintHistoryProps> = ({
  userId,
  userName,
  onClose,
  onOpenTicket,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [userId]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/complaints?user_id=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'liquide-gg-v2',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComplaints(data.complaints || []);
        } else {
          setError(data.error || 'Ошибка загрузки жалоб');
        }
      } else {
        setError('Ошибка загрузки жалоб');
      }
    } catch (error) {
      console.error('Ошибка загрузки жалоб:', error);
      setError('Ошибка загрузки жалоб');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = (ticketId: number) => {
    onClose(); // Закрываем модалку истории
    onOpenTicket(ticketId); // Открываем тикет
  };

  if (loading) {
    return (
      <StyledPaper>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='200px'
        >
          <CircularProgress sx={{ color: '#d0bcff' }} />
        </Box>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper>
        <Typography color='error' align='center'>
          {error}
        </Typography>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper>
      <Box display='flex' alignItems='center' gap={2} mb={3}>
        <Avatar sx={{ bgcolor: '#d0bcff' }}>
          <Person />
        </Avatar>
        <Box>
          <Typography variant='h6' sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
            История жалоб
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Пользователь: {userName}
          </Typography>
        </Box>
      </Box>

      {complaints.length === 0 ? (
        <Box textAlign='center' py={4}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Жалоб от этого пользователя не найдено
          </Typography>
        </Box>
      ) : (
        <List>
          {complaints.map((complaint, index) => (
            <React.Fragment key={complaint.id}>
              <StyledListItem>
                <ListItemText
                  primary={
                    <Box display='flex' alignItems='center' gap={1} mb={1}>
                      <Typography
                        variant='subtitle2'
                        sx={{ color: 'rgba(255, 255, 255, 0.87)' }}
                      >
                        Жалоба #{complaint.id}
                      </Typography>
                      <Chip
                        label={getStatusLabel(complaint.status)}
                        color={getStatusColor(complaint.status) as any}
                        size='small'
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant='body2'
                        sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                      >
                        <strong>Цель:</strong> {complaint.target_type} #
                        {complaint.target_id}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
                      >
                        <strong>Причина:</strong> {complaint.reason}
                      </Typography>
                      {complaint.description && (
                        <Typography
                          variant='body2'
                          sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}
                        >
                          <strong>Описание:</strong>{' '}
                          {complaint.description.substring(0, 100)}
                          {complaint.description.length > 100 && '...'}
                        </Typography>
                      )}
                      <Typography
                        variant='caption'
                        sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                      >
                        Создана: {formatDate(complaint.created_at)}
                      </Typography>
                      {complaint.reviewed_at && (
                        <Typography
                          variant='caption'
                          sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 2 }}
                        >
                          Рассмотрена: {formatDate(complaint.reviewed_at)}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display='flex' gap={1}>
                    {complaint.ticket && (
                      <IconButton
                        size='small'
                        onClick={() => handleOpenTicket(complaint.ticket!.id)}
                        sx={{
                          color: '#d0bcff',
                          '&:hover': {
                            background: 'rgba(207, 188, 251, 0.1)',
                          },
                        }}
                      >
                        <Article />
                      </IconButton>
                    )}
                    <IconButton
                      size='small'
                      onClick={() =>
                        window.open(`/post/${complaint.target_id}`, '_blank')
                      }
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      <OpenInNew />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </StyledListItem>
              {index < complaints.length - 1 && (
                <Divider
                  sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }}
                />
              )}
            </React.Fragment>
          ))}
        </List>
      )}

      <Box display='flex' justifyContent='flex-end' mt={3}>
        <Button
          variant='outlined'
          onClick={onClose}
          sx={{
            borderColor: 'rgba(207, 188, 251, 0.3)',
            color: 'rgba(207, 188, 251, 0.7)',
            '&:hover': {
              borderColor: 'rgba(207, 188, 251, 0.5)',
              background: 'rgba(207, 188, 251, 0.05)',
            },
          }}
        >
          Закрыть
        </Button>
      </Box>
    </StyledPaper>
  );
};

export default ComplaintHistory;
