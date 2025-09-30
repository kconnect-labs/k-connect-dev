import React from 'react';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

// Кнопка "Показать полностью" — без закругления, с полным цветным фоном (без градиента), используя var(--theme-background)
const ShowMoreButton = styled(Button)(({ theme }) => ({
  margin: '12px auto 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--theme-background, #181818)',
  color: theme.palette.primary.main,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  letterSpacing: '0.01em',
  padding: '14px 0 12px 0',
  width: '100%',
  position: 'absolute',
  bottom: 0,
  left: 0,
  borderRadius: 0, // убираем закругление
  borderTop: '1px solid rgba(120,120,120,0.10)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  transition: 'background 0.2s, color 0.2s',
  '&:hover': {
    background: 'var(--theme-background, #181818)',
    color: theme.palette.primary.dark,
    boxShadow: '0 4px 16px 0 rgba(0,0,0,0.10)',
  },
}));

export default ShowMoreButton;