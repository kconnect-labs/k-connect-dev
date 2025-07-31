import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  styled,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AlternateEmail as AlternateEmailIcon,
  Star as StarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useUsernames } from '../hooks/useUsernames';

const KBallsIcon = styled('img')({
  width: '20px',
  height: '20px',
  marginRight: '4px',
});

interface UsernamesFormProps {
  onSuccess?: () => void;
}

const UsernamesForm: React.FC<UsernamesFormProps> = ({ onSuccess }) => {
  const theme = useTheme();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<any>(null);

  const {
    username,
    usernameData,
    loading,
    purchasing,
    purchased,
    error,
    userPoints,
    usernameLimit,
    limitReached,
    userSubscription,
    isChangingActive,
    handleUsernameChange,
    handlePurchase,
    handleSetActive,
    clearError,
  } = useUsernames();

  const handleOpenConfirmDialog = (usernameObj: any) => {
    setSelectedUsername(usernameObj);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setSelectedUsername(null);
  };

  const confirmSetActive = async () => {
    if (!selectedUsername) return;

    await handleSetActive(selectedUsername);
    handleCloseConfirmDialog();
    if (onSuccess) onSuccess();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const containerStyle = {
    p: 3,
    borderRadius: 2,
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };

  const sectionStyle = {
    p: 2,
    borderRadius: 1.5,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    mb: 2,
  };

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiInputBase-input': {
      color: 'white',
    },
  };

  const buttonStyle = {
    borderRadius: 2,
    textTransform: 'none' as const,
    fontWeight: 600,
    height: 56,
    fontSize: '0.875rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.8),
    },
  };

  return (
    <Box>
      <Typography
        variant='h6'
        sx={{
          mb: 3,
          color: 'text.primary',
          fontSize: '1.2rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <AlternateEmailIcon />
        Магазин юзернеймов
      </Typography>

      {/* Информация о баллах и лимите */}
      <Box sx={sectionStyle}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KBallsIcon src='/static/icons/KBalls.svg' alt='KBalls' />
              <Typography
                variant='body1'
                sx={{ color: 'text.primary', fontWeight: 600 }}
              >
                Ваши баллы: {userPoints}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: theme.palette.primary.main }} />
              <Typography
                variant='body1'
                sx={{ color: 'text.primary', fontWeight: 600 }}
              >
                Лимит: {usernameLimit === Infinity ? '∞' : usernameLimit}{' '}
                юзернеймов
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Покупка нового юзернейма */}
      <Box sx={sectionStyle}>
        <Typography
          variant='h6'
          sx={{
            mb: 2,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 20 }} />
          Покупка юзернейма
        </Typography>

        {limitReached && (
          <Alert
            severity='warning'
            sx={{
              mb: 2,
              background: alpha(theme.palette.warning.main, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            }}
          >
            Вы достигли лимита юзернеймов. Улучшите подписку для увеличения
            лимита.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='Введите желаемый юзернейм'
              value={username}
              onChange={handleUsernameChange}
              disabled={limitReached}
              sx={textFieldStyle}
              InputProps={{
                endAdornment: loading && <CircularProgress size={20} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              onClick={handlePurchase}
              disabled={
                !username ||
                !usernameData?.available ||
                usernameData?.owned ||
                userPoints < (usernameData?.price || 0) ||
                purchasing ||
                limitReached
              }
              sx={buttonStyle}
              startIcon={
                purchasing ? (
                  <CircularProgress size={20} />
                ) : (
                  <ShoppingCartIcon />
                )
              }
            >
              {purchasing
                ? 'Покупка...'
                : `Купить за ${usernameData?.price || 0} баллов`}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert
            severity='error'
            sx={{
              mt: 2,
              background: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Купленные юзернеймы */}
      {purchased.length > 0 && (
        <Box sx={sectionStyle}>
          <Typography
            variant='h6'
            sx={{
              mb: 2,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CheckIcon sx={{ fontSize: 20 }} />
            Ваши юзернеймы ({purchased.length}/
            {usernameLimit === Infinity ? '∞' : usernameLimit})
          </Typography>

          <Grid container spacing={2}>
            {purchased.map(usernameObj => (
              <Grid item xs={12} sm={6} md={4} key={usernameObj.id}>
                <Card
                  elevation={0}
                  sx={{
                    background: usernameObj.is_active
                      ? alpha(theme.palette.success.main, 0.1)
                      : 'rgba(255, 255, 255, 0.02)',
                    border: usernameObj.is_active
                      ? `2px solid ${theme.palette.success.main}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant='h6'
                        sx={{ color: 'text.primary', fontWeight: 600 }}
                      >
                        @{usernameObj.username}
                      </Typography>
                    </Box>

                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                    >
                      {formatDate(usernameObj.purchase_date)}
                    </Typography>

                    <Typography
                      variant='caption'
                      sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
                    >
                      {usernameObj.price_paid} баллов
                    </Typography>

                    {usernameObj.is_active ? (
                      <Chip
                        label='Активен'
                        size='small'
                        color='success'
                        variant='filled'
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    ) : (
                      <Button
                        fullWidth
                        variant='outlined'
                        color='primary'
                        size='small'
                        onClick={() => handleOpenConfirmDialog(usernameObj)}
                        disabled={isChangingActive}
                        sx={{
                          textTransform: 'none',
                          height: 32,
                          fontSize: '0.75rem',
                        }}
                      >
                        {isChangingActive ? 'Смена...' : 'Активировать'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Информация о правилах */}
      <Box sx={sectionStyle}>
        <Typography
          variant='h6'
          sx={{
            mb: 2,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InfoIcon sx={{ fontSize: 20 }} />
          Правила покупки юзернеймов
        </Typography>

        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
          Приобретайте уникальные юзернеймы и выделитесь среди других
          пользователей!
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant='subtitle2'
              sx={{ color: 'text.primary', mb: 1 }}
            >
              Лимиты по подпискам:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip
                label='Бесплатно: 3 юзернейма'
                size='small'
                color='default'
                variant='outlined'
              />
              <Chip
                label='Basic: 5 юзернеймов'
                size='small'
                color='primary'
                variant='outlined'
              />
              <Chip
                label='Premium: 8 юзернеймов'
                size='small'
                color='secondary'
                variant='outlined'
              />
              <Chip
                label='Ultimate: ∞ юзернеймов'
                size='small'
                color='success'
                variant='outlined'
              />
              <Chip
                label='MAX: ∞ юзернеймов'
                size='small'
                color='error'
                variant='outlined'
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Диалог подтверждения смены активного юзернейма */}
      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Подтверждение смены юзернейма</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите сделать юзернейм{' '}
            <strong>@{selectedUsername?.username}</strong> активным?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color='inherit'>
            Отмена
          </Button>
          <Button
            onClick={confirmSetActive}
            color='primary'
            variant='contained'
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsernamesForm;
