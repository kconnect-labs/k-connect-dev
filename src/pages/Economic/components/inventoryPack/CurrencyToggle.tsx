import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import BallsIcon from './BallsIcon';
import MCoinIcon from './MCoinIcon';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    borderRadius: '12px !important',
    padding: '8px 16px',
    minWidth: '80px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&.Mui-selected': {
      backgroundColor: 'rgba(208, 188, 255, 0.2)',
      borderColor: '#d0bcff',
      color: '#d0bcff',
      '&:hover': {
        backgroundColor: 'rgba(208, 188, 255, 0.3)',
      },
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  },
}));

interface CurrencyToggleProps {
  value: 'points' | 'mcoin' | '';
  onChange: (value: 'points' | 'mcoin' | '') => void;
  disabled?: boolean;
  showAllOption?: boolean;
}

const CurrencyToggle: React.FC<CurrencyToggleProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  showAllOption = false
}) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: 'points' | 'mcoin' | '' | null,
  ) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {showAllOption ? 'Валюта:' : 'Валюта продажи:'}
      </Typography>
      <StyledToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="currency selection"
        disabled={disabled}
      >
        {showAllOption && (
          <StyledToggleButton value="" aria-label="all">
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Все
            </Typography>
          </StyledToggleButton>
        )}
        <StyledToggleButton value="points" aria-label="points">
          <BallsIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Баллы
          </Typography>
        </StyledToggleButton>
        <StyledToggleButton value="mcoin" aria-label="mcoin">
          <MCoinIcon sx={{ fontSize: 18, color: '#d0bcff' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Мкоины
          </Typography>
        </StyledToggleButton>
      </StyledToggleButtonGroup>
    </Box>
  );
};

export default CurrencyToggle;
