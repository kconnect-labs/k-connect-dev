import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

interface SecurityFormProps {
  onSuccess?: () => void;
}

const SecurityForm: React.FC<SecurityFormProps> = ({ onSuccess }) => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasCredentials, setHasCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Проверка наличия учетных данных
  useEffect(() => {
    const checkCredentials = async () => {
      try {
        const response = await fetch('/api/user/has-credentials', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHasCredentials(data.hasCredentials);
        } else {
          console.error('Ошибка при проверке учетных данных');
        }
      } catch (error) {
        console.error('Ошибка при проверке учетных данных:', error);
      }
    };

    checkCredentials();
  }, []);

  // Валидация формы
  const validateForm = () => {
    let isValid = true;

    // Валидация имени пользователя
    if (!username) {
      setUsernameError('Имя пользователя обязательно');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('Имя пользователя должно быть не менее 3 символов');
      isValid = false;
    } else {
      setUsernameError('');
    }

    // Валидация email
    if (!email) {
      setEmailError('Email обязателен');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Введите корректный email');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Валидация пароля
    if (!password) {
      setPasswordError('Пароль обязателен');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      isValid = false;
    } else if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup-credentials', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHasCredentials(true);
        setPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess();
      } else {
        console.error('Ошибка при сохранении:', data.error);
      }
    } catch (error) {
      console.error('Ошибка при сохранении учетных данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    p: 3,
    borderRadius: 'var(--main-border-radius)',
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    border: '1px solid rgba(0, 0, 0, 0.12)',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };

  const sectionStyle = {
    p: 2,
    borderRadius: 'var(--main-border-radius)',
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
    mt: 2,
    borderRadius: 'var(--main-border-radius)',
    textTransform: 'none' as const,
    fontWeight: 600,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.8),
    },
  };

  return (
    <Box>
      <Box sx={sectionStyle}>
        <Typography
          variant='h6'
          sx={{
            mb: 2,
            fontWeight: 600,
            color: 'var(--theme-text-primary)',
          }}
        >
          <LockIcon sx={{ fontSize: 20 }} />
          Настройки входа по логину и паролю
        </Typography>

        {hasCredentials ? (
          <Alert
            severity='info'
            sx={{
              mb: 3,
              background: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            }}
          >
            У вас уже настроены учетные данные для входа. Вы можете обновить их
            при необходимости.
          </Alert>
        ) : (
          <Alert
            severity='info'
            sx={{
              mb: 3,
              background: alpha(theme.palette.info.main, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            }}
          >
            Настройте учетные данные, чтобы иметь возможность входить по логину
            и паролю.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Имя пользователя'
                value={username}
                onChange={e => setUsername(e.target.value)}
                error={!!usernameError}
                helperText={usernameError}
                variant='outlined'
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                variant='outlined'
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Пароль'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError}
                variant='outlined'
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{
                        minWidth: 'auto',
                        p: 1,
                        color: 'var(--theme-text-secondary)',
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </Button>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Подтвердите пароль'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                error={password !== confirmPassword && confirmPassword !== ''}
                helperText={
                  password !== confirmPassword && confirmPassword !== ''
                    ? 'Пароли не совпадают'
                    : ''
                }
                variant='outlined'
                sx={textFieldStyle}
                InputProps={{
                  endAdornment: (
                    <Button
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      sx={{
                        minWidth: 'auto',
                        p: 1,
                        color: 'var(--theme-text-secondary)',
                      }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </Button>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isLoading}
                sx={buttonStyle}
                startIcon={
                  isLoading ? <CircularProgress size={20} /> : <LockIcon />
                }
              >
                {isLoading ? 'Сохранение...' : 'Сохранить учетные данные'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>

      <Box sx={sectionStyle}>
        <Typography
          variant='h6'
          sx={{
            mb: 2,
            color: 'var(--theme-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <SecurityIcon sx={{ fontSize: 20 }} />
          Дополнительные настройки безопасности
        </Typography>

        <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)', mb: 2 }}>
          Измените пароль для повышения безопасности аккаунта
        </Typography>

        <Alert
          severity='info'
          sx={{
            background: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          }}
        >
          Раздел в разработке. Скоро здесь появятся дополнительные функции
          безопасности.
        </Alert>
      </Box>
    </Box>
  );
};

export default SecurityForm;
