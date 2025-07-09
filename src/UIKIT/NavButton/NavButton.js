import React, { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './NavButton.css';

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.active === nextProps.active &&
    prevProps.path === nextProps.path &&
    prevProps.text === nextProps.text &&
    prevProps.isSpecial === nextProps.isSpecial &&
    prevProps.icon === nextProps.icon
  );
};

const NavButton = ({ 
  text, 
  icon, 
  path, 
  active = false, 
  isSpecial = false, 
  themeColor, 
  onClick,
  endIcon,
  endIconActive,
  component,
  nested = false,
  target,
  rel,
  ...rest 
}) => {
  const buttonClasses = [
    'nav-button',
    active ? 'nav-button--active' : '',
    isSpecial ? 'nav-button--special' : '',
    nested ? 'nav-button--nested' : ''
  ].filter(Boolean).join(' ');

  const componentProps = path ? 
    (path.startsWith('http') ? {
      href: path,
      target,
      rel
    } : {
      to: path,
      target,
      rel
    }) : {
      onClick
    };

  const Tag = path ? 
    (path.startsWith('http') ? 'a' : RouterLink) : 
    'button';

  return (
    <Tag
      className={buttonClasses}
      {...componentProps}
      {...rest}
    >
      {/* Если есть endIcon и нужно отображать его не в конце кнопки */}
      {endIcon && !endIconActive ? (
        <div className="nav-button__content">
          <div className="nav-button__left-content">
            {icon && (
              <div className="nav-button__icon">
                {icon}
              </div>
            )}
            <div className="nav-button__text">
              {text}
            </div>
          </div>
          {endIcon}
        </div>
      ) : (
        <>
          {icon && (
            <div className="nav-button__icon">
              {icon}
            </div>
          )}
          <div className="nav-button__text">
            {text}
          </div>
          {endIcon && endIconActive}
        </>
      )}
    </Tag>
  );
};

export default memo(NavButton, areEqual); 