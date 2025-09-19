import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Telegram as TelegramIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Иконка для Element
const ElementIcon = (props: any) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='currentColor'
    {...props}
  >
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
  </svg>
);

interface ConnectionsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Состояние для Telegram
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
  const [telegramIdInput, setTelegramIdInput] = useState('');
  const [telegramIdError, setTelegramIdError] = useState('');
  const [savingTelegramId, setSavingTelegramId] = useState(false);

  // Состояние для Element
  const [elementConnected, setElementConnected] = useState(false);
  const [elementLinking, setElementLinking] = useState(false);
  const [elementToken, setElementToken] = useState('');
  const [loadingElementStatus, setLoadingElementStatus] = useState(false);

  // Состояние для уведомлений
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabled] =
    useState(false);
  const [savingNotificationPrefs, setSavingNotificationPrefs] = useState(false);

  // Загрузка данных при открытии модала
  useEffect(() => {
    if (open) {
      loadConnectionStatus();
      loadNotificationPreferences();
    }
  }, [open]);

  // Загрузка статуса подключений
  const loadConnectionStatus = async () => {
    try {
      // Загружаем статус Element
      await checkElementStatus();

      // Загружаем статус Telegram
      const response = await axios.get('/api/notifications/preferences');
      if (response.data && response.data.telegram_connected !== undefined) {
        setTelegramConnected(response.data.telegram_connected);
      }
    } catch (error) {
      console.error('Ошибка загрузки статуса подключений:', error);
    }
  };

  // Загрузка настроек уведомлений
  const loadNotificationPreferences = async () => {
    try {
      const response = await axios.get('/api/notifications/preferences');
      if (response.data) {
        setTelegramNotificationsEnabled(
          response.data.telegram_notifications_enabled || false
        );
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек уведомлений:', error);
    }
  };

  // Проверка статуса Element
  const checkElementStatus = async () => {
    try {
      setLoadingElementStatus(true);
      const response = await axios.get('/api/profile/element/status');
      const isConnected = response.data && response.data.connected;
      setElementConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Ошибка при проверке статуса Element:', error);
      setElementConnected(false);
      return false;
    } finally {
      setLoadingElementStatus(false);
    }
  };

  // Генерация токена для Element
  const generateElementToken = async () => {
    try {
      setElementLinking(true);
      const randomToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setElementToken(randomToken);
      onSuccess('Перейдите по ссылке, чтобы привязать Element аккаунт');
    } catch (error) {
      console.error('Ошибка при генерации токена Element:', error);
      onSuccess('Не удалось сгенерировать токен для Element');
      setElementLinking(false);
    }
  };

  // Подключение Element
  const handleLinkElement = () => {
    generateElementToken();

    const checkInterval = setInterval(() => {
      checkElementStatus().then(isConnected => {
        if (isConnected) {
          clearInterval(checkInterval);
          setElementLinking(false);
          setElementToken('');
          onSuccess('Element аккаунт успешно подключен!');
        }
      });
    }, 2000);

    localStorage.setItem('element_auth_pending', 'true');

    setTimeout(() => {
      clearInterval(checkInterval);
      localStorage.removeItem('element_auth_pending');
    }, 120000);
  };

  // Отмена подключения Element
  const handleCancelElementLinking = () => {
    setElementToken('');
    setElementLinking(false);
    localStorage.removeItem('element_auth_pending');
  };

  // Сохранение Telegram ID
  const handleSaveTelegramId = async () => {
    try {
      setTelegramIdError('');
      setSavingTelegramId(true);

      if (!telegramIdInput.trim()) {
        setTelegramIdError('Telegram ID не может быть пустым');
        return;
      }

      if (!/^\d+$/.test(telegramIdInput.trim())) {
        setTelegramIdError('Telegram ID должен быть числом');
        return;
      }

      const response = await axios.post('/api/profile/telegram-connect', {
        telegram_id: telegramIdInput.trim(),
      });

      if (response.data && response.data.success) {
        setTelegramConnected(true);
        onSuccess('Telegram аккаунт успешно привязан');
        setTelegramDialogOpen(false);
        setTelegramIdInput('');
      } else {
        throw new Error(
          response.data?.error || 'Не удалось привязать Telegram ID'
        );
      }
    } catch (error: any) {
      console.error('Ошибка при привязке Telegram ID:', error);
      setTelegramIdError(
        error.response?.data?.error ||
          error.message ||
          'Произошла ошибка при привязке Telegram ID'
      );
    } finally {
      setSavingTelegramId(false);
    }
  };

  // Переключение Telegram уведомлений
  const handleToggleTelegramNotifications = async () => {
    try {
      if (!telegramConnected) {
        onSuccess('Для получения уведомлений сначала подключите Telegram');
        return;
      }

      setSavingNotificationPrefs(true);
      const newTelegramEnabled = !telegramNotificationsEnabled;

      const response = await axios.post('/api/notifications/preferences', {
        telegram_notifications_enabled: newTelegramEnabled,
      });

      if (response.data && response.data.success) {
        setTelegramNotificationsEnabled(newTelegramEnabled);
        onSuccess(
          newTelegramEnabled
            ? 'Telegram-уведомления включены'
            : 'Telegram-уведомления отключены'
        );
      } else {
        throw new Error(response.data?.error || 'Ошибка сохранения настроек');
      }
    } catch (error: any) {
      console.error('Ошибка при переключении Telegram-уведомлений:', error);
      onSuccess(
        error.message || 'Не удалось изменить настройки Telegram-уведомлений'
      );
    } finally {
      setSavingNotificationPrefs(false);
    }
  };

  return (
    <>
      {/* Основное модальное окно */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: isMobile ? 0 : 'var(--main-border-radius)',
            minHeight: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '90vh',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            color: 'var(--theme-text-primary)',
            p: 3,
            pb: 2,
          }}
        >
          <Typography variant='h6' component='h2' sx={{ fontWeight: 600 }}>
            Мои подключения
          </Typography>
          <IconButton
            onClick={onClose}
            size='small'
            sx={{
              color: 'var(--theme-text-secondary)',
              '&:hover': {
                bgcolor: 'var(--theme-hover)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 2 }}>
          <List disablePadding>
            {/* Telegram аккаунт */}
            <ListItem
              sx={{
                py: 2,
                px: 3,
                borderRadius: 'var(--main-border-radius)',
                bgcolor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                mb: 2,
                '&:hover': {
                  bgcolor: 'var(--theme-hover)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <TelegramIcon
                  sx={{
                    color: telegramConnected
                      ? 'var(--theme-accent)'
                      : 'var(--theme-text-disabled)',
                    fontSize: 28,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary='Telegram'
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  fontSize: '1.1rem',
                }}
                secondary={
                  telegramConnected
                    ? 'Аккаунт подключен'
                    : 'Аккаунт не подключен'
                }
                secondaryTypographyProps={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: '0.9rem',
                }}
              />
              <Button
                variant={telegramConnected ? 'outlined' : 'contained'}
                size='small'
                onClick={() => setTelegramDialogOpen(true)}
                sx={{
                  bgcolor: telegramConnected
                    ? 'transparent'
                    : 'var(--theme-accent)',
                  color: telegramConnected
                    ? 'var(--theme-accent)'
                    : 'var(--theme-text-on-accent)',
                  border: telegramConnected
                    ? '1px solid var(--theme-accent)'
                    : 'none',
                  borderRadius: 'var(--main-border-radius)',
                  minWidth: 100,
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: telegramConnected
                      ? 'var(--theme-accent-hover)'
                      : 'var(--theme-accent-hover)',
                    color: 'var(--theme-text-on-accent)',
                  },
                }}
              >
                {telegramConnected ? (
                  <>
                    <CheckIcon fontSize='small' sx={{ mr: 1 }} />
                    Подключен
                  </>
                ) : (
                  'Подключить'
                )}
              </Button>
            </ListItem>

            {/* Element аккаунт */}
            <ListItem
              sx={{
                py: 2,
                px: 3,
                borderRadius: 'var(--main-border-radius)',
                bgcolor: 'var(--theme-surface)',
                border: '1px solid var(--theme-border)',
                mb: 2,
                '&:hover': {
                  bgcolor: 'var(--theme-hover)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                <ElementIcon
                  sx={{
                    color: elementConnected
                      ? 'var(--theme-accent)'
                      : 'var(--theme-text-disabled)',
                    fontSize: 28,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary='Element'
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  fontSize: '1.1rem',
                }}
                secondary={
                  loadingElementStatus
                    ? 'Проверка статуса...'
                    : elementConnected
                      ? 'Аккаунт подключен'
                      : 'Аккаунт не подключен'
                }
                secondaryTypographyProps={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: '0.9rem',
                }}
              />
              {loadingElementStatus ? (
                <CircularProgress
                  size={24}
                  sx={{ color: 'var(--theme-accent)' }}
                />
              ) : elementLinking ? (
                <IconButton
                  edge='end'
                  color='error'
                  onClick={handleCancelElementLinking}
                  size='small'
                  sx={{
                    color: 'var(--theme-error)',
                    '&:hover': {
                      bgcolor: 'var(--theme-error-hover)',
                    },
                  }}
                >
                  <CloseIcon fontSize='small' />
                </IconButton>
              ) : (
                <Button
                  variant={elementConnected ? 'outlined' : 'contained'}
                  size='small'
                  onClick={elementConnected ? undefined : handleLinkElement}
                  disabled={elementConnected}
                  sx={{
                    bgcolor: elementConnected
                      ? 'transparent'
                      : 'var(--theme-accent)',
                    color: elementConnected
                      ? 'var(--theme-accent)'
                      : 'var(--theme-text-on-accent)',
                    border: elementConnected
                      ? '1px solid var(--theme-accent)'
                      : 'none',
                    borderRadius: 'var(--main-border-radius)',
                    minWidth: 100,
                    px: 2,
                    py: 1,
                    fontWeight: 500,
                    '&:hover': {
                      bgcolor: elementConnected
                        ? 'var(--theme-accent-hover)'
                        : 'var(--theme-accent-hover)',
                      color: 'var(--theme-text-on-accent)',
                    },
                    '&:disabled': {
                      bgcolor: 'var(--theme-disabled)',
                      color: 'var(--theme-text-disabled)',
                      border: '1px solid var(--theme-border)',
                    },
                  }}
                >
                  {elementConnected ? (
                    <>
                      <CheckIcon fontSize='small' sx={{ mr: 1 }} />
                      Подключен
                    </>
                  ) : (
                    'Подключить'
                  )}
                </Button>
              )}
            </ListItem>

            {/* Telegram уведомления */}
            {telegramConnected && (
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  borderRadius: 'var(--main-border-radius)',
                  bgcolor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  mb: 2,
                  '&:hover': {
                    bgcolor: 'var(--theme-hover)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <NotificationsIcon
                    sx={{
                      color: telegramNotificationsEnabled
                        ? 'var(--theme-success)'
                        : 'var(--theme-text-disabled)',
                      fontSize: 28,
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary='Telegram-уведомления'
                  primaryTypographyProps={{
                    fontWeight: 600,
                    color: 'var(--theme-text-primary)',
                    fontSize: '1.1rem',
                  }}
                  secondary='Получать уведомления в Telegram'
                  secondaryTypographyProps={{
                    color: 'var(--theme-text-secondary)',
                    fontSize: '0.9rem',
                  }}
                />
                {savingNotificationPrefs ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: 'var(--theme-accent)' }}
                  />
                ) : (
                  <Button
                    variant={
                      telegramNotificationsEnabled ? 'outlined' : 'contained'
                    }
                    size='small'
                    onClick={handleToggleTelegramNotifications}
                    sx={{
                      bgcolor: telegramNotificationsEnabled
                        ? 'transparent'
                        : 'var(--theme-accent)',
                      color: telegramNotificationsEnabled
                        ? 'var(--theme-success)'
                        : 'var(--theme-text-on-accent)',
                      border: telegramNotificationsEnabled
                        ? '1px solid var(--theme-success)'
                        : 'none',
                      borderRadius: 'var(--main-border-radius)',
                      minWidth: 100,
                      px: 2,
                      py: 1,
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: telegramNotificationsEnabled
                          ? 'var(--theme-success-hover)'
                          : 'var(--theme-accent-hover)',
                        color: 'var(--theme-text-on-accent)',
                      },
                    }}
                  >
                    {telegramNotificationsEnabled ? 'Включены' : 'Выключены'}
                  </Button>
                )}
              </ListItem>
            )}
          </List>

          {elementToken && (
            <Alert
              severity='info'
              sx={{
                mt: 2,
                bgcolor: 'var(--theme-info-bg)',
                color: 'var(--theme-text-primary)',
                border: '1px solid var(--theme-info-border)',
                borderRadius: 'var(--main-border-radius)',
              }}
            >
              <Typography variant='body2'>
                Токен для подключения: <strong>{elementToken}</strong>
              </Typography>
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог подключения Telegram */}
      <Dialog
        open={telegramDialogOpen}
        onClose={() => setTelegramDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: isMobile ? 0 : 'var(--main-border-radius)',
            minHeight: isMobile ? '100vh' : 'auto',
            maxHeight: isMobile ? '100vh' : '90vh',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            color: 'var(--theme-text-primary)',
            p: 3,
            pb: 2,
          }}
        >
          <Typography variant='h6' component='h2' sx={{ fontWeight: 600 }}>
            Подключение Telegram
          </Typography>
          <IconButton
            onClick={() => setTelegramDialogOpen(false)}
            size='small'
            sx={{
              color: 'var(--theme-text-secondary)',
              '&:hover': {
                bgcolor: 'var(--theme-hover)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2 }}>
          <Typography
            variant='body2'
            sx={{
              color: 'var(--theme-text-secondary)',
              mb: 3,
              fontSize: '0.95rem',
              lineHeight: 1.5,
            }}
          >
            Введите ваш Telegram ID для подключения аккаунта. Вы можете найти
            свой ID, написав боту @userinfobot
          </Typography>
          <TextField
            fullWidth
            label='Telegram ID'
            value={telegramIdInput}
            onChange={e => setTelegramIdInput(e.target.value)}
            error={!!telegramIdError}
            helperText={telegramIdError}
            placeholder='Например: 123456789'
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'var(--theme-text-primary)',
                borderRadius: 'var(--main-border-radius)',
                '& fieldset': {
                  borderColor: 'var(--theme-border)',
                },
                '&:hover fieldset': {
                  borderColor: 'var(--theme-accent)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--theme-accent)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--theme-text-secondary)',
                '&.Mui-focused': {
                  color: 'var(--theme-accent)',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'var(--theme-error)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setTelegramDialogOpen(false)}
            variant='outlined'
            sx={{
              color: 'var(--theme-text-secondary)',
              borderColor: 'var(--theme-border)',
              '&:hover': {
                borderColor: 'var(--theme-accent)',
                color: 'var(--theme-accent)',
              },
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveTelegramId}
            variant='contained'
            disabled={savingTelegramId || !telegramIdInput.trim()}
            startIcon={
              savingTelegramId ? (
                <CircularProgress size={16} />
              ) : (
                <TelegramIcon />
              )
            }
            sx={{
              bgcolor: 'var(--theme-accent)',
              color: 'var(--theme-text-on-accent)',
              borderRadius: 'var(--main-border-radius)',
              px: 3,
              '&:hover': {
                bgcolor: 'var(--theme-accent-hover)',
              },
              '&:disabled': {
                bgcolor: 'var(--theme-disabled)',
                color: 'var(--theme-text-disabled)',
              },
            }}
          >
            {savingTelegramId ? 'Подключение...' : 'Подключить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConnectionsModal;
