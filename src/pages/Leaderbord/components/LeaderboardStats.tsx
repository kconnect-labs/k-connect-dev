import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LeaderboardUser } from '../../../types/leaderboard';
import { formatCompactNumber } from '../utils/formatters';

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  width: '100%',
  maxWidth: 320,
  minWidth: 280,
  position: 'sticky',
  top: '54px',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const UserStatCard = styled(Paper)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  borderRadius: 'var(--main-border-radius)',
  padding: theme.spacing(2),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'none',
  zIndex: 2,
  minHeight: 120,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  [theme.breakpoints.down('md')]: {
    minWidth: 250,
    flexShrink: 0,
  },
}));

interface LeaderboardStatsProps {
  leaderboardData: LeaderboardUser[];
  selectedUser?: LeaderboardUser | null;
}

export const LeaderboardStats: React.FC<LeaderboardStatsProps> = ({
  leaderboardData,
  selectedUser,
}) => {
  const [hoveredUser, setHoveredUser] = useState<LeaderboardUser | null>(null);
  
  const displayUser = selectedUser || hoveredUser || leaderboardData[0];

  if (!displayUser) {
    return (
      <StatsContainer>
        <UserStatCard>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Наведите на пользователя для просмотра статистики
          </Typography>
        </UserStatCard>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <UserStatCard>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar
            src={displayUser.avatar_url || 'https://s3.k-connect.ru/static/uploads/system/avatar.png'}
            alt={displayUser.name}
            sx={{
              width: 48,
              height: 48,
              border: '2px solid rgba(255, 255, 255, 0.2)',
            }}
          />
          <Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              {displayUser.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              @{displayUser.username}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Очки:
            </Typography>
            <Typography variant="h6" sx={{ color: '#D0BCFF', fontWeight: 700 }}>
              {formatCompactNumber(displayUser.score)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Посты:
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {formatCompactNumber(displayUser.stats?.posts_count || 0)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Подписчики:
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {formatCompactNumber(displayUser.stats?.followers_count || 0)}
            </Typography>
          </Box>


          {displayUser.verification && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Статус:
              </Typography>
              <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                {displayUser.verification.status === 1 ? 'Верифицирован' : 
                 displayUser.verification.status === 2 ? 'Официальный аккаунт' :
                 displayUser.verification.status === 3 ? 'VIP' :
                 displayUser.verification.status === 4 ? 'Модератор' :
                 displayUser.verification.status === 5 ? 'Админ' : 'Обычный'}
              </Typography>
            </Box>
          )}
        </Box>
      </UserStatCard>
    </StatsContainer>
  );
};
