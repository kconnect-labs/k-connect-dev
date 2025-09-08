import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { Icon } from '@iconify/react';

const MessengerDisabled: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Icon
            icon="solar:chat-round-dots-bold"
            width="64"
            height="64"
            style={{ color: '#D0BCFF', opacity: 0.7 }}
          />
        </Box>
        
        <Typography
          variant="h5"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: '#D0BCFF',
          }}
        >
          Мессенджер временно отключен
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          Мы проводим техническое обслуживание мессенджера для улучшения его работы. 
          Скоро он снова будет доступен!
        </Typography>
        
        <Box
          sx={{
            p: 2,
            backgroundColor: 'rgba(208, 188, 255, 0.1)',
            borderRadius: 'var(--main-border-radius)',
            border: '1px solid rgba(208, 188, 255, 0.2)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: '#D0BCFF',
              fontStyle: 'italic',
            }}
          >
            Спасибо за понимание! 💜
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MessengerDisabled;
