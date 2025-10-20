import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';

const TelegramSubscribeBlock: React.FC = () => {
  const { t } = useLanguage();

  const handleSubscribe = () => {
    window.open('https://t.me/kcon_news', '_blank');
  };

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'block' },
        background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        boxShadow: `
          
          0 0 0 4px rgba(95, 95, 95, 0.06) inset,
          0 1.5px 16px 0 rgba(65, 65, 65, 0.18) inset
        `,
        borderRadius: 'var(--main-border-radius)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={handleSubscribe}
    >
      {/* Основной контент */}
      <Box sx={{ mt: 1, mb:0 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.3,
            mb: 2,
          }}
        >
          Подпишитесь на телеграм канал разработчика
        </Typography>

        <Button
          variant="contained"
          sx={{
            backgroundColor: 'var(--theme-text-deactive)',
            color: 'white',
            borderRadius: 0.5,
            px: 1,
            py: 0.5,
            mb: 0,
            width: '100%',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            '&:hover': {
              backgroundColor: '#3a3a3a',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSubscribe();
          }}
        >
          Перейти
        </Button>
      </Box>
    </Box>
  );
};

export default TelegramSubscribeBlock;
