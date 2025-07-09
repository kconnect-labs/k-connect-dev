import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoSVG } from '../../../assets/Logo.svg';
import './HeaderLogo.css';

const HeaderLogo = ({ isMobile, t }) => {
  return (
    <div className="header-logo">
      <Link to="/" className="logo-link">
        <LogoSVG className="logo-svg" />
        {!isMobile && (
          <div className="logo-text">
            <span className="logo-text-content">
              {t('header.logo.text')}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default HeaderLogo; 