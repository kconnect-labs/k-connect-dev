import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  Suspense,
  useTransition,
  useRef,
} from 'react';
import {
  Navigate,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, AuthContext } from './context/AuthContext.js';
import { MusicProvider } from './context/MusicContext';

import { HelmetProvider } from 'react-helmet-async';

import { PostDetailProvider } from './context/PostDetailContext';

import { ErrorBoundary } from 'react-error-boundary';
import MusicPlayerCore from './components/MusicPlayerCore';
import './styles/theme.css';
import { LanguageProvider } from './context/LanguageContext';
import { MessengerProvider } from './contexts/MessengerContext';
import { SessionProvider } from './context/SessionContext';
import { useThemeManager } from './hooks/useThemeManager';
const preloadBackgroundGradients = async () => {
  try {
    const response = await fetch('/background_gradients.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    (window as any).__backgroundGradientsCache = data;
    console.log('Background gradients preloaded successfully');
  } catch (err) {
    console.error('Ошибка предварительной загрузки градиентов:', err);
  }
};


const preloadSvgAssets = async () => {
  try {
    
    const svgAssetsModule = await import('./utils/svgAssets');
    
    (window as any).__svgAssetsCache = svgAssetsModule.svgAssets;
    console.log('SVG assets preloaded successfully');
  } catch (err) {
    console.error('Ошибка предварительной загрузки SVG данных:', err);
  }
};

import axios from 'axios';


import { LoadingIndicator } from './components/Loading/LoadingComponents';
import { ErrorFallback } from './components/Error/ErrorComponents';
import { DefaultSEO } from './components/SEO/SEOComponents';


interface ThemeSettings {
  mode: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
}


interface ThemeSettingsContextType {
  themeSettings: ThemeSettings;
  updateThemeSettings: (newSettings: Partial<ThemeSettings>) => void;
  setProfileBackground: (url: string | null) => void;
  clearProfileBackground: () => void;
  profileBackground: string | null;
  globalProfileBackgroundEnabled: boolean;
  setGlobalProfileBackgroundEnabled: (enabled: boolean) => void;
  setUserBackground: (url: string | null) => void;
  restoreUserBackground: () => void;
}


interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  
      if (location.pathname.startsWith('/music/')) {
      const trackId = location.pathname.split('/music/')[1];
    if (trackId) {
      console.log('Saving deeplink trackId before login redirect:', trackId);
      localStorage.setItem('deeplinkTrackId', trackId);
    }
  }

  return <Navigate to='/login' state={{ from: location.pathname }} replace />;
};


import AuthRoutes from './routes/AuthRoutes';
import MainRoutes from './routes/MainRoutes';
import PublicRoutes from './routes/PublicRoutes';

export const ThemeSettingsContext =
  React.createContext<ThemeSettingsContextType>({
    themeSettings: {
      mode: 'dark',
      primaryColor: '#D0BCFF',
      backgroundColor: 'none',
      textColor: '#FFFFFF',
    },
    updateThemeSettings: () => {},
    setProfileBackground: () => {},
    clearProfileBackground: () => {},
    profileBackground: null,
    globalProfileBackgroundEnabled: false,
    setGlobalProfileBackgroundEnabled: enabled => {},
    setUserBackground: () => {},
    restoreUserBackground: () => {},
  });


interface AppProvidersProps {
  children: React.ReactNode;
  themeContextValue: ThemeSettingsContextType;
  theme: any;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children, themeContextValue, theme }) => (
  <HelmetProvider>
    <AuthProvider>
      <ThemeSettingsContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SessionProvider>
            <MessengerProvider>
              <LanguageProvider>
                <MusicProvider>
                  <PostDetailProvider>
                    {children}
                  </PostDetailProvider>
                </MusicProvider>
              </LanguageProvider>
            </MessengerProvider>
          </SessionProvider>
        </ThemeProvider>
      </ThemeSettingsContext.Provider>
    </AuthProvider>
  </HelmetProvider>
);

