import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  Person,
  VerifiedUser,
  EmojiEvents,
  CardMembership,
  AdminPanelSettings,
  VpnKey,
  BugReport,
  PostAdd,
  Comment,
  MusicNote,
  PersonAdd,
  People,
  BarChart,
  ListAlt,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useCurrentUser } from './hooks/useCurrentUser';
import { TabValue, TabConfig } from './types';
import ProfileTab from './components/ProfileTab';
import VerificationTab from './components/VerificationTab';
import SubscriptionsTab from './components/SubscriptionsTab';
import ModeratorsTab from './components/ModeratorsTab';
import KeysTab from './components/KeysTab';
import BugReportsTab from './components/BugReportsTab';
import PostsModerationTab from './components/PostsModerationTab';
import CommentsModerationTab from './components/CommentsModerationTab';
import BadgesTab from './components/BadgesTab';
import TracksModerationTab from './components/TracksModerationTab';
import ArtistsTab from './components/ArtistsTab';
import UsersTab from './components/UsersTab';
import StatisticsTab from './components/StatisticsTab';
import LogsTab from './components/LogsTab';

const ModeratorNitroPanel: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { currentUser, moderatorData, permissions, loading, error, isModerator } = useCurrentUser();
  
  console.log('ModeratorNitroPanel - loading:', loading, 'error:', error, 'moderatorData:', moderatorData, 'currentUser:', currentUser, 'permissions:', permissions);
  
  const [activeTab, setActiveTab] = useState<TabValue>('profile' as TabValue);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((severity: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const tabConfigs: TabConfig[] = [
    {
      value: 'profile' as TabValue,
      label: 'Профиль',
      icon: <Person />,
    },
    {
      value: 'users' as TabValue,
      label: 'Пользователи',
      icon: <People />,
    },
    {
      value: 'verification',
      label: 'Верификация',
      icon: <VerifiedUser />,
    },
    {
      value: 'subscriptions',
      label: 'Подписки',
      icon: <CardMembership />,
    },
    {
      value: 'moderators',
      label: 'Модераторы',
      icon: <AdminPanelSettings />,
      adminOnly: true,
    },
    {
      value: 'keys',
      label: 'Ключи',
      icon: <VpnKey />,
      adminOnly: true,
    },
    {
      value: 'bugreports',
      label: 'Баг репорты',
      icon: <BugReport />,
    },
    {
      value: 'posts',
      label: 'Посты',
      icon: <PostAdd />,
    },
    {
      value: 'comments',
      label: 'Комментарии',
      icon: <Comment />,
    },
    {
      value: 'badges',
      label: 'Бейджи',
      icon: <EmojiEvents />,
    },
    {
      value: 'tracks',
      label: 'Треки',
      icon: <MusicNote />,
    },
    {
      value: 'artists',
      label: 'Артисты',
      icon: <PersonAdd />,
    },
    {
      value: 'statistics',
      label: 'Статистика',
      icon: <BarChart />,
    },
    {
      value: 'logs',
      label: 'Логи',
      icon: <ListAlt />,
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const renderTabContent = () => {
    try {
      switch (activeTab) {
        case 'profile':
          return <ProfileTab currentUser={currentUser} moderatorData={moderatorData} permissions={permissions} loading={loading} error={error} />;
        case 'verification':
          return <VerificationTab />;
        case 'subscriptions':
          return <SubscriptionsTab />;
        case 'moderators':
          return <ModeratorsTab />;
        case 'keys':
          return <KeysTab />;
        case 'bugreports':
          return <BugReportsTab />;
        case 'posts':
          return <PostsModerationTab />;
        case 'comments':
          return <CommentsModerationTab />;
        case 'badges':
          return <BadgesTab />;
        case 'tracks':
          return <TracksModerationTab />;
        case 'artists':
          return <ArtistsTab />;
        case 'users':
          return <UsersTab />;
        case 'statistics':
          return <StatisticsTab />;
        case 'logs':
          return <LogsTab />;
        default:
          return <ProfileTab currentUser={currentUser} moderatorData={moderatorData} permissions={permissions} loading={loading} error={error} />;
      }
    } catch (error) {
      console.error('Error rendering tab content:', error);
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error">
            Ошибка загрузки вкладки. Попробуйте обновить страницу.
          </Alert>
        </Box>
      );
    }
  };

  const getAvailableTabs = () => {
    if (!currentUser) {
      return tabConfigs.filter(tab => !tab.adminOnly);
    }
    
    return tabConfigs.filter(tab => {
      if (tab.adminOnly && currentUser.id !== 3) {
        return false;
      }
      return true;
    });
  };

  
  useEffect(() => {
    if (error && !loading) {
      console.error('Authorization error:', error);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [error, loading, navigate]);

  if (loading && !moderatorData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--theme-background)'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!loading && !moderatorData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>
            {error || 'У вас нет прав модератора для доступа к этой панели'}
          </Typography>
        </Alert>
      </Container>
    );
  }

  const availableTabs = getAvailableTabs();

  if (isMobile) {
    return (
      <Container maxWidth="xl" sx={{ 
        mt: 2, 
        mb: 4, 
        p:'0px !important',
      }}>
        <Paper sx={{
          background: 'var(--theme-background)',
          backdropFilter: 'var(--theme-backdrop-filter)',
          borderRadius: 'var(--main-border-radius)',
        }}>
          {/* Мобильный заголовок */}
          <AppBar 
            position="static" 
            sx={{ 

              background: 'var(--theme-background)',
              borderBottom: '1px solid var(--main-border-color)',
              boxShadow: 'none',
              mb: 2
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 2}}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Nitro Panel
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Мобильное меню */}
          <Drawer
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            PaperProps={{
              sx: {
                background: 'var(--theme-background)',
                borderRight: '1px solid var(--main-border-color)',
                width: 280,
                backdropFilter: 'var(--theme-backdrop-filter)',
              }
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Nitro Panel
                </Typography>
                <IconButton onClick={() => setMobileDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {availableTabs.map((tab) => (
                  <ListItem
                    key={tab.value}
                    button
                    onClick={(e) => handleTabChange(e, tab.value)}
                    selected={activeTab === tab.value}
                    sx={{
                      borderRadius: 'var(--main-border-radius)',
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'var(--main-accent-color)',
                        '&:hover': {
                          backgroundColor: 'var(--main-accent-color)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: activeTab === tab.value ? 'primary.main' : 'inherit' }}>
                      {tab.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={tab.label}
                      primaryTypographyProps={{
                        color: activeTab === tab.value ? 'primary.main' : 'inherit',
                        fontWeight: activeTab === tab.value ? 'bold' : 'normal',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>

          {/* Контент */}
          <Box sx={{
            p: 0
          }}>
            {renderTabContent()}
          </Box>

          {/* Уведомления */}
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseNotification} 
              severity={notification.severity}
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ 
      mt: 2, 
      mb: 4, 
      p:'0px !important',
    }}>
        <Box sx={{ display: 'flex', minHeight: '70vh' }}>
          {/* Боковая панель для десктопа */}
          <Paper
            elevation={0}
            sx={{
              width: 200,
              height: '100%',
              mr: 1,
              borderRight: '1px solid var(--main-border-color)',
              background: 'var(--theme-background)',
              backdropFilter: 'var(--theme-backdrop-filter)',
              borderRadius: 'var(--main-border-radius)',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mb: 3
                }}
              >
                Nitro
              </Typography>
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    minHeight: 48,
                    padding: '12px 16px',
                    borderRadius: 'var(--main-border-radius)',
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'var(--main-accent-color)',
                      color: 'primary.main',
                      fontWeight: 'bold',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {availableTabs.map((tab) => (
                  <Tab
                   sx={{ p:'0px !important' }}
                    key={tab.value}
                    value={tab.value}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {tab.icon}
                        <Typography variant="body2">
                          {tab.label}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>
          </Paper>

          {/* Основной контент */}
          <Paper sx={{ 
            flexGrow: 1,
            p: 0,
            background: 'transparent',
          }}>
            {renderTabContent()}
          </Paper>
        </Box>

        {/* Уведомления */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
    </Container>
  );
};

export default ModeratorNitroPanel;
