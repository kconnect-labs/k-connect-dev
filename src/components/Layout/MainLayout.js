import React, { useState, useEffect, useContext, memo } from 'react';
import { Box, styled, useMediaQuery, useTheme, CssBaseline } from '@mui/material';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeSettingsContext } from '../../App';
import { MobilePlayer, DesktopPlayer } from '../Music';
import { useMusic } from '../../context/MusicContext';
import LanguageSwitcher from '../LanguageSwitcher';
import AppBottomNavigation from '../BottomNavigation';


const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  color: theme.palette.text.primary,
  overflow: 'auto'
}));


const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => !['isMusicPage', 'isMobile', 'isInMessengerChat'].includes(prop),
})(({ theme, isMusicPage, isMobile, isInMessengerChat }) => ({
  display: 'flex',
  flexGrow: 1,
  paddingTop: isMusicPage && isMobile ? 0 : (isInMessengerChat ? 0 : 40), 
}));


const SidebarContainer = styled(Box)(({ theme, open }) => ({
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
  marginRight: { xs: 0, md: 0 },
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


const MemoizedHeader = memo(({ toggleSidebar, isMobile }) => (
  <Header toggleSidebar={toggleSidebar} isMobile={isMobile} />
));


const MemoizedSidebar = memo(({ open, onClose, isMobile }) => {
  // На мобильных устройствах сайдбар вообще не рендерится
  if (isMobile) {
    return null;
  }
  return <Sidebar open={open} onClose={onClose} />;
});

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const { themeSettings, profileBackground } = useContext(ThemeSettingsContext);
  const { user, isLoading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:700px)');
  const location = useLocation();
  const { currentTrack } = useMusic();
  

  
  const sidebarWidth = 280;
  
  const isBanned = user && user.ban === 1;
  const isOnBanPage = location.pathname === '/ban';
  
  const shouldShowFullLayout = !isBanned && !isOnBanPage;
  const [isInMessengerChat, setIsInMessengerChat] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  useEffect(() => {
    const handleMessengerLayoutChange = (event) => {
      const { isInChat } = event.detail;
      setIsInMessengerChat(isInChat);
    };
    
    document.addEventListener('messenger-layout-change', handleMessengerLayoutChange);
    
    return () => {
      document.removeEventListener('messenger-layout-change', handleMessengerLayoutChange);
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
      sx={{
        backgroundColor: themeSettings?.backgroundColor || theme.palette.background.default,
        backgroundImage: profileBackground
          ? `url(${profileBackground})`
          : (themeSettings?.backgroundImage 
            ? `url(${themeSettings.backgroundImage})` 
            : 'none'),
        color: themeSettings?.textColor || theme.palette.text.primary
      }}

    >
      <CssBaseline />
      {shouldShowFullLayout && <MemoizedHeader toggleSidebar={toggleSidebar} isMobile={isMobile} />}
      
      <ContentWrapper isMusicPage={isMusicPage} isMobile={isMobile} isInMessengerChat={isInMessengerChat}>
        {/* Overlay рендерится только на PC, так как сайдбар только там */}
        {!isMobile && (
          <Overlay 
            className={sidebarOpen ? 'active' : ''} 
            onClick={closeSidebar}
          />
        )}
        
        {/* Сайдбар рендерится только на PC */}
        {!isMobile && (
          <SidebarContainer 
            open={sidebarOpen} 
            sx={{ 
              width: sidebarWidth,
              display: isInMessengerChat ? 'none' : 'block'
            }}
          >
            <MemoizedSidebar open={sidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
          </SidebarContainer>
        )}
        
        <ContentContainer 
          sx={{ 
            color: themeSettings?.textColor || theme.palette.text.primary,
            width: { 
              // На мобильных устройствах контент занимает всю ширину
              xs: '100%',
              sm: '100%',
              md: isInMessengerChat ? '100%' : `calc(100% - ${sidebarWidth}px)` 
            },
            paddingBottom: {
              xs: hasBottomPlayer ? theme.spacing(12) : theme.spacing(8),
              sm: hasBottomPlayer ? theme.spacing(12) : theme.spacing(8),
              md: hasDesktopPlayer ? theme.spacing(12) : theme.spacing(2)
            }
          }}
        >
          {children}
        </ContentContainer>
      </ContentWrapper>
      
      {/* Bottom navigation рендерится только на мобильных устройствах */}
      {isMobile && <AppBottomNavigation user={user} isMobile={isMobile} />}
      {isMobile && hasBottomPlayer && <MobilePlayer isMobile={isMobile} />}
      {/* Desktop player рендерится только на PC */}
      {!isMobile && hasDesktopPlayer && <DesktopPlayer isMobile={isMobile} />}
    </MainContainer>
  );
};

export default memo(MainLayout); 