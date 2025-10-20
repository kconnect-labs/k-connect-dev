import React from 'react';
import { styled } from '@mui/material/styles';
import { Chip } from '@mui/material';

const ChannelTag = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: 'rgba(255, 255, 255, 0.8)',
  height: 24,
  borderRadius: 'var(--main-border-radius) !important',
  fontSize: '0.75rem',
  fontWeight: 500,
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

export default ChannelTag; 