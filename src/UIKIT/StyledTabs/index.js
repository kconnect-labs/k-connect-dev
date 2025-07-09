import React from 'react';
import './StyledTabs.css';

/**
 * StyledTabs - оптимизированная версия без Material UI
 * @param {Object} props
 * @param {string|number} props.value - Активная вкладка
 * @param {Function} props.onChange - Обработчик изменения вкладки
 * @param {Array} props.tabs - Массив вкладок [{value, label, icon?}]
 * @param {string} props.variant - 'standard' | 'fullWidth'
 * @param {boolean} props.centered - Центрировать вкладки
 * @param {boolean} props.fullWidth - Полная ширина контейнера
 * @param {boolean} props.customStyle - Использовать кастомный стиль
 * @param {string} props.className - Дополнительные CSS классы
 * @param {Object} props.style - Дополнительные стили
 */
const StyledTabs = ({ 
  value, 
  onChange, 
  tabs, 
  variant = 'standard',
  centered = false,
  fullWidth = false,
  customStyle = false,
  className = '',
  style = {},
  ...props 
}) => {
  const handleTabClick = (tabValue) => {
    if (onChange) {
      onChange(null, tabValue);
    }
  };

  const containerStyles = {
    width: fullWidth ? '100%' : 'auto',
    maxWidth: fullWidth ? 'none' : 750,
    minWidth: 320,
    margin: '0 auto 8px auto',
    ...style,
  };

  const tabsContainerStyles = {
    display: 'flex',
    justifyContent: centered ? 'center' : 'flex-start',
    minHeight: 48,
  };

  return (
    <div 
      className={`styled-tabs-container ${customStyle ? 'styled-tabs--custom' : 'styled-tabs--default'} ${className}`}
      style={containerStyles}
        {...props}
      >
      <div className="styled-tabs" style={tabsContainerStyles}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = value === tab.value;
          
          return (
            <button
              key={`${tab.value}-${tab.label}`}
              className={`styled-tab ${isActive ? 'styled-tab--active' : ''}`}
              onClick={() => handleTabClick(tab.value)}
              type="button"
            >
              <div className="styled-tab-content">
                {IconComponent && (
                  <IconComponent className="styled-tab-icon" />
                )}
                <span className="styled-tab-label">{tab.label}</span>
              </div>
              {isActive && <div className="styled-tab-indicator" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyledTabs; 