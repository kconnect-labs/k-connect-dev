import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assignment,
  CheckCircle,
  Close,
  Edit,
  Delete,
  Send,
  Visibility,
  VisibilityOff,
  OpenInNew,
  Person,
  Flag,
  History,
  Article,
  MoreVert,
  Warning,
} from '@mui/icons-material';

interface Comment {
  id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  moderator: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    is_moderator: boolean;
  };
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  reason?: string;
  created_at: string;
  updated_at: string;
  creator: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  assignee?: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  target_type?: string;
  target_id?: number;
  evidence?: string;
}

interface TicketDetailsProps {
  ticket: Ticket;
  comments: Comment[];
  commentsLoading: boolean;
  onTicketAction: (ticketId: number, action: string, data?: any) => void;
  onCommentAction: (
    ticketId: number,
    commentId: number,
    action: string,
    data?: any
  ) => void;
  actionLoading: boolean;
  onShowPost?: (postId: number) => void;
  onOpenComplaintHistory?: (userId: number, userName: string) => void;
  onOpenModerationHistory?: (ticketId: number) => void;
  onOpenActionsModal?: (ticket: any) => void;
  onUpdatePriority?: (ticketId: number, priority: string) => void;
  onReopenTicket?: (ticketId: number) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  // Убираем backdropFilter на мобильных устройствах
  [theme.breakpoints.up('md')]: {
    backdropFilter: 'blur(20px)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  '&.MuiChip-colorSuccess': {
    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
    color: 'white',
  },
  '&.MuiChip-colorWarning': {
    background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
    color: 'white',
  },
  '&.MuiChip-colorError': {
    background: 'linear-gradient(45deg, #F44336 30%, #EF5350 90%)',
    color: 'white',
  },
  '&.MuiChip-colorInfo': {
    background: 'linear-gradient(45deg, #d0bcff 30%, #cfbcfb 90%)',
    color: 'white',
  },
}));

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new':
      return 'info';
    case 'in_progress':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new':
      return 'Новый';
    case 'in_progress':
      return 'В работе';
    case 'resolved':
      return 'Решен';
    case 'closed':
      return 'Закрыт';
    default:
      return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'error';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'default';
    default:
      return 'default';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'Срочный';
    case 'high':
      return 'Высокий';
    case 'medium':
      return 'Средний';
    case 'low':
      return 'Низкий';
    default:
      return priority;
  }
};

