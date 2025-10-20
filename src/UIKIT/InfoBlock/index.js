import React from 'react';
import './InfoBlock.css';

// Utility functions for gradient effects
const getGradientEffects = (styleVariant = 'default') => {
  switch (styleVariant) {
    case 'dark':
      return {
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
      };
    default:
      return {
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
      };
  }
};

const getGradientBorder = (styleVariant = 'default') => {
  switch (styleVariant) {
    case 'dark':
      return {
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
      };
    default:
      return {
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
      };
  }
};

/**
 * InfoBlock component for displaying information with gradient effects
 * @param {Object} props
 * @param {string} props.title - Title of the info block
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.children - Optional children content
 * @param {string} props.styleVariant - 'default' | 'dark' - Visual variant of the block
 * @param {Object} props.style - Additional styles for the container
 * @param {Object} props.titleStyle - Additional styles for the title
 * @param {Object} props.descriptionStyle - Additional styles for the description
 * @param {boolean} props.customStyle - Whether to use custom style
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.useTheme - Whether to use theme system (default: true)
 */
const InfoBlock = ({
  title,
  description,
  children,
  styleVariant = 'default',
  style,
  titleStyle,
  descriptionStyle,
  customStyle = false,
  className = '',
  useTheme = true,
  ...props
}) => {
  const containerStyles = customStyle
    ? {
        width: '100%',
        margin: '0 auto 8px auto',
        background: 'var(--theme-background, rgba(255,255,255,0.03))',
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        color: 'inherit',
        textAlign: 'left',
        padding: 14,
        borderRadius: 16,
        ...style,
      }
    : useTheme
    ? {
        width: '100%',
        margin: '0 auto 8px auto',
        background: 'var(--theme-background, rgba(255,255,255,0.03))',
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        color: 'var(--theme-text-primary, inherit)',
        textAlign: 'left',
        padding: 14,
        borderRadius: 16,
        ...style,
      }
    : {
        width: '100%',
        margin: '0 auto 8px auto',
        ...getGradientBorder(styleVariant),
        background:
          styleVariant === 'dark'
            ? 'rgba(26,26,26, 0.03)'
            : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        color: styleVariant === 'dark' ? 'white' : 'inherit',
        textAlign: 'left',
        padding: 14,
        borderRadius: 16,
        ...getGradientEffects(styleVariant),
        ...style,
      };

  const titleStyles = {
    fontWeight: 700,
    margin: 0,
    color: useTheme 
      ? 'var(--theme-text-primary, inherit)' 
      : styleVariant === 'dark' ? 'white' : 'inherit',
    marginBottom: 0,
    fontSize: '1.5rem',
    lineHeight: 1.2,
    ...titleStyle,
  };

  const descriptionStyles = {
    color: useTheme
      ? 'var(--theme-text-secondary, rgba(0,0,0,0.7))'
      : styleVariant === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    marginTop: 8,
    ...descriptionStyle,
  };

  // Формируем классы для поддержки тем
  const themeClass = useTheme ? 'theme-aware' : '';
  const blockClasses = `info-block info-block--${styleVariant} ${themeClass} ${className}`.trim();

  return (
    <div
      className={blockClasses}
      style={containerStyles}
      {...props}
    >
      {title && (
        <div className='info-block__title' style={titleStyles}>
          {title}
        </div>
      )}
      {description && (
        <div className='info-block__description' style={descriptionStyles}>
          {description}
        </div>
      )}
      {children}
    </div>
  );
};

export default InfoBlock;
