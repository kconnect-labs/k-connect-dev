import React, { useState, useEffect, useContext, memo, ReactNode } from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';
import {
  Box,
  styled,
  useMediaQuery,
  useTheme,
  CssBaseline,
} from '@mui/material';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeSettingsContext } from '../../App';
import { MobilePlayer, DesktopPlayer } from '../Music';
import { useMusic } from '../../context/MusicContext';
import AppBottomNavigation from '../BottomNavigation';

interface MainLayoutProps {
  children: ReactNode;
}

interface ThemeSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
}

interface MainLayoutUser {
  ban?: number;
  id?: number;
  username?: string;
  name?: string;
  photo?: string;
  account_type?: string;
}

interface AuthContextType {
  user: MainLayoutUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => void;
  login: () => void;
  logout: () => void;
  setUser: () => void;
}

interface ThemeSettingsContextType {
  themeSettings: ThemeSettings | null;
  profileBackground: string | null;
}

interface MusicContextType {
  currentTrack: any;
}

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: theme.palette.text.primary,
  overflow: 'auto',
}));

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => !['isMusicPage', 'isMobile', 'isInMessengerChat'].includes(prop as string),
})<{
  isMusicPage: boolean;
  isMobile: boolean;
  isInMessengerChat: boolean;
}>(({ theme, isMusicPage, isMobile, isInMessengerChat }) => ({
  display: 'flex',
  flexGrow: 1,
  paddingTop: isMusicPage && isMobile ? 0 : isInMessengerChat ? 0 : 40,
}));

const SidebarContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  flexShrink: 0,
  marginLeft: 'auto',
  '@media (max-width: 700px)': {
    position: 'fixed',
    zIndex: theme.zIndex.drawer,
    right: open ? 0 : -280,
    left: 'auto',
    transition: theme.transitions.create('right', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  paddingBottom: theme.spacing(2),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: 0,
  maxWidth: '100%',
  color: theme.palette.text.primary,
  '@media (min-width: 700px)': {
    maxWidth: '1050px',
    paddingRight: '10px',
    paddingLeft: '10px',
    marginRight: 'auto',
  },
  '@media (max-width: 700px)': {
    padding: 0,
  },
}));

const Overlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: theme.zIndex.drawer - 1,
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.3s ease, visibility 0.3s ease',
  '&.active': {
    opacity: 1,
    visibility: 'visible',
  },
}));

interface MemoizedHeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

const MemoizedHeader = memo<MemoizedHeaderProps>(
  ({ toggleSidebar, isMobile }) => <Header toggleSidebar={toggleSidebar} />
);

