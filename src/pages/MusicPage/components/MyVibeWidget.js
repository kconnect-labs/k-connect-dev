import React, { useRef, useEffect, useMemo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { alpha } from '@mui/material/styles';
import styles from './MyVibe.module.css';
import { useLanguage } from '../../../context/LanguageContext';
import { useMusic } from '../../../context/MusicContext';

// Оптимизированные анимации для мобильных устройств
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

// Функция для генерации цветов на основе названия трека с плавным изменением оттенков
const generateTrackColors = (trackTitle, timeOffset = 0) => {
  if (!trackTitle) {
    return {
      bass: 'rgba(110, 23, 23, 0.9)',
      mid: 'rgba(179, 30, 30, 0.7)',
      treble: 'rgba(202, 28, 28, 0.5)'
    };
  }

  // Создаем хеш из названия трека
  let hash = 0;
  for (let i = 0; i < trackTitle.length; i++) {
    const char = trackTitle.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное число
  }

  // Добавляем плавное изменение оттенка на основе времени
  const hueShift = Math.sin(timeOffset * 0.001) * 15; // Плавное изменение ±15 градусов
  
  // Генерируем цвета на основе хеша с плавным смещением
  const baseHue = Math.abs(hash) % 360;
  const hue1 = (baseHue + hueShift) % 360; // Основной цвет с плавным изменением
  const hue2 = (hue1 + 30) % 360; // Смещенный цвет
  const hue3 = (hue1 + 60) % 360; // Еще один смещенный цвет

  // Функция для создания HSL цвета с фиксированной насыщенностью и яркостью
  const createColor = (hue, saturation, lightness, alpha) => {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  };

  return {
    bass: createColor(hue1, 75, 45, 0.9),    // Темный насыщенный
    mid: createColor(hue2, 70, 55, 0.7),     // Средний
    treble: createColor(hue3, 65, 65, 0.5)   // Светлый
  };
};

// Компонент волны с симуляцией на основе времени воспроизведения
const WaveContainer = ({ isPlaying }) => {
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
      
      // Устанавливаем высокое разрешение для четкости
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Масштабируем контекст
      ctx.scale(dpr, dpr);
      
      // Настраиваем качество рендеринга для максимальной четкости
      ctx.imageSmoothingEnabled = false; // Отключаем сглаживание для четкости
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3; // Увеличиваем толщину линий для четкости
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Создаем чувствительные к биту волны
    const getWaveData = () => {
      if (!isPlaying || !duration) {
        return { bass: 0, mid: 0, treble: 0, overall: 0 };
      }

      const time = currentTime;
      const progress = time / duration;
      
      // Более чувствительная реакция на прогресс
      const progressIntensity = Math.sin(progress * Math.PI) * 0.7 + 0.3; // Минимум 30% активности
      
      // Имитируем бит-детектор - более резкие изменения
      const beatDetector = () => {
        const beatTime = time * 2; // Базовый ритм
        const kickBeat = Math.sin(beatTime) > 0.8 ? 1 : 0; // Кик-барабан
        const snareBeat = Math.sin(beatTime + Math.PI) > 0.7 ? 1 : 0; // Снейр
        const hihatBeat = Math.sin(beatTime * 2) > 0.6 ? 1 : 0; // Хай-хэт
        
        return { kickBeat, snareBeat, hihatBeat };
      };
      
      const { kickBeat, snareBeat, hihatBeat } = beatDetector();
      
      // Базовые ритмы с бит-детектором
      const beat1 = Math.sin(time * 1.5) * 0.3 + 0.7; // Основной ритм
      const beat2 = Math.sin(time * 3) * 0.2 + 0.8; // Кик-барабан
      const beat3 = Math.sin(time * 4.5) * 0.15 + 0.85; // Хай-хэт
      
      // Применяем бит-детектор для резких всплесков
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
        
        // Получаем данные волн
        const waveData = getWaveData();
        const { bass, mid, treble, overall } = waveData;
        
        // Генерируем цвета на основе названия трека с плавным изменением оттенков
        const trackColors = generateTrackColors(currentTrack?.title, time);
        
        // Три волны разной высоты с цветами трека
        const waves = [
          {
            intensity: bass,
            baseHeight: canvasHeight * 0.25, // Нижняя волна - 25% высоты
            color: trackColors.bass,
            frequency: 0.012,
            amplitude: 20
          },
          {
            intensity: mid,
            baseHeight: canvasHeight * 0.45, // Средняя волна - 45% высоты
            color: trackColors.mid,
            frequency: 0.01,
            amplitude: 25
          },
          {
            intensity: treble,
            baseHeight: canvasHeight * 0.65, // Верхняя волна - 65% высоты
            color: trackColors.treble,
            frequency: 0.008,
            amplitude: 30
          }
        ];
        
        // Рисуем каждую волну с улучшенным качеством
        waves.forEach((wave, waveIndex) => {
          ctx.beginPath();
          
          // Более чувствительная динамическая амплитуда
          const dynamicAmplitude = wave.amplitude * (0.4 + wave.intensity * 2.2);
          const dynamicFreq = wave.frequency * (0.7 + wave.intensity * 1.2);
          
          // Начинаем с левого края внизу
          ctx.moveTo(0, canvasHeight);
          
          // Рисуем волну с максимальным разрешением для четкости
          for (let x = 0; x <= canvasWidth; x += 0.5) { // Увеличиваем разрешение для четкости
            // Замедленная формула волны для более плавного движения
            const wave1 = Math.sin((x * dynamicFreq) + (time * (0.8 + waveIndex * 0.2))) * dynamicAmplitude;
            const wave2 = Math.sin((x * dynamicFreq * 1.3) + (time * (1.1 + waveIndex * 0.15))) * (dynamicAmplitude * 0.4);
            const wave3 = Math.sin((x * dynamicFreq * 0.8) + (time * (0.6 + waveIndex * 0.1))) * (dynamicAmplitude * 0.3);
            
            const y = wave.baseHeight + wave1 + wave2 + wave3;
            ctx.lineTo(x, y);
          }
          
          // Замыкаем до правого края внизу
          ctx.lineTo(canvasWidth, canvasHeight);
          ctx.closePath();
          
          // Создаем более четкий градиент с цветами трека
          const gradient = ctx.createLinearGradient(0, wave.baseHeight, 0, canvasHeight);
          gradient.addColorStop(0, wave.color);
          gradient.addColorStop(0.2, wave.color.replace(/[\d.]+\)$/g, '0.8)'));
          gradient.addColorStop(0.4, wave.color.replace(/[\d.]+\)$/g, '0.6)'));
          gradient.addColorStop(0.7, wave.color.replace(/[\d.]+\)$/g, '0.3)'));
          gradient.addColorStop(1, wave.color.replace(/[\d.]+\)$/g, '0.05)'));
          
          // Заливаем волну градиентом
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Добавляем максимально четкое свечение
          ctx.strokeStyle = wave.color;
          ctx.lineWidth = 3; // Увеличиваем толщину для четкости
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
};



