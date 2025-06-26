import React, { useState, useEffect, useMemo, useContext, lazy, Suspense, useTransition, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ProfileService from './services/ProfileService'; 
import { AuthProvider, AuthContext } from './context/AuthContext';
import AppBottomNavigation from './components/BottomNavigation';
import { MusicProvider } from './context/MusicContext';
import { Box, CircularProgress, Typography, Button, Alert, GlobalStyles } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import { PostDetailProvider } from './context/PostDetailContext';
import RegisterChannel from './pages/Auth/RegisterChannel';
import { ErrorBoundary } from 'react-error-boundary';
import ChannelsPage from './pages/Main/ChannelsPage';
import MusicPlayerCore from './components/MusicPlayerCore';
import { setSessionContext } from './services/ProfileService';
import RouletteGame from './pages/MiniGames/RouletteGame';
import JoinGroupChat from './pages/Messenger/JoinGroupChat';
import { MessengerProvider } from './contexts/MessengerContext';
import CookieBanner from './components/CookieBanner';
import CookiePage from './pages/Info/CookiesPage';
import { LanguageProvider } from './context/LanguageContext';
import { DefaultPropsProvider } from './context/DefaultPropsContext';
import AppLoadingScreen from './components/AppLoadingScreen';
import axios from 'axios';

export const SessionContext = React.createContext({
  sessionActive: true,
  sessionExpired: false,
  lastFetchTime: null,
  broadcastUpdate: () => {},
  checkSessionStatus: () => true,
  refreshSession: () => {}
});

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();
  
  
  if (loading) {
    return null;
  }
  
  
  if (isAuthenticated) {
    return children;
  }
  
  
  return (
    <Navigate 
      to="/login" 
      state={{ from: location.pathname }} 
      replace 
    />
  );
};


const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const RegisterProfile = lazy(() => import('./pages/Auth/RegisterProfile'));
const EmailConfirmation = lazy(() => import('./pages/Auth/EmailConfirmation'));
const ElementAuth = lazy(() => import('./pages/Auth/ElementAuth'));
const MainLayout = lazy(() => import('./components/Layout/MainLayout'));
const ProfilePage = lazy(() => import('./pages/User/ProfilePage'));
const MainPage = lazy(() => import('./pages/Main/MainPage'));
const PostDetailPage = lazy(() => import('./pages/Main/PostDetailPage'));
const SettingsPage = lazy(() => import('./pages/User/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/Info/NotificationsPage'));
const SearchPage = lazy(() => import('./pages/Main/SearchPage'));
const MusicPage = lazy(() => import('./pages/MusicPage/MusicPage.js'));
const ArtistPage = lazy(() => import('./pages/Main/ArtistPage'));
const MessengerPage = lazy(() => import('./pages/Messenger/MessengerPage'));
const SubscriptionsPage = lazy(() => import('./pages/Economic/SubscriptionsPage'));
const BugReportPage = lazy(() => import('./pages/BugPages/BugReportPage'));
const LeaderboardPage = lazy(() => import('./pages/Main/LeaderboardPage'));
const RulesPage = lazy(() => import('./pages/Info/RulesPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/Info/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/Info/TermsOfServicePage'));
const MorePage = lazy(() => import('./pages/Main/MorePage'));
const NotFound = lazy(() => import('./pages/Info/NotFound'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const ModeratorPage = lazy(() => import('./pages/Admin/ModeratorPage'));
const UpdatesPage = lazy(() => import('./pages/Main/UpdatesPage'));
const SharePreviewTest = lazy(() => import('./components/SharePreviewTest'));
const BadgeShopPage = lazy(() => import('./pages/Economic/BadgeShopPage'));
const BalancePage = lazy(() => import('./pages/Economic/BalancePage'));
const UsernameAuctionPage = lazy(() => import('./pages/Economic/UsernameAuctionPage'));
const InventoryPackPage = lazy(() => import('./pages/Economic/components/inventoryPack/InventoryPackPage'));
const InventoryPage = lazy(() => import('./pages/Economic/components/inventoryPack/InventoryPage'));
const MarketplacePage = lazy(() => import('./pages/Economic/components/marketplace/MarketplacePage'));
const GrantsPage = lazy(() => import('./pages/Economic/components/grantPage/GrantsPage'));
const SimpleApiDocsPage = lazy(() => import('./pages/Info/SimpleApiDocsPage'));
const SubPlanes = lazy(() => import('./pages/Economic/SubPlanes'));
const TestNotifications = lazy(() => import('./components/TestNotifications'));
const MiniGamesPage = lazy(() => import('./pages/MiniGames/MiniGamesPage'));
const CupsGamePage = lazy(() => import('./pages/MiniGames/CupsGamePage'));
const LuckyNumberGame = lazy(() => import('./pages/MiniGames/LuckyNumberGame'));
const ClickerPage = lazy(() => import('./pages/MiniGames/ClickerPage'));
const BlackjackPage = lazy(() => import('./pages/MiniGames/BlackjackPage'));
const AboutPage = lazy(() => import('./pages/Info/AboutPage'));
const LikedTracksPage = lazy(() => import('./pages/MusicPage/components/LikedTracksPage'));
const AllTracksPage = lazy(() => import('./pages/MusicPage/AllTracksPage'));
const PlaylistsPage = lazy(() => import('./pages/MusicPage/PlaylistsPage'));


export const ThemeSettingsContext = React.createContext({
  themeSettings: {
    mode: 'dark',
    primaryColor: '#D0BCFF',
    secondaryColor: '#f28c9a'
  },
  updateThemeSettings: () => {},
  setProfileBackground: () => {},
  clearProfileBackground: () => {},
});


const SuspenseFallback = () => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: theme.palette.background.default
      }}
    >
      <CircularProgress 
        color="primary" 
        size={40} 
        thickness={4} 
        sx={{ 
          color: theme.palette.primary.main,
          filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))'
        }}
      />
    </Box>
  );
};


const PageTransition = ({ children }) => {
  return children;
};


