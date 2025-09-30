import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  styled,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import axios from '../../../services/axiosConfig';
import { handleImageError as safeImageError } from '../../../utils/imageUtils';
import { User } from '../types';

const OnlineUsersCard = styled(Card)(({ theme }) => ({
  borderRadius: 'var(--main-border-radius)',
  overflow: 'hidden',
  boxShadow: 'none',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border:
    theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.12)'
      : '1px solid rgba(0, 0, 0, 0.1)',
}));

const OnlineUsers: React.FC = () => {
  const { t } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/online?limit=4200');

        if (Array.isArray(response.data)) {
          setOnlineUsers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setOnlineUsers(response.data.users);
        } else {
          setOnlineUsers([]);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
        setOnlineUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineUsers();

    const interval = setInterval(fetchOnlineUsers, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleUserClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  // Автоматическая загрузка при скролле до конца
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.online-users-container');
      if (container) {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10; // 10px tolerance
        
        if (isAtEnd && visibleCount < onlineUsers.length) {
          setVisibleCount(prev => Math.min(prev + 12, onlineUsers.length));
        }
      }
    };

    const container = document.querySelector('.online-users-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [visibleCount, onlineUsers.length]);

  if (loading) {
    return (
      <OnlineUsersCard
        sx={{ p: 1, minHeight: 56, display: 'flex', alignItems: 'center' }}
      >
        <CircularProgress size={18} sx={{ mr: 1 }} />
        <Typography variant='body2' sx={{ fontSize: '0.95rem' }}>
          {t('main_page.loading')}
        </Typography>
      </OnlineUsersCard>
    );
  }

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <OnlineUsersCard
      sx={{
        p: 1,
        minHeight: 56,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box
        className="online-users-container"
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 1,
          overflowX: 'auto',
          pb: 0,
          '&::-webkit-scrollbar': { height: '0px', display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: 'var(--main-border-radius)',
            backgroundColor: 'var(--theme-background, rgba(76, 175, 80, 0.1))',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            minWidth: 'fit-content',
            height: 36,
            mr: 0.5,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: 'var(--avatar-border-radius)',
              backgroundColor: '#4caf50',
            }}
          />
          <Typography
            variant='body2'
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#4caf50',
            }}
          >
            {t('main_page.online_count', { count: onlineUsers.length })}
          </Typography>
        </Box>
        {onlineUsers.slice(0, visibleCount).map((user) => (
          <Box
            key={user.id}
            sx={{ position: 'relative', cursor: 'pointer', mx: 0.25 }}
            onClick={() => handleUserClick(user.username)}
          >
            <Avatar
              src={user?.photo ? `${user.photo}?w=72&h=72&fit=crop&q=60` : '/static/uploads/system/avatar.png'}
              alt={user?.username || 'User'}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${theme.palette.background.paper}`,
                boxSizing: 'border-box',
                background: '#222',
              }}
              onError={(e) => safeImageError(e as any)}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 9,
                height: 9,
                borderRadius: 'var(--avatar-border-radius)',
                backgroundColor: '#4caf50',
                border: `1.5px solid ${theme.palette.background.paper}`,
                boxSizing: 'border-box',
              }}
            />
          </Box>
        ))}
      </Box>
    </OnlineUsersCard>
  );
};

export default OnlineUsers;
