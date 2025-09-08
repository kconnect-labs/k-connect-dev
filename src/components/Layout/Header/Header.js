import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  useTheme,
  styled,
  alpha,
  useMediaQuery,
  GlobalStyles,
  Collapse,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { useMusic } from '../../../context/MusicContext';
import { ThemeSettingsContext } from '../../../App';
import { useLanguage } from '../../../context/LanguageContext';
import NotificationList from '../../Notifications/NotificationList';
import axios from 'axios';
import { Icon } from '@iconify/react';
import DynamicIslandNotification from '../../DynamicIslandNotification';
import HeaderLogo from './HeaderLogo';
import HeaderSearch from './HeaderSearch';
import HeaderPlayer from './HeaderPlayer';
import HeaderActions from './HeaderActions';
import HeaderProfileMenu from './HeaderProfileMenu';
import ReactDOM from 'react-dom';

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isHeaderHidden' && prop !== 'isMobile',
})(({ theme, isHeaderHidden, isMobile }) => ({
  backgroundImage: 'none',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  color: 'var(--theme-text-primary)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  zIndex: theme.zIndex.appBar,
  transition: 'transform 0.3s ease-in-out',
  height: 48,
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  height: 48,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, '15%'),
    width: '100%',
    margin: '0 auto',
  },
}));


