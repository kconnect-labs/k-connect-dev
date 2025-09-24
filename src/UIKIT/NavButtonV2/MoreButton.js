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
    'nav-button-v2',
    'more-button-v2',
    active ? 'more-button-v2--active' : '',
    rest.isSpecial ? 'more-button-v2--special' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClasses} onClick={onClick} {...rest}>
      <div className='nav-button-v2__left-content'>
        <div className='nav-button-v2__icon'>{icon}</div>
        <div className='nav-button-v2__text'>{text}</div>
      </div>
      <div className='more-button-v2__arrow'>{ArrowIcon}</div>
    </button>
  );
};

export default memo(MoreButton, areEqual);
