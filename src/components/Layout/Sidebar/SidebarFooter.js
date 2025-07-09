import React, { memo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Icon } from '@iconify/react';
import './SidebarFooter.css';

const areEqual = (prevProps, nextProps) => {
  return prevProps.primaryColor === nextProps.primaryColor;
};

const SidebarFooter = ({ primaryColor }) => {
  const { t } = useLanguage();
  
  const footerStyles = {
    '--primary-color': primaryColor || '#D0BCFF',
  };
  
  return (
    <div className="sidebar-footer" style={footerStyles}>
      <div className="footer-content">
        <div className="footer-title">
          {t('sidebar.footer.version')}
        </div>
        
        <div className="version-chip">
          <Icon icon="solar:star-bold" width="12" height="12" />
          <span>v2.9</span>
        </div>
        
        <div className="contact-info">
          <div className="footer-text">
            {t('sidebar.footer.copyright')}
          </div>
          <div className="footer-text">
            {t('sidebar.footer.email')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SidebarFooter, areEqual); 