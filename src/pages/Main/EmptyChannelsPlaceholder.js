import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import TvOffIcon from '@mui/icons-material/TvOff';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: 16,
  background: 'linear-gradient(145deg, #222222, #1c1c1c)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
}));

const EmptyChannelsPlaceholder = ({ message = 'Каналы не найдены' }) => {
  return (
    <StyledPaper>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
        }}
      >
        <TvOffIcon
          sx={{ fontSize: 70, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }}
        />
        <Typography variant='h6' color='text.secondary' gutterBottom>
          {message}
        </Typography>
        <Typography
          variant='body2'
          color='text.disabled'
          sx={{ maxWidth: 400 }}
        >
          Попробуйте изменить параметры поиска или вернитесь позже, когда
          появятся новые каналы
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default EmptyChannelsPlaceholder;
