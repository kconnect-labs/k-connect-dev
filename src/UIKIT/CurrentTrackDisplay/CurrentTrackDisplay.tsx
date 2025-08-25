import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
// @ts-ignore
import { MusicContext } from '../../context/MusicContext.js';
import axios from 'axios';

// Анимация для линий
const lineAnimation = keyframes`
  0%, 100% { height: 4px; }
  50% { height: 20px; }
`;

const lineAnimation2 = keyframes`
  0%, 100% { height: 8px; }
  50% { height: 16px; }
`;

const lineAnimation3 = keyframes`
  0%, 100% { height: 12px; }
  50% { height: 24px; }
`;

// Анимация прокрутки текста
const scrollText = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

const StyledContainer = styled(Box)<{ statusColor?: string }>(({ theme, statusColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 12px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: statusColor 
    ? `1px solid ${statusColor}33`
    : '1px solid rgba(255, 255, 255, 0.12)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  maxWidth: '100%',
  overflow: 'hidden',
}));

const AnimatedLines = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: 2,
  height: 24,
  flexShrink: 0,
});

const Line = styled(Box)<{ delay: number; animation: string; statusColor?: string; getLighterColor?: (color: string) => string }>(({ delay, animation, statusColor, getLighterColor }) => ({
  width: 3,
  borderRadius: 2,
  background: statusColor && getLighterColor
    ? `linear-gradient(180deg, ${statusColor} 0%, ${getLighterColor(statusColor)} 100%)`
    : 'linear-gradient(180deg, #4CAF50 0%, #81C784 100%)',
  animation: `${animation} 1.2s ease-in-out infinite`,
  animationDelay: `${delay}s`,
}));

const TextContainer = styled(Box)({
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
});

const ScrollingText = styled(Typography)<{ shouldScroll: boolean }>(({ shouldScroll }) => ({
  whiteSpace: 'nowrap',
  animation: shouldScroll ? `${scrollText} 8s linear infinite` : 'none',
  animationDelay: '2s',
}));

interface CurrentTrackDisplayProps {
  track: {
    id: number;
    title: string;
    artist: string;
  };
  onClick?: () => void;
  statusColor?: string;
  getLighterColor?: (color: string) => string;
}

const CurrentTrackDisplay: React.FC<CurrentTrackDisplayProps> = ({ track, onClick, statusColor, getLighterColor }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const { playTrack, currentTrack, togglePlay } = useContext(MusicContext) as {
    playTrack: (track: any, section?: string | null) => void;
    currentTrack: any | null;
    togglePlay: () => void;
  };

  useEffect(() => {
    if (textRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = textRef.current.clientWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  }, [track.title, track.artist]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Проверяем, играет ли уже этот трек
      const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id;

      if (isCurrentlyPlaying) {
        togglePlay();
      } else {
        // Загружаем полный объект трека с сервера перед воспроизведением
        axios.get(`/api/music/${track.id}`)
          .then(response => {
            if (response.data && response.data.success && response.data.track) {
              const fullTrack = response.data.track;
              playTrack(fullTrack, 'profile');
              
              // Увеличиваем счетчик прослушиваний
              return axios.post(`/api/music/${track.id}/play`, {}, { withCredentials: true });
            } else {
              console.error('Failed to load track from server:', track.id);
            }
          })
          .then(() => {
            console.log('Track play request sent:', track.id);
          })
          .catch(error => {
            console.error('Error playing track:', error);
          });
      }
    }
  };

  const displayText = `${track.title} - ${track.artist}`;

  return (
    <Tooltip title="Слушать вместе?" arrow>
      <StyledContainer onClick={handleClick} statusColor={statusColor}>
        <AnimatedLines>
          <Line delay={0} animation={lineAnimation} statusColor={statusColor} getLighterColor={getLighterColor} />
          <Line delay={0.2} animation={lineAnimation2} statusColor={statusColor} getLighterColor={getLighterColor} />
          <Line delay={0.4} animation={lineAnimation3} statusColor={statusColor} getLighterColor={getLighterColor} />
        </AnimatedLines>
        
        <TextContainer>
          <ScrollingText
            ref={textRef}
            variant="body2"
            shouldScroll={shouldScroll}
            sx={{
              color: 'var(--theme-text-primary)',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {displayText}
          </ScrollingText>
        </TextContainer>
      </StyledContainer>
    </Tooltip>
  );
};

export default CurrentTrackDisplay;
