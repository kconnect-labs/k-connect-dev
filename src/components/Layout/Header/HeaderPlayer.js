import React from 'react';
import { Icon } from '@iconify/react';
import './HeaderPlayer.css';

/**
 * HeaderPlayer - компонент плеера в хедере
 * @param {Function} onOpenFullscreen - функция для открытия фуллскрин плеера при клике на обложку
 * 
 * Пример использования:
 * <HeaderPlayer 
 *   currentTrack={currentTrack}
 *   isPlaying={isPlaying}
 *   onOpenFullscreen={() => setFullscreenPlayerOpen(true)}
 *   // ... другие пропы
 * />
 */
const HeaderPlayer = ({
  currentTrack,
  isPlaying,
  isMuted,
  volume,
  togglePlay,
  nextTrack,
  prevTrack,
  toggleMute,
  setVolume,
  primaryColor = '#D0BCFF',
  truncateTitle,
  isMobile = false,
  onClose,
  onOpenFullscreen
}) => {
  if (!currentTrack) return null;
  
  const playerStyles = {
    '--primary-color': primaryColor,
  };
  
  return (
    <div className="header-player" style={playerStyles}>
      <div 
        className={`MINI-track-info ${onOpenFullscreen ? 'MINI-track-info--clickable' : ''}`}
        onClick={onOpenFullscreen || (() => console.warn('onOpenFullscreen не передан в HeaderPlayer'))}
      >
        <img 
          className="track-cover"
          src={currentTrack.cover_path || '/static/uploads/system/album_placeholder.jpg'} 
          alt={currentTrack.title}
        />
        <div className="track-details">
          <div className="track-title">
            {truncateTitle(currentTrack.title, 20)}
          </div>
          <div className="track-artist">
            {truncateTitle(currentTrack.artist, 20)}
          </div>
        </div>
      </div>
      
      <div className="player-controls">
        <button className="control-button" onClick={prevTrack}>
          <Icon icon="solar:skip-previous-bold" width="20" height="20" />
        </button>
        <button 
          className="control-button control-button--play"
          onClick={togglePlay}
        >
          {isPlaying ? <Icon icon="solar:pause-bold" width="20" height="20" /> : <Icon icon="solar:play-bold" width="20" height="20" />}
        </button>
        <button className="control-button" onClick={nextTrack}>
          <Icon icon="solar:skip-next-bold" width="20" height="20" />
        </button>
        
        <div className="volume-control">
          <button className="control-button" onClick={toggleMute}>
            {isMuted || volume === 0 ? 
              <Icon icon="solar:volume-cross-bold" width="20" height="20" /> : 
              <Icon icon="solar:volume-loud-bold" width="20" height="20" />
            }
          </button>
          <input 
            className="volume-slider"
            type="range" 
            min={0} 
            max={1} 
            step={0.01} 
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      {isMobile && false && (
        <button
          className="close-button"
          onClick={onClose}
        >
          <Icon icon="solar:close-circle-bold" width="24" height="24" />
        </button>
      )}
    </div>
  );
};

export default HeaderPlayer; 