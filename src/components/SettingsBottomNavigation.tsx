import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ThemeSettingsContext } from '../App';
import './BottomNavigation.css';

interface User {
  username: string;
  account_type?: string;
}

interface SettingsBottomNavigationProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent | null, newValue: number) => void;
  user: User | null;
  isMobile: boolean;
}

const SettingsBottomNavigation: React.FC<SettingsBottomNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  user, 
  isMobile 
}) => {
  // SettingsBottomNavigation рендерится только на мобильных устройствах
  if (!isMobile) {
    return null;
  }
  
  const navigate = useNavigate();
  const isChannel = user?.account_type === 'channel';
  const { themeSettings } = useContext(ThemeSettingsContext);

  const handleNavigationChange = (newValue: number): void => {
    if (newValue === -1) {
      navigate(-1); 
    } else {
      onTabChange(null, newValue);
    }
  };

  return (
    <div className="bottom-navigation">
      <div className="bottom-nav-container">
        <button 
          className={`bottom-nav-item ${activeTab === -1 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(-1)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:arrow-left-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Назад</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(0)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:user-circle-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Профиль</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(1)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:palette-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Внешность</span>
        </button>
        
        {!isChannel && (
          <button 
            className={`bottom-nav-item ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => handleNavigationChange(2)}
          >
            <div className="bottom-nav-icon">
              <Icon icon="solar:bell-bold" width="28" height="28" />
            </div>
            <span className="bottom-nav-label">Уведомления</span>
          </button>
        )}
        
        <button 
          className={`bottom-nav-item ${activeTab === 3 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(3)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:medal-ribbon-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Достижения</span>
        </button>
        
        {!isChannel && (
          <button 
            className={`bottom-nav-item ${activeTab === 4 ? 'active' : ''}`}
            onClick={() => handleNavigationChange(4)}
          >
            <div className="bottom-nav-icon">
              <Icon icon="solar:users-group-rounded-bold" width="28" height="28" />
            </div>
            <span className="bottom-nav-label">Контакты</span>
          </button>
        )}
        
        {!isChannel && (
          <button 
            className={`bottom-nav-item ${activeTab === 5 ? 'active' : ''}`}
            onClick={() => handleNavigationChange(5)}
          >
            <div className="bottom-nav-icon">
              <Icon icon="solar:lock-bold" width="28" height="28" />
            </div>
            <span className="bottom-nav-label">Безопасность</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsBottomNavigation; 