import React from 'react';
import { Icon } from '@iconify/react';
import './HeaderActions.css';

const HeaderActions = ({
  user,
  isMobile,
  t,
  primaryColor = '#D0BCFF',
  navigate,
  toggleSearch,
  showSearch,
  handleProfileMenuOpen,
  NotificationList,
  handleNewNotification,
  handleNotificationRead,
}) => {
  const actionsStyles = {
    '--primary-color': primaryColor,
  };

  return (
    <div className='header-actions' style={actionsStyles}>
      {/* Кнопка кошелька рендерится только на PC */}
      {user && !isMobile && (
        <div className='action-tooltip' title={t('header.tooltips.wallet')}>
          <button
            className='action-button'
            onClick={() => navigate('/balance')}
          >
            <Icon icon='tabler:coins' width='22' height='22' />
          </button>
        </div>
      )}

      {/* Кнопка поиска рендерится везде */}
      <button
        className={`action-button ${showSearch ? 'action-button--active' : ''}`}
        onClick={toggleSearch}
      >
        <Icon icon='tabler:search' width='22' height='22' />
      </button>

      {/* Уведомления рендерятся везде */}
      {user && (
        <div className='notification-container'>
          <NotificationList 
            onNewNotification={handleNewNotification}
            onNotificationRead={handleNotificationRead}
          />
        </div>
      )}

      {/* Кнопка профиля рендерится везде */}
      <button
        className='action-button action-button--profile'
        aria-label='account'
        aria-haspopup='true'
        onClick={handleProfileMenuOpen}
      >
        {user ? (
          <img
            className='profile-avatar'
            src={
              user.photo
                ? `/static/uploads/avatar/${user.id}/${user.photo}`
                : '/static/uploads/avatar/system/avatar.png'
            }
            alt={user.name || user.username}
          />
        ) : (
          <Icon icon='solar:user-bold' width='24' height='24' />
        )}
      </button>
    </div>
  );
};

export default HeaderActions;
