import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, GlobalStyles, Grid } from '@mui/material';
import { 
  AccountCircle,
  Settings,
  ShoppingCart,
  Group,
  PlayCircle,
  TrendingUp,
  Inventory,
  Store,
  EmojiEmotions,
  Star,
  People,
  Casino,
  Gavel,
  AdminPanelSettings,
  Security,
  BugReport,
  Info,
  Description,
  Logout,
  Wallet,
  Favorite,
  VerifiedUser
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import VerificationBadge from '../../UIKIT/VerificationBadge';
import axios from 'axios';

interface MorePageProps {
  onBack?: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  link?: string;
  action?: () => void;
  external?: boolean;
  highlighted?: boolean;
}

interface Section {
  id: string;
  title: string;
  items: MenuItem[];
}

// Расширяем Window interface для TypeScript
declare global {
  interface Window {
    _moderatorCheckInProgress?: boolean;
  }
}

const formatNumber = (num: number): string => {
  if (num === null || num === undefined) return '0';
  if (num < 1000) return num.toString();
  
  const units = ['', 'k', 'M', 'B'];
  const unit = Math.floor((num.toFixed(0).length - 1) / 3);
  const value = (num / Math.pow(1000, unit)).toFixed(1);
  
  return `${parseFloat(value)}${units[unit]}`;
};

const MorePage: React.FC<MorePageProps> = ({ onBack }) => {
  const { user, logout } = useContext<any>(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userPoints, setUserPoints] = useState(0);
  const [isModeratorUser, setIsModeratorUser] = useState(false);
  const [lastModeratorCheck, setLastModeratorCheck] = useState(0);
  
  const isAdmin = user?.id === 3;
  const isChannel = user?.account_type === 'channel';

  useEffect(() => {
    if (user) {
      checkModeratorStatus();
      fetchUserPoints();
    }
  }, [user]);

  const checkModeratorStatus = async () => {
    try {
      if (window._moderatorCheckInProgress) {
        return;
      }
      
      const now = Date.now();
      if (now - lastModeratorCheck < 15 * 60 * 1000) {
        return;
      }
      
      window._moderatorCheckInProgress = true;
      
      const response = await axios.get('/api/moderator/status');
      if (response.data && response.data.is_moderator) {
        setIsModeratorUser(true);
      } else {
        setIsModeratorUser(false);
      }
      
      setLastModeratorCheck(now);
    } catch (error) {
      console.error('Error checking moderator status:', error);
      setIsModeratorUser(false);
    } finally {
      window._moderatorCheckInProgress = false;
    }
  };
  
  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Ошибка при загрузке баллов:', error);
      setUserPoints(0);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      navigate('/login');
    }
  };

  const balanceTitle = userPoints > 9999 ? formatNumber(userPoints) : `${formatNumber(userPoints)} баллов`;

  const sections: Section[] = [
    {
      id: 'primary',
      title: 'Основные действия',
      items: [
        {
          id: 'balance',
          title: balanceTitle,
          subtitle: 'Баланс',
          icon: <Wallet />,
          color: 'rgb(77, 214, 81)',
          link: '/balance',
          highlighted: true
        },
        {
          id: 'shop',
          title: 'Магазин',
          subtitle: 'Покупка и просмотр бейджей',
          icon: <ShoppingCart />,
          color: 'rgb(255, 193, 7)',
          link: '/badge-shop'
        },
        {
          id: 'settings',
          title: 'Настройки',
          subtitle: 'Управление профилем',
          icon: <Settings />,
          color: 'rgb(99, 102, 241)',
          link: '/settings'
        }
      ]
    },
    {
      id: 'social',
      title: 'Социальное',
      items: [
        {
          id: 'friends',
          title: 'Подписки',
          subtitle: 'Друзья и подписчики',
          icon: <Group />,
          color: 'rgb(33, 150, 243)',
          link: user && user.username ? `/friends/${user.username}` : '/friends'
        },
        {
          id: 'channels',
          title: 'Каналы',
          subtitle: 'Просмотр каналов',
          icon: <PlayCircle />,
          color: 'rgb(156, 39, 176)',
          link: '/channels'
        },
        {
          id: 'leaderboard',
          title: 'Рейтинг',
          subtitle: 'Таблица лидеров',
          icon: <TrendingUp />,
          color: 'rgb(255, 87, 34)',
          link: '/leaderboard'
        }
      ]
    },
    {
      id: 'entertainment',
      title: 'Разное',
      items: [
        {
          id: 'packs',
          title: 'Пачки',
          subtitle: 'Пачки с Айтемами',
          icon: <Inventory />,
          color: 'rgb(139, 195, 74)',
          link: '/economic/packs'
        },
        {
          id: 'inventory',
          title: 'Мой Инвентарь',
          subtitle: 'Ваши Айтемы',
          icon: <Inventory />,
          color: 'rgb(121, 85, 72)',
          link: '/economic/inventory'
        },
        {
          id: 'marketplace',
          title: 'Маркетплейс',
          subtitle: 'Покупка и продажа Айтемов',
          icon: <Store />,
          color: 'rgb(0, 150, 136)',
          link: '/marketplace'
        },
        ...(!isChannel ? [{
          id: 'stickers',
          title: 'Управление стикерами',
          subtitle: 'Создание и редактирование',
          icon: <EmojiEmotions />,
          color: 'rgb(233, 30, 99)',
          link: '/inform/sticker'
        }] : []),
        {
          id: 'grants',
          title: 'Гранты каналам',
          subtitle: 'Финансовая поддержка',
          icon: <Star />,
          color: 'rgb(255, 193, 7)',
          link: '/grant',
          highlighted: true
        },
        {
          id: 'referral',
          title: 'Реферальная программа',
          subtitle: 'Приглашайте друзей',
          icon: <People />,
          color: 'rgb(76, 175, 80)',
          link: '/referral',
          highlighted: true
        },
        {
          id: 'minigames',
          title: 'Мини-игры',
          subtitle: 'Развлекательные игры',
          icon: <Casino />,
          color: 'rgb(156, 39, 176)',
          link: '/minigames',
          highlighted: true
        },
        {
          id: 'username-auction',
          title: 'Аукцион юзернеймов',
          subtitle: 'Покупка уникальных имен',
          icon: <Gavel />,
          color: 'rgb(255, 87, 34)',
          link: '/username-auction',
          highlighted: true
        },
        ...(!isChannel ? [{
          id: 'sub-planes',
          title: 'Планы подписок',
          subtitle: 'Управление подписками',
          icon: <Star />,
          color: 'rgb(255, 193, 7)',
          link: '/sub-planes'
        }] : [])
      ]
    },
    ...((isAdmin || isModeratorUser) ? [{
      id: 'administration',
      title: 'Администрирование',
      items: [
        ...(isModeratorUser ? [{
          id: 'moderator',
          title: 'Модерация',
          subtitle: 'Управление контентом',
          icon: <Security />,
          color: 'rgb(255, 193, 7)',
          link: '/moderator',
          highlighted: true
        }] : []),
        ...(isAdmin ? [{
          id: 'admin',
          title: 'Админ панель',
          subtitle: 'Управление системой',
          icon: <AdminPanelSettings />,
          color: 'rgb(244, 67, 54)',
          link: '/admin'
        }] : [])
      ]
    }] : []),
    {
      id: 'platform',
      title: 'Платформа',
      items: [
        ...(!isChannel ? [{
          id: 'bugs',
          title: 'Сообщить об ошибке',
          subtitle: 'Помогите улучшить платформу',
          icon: <BugReport />,
          color: 'rgb(244, 67, 54)',
          link: '/bugs'
        }] : []),
        {
          id: 'about',
          title: 'О платформе',
          subtitle: 'Информация о проекте',
          icon: <Info />,
          color: 'rgb(33, 150, 243)',
          link: '/about',
          external: true
        },
        {
          id: 'rules',
          title: 'Правила',
          subtitle: 'Правила использования',
          icon: <Description />,
          color: 'rgb(158, 158, 158)',
          link: '/rules'
        },
        {
          id: 'logout',
          title: 'Выйти',
          subtitle: 'Завершить сессию',
          icon: <Logout />,
          color: 'rgb(244, 67, 54)',
          action: handleLogout,
          highlighted: true
        }
      ]
    }
  ];

  // Выделяем важные кнопки
  const primaryActions = sections[0].items;
  const otherSections = sections.slice(1);

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            },
            '50%': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
            },
            '100%': {
              transform: 'scale(1)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            },
          },
        }}
      />
      
             <Box
         sx={{
           mt: 2,
           minHeight: '100vh',
           mb: 2,
           padding: { xs: 0.5, sm: 1 },
           display: 'flex',
           flexDirection: 'column',
           alignItems: 'center'
         }}
       >
 
  
          {/* Profile Banner */}
          <Box sx={{
            width: '100%',
            maxWidth: 800,
            mb: 1.5,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '12px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Box sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <img
                src={user?.avatar_url || (user?.photo && `/static/uploads/avatar/${user.id}/${user.photo}`)}
                alt={user?.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.src = '/static/uploads/avatar/system/avatar.png';
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 0.25
              }}>
                <Typography variant="h6" sx={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}>
                  {user?.name || t('more_page.default_user')}
                </Typography>
                {user?.verification && user.verification.status > 0 && (
                  <Box sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 0.5
                  }}>
                    <VerifiedUser sx={{ fontSize: 12, color: 'white' }} />
                  </Box>
                )}
              </Box>
              <Typography variant="body2" sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.8rem'
              }}>
                @{user?.username || t('more_page.default_username')}
              </Typography>
            </Box>
          </Box>

          {/* Primary Actions Block */}
          <Box sx={{
            width: '100%',
            display: 'flex',
            gap: 1,
            mb: 2,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            justifyContent: { xs: 'center', sm: 'flex-start' },
          }}>
            {primaryActions.map((item) => (
              <Button
                key={item.id}
                component={item.link ? Link : 'button'}
                to={item.link}
                onClick={item.action || (() => {})}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 36,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  px: 1.2,
                  py: 0.7,
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                  transition: 'all 0.18s',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    transform: 'translateY(-1px) scale(1.03)'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '5px',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1
                }}>
                  {React.cloneElement(item.icon, { sx: { fontSize: 16 } })}
                </Box>
                <Typography sx={{ color: 'white', fontWeight: 200, fontSize: '0.80rem', lineHeight: 1 }}>{item.title}</Typography>
              </Button>
            ))}
          </Box>

          {/* Остальные секции */}
          <Box sx={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {otherSections.map((section) => (
              <Box key={section.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, ml: 0.5 }}>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{section.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {section.items.map((item) => (
                    <Button
                      key={item.id}
                      onClick={item.action || (() => {})}
                      component={item.link ? Link : 'button'}
                      to={item.link}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        padding: '4px 12px',
                        background: item.highlighted 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        border: item.highlighted 
                          ? '1px solid rgba(255, 255, 255, 0.2)' 
                          : '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        color: 'white',
                        textTransform: 'none',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        minHeight: '30px',
                        '&:hover': {
                          background: item.highlighted 
                            ? 'rgba(255, 255, 255, 0.12)' 
                            : 'rgba(255, 255, 255, 0.08)',
                          border: item.highlighted 
                            ? '1px solid rgba(255, 255, 255, 0.3)' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '3px',
                          background: 'transparent',
                          marginRight: 1.5,
                          flexShrink: 0
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 16 } })}
                      </Box>
                      
                      <Box sx={{ textAlign: 'left', flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            marginBottom: 0.25,
                            color: 'white'
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.7rem',
                            lineHeight: 1.2
                          }}
                        >
                          {item.subtitle}
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Footer */}
          <Box sx={{
            width: '100%',
            maxWidth: 800,
            mt: 2,
            padding: '12px',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem'
            }}>
              {t('more_page.footer.version')} • {t('more_page.footer.email')}
            </Typography>
          </Box>
        </Box>
    </>
  );
};

export default MorePage; 