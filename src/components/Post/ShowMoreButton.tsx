import React from 'react';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const ShowMoreButton = styled(Button)(({ theme }) => ({
  margin: '8px auto 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `
    linear-gradient(180deg, 
      var(--theme-background, rgba(26, 26, 26, 0)) 0%, 
      var(--theme-background, rgba(26, 26, 26, 0.47)) 30%, 
      var(--theme-background, rgba(26, 26, 26, 0.68)) 100%
    )
  `,
  color: theme.palette.primary.main,
  textTransform: 'none',
  fontWeight: 'normal',
  padding: '8px',
  width: '100%',
  position: 'absolute',
  bottom: 0,
  left: 0,
  '&:hover': {
    background: `
      linear-gradient(180deg, 
        var(--theme-background, rgba(26, 26, 26, 0)) 0%, 
        var(--theme-background, rgba(26, 26, 26, 0.47)) 30%, 
        var(--theme-background, rgba(26, 26, 26, 0.68)) 100%
      )
    `,
  },
}));

export default ShowMoreButton;
