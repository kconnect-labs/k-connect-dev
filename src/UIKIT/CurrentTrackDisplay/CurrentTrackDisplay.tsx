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

// Анимация fade для переключения между текстами
const fadeInOut = keyframes`
  0%, 100% { opacity: 0; transform: translateY(10px); }
  50% { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled(Box)<{ statusColor?: string }>(({ theme, statusColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 12px',
  borderRadius: '18px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: statusColor 
    ? `1px solid ${statusColor}33`
    : '1px solid rgb(24 24 24)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  maxWidth: '372px',
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
  borderRadius: 'var(--main-border-radius)',
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

const AnimatedText = styled(Typography)<{ isVisible: boolean }>(({ isVisible }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  whiteSpace: 'nowrap',
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  pointerEvents: isVisible ? 'auto' : 'none',
}));

interface CurrentTrackDisplayProps {
  track: {
    id: number;
    title: string;
    artist: string;
    lyrics_display_mode?: string;
  };
  userId?: number; // ID пользователя, чьи лирики нужно загрузить
  onClick?: () => void;
  statusColor?: string;
  getLighterColor?: (color: string) => string;
}

const CurrentTrackDisplay: React.FC<CurrentTrackDisplayProps> = ({ track, userId, onClick, statusColor, getLighterColor }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const [lyricsLines, setLyricsLines] = useState<string[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const { playTrack, currentTrack, togglePlay } = useContext(MusicContext) as {
    playTrack: (track: any, section?: string | null) => void;
    currentTrack: any | null;
    togglePlay: () => void;
  };

  // Загружаем лирики при изменении трека или пользователя
  useEffect(() => {
    if (track.lyrics_display_mode === 'lyrics' && userId) {
      loadLyrics();
    } else {
      setLyricsLines([]);
    }
  }, [track.id, track.lyrics_display_mode, userId]);

  // Анимация переключения текстов
  useEffect(() => {
    if (lyricsLines.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        
        // Задержка для анимации fade out (увеличено время)
        setTimeout(() => {
          setCurrentTextIndex((prev) => {
            const nextIndex = (prev + 1) % (lyricsLines.length + 1); // +1 для названия трека
            console.log('Switching to text index:', nextIndex, 'Total texts:', lyricsLines.length + 1);
            return nextIndex;
          });
          
          // Задержка для анимации fade in (увеличено время)
          setTimeout(() => {
            setIsAnimating(false);
          }, 200);
        }, 800); // Увеличено с 400ms до 800ms
      }, 3000); // Переключаем каждые 3 секунды

      return () => clearInterval(interval);
    }
  }, [lyricsLines]);

  const loadLyrics = async () => {
    if (isLoadingLyrics || !userId) return;
    
    setIsLoadingLyrics(true);
    try {
      const response = await axios.get(`/api/user/${userId}/current-music-lyrics`, {
        withCredentials: true
      });
      
      if (response.data.success && response.data.lyrics_lines) {
        setLyricsLines(response.data.lyrics_lines);
      }
    } catch (error) {
      console.error('Error loading lyrics:', error);
      setLyricsLines([]);
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  useEffect(() => {
    if (textRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = textRef.current.clientWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  }, [track.title, track.artist, lyricsLines, currentTextIndex]);

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
  
  // Определяем какой текст показывать
  const getCurrentDisplayText = () => {
    if (lyricsLines.length === 0) {
      return displayText;
    }
    
    if (currentTextIndex === 0) {
      return displayText; // Показываем название трека
    } else {
      const lyricsLine = lyricsLines[currentTextIndex - 1];
      return lyricsLine; // Показываем строку лириков
    }
  };

  const currentText = getCurrentDisplayText();

  return (
    <Tooltip title="Слушать вместе?" arrow>
      <StyledContainer onClick={handleClick} statusColor={statusColor}>
        <AnimatedLines>
          <Line delay={0} animation={lineAnimation} statusColor={statusColor} getLighterColor={getLighterColor} />
          <Line delay={0.2} animation={lineAnimation2} statusColor={statusColor} getLighterColor={getLighterColor} />
          <Line delay={0.4} animation={lineAnimation3} statusColor={statusColor} getLighterColor={getLighterColor} />
        </AnimatedLines>
        
        <TextContainer>
          {lyricsLines.length > 0 ? (
            // Анимированный текст для лириков
            <AnimatedText
              ref={textRef}
              variant="body2"
              isVisible={!isAnimating}
              sx={{
                color: 'var(--theme-text-primary)',
                fontWeight: 500,
                fontSize: '0.875rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {currentText}
            </AnimatedText>
          ) : (
            // Обычный прокручивающийся текст
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
          )}
        </TextContainer>
      </StyledContainer>
    </Tooltip>
  );
};

export default CurrentTrackDisplay;
