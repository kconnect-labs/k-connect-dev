import * as React from 'react';
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { AuthContext } from '../../../context/AuthContext';
import axios from '../../../services/axiosConfig';
import { handleImageError as safeImageError } from '../../../utils/imageUtils';
import { User, AuthContextType } from '../types';
import './UserRecommendation.css';

interface UserRecommendationProps {
  user: User;
}

const UserRecommendation: React.FC<UserRecommendationProps> = ({ user }) => {
  const { t } = useLanguage();
  const [following, setFollowing] = useState(user.is_following || false);
  const { user: currentUser } = useContext(AuthContext) as any;
  const navigate = useNavigate();

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setFollowing(!following);

      const response = await axios.post(`/api/profile/follow`, {
        followed_id: user.id,
      });

      if (response.data && response.data.success) {
        setFollowing(response.data.is_following);
      }
    } catch (error) {
      setFollowing(following);
      console.error('Error toggling follow:', error);
    }
  };

  const handleCardClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const getAvatarSrc = (): string => {
    if (!user?.photo) return '/static/uploads/system/avatar.png';

    if (user.photo.startsWith('/') || user.photo.startsWith('http')) {
      return user.photo;
    }

    return `/static/uploads/avatar/${user.id}/${user.photo}`;
  };

  const isChannelAccount =
    currentUser && currentUser.account_type === 'channel';

  return (
    <div className='user-recommendation' onClick={handleCardClick}>
      <div className='user-recommendation-content'>
        <div className='user-info'>
          <img
            src={getAvatarSrc()}
            alt={user.name || user.username}
            className='user-avatar-large'
            onError={(e) => safeImageError(e as any)}
          />
          <div className='user-details'>
            <div className='user-name'>{user.name || user.username}</div>
            <div className='user-username'>
              <span className='username-text'>@{user.username}</span>
              {user.is_verified && <span className='verified-badge'>✓</span>}
            </div>
          </div>

          {!isChannelAccount && (
            <button
              className={`follow-button ${following ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {following
                ? t('main_page.follow.unfollow')
                : t('main_page.follow.follow')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRecommendation;
