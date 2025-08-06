import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  alpha,
  useTheme,
  Link,
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  Shield as ShieldIcon,
  ShoppingBag as ShoppingBagIcon,
  Storefront as StorefrontIcon,
  Check as CheckIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface BadgesFormProps {
  onSuccess?: () => void;
}

interface Achievement {
  id: number;
  name: string;
  bage?: string;
  image_path: string;
  is_active: boolean;
}

const BadgesForm: React.FC<BadgesFormProps> = ({ onSuccess }) => {
  const theme = useTheme();
  const [userAchievements, setUserAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [updatingActiveBadge, setUpdatingActiveBadge] = useState(false);

  // Загрузка достижений пользователя
  const fetchUserAchievements = async () => {
    try {
      setLoadingAchievements(true);
      const response = await axios.get('/api/profile/achievements');

      if (response.data && response.data.achievements) {
        setUserAchievements(response.data.achievements);
      }

      setLoadingAchievements(false);
    } catch (error) {
      console.error('Ошибка загрузки достижений:', error);
      setLoadingAchievements(false);
    }
  };

  // Установка активного бейджа
  const handleSetActiveBadge = async (achievementId: number) => {
    try {
      setUpdatingActiveBadge(true);
      const response = await axios.post('/api/profile/achievements/active', {
        achievement_id: achievementId,
      });

      if (response.data && response.data.success) {
        fetchUserAchievements();
        if (onSuccess) onSuccess();
      }

      setUpdatingActiveBadge(false);
    } catch (error) {
      console.error('Ошибка обновления активного бейджа:', error);
      setUpdatingActiveBadge(false);
    }
  };

  // Удаление активного бейджа
  const handleClearActiveBadge = async () => {
    try {
      setUpdatingActiveBadge(true);
      const response = await axios.post('/api/profile/achievements/deactivate');

      if (response.data && response.data.success) {
        fetchUserAchievements();
        if (onSuccess) onSuccess();
      }

      setUpdatingActiveBadge(false);
    } catch (error) {
      console.error('Ошибка удаления активного бейджа:', error);
      setUpdatingActiveBadge(false);
    }
  };

  useEffect(() => {
    fetchUserAchievements();
  }, []);

  const containerStyle = {
    p: 3,
    borderRadius: 2,
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };

  const cardStyle = (isActive: boolean, isPurchased: boolean = false) => ({
    position: 'relative' as const,
    height: '100%',
    borderRadius: 2,
    background: 'transparent',
    border: isActive
      ? `2px solid ${isPurchased ? theme.palette.secondary.main : theme.palette.primary.main}`
      : '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
    overflow: 'visible' as const,
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: isActive ? theme.shadows[4] : 'none',
    },
  });

  const badgeImageStyle = (isActive: boolean) => ({
    width: 50,
    height: 50,
    objectFit: 'contain' as const,
    mb: 1,
    filter: isActive ? 'none' : 'grayscale(30%)',
    transition: 'all 0.3s ease',
  });

  const activeIndicatorStyle = {
    position: 'absolute' as const,
    top: -6,
    right: -6,
    backgroundColor: theme.palette.success.main,
    color: 'var(--theme-text-primary)',
    borderRadius: '50%',
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  };

  const purchasedIndicatorStyle = {
    position: 'absolute' as const,
    top: -4,
    left: -4,
    backgroundColor: theme.palette.secondary.main,
    color: 'var(--theme-text-primary)',
    borderRadius: '50%',
    width: 14,
    height: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  };

  const buttonStyle = (isActive: boolean, isPurchased: boolean = false) => ({
    fontSize: '0.7rem',
    minHeight: 0,
    py: 0.5,
    width: '100%',
    minWidth: 'auto',
    borderRadius: '8px',
    textTransform: 'none' as const,
    boxShadow: 'none',
  });

  // Фильтрация бейджей
  const earnedBadges = userAchievements.filter(
    achievement => !achievement.image_path.includes('shop/')
  );
  const purchasedBadges = userAchievements.filter(achievement =>
    achievement.image_path.includes('shop/')
  );

  return (
    <Box>
      <Typography
        variant='h6'
        sx={{
          mb: 3,
          color: 'var(--theme-text-primary)',
          fontSize: '1.2rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <EmojiEventsIcon />
        Управление бейджами
      </Typography>

      <Typography variant='body2' sx={{ mb: 3, color: 'var(--theme-text-secondary)' }}>
        Выберите бейдж, который будет отображаться рядом с вашим именем в
        профиле и публикациях
      </Typography>

      {loadingAchievements ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          {/* Кнопка убрать бейдж */}
          {userAchievements.some(achievement => achievement.is_active) && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant='outlined'
                color='error'
                size='small'
                startIcon={<RemoveCircleOutlineIcon />}
                onClick={handleClearActiveBadge}
                disabled={updatingActiveBadge}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                Убрать бейдж
              </Button>
            </Box>
          )}

          {/* Заработанные достижения */}
          {earnedBadges.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                <ShieldIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography
                  variant='h6'
                  color='primary'
                  sx={{ fontWeight: 600 }}
                >
                  Заработанные достижения
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                {earnedBadges.map(achievement => (
                  <Grid item xs={4} sm={3} md={2.4} key={achievement.id}>
                    <Card elevation={0} sx={cardStyle(achievement.is_active)}>
                      {achievement.is_active && (
                        <Box sx={activeIndicatorStyle}>
                          <CheckIcon sx={{ fontSize: 12 }} />
                        </Box>
                      )}

                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          p: 1.5,
                          '&:last-child': { pb: 1.5 },
                        }}
                      >
                        <Box
                          component='img'
                          src={`/static/images/bages/${achievement.image_path}`}
                          alt={achievement.name || achievement.bage}
                          sx={badgeImageStyle(achievement.is_active)}
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src =
                              '/static/images/bages/default-badge.png';
                          }}
                        />

                        <Typography
                          variant='caption'
                          sx={{
                            mt: 1,
                            fontWeight: 500,
                            color: 'var(--theme-text-secondary)',
                            fontSize: '0.7rem',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {achievement.name || achievement.bage}
                        </Typography>

                        <Button
                          variant={achievement.is_active ? 'text' : 'contained'}
                          color={achievement.is_active ? 'success' : 'primary'}
                          onClick={() => handleSetActiveBadge(achievement.id)}
                          size='small'
                          sx={buttonStyle(achievement.is_active)}
                          disabled={updatingActiveBadge}
                        >
                          {achievement.is_active ? 'Активен' : 'Выбрать'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{ mt: 1, mb: 3, display: 'flex', justifyContent: 'center' }}
              >
                <Typography variant='caption' color='text.secondary'>
                  Собирайте новые достижения, участвуя в сообществе
                </Typography>
              </Box>
            </>
          )}

          {/* Приобретенные бейджи */}
          {purchasedBadges.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                <ShoppingBagIcon
                  sx={{ mr: 1, color: theme.palette.secondary.main }}
                />
                <Typography
                  variant='h6'
                  color='secondary'
                  sx={{ fontWeight: 600 }}
                >
                  Приобретенные бейджи
                </Typography>
              </Box>

              <Grid container spacing={1.5}>
                {purchasedBadges.map(achievement => (
                  <Grid item xs={4} sm={3} md={2.4} key={achievement.id}>
                    <Card
                      elevation={0}
                      sx={cardStyle(achievement.is_active, true)}
                    >
                      {achievement.is_active && (
                        <Box sx={activeIndicatorStyle}>
                          <CheckIcon sx={{ fontSize: 12 }} />
                        </Box>
                      )}

                      <Box sx={purchasedIndicatorStyle}>
                        <ShoppingBagIcon sx={{ fontSize: 8 }} />
                      </Box>

                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          p: 1.5,
                          '&:last-child': { pb: 1.5 },
                        }}
                      >
                        <Box
                          component='img'
                          src={`/static/images/bages/${achievement.image_path}`}
                          alt={achievement.name || achievement.bage}
                          sx={badgeImageStyle(achievement.is_active)}
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src =
                              '/static/images/bages/default-badge.png';
                          }}
                        />

                        <Typography
                          variant='caption'
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {achievement.name || achievement.bage}
                        </Typography>

                        <Button
                          variant={achievement.is_active ? 'text' : 'contained'}
                          color={
                            achievement.is_active ? 'success' : 'secondary'
                          }
                          onClick={() => handleSetActiveBadge(achievement.id)}
                          size='small'
                          sx={buttonStyle(achievement.is_active, true)}
                          disabled={updatingActiveBadge}
                        >
                          {achievement.is_active ? 'Активен' : 'Выбрать'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box
                sx={{
                  mt: 1,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant='caption'
                  sx={{ color: 'var(--theme-text-secondary)', mr: 1 }}
                >
                  Покупайте новые бейджи в магазине
                </Typography>
                <Link href='/badge-shop' sx={{ textDecoration: 'none' }}>
                  <Button
                    variant='text'
                    color='secondary'
                    size='small'
                    startIcon={<StorefrontIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      textTransform: 'none',
                      py: 0,
                      ml: -1,
                    }}
                  >
                    Перейти в магазин
                  </Button>
                </Link>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BadgesForm;
