import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { alpha } from '@mui/material/styles';
import styles from './MyVibe.module.css';
import { useLanguage } from '../../../context/LanguageContext';
import { useMusic } from '../../../context/MusicContext';
import { useFullScreenPlayer } from '../../../components/Music/FullScreenPlayer/hooks';


const waveAnimation = keyframes`
  0%, 100% {
    transform: translateY(0) scaleY(1);
  }
  50% {
    transform: translateY(-10px) scaleY(1.2);
  }
`;

const particleFloat = keyframes`
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) translateX(10px) scale(1.1);
    opacity: 0.8;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(161, 86, 231, 0.56);
  }
  50% {
    box-shadow: 0 0 40px rgba(178, 120, 245, 0.65);
  }
`;


const generateTrackColors = (trackTitle) => {
  if (!trackTitle) {
    return {
      bass: 'rgba(110, 23, 23, 0.9)',
      mid: 'rgba(179, 30, 30, 0.7)',
      treble: 'rgba(202, 28, 28, 0.5)'
    };
  }

  
  let mainHash = 0;
  let secondaryHash = 0;
  
  for (let i = 0; i < trackTitle.length; i++) {
    const char = trackTitle.charCodeAt(i);
    mainHash = ((mainHash << 5) - mainHash) + char;
    secondaryHash = ((secondaryHash << 3) - secondaryHash) + char * (i + 1);
    mainHash = mainHash & mainHash;
    secondaryHash = secondaryHash & secondaryHash;
  }

  
  const timeFactor = 25; 
  const timeFactor2 = 18; 
  
  
  const positionFactor = trackTitle.split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0);
  
  
  const baseHue = (Math.abs(mainHash) + timeFactor + positionFactor) % 360;
  
  
  const dynamicHue = (baseHue + 12) % 360; 
  
  
  const createColor = (hue, baseSaturation, baseLightness, alpha, hueShift = 0, satShift = 0, lightShift = 0) => {
    const finalHue = (hue + hueShift) % 360;
    const saturation = Math.max(65, Math.min(85, baseSaturation + satShift));
    const lightness = Math.max(40, Math.min(65, baseLightness + lightShift));
    return `hsla(${finalHue}, ${saturation}%, ${lightness}%, ${alpha})`;
  };

  
  const bassHueShift = 5; 
  const midHueShift = 3;  
  const trebleHueShift = 7; 
  
  
  const satVariation = 4; 
  const lightVariation = 3; 

  return {
    
    bass: createColor(
      dynamicHue, 
      80, 45, 0.9, 
      bassHueShift, 
      satVariation + 5, 
      lightVariation - 5
    ),    
    
    mid: createColor(
      dynamicHue, 
      75, 55, 0.7, 
      midHueShift, 
      satVariation, 
      lightVariation
    ),     
    
    treble: createColor(
      dynamicHue, 
      70, 65, 0.5, 
      trebleHueShift, 
      satVariation - 3, 
      lightVariation + 5
    )   
  };
};


