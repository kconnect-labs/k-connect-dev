import React, { useContext, useState } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { LeaderboardUser } from '../../types/leaderboard';

// Импорты компонентов
import {
  LeaderboardHeader,
  UserPositionCard,
  LeaderboardList,
  ScoringInfoCard,
  LeaderboardStats,
  LeaderboardCounter,
} from './components';

// Импорты хуков и утилит
import { useLeaderboard } from './hooks/useLeaderboard';
import { LeaderboardContainer } from './styles/LeaderboardStyles';

const LeaderboardPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(
    null
  );
  const {
    leaderboardData,
    loading,
    error,
    timePeriod,
    userPosition,
    userScore,
    dateRange,
    handleTimePeriodChange,
  } = useLeaderboard();

  const handleCardClick = (user: LeaderboardUser): void => {
    // Обработка клика по карточке пользователя
    console.log('Clicked on user:', user.name);
  };

  return (
    <LeaderboardContainer maxWidth='lg'>
      <LeaderboardHeader
        timePeriod={timePeriod}
        onTimePeriodChange={handleTimePeriodChange}
      />

      {user && userPosition && (
        <UserPositionCard position={userPosition} score={userScore || 0} />
      )}

      {loading ? (
        <Box display='flex' justifyContent='center' p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Typography>{error}</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            width: '100%',
          }}
        >
          {/* Центральная панель - список лидеров */}
          <Box
            sx={{
              flex: 1,
            }}
          >
            <LeaderboardList
              leaderboardData={leaderboardData}
              onCardClick={handleCardClick}
              onUserHover={setSelectedUser}
            />
          </Box>

          {/* Правая панель - статистика (только на десктопе) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <LeaderboardStats
              leaderboardData={leaderboardData}
              selectedUser={selectedUser}
            />
          </Box>
        </Box>
      )}

      <ScoringInfoCard />
    </LeaderboardContainer>
  );
};

export default LeaderboardPage;
