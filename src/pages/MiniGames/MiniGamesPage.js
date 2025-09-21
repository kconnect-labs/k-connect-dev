import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  useMediaQuery,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CasinoIcon from '@mui/icons-material/Casino';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import GridOnIcon from '@mui/icons-material/GridOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SEO from '../../components/SEO';

const PageHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  padding: theme.spacing(4, 2),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: 8,
  border: '1px solid rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
}));

const GameCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: 8,
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const BalanceCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: 8,
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  marginBottom: theme.spacing(1),
  position: 'relative',
  overflow: 'hidden',
}));

const PlayButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 3),
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
  marginTop: theme.spacing(4),
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: theme.spacing(2),
  height: '100%',
  minHeight: 120,
}));

const LeaderboardItem = styled(ListItem)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.04)',
  borderRadius: 12,
  marginBottom: theme.spacing(1.5),
  border: '1px solid rgba(255, 255, 255, 0.08)',
  '&:first-of-type': {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
  },
  '&:nth-of-type(2)': {
    background: 'rgba(192, 192, 192, 0.08)',
    border: '1px solid rgba(192, 192, 192, 0.15)',
  },
  '&:nth-of-type(3)': {
    background: 'rgba(205, 127, 50, 0.08)',
    border: '1px solid rgba(205, 127, 50, 0.15)',
  },
}));

const MiniGamesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [userBalance, setUserBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/points');
        if (response?.data?.points !== undefined) {
          setUserBalance(parseInt(response.data.points));
        }
      } catch (error) {
        console.error('Ошибка при получении баланса:', error);
        toast.error('Не удалось загрузить баланс');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const [statsResponse, leaderboardResponse] = await Promise.all([
          axios.get('/api/minigame-stats/stats'),
          axios.get('/api/minigame-stats/leaderboard')
        ]);
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }
        
        if (leaderboardResponse.data.success) {
          setLeaderboard(leaderboardResponse.data.leaderboard);
        }
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        // Не показываем ошибку пользователю, так как это не критично
      } finally {
        setStatsLoading(false);
      }
    };

    fetchBalance();
    fetchStats();
  }, []);

  const formatNumber = num => {
    return parseInt(num).toLocaleString();
  };

  const games = [
    {
      id: 'cups',
      name: 'Три чаши',
      description: 'Угадайте, под какой чашей находится шарик!',
      icon: <LocalCafeIcon sx={{ fontSize: 40 }} />,
      color: '#e91e63',
      path: '/minigames/cups',
      available: true,
    },
    // {
    //   id: 'roulette',
    //   name: 'Рулетка',
    //   description: 'Крутите рулетку и выигрывайте!',
    //   icon: <CasinoIcon sx={{ fontSize: 40 }} />,
    //   color: '#ff9800',
    //   path: '/minigames/roulette',
    //   available: true
    // },
    {
      id: 'clicker',
      name: 'Кликер',
      description: 'Кликайте, чтобы зарабатывать баллы!',
      icon: <TouchAppIcon sx={{ fontSize: 40 }} />,
      color: '#3f51b5',
      path: '/minigames/clicker',
      available: false,
      seasonEnded: true,
    },
    {
      id: 'blackjack',
      name: '21',
      description: 'Наберите 21 очко или больше чем у дилера, не перебрав!',
      icon: <CasinoIcon sx={{ fontSize: 40 }} />,
      color: '#3f51b5',
      path: '/minigames/blackjack',
      available: true,
    },
    {
      id: 'pixel-miner',
      name: 'Pixel Miner',
      description: 'Откройте блоки с золотом, избегая бомб! Забирайте выигрыш в любой момент.',
      icon: <GridOnIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      path: '/minigames/pixel-miner',
      available: true,
    },
  ];

  const handleGameClick = path => {
    if (path) navigate(path);
  };

  const checkAPIandNavigate = async game => {
    if (!game.available || !game.path) return;

    try {
      setLoading(true);
      navigate(game.path);
    } catch (error) {
      console.error(`Ошибка при переходе к ${game.name}:`, error);
      navigate(game.path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth='lg'
      sx={{
        mt: { xs: 1, sm: 2 },
        mb: { xs: 10, sm: 10 },
        px: { xs: 1, sm: 2 },
        pb: { xs: '80px', sm: 0 },
      }}
    >
      <SEO
        title='Мини-игры'
        description='Играйте в увлекательные мини-игры и зарабатывайте баллы!'
      />

      <PageHeader>
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          sx={{ fontWeight: 'bold', position: 'relative', zIndex: 1 }}
        >
          Мини-игры
        </Typography>
        <Typography
          variant='subtitle1'
          color='text.secondary'
          sx={{ position: 'relative', zIndex: 1 }}
        >
          Играйте и зарабатывайте баллы в наших увлекательных мини-играх!
        </Typography>
      </PageHeader>

      <BalanceCard>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <CreditCardIcon sx={{ fontSize: 40, color: 'primary.light' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' color='text.secondary'>
              Ваш баланс
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
              {loading ? (
                <CircularProgress size={20} />
              ) : userBalance !== null ? (
                `${formatNumber(userBalance)} баллов`
              ) : (
                'Загрузка...'
              )}
            </Typography>
          </Box>
          <Button
            variant='contained'
            color='primary'
            onClick={() => navigate('/balance')}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              minWidth: 120,
            }}
          >
            Пополнить
          </Button>
        </Box>
      </BalanceCard>

      <Grid container spacing={3}>
        {games.map(game => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <GameCard>
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 'var(--main-border-radius)',
                      bgcolor: alpha(game.color, 0.1),
                      color: game.color,
                      display: 'flex',
                    }}
                  >
                    {game.icon}
                  </Box>
                  <Box>
                    <Typography variant='h6' gutterBottom sx={{ mb: 0 }}>
                      {game.name}
                    </Typography>
                    {!game.available && (
                      <Chip
                        label={game.seasonEnded ? 'Сезон закончился' : 'Скоро'}
                        size='small'
                        color={game.seasonEnded ? 'error' : 'secondary'}
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>

                <Typography
                  variant='body2'
                  color='text.secondary'
                  paragraph
                  sx={{ flexGrow: 1 }}
                >
                  {game.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <PlayButton
                    variant='contained'
                    fullWidth
                    disabled={!game.available}
                    onClick={() => checkAPIandNavigate(game)}
                    sx={{
                      opacity: game.seasonEnded ? 0.6 : 1,
                    }}
                  >
                    {game.seasonEnded
                      ? 'Сезон закончился'
                      : game.available
                        ? 'Играть'
                        : 'Скоро'}
                  </PlayButton>

                  {game.available && !game.seasonEnded && false && (
                    <Button
                      variant='outlined'
                      onClick={() => handleGameClick(game.path)}
                    >
                      Инфо
                    </Button>
                  )}
                </Box>
              </CardContent>
            </GameCard>
          </Grid>
        ))}
      </Grid>

      {/* Блок статистики */}
      <StatsCard>
        <CardContent>
          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Загрузка статистики...
              </Typography>
            </Box>
          ) : stats ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                <EmojiEventsIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Статистика игр
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Общий выигрыш */}
                <Grid item xs={12} sm={6}>
                  <StatItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          background: 'rgba(76, 175, 80, 0.15)',
                          color: '#4caf50',
                          display: 'flex',
                          minWidth: 56,
                          height: 56,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AttachMoneyIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                          Общий выигрыш
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: 'success.main',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {formatNumber(stats.total_winnings)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          баллов
                        </Typography>
                      </Box>
                    </Box>
                  </StatItem>
                </Grid>

                {/* 21 очко */}
                <Grid item xs={12} sm={6}>
                  <StatItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          background: 'rgba(63, 81, 181, 0.15)',
                          color: '#3f51b5',
                          display: 'flex',
                          minWidth: 56,
                          height: 56,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CasinoIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                          21 очко
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#3f51b5',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {formatNumber(stats.blackjack.total_won)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.blackjack.games_played} игр
                        </Typography>
                      </Box>
                    </Box>
                  </StatItem>
                </Grid>

                {/* 3 чаши */}
                <Grid item xs={12} sm={6}>
                  <StatItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          background: 'rgba(233, 30, 99, 0.15)',
                          color: '#e91e63',
                          display: 'flex',
                          minWidth: 56,
                          height: 56,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LocalCafeIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                          3 чаши
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#e91e63',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {formatNumber(stats.cups.total_won)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.cups.games_played} игр
                        </Typography>
                      </Box>
                    </Box>
                  </StatItem>
                </Grid>

                {/* Pixel Miner */}
                <Grid item xs={12} sm={6}>
                  <StatItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          background: 'rgba(255, 152, 0, 0.15)',
                          color: '#ff9800',
                          display: 'flex',
                          minWidth: 56,
                          height: 56,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <GridOnIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                          Pixel Miner
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: '#ff9800',
                            wordBreak: 'break-all',
                            overflowWrap: 'break-word',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}
                        >
                          {formatNumber(stats.pixel_miner.total_won)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stats.pixel_miner.games_played} игр
                        </Typography>
                      </Box>
                    </Box>
                  </StatItem>
                </Grid>
              </Grid>

              {/* Лидерборд */}
              {leaderboard && (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Топ игроки
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                      <Box sx={{ 
                        p: 3, 
                        borderRadius: 'var(--main-border-radius)', 
                        background: 'rgba(76, 175, 80, 0.05)',
                        border: '1px solid rgba(76, 175, 80, 0.15)',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                          <EmojiEventsIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            По выигрышам
                          </Typography>
                        </Box>
                        <List sx={{ p: 0 }}>
                          {leaderboard.top_winners.slice(0, 5).map((player, index) => (
                            <LeaderboardItem key={player.user_id} sx={{ p: 2 }}>
                              <ListItemAvatar>
                                <Avatar
                                  src={player.avatar_url}
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    border: index < 3 ? '2px solid' : '1px solid',
                                    borderColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(255, 255, 255, 0.2)',
                                  }}
                                >
                                  {player.username?.[0]?.toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                      sx={{
                                        minWidth: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: index < 3 ? 'white' : 'text.secondary',
                                        background: index === 0 ? '#ffd700' :
                                                   index === 1 ? '#c0c0c0' :
                                                   index === 2 ? '#cd7f32' :
                                                   'rgba(255, 255, 255, 0.1)',
                                      }}
                                    >
                                      {index + 1}
                                    </Box>
                                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                      {player.name || player.username}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                    {formatNumber(player.total_won)} баллов
                                  </Typography>
                                }
                              />
                            </LeaderboardItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                      <Box sx={{ 
                        p: 3, 
                        borderRadius: 'var(--main-border-radius)', 
                        background: 'rgba(255, 152, 0, 0.05)',
                        border: '1px solid rgba(255, 152, 0, 0.15)',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                          <AttachMoneyIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            По тратам
                          </Typography>
                        </Box>
                        <List sx={{ p: 0 }}>
                          {leaderboard.top_spenders.slice(0, 5).map((player, index) => (
                            <LeaderboardItem key={player.user_id} sx={{ p: 2 }}>
                              <ListItemAvatar>
                                <Avatar
                                  src={player.avatar_url}
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    border: index < 3 ? '2px solid' : '1px solid',
                                    borderColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(255, 255, 255, 0.2)',
                                  }}
                                >
                                  {player.username?.[0]?.toUpperCase()}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                      sx={{
                                        minWidth: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: index < 3 ? 'white' : 'text.secondary',
                                        background: index === 0 ? '#ffd700' :
                                                   index === 1 ? '#c0c0c0' :
                                                   index === 2 ? '#cd7f32' :
                                                   'rgba(255, 255, 255, 0.1)',
                                      }}
                                    >
                                      {index + 1}
                                    </Box>
                                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                      {player.name || player.username}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                                    {formatNumber(player.total_spent)} баллов
                                  </Typography>
                                }
                              />
                            </LeaderboardItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Статистика пока недоступна
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Сыграйте в мини-игры, чтобы увидеть свою статистику
              </Typography>
            </Box>
          )}
        </CardContent>
      </StatsCard>
    </Container>
  );
};

export default MiniGamesPage;
