import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { alpha } from '@mui/material/styles';
import styles from './MyVibe.module.css';
import { useLanguage } from '../../../context/LanguageContext';

const twinkle = keyframes`
  0%, 100% {
    opacity: 0.1;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.9;
    transform: scale(1);
  }
`;

const Star = styled('div')(({ size, top, left, delay, duration }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  top: `${top}%`,
  left: `${left}%`,
  background: alpha('#FFFFFF', 0.9),
  borderRadius: '50%',
  boxShadow: `0 0 8px 2px ${alpha('#FFFFFF', 0.5)}`,
  animation: `${twinkle} ${duration}s ease-in-out ${delay}s infinite alternate`,
}));

const StarsContainer = () => {
  // Генерируем звезды с рандомными параметрами
  const stars = React.useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1, // от 1 до 3px
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2, // от 2 до 5 секунд
      })),
    []
  );

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      {stars.map(star => (
        <Star key={star.id} {...star} />
      ))}
    </Box>
  );
};



const CurrentTrackInfo = styled(Box)({
  position: 'absolute',
  bottom: '16px',
  left: '16px',
  right: '16px',
  zIndex: 3,
  background: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(8px)',
  borderRadius: '8px',
  padding: '8px 12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

const PlayButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.2),
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  width: 72,
  height: 72,
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.3),
    transform: 'scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '2.8rem',
    color: theme.palette.common.white,
  },
}));

const MyVibeWidget = ({ onClick, isPlaying, currentTrack, currentSection }) => {
  const isVibePlaying = isPlaying && currentSection === 'my-vibe';
  const showCurrentTrack = isVibePlaying && currentTrack;
  const { t } = useLanguage();

  return (
    <div
      className={`${styles.container} ${
        showCurrentTrack ? styles.hasCurrentTrack : ''
      }`}
      onClick={onClick}
    >
      <StarsContainer />
      <div className={styles.contentOverlay}>
        <h2 className='font-bold text-lg'>{t('music.my_vibe.title')}</h2>
        <Typography
          variant='body2'
          sx={{ color: alpha('#FFFFFF', 0.8), mt: 0.5 }}
        >
          {t('music.my_vibe.description')}
        </Typography>
        <PlayButton sx={{ mt: 2 }}>
          {isVibePlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </PlayButton>
      </div>

      {showCurrentTrack && (
        <CurrentTrackInfo>
          <Typography
            variant='caption'
            sx={{
              color: alpha('#FFFFFF', 0.7),
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {t('music.my_vibe.now_playing')}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: '#FFFFFF',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem',
            }}
          >
            {currentTrack.title} - {currentTrack.artist}
          </Typography>
        </CurrentTrackInfo>
      )}
    </div>
  );
};

export default MyVibeWidget;
