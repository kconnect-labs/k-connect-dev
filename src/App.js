import React, { useState, useEffect, useMemo, useContext, lazy, Suspense, useTransition, useRef, useCallback } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { Box, CircularProgress, Typography, Button, Alert, GlobalStyles } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import { useBlurOptimization } from './hooks/useBlurOptimization';

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
  
  // Сохраняем deeplink trackId в localStorage перед редиректом на логин
  if (location.pathname.startsWith('/music/track/')) {
    const trackId = location.pathname.split('/music/track/')[1];
    if (trackId) {
      console.log('Saving deeplink trackId before login redirect:', trackId);
      localStorage.setItem('deeplinkTrackId', trackId);
    }
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
  profileBackground: null,
  globalProfileBackgroundEnabled: false,
  setGlobalProfileBackgroundEnabled: (enabled) => {},
  setUserBackground: () => {},
  restoreUserBackground: () => {},
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
  
  // Система обоев сайта
  const [profileBackground, setProfileBackgroundState] = useState(null);
  const [globalProfileBackgroundEnabled, setGlobalProfileBackgroundEnabledState] = useState(false);
  const [userBackgroundUrl, setUserBackgroundUrl] = useState(null);
  
  const setProfileBackground = (url) => {
    setProfileBackgroundState(url);
  };
  const clearProfileBackground = () => {
    setProfileBackgroundState(null);
  };
  
  // Сохраняем обои пользователя в localStorage
  const saveUserBackground = (url) => {
    if (url) {
      localStorage.setItem('myProfileBackgroundUrl', url);
      // Также сохраняем в куки для совместимости
      document.cookie = `myProfileBackgroundUrl=${encodeURIComponent(url)};path=/;max-age=31536000`;

    } else {
      localStorage.removeItem('myProfileBackgroundUrl');
      document.cookie = 'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUserBackgroundUrl(url);
  };
  
  // Восстанавливаем обои пользователя из localStorage
  const restoreUserBackground = () => {
    // Сначала пробуем localStorage, потом куки
    let savedBg = localStorage.getItem('myProfileBackgroundUrl');
    
    if (!savedBg) {
      const match = document.cookie.match(/(?:^|; )myProfileBackgroundUrl=([^;]*)/);
      
      if (match) {
        savedBg = decodeURIComponent(match[1]);
        // Переносим из куки в localStorage
        localStorage.setItem('myProfileBackgroundUrl', savedBg);
      }
    }
    
    if (savedBg) {
      // Если есть сохраненные обои, применяем их
      setProfileBackground(savedBg);
    } else {
      // Если нет сохраненных обоев, очищаем текущие
      clearProfileBackground();
    }
  };
  
  // Устанавливаем обои другого пользователя
  const setUserBackground = (url) => {
    if (url) {
      setProfileBackground(url);
    } else {
      restoreUserBackground();
    }
  };
  
  const setGlobalProfileBackgroundEnabled = (enabled) => {
    if (globalProfileBackgroundEnabled !== enabled) {
      setGlobalProfileBackgroundEnabledState(enabled);
      
      if (enabled) {
        // Если включаем глобальные обои, применяем сохраненные обои пользователя
        const savedBg = localStorage.getItem('myProfileBackgroundUrl');
        if (savedBg) {
          setProfileBackground(savedBg);
        }
      } else {
        // Если выключаем, убираем обои и очищаем localStorage
        clearProfileBackground();
        localStorage.removeItem('myProfileBackgroundUrl');
        document.cookie = 'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  };
  
  
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
  const { isAuthenticated, loading, currentUser } = authContext || {};
  
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
      console.log('🎨 ATTENTION: Начинаем загрузку настроек пользователя');
      
      try {
        const response = await fetch('/api/profile/settings');
        const data = await response.json();
        console.log('🎨 ATTENTION: Ответ API настроек:', data);
        
        if (data && data.success && data.settings) {
          // Применяем настройки темы
          setThemeSettings(prev => ({
            ...prev,
            primaryColor: data.settings.primary_color || '#D0BCFF',
            mode: 'dark',
          }));
          localStorage.setItem('primaryColor', data.settings.primary_color || '#D0BCFF');
          localStorage.setItem('theme', 'dark');
          console.log('🎨 ATTENTION: Применены настройки темы пользователя');

        }
      } catch (e) {
        console.error('🎨 ATTENTION: Ошибка загрузки настроек:', e);
        // fallback: дефолт
        setThemeSettings(prev => ({ ...prev, primaryColor: '#D0BCFF', mode: 'dark' }));
      }
      

      
      // Загружаем настройки глобального фона профиля
      try {
        const bgResponse = await axios.get('/api/user/settings/global-profile-bg');
        
        if (bgResponse.data && bgResponse.data.success) {
          setGlobalProfileBackgroundEnabled(bgResponse.data.enabled);
          
          // Если есть background URL в ответе
          if (bgResponse.data.background_url) {
            if (bgResponse.data.enabled) {
              // Если глобальные обои включены, сохраняем и применяем их
              saveUserBackground(bgResponse.data.background_url);
              setProfileBackground(bgResponse.data.background_url);
            } else {
              // Если глобальные обои выключены, удаляем из localStorage если там есть
              const savedBg = localStorage.getItem('myProfileBackgroundUrl');
              if (savedBg) {
                localStorage.removeItem('myProfileBackgroundUrl');
                document.cookie = 'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
              }
              clearProfileBackground();
            }
          }
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    };

    // Загружаем настройки при инициализации приложения
    loadUserSettings();
  }, []);

  // --- ДОБАВЛЯЕМ useEffect для загрузки обоев пользователя ---
  useEffect(() => {
    const loadUserBackground = async () => {
      // Проверяем, что пользователь авторизован
      // Также проверяем наличие токена в localStorage как fallback
      const hasToken = localStorage.getItem('token') || document.cookie.includes('sessionid');
      
      // Если пользователь не авторизован в AuthContext, но есть токен, пробуем получить данные
      if (!isAuthenticated || !currentUser) {
        if (hasToken) {
          try {
            const response = await axios.get('/api/auth/me');
            if (response.data && response.data.user) {
              // Используем данные из API для загрузки обоев
              await loadUserBackgroundFromUsername(response.data.user.username);
            }
          } catch (error) {
            // Игнорируем ошибки
          }
        }
        return;
      }

      // Если пользователь авторизован в AuthContext, используем его данные
      if (currentUser && currentUser.username) {
        await loadUserBackgroundFromUsername(currentUser.username);
      }
    };

    const loadUserBackgroundFromUsername = async (username) => {
      try {
        // Получаем данные профиля текущего пользователя
        const response = await axios.get(`/api/profile/${username}`);
        
        if (response.data && response.data.user && response.data.user.profile_background_url) {
          const userBg = response.data.user.profile_background_url;
          
          // Сохраняем обои только если их еще нет в localStorage
          const savedBg = localStorage.getItem('myProfileBackgroundUrl');
          if (!savedBg) {
            saveUserBackground(userBg);
          }
          
          // Если глобальные обои включены и обои еще не применены, применяем их
          if (globalProfileBackgroundEnabled && !profileBackground) {
            setProfileBackground(userBg);
          }
        }
      } catch (error) {
        // Игнорируем ошибки
      }
    };

    // Загружаем обои пользователя при инициализации
    loadUserBackground();
  }, [globalProfileBackgroundEnabled, isAuthenticated, loading, currentUser]);

  // --- ДОБАВЛЯЕМ useEffect для применения обоев при изменении глобальной настройки ---
  useEffect(() => {
    if (globalProfileBackgroundEnabled) {
      const savedBg = localStorage.getItem('myProfileBackgroundUrl');
      if (savedBg) {
        setProfileBackground(savedBg);
      }
    } else {
      clearProfileBackground();
    }
  }, [globalProfileBackgroundEnabled]);

  // --- ДОБАВЛЯЕМ useEffect для автоматического применения оптимизации блюра ---
  useEffect(() => {
    // Применяем оптимизацию блюра при загрузке приложения
    if (blurOptimization.isEnabled && !blurOptimization.isLoading) {

      // Хук автоматически применит оптимизацию при изменении isEnabled
    }
  }, [blurOptimization.isEnabled, blurOptimization.isLoading]);



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

  // --- ДОБАВЛЯЕМ useEffect для восстановления обоев при переходе на другие страницы ---
  useEffect(() => {
    // Проверяем, находимся ли мы на странице профиля
    const isProfilePage = location.pathname.match(/^\/profile\/([^\/]+)$/);
    
    if (!isProfilePage) {
      // Если мы не на странице профиля, восстанавливаем свои обои
      restoreUserBackground();
    }
  }, [location.pathname]);

  // --- ДОБАВЛЯЕМ useEffect для восстановления обоев при выходе ---
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      // При выходе из аккаунта очищаем обои
      clearProfileBackground();
      setUserBackgroundUrl(null);
    }
  }, [isAuthenticated, loading]);


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

  const themeContextValue = useMemo(() => {
    return {
      themeSettings,
      updateThemeSettings,
      globalProfileBackgroundEnabled,
      setGlobalProfileBackgroundEnabled,
      profileBackground,
      setProfileBackground,
      clearProfileBackground,
      setUserBackground,
      restoreUserBackground,
    };
  }, [themeSettings, globalProfileBackgroundEnabled, profileBackground]);

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
