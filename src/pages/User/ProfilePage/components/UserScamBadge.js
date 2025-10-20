import React from 'react';
import { Typography, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useLanguage } from '../../../../context/LanguageContext';

const UserScamBadge = ({ user }) => {
  const { t } = useLanguage();
  if (!user?.scam) return null;
  return (
    <Tooltip title={t('profile.ban.scam')} arrow placement='top'>
      <Typography
        variant='caption'
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: '#fff',
          fontWeight: 500,
          background: 'rgba(211, 47, 47, 0.6)',
          px: 1,
          py: 0.1,
          borderRadius: 'var(--main-border-radius)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          '&:hover': {
            background: 'rgba(211, 47, 47, 0.7)',
          },
          animation: 'pulse-red 2s infinite',
          '@keyframes pulse-red': {
            '0%': { },
            '70%': { },
            '100%': { },
          },
        }}
      >
        <WarningIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.9 }} />
        <span>{t('profile.ban.scam')}</span>
      </Typography>
    </Tooltip>
  );
};

export default UserScamBadge;
