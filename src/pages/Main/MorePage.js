import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { Icon } from '@iconify/react';
import { VerificationBadge } from '../../UIKIT';
import './MorePage.css';

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num < 1000) return num.toString();
  
  const units = ['', 'k', 'M', 'B'];
  const unit = Math.floor((num.toFixed(0).length - 1) / 3);
  const value = (num / Math.pow(1000, unit)).toFixed(1);
  
  return `${parseFloat(value)}${units[unit]}`;
};

const MorePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userPoints, setUserPoints] = useState(0);
  const isAdmin = user?.id === 3; 
  const isChannel = user?.account_type === 'channel';
  const [isModeratorUser, setIsModeratorUser] = useState(false);
  const [lastModeratorCheck, setLastModeratorCheck] = useState(0);
  
  useEffect(() => {
    if (user) {
      checkModeratorStatus();
      fetchUserPoints();
    }
  }, [user]);

  const checkModeratorStatus = async () => {
    try {
      if (window._moderatorCheckInProgress) {

        return;
      }
      
      const now = Date.now();
      if (now - lastModeratorCheck < 15 * 60 * 1000) {

        return;
      }
      
      window._moderatorCheckInProgress = true;
      
      const response = await axios.get('/api/moderator/status');
      if (response.data && response.data.is_moderator) {
        setIsModeratorUser(true);
      } else {
        setIsModeratorUser(false);
      }
      
      setLastModeratorCheck(now);
    } catch (error) {
      console.error('Error checking moderator status:', error);
      setIsModeratorUser(false);
    } finally {
      window._moderatorCheckInProgress = false;
    }
  };
  
  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Ошибка при загрузке баллов:', error);
      setUserPoints(0);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      navigate('/login');
    }
  };

  return (
    <div className="more-page-container">
      {/* Profile Banner - Compact Header */}
      <div className="profile-banner">
        <div className="more-profile-avatar-wrapper">
          <img
            className="more-profile-avatar"
            src={user?.avatar_url || (user?.photo && `/static/uploads/avatar/${user.id}/${user.photo}`)}
            alt={user?.name}
            onError={(e) => {
              console.error(t('more_page.errors.avatar_load_error'));
              e.target.src = `/static/uploads/avatar/system/avatar.png`;
            }}
          />
        </div>
        <div>
          <h5 className="profile-name">
            {user?.name || t('more_page.default_user')}
            {user?.verification && user.verification.status > 0 && (
              <VerificationBadge 
                status={user.verification.status} 
                size="small" 
              />
            )}
          </h5>
          <p className="profile-username">
            @{user?.username || t('more_page.default_username')}
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        {/* Primary Actions */}
        <div className="primary-actions">
          <Link to="/balance" className="more-action-button balance-button">
            <Icon icon="solar:wallet-money-bold" width="18" height="18" className="start-icon" />
            <span className="number">{formatNumber(userPoints)}</span>
            <span className="unit">{t('more_page.points')}</span>
          </Link>
          
          <Link to="/badge-shop" className="more-action-button">
            <Icon icon="solar:shop-bold" width="18" height="18" className="start-icon" />
            {t('more_page.shop')}
          </Link>
          
          <Link to="/settings" className="more-action-button">
            <Icon icon="solar:settings-bold" width="18" height="18" className="start-icon" />
            {t('more_page.settings')}
          </Link>
        </div>
      </div>

      {/* Social & Content */}
      <div className="menu-section">
        <h6 className="section-title">{t('more_page.sections.social.title')}</h6>
        <ul className="menu-list">

          <li>
            <Link to={user && user.username ? `/friends/${user.username}` : '/friends'} className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:users-group-rounded-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.social.subscriptions')}</div>
              </div>
            </Link>
          </li>
          
          <li>
            <Link to="/channels" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:play-stream-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.social.channels')}</div>
              </div>
            </Link>
          </li>
          
          <li>
            <Link to="/leaderboard" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:chart-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.social.rating')}</div>
              </div>
            </Link>
          </li>
        </ul>
      </div>

      {/* Entertainment & Features */}
      <div className="menu-section">
        <h6 className="section-title">{t('more_page.sections.entertainment.title')}</h6>
        <ul className="menu-list">
          <li>
            <Link to="/economic/packs" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:box-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">Пачки</div>
              </div>
            </Link>
          </li>
          
          <li>
            <Link to="/economic/inventory" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:bag-4-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">Мой Инвентарь</div>
              </div>
            </Link>
          </li>
          
          <li>
            <Link to="/marketplace" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:shop-2-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">Маркетплейс Айтемов</div>
              </div>
            </Link>
          </li>
          
          {!isChannel && (
            <li>
              <Link to="/inform/sticker" className="menu-list-item">
                <div className="menu-item-icon">
                  <Icon icon="solar:sticker-smile-circle-2-bold" width="20" height="20" />
                </div>
                <div className="menu-list-item-text">
                  <div className="menu-list-item-primary">Управление стикерами</div>
                </div>
              </Link>
            </li>
          )}
          
          <li>
            <Link to="/grant" className="highlighted-menu-item">
              <div className="menu-item-icon">
                <Icon icon="solar:star-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">Гранты каналам</div>
              </div>
            </Link>
          </li>

          <li>
            <Link to="/referral" className="highlighted-menu-item">
              <div className="menu-item-icon">
                <Icon icon="solar:users-group-two-rounded-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">Реферальная программа</div>
              </div>
            </Link>
          </li>

          <li>
            <Link to="/minigames" className="highlighted-menu-item">
              <div className="menu-item-icon">
                <Icon icon="solar:star-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">Мини-игры</div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/username-auction" className="highlighted-menu-item">
              <div className="menu-item-icon">
                <Icon icon="solar:star-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.entertainment.username_auction')}</div>
              </div>
            </Link>
          </li>
          
          {!isChannel && (
            <li>
              <Link to="/sub-planes" className="menu-list-item">
                <div className="menu-item-icon">
                  <Icon icon="solar:star-bold" width="20" height="20" />
                </div>
                <div className="menu-list-item-text">
                  <div className="menu-list-item-primary">{t('more_page.sections.entertainment.subscription_plans')}</div>
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Admin Section */}
      {(isAdmin || isModeratorUser) && (
        <div className="menu-section">
          <h6 className="section-title">{t('more_page.sections.administration.title')}</h6>
          <ul className="menu-list">
            {isModeratorUser && (
              <li>
                <Link to="/moderator" className="highlighted-menu-item">
                  <div className="menu-item-icon">
                    <Icon icon="solar:shield-star-bold" width="20" height="20" />
                  </div>
                  <div className="menu-list-item-text">
                    <div className="menu-list-item-primary">{t('more_page.sections.administration.moderation')}</div>
                  </div>
                </Link>
              </li>
            )}

            {isAdmin && (
              <li>
                <Link to="/admin" className="menu-list-item">
                  <div className="menu-item-icon">
                    <Icon icon="solar:shield-user-bold" width="20" height="20" />
                  </div>
                  <div className="menu-list-item-text">
                    <div className="menu-list-item-primary">{t('more_page.sections.administration.admin_panel')}</div>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Platform Section */}
      <div className="menu-section">
        <h6 className="section-title">{t('more_page.sections.platform.title')}</h6>
        <ul className="menu-list">
          {!isChannel && (
            <li>
              <Link to="/bugs" className="menu-list-item">
                <div className="menu-item-icon">
                  <Icon icon="solar:bug-bold" width="20" height="20" />
                </div>
                <div className="menu-list-item-text">
                  <div className="menu-list-item-primary">{t('more_page.sections.platform.bug_reports')}</div>
                </div>
              </Link>
            </li>
          )}
          
          <li>
            <Link to="/about" target="_blank" rel="noopener noreferrer" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:info-circle-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.platform.about')}</div>
              </div>
            </Link>
          </li>
          
          <li>
            <Link to="/rules" className="menu-list-item">
              <div className="menu-item-icon">
                <Icon icon="solar:document-text-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.platform.rules')}</div>
              </div>
            </Link>
          </li>

          
          <hr className="divider" />
          
          <li>
            <button onClick={handleLogout} className="menu-list-item logout-item">
              <div className="menu-item-icon">
                <Icon icon="solar:logout-3-bold" width="20" height="20" />
              </div>
              <div className="menu-list-item-text">
                <div className="menu-list-item-primary">{t('more_page.sections.platform.logout')}</div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="footer-section">
        <span className="footer-version">
          {t('more_page.footer.version')}
        </span>
        <span className="footer-email">
          {t('more_page.footer.email')}
        </span>
      </div>
    </div>
  );
};

export default MorePage; 