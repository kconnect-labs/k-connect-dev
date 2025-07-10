import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ThemeSettingsContext } from '../App';
import './BottomNavigation.css';

const ClickerBottomNavigation = ({ activeSection, onSectionChange, isMobile }) => {
  // ClickerBottomNavigation рендерится только на мобильных устройствах
  if (!isMobile) {
    return null;
  }
  
  const navigate = useNavigate();
  const { themeSettings } = useContext(ThemeSettingsContext);

  const handleNavigationChange = (newValue) => {
    if (newValue === 'back') {
      navigate(-1); 
    } else {
      onSectionChange(newValue);
    }
  };

  return (
    <div className="bottom-navigation">
      <div className="bottom-nav-container">
        <button 
          className={`bottom-nav-item ${activeSection === 'back' ? 'active' : ''}`}
          onClick={() => handleNavigationChange('back')}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:arrow-left-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Назад</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'click' ? 'active' : ''}`}
          onClick={() => handleNavigationChange('click')}
        >
          <div className="bottom-nav-icon">
            <Icon icon="material-symbols:touch-app" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Кликер</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'shop' ? 'active' : ''}`}
          onClick={() => handleNavigationChange('shop')}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:shop-2-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Магазин</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'stats' ? 'active' : ''}`}
          onClick={() => handleNavigationChange('stats')}
        >
          <div className="bottom-nav-icon">
            <Icon icon="solar:chart-2-bold" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Статистика</span>
        </button>
        
        <button 
          className={`bottom-nav-item ${activeSection === 'leaderboard' ? 'active' : ''}`}
          onClick={() => handleNavigationChange('leaderboard')}
        >
          <div className="bottom-nav-icon">
            <Icon icon="material-symbols:leaderboard" width="28" height="28" />
          </div>
          <span className="bottom-nav-label">Лидеры</span>
        </button>
      </div>
    </div>
  );
};

export default ClickerBottomNavigation; 