const LoadingIndicator = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: theme.palette.background.default
      }}
    >
      <Box 
        sx={{
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
            '50%': { opacity: 1, transform: 'scale(1.2)' },
          }
        }}
      >
        <Box 
          component="img" 
          src="/icon-512.png" 
          alt="K-Connect"
          sx={{ 
            width: 80, 
            height: 80,
            filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.4))'
          }} 
        />
      </Box>
    </Box>
  );
};


const isAboutSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname === 'about.k-connect.ru';
};

const isShareSubdomain = () => {
  const hostname = window.location.hostname;
  return hostname === 'share.k-connect.ru';
};


const AboutRoute = () => {
  return <AboutPage />;
};


const ErrorFallback = ({ error, resetErrorBoundary }) => {
  useEffect(() => {
    if (
      error?.message?.includes('Failed to fetch') || 
      error?.name === 'TypeError' ||
      error?.message?.includes('Failed to fetch dynamically imported module')
    ) {
      window.location.reload();
      return;
    }
  }, [error]);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      p: 3
    }}>
      <Typography variant="h5" gutterBottom>
        Что-то пошло не так
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Пожалуйста, попробуйте перезагрузить страницу
      </Typography>
      <Box sx={{ 
        mt: 2, 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        maxWidth: '600px',
        width: '100%',
        textAlign: 'left'
      }}>
        <Typography variant="subtitle2" color="error" gutterBottom>
          Детали ошибки:
        </Typography>
        <Typography 
          variant="body2" 
          component="pre" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'text.secondary',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        >
          {error?.message || 'Неизвестная ошибка'}
        </Typography>
        {error?.stack && (
          <Typography 
            variant="body2" 
            component="pre" 
            sx={{ 
              mt: 1,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              opacity: 0.7
            }}
          >
            {error.stack}
          </Typography>
        )}
      </Box>
      <Button 
        variant="contained" 
        onClick={resetErrorBoundary || (() => window.location.reload())}
        sx={{ mt: 3 }}
      >
        Перезагрузить
      </Button>
    </Box>
  );
};


const PublicPages = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const path = location.pathname;

  let PublicPage;
  if (path === '/rules') {
    PublicPage = RulesPage;
  } else if (path === '/privacy-policy') {
    PublicPage = PrivacyPolicyPage;
  } else if (path === '/terms-of-service') {
    PublicPage = TermsOfServicePage;
  } else if (path === '/about') {
    return <AboutPage />;
  } else if (path === '/cookies') {
    PublicPage = CookiePage;
  }

  const content = (
    <Box>
      <PublicPage />
    </Box>
  );

  return isAuthenticated ? (
    <MainLayout>
      {content}
    </MainLayout>
  ) : content;
};


