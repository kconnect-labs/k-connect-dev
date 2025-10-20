import React, { useContext, useState, useEffect, memo, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { ThemeSettingsContext } from '../../../App';
import { SidebarProvider } from '../../../context/SidebarContext';
import axios from 'axios';
import SidebarNavigation from './SidebarNavigation';
import SidebarFooter from './SidebarFooter';
import MiniPlayer from './MiniPlayer';
import { useClientSettings } from '../../../context/ClientSettingsContext';
import './Sidebar.css';

const areEqual = (prevProps, nextProps) => {
  return true;
};

const Sidebar = memo(({ isMobile }) => {
  // На мобильных устройствах сайдбар вообще не рендерится
  if (isMobile) {
    return null;
  }
  const { user } = useContext(AuthContext);
  const { themeSettings } = useContext(ThemeSettingsContext);
  const [isModeratorUser, setIsModeratorUser] = useState(false);
  // Получаем настройки клиента из контекста
  const { settings: clientSettings } = useClientSettings();
  const [sidebarPlayerEnabled, setSidebarPlayerEnabled] = useState(
    () => clientSettings.player_sidebar === 1
  );

  const themeValues = useMemo(() => {
    const primaryColor = themeSettings.primaryColor || '#D0BCFF';



    return {
      primaryColor,
    };
  }, [themeSettings]);

  const isAdmin = user?.id === 3;

  const isChannel = user?.account_type === 'channel';

  useEffect(() => {
    if (user) {
      checkModeratorStatus();
    }
  }, [user]);

  // Слушаем событие переключения плеера
  useEffect(() => {
    const handleSidebarPlayerToggle = (event) => {
      setSidebarPlayerEnabled(event.detail.enabled);
    };

    document.addEventListener('sidebarPlayerToggled', handleSidebarPlayerToggle);
    
    return () => {
      document.removeEventListener('sidebarPlayerToggled', handleSidebarPlayerToggle);
    };
  }, []);

  // Синхронизируем с контекстом
  useEffect(() => {
    setSidebarPlayerEnabled(clientSettings.player_sidebar === 1);
  }, [clientSettings]);

  const [lastModeratorCheck, setLastModeratorCheck] = useState(0);

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

      const response = await axios.get('/api/moderator/quick-status');
      if (response.data && response.data.is_moderator) {
        setIsModeratorUser(true);
      } else {
        setIsModeratorUser(false);
      }

      setLastModeratorCheck(now);
    } catch (error) {
      setIsModeratorUser(false);
    } finally {
      window._moderatorCheckInProgress = false;
    }
  };

  const userNavData = useMemo(
    () => ({
      isAdmin,
      isModeratorUser,
      isChannel,
      user,
    }),
    [isAdmin, isModeratorUser, isChannel, user]
  );

  return (
    <div className='sidebar-v2-container'>
      <SidebarProvider>
        <div className='sidebar-v2-content'>

          <SidebarNavigation
            {...userNavData}
            primaryColor={themeValues.primaryColor}
          />
        </div>
      </SidebarProvider>

      {sidebarPlayerEnabled && <MiniPlayer />}
    </div>
  );
}, areEqual);

export default Sidebar;
