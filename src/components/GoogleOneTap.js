import React, { useEffect, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Snackbar, Box, Typography, CircularProgress } from '@mui/material';
import { GOOGLE_CONFIG } from '../services/config';
import { AuthContext } from '../context/AuthContext';

const GoogleOneTap = ({ redirectPath = '/' }) => {
  const { login } = useContext(AuthContext);
  const [showFedCMNotification, setShowFedCMNotification] = useState(false);

  const handleCloseFedCMNotification = () => {
    setShowFedCMNotification(false);
  };

  const handleCredentialResponse = async (response) => {
    try {
      console.log('Google One Tap credential response:', response);
      
      // Отправляем JWT токен на бэкенд для проверки и авторизации
      const result = await login({
        googleToken: response.credential,
        preventRedirect: false,
      });

      if (result && result.success) {
        console.log('Google авторизация успешна');
        // Навигация будет обработана в AuthContext
      } else {
        console.error('Ошибка Google авторизации:', result?.error);
        
        // Если требуется регистрация
        if (result?.registration_required) {
          alert(`Аккаунт с данным email не найден.\n\nПожалуйста, зарегистрируйтесь на сайте, используя email: ${result.email}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при обработке Google One Tap:', error);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google && window.google.accounts) {
      // Просто вызываем prompt программно
      window.google.accounts.id.prompt((notification) => {
        console.log('Google login notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt не показан, FedCM отключен пользователем');
          // Показываем уведомление о том, что FedCM отключен
          setShowFedCMNotification(true);
        }
      });
    } else {
      console.error('Google Identity Services не загружен');
    }
  };

  useEffect(() => {
    if (window.google && window.google.accounts) {
      // Инициализация Google Identity Services
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CONFIG.clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Не рендерим скрытую кнопку, используем только программный вызов

      // Не показываем автоматический prompt, используем только кастомную кнопку
      // window.google.accounts.id.prompt((notification) => {
      //   console.log('Google One Tap notification:', notification);
      // });
    } else {
      console.warn('Google Identity Services не загружен');
    }
  }, []);

    return (
    <>
      <Button
        fullWidth
        variant='outlined'
        onClick={handleGoogleLogin}
        sx={{
          py: 1.25,
          borderRadius: 2,
          textTransform: 'none',
          borderColor: '#4285f4',
          color: '#4285f4',
          '&:hover': {
            borderColor: '#4285f4',
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
          },
          '& svg': {
            '& path': {
              fill: '#4285f4 !important',
            },
          },
        }}
        startIcon={
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
            <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
            <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
            <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
          </svg>
        }
      >
        Войти через Google
      </Button>

      {/* Уведомление о том, что FedCM отключен - рендерится через портал */}
      {showFedCMNotification && createPortal(
        <Snackbar
          open={showFedCMNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={handleCloseFedCMNotification}
          sx={{
            '& .MuiSnackbar-root': {
              top: '20px',
            },
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              background: 'var(--background-color)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minWidth: '300px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >

            <Box>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'var(--text-color)',
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                Авторизация через внешние сервисы отключена
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'var(--text-secondary)',
                }}
              >
                В вашем браузере отключена авторизация через Google. Включите её в настройках браузера или используйте вход по email.
              </Typography>
            </Box>
          </Box>
        </Snackbar>,
        document.body
      )}
    </>
  );
};

export default GoogleOneTap;