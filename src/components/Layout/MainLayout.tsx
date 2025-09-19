import React, { useState, useEffect, useContext, memo, ReactNode } from 'react';
import {
  Box,
  styled,
  useMediaQuery,
  useTheme,
  CssBaseline,
} from '@mui/material';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeSettingsContext } from '../../App';
import { DesktopPlayer } from '../Music';
import { useMusic } from '../../context/MusicContext';
import AppBottomNavigation from '../BottomNavigation';
import PostDetailOverlay from '../Post/PostDetailOverlay';

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

const PageTransitionWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflowX: 'hidden',
  perspective: '800px',
  '& .mobile-page': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transformOrigin: 'center center',
    isolation: 'isolate',
  },
  /* Входящая страница */
  '& .mobile-page-enter': {
    transform: 'translateX(100%) scale(0.93)',
    opacity: 0.9,
  },
  '& .mobile-page-enter-active': {
    transform: 'translateX(0%) scale(1)',
    opacity: 1,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform, opacity',
  },
  /* Выходящая страница */
  '& .mobile-page-exit': {
    transform: 'translateX(0%) scale(1)',
    opacity: 1,
  },
  '& .mobile-page-exit-active': {
    transform: 'translateX(-100%) scale(0.93)',
    opacity: 0.9,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform, opacity',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .mobile-page-enter': {
      transform: 'none',
      opacity: 1,
    },
    '& .mobile-page-exit-active': {
      transform: 'none',
      opacity: 1,
    },
  },
  /* Сброс will-change после завершения анимации */
  '& .mobile-page-enter-done': {
    willChange: 'auto',
  },
  '& .mobile-page-exit-done': {
    willChange: 'auto',
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

  const sidebarWidth = 280;

  const isBanned = user && user.ban === 1;
  const isOnBanPage = location.pathname === '/ban';

  const shouldShowFullLayout = !isBanned && !isOnBanPage;
  const [isInMessengerChat, setIsInMessengerChat] = useState<boolean>(false);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
    
    // Дополнительный сброс скролла при смене location
    if (isMobile) {
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        // Сброс скролла для контентной области
        const contentContainer = document.querySelector('[data-testid="content-container"]');
        if (contentContainer) {
          contentContainer.scrollTop = 0;
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location, isMobile]);

  // Эффект для сброса скролла при смене страницы
  useEffect(() => {
    // Сбрасываем скролл в начало страницы
    window.scrollTo(0, 0);
    
    // Находим и сбрасываем скролл для всех скроллируемых контейнеров
    const resetScrollForContainers = () => {
      // Основной контейнер
      const mainContainer = document.querySelector('[data-testid="main-container"]');
      if (mainContainer) {
        mainContainer.scrollTop = 0;
      }
      
      // Контентная область - главная область скролла
      const contentContainer = document.querySelector('[data-testid="content-container"]');
      if (contentContainer) {
        contentContainer.scrollTop = 0;
      }
      
      // Все элементы с MUI styled компонентами (которые могут скроллиться)
      const contentContainers = document.querySelectorAll('[class*="ContentContainer"], [class*="MuiBox-root"]');
      contentContainers.forEach(container => {
        if ((container as HTMLElement).scrollHeight > (container as HTMLElement).clientHeight) {
          (container as HTMLElement).scrollTop = 0;
        }
      });
      
      // Области с overflow: auto или scroll
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const computed = window.getComputedStyle(element as HTMLElement);
        if (computed.overflowY === 'auto' || computed.overflowY === 'scroll' || computed.overflow === 'auto' || computed.overflow === 'scroll') {
          (element as HTMLElement).scrollTop = 0;
        }
      });
      
      // Сброс скролла для body и html
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    };
    
    resetScrollForContainers();
    
    // Дополнительный сброс через небольшую задержку
    const timer = setTimeout(resetScrollForContainers, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
  const isMessengerPage = location.pathname.startsWith('/messenger');
  const hasDesktopPlayer = !isMobile && currentTrack && isMusicPage;

  const hasBackgroundImage = profileBackground || themeSettings?.backgroundImage;

  return (
    <MainContainer
      data-testid="main-container"
      className={hasBackgroundImage ? '' : 'theme-site-background'}
      sx={{
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
          data-testid="content-container"
          sx={{
            color: themeSettings?.textColor || theme.palette.text.primary,
            width: {
              xs: '100%',
              sm: '100%',
              md: isInMessengerChat ? '100%' : `calc(100% - ${sidebarWidth}px)`,
            },
            paddingBottom: {
              xs: isMessengerPage ? 0 : theme.spacing(8),
              sm: isMessengerPage ? 0 : theme.spacing(8),
              md: hasDesktopPlayer ? theme.spacing(12) : isMessengerPage ? 0 : theme.spacing(2),
            },
          }}
        >
          {isMobile ? (
            <PageTransitionWrapper>
              <TransitionGroup component={null}>
                <CSSTransition
                  key={location.pathname}
                  classNames="mobile-page"
                  timeout={400}
                  onEntered={() => {
                    // Принудительный сброс скролла после завершения анимации
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                      document.body.scrollTop = 0;
                      document.documentElement.scrollTop = 0;
                      
                      // Сброс скролла для контентной области
                      const contentContainer = document.querySelector('[data-testid="content-container"]');
                      if (contentContainer) {
                        contentContainer.scrollTop = 0;
                      }
                      
                      const mainContainer = document.querySelector('[data-testid="main-container"]');
                      if (mainContainer) {
                        mainContainer.scrollTop = 0;
                      }
                      
                      // Сброс для всех скроллируемых элементов
                      const allElements = document.querySelectorAll('*');
                      allElements.forEach(element => {
                        const computed = window.getComputedStyle(element as HTMLElement);
                        if (computed.overflowY === 'auto' || computed.overflowY === 'scroll' || computed.overflow === 'auto' || computed.overflow === 'scroll') {
                          (element as HTMLElement).scrollTop = 0;
                        }
                      });
                    }, 50);
                  }}
                  onExited={() => {
                    window.scrollTo(0, 0);
                    const contentContainer = document.querySelector('[data-testid="content-container"]');
                    if (contentContainer) {
                      contentContainer.scrollTop = 0;
                    }
                  }}
                >
                  <Box className="mobile-page" sx={{ height: '100%' }}>
          {children}
                  </Box>
                </CSSTransition>
              </TransitionGroup>
            </PageTransitionWrapper>
          ) : (
            children
          )}
        </ContentContainer>
      </ContentWrapper>

      {isMobile && (
        <AppBottomNavigation user={user as any} isMobile={isMobile} />
      )}
      {!isMobile && hasDesktopPlayer && <DesktopPlayer />}

      {/* Portal overlay for post detail */}
      <PostDetailOverlay />
    </MainContainer>
  );
};

export default memo(MainLayout);
