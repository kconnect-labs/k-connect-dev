import React, { useContext } from 'react';
import { ThemeSettingsContext } from '../../App';
import './BottomNavigation.css';

/**
 * UIBottomNavigation - оптимизированная версия без Material UI
 * @param {Object} props
 * @param {string|number} props.value - Активная вкладка
 * @param {Function} props.onChange - Обработчик изменения вкладки
 * @param {React.ReactNode} props.children - Дочерние элементы (BottomNavigationAction)
 * @param {string} props.id - ID элемента
 * @param {Object} props.style - Дополнительные стили
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.isMobile - Рендерить только на мобильных
 */
const UIBottomNavigation = ({ 
  value, 
  onChange, 
  children, 
  id,
  style = {},
  className = '',
  isMobile
}) => {
  // UIBottomNavigation рендерится только на мобильных устройствах
  if (!isMobile) {
    return null;
  }
  
  const { themeSettings } = useContext(ThemeSettingsContext);

  // Set background color from theme settings
  const bottomNavColor = themeSettings.bottomNavColor || 'rgba(255, 255, 255, 0.95)';
  const primaryColor = themeSettings.primaryColor || '#D0BCFF';

  const containerStyles = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: bottomNavColor,
    backdropFilter: 'blur(10px)',
    ...style,
  };

  const handleTabClick = (tabValue) => {
    if (onChange) {
      onChange(null, tabValue);
    }
  };

  // Клонируем children и добавляем обработчики
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isActive: value === child.props.value,
        onClick: () => handleTabClick(child.props.value),
        primaryColor,
      });
    }
    return child;
  });

  return (
    <div 
      id={id}
      className={`bottom-navigation ${className}`}
      style={containerStyles}
    >
      <div className="bottom-navigation__container">
        {enhancedChildren}
      </div>
    </div>
  );
};

/**
 * BottomNavigationAction - оптимизированная версия без Material UI
 * @param {Object} props
 * @param {string|number} props.value - Значение вкладки
 * @param {string} props.label - Текст вкладки
 * @param {React.ReactNode} props.icon - Иконка вкладки
 * @param {boolean} props.isActive - Активна ли вкладка
 * @param {Function} props.onClick - Обработчик клика
 * @param {string} props.primaryColor - Основной цвет темы
 * @param {string} props.className - Дополнительные CSS классы
 * @param {Object} props.style - Дополнительные стили
 */
const BottomNavigationAction = ({
  value,
  label,
  icon,
  isActive = false,
  onClick,
  primaryColor = '#D0BCFF',
  className = '',
  style = {},
  ...props
}) => {
  const actionStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    padding: '6px 12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: isActive ? primaryColor : 'rgba(255, 255, 255, 0.7)',
    transition: 'color 0.2s ease',
    ...style,
  };

  return (
    <button
      className={`bottom-navigation-action ${isActive ? 'bottom-navigation-action--active' : ''} ${className}`}
      style={actionStyles}
      onClick={onClick}
      type="button"
      {...props}
    >
      {icon && (
        <div className="bottom-navigation-action__icon">
          {icon}
        </div>
      )}
      {label && (
        <span className="bottom-navigation-action__label">
          {label}
        </span>
      )}
    </button>
  );
};

export { BottomNavigationAction };
export default UIBottomNavigation; 