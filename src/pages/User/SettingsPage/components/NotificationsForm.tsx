import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Telegram as TelegramIcon,
  Smartphone as SmartphoneIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import axios from 'axios';
import NotificationService from '../../../../services/NotificationService';

interface NotificationsFormProps {
  onSuccess?: () => void;
}

interface NotificationPrefs {
  pushNotificationsEnabled: boolean;
  telegramNotificationsEnabled: boolean;
  telegramConnected: boolean;
}

const NotificationsForm: React.FC<NotificationsFormProps> = ({ onSuccess }) => {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    {
      pushNotificationsEnabled: false,
      telegramNotificationsEnabled: false,
      telegramConnected: false,
    }
  );

  const [loading, setLoading] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<string>('default');
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Telegram
  const [telegramDialogOpen, setTelegramDialogOpen] = useState(false);
  const [telegramIdInput, setTelegramIdInput] = useState('');
  const [telegramIdError, setTelegramIdError] = useState('');
  const [savingTelegramId, setSavingTelegramId] = useState(false);

  // Загрузка настроек уведомлений
  const loadNotificationPreferences = async () => {
    try {
      setLoadingPrefs(true);
      const response = await axios.get('/api/notifications/preferences');

      if (response.data) {
        const pushEnabled = response.data.push_notifications_enabled;
        const telegramEnabled = response.data.telegram_notifications_enabled;
        const telegramConnected = response.data.telegram_connected;

        setNotificationPrefs({
          pushNotificationsEnabled: pushEnabled,
          telegramNotificationsEnabled: telegramEnabled,
          telegramConnected: telegramConnected,
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек уведомлений:', error);
    } finally {
      setLoadingPrefs(false);
    }
  };

  // Проверка поддержки push-уведомлений
  const checkPushSupport = async () => {
    try {
      const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setPushSupported(isSupported);

      if (isSupported) {
        setPushPermission(Notification.permission);

        if ('serviceWorker' in navigator) {
          try {
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            const pushSW = registrations.find(
              reg =>
                reg.active &&
                reg.active.scriptURL &&
                (reg.active.scriptURL.includes('service-worker.js') ||
                 reg.active.scriptURL.includes('custom-sw.js'))
            );

            if (pushSW) {
              console.log('Found service worker:', pushSW.active?.scriptURL);
              const subscription = await pushSW.pushManager.getSubscription();
              console.log('Current subscription:', subscription);
              setPushSubscribed(!!subscription);
            } else {
              console.log('No service worker found');
              setPushSubscribed(false);
            }
          } catch (err) {
            console.error('Error checking service worker registration:', err);
            setPushSubscribed(false);
          }
        }
      }
    } catch (error) {
      console.error('Error checking push support:', error);
    }
  };

  useEffect(() => {
    loadNotificationPreferences();
    checkPushSupport();
  }, []);

  // Включение push-уведомлений
  const handleEnablePushNotifications = async () => {
    try {
      setPushLoading(true);

      if (!pushSupported) {
        alert('Push-уведомления не поддерживаются вашим браузером');
        setPushLoading(false);
        return;
      }

      if (pushPermission === 'denied') {
        alert(
          'Разрешение на уведомления заблокировано. Пожалуйста, измените настройки в браузере.'
        );
        setPushLoading(false);
        return;
      }


      const subscription = await NotificationService.subscribeToPushNotifications();
      console.log('Push subscription created:', subscription);

      // Обновляем настройки на сервере
      await axios.post('/api/notifications/preferences', {
        push_notifications_enabled: true,
      });

      setPushSubscribed(true);
      setNotificationPrefs(prev => ({
        ...prev,
        pushNotificationsEnabled: true,
      }));

      // Показываем успешное сообщение
      alert('Push-уведомления успешно включены! Вам должно прийти тестовое уведомление.');

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      let message = 'Неизвестная ошибка';
      if (error instanceof Error) {
        message = error.message;
      }
      alert('Ошибка при включении push-уведомлений: ' + message);
    } finally {
      setPushLoading(false);
    }
  };

  // Отключение push-уведомлений
  const handleDisablePushNotifications = async () => {
    try {
      setPushLoading(true);

      // Отписываемся от push-уведомлений через NotificationService
      console.log('Unsubscribing from push notifications...');
      await NotificationService.unsubscribeFromPushNotifications();

      // Обновляем настройки на сервере
      await axios.post('/api/notifications/preferences', {
        push_notifications_enabled: false,
      });

      setPushSubscribed(false);
      setNotificationPrefs(prev => ({
        ...prev,
        pushNotificationsEnabled: false,
      }));

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      alert('Ошибка при отключении push-уведомлений');
    } finally {
      setPushLoading(false);
    }
  };

  // Переключение Telegram уведомлений
  const handleToggleTelegramNotifications = async () => {
    try {
      setSavingPrefs(true);

      if (!notificationPrefs.telegramConnected) {
        alert(
          'Для получения уведомлений сначала подключите Telegram в профиле'
        );
        setSavingPrefs(false);
        return;
      }

      const newTelegramEnabled =
        !notificationPrefs.telegramNotificationsEnabled;

      const response = await axios.post('/api/notifications/preferences', {
        push_notifications_enabled: notificationPrefs.pushNotificationsEnabled,
        telegram_notifications_enabled: newTelegramEnabled,
      });

      if (response.data && response.data.success) {
        setNotificationPrefs(prev => ({
          ...prev,
          telegramNotificationsEnabled: newTelegramEnabled,
        }));

        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Ошибка при переключении Telegram-уведомлений:', error);
      alert('Не удалось изменить настройки Telegram-уведомлений');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Сохранение Telegram ID
  const handleSaveTelegramId = async () => {
    try {
      setTelegramIdError('');
      setSavingTelegramId(true);

      if (!telegramIdInput.trim()) {
        setTelegramIdError('Telegram ID не может быть пустым');
        setSavingTelegramId(false);
        return;
      }

      if (!/^\d+$/.test(telegramIdInput.trim())) {
        setTelegramIdError('Telegram ID должен быть числом');
        setSavingTelegramId(false);
        return;
      }

      const response = await axios.post('/api/profile/telegram-connect', {
        telegram_id: telegramIdInput.trim(),
      });

      if (response.data && response.data.success) {
        setNotificationPrefs(prev => ({
          ...prev,
          telegramConnected: true,
        }));

        setTelegramDialogOpen(false);
        setTelegramIdInput('');

        if (onSuccess) onSuccess();
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

  const containerStyle = {
    p: 3,
    borderRadius: 'var(--main-border-radius)',
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };

  const sectionStyle = {
    mb: 3,
    p: 2,
    borderRadius: 'var(--main-border-radius)',
    background: 'rgba(255, 255, 255, 0.02)',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  };

  if (loadingPrefs) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box >
      <Typography
        variant='h6'
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'var(--theme-text-primary)',
        }}
      >
        <NotificationsIcon />
        Настройки уведомлений
      </Typography>

      {/* Push-уведомления */}
      <Box sx={sectionStyle}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartphoneIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography
                variant='subtitle1'
                sx={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}
              >
                Push-уведомления
              </Typography>
              <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                Получайте уведомления в браузере
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!pushSupported && (
              <Chip
                label='Не поддерживается'
                size='small'
                color='error'
                icon={<ErrorIcon />}
              />
            )}
            {pushPermission === 'denied' && (
              <Chip
                label='Заблокировано'
                size='small'
                color='warning'
                icon={<ErrorIcon />}
              />
            )}
            {pushSubscribed && (
              <Chip
                label='Активно'
                size='small'
                color='success'
                icon={<CheckCircleIcon />}
              />
            )}
          </Box>
        </Box>

        {!pushSupported ? (
          <Alert severity='info' sx={{ mb: 2 }}>
            Ваш браузер не поддерживает push-уведомления
          </Alert>
        ) : pushPermission === 'denied' ? (
          <Alert severity='warning' sx={{ mb: 2 }}>
            Разрешение на уведомления заблокировано. Измените настройки в
            браузере.
          </Alert>
        ) : (
          <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)' }}>
                  {pushSubscribed
                    ? 'Отключить push-уведомления'
                    : 'Включить push-уведомления'}
                </Typography>
                <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                  Получать уведомления в браузере
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {pushLoading && <CircularProgress size={16} />}
                <Switch
                  checked={pushSubscribed}
                  onChange={
                    pushSubscribed
                      ? handleDisablePushNotifications
                      : handleEnablePushNotifications
                  }
                  disabled={pushLoading}
                />
              </Box>
            </Box>
          </Paper>
        )}

        {pushLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
              Обработка...
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2, borderColor: 'rgb(24 24 24)' }} />

      {/* Telegram уведомления */}
      <Box sx={sectionStyle}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TelegramIcon sx={{ color: '#0088cc' }} />
            <Box>
              <Typography
                variant='subtitle1'
                sx={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}
              >
                Telegram уведомления
              </Typography>
              <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                Получайте уведомления в Telegram
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!notificationPrefs.telegramConnected && (
              <Chip
                label='Не подключен'
                size='small'
                color='error'
                icon={<ErrorIcon />}
              />
            )}
            {notificationPrefs.telegramNotificationsEnabled && (
              <Chip
                label='Активно'
                size='small'
                color='success'
                icon={<CheckCircleIcon />}
              />
            )}
          </Box>
        </Box>

        {!notificationPrefs.telegramConnected ? (
          <Box>
            <Alert severity='info' sx={{ mb: 2 }}>
              Для получения Telegram уведомлений необходимо подключить аккаунт
            </Alert>
            <Button
              variant='outlined'
              onClick={() => setTelegramDialogOpen(true)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'var(--theme-text-primary)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Подключить Telegram
            </Button>
          </Box>
        ) : (
          <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)' }}>
                  {notificationPrefs.telegramNotificationsEnabled
                    ? 'Отключить Telegram уведомления'
                    : 'Включить Telegram уведомления'}
                </Typography>
                <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                  Получать уведомления в Telegram
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {savingPrefs && <CircularProgress size={16} />}
                <Switch
                  checked={notificationPrefs.telegramNotificationsEnabled}
                  onChange={handleToggleTelegramNotifications}
                  disabled={savingPrefs}
                />
              </Box>
            </Box>
          </Paper>
        )}

        {savingPrefs && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
              Сохранение...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Диалог подключения Telegram */}
      <Dialog
        open={telegramDialogOpen}
        onClose={() => setTelegramDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--main-border-radius)',
          },
        }}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>
          Подключение Telegram
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
            Введите ваш Telegram ID для подключения уведомлений
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
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
              },
              '& .MuiInputBase-input': {
                color: 'text.primary',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setTelegramDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveTelegramId}
            disabled={savingTelegramId}
            variant='contained'
            sx={{
              background: 'linear-gradient(45deg, #0088cc, #00a8ff)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0077b3, #0099e6)',
              },
            }}
          >
            {savingTelegramId ? <CircularProgress size={20} /> : 'Подключить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsForm;