const LyricsCanvas = React.memo(({ isPlaying, lyricsData, currentTime, dominantColor, currentTrack }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [wordPositions, setWordPositions] = useState([]);
  const [fadeInWords, setFadeInWords] = useState([]);
  const [fadeOutWords, setFadeOutWords] = useState([]);
  const [oldWordPositions, setOldWordPositions] = useState([]); 


  
  const filteredLines = useMemo(() => {
    if (lyricsData?.has_synced_lyrics && Array.isArray(lyricsData.synced_lyrics)) {
      const filtered = lyricsData.synced_lyrics
        .filter(line => line && line.text !== undefined && line.text.trim().length > 0)
        .map((line, index) => ({
          ...line,
          key: `${index}-${line.text.slice(0, 10)}`,
        }));
      
      
      return filtered;
    }
    if (lyricsData?.lyrics) {
      const filtered = lyricsData.lyrics
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          text: line,
          startTimeMs: 0,
          key: `static-${index}-${line.slice(0, 10)}`,
        }));
      
      
      return filtered;
    }
    return [];
  }, [lyricsData]);

  
  const updateCurrentLine = useCallback((time) => {
    if (!lyricsData?.has_synced_lyrics || !filteredLines || filteredLines.length === 0) return;

    const currentTimeMs = time * 1000;
    let newLineIndex = -1;

    
    let left = 0;
    let right = filteredLines.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (filteredLines[mid].startTimeMs <= currentTimeMs) {
        newLineIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }


    if (newLineIndex !== currentLineIndex && newLineIndex >= 0) {
      setCurrentLineIndex(newLineIndex);
      
      
      
      
      setOldWordPositions(wordPositions);
      
      
      setFadeInWords([]);
      
      
      setFadeOutWords(prev => {
        const allCurrentWords = wordPositions.map(wp => wp.word);
        return [...prev, ...allCurrentWords.map(word => ({
          word,
          startTime: Date.now(),
          duration: 800
        }))];
      });
      
      
      setTimeout(() => {
        setOldWordPositions([]);
      }, 1000);
      
      const currentLine = filteredLines[newLineIndex];
      if (currentLine && currentLine.text && currentLine.text.trim().length > 0) {
        const rawWords = currentLine.text.split(' ').filter(word => word.trim().length > 0);
        
        
        const words = [];
        for (let i = 0; i < rawWords.length; i++) {
          const currentWord = rawWords[i];
          if (currentWord.length <= 2 && i < rawWords.length - 1) {
            
            words.push(currentWord + ' ' + rawWords[i + 1]);
            i++; 
          } else {
            words.push(currentWord);
          }
        }
        
        
        const isMobile = window.innerWidth < 768;
        const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
        const maxWords = 10; 
        const limitedWords = words.slice(0, maxWords);
        
        const newWordPositions = limitedWords.map((word, index) => {
          
          const angle = (index / limitedWords.length) * Math.PI * 2 - Math.PI / 2; 
          const radius = 0.2 + Math.random() * 0.2; 
          const x = 0.5 + Math.cos(angle) * radius;
          const y = 0.5 + Math.sin(angle) * radius;
          
          return {
            word,
            x: Math.max(0.1, Math.min(0.9, x)), 
            y: Math.max(0.2, Math.min(0.8, y)), 
            scale: 0,
            opacity: 0,
            rotation: (Math.random() - 0.5) * 0.3, 
            delay: index * 150, 
            duration: 1000 + Math.random() * 500, 
            startTime: Date.now(),
          };
        });
        
        setWordPositions(newWordPositions);
        
        
        
        
        newWordPositions.forEach((wordPos, index) => {
          setTimeout(() => {
            setFadeInWords(prev => {
              
              const filtered = prev.filter(fw => fw.word !== wordPos.word);
              return [...filtered, { ...wordPos, startTime: Date.now() }];
            });
          }, 1000 + (index * 200)); 
        });
        
        
        
      }
    }
  }, [lyricsData, filteredLines, currentLineIndex]);

  useEffect(() => {
    updateCurrentLine(currentTime);
  }, [currentTime, updateCurrentLine]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = isMobile || isLowEnd ? 1 : (window.devicePixelRatio || 1); 
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = !isLowEnd; 
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastFrameTime = 0;
    const targetFPS = isMobile || isLowEnd ? 30 : 60; 
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime) => {
      
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime;
      
      
      if (isPlaying && (wordPositions.length > 0 || fadeInWords.length > 0 || fadeOutWords.length > 0)) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      if (isPlaying && wordPositions.length > 0) {
        const canvasWidth = canvas.width / (isMobile || isLowEnd ? 1 : window.devicePixelRatio);
        const canvasHeight = canvas.height / (isMobile || isLowEnd ? 1 : window.devicePixelRatio);
        
        
        
        
        
        
        
        
        const oldVisibleWords = oldWordPositions.filter(wordPos => {
          const fadeOutWord = fadeOutWords.find(fw => fw.word === wordPos.word);
          return fadeOutWord;
        });
        
        
        const newVisibleWords = wordPositions.filter(wordPos => {
          const fadeInWord = fadeInWords.find(fw => fw.word === wordPos.word);
          return fadeInWord;
        });
        
        
        const visibleWords = [...oldVisibleWords, ...newVisibleWords];
        
        visibleWords.forEach((wordPos, index) => {
          const fadeInWord = fadeInWords.find(fw => fw.word === wordPos.word);
          const fadeOutWord = fadeOutWords.find(fw => fw.word === wordPos.word);
          
          let scale = wordPos.scale;
          let opacity = wordPos.opacity;
          let yOffset = 0;
          
          
          if (fadeInWord) {
            const elapsed = Date.now() - fadeInWord.startTime;
            const progress = Math.min(1, elapsed / fadeInWord.duration);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            scale = easeOut;
            opacity = easeOut;
            yOffset = (1 - easeOut) * 20; 
          }
          
          
          if (fadeOutWord) {
            const elapsed = Date.now() - fadeOutWord.startTime;
            const progress = Math.min(1, elapsed / fadeOutWord.duration);
            
            const easeIn = Math.pow(progress, 3);
            scale = 1 - easeIn;
            opacity = 1 - easeIn;
            yOffset = easeIn * 20; 
          }
          
          const x = wordPos.x * canvasWidth;
          const y = wordPos.y * canvasHeight + yOffset;
          
          
          
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(wordPos.rotation * scale * 0.5); 
          ctx.scale(scale, scale);
          
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.globalAlpha = opacity;
          const fontSize = isMobile ? 12 + scale * 4 : 16 + scale * 6;
          ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif`;
          ctx.fillText(wordPos.word, 0, 0);
          
          ctx.restore();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, wordPositions, oldWordPositions, fadeInWords, fadeOutWords, currentTrack, dominantColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  );
});


const WaveContainer = React.memo(({ isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const { currentTime, duration, currentTrack } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      
      ctx.scale(dpr, dpr);
      
      
      ctx.imageSmoothingEnabled = false; 
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3; 
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    
    const getWaveData = () => {
      if (!isPlaying) {
        return { bass: 0, mid: 0, treble: 0, overall: 0 };
      }

      
      const progressIntensity = 0.8; 
      
      
      const kickBeat = 0.6; 
      const snareBeat = 0.4; 
      const hihatBeat = 0.3; 
      
      
      const beat1 = 0.7; 
      const beat2 = 0.8; 
      const beat3 = 0.85; 
      
      
      const bass = Math.max(beat1 * 0.8, beat2 * 0.6) * progressIntensity + (kickBeat * 0.4);
      const mid = Math.max(beat1 * 0.6, beat2 * 0.8, beat3 * 0.4) * progressIntensity + (snareBeat * 0.3);
      const treble = Math.max(beat2 * 0.4, beat3 * 0.9) * progressIntensity + (hihatBeat * 0.2);
      const overall = (bass + mid + treble) / 3;
      
      return { bass, mid, treble, overall };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (isPlaying) {
        const time = Date.now() * 0.001;
        const canvasWidth = canvas.width / window.devicePixelRatio;
        const canvasHeight = canvas.height / window.devicePixelRatio;
        
        
        const waveData = getWaveData();
        const { bass, mid, treble, overall } = waveData;
        
        
        const trackColors = generateTrackColors(currentTrack?.title);
        
        
        const waves = [
          {
            intensity: bass,
            baseHeight: canvasHeight * 0.25, 
            color: trackColors.bass,
            frequency: 0.012,
            amplitude: 20
          },
          {
            intensity: mid,
            baseHeight: canvasHeight * 0.45, 
            color: trackColors.mid,
            frequency: 0.01,
            amplitude: 25
          },
          {
            intensity: treble,
            baseHeight: canvasHeight * 0.65, 
            color: trackColors.treble,
            frequency: 0.008,
            amplitude: 30
          }
        ];
        
        
        waves.forEach((wave, waveIndex) => {
          ctx.beginPath();
          
          
          const dynamicAmplitude = wave.amplitude * (0.4 + wave.intensity * 2.2);
          const dynamicFreq = wave.frequency * (0.7 + wave.intensity * 1.2);
          
          
          ctx.moveTo(0, canvasHeight);
          
          
          for (let x = 0; x <= canvasWidth; x += 0.5) { 
            
            const wave1 = Math.sin((x * dynamicFreq) + (time * (0.8 + waveIndex * 0.2))) * dynamicAmplitude;
            const wave2 = Math.sin((x * dynamicFreq * 1.3) + (time * (1.1 + waveIndex * 0.15))) * (dynamicAmplitude * 0.4);
            const wave3 = Math.sin((x * dynamicFreq * 0.8) + (time * (0.6 + waveIndex * 0.1))) * (dynamicAmplitude * 0.3);
            
            const y = wave.baseHeight + wave1 + wave2 + wave3;
            ctx.lineTo(x, y);
          }
          
          
          ctx.lineTo(canvasWidth, canvasHeight);
          ctx.closePath();
          
          
          const gradient = ctx.createLinearGradient(0, wave.baseHeight, 0, canvasHeight);
          gradient.addColorStop(0, wave.color);
          gradient.addColorStop(0.2, wave.color.replace(/[\d.]+\)$/g, '0.8)'));
          gradient.addColorStop(0.4, wave.color.replace(/[\d.]+\)$/g, '0.6)'));
          gradient.addColorStop(0.7, wave.color.replace(/[\d.]+\)$/g, '0.3)'));
          gradient.addColorStop(1, wave.color.replace(/[\d.]+\)$/g, '0.05)'));
          
          
          ctx.fillStyle = gradient;
          ctx.fill();
          
          
          ctx.strokeStyle = wave.color;
          ctx.lineWidth = 3; 
          ctx.stroke();
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        borderRadius: 'var(--main-border-radius)',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: 'calc(100% + 10px)',
          height: 'calc(100% + 5px)',
          display: 'block',
          position: 'relative',
          left: '-5px',
        }}
      />
    </div>
  );
});



const CurrentTrackInfo = styled(Box)({
  position: 'absolute',
  bottom: '16px',
  left: '16px',
  right: '16px',
  zIndex: 3,
      background: 'var(--theme-background)',
    backdropFilter: 'var(--theme-backdrop-filter)',
  borderRadius: 'var(--small-border-radius)',
  padding: '8px 12px',
  border: '1px solid rgba(66, 66, 66, 0.5)',
});

const PlayButton = styled(IconButton)(({ theme }) => ({
  width: 72,
  height: 72,
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '2.8rem',
    color: theme.palette.common.white,
  },
}));


const StaticParticles = React.memo(() => {
  const particles = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
    const count = isMobile || isLowEnd ? 5 : 8;
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 1.5 + 0.8,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 3,
    }));
  }, []);

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: 'var(--avatar-border-radius)',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.4)',
            animation: `${particleFloat} ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
          }}
        />
      ))}
    </Box>
  );
});

