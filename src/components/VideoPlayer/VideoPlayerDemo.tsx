import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { AppleStyleVideoPlayer } from './index';

const VideoPlayerDemo: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  const demoVideos = [
    {
      title: 'Демо видео 1',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
    },
    {
      title: 'Демо видео 2',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'
    },
    {
      title: 'Демо видео 3',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg'
    }
  ];

  const handleVideoChange = (index: number) => {
    setCurrentVideo(index);
  };

  const handlePlay = () => {
    console.log('Video started playing');
  };

  const handlePause = () => {
    console.log('Video paused');
  };

  const handleEnded = () => {
    console.log('Video ended');
  };

  const handleError = (error: any) => {
    console.error('Video error:', error);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'var(--theme-text-primary)' }}>
        Apple Style Video Player Demo
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'var(--theme-text-secondary)' }}>
        Минималистичный красивый видеоплеер в стиле Apple с TypeScript
      </Typography>

      <Paper 
        sx={{ 
          p: 3, 
          mb: 4,
          background: 'var(--theme-background)',
          backdropFilter: 'var(--theme-backdrop-filter)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          borderRadius: 3
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
          {demoVideos[currentVideo].title}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <AppleStyleVideoPlayer
            videoUrl={demoVideos[currentVideo].url}
            poster={demoVideos[currentVideo].poster}
            autoplay={false}
            muted={false}
            loop={false}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleError}
          />
        </Box>

        <Grid container spacing={2} justifyContent="center">
          {demoVideos.map((video, index) => (
            <Grid item key={index}>
              <Button
                variant={currentVideo === index ? 'contained' : 'outlined'}
                onClick={() => handleVideoChange(index)}
                sx={{
                  minWidth: 120,
                  background: currentVideo === index 
                    ? 'var(--theme-main-color)' 
                    : 'transparent',
                  borderColor: 'var(--theme-main-color)',
                  color: currentVideo === index 
                    ? '#000' 
                    : 'var(--theme-main-color)',
                  '&:hover': {
                    background: currentVideo === index 
                      ? 'var(--theme-main-color)' 
                      : 'rgba(208, 188, 255, 0.1)',
                  }
                }}
              >
                {video.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper 
        sx={{ 
          p: 3,
          background: 'var(--theme-background)',
          backdropFilter: 'var(--theme-backdrop-filter)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          borderRadius: 3
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
          Особенности плеера
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Минималистичный дизайн в стиле Apple
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Оптимизация для мобильных устройств
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ TypeScript поддержка
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Легковесность без тяжелых зависимостей
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Адаптивные элементы управления
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Поддержка жестов и касаний
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Автоскрытие контролов
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 1 }}>
              ✅ Полноэкранный режим
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VideoPlayerDemo;