const AppRoutes = () => {
  const { user, isAuthenticated, loading, checkAuth, error, setUser } = useContext(AuthContext);
  const location = useLocation();
  const theme = useTheme();
  
  
  const background = location.state && location.state.background;
  
  
  const [isPending, startTransition] = useTransition();
  
  
  useEffect(() => {
    
    
    const isResetPasswordWithToken = location.pathname === '/reset-password' && 
                                   (location.search.includes('token=') || 
                                    window.location.hash.includes('/reset-password?token='));
    
    const isAuthPage = ['/login', '/register', '/register/profile', '/confirm-email', '/auth_elem', '/about', '/forgot-password'].some(
      path => location.pathname.startsWith(path)
    ) || location.pathname.startsWith('/reset-password');
    
    
    console.log('Current path:', location.pathname, 
                'Reset password with token:', isResetPasswordWithToken,
                'Search params:', location.search,
                'Hash:', window.location.hash);
    
    const hasSavedLoginError = !!localStorage.getItem('login_error');
    const authSuccessFlag = localStorage.getItem('auth_success') === 'true';
    
    
    if (authSuccessFlag && location.pathname === '/') {
      console.log('Обнаружен флаг успешной авторизации, применяем сессию');
      localStorage.removeItem('auth_success');
      
      startTransition(() => {
        checkAuth(true);
      });
      return;
    }
    
    if (!isAuthPage && !isResetPasswordWithToken && !error && !hasSavedLoginError) {
      console.log('Проверка авторизации при загрузке страницы...');
      const initAuth = async () => {
        
        startTransition(() => {
          checkAuth(true);
        });
      };
      
      initAuth();
    } else if (isAuthPage || isResetPasswordWithToken) {
      console.log('Пропускаем проверку авторизации на странице авторизации:', location.pathname, isResetPasswordWithToken ? '(сброс пароля с токеном)' : '');
    } else if (error) {
      console.log('Пропускаем проверку авторизации из-за наличия ошибки:', error);
    } else if (hasSavedLoginError) {
      console.log('Пропускаем проверку авторизации из-за наличия сохраненной ошибки входа');
    }
    
  }, [location.pathname, location.search, window.location.hash]); 
  
  
  
  const currentPath = location.pathname;
  const isLoginPage = currentPath === '/login';
  const isRegisterPage = currentPath === '/register';
  const isPasswordRecoveryPage = currentPath === '/forgot-password' || currentPath === '/reset-password';
  const isElementAuthPage = currentPath.startsWith('/auth_elem') || currentPath === '/element-auth';
  
  
  
  if (isLoginPage || isRegisterPage || isPasswordRecoveryPage) {
    return (
      <Box sx={{ minHeight: '100vh', background: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<SuspenseFallback />}>
          <Routes location={location}>
            <Route path="/login" element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            } />
            <Route path="/register" element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Register setUser={setUser} />
              )
            } />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Box>
    );
  }
  if (isElementAuthPage) {
    return (
      <Box sx={{ minHeight: '100vh', background: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
        <Routes location={location}>
          <Route path="/element-auth" element={<ElementAuth />} />
          <Route path="/auth_elem/:token" element={<ElementAuth />} />
          <Route path="/auth_elem/direct/:token" element={<ElementAuth />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Box>
    );
  }
  
  
  return (
    <MainLayout>
      <PageTransition>
        <Routes location={background || location}>
          <Route path="/register/profile" element={<RegisterProfile setUser={setUser} />} />
          <Route path="/register/channel" element={<RegisterChannel />} />
          <Route path="/confirm-email/:token" element={<EmailConfirmation />} />                    
          <Route path="/" element={
            loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
              </Box>
            ) : isAuthenticated ? (
              <MainPage />
            ) : (
              <Navigate to="/login" replace state={{ from: location.pathname }} />
            )
          } />
          <Route path="/feed" element={<Navigate to="/" replace />} />
          <Route path="/main" element={<Navigate to="/" replace />} />                  
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/:username/followers" element={isAuthenticated ? <SubscriptionsPage tabIndex={0} /> : <Navigate to="/login" replace />} />
          <Route path="/profile/:username/following" element={isAuthenticated ? <SubscriptionsPage tabIndex={1} /> : <Navigate to="/login" replace />} />
          <Route path="/subscriptions" element={isAuthenticated ? <SubscriptionsPage /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} />
          <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" replace />} />
          <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" replace />} />
          <Route path="/music" element={isAuthenticated ? <MusicPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/liked" element={isAuthenticated ? <LikedTracksPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/all" element={isAuthenticated ? <AllTracksPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/playlists" element={isAuthenticated ? <PlaylistsPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/:section" element={isAuthenticated ? <MusicPage /> : <Navigate to="/login" replace />} />
          <Route path="/music/track/:trackId" element={isAuthenticated ? <MusicPage /> : <Navigate to="/login" replace />} />
          <Route path="/artist/:artistParam" element={isAuthenticated ? <ArtistPage /> : <Navigate to="/login" replace />} />
          <Route path="/messenger" element={isAuthenticated ? <MessengerPage /> : <Navigate to="/login" replace />} />
          <Route path="/messenger/join/:inviteCode" element={isAuthenticated ? <JoinGroupChat /> : <Navigate to="/login" replace />} />
          <Route path="/bugs" element={<BugReportPage />} />
          <Route path="/leaderboard" element={<RequireAuth><LeaderboardPage /></RequireAuth>} />          
          <Route path="/share-preview-test" element={isAuthenticated ? <SharePreviewTest /> : <Navigate to="/login" replace />} />
          <Route path="/more" element={isAuthenticated ? <MorePage /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={isAuthenticated ? <AdminPage /> : <Navigate to="/login" replace />} />
          <Route path="/moderator" element={isAuthenticated ? <ModeratorPage /> : <Navigate to="/login" replace />} />
          <Route path="/badge-shop" element={isAuthenticated ? <BadgeShopPage /> : <Navigate to="/login" replace />} />
          <Route path="/username-auction" element={isAuthenticated ? <UsernameAuctionPage /> : <Navigate to="/login" replace />} />         
          <Route path="/economic/packs" element={isAuthenticated ? <InventoryPackPage /> : <Navigate to="/login" replace />} />
          <Route path="/economic/inventory" element={isAuthenticated ? <InventoryPage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames" element={isAuthenticated ? <MiniGamesPage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/cups" element={isAuthenticated ? <CupsGamePage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/lucky-number" element={isAuthenticated ? <LuckyNumberGame /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/clicker" element={isAuthenticated ? <ClickerPage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/blackjack" element={isAuthenticated ? <BlackjackPage /> : <Navigate to="/login" replace />} />
          <Route path="/minigames/roulette" element={isAuthenticated ? <RouletteGame /> : <Navigate to="/login" replace />} />
          <Route path="/balance" element={isAuthenticated ? <BalancePage /> : <Navigate to="/login" replace />} />
          <Route path="/api-docs" element={isAuthenticated ? <SimpleApiDocsPage /> : <Navigate to="/login" replace />} />
          <Route path="/sub-planes" element={isAuthenticated ? <SubPlanes /> : <Navigate to="/login" replace />} />
          <Route path="/channels" element={<RequireAuth><ChannelsPage /></RequireAuth>} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/test-notifications" element={<TestNotifications />} />
          <Route path="/cookies" element={<PublicPages />} />
          <Route path="/badge/:badgeId" element={<Navigate to="/badge-shop" replace state={{ openBadgeId: (location.pathname.match(/\/badge\/(\d+)/)?.[1] || null) }} />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/grant" element={isAuthenticated ? <GrantsPage /> : <Navigate to="/login" replace />} />
          <Route path="/item/:itemId" element={<ItemRedirectPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>                
        {background && (
          <Routes>
            <Route 
              path="/post/:postId" 
              element={<PostDetailPage isOverlay={true} />} 
            />
          </Routes>
        )}
      </PageTransition>
      <AppBottomNavigation user={user} />
    </MainLayout>
  );
};
const MemoizedAppRoutes = React.memo(AppRoutes);
const preloadMusicImages = () => { 
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const basePaths = [
    '/static/uploads/system',
    '/uploads/system'
  ];
  
  const imageFiles = [
    'like_playlist.jpg',
    'all_tracks.jpg',
    'random_tracks.jpg',
    'album_placeholder.jpg',
    'playlist_placeholder.jpg'
  ];  
  basePaths.forEach(basePath => {
    imageFiles.forEach(file => {
      const path = `${basePath}/${file}`;
      const img = new Image();
      img.src = path;
      img.onerror = () => {
        console.warn(`Image not found: ${path}. Using gradient placeholder.`);
      };
    });
  });
};
const DefaultSEO = () => {
  
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href
    : 'https://k-connect.ru';
    
  
  const getPageType = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/post/')) return 'article';
      if (path.includes('/profile/')) return 'profile';
      if (path.includes('/music/')) return 'music';
    }
    return 'website';
  };
  
  return (
    <SEO 
      title="К-Коннект" 
      description="К-Коннект - социальная сеть от независимого разработчика с функциями для общения, публикации постов, музыки и многого другого."
      image="/icon-512.png"
      url={currentUrl}
      type={getPageType()}
      meta={{
        keywords: "социальная сеть, к-коннект, общение, музыка, лента, сообщения",
        viewport: "width=device-width, initial-scale=1, maximum-scale=5"
      }}
    />
  );
};
const SessionProvider = ({ children }) => {
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionStartTime = useRef(Date.now());
  const lastFetchTime = useRef(null);
  const broadcastChannel = useRef(null);
  const SESSION_TIMEOUT = 60 * 60 * 1000;
  const MIN_UPDATE_INTERVAL = 15000;

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel.current = new BroadcastChannel('k_connect_app_channel');
        
        broadcastChannel.current.onmessage = (event) => {
          const { type, data, timestamp } = event.data;
          
          if (type === 'session_refresh') {
            sessionStartTime.current = timestamp;
            setSessionActive(true);
            setSessionExpired(false);
          } else if (type === 'last_fetch_update' && timestamp > (lastFetchTime.current || 0)) {
            lastFetchTime.current = timestamp;
          }
        };
      } catch (error) {
        console.error('BroadcastChannel initialization error:', error);
      }
    }    
    return () => {
      if (broadcastChannel.current) {
        try {
          broadcastChannel.current.close();
        } catch (error) {
          console.error('Error closing BroadcastChannel:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const currentTime = Date.now();
      const sessionDuration = currentTime - sessionStartTime.current;
      
      if (sessionDuration >= SESSION_TIMEOUT && !sessionExpired) {
        setSessionExpired(true);
        setSessionActive(false);
      }
    };    
    const expirationInterval = setInterval(checkSessionExpiration, 60000);    
    return () => clearInterval(expirationInterval);
  }, [sessionExpired]);

  const broadcastUpdate = (type, data) => {
    if (broadcastChannel.current) {
      try {
        broadcastChannel.current.postMessage({
          type,
          data,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error broadcasting update:', error);
      }
    }
  };
  const checkSessionStatus = () => {
    if (sessionExpired) return false;
    
    const currentTime = Date.now();
    if (lastFetchTime.current && (currentTime - lastFetchTime.current) < MIN_UPDATE_INTERVAL) {
      return false;
    }
    
    lastFetchTime.current = currentTime;
    broadcastUpdate('last_fetch_update', null);
    
    return true;
  };

  const refreshSession = () => {
    const currentTime = Date.now();
    sessionStartTime.current = currentTime;
    setSessionActive(true);
    setSessionExpired(false);
    broadcastUpdate('session_refresh', { newStartTime: currentTime });
  };

  const contextValue = {
    sessionActive,
    sessionExpired,
    lastFetchTime: lastFetchTime.current,
    broadcastUpdate,
    checkSessionStatus,
    refreshSession
  };

  useEffect(() => {
    setSessionContext({
      checkSessionStatus,
      sessionActive,
      sessionExpired,
      lastFetchTime: lastFetchTime.current,
      refreshSession
    });
  }, [sessionActive, sessionExpired]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now();
        lastFetchTime.current = currentTime;
        broadcastUpdate('last_fetch_update', null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};


function App() {
  const [isPending, startTransition] = useTransition();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [themeSettings, setThemeSettings] = useState(() => {
    
    const getStoredValue = (key, defaultValue) => {
      
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) return sessionValue;
      
      
      const localValue = localStorage.getItem(key);
      if (localValue) return localValue;
      
      
      const cookieValue = getCookie(key);
      if (cookieValue) return cookieValue;
      
      
      try {
        const themeData = JSON.parse(localStorage.getItem('themeData') || '{}');
        if (themeData[key]) return themeData[key];
      } catch (e) {
        console.warn('Error parsing theme data JSON:', e);
      }
      
      return defaultValue;
    };
    
    
    const sessionTheme = sessionStorage.getItem('themeMode');
    const localTheme = localStorage.getItem('theme') || localStorage.getItem('themeMode');
    const cookieTheme = getCookie('themeMode') || getCookie('theme');
    
    
    const savedThemeMode = sessionTheme || localTheme || cookieTheme || 'dark';
    
    
    if (savedThemeMode) {
      localStorage.setItem('theme', savedThemeMode);
      localStorage.setItem('themeMode', savedThemeMode);
      sessionStorage.setItem('theme', savedThemeMode);
      sessionStorage.setItem('themeMode', savedThemeMode);
      setCookie('theme', savedThemeMode);
      setCookie('themeMode', savedThemeMode);
    }
    
    return {
      mode: savedThemeMode,
      backgroundColor: getStoredValue('backgroundColor', 
                      (savedThemeMode === 'light' ? '#f5f5f5' : savedThemeMode === 'contrast' ? '#080808' : '#131313')),
      paperColor: getStoredValue('paperColor', 
                 (savedThemeMode === 'light' ? '#ffffff' : savedThemeMode === 'contrast' ? '#101010' : '#1A1A1A')),
      headerColor: getStoredValue('headerColor', 
                  (savedThemeMode === 'light' ? '#ffffff' : savedThemeMode === 'contrast' ? '#101010' : '#121212')),
      bottomNavColor: getStoredValue('bottomNavColor', 
                     (savedThemeMode === 'light' ? '#ffffff' : savedThemeMode === 'contrast' ? '#101010' : '#1A1A1A')),
      contentColor: getStoredValue('contentColor', 
                   (savedThemeMode === 'light' ? '#ffffff' : savedThemeMode === 'contrast' ? '#101010' : '#1A1A1A')),
      primaryColor: getStoredValue('primaryColor', 
                   (savedThemeMode === 'light' ? '#8c52ff' : savedThemeMode === 'contrast' ? '#7B46E3' : '#D0BCFF')),
      textColor: getStoredValue('textColor', 
                (savedThemeMode === 'light' ? '#121212' : '#FFFFFF')),
    };
  });
  
  
  const recoverThemeSettings = useCallback(() => {
    console.log('Running theme recovery check...');
    
    
    const currentMode = themeSettings.mode;
    
    
    const sessionTheme = sessionStorage.getItem('themeMode');
    const localTheme = localStorage.getItem('themeMode');
    const cookieTheme = getCookie('themeMode');
    
    
    if (!sessionTheme || !localTheme || !cookieTheme) {
      console.log('Theme storage inconsistency detected, restoring...');
      
      
      saveThemeSettings('theme', currentMode);
      saveThemeSettings('themeMode', currentMode);
      
      
      Object.entries(themeSettings).forEach(([key, value]) => {
        if (key !== 'mode' && value) {
          saveThemeSettings(key, value);
        }
      });
      
      
      try {
        const themeData = {};
        Object.entries(themeSettings).forEach(([key, value]) => {
          if (value) {
            themeData[key] = value;
            if (key === 'mode') {
              themeData['theme'] = value;
              themeData['themeMode'] = value;
            }
          }
        });
        localStorage.setItem('themeData', JSON.stringify(themeData));
        sessionStorage.setItem('themeData', JSON.stringify(themeData));
      } catch (e) {
        console.error('Error creating theme data backup:', e);
      }
    }
  }, [themeSettings]);
  
  
  useEffect(() => {
    
    recoverThemeSettings();
    
    
    const recoveryInterval = setInterval(recoverThemeSettings, 30000);
    
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recoverThemeSettings();
      }
    };
    
    const handleFocus = () => {
      recoverThemeSettings();
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(recoveryInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [recoverThemeSettings]);
  
  const onAboutSubdomain = useMemo(() => isAboutSubdomain(), []);
  const onShareSubdomain = useMemo(() => isShareSubdomain(), []);
  
  useEffect(() => {
    if (onShareSubdomain) {

      console.log('Share subdomain detected, user will be redirected via share.html');
    }
  }, [onShareSubdomain]);
  
  useEffect(() => {
    preloadMusicImages();
  }, []);

  // Убираем автоматический таймер - экран загрузки будет скрываться только после реальной загрузки всех ресурсов

  const getContrastTextColor = (hexColor) => {
    if (themeSettings.mode === 'dark' || themeSettings.mode === 'contrast') {
      return '#FFFFFF';
    }
    
    if (!hexColor || typeof hexColor !== 'string') {
      return '#000000'; 
    }
    
    const color = hexColor.charAt(0) === '#' ? hexColor.substring(1) : hexColor;
    
    if (!/^[0-9A-Fa-f]{6}$/.test(color)) {
      console.warn('Invalid hex color provided to getContrastTextColor:', hexColor);
      return '#000000';
    }
    
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  };

  
  const loadThemeSettings = async (forceDefault = false) => {
    try {
      if (forceDefault) {
        
        const defaultSettings = {
          background_color: '#131313',
          container_color: '#1A1A1A',
          header_color: '#1A1A1A',
          bottom_nav_color: '#1A1A1A',
          content_color: '#1A1A1A',
          welcome_bubble_color: '#131313',
          avatar_border_color: '#D0BCFF'
        };
        applyThemeSettings(defaultSettings);
        return;
      }

      const response = await ProfileService.getSettings();
      if (response && response.success && response.settings) {
        applyThemeSettings(response.settings);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
      
      applyThemeSettings({
        background_color: '#131313',
        container_color: '#1A1A1A',
        header_color: '#1A1A1A',
        bottom_nav_color: '#1A1A1A',
        content_color: '#1A1A1A',
        welcome_bubble_color: '#131313',
        avatar_border_color: '#D0BCFF'
      });
    }
  };

  
  const applyThemeSettings = (settings) => {
    
    const backgroundColor = settings.background_color || '#131313';
    const containerColor = settings.container_color || '#1A1A1A';
    const headerColor = settings.header_color || settings.container_color || '#1A1A1A';
    const bottomNavColor = settings.bottom_nav_color || settings.container_color || '#1A1A1A';
    const contentColor = settings.content_color || settings.container_color || '#1A1A1A';
    const welcomeBubbleColor = settings.welcome_bubble_color || '#131313';
    const primaryColor = settings.avatar_border_color || '#D0BCFF';

    
    const backgroundTextColor = getContrastTextColor(backgroundColor);
    const containerTextColor = getContrastTextColor(containerColor);
    const headerTextColor = getContrastTextColor(headerColor);
    const contentTextColor = getContrastTextColor(contentColor);
    const bottomNavTextColor = getContrastTextColor(bottomNavColor);

    
    updateThemeSettings({
      backgroundColor: backgroundColor,
      paperColor: containerColor,
      headerColor: headerColor,
      bottomNavColor: bottomNavColor,
      contentColor: contentColor,
      primaryColor: primaryColor,
      textColor: containerTextColor,
      headerTextColor: headerTextColor,
      contentTextColor: contentTextColor,
      bottomNavTextColor: bottomNavTextColor,
      backgroundTextColor: backgroundTextColor
    });
    
    
    document.documentElement.style.setProperty('--background-color', backgroundColor);
    document.documentElement.style.setProperty('--container-color', containerColor);
    document.documentElement.style.setProperty('--header-color', headerColor);
    document.documentElement.style.setProperty('--bottom-nav-color', bottomNavColor);
    document.documentElement.style.setProperty('--content-color', contentColor);
    document.documentElement.style.setProperty('--welcome-bubble-color', welcomeBubbleColor);
    document.documentElement.style.setProperty('--avatar-border-color', primaryColor);
    
    
    document.documentElement.style.setProperty('--background-text-color', backgroundTextColor);
    document.documentElement.style.setProperty('--container-text-color', containerTextColor);
    document.documentElement.style.setProperty('--header-text-color', headerTextColor);
    document.documentElement.style.setProperty('--content-text-color', contentTextColor);
    document.documentElement.style.setProperty('--bottom-nav-text-color', bottomNavTextColor);
    
    
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--primary-light', primaryColor);
    document.documentElement.style.setProperty('--primary-dark', primaryColor);
    
    console.log('Theme settings applied:', {
      backgroundColor, 
      containerColor, 
      headerColor, 
      bottomNavColor, 
      contentColor,
      backgroundTextColor, 
      containerTextColor,
      headerTextColor,
      contentTextColor,
      bottomNavTextColor
    });
  };
  
  
  const authContextValue = useContext(AuthContext) || {};
  
  
  useEffect(() => {
    if (authContextValue.isAuthenticated) {
      
      loadThemeSettings();
    } else if (!authContextValue.loading) {
      
      loadThemeSettings(true);
    }
  }, [authContextValue.isAuthenticated, authContextValue.loading]);
  
  
  const updateThemeSettings = (newSettings) => {
    setThemeSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      
      if (newSettings.mode) {
        saveThemeSettings('theme', newSettings.mode);
        saveThemeSettings('themeMode', newSettings.mode);
      }
      if (newSettings.backgroundColor) saveThemeSettings('backgroundColor', newSettings.backgroundColor);
      if (newSettings.paperColor) saveThemeSettings('paperColor', newSettings.paperColor);
      if (newSettings.headerColor) saveThemeSettings('headerColor', newSettings.headerColor);
      if (newSettings.bottomNavColor) saveThemeSettings('bottomNavColor', newSettings.bottomNavColor);
      if (newSettings.contentColor) saveThemeSettings('contentColor', newSettings.contentColor);
      if (newSettings.primaryColor) saveThemeSettings('primaryColor', newSettings.primaryColor);
      if (newSettings.textColor) saveThemeSettings('textColor', newSettings.textColor);
      
      return updated;
    });
  };

  
  const [colorOverride, setColorOverride] = useState(null);

  const theme = useMemo(() => {
    const themeObj = createTheme({
      palette: {
        mode: themeSettings.mode === 'dark' ? 'dark' : 'light',
        primary: {
          main: themeSettings.primaryColor || '#D0BCFF',
          light: themeSettings.primaryColor || '#E9DDFF',
          dark: themeSettings.primaryColor || '#B69DF8',
        },
        secondary: {
          main: themeSettings.secondaryColor || '#f28c9a',
        },
        background: {
          default: themeSettings.backgroundColor || '#131313',
          paper: themeSettings.paperColor || '#1A1A1A',
        },
        text: {
          primary: themeSettings.textColor || 
                  (themeSettings.mode === 'dark' ? '#FFFFFF' : '#121212'),
          secondary: themeSettings.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
        header: {
          main: themeSettings.headerColor || themeSettings.paperColor || '#1A1A1A',
          contrastText: themeSettings.headerTextColor || 
                        (themeSettings.mode === 'dark' ? '#FFFFFF' : '#121212'),
        },
        bottomNav: {
          main: themeSettings.bottomNavColor || themeSettings.paperColor || '#1A1A1A',
          contrastText: themeSettings.bottomNavTextColor || 
                        (themeSettings.mode === 'dark' ? '#FFFFFF' : '#121212'),
        },
        content: {
          main: themeSettings.contentColor || themeSettings.paperColor || '#1A1A1A',
          contrastText: themeSettings.contentTextColor || 
                        (themeSettings.mode === 'dark' ? '#FFFFFF' : '#121212'),
        },
      },
      typography: {
        fontFamily: '"SF Pro Display", "Roboto", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 700 },
        h3: { fontSize: '1.8rem', fontWeight: 600 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.2rem', fontWeight: 500 },
        h6: { fontSize: '1rem', fontWeight: 500 },
      },
      shape: {
        borderRadius: 12, 
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: '12px', 
              textTransform: 'none',
              fontWeight: 500,
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              lineHeight: 1,
              backgroundColor: themeSettings.backgroundColor || '#131313',
              color: themeSettings.mode === 'contrast' 
                ? '#FFFFFF' 
                : (themeSettings.textColor || (themeSettings.mode === 'light' ? '#121212' : '#FFFFFF')),
              '& *': themeSettings.mode === 'contrast' 
                ? { color: 'inherit' }
                : {},
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '15px', 
              overflow: 'hidden',
              backgroundColor: themeSettings.contentColor || themeSettings.paperColor || '#1A1A1A',
              color: themeSettings.mode === 'dark' || themeSettings.mode === 'contrast' 
                ? '#FFFFFF' 
                : themeSettings.contentTextColor || getContrastTextColor(themeSettings.contentColor || '#1A1A1A'),
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: '12px', 
              backgroundColor: themeSettings.paperColor || '#1A1A1A',
              color: themeSettings.mode === 'dark' || themeSettings.mode === 'contrast' 
                ? '#FFFFFF' 
                : themeSettings.contentTextColor || getContrastTextColor(themeSettings.paperColor || '#1A1A1A'),
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: themeSettings.headerColor || themeSettings.paperColor || '#1A1A1A',
              color: themeSettings.headerTextColor || getContrastTextColor(themeSettings.headerColor || '#1A1A1A'),
            },
          },
        },
        MuiBottomNavigation: {
          styleOverrides: {
            root: {
              backgroundColor: themeSettings.bottomNavColor || themeSettings.paperColor || '#1A1A1A',
            },
          },
        },
        MuiBottomNavigationAction: {
          styleOverrides: {
            root: {
              color: themeSettings.mode === 'dark' || themeSettings.mode === 'contrast' 
                ? '#FFFFFF' 
                : themeSettings.bottomNavTextColor || getContrastTextColor(themeSettings.bottomNavColor || '#1A1A1A'),
              '&.Mui-selected': {
                color: themeSettings.primaryColor || '#D0BCFF',
              },
            },
            label: {
              color: 'inherit',
              '&.Mui-selected': {
                color: 'inherit',
              },
            },
            iconOnly: {
              color: 'inherit',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', 
                '& fieldset': {
                  borderColor: themeSettings.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: themeSettings.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: themeSettings.primaryColor || '#D0BCFF', 
                },
              },
              '& .MuiInputLabel-root': {
                color: themeSettings.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: themeSettings.primaryColor || '#D0BCFF', 
                },
              },
            },
          },
        },
      },
    });
    if (colorOverride) {
      return applyColorOverrideToTheme(themeObj, colorOverride);
    }
    return themeObj;
  }, [themeSettings, colorOverride]);

  
  const [profileBackground, setProfileBackgroundState] = useState(null);
  const setProfileBackground = (url) => setProfileBackgroundState(url);
  const clearProfileBackground = () => setProfileBackgroundState(null);

  useEffect(() => {
    if (profileBackground) {
      document.body.style.backgroundImage = `url(${profileBackground})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'auto';
      document.body.classList.add('profile-background-active');
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.classList.remove('profile-background-active');
    }
  }, [profileBackground]);

  const [globalProfileBackgroundEnabled, setGlobalProfileBackgroundEnabled] = useState(false);

  useEffect(() => {
    // Проверка и применение фона при старте и при изменении переключателя
    const applyProfileBackground = (enabled) => {
      if (enabled) {
        let myBg = localStorage.getItem('myProfileBackgroundUrl');
        if (!myBg) {
          const match = document.cookie.match(/(?:^|; )myProfileBackgroundUrl=([^;]*)/);
          if (match) myBg = decodeURIComponent(match[1]);
        }
        if (myBg) setProfileBackground(myBg);
        else clearProfileBackground();
      } else {
        clearProfileBackground();
      }
    };

    // При старте — запрос к API и применение
    axios.get('/api/user/settings/global-profile-bg').then(res => {
      if (res.data && res.data.success) {
        setGlobalProfileBackgroundEnabled(res.data.enabled);
        applyProfileBackground(res.data.enabled);
      }
    });
  }, []);

  useEffect(() => {
    // Следить за изменением переключателя и применять фон
    if (globalProfileBackgroundEnabled) {
      let myBg = localStorage.getItem('myProfileBackgroundUrl');
      if (!myBg) {
        const match = document.cookie.match(/(?:^|; )myProfileBackgroundUrl=([^;]*)/);
        if (match) myBg = decodeURIComponent(match[1]);
      }
      if (myBg) setProfileBackground(myBg);
      else clearProfileBackground();
    } else {
      clearProfileBackground();
    }
  }, [globalProfileBackgroundEnabled]);

  const themeContextValue = useMemo(() => ({
    themeSettings,
    updateThemeSettings,
    loadThemeSettings,
    setProfileBackground,
    clearProfileBackground,
    profileBackground,
    globalProfileBackgroundEnabled,
    setGlobalProfileBackgroundEnabled,
    colorOverride,
    setColorOverride,
  }), [themeSettings, profileBackground, globalProfileBackgroundEnabled, colorOverride]);

  
  const location = useLocation();
  const currentPath = location.pathname;
  
  
  if (onShareSubdomain) {
    return null;
  }
  
  
  if (onAboutSubdomain) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            bgcolor: 'background.default'
          }}>
            <Suspense fallback={<LoadingIndicator />}>
              <SEO 
                title="О K-Connect" 
                description="Информация о платформе K-Connect - современной социальной сети с функциями для общения, публикации постов, музыки и многого другого."
                image="/icon-512.png"
                type="website"
              />
              <AboutPage />
            </Suspense>
          </Box>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  
  useEffect(() => {
    
    localStorage.setItem('themeMode', themeSettings.mode);
  }, [themeSettings.mode]);

  
  useEffect(() => {
    const savedThemeMode = localStorage.getItem('themeMode');
    
    if (savedThemeMode && savedThemeMode !== themeSettings.mode) {
      console.log('Theme mode mismatch, restoring from localStorage');
      updateThemeSettings({ mode: savedThemeMode });
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key && (
          event.key === 'theme' ||
          event.key === 'themeMode' ||
          event.key === 'backgroundColor' ||
          event.key === 'paperColor' ||
          event.key === 'headerColor' ||
          event.key === 'bottomNavColor' ||
          event.key === 'contentColor' ||
          event.key === 'primaryColor' ||
          event.key === 'textColor'
        )) {
        console.log(`Storage change detected for ${event.key}:`, event.newValue);
        
        const settingUpdate = {};
        
        if (event.key === 'theme' || event.key === 'themeMode') {
          settingUpdate.mode = event.newValue;
        } else {
          const stateKey = event.key.charAt(0).toLowerCase() + event.key.slice(1);
          settingUpdate[stateKey] = event.newValue;
        }
        
        setThemeSettings(prev => ({
          ...prev,
          ...settingUpdate
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handlePageFocus = () => {
      const sessionTheme = sessionStorage.getItem('themeMode');
      
      if (!sessionTheme && localStorage.getItem('themeMode')) {
        const modeFromLocal = localStorage.getItem('themeMode');
        sessionStorage.setItem('themeMode', modeFromLocal);
        sessionStorage.setItem('theme', modeFromLocal);
        
        ['backgroundColor', 'paperColor', 'headerColor', 'bottomNavColor', 
         'contentColor', 'primaryColor', 'textColor'].forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            sessionStorage.setItem(key, value);
          }
        });
        
        updateThemeSettings({ mode: modeFromLocal });
      }
    };
    
    window.addEventListener('focus', handlePageFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handlePageFocus);
    };
  }, []);

  useEffect(() => {
    const applyThemeToDocument = () => {
      const mode = sessionStorage.getItem('themeMode') || localStorage.getItem('themeMode') || getCookie('themeMode') || 'dark';
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.classList.add(`theme-${mode}`);
      
      
      document.querySelector('html').setAttribute('data-theme', mode);
      
      
      let metaTheme = document.querySelector('meta[name="theme-color"]');
      if (!metaTheme) {
        metaTheme = document.createElement('meta');
        metaTheme.setAttribute('name', 'theme-color');
        document.head.appendChild(metaTheme);
      }
      
      
      if (mode === 'light') {
        metaTheme.setAttribute('content', '#ffffff');
      } else if (mode === 'contrast') {
        metaTheme.setAttribute('content', '#080808');
      } else {
        metaTheme.setAttribute('content', '#131313');
      }
      
      const themeVars = {
        backgroundColor: sessionStorage.getItem('backgroundColor') || localStorage.getItem('backgroundColor') || getCookie('backgroundColor'),
        paperColor: sessionStorage.getItem('paperColor') || localStorage.getItem('paperColor') || getCookie('paperColor'),
        headerColor: sessionStorage.getItem('headerColor') || localStorage.getItem('headerColor') || getCookie('headerColor'),
        bottomNavColor: sessionStorage.getItem('bottomNavColor') || localStorage.getItem('bottomNavColor') || getCookie('bottomNavColor'),
        contentColor: sessionStorage.getItem('contentColor') || localStorage.getItem('contentColor') || getCookie('contentColor'),
        primaryColor: sessionStorage.getItem('primaryColor') || localStorage.getItem('primaryColor') || getCookie('primaryColor'),
        textColor: sessionStorage.getItem('textColor') || localStorage.getItem('textColor') || getCookie('textColor')
      };
      
      Object.entries(themeVars).forEach(([key, value]) => {
        if (value) {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          document.documentElement.style.setProperty(`--${cssKey}`, value);
        }
      });
      
      
      try {
        const themeData = JSON.parse(localStorage.getItem('themeData') || sessionStorage.getItem('themeData') || '{}');
        Object.entries(themeData).forEach(([key, value]) => {
          if (value && key !== 'mode' && key !== 'theme' && key !== 'themeMode') {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            document.documentElement.style.setProperty(`--${cssKey}`, value);
          }
        });
      } catch (e) {
        console.warn('Error applying theme data from JSON backup:', e);
      }
    };
    
    applyThemeToDocument();
    
    if (document.readyState === 'complete') {
      applyThemeToDocument();
    } else {
      window.addEventListener('load', applyThemeToDocument);
      return () => window.removeEventListener('load', applyThemeToDocument);
    }
  }, []);

  function applyColorOverrideToTheme(theme, colorOverride) {
    function replaceColors(obj) {
      if (typeof obj === 'string') {
        if (
          obj.toLowerCase() === '#d0bcff' ||
          obj.replace(/\s/g, '').toLowerCase() === 'rgb(208,188,255)'
        ) {
          return colorOverride;
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(replaceColors);
      }
      if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = replaceColors(obj[key]);
        }
        return newObj;
      }
      return obj;
    }
    // Клонируем тему и заменяем цвета в palette и components
    const patchedTheme = { ...theme };
    if (patchedTheme.palette) patchedTheme.palette = replaceColors(patchedTheme.palette);
    if (patchedTheme.components) patchedTheme.components = replaceColors(patchedTheme.components);
    return patchedTheme;
  }

  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeSettingsContext.Provider value={themeContextValue}>
          <ThemeProvider theme={theme}>
            <DefaultPropsProvider>
              <CssBaseline />
              {themeSettings.mode === 'contrast' && (
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .MuiListItemText-primary, 
                    .MuiListItemText-secondary,
                    .MuiTypography-root,
                    .MuiInputBase-input,
                    .MuiInputLabel-root,
                    .MuiFormHelperText-root,
                    .MuiMenuItem-root,
                    .MuiButton-root,
                    .MuiLink-root:not(a),
                    .MuiChip-label,
                    .MuiTab-root,
                    .MuiTableCell-root,
                    [class*="css-"],
                    /* Additional text selectors */
                    span:not(.MuiIcon-root):not(.material-icons),
                    p,
                    h1, h2, h3, h4, h5, h6,
                    label,
                    div:not(.MuiAvatar-root):not(.MuiSwitch-thumb):not(.MuiSwitch-track):not([role="progressbar"]) {
                      color: #FFFFFF !important;
                    }
                    
                    .MuiChip-root.status-online *,
                    .MuiChip-root[color="success"] *,
                    .MuiChip-root[color="error"] *,
                    .MuiChip-root[color="warning"] *,
                    .MuiChip-root[color="info"] *,
                    a.MuiLink-root,
                    .MuiButton-containedPrimary,
                    .Mui-selected,
                    .MuiSwitch-thumb,
                    .MuiSwitch-track,
                    .MuiIcon-root,
                    .material-icons,
                    svg,
                    .MuiAvatar-root *,
                    img,
                    [role="progressbar"] * {
                      color: inherit !important;
                    }
                  `
                }}/>
              )}
              <SessionProvider>
                <LanguageProvider>
                  <MusicProvider>
                    <PostDetailProvider>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          minHeight: '100vh',
                          bgcolor: 'background.default'
                        }}>
                        <ErrorBoundary FallbackComponent={ErrorFallback}>
                          <Suspense fallback={<LoadingIndicator />}>
                            <DefaultSEO />
                            <Routes>
                              <Route path="/rules" element={<PublicPages />} />
                              <Route path="/privacy-policy" element={<PublicPages />} />
                              <Route path="/terms-of-service" element={<PublicPages />} />
                              <Route path="/about" element={<PublicPages />} />
                              <Route path="/cookies" element={<PublicPages />} />
                              <Route path="*" element={<AppRoutes />} />
                            </Routes>
                            <MusicPlayerCore />
                          </Suspense>
                      </ErrorBoundary>
                      </Box>
                    </PostDetailProvider>
                  </MusicProvider>
                </LanguageProvider>
              </SessionProvider>
            </DefaultPropsProvider>
            {/* <CookieBanner /> */}
          </ThemeProvider>
        </ThemeSettingsContext.Provider>
      </AuthProvider>
      {isAppLoading && (
        <AppLoadingScreen 
          onLoadingComplete={() => setIsAppLoading(false)} 
        />
      )}
    </HelmetProvider>
  );
}

export default App;

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession Используйте SessionProvider для доступа к сессии');
  }
  return context;
};

