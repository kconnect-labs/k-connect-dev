import React from 'react';
import { Box, styled } from '@mui/material';
import AppleStyleVideoPlayer from './StyleVideoPlayer';

const VideoContainer = styled(Box)({
  width: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative',
  aspectRatio: '16/9',
  backgroundColor: '#11111C',
  cursor: 'pointer',
});

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  options?: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
  };
  onError?: (error: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  poster, 
  options = {},
  onError 
}) => {
  return (
    <VideoContainer>
      <AppleStyleVideoPlayer
        videoUrl={videoUrl}
        poster={poster}
        autoplay={options.autoplay}
        muted={options.muted}
        loop={options.loop}
        onError={onError}
      />
    </VideoContainer>
  );
};

export default VideoPlayer;
