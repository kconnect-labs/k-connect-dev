import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ThemeSettingsContext } from '../App';
import './BottomNavigation.css';

interface BadgeShopBottomNavigationProps {
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent | null, newValue: number) => void;
  isMobile: boolean;
}

const BadgeShopBottomNavigation: React.FC<BadgeShopBottomNavigationProps> = ({ 
  tabValue, 
  onTabChange, 
  isMobile 
}) => {
  // BadgeShopBottomNavigation рендерится только на мобильных устройствах
  if (!isMobile) {
    return null;
  }
  
  const navigate = useNavigate();
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
          className={`bottom-nav-item ${tabValue === -1 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(-1)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:arrow-left-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Назад</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${tabValue === 0 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(0)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:star-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Популярные</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${tabValue === 1 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(1)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:user-circle-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Мои</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${tabValue === 2 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(2)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:cart-large-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Корзина</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${tabValue === 3 ? 'active' : ''}`}
          onClick={() => handleNavigationChange(3)}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:tag-price-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Продажа</span>
        </button>
      </div>
    </div>
  );
};

export default BadgeShopBottomNavigation; 