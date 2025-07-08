import React, { useContext, useState, useEffect, memo, useMemo } from 'react';
import { 
  Box, 
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../../context/AuthContext';
import { ThemeSettingsContext } from '../../../App';
import { SidebarProvider } from '../../../context/SidebarContext';
import axios from 'axios';
import SidebarNavigation from './SidebarNavigation';
import UserProfileBlock from './UserProfileBlock';
import SidebarFooter from './SidebarFooter';


const SidebarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0, 0),
  height: 'calc(100vh - 65px)',
  position: 'sticky',
  top: '55px',
  overflowY: 'auto',
  overflowX: 'hidden',
  boxShadow: 'none',
  background: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    width: '0px',
    background: 'transparent',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'transparent',
  },
  [theme.breakpoints.up('md')]: {
    width: '230px',
    marginRight: 0,
    marginLeft: 'auto',
  },
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(1.2, 0.8),
    width: '220px',
  },
  [theme.breakpoints.down('md')]: {
    width: '210px',
    padding: theme.spacing(1, 0.8),
  }
}));


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
  const theme = useTheme();

  
  const themeValues = useMemo(() => {
    const sidebarBackgroundColor = themeSettings.paperColor || theme.palette.background.paper;
    const sidebarTextColor = themeSettings.textColor || theme.palette.text.primary;
    const primaryColor = themeSettings.primaryColor || theme.palette.primary.main;

    const sidebarStyle = {
      color: sidebarTextColor,
    };

    return {
      primaryColor,
      sidebarStyle
    };
  }, [themeSettings, theme]);

  
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
  
  
  const userNavData = useMemo(() => ({
    isAdmin,
    isModeratorUser,
    isChannel,
    user
  }), [isAdmin, isModeratorUser, isChannel, user]);

  return (
    <SidebarContainer elevation={2} style={themeValues.sidebarStyle}>
      <SidebarProvider>
      <Box>
          <UserProfileBlock 
            user={user} 
            primaryColor={themeValues.primaryColor} 
          />
          <SidebarNavigation 
            {...userNavData}
            primaryColor={themeValues.primaryColor}
                  />
                </Box>
      </SidebarProvider>
      
      <SidebarFooter primaryColor={themeValues.primaryColor} />
    </SidebarContainer>
  );
}, areEqual);

export default Sidebar;