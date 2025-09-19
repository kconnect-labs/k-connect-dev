import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LeaderboardUser } from '../../../types/leaderboard';
import { formatCompactNumber } from '../utils/formatters';

const CounterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
  maxWidth: 200,
  minWidth: 150,
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    flexDirection: 'row',
    overflowX: 'auto',
    gap: theme.spacing(1),
  },
}));

const CounterCard = styled(Paper)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  borderRadius: '18px',
  padding: theme.spacing(1.5),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'none',
  zIndex: 2,
  minHeight: 60,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    minWidth: 120,
    flexShrink: 0,
  },
}));

interface LeaderboardCounterProps {
  leaderboardData: LeaderboardUser[];
  userPosition?: number;
  userScore?: number;
}

export const LeaderboardCounter: React.FC<LeaderboardCounterProps> = ({
  leaderboardData,
  userPosition,
  userScore,
}) => {
  // Вычисляем статистику
  const totalUsers = leaderboardData.length;
  const averageScore = totalUsers > 0 ? Math.round(leaderboardData.reduce((sum, user) => sum + user.score, 0) / totalUsers) : 0;
  const maxScore = Math.max(...leaderboardData.map(user => user.score));
  const minScore = Math.min(...leaderboardData.map(user => user.score));

  return (
    <CounterContainer>
      <CounterCard>
        <Typography variant="h4" sx={{ color: '#D0BCFF', fontWeight: 700 }}>
          {totalUsers}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          участников
        </Typography>
      </CounterCard>

      <CounterCard>
        <Typography variant="h4" sx={{ color: '#D0BCFF', fontWeight: 700 }}>
          {formatCompactNumber(averageScore)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          средний балл
        </Typography>
      </CounterCard>

      <CounterCard>
        <Typography variant="h4" sx={{ color: '#D0BCFF', fontWeight: 700 }}>
          {formatCompactNumber(maxScore)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          максимальный
        </Typography>
      </CounterCard>

      {userPosition && (
        <CounterCard sx={{ 
          background: 'linear-gradient(135deg, rgba(208, 188, 255, 0.2) 0%, rgba(208, 188, 255, 0.1) 100%)',
          border: '1px solid rgba(208, 188, 255, 0.3)',
        }}>
          <Typography variant="h4" sx={{ color: '#D0BCFF', fontWeight: 700 }}>
            {userPosition}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            ваше место
          </Typography>
          {userScore && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              {formatCompactNumber(userScore)} очков
            </Typography>
          )}
        </CounterCard>
      )}
    </CounterContainer>
  );
};
