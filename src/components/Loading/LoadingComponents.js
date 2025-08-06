import React from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';

export const SuspenseFallback = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--theme-background-full)',
      }}
    >
      <CircularProgress
        color='primary'
        size={40}
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))',
        }}
      />
    </Box>
  );
};

export const LoadingIndicator = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: theme.palette.background.default,
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      {/* Анимированный фон */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
          animation: 'ripple 2s infinite ease-out',
          '@keyframes ripple': {
            '0%': {
              transform: 'translate(-50%, -50%) scale(0.8)',
              opacity: 0.3,
            },
            '50%': {
              transform: 'translate(-50%, -50%) scale(1.2)',
              opacity: 0.1,
            },
            '100%': {
              transform: 'translate(-50%, -50%) scale(1.6)',
              opacity: 0,
            },
          },
        }}
      />

      {/* Основной логотип */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg)',
              filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))',
            },
            '50%': {
              transform: 'translateY(-10px) rotate(5deg)',
              filter: 'drop-shadow(0 0 15px rgba(208, 188, 255, 0.6))',
            },
          },
        }}
      >
        <Box
          component='img'
          src='/icon-512.png'
          alt='K-Connect'
          sx={{
            width: 80,
            height: 80,
            borderRadius: '16px',
            filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))',
          }}
        />
      </Box>

      {/* Точки загрузки */}
      <Box
        sx={{
          display: 'flex',
          gap: '8px',
          marginTop: '24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map(index => (
          <Box
            key={index}
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              animation: `bounce 1.4s ease-in-out infinite both`,
              animationDelay: `${index * 0.16}s`,
              '@keyframes bounce': {
                '0%, 80%, 100%': {
                  transform: 'scale(0.8)',
                  opacity: 0.5,
                },
                '40%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>

      {/* Текст загрузки */}
      <Box
        sx={{
          marginTop: '16px',
          fontSize: '14px',
          color: theme.palette.text.secondary,
          fontWeight: 500,
          letterSpacing: '0.5px',
          animation: 'fadeInOut 2s ease-in-out infinite',
          '@keyframes fadeInOut': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 },
          },
        }}
      >
        Загрузка...
      </Box>
    </Box>
  );
};
