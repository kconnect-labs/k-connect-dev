import { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ThemeSettingsContext } from '../App';
import { useMessenger } from '../contexts/MessengerContext';
import './BottomNavigation.css';

export const BOTTOM_NAV_ID = 'app-bottom-navigation';

interface User {
  username: string;
  account_type?: string;
}

interface BottomNavigationProps {
  user: User | null;
  isMobile: boolean;
}

interface UnreadCounts {
  [key: string]: number;
}

interface MessengerContextType {
  unreadCounts: UnreadCounts;
}

const AppBottomNavigation: React.FC<BottomNavigationProps> = ({ user, isMobile }) => {
  // AppBottomNavigation рендерится только на мобильных устройствах
  if (!isMobile) {
    return null;
  }
  
  const navigate = useNavigate();
  const location = useLocation();
  const [visibleInMessenger, setVisibleInMessenger] = useState<boolean>(true);
  const { themeSettings } = useContext(ThemeSettingsContext);
  const { unreadCounts } = useMessenger() as MessengerContextType;
  const totalUnread = Object.values(unreadCounts || {}).filter((c: number) => c > 0).length;
  console.log('📱 BottomNavigation: unreadCounts:', unreadCounts, 'totalUnread:', totalUnread);
  
  const isChannel = user?.account_type === 'channel';
  
  useEffect(() => {
    const handleMessengerLayoutChange = (event: CustomEvent) => {
      const { isInChat } = event.detail;
      console.log('BottomNavigation: Received messenger-layout-change event, isInChat:', isInChat);
      setVisibleInMessenger(!isInChat);
    };
    
    document.addEventListener('messenger-layout-change', handleMessengerLayoutChange as EventListener);
    
    return () => {
      document.removeEventListener('messenger-layout-change', handleMessengerLayoutChange as EventListener);
    };
  }, []);
  
  const isInMessenger = location.pathname.startsWith('/messenger');
  if (isInMessenger && !visibleInMessenger) {
    console.log('BottomNavigation: Hidden in messenger chat, visible state:', visibleInMessenger);
    return null;
  }
  
  // Проверяем, есть ли активный полный экран плеер
  const isFullscreenPlayerActive = document.body.classList.contains('fullscreen-player-active');
  if (isFullscreenPlayerActive) {
    return null;
  }
  
  const authPages = ['/login', '/register', '/register/profile', '/confirm-email'];
  const isAuthPage = authPages.some(path => location.pathname.startsWith(path));
  const isSettingsPage = location.pathname.startsWith('/settings');
  const isBadgeShopPage = location.pathname.startsWith('/badge-shop');
  const isClickerPage = location.pathname.startsWith('/minigames/clicker');
  const isBlackjackPage = location.pathname.startsWith('/minigames/blackjack');
  const isCupsPage = location.pathname.startsWith('/minigames/cups');
  
  if (isAuthPage || isSettingsPage || isBadgeShopPage || isClickerPage || isBlackjackPage || isCupsPage) {
    return null;
  }

  const getCurrentValue = (): number | false => {
    const path = location.pathname;
    if (path === '/' || path === '/feed' || path === '/main') return 0;
    if (path === '/music') return 1;
    if (path.startsWith('/messenger')) return 2;
    if (path.startsWith('/profile')) return 3;
    if (path === '/more') return 4;
    return false;
  };

  console.log("BottomNavigation rendering, user:", user, "pathname:", location.pathname);
  
  const handleNavigationChange = (newValue: number): void => {
    switch(newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/music');
        break;
      case 2:
        navigate('/messenger');
        break;
      case 3:
        navigate(user ? `/profile/${user.username}` : '/login');
        break;
      case 4:
        navigate('/more');
        break;
      default:
        break;
    }
  };

  const currentValue = getCurrentValue();

  return (
    <div 
      id={BOTTOM_NAV_ID}
      className="bottom-navigation"
    >
      <div className="bottom-nav-container">
        <button 
          className={`bottom-nav-item ${currentValue === 0 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(0)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:home-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Лента</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${currentValue === 1 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(1)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:music-notes-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Музыка</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${currentValue === 2 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(2)}
        >
          <div className="bottom-nav-icon">
            {totalUnread > 0 ? (
              <div className="badge">
                <Icon icon="solar:chat-round-dots-bold" width="28" height="28" />
                <div className="badge-content">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </div>
              </div>
            ) : (
              <Icon icon="solar:chat-round-dots-bold" width="28" height="28" />
            )}
          </div>
          <span className="bottom-nav-label">Мессенджер</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${currentValue === 3 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(3)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:user-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Профиль</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${currentValue === 4 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(4)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:widget-2-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Еще</span>
        </button>
      </div>
    </div>
  );
};

export default AppBottomNavigation; 