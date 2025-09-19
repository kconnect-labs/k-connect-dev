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
  // Используем CSS переменные для цветов, если они определены, иначе fallback
  const themeTextPrimary = 'var(--theme-text-primary, #fff)';
  const themeTextSecondary = 'var(--theme-text-secondary, #aaa)';
  const primary = 'var(--primary, #D0BCFF)';

  const actionsStyles = {
    '--primary-color': primaryColor,
    color: 'var(--theme-text-primary, #fff)',
  };

  return (
    <div className='header-actions' style={actionsStyles}>
      {/* Кнопка кошелька рендерится только на PC */}
      {user && !isMobile && (
        <div className='action-tooltip' title={t('header.tooltips.wallet')}>
          <button
            className='action-button'
            onClick={() => navigate('/balance')}
            style={{ color: themeTextPrimary }}
          >
            <Icon
              icon='tabler:coins'
              width='22'
              height='22'
              color={themeTextPrimary}
            />
          </button>
        </div>
      )}

      {/* Кнопка поиска рендерится везде */}
      <button
        className={`action-button ${showSearch ? 'action-button--active' : ''}`}
        onClick={toggleSearch}
        style={{ color: showSearch ? primary : themeTextPrimary }}
      >
        <Icon
          icon='tabler:search'
          width='22'
          height='22'
          color={showSearch ? primary : themeTextPrimary}
        />
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
        style={{ color: themeTextPrimary }}
      >
        {user ? (
          <img
            className='profile-avatar'
            src={
              user.avatar_url ||
              (user.photo
                ? `https://s3.k-connect.ru/static/uploads/avatar/${user.id}/${user.photo}`
                : 'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png')
            }
            alt={user.name || user.username}
          />
        ) : (
          <Icon
            icon='solar:user-bold'
            width='24'
            height='24'
            color={themeTextPrimary}
          />
        )}
      </button>
    </div>
  );
};

export default HeaderActions;
