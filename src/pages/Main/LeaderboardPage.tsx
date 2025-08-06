import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import { LeaderboardUserCard } from '../../components/Leaderboard';
import { 
  LeaderboardUser, 
  LeaderboardResponse, 
  TimePeriod, 
  DateRange 
} from '../../types/leaderboard';

const API_URL = '';

const LeaderboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  marginBottom: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingLeft: '0 !important',
  paddingRight: '0 !important',

  [theme.breakpoints.down('sm')]: {
    alignItems: 'center',
  },
}));

const LeaderboardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'center',
    textAlign: 'center',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
  marginBottom: theme.spacing(1),
  width: '100%',
  maxWidth: 750,
  minWidth: 320,
  position: 'relative',
  zIndex: 2,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'none',
  marginTop: theme.spacing(4),
  width: '100%',
  maxWidth: 750,
  minWidth: 320,
  zIndex: 2,
}));

const LeaderboardList = styled('div')(({ theme }) => ({
  width: '100%',
  padding: 0,
  maxWidth: 750,
  minWidth: 320,
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
  },
}));

// Функция для сокращения чисел
const formatCompactNumber = (number: number): string => {
  if (number < 1000) {
    return number.toString();
  }
  const units = ['', 'K', 'M', 'B'];
  const order = Math.floor(Math.log10(Math.abs(number)) / 3);
  const unitName = units[order];
  const value = (number / Math.pow(1000, order)).toFixed(1);
  return value.replace('.0', '') + unitName;
};

const LeaderboardPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchLeaderboard = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await axios.get<LeaderboardResponse>(
          `${API_URL}/api/leaderboard?period=${timePeriod}`
        );
        if (response.data.success) {
          setLeaderboardData(response.data.leaderboard);
          setUserPosition(response.data.current_user.position);
          setUserScore(response.data.current_user.score);

          if (response.data.date_range) {
            setDateRange(response.data.date_range);
          } else {
            setDateRange(null);
          }
        } else {
          setError('Не удалось загрузить данные лидерборда');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(`Ошибка: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timePeriod]);

  const handleTimePeriodChange = (event: React.SyntheticEvent, newValue: TimePeriod): void => {
    setTimePeriod(newValue);
  };

  const handleCardClick = (user: LeaderboardUser): void => {
    // Обработка клика по карточке пользователя
    console.log('Clicked on user:', user.name);
  };

  return (
    <LeaderboardContainer maxWidth='md'>
      <LeaderboardHeader>
        <Box
          className="theme-aware"
          sx={{
            width: '100%',
            maxWidth: 750,
            minWidth: 320,
            mx: 'auto',
            mb: 1,
            p: { xs: 2, md: 3 },
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          <Typography
            variant='h5'
            sx={{ fontWeight: 700, mb: 1, color: 'white' }}
          >
            Рейтинг ТОП лидеров
          </Typography>
          <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.7)' }}>
            20 пользователей, получивших наибольшее количество очков сообщества
            K-Коннект за совокупность активности: созданных постов и историй,
            полученных лайков, комментариев, ответов, репостов, просмотров и
            реакций на истории.
          </Typography>
        </Box>

        <StyledPaper>
          <Tabs
            value={timePeriod}
            onChange={handleTimePeriodChange}
            variant='fullWidth'
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: 'transparent',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 0,
                minHeight: 48,
                transition: 'color 0.2s',
                '&.Mui-selected': {
                  color: '#D0BCFF',
                  backgroundColor: 'transparent',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#D0BCFF',
                height: 3,
                borderRadius: '3px',
                transition: 'all 0.2s',
              },
              minHeight: 48,
            }}
          >
            <Tab label='Неделя' value='week' />
            <Tab label='Месяц' value='month' />
            <Tab label='Всё время' value='all_time' />
          </Tabs>
        </StyledPaper>

        {user && userPosition && (
          <Box
            className="theme-aware"
            sx={{
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#D0BCFF',
              fontWeight: 700,
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: 750,
              minWidth: 320,
              mb: 1,
              boxShadow: 'none',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <Box display='flex' alignItems='center'>
              <MilitaryTechIcon
                sx={{ mr: 1, fontSize: 28, color: '#D0BCFF' }}
              />
              <Typography
                variant='h6'
                sx={{ color: '#D0BCFF', fontWeight: 700 }}
              >
                Ваше место: {userPosition}
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{ color: '#D0BCFF', fontWeight: 700, fontSize: '1.1rem' }}
              >
                {userScore ? formatCompactNumber(userScore) : 0} очков
              </Typography>
            </Box>
          </Box>
        )}
      </LeaderboardHeader>

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
        <LeaderboardList>
          {leaderboardData.map((user, index) => (
            <LeaderboardUserCard
              key={user.id}
              user={user}
              position={index + 1}
              index={index}
              onCardClick={handleCardClick}
            />
          ))}
        </LeaderboardList>
      )}

      <StyledCard>
        <CardContent sx={{ position: 'relative', zIndex: 2 }}>
          <Box display='flex' alignItems='center' mb={2}>
            <InfoIcon color='primary' sx={{ mr: 1 }} />
            <Typography variant='h6'>Как начисляются очки?</Typography>
          </Box>
          <Typography variant='body2' paragraph>
            Очки начисляются за активность в социальной сети:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box>
              <Typography variant='subtitle2'>
                • Создание поста: 5 очков
              </Typography>
              <Typography variant='subtitle2'>
                • Лайк на ваш пост: 1 очков
              </Typography>
              <Typography variant='subtitle2'>
                • Написание комментария: 5 очков
              </Typography>
              <Typography variant='subtitle2'>
                • Лайк на ваш комментарий: 1 очков
              </Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2'>
                • Ответ на комментарий: 3 очков
              </Typography>
              <Typography variant='subtitle2'>
                • Лайк на ваш ответ: 1 очков
              </Typography>
              <Typography variant='subtitle2'>• Репост: 4 очков</Typography>
            </Box>
          </Box>
          <Typography variant='body2' sx={{ mt: 2 }}>
            Очки обновляются раз в час. Если вы удалите пост или комментарий,
            или кто-то уберет лайк, соответствующие очки будут вычтены из вашего
            счета.
          </Typography>

          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'rgba(208, 188, 255, 0.05)',
              borderRadius: 2,
              border: '1px solid rgba(208, 188, 255, 0.1)',
            }}
          >
            <Typography
              variant='subtitle2'
              color='primary.light'
              fontWeight='medium'
              gutterBottom
            >
              Периоды расчета очков:
            </Typography>
            <Typography variant='body2'>
              • <strong>Неделя:</strong> с понедельника 00:00 до воскресенья
              19:00
            </Typography>
            <Typography variant='body2'>
              • <strong>Месяц:</strong> с 1-го числа 00:00 до последнего дня
              месяца 23:59
            </Typography>
            <Typography variant='body2'>
              • <strong>Всё время:</strong> полная история активности
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    </LeaderboardContainer>
  );
};

export default LeaderboardPage; 