interface MemoizedSidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const MemoizedSidebar = memo<MemoizedSidebarProps>(
  ({ open, onClose, isMobile }) => {
    if (isMobile) {
      return null;
    }
    // @ts-ignore
    return <Sidebar isMobile={isMobile} />;
  }
);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const { themeSettings, profileBackground } = useContext(
    ThemeSettingsContext
  ) as ThemeSettingsContextType;
  const { user, loading } = useContext(AuthContext) as AuthContextType;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery('(max-width:700px)');
  const location = useLocation();
  const { currentTrack } = useMusic() as MusicContextType;
  const themeManager = useThemeManager();

  const sidebarWidth = 280;

  const isBanned = user && user.ban === 1;
  const isOnBanPage = location.pathname === '/ban';

  const shouldShowFullLayout = !isBanned && !isOnBanPage;
  const [isInMessengerChat, setIsInMessengerChat] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Применяем тему к элементам MainLayout после рендера
  useEffect(() => {
    if (themeManager && !themeManager.isLoading && themeManager.currentTheme) {
      console.log('🎨 MainLayout применяет тему:', themeManager.currentTheme);
      
      // Применяем тему к элементам MainLayout после небольшой задержки
      setTimeout(() => {
        if (themeManager.currentTheme === 'default') {
          themeManager.switchToDefaultTheme();
        } else {
          themeManager.switchToBlurTheme();
        }
      }, 50);
    }
  }, [themeManager?.currentTheme, themeManager?.isLoading]);

  // Дополнительно применяем тему при изменении содержимого
  useEffect(() => {
    if (themeManager && !themeManager.isLoading && themeManager.currentTheme) {
      // Применяем тему с большей задержкой для обработки всех дочерних элементов
      const timer = setTimeout(() => {
        console.log('🎨 MainLayout применяет тему к дочерним элементам:', themeManager.currentTheme);
        
        // Находим все элементы с нужными стилями внутри MainLayout
        const mainContainer = document.querySelector('[data-testid="main-container"]');
        if (mainContainer) {
          const elementsWithStyles = mainContainer.querySelectorAll('*');
          elementsWithStyles.forEach(element => {
            const el = element as HTMLElement;
            const computedStyle = window.getComputedStyle(el);
            
            const hasTargetStyles = 
              (computedStyle.background && 
               (computedStyle.background.includes('rgba(255, 255, 255, 0.03)') ||
                computedStyle.background.includes('rgba(15, 15, 15, 0.98)'))) ||
              (computedStyle.backgroundColor && 
               (computedStyle.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                computedStyle.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));
            
            if (hasTargetStyles && !el.hasAttribute('data-theme-applied')) {
              console.log('🎨 Применяем тему к элементу MainLayout:', el.tagName, el.className);
              if (themeManager.currentTheme === 'default') {
                // Применяем default тему
                if (el.style.background && el.style.background.includes('rgba(255, 255, 255, 0.03)')) {
                  el.style.background = el.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
                }
                if (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
                  el.style.backgroundColor = el.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
                }
                if (el.style.backdropFilter && el.style.backdropFilter.includes('blur(20px)')) {
                  el.style.backdropFilter = el.style.backdropFilter.replace(/blur\(20px\)/g, '');
                }
              } else {
                // Применяем blur тему
                if (el.style.background && el.style.background.includes('rgba(15, 15, 15, 0.98)')) {
                  el.style.background = el.style.background.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
                  if (!el.style.backdropFilter || !el.style.backdropFilter.includes('blur(20px)')) {
                    el.style.backdropFilter = (el.style.backdropFilter || '') + ' blur(20px)';
                  }
                }
                if (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')) {
                  el.style.backgroundColor = el.style.backgroundColor.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
                  if (!el.style.backdropFilter || !el.style.backdropFilter.includes('blur(20px)')) {
                    el.style.backdropFilter = (el.style.backdropFilter || '') + ' blur(20px)';
                  }
                }
              }
              el.setAttribute('data-theme-applied', 'true');
            }
          });
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [themeManager?.currentTheme, themeManager?.isLoading, location.pathname]);

  // Периодическая проверка для обработки новых элементов в MainLayout
  useEffect(() => {
    if (themeManager && !themeManager.isLoading && themeManager.currentTheme) {
      const intervalId = setInterval(() => {
        console.log('🎨 MainLayout: периодическая проверка новых элементов');
        
        const mainContainer = document.querySelector('[data-testid="main-container"]');
        if (mainContainer) {
          const allElements = mainContainer.querySelectorAll('*');
          let processedCount = 0;
          
          allElements.forEach(element => {
            const el = element as HTMLElement;
            const computedStyle = window.getComputedStyle(el);
            
            const hasTargetStyles = 
              (computedStyle.background && 
               (computedStyle.background.includes('rgba(255, 255, 255, 0.03)') ||
                computedStyle.background.includes('rgba(15, 15, 15, 0.98)'))) ||
              (computedStyle.backgroundColor && 
               (computedStyle.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                computedStyle.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));
            
            if (hasTargetStyles && !el.hasAttribute('data-theme-applied')) {
              processedCount++;
              if (themeManager.currentTheme === 'default') {
                if (el.style.background && el.style.background.includes('rgba(255, 255, 255, 0.03)')) {
                  el.style.background = el.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
                }
                if (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
                  el.style.backgroundColor = el.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
                }
                if (el.style.backdropFilter && el.style.backdropFilter.includes('blur(20px)')) {
                  el.style.backdropFilter = el.style.backdropFilter.replace(/blur\(20px\)/g, '');
                }
              } else {
                if (el.style.background && el.style.background.includes('rgba(15, 15, 15, 0.98)')) {
                  el.style.background = el.style.background.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
                  if (!el.style.backdropFilter || !el.style.backdropFilter.includes('blur(20px)')) {
                    el.style.backdropFilter = (el.style.backdropFilter || '') + ' blur(20px)';
                  }
                }
                if (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')) {
                  el.style.backgroundColor = el.style.backgroundColor.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
                  if (!el.style.backdropFilter || !el.style.backdropFilter.includes('blur(20px)')) {
                    el.style.backdropFilter = (el.style.backdropFilter || '') + ' blur(20px)';
                  }
                }
              }
              el.setAttribute('data-theme-applied', 'true');
            }
          });
          
          if (processedCount > 0) {
            console.log(`🎨 MainLayout: обработано ${processedCount} новых элементов`);
          }
        }
      }, 2000); // Проверяем каждые 2 секунды
      
      return () => clearInterval(intervalId);
    }
  }, [themeManager?.currentTheme, themeManager?.isLoading]);

  useEffect(() => {
    const handleMessengerLayoutChange = (
      event: CustomEvent<{ isInChat: boolean }>
    ) => {
      const { isInChat } = event.detail;
      setIsInMessengerChat(isInChat);
    };

    document.addEventListener(
      'messenger-layout-change',
      handleMessengerLayoutChange as EventListener
    );

    return () => {
      document.removeEventListener(
        'messenger-layout-change',
        handleMessengerLayoutChange as EventListener
      );
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isMusicPage = location.pathname.startsWith('/music');
  const hasBottomPlayer = isMobile && currentTrack && isMusicPage;
  const hasDesktopPlayer = !isMobile && currentTrack && isMusicPage;

  return (
    <MainContainer
      data-testid="main-container"
      sx={{
        backgroundColor:
          themeSettings?.backgroundColor || theme.palette.background.default,
        backgroundImage: profileBackground
          ? `url(${profileBackground})`
          : themeSettings?.backgroundImage
            ? `url(${themeSettings.backgroundImage})`
            : 'none',
        color: themeSettings?.textColor || theme.palette.text.primary,
      }}
    >
      <CssBaseline />
      {shouldShowFullLayout && (
        <MemoizedHeader toggleSidebar={toggleSidebar} isMobile={isMobile} />
      )}

      <ContentWrapper
        isMusicPage={isMusicPage}
        isMobile={isMobile}
        isInMessengerChat={isInMessengerChat}
      >
        {!isMobile && (
          <Overlay
            className={sidebarOpen ? 'active' : ''}
            onClick={closeSidebar}
          />
        )}

        {!isMobile && (
          <SidebarContainer
            open={sidebarOpen}
            sx={{
              width: sidebarWidth,
              display: isInMessengerChat ? 'none' : 'block',
            }}
          >
            <MemoizedSidebar
              open={sidebarOpen}
              onClose={closeSidebar}
              isMobile={isMobile}
            />
          </SidebarContainer>
        )}

        <ContentContainer
          sx={{
            color: themeSettings?.textColor || theme.palette.text.primary,
            width: {
              xs: '100%',
              sm: '100%',
              md: isInMessengerChat ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            },
            paddingBottom: {
              xs: hasBottomPlayer ? theme.spacing(12) : theme.spacing(8),
              sm: hasBottomPlayer ? theme.spacing(12) : theme.spacing(8),
              md: hasDesktopPlayer ? theme.spacing(12) : theme.spacing(2),
            },
          }}
        >
          {children}
        </ContentContainer>
      </ContentWrapper>

      {isMobile && (
        <AppBottomNavigation user={user as any} isMobile={isMobile} />
      )}
      {isMobile && hasBottomPlayer && <MobilePlayer />}
      {!isMobile && hasDesktopPlayer && <DesktopPlayer />}
    </MainContainer>
  );
};

export default memo(MainLayout);
