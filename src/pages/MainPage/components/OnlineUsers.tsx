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
  borderRadius: 'var(--large-border-radius)',
  overflow: 'hidden',
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  WebkitBackdropFilter: 'var(--theme-backdrop-filter)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
  borderRight: '1px solid rgba(200, 200, 200, 0.322)',
  borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
  borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  boxShadow: `
    
    var(--box-shadow)
  `,  padding: '2px 2px',
  gap: '2px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  '&::-webkit-scrollbar': { 
    height: '0px', 
    display: 'none' 
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
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
      <OnlineUsersCard>
        <Box sx={{ p: 1, minHeight: 56, display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={18} sx={{ mr: 1 }} />
          <Typography variant='body2' sx={{ fontSize: '0.95rem' }}>
            {t('main_page.loading')}
          </Typography>
        </Box>
      </OnlineUsersCard>
    );
  }

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <OnlineUsersCard>
      <Box
        className="online-users-container"
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '4px !important',
          overflowX: 'auto',
          py: 0.2,
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
            py: 0.2,
            minWidth: 'fit-content',
            height: '45px',
            maxHeight: '53px',
            mr: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',            
            // Скрытие счетчика для CursedBlur темы
            '[data-theme="CursedBlur"] &': {
              display: 'none',
            },
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
              boxShadow: '0 0 8px rgba(76, 175, 80, 0.4)',
            }}
          />
          <Typography
            variant='body2'
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#4caf50',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              letterSpacing: '0.5px',
            }}
          >
             { onlineUsers.length }
          </Typography>
        </Box>
        {onlineUsers.slice(0, visibleCount).map((user) => (
          <Box
            key={user.id}
            sx={{ 
              position: 'relative', 
              cursor: 'pointer', 
              mx: 0.25,
              minWidth: '55px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={() => handleUserClick(user.username)}
          >
            <Avatar
              src={user?.photo ? `${user.photo}?w=72&h=72&fit=crop&q=60` : '/static/uploads/system/avatar.png'}
              alt={user?.username || 'User'}
              sx={{
                width: '56px',
                height: '46px',
                borderRadius: '25px',
                borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                boxSizing: 'border-box',
                background: 'rgba(181, 142, 244, 0.65)',
              }}
              onError={(e) => safeImageError(e as any)}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#4caf50',
                borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
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
