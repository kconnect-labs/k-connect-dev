import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Skeleton,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assignment,
  CheckCircle,
  Close,
  Edit,
  Visibility,
  PriorityHigh,
  Schedule,
  Done,
} from '@mui/icons-material';
import PriorityIcon from './PriorityIcon';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  comments_count: number;
  is_active: boolean;
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  pagination: any;
  onTicketSelect: (ticket: Ticket) => void;
  onTicketAction: (ticketId: number, action: string, data?: any) => void;
  actionLoading: boolean;
}

// Стилизованные компоненты с темизацией
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(207, 188, 251, 0.05)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  // Убираем backdropFilter на мобильных устройствах
  [theme.breakpoints.up('md')]: {
    backdropFilter: 'blur(20px)',
    '&:hover': {
      background: 'rgba(207, 188, 251, 0.08)',
      borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  },
  // На мобильных устройствах убираем hover эффекты
  [theme.breakpoints.down('md')]: {
    '&:active': {
      background: 'rgba(207, 188, 251, 0.08)',
      transform: 'scale(0.98)',
    },
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

const getPriorityIcon = (priority: string) => {
  return <PriorityIcon priority={priority} size="small" />;
};

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  loading,
  pagination,
  onTicketSelect,
  onTicketAction,
  actionLoading,
}) => {
  const handleAction = async (ticketId: number, action: string) => {
    try {
      await onTicketAction(ticketId, action);
    } catch (error) {
      console.error('Ошибка выполнения действия:', error);
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

  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <StyledCard key={index}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box flex={1}>
                  <Skeleton variant="text" width="60%" height={32} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Box mt={1}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                  </Box>
                </Box>
                <Box>
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        ))}
      </Box>
    );
  }

  if (tickets.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={8}
      >
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Тикеты не найдены
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Попробуйте изменить фильтры или создать новый тикет
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {tickets.map((ticket) => (
        <StyledCard key={ticket.id} onClick={() => onTicketSelect(ticket)}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{ 
                    color: '#cfbcfb',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    mb: 1
                  }}
                >
                  {ticket.title}
                </Typography>
                
                {/* Статусы и приоритет */}
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  <StyledChip
                    label={getStatusLabel(ticket.status)}
                    color={getStatusColor(ticket.status) as any}
                    size="small"
                  />
                  <StyledChip
                    icon={getPriorityIcon(ticket.priority)}
                    label={getPriorityLabel(ticket.priority)}
                    color={getPriorityColor(ticket.priority) as any}
                    size="small"
                  />
                  {ticket.reason && (
                    <StyledChip
                      label={ticket.reason}
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: { xs: 2, md: 3 },
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    color: 'rgba(207, 188, 251, 0.6)',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    lineHeight: 1.4,
                  }}
                >
                  {ticket.description}
                </Typography>

                                <Box 
                  display="flex" 
                  alignItems="center" 
                  gap={2} 
                  mb={2}
                  flexWrap="wrap"
                  sx={{ 
                    '& > *': { 
                      minWidth: 'fit-content' 
                    } 
                  }}
                >
                  {/* Создатель */}
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={ticket.creator.avatar}
                      alt={ticket.creator.name}
                      sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }}
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(207, 188, 251, 0.6)',
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      {ticket.creator.name}
                    </Typography>
                  </Box>

                  {/* Назначенный модератор */}
                  {ticket.assignee && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(207, 188, 251, 0.6)',
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }}
                      >
                        →
                      </Typography>
                      <Avatar
                        src={ticket.assignee.avatar}
                        alt={ticket.assignee.name}
                        sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(207, 188, 251, 0.6)',
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }}
                      >
                        {ticket.assignee.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Дата создания */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(207, 188, 251, 0.5)',
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }}
                  >
                    {formatDate(ticket.created_at)}
                  </Typography>

                  {/* Количество комментариев */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(207, 188, 251, 0.5)',
                      fontSize: { xs: '0.75rem', md: '0.875rem' }
                    }}
                  >
                    💬 {ticket.comments_count}
                  </Typography>
                </Box>

                              </Box>
              
              <Box display={{ xs: 'none', md: 'flex' }} gap={1}>
                {ticket.status === 'new' && (
                  <Tooltip title="Назначить себе">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(ticket.id, 'assign');
                      }}
                      disabled={actionLoading}
                      sx={{ color: 'rgba(207, 188, 251, 0.7)' }}
                    >
                      <Assignment />
                    </IconButton>
                  </Tooltip>
                )}

                {ticket.status === 'in_progress' && (
                  <Tooltip title="Отметить как решенный">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(ticket.id, 'resolve');
                      }}
                      disabled={actionLoading}
                      sx={{ color: 'rgba(207, 188, 251, 0.7)' }}
                    >
                      <CheckCircle />
                    </IconButton>
                  </Tooltip>
                )}

                {ticket.status !== 'closed' && (
                  <Tooltip title="Закрыть тикет">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(ticket.id, 'close');
                      }}
                      disabled={actionLoading}
                      sx={{ color: 'rgba(207, 188, 251, 0.7)' }}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* Быстрые действия на мобильных - внизу карточки */}
            <Box 
              display={{ xs: 'flex', md: 'none' }} 
              gap={1} 
              justifyContent="flex-end"
            >
              {ticket.status === 'new' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(ticket.id, 'assign');
                  }}
                  disabled={actionLoading}
                  sx={{ 
                    color: 'rgba(207, 188, 251, 0.7)',
                    borderColor: 'rgba(207, 188, 251, 0.3)',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5
                  }}
                >
                  Назначить
                </Button>
              )}

              {ticket.status === 'in_progress' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(ticket.id, 'resolve');
                  }}
                  disabled={actionLoading}
                  sx={{ 
                    color: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 0.3)',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5
                  }}
                >
                  Решить
                </Button>
              )}

              {ticket.status !== 'closed' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAction(ticket.id, 'close');
                  }}
                  disabled={actionLoading}
                  sx={{ 
                    color: 'rgba(255, 107, 107, 0.7)',
                    borderColor: 'rgba(255, 107, 107, 0.3)',
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5
                  }}
                >
                  Закрыть
                </Button>
              )}
            </Box>
          </CardContent>
        </StyledCard>
      ))}

      {pagination.has_next && (
        <Box display="flex" justifyContent="center" mt={3}>
                     <Button
             variant="outlined"
             onClick={() => onTicketAction(0, 'loadMore')}
             disabled={loading}
             sx={{
               borderColor: 'rgba(207, 188, 251, 0.3)',
               color: 'rgba(207, 188, 251, 0.7)',
               '&:hover': {
                 borderColor: 'rgba(207, 188, 251, 0.5)',
                 background: 'rgba(207, 188, 251, 0.05)',
               },
             }}
           >
            Загрузить еще
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TicketList; 