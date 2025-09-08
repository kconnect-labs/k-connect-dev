import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export const SuspenseFallback = () => {
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
        size={32}
        thickness={3}
        sx={{
          color: 'var(--theme-main-color)',
        }}
      />
    </Box>
  );
};

export const LoadingIndicator = () => {
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
        size={32}
        thickness={3}
        sx={{
          color: 'var(--theme-main-color)',
        }}
      />
    </Box>
  );
};
