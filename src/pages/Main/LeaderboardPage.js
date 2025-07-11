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
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import axios from 'axios';
import { LeaderboardUserCard } from '../../components/Leaderboard';


const API_URL = '';

const LeaderboardContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const LeaderboardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
}));

// Функция для сокращения чисел
const formatCompactNumber = (number) => {
  if (number < 1000) {
    return number.toString();
  }
  const units = ['', 'K', 'M', 'B'];
  const order = Math.floor(Math.log10(Math.abs(number)) / 3);
  const unitName = units[order];
  const value = (number / Math.pow(1000, order)).toFixed(1);
  return value.replace('.0', '') + unitName;
};

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('week');
  const [userPosition, setUserPosition] = useState(null);
  const [userScore, setUserScore] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/leaderboard?period=${timePeriod}`);
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
        setError(`Ошибка: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timePeriod]);

  const handleTimePeriodChange = (event, newValue) => {
    setTimePeriod(newValue);
  };

  const handleCardClick = (user) => {
    // Обработка клика по карточке пользователя
    console.log('Clicked on user:', user.name);
  };

  return (
    <LeaderboardContainer maxWidth="md">
      <LeaderboardHeader>
        <Box
          sx={{
            width: '100%',
            maxWidth: 750,
            minWidth: 320,
            mx: 'auto',
            mb: 1,
            p: { xs: 2, md: 3 },
            background: '#1c1c1c',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden',
            '::before': {
              content: '""',
              position: 'absolute',
              left: -80,
              top: '50%',
              transform: 'translateY(-50%) rotate(-12deg)',
              width: 180,
              height: 220,
              background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
              opacity: 0.25,
              filter: 'blur(18px)',
              borderRadius: '50%',
              zIndex: 1,
              pointerEvents: 'none',
            },
            '::after': {
              content: '""',
              position: 'absolute',
              right: -80,
              top: '50%',
              transform: 'translateY(-50%) rotate(12deg)',
              width: 180,
              height: 220,
              background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
              opacity: 0.25,
              filter: 'blur(18px)',
              borderRadius: '50%',
              zIndex: 1,
              pointerEvents: 'none',
            },
            zIndex: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'white' }}>
            Рейтинг ТОП лидеров
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            20 пользователей, получивших наибольшее количество очков сообщества K-Коннект за совокупность активности: созданных постов и историй, полученных лайков, комментариев, ответов, репостов, просмотров и реакций на истории.
          </Typography>
        </Box>

        <Paper sx={{
          borderRadius: '16px',
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#1E1E1E' : theme.palette.background.paper,
          backgroundImage: 'unset',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          mb: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: 750,
          minWidth: 320,
          mx: 'auto',
          position: 'relative',
          '::before': {
            content: '""',
            position: 'absolute',
            left: -80,
            top: '50%',
            transform: 'translateY(-50%) rotate(-12deg)',
            width: 180,
            height: 220,
            background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
            opacity: 0.25,
            filter: 'blur(18px)',
            borderRadius: '50%',
            zIndex: 1,
            pointerEvents: 'none',
          },
          '::after': {
            content: '""',
            position: 'absolute',
            right: -80,
            top: '50%',
            transform: 'translateY(-50%) rotate(12deg)',
            width: 180,
            height: 220,
            background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
            opacity: 0.25,
            filter: 'blur(18px)',
            borderRadius: '50%',
            zIndex: 1,
            pointerEvents: 'none',
          },
          zIndex: 2,
        }}>
          <Tabs 
            value={timePeriod} 
            onChange={handleTimePeriodChange}
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': {
                color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                backgroundColor: '#1c1c1c',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 0,
                minHeight: 48,
                transition: 'color 0.2s',
                '&.Mui-selected': {
                  color: theme => theme.palette.primary.main,
                  backgroundColor: '#1c1c1c',
                }
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
            <Tab label="Неделя" value="week" />
            <Tab label="Месяц" value="month" />
            <Tab label="Всё время" value="all_time" />
          </Tabs>
        </Paper>

        {user && userPosition && (
          <Box
            sx={{ 
              borderRadius: '16px',
              background: '#1c1c1c',
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
              '::before': {
                content: '""',
                position: 'absolute',
                left: -80,
                top: '50%',
                transform: 'translateY(-50%) rotate(-12deg)',
                width: 180,
                height: 220,
                background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
                opacity: 0.25,
                filter: 'blur(18px)',
                borderRadius: '50%',
                zIndex: 1,
                pointerEvents: 'none',
              },
              '::after': {
                content: '""',
                position: 'absolute',
                right: -80,
                top: '50%',
                transform: 'translateY(-50%) rotate(12deg)',
                width: 180,
                height: 220,
                background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
                opacity: 0.25,
                filter: 'blur(18px)',
                borderRadius: '50%',
                zIndex: 1,
                pointerEvents: 'none',
              },
              zIndex: 2,
            }}
          >
            <Box display="flex" alignItems="center">
              <MilitaryTechIcon sx={{ mr: 1, fontSize: 28, color: '#D0BCFF' }} />
              <Typography variant="h6" sx={{ color: '#D0BCFF', fontWeight: 700 }}>
                Ваше место: {userPosition}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ color: '#D0BCFF', fontWeight: 700, fontSize: '1.1rem' }}>
                {formatCompactNumber(userScore)} очков
              </Typography>
            </Box>
          </Box>
        )}
      </LeaderboardHeader>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      ) : (
        <div className="leaderboard-list" style={{ 
          width: '100%', 
          padding: 0, 
          maxWidth: 750, 
          minWidth: 320, 
          margin: '0 auto' 
        }}>
          {leaderboardData.map((user, index) => (
            <LeaderboardUserCard
              key={user.id}
              user={user}
              position={index + 1}
              index={index}
              onCardClick={() => handleCardClick(user)}
            />
          ))}
        </div>
      )}

      <Card 
        sx={{
          background: '#1c1c1c',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'none',
          mt: 4,
          '::before': {
            content: '""',
            position: 'absolute',
            left: -80,
            top: '50%',
            transform: 'translateY(-50%) rotate(-12deg)',
            width: 180,
            height: 220,
            background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
            opacity: 0.25,
            filter: 'blur(18px)',
            borderRadius: '50%',
            zIndex: 1,
            pointerEvents: 'none',
          },
          '::after': {
            content: '""',
            position: 'absolute',
            right: -80,
            top: '50%',
            transform: 'translateY(-50%) rotate(12deg)',
            width: 180,
            height: 220,
            background: 'linear-gradient(13.89deg, #B69DF8 47.02%, #D0BCFF 97.69%)',
            opacity: 0.25,
            filter: 'blur(18px)',
            borderRadius: '50%',
            zIndex: 1,
            pointerEvents: 'none',
          },
          zIndex: 2,
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 2 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <InfoIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Как начисляются очки?</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Очки начисляются за активность в социальной сети:
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2 
            }}
          >
            <Box>
              <Typography variant="subtitle2">• Создание поста: 5 очков</Typography>
              <Typography variant="subtitle2">• Лайк на ваш пост: 1 очков</Typography>
              <Typography variant="subtitle2">• Написание комментария: 5 очков</Typography>
              <Typography variant="subtitle2">• Лайк на ваш комментарий: 1 очков</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">• Ответ на комментарий: 3 очков</Typography>
              <Typography variant="subtitle2">• Лайк на ваш ответ: 1 очков</Typography>
              <Typography variant="subtitle2">• Репост: 4 очков</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Очки обновляются раз в час. Если вы удалите пост или комментарий, или кто-то уберет лайк, соответствующие очки будут вычтены из вашего счета.
          </Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(208, 188, 255, 0.05)', borderRadius: 2, border: '1px solid rgba(208, 188, 255, 0.1)' }}>
            <Typography variant="subtitle2" color="primary.light" fontWeight="medium" gutterBottom>
              Периоды расчета очков:
            </Typography>
            <Typography variant="body2">
              • <strong>Неделя:</strong> с понедельника 00:00 до воскресенья 19:00
            </Typography>
            <Typography variant="body2">
              • <strong>Месяц:</strong> с 1-го числа 00:00 до последнего дня месяца 23:59
            </Typography>
            <Typography variant="body2">
              • <strong>Всё время:</strong> полная история активности
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </LeaderboardContainer>
  );
};

export default LeaderboardPage; 