import React, { memo } from 'react';
import NavButton from './NavButton';

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.active === nextProps.active &&
    prevProps.text === nextProps.text &&
    prevProps.onClick === nextProps.onClick
  );
};

const MoreButton = ({
  text,
  icon,
  active = false,
  themeColor,
  onClick,
  arrowIcon,
  arrowUpIcon,
  arrowDownIcon,
  ...rest
}) => {
  const ArrowIcon = active
    ? arrowUpIcon || arrowIcon
    : arrowDownIcon || arrowIcon;

  const buttonClasses = [
    'nav-button',
    'more-button',
    active ? 'more-button--active' : '',
    rest.isSpecial ? 'more-button--special' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} onClick={onClick} {...rest}>
      <div className='nav-button__left-content'>
        <div className='nav-button__icon'>{icon}</div>
        <div className='nav-button__text'>{text}</div>
      </div>
      <div className='more-button__arrow'>{ArrowIcon}</div>
    </button>
  );
};

export default memo(MoreButton, areEqual);