function App() {
  // Убрали неиспользуемые useTransition и isAppLoading

  const { isInitialized: isThemeInitialized, currentTheme } = useThemeManager();

  const authContext = useContext(AuthContext);
  const { isAuthenticated = false, loading = false, user: currentUser } = authContext || {};

  useEffect(() => {
    // Запускаем предзагрузку в фоне после рендера
    const schedulePreload = () => {
      Promise.all([
        preloadBackgroundGradients(),
        preloadSvgAssets()
      ]).catch(console.warn);
    };
    
    // Используем requestIdleCallback если доступен, иначе setTimeout
    if ((window as any).requestIdleCallback) {
      (window as any).requestIdleCallback(schedulePreload);
    } else {
      setTimeout(schedulePreload, 100);
    }
  }, []);

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => ({
    mode: currentTheme || 'default',
    backgroundColor: 'var(--theme-background-full)',
    textColor: '#FFFFFF',
    primaryColor: localStorage.getItem('primaryColor') || '#D0BCFF',
  }));

  // Синхронизируем themeSettings с currentTheme из useThemeManager
  useEffect(() => {
    if (currentTheme && currentTheme !== themeSettings.mode) {
      setThemeSettings(prev => ({
        ...prev,
        mode: currentTheme
      }));
    }
  }, [currentTheme, themeSettings.mode]);

  
  const [profileBackground, setProfileBackgroundState] = useState<
    string | null
  >(null);
  const [
    globalProfileBackgroundEnabled,
    setGlobalProfileBackgroundEnabledState,
  ] = useState(false);
  const [userBackgroundUrl, setUserBackgroundUrl] = useState<string | null>(
    null
  );

  const setProfileBackground = (url: string | null) => {
    setProfileBackgroundState(url);
  };

  const clearProfileBackground = () => {
    setProfileBackgroundState(null);
  };

  
  const saveUserBackground = (url: string | null) => {
    if (url) {
      localStorage.setItem('myProfileBackgroundUrl', url);
      
      document.cookie = `myProfileBackgroundUrl=${encodeURIComponent(url)};path=/;max-age=31536000`;
    } else {
      localStorage.removeItem('myProfileBackgroundUrl');
      document.cookie =
        'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUserBackgroundUrl(url);
  };

  
  const restoreUserBackground = () => {
    
    let savedBg = localStorage.getItem('myProfileBackgroundUrl');

    if (!savedBg) {
      const match = document.cookie.match(
        /(?:^|; )myProfileBackgroundUrl=([^;]*)/
      );

      if (match) {
        savedBg = decodeURIComponent(match[1]);
        
        localStorage.setItem('myProfileBackgroundUrl', savedBg);
      }
    }

    if (savedBg) {
      
      setProfileBackground(savedBg);
    } else {
      
      clearProfileBackground();
    }
  };

  
  const setUserBackground = (url: string | null) => {
    if (url) {
      setProfileBackground(url);
    } else {
      restoreUserBackground();
    }
  };

  const setGlobalProfileBackgroundEnabled = (enabled: boolean) => {
    if (globalProfileBackgroundEnabled !== enabled) {
      setGlobalProfileBackgroundEnabledState(enabled);

      if (enabled) {
        
        const savedBg = localStorage.getItem('myProfileBackgroundUrl');
        if (savedBg) {
          setProfileBackground(savedBg);
        }
      } else {
        
        clearProfileBackground();
        localStorage.removeItem('myProfileBackgroundUrl');
        document.cookie =
          'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  };

  const updateThemeSettings = (newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Сохраняем в localStorage только измененные значения
      Object.entries(newSettings).forEach(([key, value]) => {
        if (value && key !== 'mode') {
          localStorage.setItem(key, value);
        }
      });

      return updated;
    });
  };

  
  // Убрали пустой useEffect

  // Убрали лишний useEffect для отслеживания auth state

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
          default: 'rgba(33, 33, 33, 1)',
          paper: 'rgba(33, 33, 33, 1)',
        },
        text: {
          primary: themeSettings.textColor || '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.6)',
        },
      },
      typography: {
        fontFamily: '"SF Pro Display", "Roboto", "Arial", sans-serif',
      },
      shape: {
        borderRadius: 18, // Фиксированное значение для MUI
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 'var(--main-border-radius)',
              textTransform: 'none',
              fontWeight: 500,
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: 'rgba(33, 33, 33, 1)',
              color: themeSettings.textColor || '#FFFFFF',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 'var(--main-border-radius)',
              overflow: 'hidden',
              backgroundColor: '#1a1a1a',
              color: themeSettings.textColor || '#FFFFFF',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 'var(--main-border-radius)',
              backgroundColor: '#1a1a1a',
              color: themeSettings.textColor || '#FFFFFF',
            },
          },
        },
      },
    });
    return themeObj;
  }, [themeSettings.primaryColor, themeSettings.textColor]);

  const location = useLocation();
  const currentPath = location.pathname;

  const isInitialized = useRef(false);

  useEffect(() => {
    localStorage.setItem('themeMode', themeSettings.mode);
  }, [themeSettings.mode]);

  useEffect(() => {
    if (isInitialized.current) return; 

    const savedThemeMode = localStorage.getItem('themeMode');

    if (savedThemeMode && savedThemeMode !== themeSettings.mode) {
      updateThemeSettings({ mode: savedThemeMode });
    }

    
    document.body.classList.add('theme-site-background');
    document.documentElement.classList.add('theme-site-background');


    isInitialized.current = true;
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key &&
        (event.key === 'backgroundColor' ||
          event.key === 'textColor' ||
          event.key === 'primaryColor')
      ) {
        
        const currentValue = themeSettings[event.key as keyof ThemeSettings];

        if (currentValue === event.newValue) {
          return; 
        }

        const settingUpdate: Partial<ThemeSettings> = {};
        settingUpdate[event.key as keyof ThemeSettings] =
          event.newValue as string;

        updateThemeSettings(settingUpdate);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [themeSettings]);

  
  useEffect(() => {
    const loadUserSettings = async () => {

      try {
        const response = await fetch('/api/profile/settings');
        const data = await response.json();

        if (data && data.success && data.settings) {
          
          setThemeSettings(prev => ({
            ...prev,
            primaryColor: data.settings.primary_color || '#D0BCFF',
            mode: 'dark',
          }));
          localStorage.setItem(
            'primaryColor',
            data.settings.primary_color || '#D0BCFF'
          );
          localStorage.setItem('theme', 'dark');
        }
      } catch (e) {
        
        setThemeSettings(prev => ({
          ...prev,
          primaryColor: '#D0BCFF',
          mode: 'dark',
        }));
      }

      
      try {
        const bgResponse = await axios.get(
          '/api/user/settings/global-profile-bg'
        );

        if (bgResponse.data && bgResponse.data.success) {
          setGlobalProfileBackgroundEnabled(bgResponse.data.enabled);

          
          if (bgResponse.data.background_url) {
            if (bgResponse.data.enabled) {
              
              saveUserBackground(bgResponse.data.background_url);
              setProfileBackground(bgResponse.data.background_url);
            } else {
              
              const savedBg = localStorage.getItem('myProfileBackgroundUrl');
              if (savedBg) {
                localStorage.removeItem('myProfileBackgroundUrl');
                document.cookie =
                  'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
              }
              clearProfileBackground();
            }
          }
        }
      } catch (error) {
        
      }
    };

    
    loadUserSettings();
  }, []);

  
  useEffect(() => {
    const loadUserBackground = async () => {
      
      
      const hasToken =
        localStorage.getItem('token') || document.cookie.includes('sessionid');

      
      if (!isAuthenticated || !currentUser) {
        if (hasToken) {
          try {
            const response = await axios.get('/api/auth/me');
            if (response.data && response.data.user) {
              
              await loadUserBackgroundFromUsername(response.data.user.username);
            }
          } catch (error) {
            
          }
        }
        return;
      }

      
      if (
        currentUser &&
        typeof currentUser === 'object' &&
        'username' in currentUser
      ) {
        await loadUserBackgroundFromUsername((currentUser as any).username);
      }
    };

    const loadUserBackgroundFromUsername = async (username: string) => {
      try {
        
        const response = await axios.get(`/api/profile/${username}`);

        if (
          response.data &&
          response.data.user &&
          response.data.user.profile_background_url
        ) {
          const userBg = response.data.user.profile_background_url;

          
          if (globalProfileBackgroundEnabled) {
            const savedBg = localStorage.getItem('myProfileBackgroundUrl');
            if (!savedBg) {
              saveUserBackground(userBg);
            }

            
            if (!profileBackground) {
              setProfileBackground(userBg);
            }
          } else {
            
            const savedBg = localStorage.getItem('myProfileBackgroundUrl');
            if (savedBg) {
              localStorage.removeItem('myProfileBackgroundUrl');
              document.cookie =
                'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
            clearProfileBackground();
          }
        }
      } catch (error) {
        
      }
    };

    
    loadUserBackground();
  }, [globalProfileBackgroundEnabled, isAuthenticated, loading, currentUser]);

  
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

  
  useEffect(() => {
    
    const isProfilePage = location.pathname.match(/^\/profile\/([^\/]+)$/);

    if (!isProfilePage) {
      
      if (globalProfileBackgroundEnabled) {
        restoreUserBackground();
      } else {
        
        clearProfileBackground();
      }
    }
  }, [location.pathname, globalProfileBackgroundEnabled]);

  
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      
      clearProfileBackground();
      setUserBackgroundUrl(null);
    }
  }, [isAuthenticated, loading]);

  
  
  const isAuthPage = [
    '/login',
    '/register',
    '/register/profile',
    '/register/channel',
    '/forgot-password',
    '/reset-password',
    '/element-auth',
    '/auth_elem',
  ].some(path => currentPath.startsWith(path));
  const isPublicPage = [
    '/rules',
    '/privacy-policy',
    '/terms-of-service',
    '/about',
  ].some(path => currentPath.startsWith(path));
  const themeContextValue = useMemo<ThemeSettingsContextType>(() => ({
    themeSettings,
    updateThemeSettings,
    globalProfileBackgroundEnabled,
    setGlobalProfileBackgroundEnabled,
    profileBackground,
    setProfileBackground,
    clearProfileBackground,
    setUserBackground,
    restoreUserBackground,
  }), [themeSettings, globalProfileBackgroundEnabled, profileBackground]);

  return (
    <AppProviders themeContextValue={themeContextValue} theme={theme}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingIndicator />}>
          <DefaultSEO />
          {isAuthPage ? (
            <AuthRoutes setUser={authContext?.setUser} />
          ) : isPublicPage ? (
            <PublicRoutes />
          ) : (
            <MainRoutes
              setUser={authContext?.setUser}
              background={location.state?.background}
            />
          )}
          <MusicPlayerCore />
        </Suspense>
      </ErrorBoundary>
    </AppProviders>
  );
}

export default App;