const setCookie = (name, value, days = 365) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (error) {
    console.error(`Ошибка при установке cookie ${name}:`, error);
  }
};

const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  } catch (error) {
    console.error(`Ошибка при получении cookie ${name}:`, error);
  }
  return null;
};

const saveThemeSettings = (key, value) => {
  try {
    localStorage.setItem(key, value);
    
    sessionStorage.setItem(key, value);
    
    setCookie(key, value, 365);
    
    if (key === 'themeMode' || key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    } else {
      const cssVarKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      document.documentElement.style.setProperty(`--${cssVarKey}`, value);
    }
    
    try {
      const currentThemeData = JSON.parse(localStorage.getItem('themeData') || '{}');
      currentThemeData[key] = value;
      localStorage.setItem('themeData', JSON.stringify(currentThemeData));
      sessionStorage.setItem('themeData', JSON.stringify(currentThemeData));
    } catch (e) {
      console.error('Error saving theme data JSON:', e);
    }
  } catch (error) {
    console.error(`Error saving theme setting ${key}:`, error);
  }
};

// Компонент для редиректа с /item/:itemId
function ItemRedirectPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!itemId) return;
    axios.get(`/api/inventory/item/${itemId}`)
      .then(res => {
        if (res.data && res.data.success && res.data.item && res.data.item.user && res.data.item.user.username) {
          navigate(`/profile/${res.data.item.user.username}?item=${itemId}`, { replace: true });
        } else {
          setError('Владелец предмета не найден');
        }
      })
      .catch(() => setError('Ошибка при получении информации о предмете'));
  }, [itemId, navigate]);

  if (error) {
    return <div style={{textAlign:'center',marginTop:40}}><h2>Ошибка</h2><p>{error}</p></div>;
  }
  return <div style={{textAlign:'center',marginTop:40}}><h2>Загрузка...</h2></div>;
}
