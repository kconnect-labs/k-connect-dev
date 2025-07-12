import React, { useState, useEffect, useMemo, useContext, lazy, Suspense, useTransition, useRef, useCallback } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { Box, CircularProgress, Typography, Button, Alert, GlobalStyles } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { useBlurOptimization } from './hooks/useBlurOptimization';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import { optimizeScrollPerformance, optimizeAnimations, optimizeMemoryUsage } from './utils/renderOptimization';

import SEO from './components/SEO';
import { PostDetailProvider } from './context/PostDetailContext';

import { ErrorBoundary } from 'react-error-boundary';
import MusicPlayerCore from './components/MusicPlayerCore';
import { setSessionContext } from './services/ProfileService';
import { LanguageProvider } from './context/LanguageContext';
import { DefaultPropsProvider } from './context/DefaultPropsContext';
import { MessengerProvider } from './contexts/MessengerContext';

import axios from 'axios';
import { CommandPaletteProvider } from './context/CommandPalleteContext.js';
import { CommandPalleteModal } from './components/Layout/CommandPalette/CommandPalleteModal.js';


import { LoadingIndicator } from './components/Loading/LoadingComponents';
import { ErrorFallback } from './components/Error/ErrorComponents';
import { DefaultSEO } from './components/SEO/SEOComponents';
export const SessionContext = React.createContext({
  sessionActive: true,
  sessionExpired: false,
  lastFetchTime: null,
  broadcastUpdate: () => {},
  checkSessionStatus: () => true,
  refreshSession: () => {}
});