const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  comments,
  commentsLoading,
  onTicketAction,
  onCommentAction,
  actionLoading,
  onShowPost,
  onOpenComplaintHistory,
  onOpenModerationHistory,
  onOpenActionsModal,
  onUpdatePriority,
  onReopenTicket,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await onCommentAction(ticket.id, 0, 'add', {
        content: newComment,
        is_internal: isInternal,
      });
      setNewComment('');
      setIsInternal(false);
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await onCommentAction(ticket.id, commentId, 'update', {
        content: editContent,
      });
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Ошибка редактирования комментария:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        await onCommentAction(ticket.id, commentId, 'delete');
      } catch (error) {
        console.error('Ошибка удаления комментария:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Информация о тикете */}
      <StyledPaper>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
          mb={2}
        >
          <Box flex={1}>
            <Typography
              variant='h5'
              gutterBottom
              sx={{ color: 'rgba(255, 255, 255, 0.87)' }}
            >
              {ticket.title}
            </Typography>
            <Box display='flex' gap={1} mb={2}>
              <StyledChip
                label={getStatusLabel(ticket.status)}
                color={getStatusColor(ticket.status) as any}
                size='small'
              />
              <StyledChip
                label={getPriorityLabel(ticket.priority)}
                color={getPriorityColor(ticket.priority) as any}
                size='small'
              />
              <StyledChip
                label={ticket.category}
                color='default'
                size='small'
              />
            </Box>
            {ticket.reason && (
              <Box display='flex' alignItems='center' gap={1} mb={2}>
                <Typography
                  variant='body2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Причина:
                </Typography>
                <StyledChip
                  label={ticket.reason}
                  color='warning'
                  size='small'
                  variant='outlined'
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
            p: 2,
            borderRadius: 'var(--main-border-radius)',
            background: 'rgba(207, 188, 251, 0.05)',
            border: '1px solid rgba(207, 188, 251, 0.1)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            '& strong': {
              color: 'rgba(207, 188, 251, 0.9)',
              fontWeight: 600,
            },
            '& ul': {
              margin: '8px 0',
              paddingLeft: '20px',
            },
            '& li': {
              margin: '4px 0',
            },
          }}
          dangerouslySetInnerHTML={{
            __html: ticket.description
              .replace(/^([^•\n]+):/gm, '<strong>$1:</strong>')
              .replace(/\n/g, '<br>'),
          }}
        />

        {/* Кнопки действий с тикетом */}
        <Box
          display='flex'
          gap={1}
          flexWrap='wrap'
          mb={2}
          sx={{
            borderTop: '1px solid rgba(66, 66, 66, 0.5)',
            pt: 2,
          }}
        >
          {ticket.status === 'new' && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<Assignment />}
              onClick={() => onTicketAction(ticket.id, 'assign')}
              disabled={actionLoading}
              sx={{
                borderColor: 'rgba(207, 188, 251, 0.3)',
                color: 'rgba(207, 188, 251, 0.7)',
                '&:hover': {
                  borderColor: 'rgba(207, 188, 251, 0.5)',
                  background: 'rgba(207, 188, 251, 0.05)',
                },
              }}
            >
              Назначить себе
            </Button>
          )}

          {ticket.status === 'in_progress' && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<CheckCircle />}
              onClick={() => onTicketAction(ticket.id, 'resolve')}
              disabled={actionLoading}
              sx={{
                borderColor: 'rgba(76, 175, 80, 0.3)',
                color: 'rgba(76, 175, 80, 0.7)',
                '&:hover': {
                  borderColor: 'rgba(76, 175, 80, 0.5)',
                  background: 'rgba(76, 175, 80, 0.05)',
                },
              }}
            >
              Отметить как решенный
            </Button>
          )}

          {ticket.status !== 'closed' && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<Close />}
              onClick={() => onTicketAction(ticket.id, 'close')}
              disabled={actionLoading}
              sx={{
                borderColor: 'rgba(255, 107, 107, 0.3)',
                color: 'rgba(255, 107, 107, 0.7)',
                '&:hover': {
                  borderColor: 'rgba(255, 107, 107, 0.5)',
                  background: 'rgba(255, 107, 107, 0.05)',
                },
              }}
            >
              Закрыть тикет
            </Button>
          )}

          {ticket.status === 'closed' && (
            <Button
              size='small'
              variant='outlined'
              startIcon={<Assignment />}
              onClick={() => onReopenTicket && onReopenTicket(ticket.id)}
              disabled={actionLoading}
              sx={{
                borderColor: 'rgba(76, 175, 80, 0.3)',
                color: 'rgba(76, 175, 80, 0.7)',
                '&:hover': {
                  borderColor: 'rgba(76, 175, 80, 0.5)',
                  background: 'rgba(76, 175, 80, 0.05)',
                },
              }}
            >
              Повторно открыть
            </Button>
          )}

          <Button
            size='small'
            variant='outlined'
            startIcon={<Warning />}
            onClick={() => {
              const priorities = ['low', 'medium', 'high', 'urgent'];
              const currentIndex = priorities.indexOf(ticket.priority);
              const nextPriority =
                priorities[(currentIndex + 1) % priorities.length];
              onUpdatePriority && onUpdatePriority(ticket.id, nextPriority);
            }}
            disabled={actionLoading}
            sx={{
              borderColor: 'rgba(255, 193, 7, 0.3)',
              color: 'rgba(255, 193, 7, 0.7)',
              '&:hover': {
                borderColor: 'rgba(255, 193, 7, 0.5)',
                background: 'rgba(255, 193, 7, 0.05)',
              },
            }}
          >
            Изменить приоритет
          </Button>
        </Box>

        <Box display='flex' alignItems='center' gap={2} mb={2}>
          <Box display='flex' alignItems='center' gap={1}>
            <Avatar src={ticket.creator.avatar} alt={ticket.creator.name} />
            <Typography
              variant='body2'
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Создал: {ticket.creator.name}
            </Typography>
          </Box>
          {ticket.assignee && (
            <Box display='flex' alignItems='center' gap={1}>
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                →
              </Typography>
              <Avatar src={ticket.assignee.avatar} alt={ticket.assignee.name} />
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Назначен: {ticket.assignee.name}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography
          variant='caption'
          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          Создан: {formatDate(ticket.created_at)} | Обновлен:{' '}
          {formatDate(ticket.updated_at)}
        </Typography>

        {ticket.target_type && ticket.target_id && (
          <Box mt={2}>
            <Typography
              variant='body2'
              sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
            >
              Цель: {ticket.target_type} #{ticket.target_id}
            </Typography>

            {/* Кнопки быстрых действий */}
            <Box display='flex' gap={1} flexWrap='wrap'>
              {ticket.target_type === 'post' && (
                <>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<OpenInNew />}
                    onClick={() =>
                      window.open(`/post/${ticket.target_id}`, '_blank')
                    }
                    sx={{
                      borderColor: 'rgba(207, 188, 251, 0.3)',
                      color: 'rgba(207, 188, 251, 0.7)',
                      '&:hover': {
                        borderColor: 'rgba(207, 188, 251, 0.5)',
                        background: 'rgba(207, 188, 251, 0.05)',
                      },
                    }}
                  >
                    Открыть пост
                  </Button>

                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<Article />}
                    onClick={() => {
                      if (onShowPost && ticket.target_id) {
                        onShowPost(ticket.target_id);
                      }
                    }}
                    sx={{
                      borderColor: 'rgba(207, 188, 251, 0.3)',
                      color: 'rgba(207, 188, 251, 0.7)',
                      '&:hover': {
                        borderColor: 'rgba(207, 188, 251, 0.5)',
                        background: 'rgba(207, 188, 251, 0.05)',
                      },
                    }}
                  >
                    Отобразить пост
                  </Button>
                </>
              )}

              {ticket.creator && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<Person />}
                  onClick={() =>
                    window.open(`/profile/${ticket.creator.username}`, '_blank')
                  }
                  sx={{
                    borderColor: 'rgba(207, 188, 251, 0.3)',
                    color: 'rgba(207, 188, 251, 0.7)',
                    '&:hover': {
                      borderColor: 'rgba(207, 188, 251, 0.5)',
                      background: 'rgba(207, 188, 251, 0.05)',
                    },
                  }}
                >
                  Профиль автора
                </Button>
              )}

              <Button
                size='small'
                variant='outlined'
                startIcon={<Flag />}
                onClick={() => {
                  // Открываем модалку с историей жалоб на этого пользователя
                  if (ticket.creator && onOpenComplaintHistory) {
                    onOpenComplaintHistory(
                      ticket.creator.id,
                      ticket.creator.name
                    );
                  }
                }}
                sx={{
                  borderColor: 'rgba(207, 188, 251, 0.3)',
                  color: 'rgba(207, 188, 251, 0.7)',
                  '&:hover': {
                    borderColor: 'rgba(207, 188, 251, 0.5)',
                    background: 'rgba(207, 188, 251, 0.05)',
                  },
                }}
              >
                История жалоб
              </Button>

              <Button
                size='small'
                variant='outlined'
                startIcon={<History />}
                onClick={() => {
                  // Открываем модалку с историей модерации
                  if (onOpenModerationHistory) {
                    onOpenModerationHistory(ticket.id);
                  }
                }}
                sx={{
                  borderColor: 'rgba(207, 188, 251, 0.3)',
                  color: 'rgba(207, 188, 251, 0.7)',
                  '&:hover': {
                    borderColor: 'rgba(207, 188, 251, 0.5)',
                    background: 'rgba(207, 188, 251, 0.05)',
                  },
                }}
              >
                История модерации
              </Button>

              <Button
                size='small'
                variant='outlined'
                startIcon={<MoreVert />}
                onClick={() => {
                  // Открываем модалку с действиями
                  if (onOpenActionsModal) {
                    onOpenActionsModal(ticket);
                  }
                }}
                sx={{
                  borderColor: 'rgba(255, 107, 107, 0.3)',
                  color: 'rgba(255, 107, 107, 0.7)',
                  '&:hover': {
                    borderColor: 'rgba(255, 107, 107, 0.5)',
                    background: 'rgba(255, 107, 107, 0.05)',
                  },
                }}
              >
                Действия
              </Button>
            </Box>
          </Box>
        )}

        {ticket.evidence && (
          <Box mt={2}>
            <Typography
              variant='body2'
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Доказательства: {ticket.evidence}
            </Typography>
          </Box>
        )}
      </StyledPaper>

      <Divider sx={{ my: 3, borderColor: 'rgb(24 24 24)' }} />

      {/* Комментарии */}
      <Typography
        variant='h6'
        gutterBottom
        sx={{ color: 'rgba(255, 255, 255, 0.87)' }}
      >
        Комментарии ({comments.length})
      </Typography>

      {/* Добавление комментария */}
      <StyledPaper>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder='Добавить комментарий...'
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused': {
                border: '1px solid rgba(33, 150, 243, 0.5)',
              },
            },
            '& .MuiInputBase-input': {
              color: 'rgba(255, 255, 255, 0.87)',
            },
          }}
        />
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <FormControlLabel
            control={
              <Checkbox
                checked={isInternal}
                onChange={e => setIsInternal(e.target.checked)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-checked': {
                    color: '#d0bcff',
                  },
                }}
              />
            }
            label={
              <Box display='flex' alignItems='center' gap={1}>
                {isInternal ? <VisibilityOff /> : <Visibility />}
                <Typography
                  variant='body2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Внутренний комментарий
                </Typography>
              </Box>
            }
          />
          <Button
            variant='contained'
            onClick={handleAddComment}
            disabled={!newComment.trim() || actionLoading}
            startIcon={<Send />}
            sx={{
              background: 'linear-gradient(45deg, #d0bcff 30%, #cfbcfb 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c4a7ff 30%, #b8a9ff 90%)',
              },
            }}
          >
            Отправить
          </Button>
        </Box>
      </StyledPaper>

      {/* Список комментариев */}
      {commentsLoading ? (
        <Box textAlign='center' py={4}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Загрузка комментариев...
          </Typography>
        </Box>
      ) : comments.length === 0 ? (
        <Box textAlign='center' py={4}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Комментариев пока нет
          </Typography>
        </Box>
      ) : (
        <Box>
          {comments.map(comment => (
            <StyledPaper key={comment.id}>
              <Box
                display='flex'
                justifyContent='space-between'
                alignItems='flex-start'
              >
                <Box display='flex' gap={2} flex={1}>
                  <Avatar
                    src={comment.moderator.avatar}
                    alt={comment.moderator.name}
                  />
                  <Box flex={1}>
                    <Box display='flex' alignItems='center' gap={1} mb={1}>
                      <Typography
                        variant='subtitle2'
                        sx={{ color: 'rgba(255, 255, 255, 0.87)' }}
                      >
                        {comment.moderator.name}
                      </Typography>
                      {comment.moderator.is_moderator && (
                        <Chip
                          label='Модератор'
                          size='small'
                          sx={{
                            background:
                              'linear-gradient(45deg, #cfbcfb 30%, #827095 90%)',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        />
                      )}
                      {comment.is_internal && (
                        <Chip
                          label='Внутренний'
                          size='small'
                          icon={<VisibilityOff />}
                          sx={{
                            background: 'rgba(255, 193, 7, 0.2)',
                            color: '#FFC107',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>
                    {editingComment === comment.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          sx={{
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                            },
                            '& .MuiInputBase-input': {
                              color: 'rgba(255, 255, 255, 0.87)',
                            },
                          }}
                        />
                        <Box display='flex' gap={1}>
                          <Button
                            size='small'
                            onClick={() => handleEditComment(comment.id)}
                            disabled={!editContent.trim()}
                          >
                            Сохранить
                          </Button>
                          <Button
                            size='small'
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                          >
                            Отмена
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant='body2'
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        {comment.content}
                      </Typography>
                    )}
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        mt: 1,
                        display: 'block',
                      }}
                    >
                      {formatDate(comment.created_at)}
                    </Typography>
                  </Box>
                </Box>
                <Box display='flex' gap={1}>
                  <Tooltip title='Редактировать'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Удалить'>
                    <IconButton
                      size='small'
                      onClick={() => handleDeleteComment(comment.id)}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </StyledPaper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TicketDetails;
