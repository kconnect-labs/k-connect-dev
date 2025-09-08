import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Styled компоненты для мини-баннера в хедере
const BannerContainer = styled(motion.div)(({ theme, isMobile }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: isMobile ? '12px' : '10px',
  padding: isMobile ? '4px 16px' : '4px 12px',
  borderRadius: isMobile ? 'var(--main-border-radius) !important' : '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  backdropFilter: 'blur(10px)',
  width: isMobile ? '100%' : 'auto',
  maxWidth: isMobile ? 'none' : '280px',
  minWidth: isMobile ? 'none' : '240px',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  flexShrink: 1,
  justifyContent: isMobile ? 'center' : 'flex-start',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-1px)',
  },
}));

const BirthdayIcon = styled(Box)(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const BannerContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const BirthdayText = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  lineHeight: 1.3,
  marginBottom: '2px',
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    whiteSpace: 'normal',
    textAlign: 'center',
  },
  [theme.breakpoints.up('md')]: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const BirthdaySubText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  lineHeight: 1.2,
  opacity: 0.8,
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
    whiteSpace: 'normal',
    textAlign: 'center',
  },
  [theme.breakpoints.up('md')]: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  width: 20,
  height: 20,
  flexShrink: 0,
  transition: 'all 0.2s ease',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const BirthdayBanner = ({ onVisibilityChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, показывали ли уже баннер (используем 1/0 вместо даты)
    const hasShown = localStorage.getItem('birthday-banner-shown');
    
    // Показываем только если еще не показывали (значение не равно "1")
    if (hasShown !== "1") {
      // Показываем баннер через небольшую задержку
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        if (onVisibilityChange) {
          onVisibilityChange(true);
        }
        // Запоминаем что показали (ставим "1")
        localStorage.setItem('birthday-banner-shown', "1");
      }, 2000);

      // Автоматически скрываем баннер через 12 секунд
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        if (onVisibilityChange) {
          onVisibilityChange(false);
        }
      }, 14000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  const handleCreatePost = () => {
    setIsVisible(false);
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
    navigate('/profile/yalinks', { 
      state: { 
        birthdayPost: true,
        defaultContent: 'С Днем Рождения, Алинк! 🎉🎂'
      }
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <BannerContainer
        isMobile={isMobile}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={handleCreatePost}
      >
        <BirthdayIcon>
          <CakeIcon sx={{ fontSize: 18, color: 'white' }} />
        </BirthdayIcon>

        <BannerContent>
          <BirthdayText>
            У {Имя друга у которго днь рождения} ДР! 🎂
          </BirthdayText>
          <BirthdaySubText>
            Поздравим постиком!
          </BirthdaySubText>
        </BannerContent>

        <CloseButton onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}>
          <CloseIcon sx={{ fontSize: 14 }} />
        </CloseButton>
      </BannerContainer>
    </AnimatePresence>
  );
};

// Функция для сброса (для тестирования)
// Вызвать в консоли: resetBirthdayBanner()
window.resetBirthdayBanner = () => {
  localStorage.removeItem('birthday-banner-shown');
  console.log('Birthday banner reset! Refresh page to see it again.');
};

export default BirthdayBanner;