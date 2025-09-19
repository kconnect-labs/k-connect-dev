import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import MobilePlayer from '../../components/Music/MobilePlayer';
import AllTracksBlock from './components/AllTracksBlock';

const AllTracksPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentTrack } = useMusic();

  return (
    <Box sx={{ p: 2 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton
          color='inherit'
          onClick={() => navigate('/music')}
          sx={{ mr: 1 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant='h6'
          fontWeight='600'
          sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
        >
          Все треки
        </Typography>
      </Box>

      {/* AllTracksBlock с встроенным поиском */}
      <AllTracksBlock />

      {/* Mobile Player */}
      <MobilePlayer isMobile={isMobile} />
    </Box>
  );
};

export default AllTracksPage;
