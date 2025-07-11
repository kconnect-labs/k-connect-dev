import React, { useState, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  styled,
  CircularProgress,
  Grid,
  Paper,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Favorite,
  Star,
  Search,
  PlayArrowRounded,
  PauseRounded,
  MusicNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import MyVibeWidget from './components/MyVibeWidget';
import ChartsBlock from './components/ChartsBlock';
import ArtistsBlock from './components/ArtistsBlock';
import apiClient from '../../services/axiosConfig';
import {BlockContainer, BlockContainerContent, BlockContainerIcon, MusicTypeContainer} from './components/BlockContainer';

// Стили для блоков
// const BlockContainer = styled(Paper)(({ theme }) => ({
//   padding: theme.spacing(1),
//   marginBottom: theme.spacing(0.5),
//   borderRadius: 12,
//   background: 'rgba(255, 255, 255, 0.03)',
//   backdropFilter: 'blur(20px)',
//   display: 'flex',
//   alignItems: 'center',
//   boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
//   cursor: 'pointer',
//   transition: 'box-shadow 0.2s, transform 0.2s',
//   borderWidth: '1px',
//   borderStyle: 'solid',
//   borderColor: 'rgba(255, 255, 255, 0.1)',
// }));

const MusicPage = () => {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack, 
    currentSection,
    togglePlay
  } = useMusic();

  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Обработчики для MyVibeWidget
  const handleVibeClick = useCallback(async () => {
    const isVibePlaying = isPlaying && currentSection === 'my-vibe';
    
    if (isVibePlaying) {
      togglePlay();
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get('/api/music/my-vibe');
      console.log('My Vibe response:', response.data);
      
      if (response.data && response.data.success && response.data.tracks && response.data.tracks.length > 0) {
        // Воспроизводим первый трек из плейлиста "Мой Вайб"
        const firstTrack = response.data.tracks[0];
        playTrack(firstTrack, 'my-vibe');
      } else {
        console.log('No tracks found in response:', response.data);
        setError('Не удалось найти треки для вашего вайба. Попробуйте лайкнуть что-нибудь!');
        setSnackbar({ open: true, message: 'Не удалось найти треки для вашего вайба. Попробуйте лайкнуть что-нибудь!', severity: 'warning' });
      }
    } catch (err) {
      console.error("Failed to fetch My Vibe playlist:", err);
      setError('Не удалось загрузить плейлист "Мой Вайб". Попробуйте еще раз.');
      setSnackbar({ open: true, message: 'Не удалось загрузить плейлист "Мой Вайб". Попробуйте еще раз.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, playTrack, isPlaying, currentSection, togglePlay]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
		<Box sx={{ p: 1, paddingBottom: 10 }}>
			{/* Основной контент */}
			<Box sx={{ mt: 2 }}>
				{/* My Vibe Widget */}
				<Box sx={{ mb: 0.5, position: 'relative' }}>
					<MyVibeWidget
						onClick={handleVibeClick}
						isPlaying={isPlaying && currentSection === 'my-vibe'}
						currentTrack={currentTrack}
						currentSection={currentSection}
					/>
				</Box>

				{/* Мои любимые */}
				<MusicTypeContainer
					title='Мои любимые'
					description='Ваши избранные треки'
					icon={<Favorite sx={{ fontSize: 24 }} />}
					onClick={() => navigate('/music/liked')}
				/>

				{/* Все треки */}
				<MusicTypeContainer
					title='Все треки'
					description='Полная коллекция с поиском'
					icon={<Star sx={{ fontSize: 24 }} />}
					onClick={() => navigate('/music/all')}
				/>

				{/* Плейлисты */}
				<MusicTypeContainer
					title='Плейлисты'
					description='Создавайте и управляйте плейлистами'
					icon={<MusicNote sx={{ fontSize: 24 }} />}
					onClick={() => navigate('/music/playlists')}
				/>

				{/* Charts Block */}
				<ChartsBlock />

				{/* Artists Block */}
				<ArtistsBlock />
			</Box>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
			>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	)
};

export default MusicPage; 