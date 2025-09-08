import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import DiamondIcon from '@mui/icons-material/Diamond';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyIcon from '@mui/icons-material/Key';
import { MaxIcon } from '../../components/icons/CustomIcons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SubscriptionCard = styled(Paper)(({ theme, type }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '18px',
  transition: 'all 0.3s ease',
  backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: '#D0BCFF',
    boxShadow: '0 8px 25px rgba(208, 188, 255, 0.15)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: '#D0BCFF',
    zIndex: 1,
  },
}));

const PriceText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.75rem',
  color: '#D0BCFF',
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const FeatureIcon = styled(CheckIcon)(({ theme }) => ({
  color: '#D0BCFF',
  fontSize: '0.9rem',
}));

const PopularBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.5),
  right: theme.spacing(1.5),
  backgroundColor: '#D0BCFF',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '0.7rem',
  borderRadius: '16px',
  zIndex: 5,
  height: '24px',
}));

const SubPlanes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const statusResponse = await axios.get('/api/user/subscription/status');
        if (statusResponse.data.active) {
          setUserSubscription({
            type: statusResponse.data.subscription_type?.toLowerCase()?.trim(),
            expires_at: statusResponse.data.expiration_date,
            features: statusResponse.data.features || [],
          });
        } else {
          setUserSubscription(null);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных о подписках:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigateToBalance = () => {
    navigate('/balance');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const subscriptionPrices = {
    premium: '99₽',
    ultimate: '199₽',
    max: '399₽',
  };

  const subscriptionDescriptions = {
    premium: 'Расширенный функционал',
    ultimate: 'Максимальные возможности',
    max: 'Эксклюзивные возможности',
  };

  const subscriptionFeatures = {
    premium: [
      '8 бейджиков',
      '8 никнеймов',
      'Приоритетная поддержка',
      'Установка статуса',
      'Цвет профиля',
      '3 предмета на профиле',
      'X4 к баллам активности',
    ],
    ultimate: [
      'Все преимущества Premium',
      'Неограниченные никнеймы',
      'Неограниченные бейджики',
      'Анимированные бейджики',
      'Любой цвет профиля',
      'Ультима чат',
      'Ультима Канал',
      'Новый вид профиля',
      'Кастомные Темы',
      'Обои в профиле',
      'X8 к баллам активности',
    ],
    max: [
      'Все преимущества Ultimate',
      '🔥 Эксклюзивный MAX значок',
      '🔒 Доступ к закрытым функциям',
      '∞ Максимальные лимиты на все',
      '🚀 Ранний доступ к новым функциям',
      '✨ Специальные анимации профиля',
      '🎨 Неограниченные возможности кастомизации',
      '🔑 Безлимитное обращение к API',
      '💬 Консультации с разработчиками',
      '🎁 150,000 баллов в подарок',
      'X12 к баллам активности',
    ],
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='50vh'
      >
        <CircularProgress sx={{ color: '#D0BCFF' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4, mb: 10 }}>
      {/* Активная подписка */}
      {userSubscription && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: '18px',
            backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: '#D0BCFF',
              borderRadius: 'var(--main-border-radius) !important var(--main-border-radius) !important 0 0',
            },
          }}
        >
          <Box display='flex' alignItems='center' flexWrap='wrap' gap={2}>
            <DiamondIcon sx={{ color: '#D0BCFF', fontSize: 28 }} />
            <Box>
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#D0BCFF' }}
              >
                {userSubscription.type === 'premium'
                  ? 'Premium'
                  : userSubscription.type === 'ultimate'
                    ? 'Ultimate'
                    : userSubscription.type === 'max'
                      ? 'MAX'
                      : 'Подписка'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Активна до: {formatDate(userSubscription.expires_at)}
              </Typography>
            </Box>
            <Chip
              label='Активна'
              sx={{
                ml: 'auto',
                backgroundColor: '#D0BCFF',
                color: '#fff',
                fontWeight: 'bold',
              }}
            />
          </Box>
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Typography
            variant='subtitle2'
            gutterBottom
            sx={{ color: '#D0BCFF', fontWeight: 600 }}
          >
            Ваши преимущества:
          </Typography>
          <Grid container spacing={2}>
            {subscriptionFeatures[userSubscription.type]?.map(
              (feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box display='flex' alignItems='center' gap={1}>
                    <FeatureIcon />
                    <Typography variant='body2'>{feature}</Typography>
                  </Box>
                </Grid>
              )
            )}
          </Grid>
        </Paper>
      )}

      {/* Планы подписок */}
      <Box mt={4}>
        <Typography
          variant='h4'
          gutterBottom
          align='center'
          sx={{ fontWeight: 600, mb: 1 }}
        >
          Планы подписок
        </Typography>
        <Typography
          variant='body1'
          align='center'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Выберите подходящий план для расширения возможностей
        </Typography>

        <Grid container spacing={3} justifyContent='center'>
          {/* Premium */}
          <Grid item xs={12} sm={6} md={4}>
            <SubscriptionCard type='premium'>
              <Box
                sx={{
                  p: 2.5,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  pt: 4,
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography
                    variant='h5'
                    component='h2'
                    fontWeight='bold'
                    gutterBottom
                  >
                    Premium
                  </Typography>
                  <PriceText>{subscriptionPrices.premium}</PriceText>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: '0.85rem' }}
                  >
                    {subscriptionDescriptions.premium}
                  </Typography>
                </Box>
                <Divider
                  sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Box sx={{ flexGrow: 1, mb: 3 }}>
                  <Grid container spacing={1}>
                    {subscriptionFeatures.premium.map((feature, index) => (
                      <Grid item xs={12} key={index}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <FeatureIcon sx={{ mr: 1.5, flexShrink: 0 }} />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: '0.85rem' }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={handleNavigateToBalance}
                  sx={{
                    borderRadius: '18px',
                    textTransform: 'none',
                    py: 1.2,
                    borderColor: '#D0BCFF',
                    color: '#D0BCFF',
                    '&:hover': {
                      borderColor: '#D0BCFF',
                      backgroundColor: 'var(--theme-background, rgba(208, 188, 255, 0.1))',
                    },
                  }}
                >
                  Поддержать
                </Button>
              </Box>
            </SubscriptionCard>
          </Grid>

          {/* Ultimate */}
          <Grid item xs={12} sm={6} md={4}>
            <SubscriptionCard type='ultimate'>
              <PopularBadge label='Популярный' />
              <Box
                sx={{
                  p: 2.5,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  pt: 4,
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography
                    variant='h5'
                    component='h2'
                    fontWeight='bold'
                    gutterBottom
                  >
                    Ultimate
                  </Typography>
                  <PriceText>{subscriptionPrices.ultimate}</PriceText>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: '0.85rem' }}
                  >
                    {subscriptionDescriptions.ultimate}
                  </Typography>
                </Box>
                <Divider
                  sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Box sx={{ flexGrow: 1, mb: 3 }}>
                  <Grid container spacing={1}>
                    {subscriptionFeatures.ultimate.map((feature, index) => (
                      <Grid item xs={12} key={index}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <FeatureIcon sx={{ mr: 1.5, flexShrink: 0 }} />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: '0.85rem' }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleNavigateToBalance}
                  sx={{
                    borderRadius: '18px',
                    textTransform: 'none',
                    py: 1.2,
                    backgroundColor: '#D0BCFF',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#C0A8F0',
                    },
                  }}
                >
                  Поддержать
                </Button>
              </Box>
            </SubscriptionCard>
          </Grid>

          {/* MAX */}
          <Grid item xs={12} sm={12} md={4}>
            <SubscriptionCard 
              type='max' 
              sx={{
                '&::before': {
                  background: '#FF4D50',
                },
                '&:hover': {
                  borderColor: '#FF4D50',
                  boxShadow: '0 8px 25px rgba(255, 77, 80, 0.2)',
                },
              }}
            >
              <PopularBadge 
                label='Эксклюзив' 
                sx={{
                  backgroundColor: '#FF4D50',
                  color: '#fff',
                }}
              />
              <Box
                sx={{
                  p: 2.5,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  pt: 4,
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <MaxIcon size={32} color="#FF4D50" />
                    <Typography
                      variant='h5'
                      component='h2'
                      fontWeight='bold'
                      sx={{ ml: 1, color: '#FF4D50' }}
                    >
                      MAX
                    </Typography>
                  </Box>
                  <PriceText sx={{ color: '#FF4D50' }}>{subscriptionPrices.max}</PriceText>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: '0.85rem' }}
                  >
                    {subscriptionDescriptions.max}
                  </Typography>
                </Box>
                <Divider
                  sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Box sx={{ flexGrow: 1, mb: 3 }}>
                  <Grid container spacing={1}>
                    {subscriptionFeatures.max.map((feature, index) => (
                      <Grid item xs={12} key={index}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <FeatureIcon sx={{ mr: 1.5, flexShrink: 0, color: '#FF4D50' }} />
                          <Typography
                            variant='body2'
                            sx={{ fontSize: '0.85rem' }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleNavigateToBalance}
                  sx={{
                    borderRadius: '18px',
                    textTransform: 'none',
                    py: 1.2,
                    backgroundColor: '#FF4D50',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#E63946',
                    },
                  }}
                >
                  Поддержать
                </Button>
              </Box>
            </SubscriptionCard>
          </Grid>
        </Grid>
      </Box>

      {/* Информационный блок */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: '18px',
          backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: '#D0BCFF',
            borderRadius: 'var(--main-border-radius) !important var(--main-border-radius) !important 0 0',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <KeyIcon sx={{ color: '#D0BCFF', fontSize: 24 }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Как активировать ключ на подписку?
          </Typography>
        </Box>
        <Typography variant='body2' color='text.secondary' paragraph>
          Перейдите в баланс и нажмите пополнить - вставьте ключ и активируйте.
        </Typography>
        <Button
          variant='contained'
          startIcon={<AccountBalanceWalletIcon />}
          onClick={handleNavigateToBalance}
          sx={{
            borderRadius: '18px',
            textTransform: 'none',
            py: 1.2,
            px: 3,
            backgroundColor: '#D0BCFF',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#C0A8F0',
            },
          }}
        >
          Перейти к балансу
        </Button>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          elevation={6}
          variant='filled'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SubPlanes;
