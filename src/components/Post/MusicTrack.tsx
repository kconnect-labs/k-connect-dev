import React from 'react';
import { Box, styled } from '@mui/material';

interface MusicTrackProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  [key: string]: any;
}

const MusicTrackContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 1.5),
  borderRadius: 'var(--main-border-radius)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  marginBottom: theme.spacing(0.3),
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
}));

const MusicTrack: React.FC<MusicTrackProps> = ({ children, onClick, ...props }) => {
  return (
    <MusicTrackContainer onClick={onClick} {...props}>
      {children}
    </MusicTrackContainer>
  );
};

export default MusicTrack; 