import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { formatCompactNumber } from '../utils/formatters';

interface UserPositionCardProps {
  position: number;
  score: number;
}

export const UserPositionCard: React.FC<UserPositionCardProps> = ({
  position,
  score,
}) => {
  return (
    <Box
      className="theme-aware"
      sx={{
        borderRadius: 'var(--small-border-radius)',
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        color: '#D0BCFF',
        fontWeight: 700,
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
        minWidth: 320,
        mb: 1,
        boxShadow: 'var(--box-shadow)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      <Box display='flex' alignItems='center'>
        <MilitaryTechIcon
          sx={{ mr: 1, fontSize: 28, color: '#D0BCFF' }}
        />
        <Typography
          variant='h6'
          sx={{ color: '#D0BCFF', fontWeight: 700 }}
        >
          Ваше место: {position}
        </Typography>
      </Box>
      <Box>
        <Typography
          sx={{ color: '#D0BCFF', fontWeight: 700, fontSize: '1.1rem' }}
        >
          {score ? formatCompactNumber(score) : 0} очков
        </Typography>
      </Box>
    </Box>
  );
};
