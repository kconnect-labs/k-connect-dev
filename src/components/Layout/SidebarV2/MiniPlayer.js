import React, { useContext, memo } from 'react';
import { MusicContext } from '../../../context/MusicContext';
import { useLanguage } from '../../../context/LanguageContext';
import { IconButton } from '@mui/material';
import { getCoverWithFallback } from '../../../utils/imageUtils';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon, CloseIcon } from '../../icons/CustomIcons';
import './MiniPlayer.css';

const MiniPlayer = memo(() => {
  const { t } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    clearPlayer,
  } = useContext(MusicContext);

  if (!currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    togglePlay();
  };

  const handleNext = () => {
    nextTrack();
  };

  const handlePrev = () => {
    prevTrack();
  };

  const handleClear = () => {
    clearPlayer();
  };

  return (
    <div className="mini-player">
      <div className="mini-player-close">
        <IconButton
          onClick={handleClear}
          aria-label={t('music.close') || 'Закрыть плеер'}
          sx={{
            color: 'var(--theme-text-secondary)',
            width: 32,
            height: 32,
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'var(--theme-text-primary)',
              transform: 'scale(1.1)',
              background: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloseIcon size={20} />
        </IconButton>
      </div>
      <div className="mini-player-content">
        <div className="mini-player-cover">
          <img
            src={getCoverWithFallback(currentTrack.cover_path || '', 'album')}
            alt={currentTrack.title}
            className="mini-player-cover-image"
          />
        </div>
        <div className="mini-player-info">
          <div className="mini-player-title" title={currentTrack.title}>
            {currentTrack.title}
          </div>
          <div className="mini-player-artist" title={currentTrack.artist}>
            {currentTrack.artist}
          </div>
        </div>
        <div className="mini-player-controls">
          <IconButton
            onClick={handlePrev}
            aria-label={t('music.previous')}
            sx={{
              color: 'var(--theme-text-primary)',
              width: 48,
              height: 48,
              transition: 'transform 0.1s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                background:'none'

              },
            }}
          >
            <BackwardIcon size={48} />
          </IconButton>

          <IconButton
            onClick={handlePlayPause}
            aria-label={isPlaying ? t('music.pause') : t('music.play')}
            sx={{
              color: 'var(--theme-text-primary)',
              width: 48,
              height: 48,
              transition: 'transform 0.1s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                background:'none'

              },
            }}
          >
            {isPlaying ? <PauseIcon size={48} /> : <PlayIcon size={48} />}
          </IconButton>

          <IconButton
            onClick={handleNext}
            aria-label={t('music.next')}
            sx={{
              color: 'var(--theme-text-primary)',
              width: 48,
              height: 48,
              transition: 'transform 0.1s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                background:'none'
              },
            }}
          >
            <ForwardIcon size={48} />
          </IconButton>
        </div>
      </div>
    </div>
  );
});

MiniPlayer.displayName = 'MiniPlayer';

export default MiniPlayer;
