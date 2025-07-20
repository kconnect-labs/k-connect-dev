import React from 'react';
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
  const handleTabClick = (tabValue: string | number) => {
    if (onChange) {
      onChange(null, tabValue);
    }
  };

  const containerStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    maxWidth: fullWidth ? 'none' : 750,
    minWidth: 320,
    margin: '0',
    ...style,
  };

  const tabsContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: centered ? 'center' : 'space-between',
    minHeight: 48,
    padding: '4px',
  };

  return (
    <div
      className={`styled-tabs-container ${customStyle ? 'styled-tabs--custom' : 'styled-tabs--default'} ${className}`}
      style={containerStyles}
      {...props}
    >
      <div className='styled-tabs' style={tabsContainerStyles}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          const isActive = value === tab.value;

          return (
            <button
              key={`${tab.value}-${tab.label}`}
              className={`styled-tab ${isActive ? 'styled-tab--active' : ''}`}
              onClick={() => handleTabClick(tab.value)}
              type='button'
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
