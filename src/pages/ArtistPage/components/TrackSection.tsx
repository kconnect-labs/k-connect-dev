import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrackSectionProps } from '../types';
import FeaturedTrackGrid from './FeaturedTrackGrid';
import TrackList from './TrackList';

const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: '5px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.75rem',
  color: '#ffffff',
  marginBottom: '5px',
  letterSpacing: '-0.01em',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem',
  },
}));

const TrackSection: React.FC<TrackSectionProps> = ({
  title,
  tracks,
  featured = false,
  onTrackClick,
  onLikeTrack,
  currentTrack,
  isPlaying,
}) => {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <SectionContainer>
      <SectionTitle variant='h5'>{title}</SectionTitle>

      {featured ? (
        <FeaturedTrackGrid
          tracks={tracks}
          onTrackClick={onTrackClick}
          onLikeTrack={onLikeTrack}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />
      ) : (
        <TrackList
          tracks={tracks}
          onTrackClick={onTrackClick}
          onLikeTrack={onLikeTrack}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          hasMoreTracks={false}
          loadingMoreTracks={false}
        />
      )}
    </SectionContainer>
  );
};

export default TrackSection;
