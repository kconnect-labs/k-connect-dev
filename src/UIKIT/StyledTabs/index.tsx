import React, { useRef, useEffect, useState } from 'react';
import './StyledTabs.css';

interface Tab {
  value: string | number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StyledTabsProps {
  value: string | number;
  onChange: (
    event: React.SyntheticEvent | null,
    newValue: string | number
  ) => void;
  tabs: Tab[];
  variant?: 'standard' | 'fullWidth';
  centered?: boolean;
  fullWidth?: boolean;
  customStyle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * StyledTabs - стилизованные табы в точном соответствии с панелью рекомендаций из MainPage
 */
const StyledTabs: React.FC<StyledTabsProps> = ({
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
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [useScrollMode, setUseScrollMode] = useState(false);

  const handleTabClick = (tabValue: string | number) => {
    if (onChange) {
      onChange(null, tabValue);
    }
  };

  // Проверяем, нужно ли использовать режим прокрутки
  useEffect(() => {
    const checkScrollMode = () => {
      if (tabsContainerRef.current) {
        const container = tabsContainerRef.current;
        const containerWidth = container.clientWidth;
        const scrollWidth = container.scrollWidth;

        // Если контент шире контейнера, включаем режим прокрутки
        setUseScrollMode(scrollWidth > containerWidth);
      }
    };

    checkScrollMode();

    // Проверяем при изменении размера окна
    const handleResize = () => {
      checkScrollMode();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs]);

  // Автоматическая прокрутка к активному табу
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current && useScrollMode) {
      const container = tabsContainerRef.current;
      const activeTab = activeTabRef.current;

      const scrollLeft =
        activeTab.offsetLeft -
        container.clientWidth / 2 +
        activeTab.clientWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [value, useScrollMode]);

  const containerStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    maxWidth: fullWidth ? 'none' : 750,
    minWidth: 320,
    margin: '0',
    ...style,
  };

  const tabsContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: useScrollMode
      ? 'flex-start'
      : centered
        ? 'center'
        : 'space-between',
    minHeight: 48,
    padding: '4px',
    overflowX: useScrollMode ? 'auto' : 'hidden',
    overflowY: 'hidden',
    scrollbarWidth: useScrollMode ? 'none' : 'auto',
    msOverflowStyle: useScrollMode ? 'none' : 'auto',
    WebkitOverflowScrolling: useScrollMode ? 'touch' : 'auto',
  };

  return (
    <div
      className={`styled-tabs-container ${customStyle ? 'styled-tabs--custom' : 'styled-tabs--default'} ${className} ${useScrollMode ? 'styled-tabs--scroll-mode' : 'styled-tabs--distribute-mode'}`}
      style={containerStyles}
      {...props}
    >
      <div
        className='styled-tabs'
        style={tabsContainerStyles}
        ref={tabsContainerRef}
      >
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = value === tab.value;

          return (
            <button
              key={`${tab.value}-${tab.label}`}
              className={`styled-tab ${isActive ? 'styled-tab--active' : ''} ${useScrollMode ? 'styled-tab--scroll-mode' : 'styled-tab--distribute-mode'}`}
              onClick={() => handleTabClick(tab.value)}
              type='button'
              ref={isActive ? activeTabRef : null}
            >
              <div className='styled-tab-content'>
                {IconComponent && <IconComponent className='styled-tab-icon' />}
                <span className='styled-tab-label'>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyledTabs;
