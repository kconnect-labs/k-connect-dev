import React from 'react';
import VideoPlayer from './VideoPlayer/VideoPlayer';

// Прокси компонент для обратной совместимости
const VideoPlayerWrapper = ({ videoUrl, poster, options = {}, onError }) => {
  return (
    <VideoPlayer
      videoUrl={videoUrl}
      poster={poster}
      options={options}
      onError={onError}
    />
  );
};

export default VideoPlayerWrapper;
