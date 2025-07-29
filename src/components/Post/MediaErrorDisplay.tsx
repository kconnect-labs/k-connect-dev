import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import { MediaErrorDisplayProps } from './types';

interface MediaErrorContainerProps {
  sx?: any;
  children: React.ReactNode;
}

const MediaErrorContainer: React.FC<MediaErrorContainerProps> = ({ sx, children, ...props }) => (
  <Box
    sx={{
      height: '220px',
      position: 'relative',
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: '24px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background:
        'linear-gradient(327deg, rgb(206 188 255 / 77%) 0%, rgb(97 76 147) 100%)',
      backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
      boxShadow: 'inset 0 0 0 1px rgba(206, 188, 255, 0.2)',
      padding: 2,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.9)',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

interface LottieWrapperProps {
  sx?: any;
  children: React.ReactNode;
}

const LottieWrapper: React.FC<LottieWrapperProps> = ({ sx, children, ...props }) => (
  <Box
    sx={{
      width: '100%',
      maxWidth: '150px',
      height: '150px',
      marginBottom: 1,
      opacity: 0.8,
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

const MediaErrorDisplay: React.FC<MediaErrorDisplayProps> = ({ type, t }) => {
  const [spiderAnimation, setSpiderAnimation] = useState<any>(null);

  useEffect(() => {
    const loadSpiderAnimation = async () => {
      try {
        const response = await fetch('/static/json/error/spider.json');
        const animationData = await response.json();
        setSpiderAnimation(animationData);
      } catch (error) {
        console.error(t('post.media_error.animation_load_error'), error);
      }
    };
    loadSpiderAnimation();
  }, [t]);

  return (
    <MediaErrorContainer>
      {spiderAnimation && (
        <LottieWrapper>
          <Lottie animationData={spiderAnimation} loop autoplay />
        </LottieWrapper>
      )}
      <Typography variant='h6' gutterBottom>
        {type === 'image'
          ? t('post.media_error.image_load_error')
          : t('post.media_error.video_load_error')}
      </Typography>
      <Typography variant='body2'>
        {type === 'image'
          ? t('post.media_error.image_deleted')
          : t('post.media_error.video_format')}
      </Typography>
    </MediaErrorContainer>
  );
};

export default MediaErrorDisplay; 