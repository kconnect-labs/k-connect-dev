import React, { useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  useEffect(() => {
    if (
      error?.message?.includes('Failed to fetch') ||
      error?.name === 'TypeError' ||
      error?.message?.includes('Failed to fetch dynamically imported module')
    ) {
      window.location.reload();
      return;
    }
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant='h5' sx={{ color: 'var(--theme-text-primary)' }} gutterBottom>
        Что-то пошло не так
      </Typography>
      <Typography variant='body1' sx={{ color: 'var(--theme-text-secondary)' }} paragraph>
        Пожалуйста, попробуйте перезагрузить страницу
      </Typography>
      <Box
        sx={{
          mt: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          maxWidth: '600px',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <Typography variant='subtitle2' color='error' gutterBottom>
          Детали ошибки:
        </Typography>
        <Typography
          variant='body2'
          component='pre'
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'var(--theme-text-secondary)',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          {error?.message || 'Неизвестная ошибка'}
        </Typography>
        {error?.stack && (
          <Typography
            variant='body2'
            component='pre'
            sx={{
              mt: 1,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'var(--theme-text-secondary)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              opacity: 0.7,
            }}
          >
            {error.stack}
          </Typography>
        )}
      </Box>
      <Button
        variant='contained'
        onClick={resetErrorBoundary || (() => window.location.reload())}
        sx={{ mt: 3 }}
      >
        Перезагрузить
      </Button>
    </Box>
  );
};
