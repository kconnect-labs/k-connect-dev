import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

import { MusicContext } from '../../context/MusicContext.js';
import axios from 'axios';


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


const scrollText = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;


const fadeInOut = keyframes`
  0%, 100% { opacity: 0; transform: translateY(10px); }
  50% { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'statusColor',
})<{ statusColor?: string }>(({ theme, statusColor }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 12px',
  borderRadius: 'var(--main-border-radius)',
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

const Line = styled(Box, {
  shouldForwardProp: (prop) => !['delay', 'animation', 'statusColor', 'getLighterColor'].includes(prop as string),
})<{ delay: number; animation: string; statusColor?: string; getLighterColor?: (color: string) => string }>(({ delay, animation, statusColor, getLighterColor }) => ({
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

const ScrollingText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'shouldScroll',
})<{ shouldScroll: boolean }>(({ shouldScroll }) => ({
  whiteSpace: 'nowrap',
  animation: shouldScroll ? `${scrollText} 8s linear infinite` : 'none',
  animationDelay: '2s',
}));

const AnimatedText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isVisible',
})<{ isVisible: boolean }>(({ isVisible }) => ({
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
  userId?: number; 
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

  
  useEffect(() => {
    if (track.lyrics_display_mode === 'lyrics' && userId) {
      loadLyrics();
    } else {
      setLyricsLines([]);
    }
  }, [track.id, track.lyrics_display_mode, userId]);

  
  useEffect(() => {
    if (lyricsLines.length > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        
        
        setTimeout(() => {
          setCurrentTextIndex((prev) => {
            const nextIndex = (prev + 1) % (lyricsLines.length + 1); 
            return nextIndex;
          });
          
          
          setTimeout(() => {
            setIsAnimating(false);
          }, 200);
        }, 800); 
      }, 3000); 

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
      
      const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id;

      if (isCurrentlyPlaying) {
        togglePlay();
      } else {
        
        axios.get(`/api/music/${track.id}`)
          .then(response => {
            if (response.data && response.data.success && response.data.track) {
              const fullTrack = response.data.track;
              playTrack(fullTrack, 'profile');
              
              
              return axios.post(`/api/music/${track.id}/play`, {}, { withCredentials: true })
                .then(() => {
                  // Дополнительно обновляем настройки приватности
                  return axios.post(
                    '/api/user/settings/music-privacy',
                    { current_music_id: track.id },
                    { withCredentials: true }
                  );
                });
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
  
  
  const getCurrentDisplayText = () => {
    if (lyricsLines.length === 0) {
      return displayText;
    }
    
    if (currentTextIndex === 0) {
      return displayText; 
    } else {
      const lyricsLine = lyricsLines[currentTextIndex - 1];
      return lyricsLine; 
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
