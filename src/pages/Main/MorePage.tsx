import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, GlobalStyles, Grid, Card, CardContent, Avatar, Divider } from '@mui/material';
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
  VerifiedUser,
  ArrowForward,
  Notifications,
  Language,
  Help,
  PrivacyTip,
  Support,
  Palette,
  ConfirmationNumber,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
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
  badge?: string;
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

  const balanceTitle =
    userPoints > 9999
      ? formatNumber(userPoints)
      : `${formatNumber(userPoints)} баллов`;

  const sections: Section[] = [
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
          link:
            user && user.username ? `/friends/${user.username}` : '/friends',
        },
        {
          id: 'channels',
          title: 'Каналы',
          subtitle: 'Просмотр каналов',
          icon: <PlayCircle />,
          color: 'rgb(156, 39, 176)',
          link: '/channels',
        },
        {
          id: 'leaderboard',
          title: 'Рейтинг',
          subtitle: 'Таблица лидеров',
          icon: <TrendingUp />,
          color: 'rgb(255, 87, 34)',
          link: '/leaderboard',
        },
      ],
    },
    {
      id: 'entertainment',
      title: 'Развлечения',
      items: [
        {
          id: 'packs',
          title: 'Пачки',
          subtitle: 'Пачки с Айтемами',
          icon: <Inventory />,
          color: 'rgb(139, 195, 74)',
          link: '/economic/packs',
        },
        {
          id: 'inventory',
          title: 'Мой Инвентарь',
          subtitle: 'Ваши Айтемы',
          icon: <Inventory />,
          color: 'rgb(121, 85, 72)',
          link: '/economic/inventory',
        },
        {
          id: 'marketplace',
          title: 'Маркетплейс',
          subtitle: 'Покупка и продажа Айтемов',
          icon: <Store />,
          color: 'rgb(0, 150, 136)',
          link: '/marketplace',
        },
        {
          id: 'minigames',
          title: 'Мини-игры',
          subtitle: 'Развлекательные игры',
          icon: <Casino />,
          color: 'rgb(156, 39, 176)',
          link: '/minigames',
          highlighted: true,
        },
        {
          id: 'shop',
          title: 'Магазин бейджей',
          subtitle: 'Покупка и просмотр',
          icon: <ShoppingCart />,
          color: 'rgb(255, 193, 7)',
          link: '/badge-shop',
        },
      ],
    },
    {
      id: 'features',
      title: 'Возможности',
      items: [
        ...(!isChannel
          ? [
              {
                id: 'stickers',
                title: 'Управление стикерами',
                subtitle: 'Создание и редактирование',
                icon: <EmojiEmotions />,
                color: 'rgb(233, 30, 99)',
                link: '/inform/sticker',
              },
            ]
          : []),
        {
          id: 'grants',
          title: 'Гранты каналам',
          subtitle: 'Финансовая поддержка',
          icon: <Star />,
          color: 'rgb(255, 193, 7)',
          link: '/grant',
          highlighted: true,
        },
        {
          id: 'referral',
          title: 'Реферальная программа',
          subtitle: 'Приглашайте друзей',
          icon: <People />,
          color: 'rgb(76, 175, 80)',
          link: '/referral',
          highlighted: true,
        },
        {
          id: 'username-auction',
          title: 'Аукцион юзернеймов',
          subtitle: 'Покупка уникальных имен',
          icon: <Gavel />,
          color: 'rgb(255, 87, 34)',
          link: '/username-auction',
          highlighted: true,
        },
        ...(!isChannel
          ? [
              {
                id: 'sub-planes',
                title: 'Планы подписок',
                subtitle: 'Управление подписками',
                icon: <Star />,
                color: 'rgb(255, 193, 7)',
                link: '/sub-planes',
              },
            ]
          : []),
      ],
    },
    ...(isAdmin || isModeratorUser
      ? [
          {
            id: 'administration',
            title: 'Администрирование',
            items: [
              ...(isModeratorUser
                ? [
                    {
                      id: 'moderator',
                      title: 'Модерация',
                      subtitle: 'Управление контентом',
                      icon: <Security />,
                      color: 'rgb(255, 193, 7)',
                      link: '/moderator',
                      highlighted: true,
                    },
                  ]
                : []),
              ...(isAdmin
                ? [
                    {
                      id: 'admin',
                      title: 'Админ',
                      subtitle: 'Управление системой',
                      icon: <AdminPanelSettings />,
                      color: 'rgb(244, 67, 54)',
                      link: '/admin',
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    {
      id: 'settings',
      title: 'Настройки',
      items: [
        {
          id: 'profile-settings',
          title: 'Настройки профиля',
          subtitle: 'Управление профилем',
          icon: <Settings />,
          color: 'rgb(99, 102, 241)',
          link: '/settings',
        },
        {
          id: 'tickets',
          title: 'Мои тикеты',
          subtitle: 'Поддержка и жалобы',
          icon: <ConfirmationNumber />,
          color: 'rgb(156, 39, 176)',
          link: '/tickets',
        },
      ],
    },
    {
      id: 'info',
      title: 'Информация',
      items: [
        {
          id: 'brand',
          title: 'Бренд',
          subtitle: 'Информация о бренде',
          icon: <Icon icon='solar:palette-outline' width='20' height='20' />,
          color: 'rgb(255, 193, 7)',
          link: '/brand',
        },
        {
          id: 'bug-report',
          title: 'Баг-репорт',
          subtitle: 'Сообщить о проблеме',
          icon: <BugReport />,
          color: 'rgb(255, 7, 7)',
          link: '/bugs',
        },
        {
          id: 'about',
          title: 'О платформе',
          subtitle: 'Информация о проекте',
          icon: <Info />,
          color: 'rgb(33, 150, 243)',
          link: '/about',
          external: true,
        },
        {
          id: 'rules',
          title: 'Правила',
          subtitle: 'Правила использования',
          icon: <Description />,
          color: 'rgb(158, 158, 158)',
          link: '/rules',
        },
      ],
    },
    {
      id: 'account',
      title: 'Аккаунт',
      items: [
        {
          id: 'logout',
          title: 'Выйти',
          subtitle: 'Завершить сессию',
          icon: <Logout />,
          color: 'rgb(244, 67, 54)',
          action: handleLogout,
          highlighted: true,
        },
      ],
    },
  ];

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
            minHeight: '100vh',
            padding: { xs: 1, sm: 2 },
            pb: 8,
          }}
        >
                    {/* Profile Header Card */}
          <Card
            sx={{
              mb: 1,
              background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
              backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
              mt: '10px',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={
                      user?.avatar_url ||
                      (user?.photo &&
                        `/static/uploads/avatar/${user.id}/${user.photo}`)
                    }
                    alt={user?.name}
                    sx={{
                      width: 56,
                      height: 56,
                      border: '3px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/static/uploads/avatar/system/avatar.png';
                    }}
                  />
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          color: 'white',
                          fontSize: '1.1rem',
                        }}
                      >
                        {user?.name || t('more_page.default_user')}
                      </Typography>
                      {user?.verification && user.verification.status > 0 && (
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#4CAF50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <VerifiedUser sx={{ fontSize: 12, color: 'white' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.85rem',
                        fontWeight: 400,
                      }}
                    >
                      @{user?.username || t('more_page.default_username')}
                    </Typography>
                  </Box>
                </Box>
                
                <Button
                  component={Link}
                  to='/balance'
                  startIcon={<Wallet sx={{ fontSize: 18 }} />}
                  sx={{
                    background: 'var(--theme-background, rgba(77, 214, 81, 0.15))',
                    border: '1px solid rgba(77, 214, 81, 0.25)',
                    borderRadius: '18px',
                    color: '#4CAF50',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                      background: 'var(--theme-background, rgba(77, 214, 81, 0.25))',
                      border: '1px solid rgba(77, 214, 81, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {balanceTitle}
                </Button>
              </Box>
            </CardContent>
          </Card>

        {/* Sections */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sections.map(section => (
                         <Card
               key={section.id}
               sx={{
                 background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                 backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                 borderRadius: '16px',
                 boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                 border: '1px solid rgba(0, 0, 0, 0.12)',
                 overflow: 'hidden',
               }}
             >
              <CardContent sx={{ p: 0, paddingBottom: '0px !important' }}>
                {/* Section Header */}
                 <Box
                   sx={{
                     px: 2,
                     py: 1.5,
                     background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                     borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
                   }}
                 >
                   <Typography
                     variant='subtitle2'
                     sx={{
                       fontWeight: 600,
                       color: 'rgba(255, 255, 255, 0.8)',
                       fontSize: '0.8rem',
                       textTransform: 'uppercase',
                       letterSpacing: '0.5px',
                     }}
                   >
                     {section.title}
                   </Typography>
                 </Box>

                {/* Section Items */}
                <Box>
                  {section.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <Button
                        onClick={item.action || (() => {})}
                        component={item.link ? Link : 'button'}
                        to={item.link}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                                                 sx={{
                           width: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           px: 2,
                           py: 1.5,
                           textTransform: 'none',
                           background: 'transparent',
                           color: 'white',
                           borderRadius: 0,
                           border: 'none',
                           '&:hover': {
                             background: 'var(--theme-background, rgba(255, 255, 255, 0.08))',
                           },
                           '&:active': {
                             background: 'var(--theme-background, rgb(24 24 24))',
                           },
                         }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '16px',
                              background: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            {React.cloneElement(item.icon, { 
                              sx: { 
                                fontSize: 20, 
                                color: 'white' 
                              } 
                            })}
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'left' }}>
                                                         <Typography
                               variant='body1'
                               sx={{
                                 fontWeight: 600,
                                 fontSize: '0.9rem',
                                 color: 'white',
                                 mb: 0.25,
                               }}
                             >
                               {item.title}
                             </Typography>
                             <Typography
                               variant='body2'
                               sx={{
                                 color: 'rgba(255, 255, 255, 0.7)',
                                 fontSize: '0.8rem',
                                 lineHeight: 1.2,
                               }}
                             >
                               {item.subtitle}
                             </Typography>
                          </Box>
                        </Box>
                        <ArrowForward sx={{ color: '#ccc', fontSize: 20 }} />
                      </Button>
                      {index < section.items.length - 1 && (
                        <Divider sx={{ mx: 2, opacity: 0.3 }} />
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 3,
            textAlign: 'center',
            padding: '16px',
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
            }}
          >
            {t('more_page.footer.version')} • {t('more_page.footer.email')}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default MorePage;
