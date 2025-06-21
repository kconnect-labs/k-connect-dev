import React from 'react';
import { Box, IconButton, Avatar, Typography, alpha } from '@mui/material';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

const PlayerControls = (props) => <Box {...props} />;
const VolumeControl = (props) => <Box {...props} />;
const VolumeSlider = (props) => <input {...props} />;

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
  theme,
  truncateTitle,
  isMobile = false,
  onClose
}) => {
  if (!currentTrack) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', position: 'relative' }}>
      <Box 
        component={Link} 
        to="/music" 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          minWidth: 0, 
        }}
      >
        <Avatar 
          variant="rounded" 
          src={currentTrack.cover_path || '/static/uploads/system/album_placeholder.jpg'} 
          alt={currentTrack.title}
          sx={{ width: 32, height: 32, mr: 1, borderRadius: '4px' }}
        />
        <Box sx={{ minWidth: 0, maxWidth: 180 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {truncateTitle(currentTrack.title, 20)}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {truncateTitle(currentTrack.artist, 20)}
          </Typography>
        </Box>
      </Box>
      <PlayerControls sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
        <IconButton size="small" onClick={prevTrack} sx={{ p: 0.5, opacity: 0.6, transition: 'all 0.2s', '&:hover': { opacity: 1 } }}>
          <Icon icon="solar:skip-previous-bold" width="20" height="20" />
        </IconButton>
        <IconButton 
          onClick={togglePlay}
          size="small"
          sx={{ 
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            p: 0.7,
            mx: 0.5,
            opacity: 0.6,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              opacity: 1
            }
          }}
        >
          {isPlaying ? <Icon icon="solar:pause-bold" width="20" height="20" /> : <Icon icon="solar:play-bold" width="20" height="20" />}
        </IconButton>
        <IconButton size="small" onClick={nextTrack} sx={{ p: 0.5, opacity: 0.6, transition: 'all 0.2s', '&:hover': { opacity: 1 } }}>
          <Icon icon="solar:skip-next-bold" width="20" height="20" />
        </IconButton>
        <VolumeControl sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <IconButton 
            size="small" 
            onClick={toggleMute}
            sx={{ p: 0.5, ml: 0.5, opacity: 0.6, transition: 'all 0.2s', '&:hover': { opacity: 1 } }}
          >
            {isMuted || volume === 0 ? 
              <Icon icon="solar:volume-cross-bold" width="20" height="20" /> : 
              <Icon icon="solar:volume-loud-bold" width="20" height="20" />
            }
          </IconButton>
          <VolumeSlider 
            className="volume-slider"
            type="range" 
            min={0} 
            max={1} 
            step={0.01} 
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: 0, height: 3, borderRadius: 1.5, backgroundColor: alpha(theme.palette.primary.main, 0.2), appearance: 'none', outline: 'none', transition: 'all 0.2s ease', opacity: 0 }}
          />
        </VolumeControl>
      </PlayerControls>
      {isMobile && false && (
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            color: 'inherit',
            opacity: 0.6,
            zIndex: 2,
            transition: 'all 0.2s',
            '&:hover': { opacity: 1 }
          }}
        >
          <Icon icon="solar:close-circle-bold" width="24" height="24" />
        </IconButton>
      )}
    </Box>
  );
};

export default HeaderPlayer; 