import React, { memo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Icon } from '@iconify/react';
import './SidebarFooter.css';


const areEqual = (prevProps, nextProps) => {
  return prevProps.primaryColor === nextProps.primaryColor;
};

const SidebarFooter = ({ primaryColor }) => {
  const { t } = useLanguage();

  return (
    <div className='sidebar-v2-footer'>
      <div className='footer-v2-content'>

        <div className='contact-v2-info'>
          <div className='footer-v2-text'>
            {t('sidebar.footer.copyright')}
          </div>
          <div className='footer-v2-text'>
            {t('sidebar.footer.email')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(SidebarFooter, areEqual);
