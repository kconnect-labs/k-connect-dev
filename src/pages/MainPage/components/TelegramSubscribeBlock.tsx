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
        background: 'linear-gradient(135deg, #8A7BAA 0%, #A098B0 100%)',
        borderRadius: 'var(--main-border-radius)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          cursor: 'pointer',
        },
      }}
      onClick={handleSubscribe}
    >
      {/* Реклама тег */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          backgroundColor: '#282828',
          color: 'white',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 500,
        }}
      >
        Реклама
      </Box>

      {/* Основной контент */}
      <Box sx={{ mt: 3, mb:0 }}>
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
            backgroundColor: '#282828',
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