const CurrentTrackInfo = styled(Box)({
  position: 'absolute',
  bottom: '16px',
  left: '16px',
  right: '16px',
  zIndex: 3,
      background: 'var(--theme-background, rgba(0, 0, 0, 0.3))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(8px))',
  borderRadius: '16px',
  padding: '8px 12px',
  border: '1px solid rgba(66, 66, 66, 0.5)',
});

const PlayButton = styled(IconButton)(({ theme, $isPlaying }) => ({
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

// Компонент для статичных частиц (когда не играет)
const StaticParticles = () => {
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
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.4)',
            animation: `${particleFloat} ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
          }}
        />
      ))}
    </Box>
  );
};

const MyVibeWidget = ({ onClick, isPlaying, currentTrack, currentSection }) => {
  const isVibePlaying = isPlaying && currentSection === 'my-vibe';
  const showCurrentTrack = isVibePlaying && currentTrack;
  const { t } = useLanguage();

  return (
    <div
      className={`${styles.container} ${
        showCurrentTrack ? styles.hasCurrentTrack : ''
      } ${isVibePlaying ? styles.playing : ''}`}
      onClick={onClick}
    >
      {/* Анимированная волна когда играет */}
      {isVibePlaying && <WaveContainer isPlaying={isVibePlaying} />}
      
      {/* Статичные частицы когда не играет */}
      {!isVibePlaying && <StaticParticles />}
      
      <div className={styles.contentOverlay}>
        <h2 className='font-bold text-lg'>{t('music.my_vibe.title')}</h2>
        <Typography
          variant='body2'
          sx={{ color: alpha('#FFFFFF', 0.8), mt: 0.5 }}
        >
          {t('music.my_vibe.description')}
        </Typography>
        <PlayButton $isPlaying={isVibePlaying} sx={{ mt: 2 }}>
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
