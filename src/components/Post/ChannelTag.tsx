import React from 'react';
import { styled } from '@mui/material/styles';
import { Chip } from '@mui/material';

const ChannelTag = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: 'rgba(255, 255, 255, 0.8)',
  height: 24,
  borderRadius: 12,
  fontSize: '0.75rem',
  fontWeight: 500,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

export default ChannelTag; 