const Header = ({ toggleSidebar }) => {
  const { user, logout, setUser } = useContext(AuthContext);
  const { themeSettings } = useContext(ThemeSettingsContext);
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:700px)');
  const [accounts, setAccounts] = useState({
    current_account: null,
    main_account: null,
    channels: [],
  });
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    users: [],
    channels: [],
  });
  const [searchTab, setSearchTab] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);

  const [showMobilePlayer, setShowMobilePlayer] = useState(false);

  const themeValues = useMemo(() => {
    const headerTextColor =
      themeSettings.textColor || theme.palette.text.primary;
    const primaryColor =
      themeSettings.primaryColor || theme.palette.primary.main;

    const headerStyle = {
      background: 'rgba(255, 255, 255, 0.03)',
      color: headerTextColor,
      borderColor: alpha(headerTextColor, 0.08),
    };

    return {
      primaryColor,
      headerStyle,
    };
  }, [themeSettings, theme]);

  const isMusicPage = location.pathname === '/music';

  const {
    currentTrack,
    isPlaying,
    isMuted,
    volume,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleMute,
    setVolume,
    openFullScreenPlayer,
  } = useMusic();

  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const [showNewNotification, setShowNewNotification] = useState(false);
  const [newNotification, setNewNotification] = useState(null);
  const lastNotificationId = useRef(null);

  const [languageMenuAnchorEl, setLanguageMenuAnchorEl] = useState(null);
  const isLanguageMenuOpen = Boolean(languageMenuAnchorEl);

  const [isInMessengerChat, setIsInMessengerChat] = useState(false);
  
  // Состояние для скрытия/показа хедера на мобильных устройствах
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleProfileMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = path => {
    handleMenuClose();
    navigate(path);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
    } catch (error) {
      navigate('/login');
    }
  };

  const handleCreateChannel = () => {
    handleMenuClose();
    navigate('/register/channel');
  };

  const handleSwitchAccount = async accountId => {
    try {
      const response = await axios.post('/api/users/switch-account', {
        account_id: accountId,
      });

      if (response.data.success) {
        setUser({
          ...response.data.account,
          id: response.data.account.id,
        });

        handleMenuClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const truncateTitle = (title, maxLength = 25) => {
    if (!title || title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    if (user) {
      fetchUserChannels();
    }
  }, [user]);

  const fetchUserChannels = async () => {
    try {
      const response = await axios.get('/api/users/my-channels');
      if (response.data.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user channels:', error);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get('/api/notifications');
          if (response.data && response.data.success) {
            const newCount = response.data.unread_count || 0;
            setUnreadNotificationsCount(newCount);

            // Check for new notifications
            if (
              response.data.notifications &&
              response.data.notifications.length > 0
            ) {
              const latestNotification = response.data.notifications[0];

              // If this is a new notification (different ID than last one)
              if (latestNotification.id !== lastNotificationId.current) {
                lastNotificationId.current = latestNotification.id;
                handleNewNotification(latestNotification);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      // Initial fetch
      fetchUnreadCount();

      // Set up periodic fetch
      const intervalId = setInterval(fetchUnreadCount, 30000); // Every 30 seconds

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [user]);

  const handleNewNotification = notification => {
    if (!notification.is_read) {
      setNewNotification(notification);
      setShowNewNotification(true);

      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowNewNotification(false);
      }, 5000);
    }
  };

  const handleNotificationRead = notificationId => {
    setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
  };

  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      performSearch(query);
      setShowSearchResults(true);
    } else {
      setSearchResults({ users: [], channels: [] });
      setShowSearchResults(false);
    }
  };

  const performSearch = async query => {
    if (query.trim().length < 2) return;

    setSearchLoading(true);
    try {
      const usersResponse = await axios.get('/api/search/', {
        params: {
          q: query,
          type: 'users',
          per_page: 5,
        },
      });

      const channelsResponse = await axios.get('/api/search/channels', {
        params: {
          q: query,
          per_page: 5,
        },
      });

      setSearchResults({
        users: usersResponse.data?.users || [],
        channels: channelsResponse.data?.channels || [],
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleClickAway = () => {
    setShowSearchResults(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleSearchTabChange = (event, newValue) => {
    setSearchTab(newValue);
  };

  const handleViewAll = () => {
    if (searchTab === 0) {
      navigate(`/search?q=${searchQuery}&type=users`);
    } else {
      navigate(`/channels?q=${searchQuery}`);
    }
    setShowSearchResults(false);
    setShowSearch(false);
  };

  const handleSearchItemClick = path => {
    navigate(path);
    setShowSearchResults(false);
    setShowSearch(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleLanguageMenuOpen = event => {
    setLanguageMenuAnchorEl(event.currentTarget);
    handleMenuClose(); // Close the profile menu
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchorEl(null);
  };

  const handleLanguageChange = newLang => {
    changeLanguage(newLang);
    handleLanguageMenuClose();
  };


  // Языковое меню теперь обрабатывается в HeaderProfileMenu

  useEffect(() => {
    const handleMessengerLayoutChange = event => {
      const { isInChat } = event.detail;
      console.log(
        'Header: Received messenger-layout-change event, isInChat:',
        isInChat
      );
      setIsInMessengerChat(isInChat);
    };

    document.addEventListener(
      'messenger-layout-change',
      handleMessengerLayoutChange
    );

    return () => {
      document.removeEventListener(
        'messenger-layout-change',
        handleMessengerLayoutChange
      );
    };
  }, []);

  // useEffect для отслеживания скролла на мобильных устройствах
  useEffect(() => {
    if (!isMobile) return; // Только для мобильных устройств

    const handleScroll = () => {
      // Ищем MainContainer по data-testid
      const mainContainer = document.querySelector('[data-testid="main-container"]') || 
                           document.querySelector('[style*="overflow: auto"]') || 
                           document.querySelector('.MuiBox-root[style*="overflow: auto"]') ||
                           document.body;
      
      const currentScrollY = mainContainer.scrollTop;
      
      // Определяем направление скролла
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Скролл вниз и мы уже проскроллили больше 100px - скрываем хедер
        setIsHeaderHidden(true);
      } else if (currentScrollY < lastScrollY) {
        // Скролл вверх - показываем хедер
        setIsHeaderHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Добавляем throttling для оптимизации производительности
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Обработчик касания верхней части экрана для показа хедера
    const handleTouchStart = (e) => {
      if (e.touches[0].clientY < 50) { // Касание в верхних 50px экрана
        setIsHeaderHidden(false);
      }
    };

    // Ищем MainContainer и добавляем обработчик скролла к нему
    const mainContainer = document.querySelector('[data-testid="main-container"]') || 
                         document.querySelector('[style*="overflow: auto"]') || 
                         document.querySelector('.MuiBox-root[style*="overflow: auto"]') ||
                         document.body;
    
    mainContainer.addEventListener('scroll', throttledHandleScroll, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      mainContainer.removeEventListener('scroll', throttledHandleScroll);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isMobile, lastScrollY]);

  return (
    <StyledAppBar
      isHeaderHidden={isHeaderHidden}
      isMobile={isMobile}
      className="theme-aware"
      sx={{
        borderRadius: '0px',
        display:
          (isMusicPage && isMobile) || isInMessengerChat ? 'none' : 'block',
      }}
    >
      <GlobalStyles
        styles={{
          '.MuiToolbar-root': {
            minHeight: '48px !important',
            height: '48px !important',
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
      />
      <StyledToolbar>
        {/* Мобильный плеер рендерится только на мобильных устройствах */}
        {isMobile && currentTrack && (
          <IconButton
            color={showMobilePlayer ? 'primary' : 'inherit'}
            onClick={() => setShowMobilePlayer(v => !v)}
            sx={{
              mr: 1,
              opacity: 0.6,
              transition: 'all 0.2s',
              '&:hover': { opacity: 1 },
              bgcolor: showMobilePlayer
                ? alpha(theme.palette.primary.main, 0.08)
                : 'transparent',
            }}
          >
            <Icon
              icon='solar:music-note-2-bold'
              width='24'
              height='24'
              sx={{ color: theme.palette.primary.main }}
            />
          </IconButton>
        )}
        {isMobile && (
          <Collapse
            in={showMobilePlayer}
            timeout={300}
            unmountOnExit
            sx={{ width: '100%' }}
          >
            <Box sx={{ width: '100%' }}>
              <HeaderPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                isMuted={isMuted}
                volume={volume}
                togglePlay={togglePlay}
                nextTrack={nextTrack}
                prevTrack={prevTrack}
                toggleMute={toggleMute}
                setVolume={setVolume}
                theme={theme}
                truncateTitle={truncateTitle}
                isMobile={true}
                onOpenFullscreen={openFullScreenPlayer}
              />
            </Box>
          </Collapse>
        )}
        {isMobile && showMobilePlayer ? null : (
          <>
            {isMobile ? (
              !currentTrack && <HeaderLogo isMobile={isMobile} t={t} />
            ) : (
              <HeaderLogo isMobile={isMobile} t={t} />
            )}
            {showSearch ? (
              isMobile ? (
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    width: '100vw',
                    height: 56,
                    bgcolor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                  }}
                >
                  <HeaderSearch
                    showSearch={showSearch}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchResults={searchResults}
                    searchTab={searchTab}
                    setSearchTab={setSearchTab}
                    searchLoading={searchLoading}
                    showSearchResults={showSearchResults}
                    setShowSearchResults={setShowSearchResults}
                    searchInputRef={searchInputRef}
                    t={t}
                    theme={theme}
                    handleSearchChange={handleSearchChange}
                    handleSearchFocus={handleSearchFocus}
                    handleClickAway={handleClickAway}
                    handleSearchTabChange={handleSearchTabChange}
                    handleViewAll={handleViewAll}
                    handleSearchItemClick={handleSearchItemClick}
                    toggleSearch={toggleSearch}
                    isMobile={true}
                  />
                </Box>
              ) : (
                ReactDOM.createPortal(
                  <Box
                    sx={{
                      position: 'fixed',
                      top: '10%',
                      left: 0,
                      right: 0,
                      mx: 'auto',
                      maxWidth: 520,
                      zIndex: 2000,
                      p: 2,
                      borderRadius: 'var(--main-border-radius)',
                      boxShadow: 8,
                      bgcolor: 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <HeaderSearch
                      showSearch={showSearch}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      searchResults={searchResults}
                      searchTab={searchTab}
                      setSearchTab={setSearchTab}
                      searchLoading={searchLoading}
                      showSearchResults={showSearchResults}
                      setShowSearchResults={setShowSearchResults}
                      searchInputRef={searchInputRef}
                      t={t}
                      theme={theme}
                      handleSearchChange={handleSearchChange}
                      handleSearchFocus={handleSearchFocus}
                      handleClickAway={handleClickAway}
                      handleSearchTabChange={handleSearchTabChange}
                      handleViewAll={handleViewAll}
                      handleSearchItemClick={handleSearchItemClick}
                      toggleSearch={toggleSearch}
                      isMobile={false}
                    />
                  </Box>,
                  document.body
                )
              )
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexGrow: 1,
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <HeaderSearch
                      showSearch={showSearch}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      searchResults={searchResults}
                      searchTab={searchTab}
                      setSearchTab={setSearchTab}
                      searchLoading={searchLoading}
                      showSearchResults={showSearchResults}
                      setShowSearchResults={setShowSearchResults}
                      searchInputRef={searchInputRef}
                      t={t}
                      theme={theme}
                      handleSearchChange={handleSearchChange}
                      handleSearchFocus={handleSearchFocus}
                      handleClickAway={handleClickAway}
                      handleSearchTabChange={handleSearchTabChange}
                      handleViewAll={handleViewAll}
                      handleSearchItemClick={handleSearchItemClick}
                      toggleSearch={toggleSearch}
                    />
                    {/* Desktop плеер рендерится только на PC */}
                    {!showSearch && !isMobile && (
                      <HeaderPlayer
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        isMuted={isMuted}
                        volume={volume}
                        togglePlay={togglePlay}
                        nextTrack={nextTrack}
                        prevTrack={prevTrack}
                        toggleMute={toggleMute}
                        setVolume={setVolume}
                        theme={theme}
                        truncateTitle={truncateTitle}
                        onOpenFullscreen={openFullScreenPlayer}
                        isMobile={isMobile}
                      />
                    )}
                  </Box>
                </Box>
                <HeaderActions
                  user={user}
                  isMobile={isMobile}
                  t={t}
                  theme={theme}
                  navigate={navigate}
                  toggleSearch={toggleSearch}
                  showSearch={showSearch}
                  handleProfileMenuOpen={handleProfileMenuOpen}
                  NotificationList={NotificationList}
                  handleNewNotification={handleNewNotification}
                  handleNotificationRead={handleNotificationRead}
                />
              </>
            )}
          </>
        )}
      </StyledToolbar>

      {showNewNotification && newNotification && (
        <DynamicIslandNotification
          open={true}
          message={newNotification.message}
          shortMessage={
            newNotification.sender_user?.name || t('header.notifications.new')
          }
          notificationType='notification'
          animationType='pill'
          autoHideDuration={5000}
          onClose={() => setShowNewNotification(false)}
          notificationData={newNotification}
          onNotificationRead={handleNotificationRead}
        />
      )}

      <HeaderProfileMenu
        user={user}
        isMobile={isMobile}
        t={t}
        theme={theme}
        anchorEl={anchorEl}
        isMenuOpen={isMenuOpen}
        handleMenuClose={handleMenuClose}
        handleNavigate={handleNavigate}
        handleLogout={handleLogout}
        handleCreateChannel={handleCreateChannel}
        accounts={accounts}
        handleSwitchAccount={handleSwitchAccount}
        handleLanguageMenuOpen={handleLanguageMenuOpen}
        languageMenuAnchorEl={languageMenuAnchorEl}
        isLanguageMenuOpen={isLanguageMenuOpen}
        handleLanguageMenuClose={handleLanguageMenuClose}
        handleLanguageChange={handleLanguageChange}
        language={language}
      />
    </StyledAppBar>
  );
};

export default React.memo(Header);
