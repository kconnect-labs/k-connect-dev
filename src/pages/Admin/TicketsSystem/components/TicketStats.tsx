import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Assignment,
  CheckCircle,
  Schedule,
  PriorityHigh,
  TrendingUp,
  TrendingDown,
  Report,
  BugReport,
  Security,
  ContentPaste,
} from '@mui/icons-material';
import PriorityIcon from './PriorityIcon';

interface Ticket {
  id: number;
  status: string;
  priority: string;
  category: string;
  reason?: string;
  assignee?: any;
}

interface TicketStatsProps {
  tickets: Ticket[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: theme.spacing(2),
  height: '100%',
  transition: 'all 0.2s ease',
  // Убираем backdropFilter на мобильных устройствах
  [theme.breakpoints.up('md')]: {
    backdropFilter: 'blur(20px)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
    },
  },
  // На мобильных устройствах убираем hover эффекты
  [theme.breakpoints.down('md')]: {
    '&:active': {
      background: 'rgba(255, 255, 255, 0.08)',
      transform: 'scale(0.98)',
    },
  },
}));

const StatCard: React.FC<{
  title: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}> = ({ title, value, total, color, icon }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                color,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
              {title}
            </Typography>
          </Box>
          <Chip
            label={`${value}/${total}`}
            size="small"
            sx={{
              background: color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: color,
              borderRadius: 4,
            },
          }}
        />
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 1, display: 'block' }}>
          {percentage.toFixed(1)}% от общего количества
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

const TicketStats: React.FC<TicketStatsProps> = ({ tickets }) => {
  const totalTickets = tickets.length;

  // Функция для получения иконки причины жалобы
  const getReasonIcon = (reason: string) => {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('спам') || reasonLower.includes('реклама')) {
      return <ContentPaste />;
    } else if (reasonLower.includes('оскорбление') || reasonLower.includes('угроза')) {
      return <Security />;
    } else if (reasonLower.includes('баг') || reasonLower.includes('ошибка')) {
      return <BugReport />;
    } else {
      return <Report />;
    }
  };

  // Статистика по статусам
  const statusStats = {
    new: tickets.filter(t => t.status === 'new').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  // Статистика по приоритетам
  const priorityStats = {
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    high: tickets.filter(t => t.priority === 'high').length,
    medium: tickets.filter(t => t.priority === 'medium').length,
    low: tickets.filter(t => t.priority === 'low').length,
  };

  // Статистика по категориям
  const categoryStats = tickets.reduce((acc, ticket) => {
    acc[ticket.category] = (acc[ticket.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Статистика по причинам жалоб
  const reasonStats = tickets.reduce((acc, ticket) => {
    if (ticket.reason) {
      acc[ticket.reason] = (acc[ticket.reason] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Сортируем причины по количеству (топ-5)
  const topReasons = Object.entries(reasonStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);



  // Активные тикеты (не закрытые)
  const activeTickets = tickets.filter(t => t.status !== 'closed').length;

  // Назначенные тикеты
  const assignedTickets = tickets.filter(t => t.assignee).length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 3 }}>
        Статистика тикетов
      </Typography>

      {/* Основные метрики */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего тикетов"
            value={totalTickets}
            total={totalTickets}
            color="#d0bcff"
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активные"
            value={activeTickets}
            total={totalTickets}
            color="#FF9800"
            icon={<Schedule />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Назначенные"
            value={assignedTickets}
            total={totalTickets}
            color="#4CAF50"
            icon={<Assignment />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Решенные"
            value={statusStats.resolved}
            total={totalTickets}
            color="#9C27B0"
            icon={<CheckCircle />}
          />
        </Grid>
      </Grid>

      {/* Статистика по статусам */}
      <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
        По статусам
      </Typography>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Новые"
            value={statusStats.new}
            total={totalTickets}
            color="#d0bcff"
            icon={<Schedule />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="В работе"
            value={statusStats.in_progress}
            total={totalTickets}
            color="#FF9800"
            icon={<Assignment />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Решенные"
            value={statusStats.resolved}
            total={totalTickets}
            color="#4CAF50"
            icon={<CheckCircle />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Закрытые"
            value={statusStats.closed}
            total={totalTickets}
            color="#9E9E9E"
            icon={<TrendingDown />}
          />
        </Grid>
      </Grid>

      {/* Статистика по приоритетам */}
      <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
        По приоритетам
      </Typography>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Срочные"
            value={priorityStats.urgent}
            total={totalTickets}
            color="#F44336"
            icon={<PriorityIcon priority="urgent" size="medium" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Высокие"
            value={priorityStats.high}
            total={totalTickets}
            color="#FF9800"
            icon={<PriorityIcon priority="high" size="medium" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Средние"
            value={priorityStats.medium}
            total={totalTickets}
            color="#d0bcff"
            icon={<PriorityIcon priority="medium" size="medium" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Низкие"
            value={priorityStats.low}
            total={totalTickets}
            color="#4CAF50"
            icon={<PriorityIcon priority="low" size="medium" />}
          />
        </Grid>
      </Grid>

      {/* Статистика по категориям */}
      {Object.keys(categoryStats).length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
            По категориям
          </Typography>
          <Grid container spacing={2} mb={4}>
            {Object.entries(categoryStats).map(([category, count]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <StatCard
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  value={count}
                  total={totalTickets}
                  color="#9C27B0"
                  icon={<TrendingUp />}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Топ причин жалоб */}
      {topReasons.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
            Топ причин жалоб
          </Typography>
          <Grid container spacing={2}>
            {topReasons.map(([reason, count], index) => (
              <Grid item xs={12} sm={6} md={4} key={reason}>
                <StatCard
                  title={reason.length > 20 ? reason.substring(0, 20) + '...' : reason}
                  value={count}
                  total={totalTickets}
                  color={index === 0 ? '#F44336' : index === 1 ? '#FF9800' : index === 2 ? '#d0bcff' : '#4CAF50'}
                  icon={getReasonIcon(reason)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default TicketStats; 