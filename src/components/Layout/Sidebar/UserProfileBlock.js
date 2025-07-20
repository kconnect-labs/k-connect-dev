import React, { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import './UserProfileBlock.css';

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.user?.name === nextProps.user?.name &&
    prevProps.user?.username === nextProps.user?.username &&
    prevProps.user?.photo === nextProps.user?.photo &&
    prevProps.primaryColor === nextProps.primaryColor
  );
};

const UserProfileBlock = ({ user }) => {
  const { t } = useLanguage();
  if (!user) return null;

  return (
    <RouterLink
      className='user-profile-wrapper'
      to={`/profile/${user?.username || user?.id}`}
    >
      <img
        className='SIDEBAR-user-avatar'
        src={
          user?.photo
            ? user.photo.startsWith('/')
              ? user.photo
              : `/static/uploads/avatar/${user.id}/${user.photo}`
            : undefined
        }
        alt={user?.name || t('sidebar.profile.default_name')}
        onError={e => {
          console.error(`Failed to load avatar for ${user?.username}`);
          e.target.onerror = null;
          e.target.src = `/static/uploads/avatar/system/avatar.png`;
        }}
      />
      <div className='user-info-container'>
        <div className='user-name'>
          {user?.name || t('sidebar.profile.default_name')}
        </div>
        <div className='user-name-tag'>
          @{user?.username || t('sidebar.profile.default_username')}
        </div>
      </div>
    </RouterLink>
  );
};

export default memo(UserProfileBlock, areEqual);
