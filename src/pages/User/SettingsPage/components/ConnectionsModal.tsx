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
  alpha,
  useTheme,
} from '@mui/material';
import {
  Telegram as TelegramIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Favorite as FavoriteIcon,
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
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: '100%' },
            maxWidth: { xs: '100%', sm: 550 },
            minHeight: { xs: '100vh', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '90vh' },
            m: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--theme-text-primary)',
          }}
        >
          Мои коннекты
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <List disablePadding>
            {/* Telegram аккаунт */}
            <ListItem
              sx={{
                py: 2,
                px: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <TelegramIcon
                  sx={{ color: telegramConnected ? '#D0BCFF' : '#777' }}
                />
              </ListItemIcon>
              <ListItemText
                primary='Telegram'
                primaryTypographyProps={{ fontWeight: 500, color: 'var(--theme-text-primary)' }}
                secondary={telegramConnected ? 'Подключен' : 'Не подключен'}
                secondaryTypographyProps={{ color: 'var(--theme-text-secondary)' }}
              />
              <Button
                variant='contained'
                size='small'
                onClick={() => setTelegramDialogOpen(true)}
                sx={{
                  bgcolor: telegramConnected
                    ? 'transparent'
                    : 'rgba(208, 188, 255, 0.1)',
                  color: telegramConnected ? 'success.main' : '#D0BCFF',
                  border: telegramConnected
                    ? 'none'
                    : '1px solid rgba(208, 188, 255, 0.3)',
                  boxShadow: 'none',
                  minWidth: 'auto',
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(208, 188, 255, 0.2)',
                  },
                }}
              >
                {telegramConnected ? (
                  <CheckIcon fontSize='small' />
                ) : (
                  'Подключить'
                )}
              </Button>
            </ListItem>

            {/* Element аккаунт */}
            <ListItem
              sx={{
                py: 2,
                px: 2,
                borderRadius: 2,
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                mb: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ElementIcon
                  sx={{ color: elementConnected ? '#D0BCFF' : '#777' }}
                />
              </ListItemIcon>
              <ListItemText
                primary='Element'
                primaryTypographyProps={{ fontWeight: 500, color: 'var(--theme-text-primary)' }}
                secondary={
                  loadingElementStatus
                    ? 'Проверка статуса...'
                    : elementConnected
                      ? 'Подключен'
                      : 'Не подключен'
                }
                secondaryTypographyProps={{ color: 'var(--theme-text-secondary)' }}
              />
              {loadingElementStatus ? (
                <CircularProgress size={24} sx={{ color: '#D0BCFF' }} />
              ) : elementLinking ? (
                <IconButton
                  edge='end'
                  color='error'
                  onClick={handleCancelElementLinking}
                  size='small'
                >
                  <CloseIcon fontSize='small' />
                </IconButton>
              ) : (
                <Button
                  variant='contained'
                  size='small'
                  onClick={elementConnected ? undefined : handleLinkElement}
                  disabled={elementConnected}
                  sx={{
                    bgcolor: elementConnected
                      ? 'transparent'
                      : 'rgba(208, 188, 255, 0.1)',
                    color: elementConnected ? 'success.main' : '#D0BCFF',
                    border: elementConnected
                      ? 'none'
                      : '1px solid rgba(208, 188, 255, 0.3)',
                    boxShadow: 'none',
                    minWidth: 'auto',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(208, 188, 255, 0.2)',
                    },
                  }}
                >
                  {elementConnected ? (
                    <CheckIcon fontSize='small' />
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
                  px: 2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  mb: 2,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <TelegramIcon
                    color={telegramNotificationsEnabled ? 'success' : 'action'}
                  />
                </ListItemIcon>
                <ListItemText
                  primary='Telegram-уведомления'
                  primaryTypographyProps={{ fontWeight: 500, color: 'var(--theme-text-primary)' }}
                  secondary='Получать уведомления в Telegram'
                  secondaryTypographyProps={{
                    color: 'var(--theme-text-secondary)',
                  }}
                />
                {savingNotificationPrefs ? (
                  <CircularProgress size={24} sx={{ color: '#D0BCFF' }} />
                ) : (
                  <Button
                    variant='contained'
                    size='small'
                    onClick={handleToggleTelegramNotifications}
                    sx={{
                      bgcolor: telegramNotificationsEnabled
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(208, 188, 255, 0.1)',
                      color: telegramNotificationsEnabled
                        ? 'success.main'
                        : '#D0BCFF',
                      border: '1px solid rgba(208, 188, 255, 0.3)',
                      boxShadow: 'none',
                      minWidth: 'auto',
                      px: 2,
                      '&:hover': {
                        bgcolor: 'rgba(208, 188, 255, 0.2)',
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
              sx={{ mt: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', color: 'var(--theme-text-primary)' }}
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
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: { xs: 0, sm: 2 },
            m: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: '100%' },
            height: { xs: '100vh', sm: 'auto' },
            maxWidth: { xs: '100%', sm: 550 },
            maxHeight: { xs: '100vh', sm: '90vh' },
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--theme-text-primary)',
          }}
        >
          Подключение Telegram
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography
            variant='body2'
            sx={{ color: 'var(--theme-text-secondary)', mb: 2 }}
          >
            Введите ваш Telegram ID для подключения аккаунта
          </Typography>
          <TextField
            fullWidth
            label='Telegram ID'
            value={telegramIdInput}
            onChange={e => setTelegramIdInput(e.target.value)}
            error={!!telegramIdError}
            helperText={telegramIdError}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'var(--theme-text-primary)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#D0BCFF' },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--theme-text-secondary)',
                '&.Mui-focused': {
                  color: '#D0BCFF',
                },
              },
              '& .MuiFormHelperText-root': {
                color: '#f44336',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setTelegramDialogOpen(false)}
            sx={{ color: 'var(--theme-text-secondary)' }}
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
              bgcolor: 'rgba(208, 188, 255, 0.1)',
              color: '#D0BCFF',
              border: '1px solid rgba(208, 188, 255, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(208, 188, 255, 0.2)',
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
