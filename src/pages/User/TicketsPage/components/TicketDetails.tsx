import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Schedule,
  CheckCircle,
  Close,
  Warning,
  BugReport,
  ContentPaste,
  Security,
  Report
} from '@mui/icons-material';
import { Ticket } from '../types';

interface TicketDetailsProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  onAddComment: (ticketId: number, content: string) => Promise<void>;
  loading?: boolean;
}

// Стилизованные компоненты
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(18, 18, 18, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(207, 188, 251, 0.12)',
    borderRadius: theme.spacing(2),
    maxWidth: 800,
    width: '90vw',
    maxHeight: '90vh',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(207, 188, 251, 0.1)',
  border: '1px solid rgba(207, 188, 251, 0.2)',
  color: 'rgba(207, 188, 251, 0.9)',
  fontWeight: 500,
}));

// Функции для получения цветов и лейблов
const getStatusColor = (status: string) => {
  const colors = {
    new: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'default',
  };
  return colors[status as keyof typeof colors] || 'default';
};

const getStatusLabel = (status: string) => {
  const labels = {
    new: 'Новый',
    in_progress: 'В работе',
    resolved: 'Решен',
    closed: 'Закрыт',
  };
  return labels[status as keyof typeof labels] || status;
};

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
  };
  return colors[priority as keyof typeof colors] || 'default';
};

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    urgent: 'Срочный',
  };
  return labels[priority as keyof typeof labels] || priority;
};

const getCategoryIcon = (category: string) => {
  const icons = {
    spam: <ContentPaste />,
    abuse: <Security />,
    content: <Report />,
    technical: <BugReport />,
    appeal: <Warning />,
    other: <Report />,
  };
  return icons[category as keyof typeof icons] || <Report />;
};

const getCategoryLabel = (category: string) => {
  const labels = {
    spam: 'Спам',
    abuse: 'Нарушения',
    content: 'Контент',
    technical: 'Техническое',
    appeal: 'Апелляция',
    other: 'Другое',
  };
  return labels[category as keyof typeof labels] || category;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  open,
  onClose,
  onAddComment,
  loading = false
}) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(ticket.id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        color: 'rgba(255, 255, 255, 0.87)',
        borderBottom: '1px solid rgb(24 24 24)',
        pb: 2
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {ticket.title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Статусы и метаданные */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
          <StyledChip
            label={getStatusLabel(ticket.status)}
            color={getStatusColor(ticket.status) as any}
            size="small"
            icon={ticket.status === 'new' ? <Schedule /> : 
                  ticket.status === 'resolved' ? <CheckCircle /> : 
                  ticket.status === 'closed' ? <Close /> : <Schedule />}
          />
          <StyledChip
            label={getPriorityLabel(ticket.priority)}
            color={getPriorityColor(ticket.priority) as any}
            size="small"
            icon={<Warning />}
          />
          <StyledChip
            label={getCategoryLabel(ticket.category)}
            color="default"
            size="small"
            icon={getCategoryIcon(ticket.category)}
          />
        </Box>

        {/* Описание */}
        <Box mb={3}>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 1 }}>
            Описание
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}
          >
            {ticket.description}
          </Typography>
        </Box>

        {/* Метаданные */}
        <Box mb={3}>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 1 }}>
            Информация
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              <strong>Создан:</strong> {formatDate(ticket.created_at)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              <strong>Обновлен:</strong> {formatDate(ticket.updated_at)}
            </Typography>
            {ticket.resolved_at && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                <strong>Решен:</strong> {formatDate(ticket.resolved_at)}
              </Typography>
            )}
            {ticket.closed_at && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                <strong>Закрыт:</strong> {formatDate(ticket.closed_at)}
              </Typography>
            )}
            {ticket.target_type && ticket.target_id && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                <strong>Цель:</strong> {ticket.target_type} #{ticket.target_id}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgb(24 24 24)' }} />

        {/* Комментарии */}
        <Box mb={3}>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
            Комментарии ({ticket.comments?.length || 0})
          </Typography>
          
          {loading ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {[1, 2, 3].map((i) => (
                <Box key={i} sx={{ 
                  p: 2, 
                  background: 'rgba(207, 188, 251, 0.05)',
                  borderRadius: 'var(--main-border-radius)',
                  border: '1px solid rgba(207, 188, 251, 0.1)'
                }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={120} height={20} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width={80} height={16} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Skeleton variant="text" width="100%" height={16} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="text" width="80%" height={16} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          ) : !ticket.comments || ticket.comments.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
              Пока нет комментариев
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {ticket.comments?.map((comment) => (
                <Box key={comment.id} sx={{ 
                  p: 2, 
                  background: 'rgba(207, 188, 251, 0.05)',
                  borderRadius: 'var(--main-border-radius)',
                  border: '1px solid rgba(207, 188, 251, 0.1)'
                }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar 
                      src={comment.moderator.avatar} 
                      alt={comment.moderator.name}
                      sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                    >
                      {comment.moderator.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" sx={{ color: 'rgba(207, 188, 251, 0.9)', fontWeight: 500 }}>
                        {comment.moderator.name}
                      </Typography>
                      {comment.moderator.is_moderator && (
                        <Box
                          sx={{
                            background: 'linear-gradient(45deg,rgb(172, 146, 231) 30%,rgb(181, 130, 240) 90%)',
                            color: 'white',
                            px: 1,
                            py: 0.25,
                            borderRadius: 'var(--main-border-radius)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          Модератор
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Добавление комментария */}
        {!ticket.is_closed && (
          <Box>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
              Добавить комментарий
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишите ваш комментарий или дополнительную информацию..."
                variant="outlined"
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'rgba(255, 255, 255, 0.87)',
                    '& fieldset': {
                      borderColor: 'rgba(207, 188, 251, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(207, 188, 251, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#d0bcff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
                sx={{
                  background: 'linear-gradient(45deg, #cfbcfb 30%, #827095 90%)',
                  color: 'white',
                  minWidth: 'auto',
                  px: 2,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #b8a8e8 30%, #6b5b7a 90%)',
                  },
                  '&:disabled': {
                    background: 'rgb(24 24 24)',
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  <SendIcon />
                )}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid rgb(24 24 24)' 
      }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              background: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default TicketDetails; 