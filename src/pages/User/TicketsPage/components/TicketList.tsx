import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
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

interface TicketListProps {
  tickets: Ticket[];
  onTicketSelect: (ticket: Ticket) => void;
  loading?: boolean;
}

// Стилизованные компоненты
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
  background: 'rgba(207, 188, 251, 0.1)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  color: 'rgba(207, 188, 251, 0.9)',
  fontWeight: 500,
  '& .MuiChip-label': {
    fontSize: '0.75rem',
  },
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
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Только что';
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  } else if (diffInHours < 48) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
};

const TicketList: React.FC<TicketListProps> = ({ tickets, onTicketSelect, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <StyledCard key={i}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* Заголовок */}
              <Skeleton 
                variant="text" 
                width="70%" 
                height={28} 
                sx={{ mb: 1.5, borderRadius: 1 }}
              />
              
              {/* Статусы и приоритет */}
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 'var(--main-border-radius) !important' }} />
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 'var(--main-border-radius) !important' }} />
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 'var(--main-border-radius) !important' }} />
              </Box>

              {/* Описание */}
              <Skeleton 
                variant="text" 
                width="100%" 
                height={20} 
                sx={{ mb: 0.5, borderRadius: 1 }}
              />
              <Skeleton 
                variant="text" 
                width="90%" 
                height={20} 
                sx={{ mb: 0.5, borderRadius: 1 }}
              />
              <Skeleton 
                variant="text" 
                width="75%" 
                height={20} 
                sx={{ mb: 2, borderRadius: 1 }}
              />

              {/* Метаданные */}
              <Box display="flex" gap={2} flexWrap="wrap">
                <Skeleton variant="text" width={80} height={16} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" width={60} height={16} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" width={70} height={16} sx={{ borderRadius: 1 }} />
              </Box>
            </CardContent>
          </StyledCard>
        ))}
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

                {/* Метаданные */}
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
                    💬 {ticket.public_comments_count}
                  </Typography>

                  {/* Цель тикета */}
                  {ticket.target_type && ticket.target_id && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(207, 188, 251, 0.5)',
                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                      }}
                    >
                      {ticket.target_type} #{ticket.target_id}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
};

export default TicketList; 