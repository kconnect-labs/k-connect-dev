import React from 'react';
import { Typography } from '@mui/material';
import { StyledInfoBlock, StyledBalanceChip, StyledTabButton } from './StyledComponents';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';

interface BadgeShopHeaderProps {
  userPoints: number;
  onCreateClick: () => void;
  isMobile: boolean;
}

export const BadgeShopHeader: React.FC<BadgeShopHeaderProps> = ({
  userPoints,
  onCreateClick,
  isMobile,
}) => {
  return (
    <StyledInfoBlock mb={isMobile ? 1 : 1}>
      <StyledBalanceChip>
        <AccountBalanceWalletIcon sx={{ 
          fontSize: { xs: '1.1rem', sm: '1.2rem' }, 
          mr: { xs: 0.5, sm: 1 } 
        }} />
        <Typography sx={{ 
          fontWeight: 500, 
          fontSize: { xs: '0.85rem', sm: '0.875rem' } 
        }}>
          {userPoints} баллов
        </Typography>
      </StyledBalanceChip>
      <StyledTabButton
        startIcon={<AddIcon />}
        onClick={onCreateClick}
      >
        Создать бейджик
      </StyledTabButton>
    </StyledInfoBlock>
  );
}; 