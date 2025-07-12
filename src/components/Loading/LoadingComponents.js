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
        backgroundColor: theme.palette.background.default
      }}
    >
      <CircularProgress 
        color="primary" 
        size={40} 
        thickness={4} 
        sx={{ 
          color: theme.palette.primary.main,
          filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))'
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
        backgroundColor: theme.palette.background.default
      }}
    >
      <Box 
        sx={{
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.2)' },
          }
        }}
      >
        <Box 
          component="img" 
          src="/icon-512.png" 
          alt="K-Connect"
          sx={{ 
            width: 80, 
            height: 80,
            filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))'
          }} 
        />
      </Box>
    </Box>
  );
}; 