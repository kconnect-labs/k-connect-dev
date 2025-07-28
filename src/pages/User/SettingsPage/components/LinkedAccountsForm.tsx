import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  IconButton,
  SvgIcon,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import TelegramIcon from '@mui/icons-material/Telegram';
import axios from 'axios';

// Element Icon component
const ElementIcon = (props: any) => (
  <SvgIcon {...props}>
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.17 14.93l-4.11-4.11 1.41-1.41 2.7 2.7 5.88-5.88 1.41 1.41-7.29 7.29z' />
  </SvgIcon>
);

interface LinkedAccountsFormProps {
  onSuccess?: () => void;
  profileData?: any;
}

const LinkedAccountsForm: React.FC<LinkedAccountsFormProps> = ({
  onSuccess,
  profileData,
}) => {
  const theme = useTheme();
  const [elementConnected, setElementConnected] = useState(false);
  const [elementLinking, setElementLinking] = useState(false);
  const [elementToken, setElementToken] = useState('');
  const [loadingElementStatus, setLoadingElementStatus] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [loadingTelegramStatus, setLoadingTelegramStatus] = useState(false);

  // Загрузка настроек уведомлений для проверки статуса Telegram
  const loadNotificationPreferences = async () => {
    try {
      setLoadingTelegramStatus(true);
      const response = await axios.get('/api/notifications/preferences');

      if (response.data) {
        const telegramConnected = response.data.telegram_connected;
        setTelegramConnected(telegramConnected);
        console.log('Telegram status loaded:', telegramConnected);
      }

      setLoadingTelegramStatus(false);
    } catch (error) {
      console.error('Ошибка загрузки настроек уведомлений:', error);
      setLoadingTelegramStatus(false);
    }
  };

  // Инициализация состояния связанных аккаунтов
  useEffect(() => {
    if (profileData?.user) {
      if (profileData.user.element_connected !== undefined) {
        setElementConnected(profileData.user.element_connected);
      } else {
        setElementConnected(!!profileData.user.elem_id);
      }
    }

    // Загружаем статус Telegram отдельно
    loadNotificationPreferences();
  }, [profileData]);

  // Проверка статуса Element
  const checkElementStatus = async () => {
    try {
      if (!loadingElementStatus && elementConnected !== null) {
        return elementConnected;
      }

      setLoadingElementStatus(true);
      const response = await axios.get('/api/profile/element/status');

      const isConnected = response.data && response.data.connected;
      if (isConnected) {
        setElementConnected(true);
      } else {
        setElementConnected(false);
      }
      setLoadingElementStatus(false);
      return isConnected;
    } catch (error) {
      console.error('Ошибка при проверке статуса Element:', error);
      setElementConnected(false);
      setLoadingElementStatus(false);
      return false;
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
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Ошибка при генерации токена Element:', error);
      setElementLinking(false);
    }
  };

  // Обработчик подключения Element
  const handleLinkElement = () => {
    generateElementToken();

    const checkInterval = setInterval(() => {
      checkElementStatus().then(isConnected => {
        if (isConnected) {
          clearInterval(checkInterval);
          setElementLinking(false);
          setElementToken('');
          if (onSuccess) onSuccess();
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

  const containerStyle = {
    p: 3,
    borderRadius: 2,
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };

  const listItemStyle = {
    py: 1.5,
    px: 2,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.background.default, 0.4),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    mb: 1,
  };

  const buttonStyle = {
    bgcolor: 'rgba(208, 188, 255, 0.1)',
    color: '#D0BCFF',
    border: '1px solid rgba(208, 188, 255, 0.3)',
    boxShadow: 'none',
    minWidth: 'auto',
    px: 2,
    '&:hover': {
      bgcolor: 'rgba(208, 188, 255, 0.2)',
    },
  };

  const connectedButtonStyle = {
    bgcolor: 'transparent',
    color: 'success.main',
    border: 'none',
    boxShadow: 'none',
    minWidth: 'auto',
    px: 2,
  };

  return (
    <Box sx={containerStyle}>
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
        <LinkIcon />
        Связанные аккаунты
      </Typography>

      <List disablePadding>
        {/* Telegram аккаунт */}
        <ListItem sx={listItemStyle}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <TelegramIcon
              sx={{ color: telegramConnected ? '#D0BCFF' : '#777' }}
            />
          </ListItemIcon>
          <ListItemText
            primary='Telegram'
            primaryTypographyProps={{ fontWeight: 500 }}
            secondary={
              loadingTelegramStatus
                ? 'Проверка статуса...'
                : telegramConnected
                  ? 'Подключен'
                  : 'Не подключен'
            }
          />
          {loadingTelegramStatus ? (
            <CircularProgress size={24} sx={{ color: '#D0BCFF' }} />
          ) : (
            <Button
              variant='contained'
              size='small'
              disabled={true} // Пока отключаем, так как нет диалога Telegram
              sx={telegramConnected ? connectedButtonStyle : buttonStyle}
            >
              {telegramConnected ? (
                <CheckIcon fontSize='small' />
              ) : (
                'Подключить'
              )}
            </Button>
          )}
        </ListItem>

        {/* Element аккаунт */}
        <ListItem sx={listItemStyle}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ElementIcon
              sx={{ color: elementConnected ? '#D0BCFF' : '#777' }}
            />
          </ListItemIcon>
          <ListItemText
            primary='Element'
            primaryTypographyProps={{ fontWeight: 500 }}
            secondary={
              loadingElementStatus
                ? 'Проверка статуса...'
                : elementConnected
                  ? 'Подключен'
                  : 'Не подключен'
            }
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
              sx={elementConnected ? connectedButtonStyle : buttonStyle}
            >
              {elementConnected ? <CheckIcon fontSize='small' /> : 'Подключить'}
            </Button>
          )}
        </ListItem>
      </List>

      <Typography
        variant='body2'
        sx={{ color: 'text.secondary', mt: 2, fontSize: '0.875rem' }}
      >
        Подключите внешние аккаунты для расширенного функционала
      </Typography>
    </Box>
  );
};

export default LinkedAccountsForm;
