import React, { useContext, useState, useEffect, memo, useMemo } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { ThemeSettingsContext } from '../../../App';
import { SidebarProvider } from '../../../context/SidebarContext';
import axios from 'axios';
import SidebarNavigation from './SidebarNavigation';
import UserProfileBlock from './UserProfileBlock';
import SidebarFooter from './SidebarFooter';
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

  const themeValues = useMemo(() => {
    const sidebarTextColor = 'var(--theme-text-primary)';
    const primaryColor = themeSettings.primaryColor || '#D0BCFF';

    const sidebarStyle = {
      color: sidebarTextColor,
      boxShadow: 'none',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    };

    return {
      primaryColor,
      sidebarStyle,
    };
  }, [themeSettings]);

  const isAdmin = user?.id === 3;

  const isChannel = user?.account_type === 'channel';

  useEffect(() => {
    if (user) {
      checkModeratorStatus();
    }
  }, [user]);

  const [lastModeratorCheck, setLastModeratorCheck] = useState(0);

  const checkModeratorStatus = async () => {
    try {
      if (window._moderatorCheckInProgress) {
        console.log('Moderator check already in progress, skipping...');
        return;
      }

      const now = Date.now();
      if (now - lastModeratorCheck < 15 * 60 * 1000) {
        console.log('Using cached moderator status');
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
      console.error('Error checking moderator status:', error);
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
    <div
      className='sidebar-container theme-aware'
      style={themeValues.sidebarStyle}
    >
      <SidebarProvider>
        <div className='sidebar-content'>
          <UserProfileBlock
            user={user}
            primaryColor={themeValues.primaryColor}
          />
          <SidebarNavigation
            {...userNavData}
            primaryColor={themeValues.primaryColor}
          />
        </div>
      </SidebarProvider>

      <SidebarFooter primaryColor={themeValues.primaryColor} />
    </div>
  );
}, areEqual);

export default Sidebar;
