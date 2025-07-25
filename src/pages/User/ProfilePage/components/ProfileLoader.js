import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const ProfileLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default ProfileLoader;