const MyVibeWidget = ({ 
  onClick, 
  isPlaying, 
  currentTrack, 
  currentSection 
}) => {
  const isVibePlaying = isPlaying && currentSection === 'my-vibe';
  const showCurrentTrack = isVibePlaying && currentTrack;
  const { t } = useLanguage();
  
  
  const { currentTime: contextCurrentTime, audioRef } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  
  
  useEffect(() => {
    if (!isVibePlaying) return;

    const updateTime = () => {
      if (audioRef?.current) {
        const audioTime = audioRef.current.currentTime;
        if (!isNaN(audioTime)) {
          setCurrentTime(audioTime);
        }
      }
    };

    const interval = setInterval(updateTime, 100);
    return () => clearInterval(interval);
  }, [isVibePlaying, audioRef]);

  
  useEffect(() => {
    if (currentTrack) {
      setCurrentTime(0);
    }
  }, [currentTrack?.id]);

  
  
  const {
    lyricsData,
    loadingLyrics,
    dominantColor,
    filteredLines,
  } = useFullScreenPlayer(true, () => {});



  return (
    <div
      className={`${styles.container} ${
        showCurrentTrack ? styles.hasCurrentTrack : ''
      } ${isVibePlaying ? styles.playing : ''}`}
      onClick={onClick}
    >
      {/* Анимированная волна когда играет */}
      {isVibePlaying && <WaveContainer isPlaying={isVibePlaying} />}
      
      {/* Лирики в канвасе когда играет и есть данные */}
      {isVibePlaying && lyricsData && (lyricsData.has_synced_lyrics || lyricsData.lyrics) && (
        <LyricsCanvas 
          isPlaying={isVibePlaying}
          lyricsData={lyricsData}
          currentTime={currentTime}
          dominantColor={dominantColor}
          currentTrack={currentTrack}
        />
      )}
      
      {/* Статичные частицы когда не играет */}
      {!isVibePlaying && <StaticParticles />}
      
      <div className={styles.contentOverlay}>
        <h2 className='font-bold text-lg' style={{ marginTop: '85px' }}>{t('music.my_vibe.title')}</h2>

        <PlayButton sx={{ mb: 14 }}>
          {isVibePlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </PlayButton>
      </div>

      {showCurrentTrack && (
        <CurrentTrackInfo>

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

const MemoizedMyVibeWidget = React.memo(MyVibeWidget);


MemoizedMyVibeWidget.defaultProps = {
  onClick: () => {},
  isPlaying: false,
  currentTrack: null,
  currentSection: 'my-vibe'
};

export default MemoizedMyVibeWidget;