export const RequireAuth = ({ children }) => {
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


// Import route components
import AuthRoutes from './routes/AuthRoutes';
import MainRoutes from './routes/MainRoutes';
import PublicRoutes from './routes/PublicRoutes';
import SpecialRoutes from './routes/SpecialRoutes';

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
        const message = {
          type,
          data,
          timestamp: Date.now()
        };
        broadcastChannel.current.postMessage(message);
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
  
  // Глобальный хук оптимизации блюра
  const blurOptimization = useBlurOptimization();
  
  // Хук оптимизации производительности
  const performanceOptimization = usePerformanceOptimization();
  
  const [themeSettings, setThemeSettings] = useState(() => {
    const savedThemeMode = localStorage.getItem('theme') || localStorage.getItem('themeMode') || 'default';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || '#D0BCFF';
    
    // Настройки для темной темы
    const getThemeColors = (mode) => {
          return {
        backgroundColor: '#131313',
            textColor: '#FFFFFF'
          };
    };
    
    const colors = getThemeColors(savedThemeMode);
    
    return {
      mode: savedThemeMode,
      backgroundColor: colors.backgroundColor,
      textColor: colors.textColor,
      primaryColor: savedPrimaryColor
    };
  });
  
  
  

  const updateThemeSettings = (newSettings) => {
    setThemeSettings(prev => {
      // Проверяем, действительно ли изменились настройки
      const hasChanges = Object.keys(newSettings).some(key => 
        prev[key] !== newSettings[key]
      );
      
      if (!hasChanges) {
        return prev; // Возвращаем предыдущее состояние без изменений
      }
      
      const updated = { ...prev, ...newSettings };
      
      // Сохраняем настройки
      if (newSettings.backgroundColor) {
        localStorage.setItem('backgroundColor', newSettings.backgroundColor);
      }
      if (newSettings.textColor) {
        localStorage.setItem('textColor', newSettings.textColor);
      }
      if (newSettings.primaryColor) {
        localStorage.setItem('primaryColor', newSettings.primaryColor);
      }
      
      return updated;
    });
  };
  
  
  const authContext = useContext(AuthContext);
  const { isAuthenticated, loading } = authContext || {};
  
  // Логируем только важные изменения состояния авторизации
  useEffect(() => {
    if (isAuthenticated && !loading) {

    }
  }, [isAuthenticated, loading]);
  const prevAuthState = useRef({ isAuthenticated: null, loading: null });
  
  useEffect(() => {
    const currentAuthState = {
      isAuthenticated: isAuthenticated,
      loading: false
    };
    
    // Проверяем, действительно ли изменилось состояние
    if (
      prevAuthState.current.isAuthenticated !== currentAuthState.isAuthenticated ||
      prevAuthState.current.loading !== currentAuthState.loading
    ) {
      // Обновляем предыдущее состояние
      prevAuthState.current = currentAuthState;
    }
  }, [isAuthenticated]);
  
  
  const theme = useMemo(() => {
    const themeObj = createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: themeSettings.primaryColor || '#D0BCFF',
        },
        secondary: {
          main: '#f28c9a',
        },
        background: {
          default: themeSettings.backgroundColor || '#131313',
          paper: themeSettings.backgroundColor || '#131313',
        },
        text: {
          primary: themeSettings.textColor || '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
        },
      },
      typography: {
        fontFamily: '"SF Pro Display", "Roboto", "Arial", sans-serif',
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
              backgroundColor: themeSettings.backgroundColor || '#131313',
              color: themeSettings.textColor || '#FFFFFF',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: '15px',
              overflow: 'hidden',
              backgroundColor: themeSettings.backgroundColor || '#131313',
              color: themeSettings.textColor || '#FFFFFF',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: '12px',
              backgroundColor: themeSettings.backgroundColor || '#131313',
              color: themeSettings.textColor || '#FFFFFF',
            },
          },
        },
      },
    });
    return themeObj;
  }, [themeSettings]);

  
  const [profileBackground, setProfileBackgroundState] = useState(null);
  const setProfileBackground = (url) => setProfileBackgroundState(url);
  const clearProfileBackground = () => setProfileBackgroundState(null);

  useEffect(() => {
    if (profileBackground) {
      document.body.classList.add('profile-background-active');
    } else {
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

    // Применение фона при старте (настройки загружаются в отдельном useEffect)
    applyProfileBackground(globalProfileBackgroundEnabled);
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
    setProfileBackground,
    clearProfileBackground,
    profileBackground,
    globalProfileBackgroundEnabled,
    setGlobalProfileBackgroundEnabled,
  }), [themeSettings, profileBackground, globalProfileBackgroundEnabled]);

  
  const location = useLocation();
  const currentPath = location.pathname;

  
  const isInitialized = useRef(false);
  
  useEffect(() => {
    localStorage.setItem('themeMode', themeSettings.mode);
  }, [themeSettings.mode]);

  
  useEffect(() => {
    if (isInitialized.current) return; // Предотвращаем повторное выполнение
    
    const savedThemeMode = localStorage.getItem('themeMode');
    
    if (savedThemeMode && savedThemeMode !== themeSettings.mode) {

      updateThemeSettings({ mode: savedThemeMode });
    }
    
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key && (
          event.key === 'backgroundColor' ||
          event.key === 'textColor' ||
          event.key === 'primaryColor'
        )) {

        
        // Проверяем, действительно ли изменилось значение
        const currentValue = themeSettings[event.key];
        
        if (currentValue === event.newValue) {
          return; // Значение не изменилось, пропускаем обновление
        }
        
        const settingUpdate = {};
          settingUpdate[event.key] = event.newValue;
        
        updateThemeSettings(settingUpdate);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [themeSettings]);

  // --- ДОБАВЛЯЕМ useEffect для загрузки темы пользователя ---
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const response = await fetch('/api/profile/settings');
        const data = await response.json();
        if (data && data.success && data.settings) {
          // Применяем настройки темы
          setThemeSettings(prev => ({
            ...prev,
            primaryColor: data.settings.primary_color || '#D0BCFF',
            mode: 'dark',
          }));
          localStorage.setItem('primaryColor', data.settings.primary_color || '#D0BCFF');
          localStorage.setItem('theme', 'dark');

        }
      } catch (e) {
        console.error('Ошибка загрузки настроек:', e);
        // fallback: дефолт
        setThemeSettings(prev => ({ ...prev, primaryColor: '#D0BCFF', mode: 'dark' }));
      }
      
      // Загружаем настройки глобального фона профиля
      try {
        const bgResponse = await axios.get('/api/user/settings/global-profile-bg');
        if (bgResponse.data && bgResponse.data.success) {
          setGlobalProfileBackgroundEnabled(bgResponse.data.enabled);
          // Применяем фон сразу после загрузки настроек
          if (bgResponse.data.enabled) {
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

        }
      } catch (error) {

      }
    };

    // Загружаем настройки при инициализации приложения
    loadUserSettings();
  }, []);

  // --- ДОБАВЛЯЕМ useEffect для автоматического применения оптимизации блюра ---
  useEffect(() => {
    // Применяем оптимизацию блюра при загрузке приложения
    if (blurOptimization.isEnabled && !blurOptimization.isLoading) {

      // Хук автоматически применит оптимизацию при изменении isEnabled
    }
  }, [blurOptimization.isEnabled, blurOptimization.isLoading]);

  // --- ДОБАВЛЯЕМ useEffect для применения оптимизаций производительности ---
  useEffect(() => {
    // Применяем оптимизации при загрузке приложения
    optimizeScrollPerformance();
    optimizeAnimations();
    
    // Очистка памяти на слабых устройствах
    const memoryInterval = optimizeMemoryUsage();
    
    return () => {
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
    };
  }, []);

  // --- ДОБАВЛЯЕМ useEffect для применения оптимизации при изменении маршрута ---
  useEffect(() => {
    // Применяем оптимизацию блюра при переходе между страницами
    if (blurOptimization.isEnabled && !blurOptimization.isLoading) {

      // Небольшая задержка для применения эффектов после рендера новой страницы
      const timer = setTimeout(() => {
        if (blurOptimization.isEnabled) {
          // Принудительно применяем оптимизацию
          blurOptimization.enableBlurOptimization();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, blurOptimization.isEnabled, blurOptimization.isLoading]);



  // Определяем тип роута
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/element-auth', '/auth_elem'].some(
    path => currentPath.startsWith(path)
  );
  const isPublicPage = ['/rules', '/privacy-policy', '/terms-of-service', '/about'].some(
    path => currentPath.startsWith(path)
  );
  const isSpecialPage = ['/street/blacklist'].some(
    path => currentPath.startsWith(path)
  );

  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeSettingsContext.Provider value={themeContextValue}>
          <ThemeProvider theme={theme}>
            <DefaultPropsProvider>
              <CssBaseline />
              <SessionProvider>
                <MessengerProvider>
                      <LanguageProvider>
                        <MusicProvider>
                          <PostDetailProvider>
                            <CommandPaletteProvider>
                                <ErrorBoundary FallbackComponent={ErrorFallback}>
                                  <Suspense fallback={<LoadingIndicator />}>
                                    <DefaultSEO />
                              {isAuthPage ? (
                                <AuthRoutes setUser={authContext?.setUser} />
                              ) : isPublicPage ? (
                                <PublicRoutes />
                              ) : isSpecialPage ? (
                                <SpecialRoutes />
                              ) : (
                                <MainRoutes setUser={authContext?.setUser} background={location.state?.background} />
                              )}
                                    <MusicPlayerCore />
                                    <CommandPalleteModal />
                                  </Suspense>
                                </ErrorBoundary>
                            </CommandPaletteProvider>
                          </PostDetailProvider>
                        </MusicProvider>
                      </LanguageProvider>
                </MessengerProvider>
              </SessionProvider>
            </DefaultPropsProvider>
          </ThemeProvider>
        </ThemeSettingsContext.Provider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;




