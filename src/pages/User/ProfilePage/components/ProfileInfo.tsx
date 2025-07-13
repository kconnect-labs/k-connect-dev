import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { useLanguage } from '../../../../context/LanguageContext';
import { formatDate } from '../../../../utils/dateUtils';
import { getLighterColor } from '../utils/colorUtils';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkIcon from '@mui/icons-material/Link';
import CakeIcon from '@mui/icons-material/Cake';
import TodayIcon from '@mui/icons-material/Today';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import DiamondIcon from '@mui/icons-material/Diamond';
import StarIcon from '@mui/icons-material/Star';
import styles from './ProfileInfo.module.css';
import { AutoGraph } from '@mui/icons-material';

// Type definitions based on server response
interface Achievement {
  bage: string;
  color_upgrade: string | null;
  image_path: string;
  upgrade: string | null;
}

interface ConnectInfo {
  connection_date: string;
  days: number;
  is_mutual: boolean;
  status: string;
  type: string;
  username: string;
}

interface EquippedItem {
  background_id: number;
  background_url: string;
  gifted_by_user_id: number | null;
  id: number;
  image_url: string;
  is_equipped: boolean;
  item_name: string;
  item_type: string;
  obtained_at: string;
  pack_id: number;
  pack_name: string;
  rarity: string;
  upgrade_level: number;
  upgradeable: boolean;
  user_id: number;
}

interface Social {
  link: string;
  name: string;
  title?: string;
  url?: string;
  color?: string;
  icon?: string;
}

interface Subscription {
  active: boolean;
  expires_at: string;
  subscription_date: string;
  total_duration_months: number;
  type: 'basic' | 'premium' | 'ultimate' | 'pick-me' | 'channel';
}

interface PurchasedUsername {
  id: number;
  is_active: boolean;
  price_paid: number;
  purchase_date: string;
  username: string;
}

interface User {
  about: string;
  account_type: string;
  avatar_url: string;
  ban: any | null;
  banner_url: string | null;
  cover_photo: string | null;
  element_connected: boolean;
  element_id: string;
  followers_count: number;
  following_count: number;
  friends_count: number;
  id: number;
  interests: string;
  main_account_id: number | null;
  name: string;
  photo: string;
  photos_count: number;
  posts_count: number;
  profile_background_url: string;
  profile_id: number;
  purchased_usernames: PurchasedUsername[];
  registration_date: string;
  scam: number;
  status_color: string;
  status_text: string;
  total_likes: number;
  username: string;
  verification_status: number;
  location?: string;
  website?: string;
  birthday?: string;
  connect_info?: ConnectInfo[];
  subscription?: Subscription;
}

interface Verification {
  date: string;
  status: number;
}

interface ProfileData {
  achievement: Achievement;
  ban: any | null;
  connect_info: ConnectInfo[];
  current_user_is_moderator: boolean;
  equipped_items: EquippedItem[];
  followers_count: number;
  following_count: number;
  friends_count: number;
  is_following: boolean;
  is_friend: boolean;
  notifications_enabled: boolean;
  posts_count: number;
  socials: Social[];
  subscription: Subscription;
  user: User;
  verification: Verification;
}

interface Stats {
  avg_likes_per_post: number;
  days_active: number;
  posts_count: number;
  total_likes: number;
}

interface ProfileInfoProps {
  user: User;
  socials: Social[];
  onUsernameClick: (event: React.MouseEvent, username: string) => void;
  stats: Stats;
}


// Компонент для отображения информации
const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <div className={styles.infoItem}>
    {icon}
    <div className={styles.infoContent}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{children}</div>
    </div>
  </div>
);

// Компонент для социальных сетей
const SocialButton: React.FC<{
  social: Social;
  index: number;
}> = ({ social, index }) => {
  const getSocialIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('instagram')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    } else if (lowerName.includes('facebook')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5 1.583-5 4.615v3.385z"/>
        </svg>
      );
    } else if (lowerName.includes('twitter') || lowerName.includes('x')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      );
    } else if (lowerName.includes('vk')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.96 6.72 5.786 9.77 2.756 2.975 5.48 2.708 7.376 2.708z"/>
        </svg>
      );
    } else if (lowerName.includes('youtube')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
        </svg>
      );
    } else if (lowerName.includes('telegram')) {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19l-9.5 5.97-4.1-1.34c-.88-.28-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z"/>
        </svg>
      );
    } else if (lowerName.includes('element')) {
      return (
        <svg viewBox="0 0 12.7 12.7" fill="currentColor">
          <path d="M 4.9717204,2.3834823 A 5.0230292,5.0230292 0 0 0 0.59994682,7.3615548 5.0230292,5.0230292 0 0 0 5.6228197,12.384429 5.0230292,5.0230292 0 0 0 10.645693,7.3615548 5.0230292,5.0230292 0 0 0 10.630013,6.9628311 3.8648402,3.8648402 0 0 1 8.6139939,7.532543 3.8648402,3.8648402 0 0 1 4.7492118,3.6677608 3.8648402,3.8648402 0 0 1 4.9717204,2.3834823 Z" />
          <circle cx="8.6142359" cy="3.6677198" r="3.5209935" />
        </svg>
      );
    } else {
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z"/>
        </svg>
      );
    }
  };

  return (
    <Tooltip title={social.title || social.name} arrow>
      <IconButton 
        component="a" 
        href={social.url || social.link} 
        target="_blank" 
        rel="noopener noreferrer"
        size="small"
        className={styles.socialButton}
        style={{ color: social.color || '#1976d2' }}
      >
        {social.icon ? (
          <img src={social.icon} alt={social.title || social.name} className={styles.socialIcon} />
        ) : (
          <div className={styles.socialIconFallback}>
            {getSocialIcon(social.name)}
          </div>
        )}
      </IconButton>
    </Tooltip>
  );
};

const ProfileInfo: React.FC<ProfileInfoProps> = ({ 
  user, 
  socials,
  onUsernameClick,
  stats
}) => {
  const { t } = useLanguage();

  
  console.log('ProfileInfo socials:', socials);
  console.log('ProfileInfo user:', user);

  const getSubscriptionContainerClass = () => {
    if (!user?.subscription) return styles.subscriptionContainerDefault;
    switch (user.subscription.type) {
      case 'premium': return styles.subscriptionContainerPremium;
      case 'ultimate': return styles.subscriptionContainerUltimate;
      case 'pick-me': return styles.subscriptionContainerPickMe;
      case 'channel': return styles.subscriptionContainerChannel;
      default: return styles.subscriptionContainerDefault;
    }
  };

  const getSubscriptionIconClass = () => {
    if (!user?.subscription) return styles.subscriptionIconDefault;
    switch (user.subscription.type) {
      case 'premium': return styles.subscriptionIconPremium;
      case 'ultimate': return styles.subscriptionIconUltimate;
      case 'pick-me': return styles.subscriptionIconPickMe;
      case 'channel': return styles.subscriptionIconChannel;
      default: return styles.subscriptionIconDefault;
    }
  };

  const getSubscriptionTitleClass = () => {
    if (!user?.subscription) return '';
    switch (user.subscription.type) {
      case 'premium': return styles.subscriptionTitlePremium;
      case 'ultimate': return styles.subscriptionTitleUltimate;
      case 'pick-me': return styles.subscriptionTitlePickMe;
      case 'channel': return styles.subscriptionTitleChannel;
      default: return '';
    }
  };

  const getSubscriptionDurationClass = () => {
    if (!user?.subscription) return '';
    switch (user.subscription.type) {
      case 'premium': return styles.subscriptionDurationPremium;
      case 'ultimate': return styles.subscriptionDurationUltimate;
      case 'pick-me': return styles.subscriptionDurationPickMe;
      case 'channel': return styles.subscriptionDurationChannel;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Основная информация */}
        <div className={styles.gridFullWidth}>
          {/* Коннект */}
          {user?.connect_info && user.connect_info.length > 0 && (
            <div className={styles.connectInfo}>
              <div className={styles.connectInfoContent}>
                <RouterLink 
                  to={`/profile/${user.username}`}
                  className={styles.connectLink}
                >
                  @{user.username}
                </RouterLink>
                <span className={styles.connectSeparator}>•</span>
                <span>{user.connect_info[0].days} {t('profile.days')}</span>
                <span className={styles.connectSeparator}>•</span>
                <RouterLink 
                  to={`/profile/${user.connect_info[0].username}`}
                  className={styles.connectLink}
                >
                  @{user.connect_info[0].username}
                </RouterLink>
              </div>
            </div>
          )}

          {/* Остальная информация */}
          {user?.about && (
            <div 
              className={styles.about}
              style={{
                color: user?.status_color ? getLighterColor(user.status_color) : 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {user.about}
            </div>
          )}
        </div>
        
        {user?.location && (
          <InfoItem icon={<LocationOnIcon />} label={t('profile.location')}>
            {user.location}
          </InfoItem>
        )}
        
        {user?.website && (
          <InfoItem icon={<LinkIcon />} label={t('profile.website')}>
            <a 
              href={user.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.infoLink}
            >
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          </InfoItem>
        )}
        
        {user?.birthday && (
          <InfoItem icon={<CakeIcon />} label={t('profile.birthday')}>
            {formatDate(user.birthday)}
          </InfoItem>
        )}
        
        <InfoItem icon={<TodayIcon />} label={t('profile.registration_date')}>
          {user?.registration_date ? new Date(user.registration_date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : t('profile.not_available')}
        </InfoItem>
        
        {user?.purchased_usernames && user.purchased_usernames.length > 0 && (
          <div className={styles.gridFullWidth}>
            <InfoItem icon={<AlternateEmailIcon />} label={t('profile.usernames')}>
              <div className={styles.usernamesContainer}>
                {user.purchased_usernames.map((usernameObj, idx) => (
                  <button
                    key={idx}
                    className={`${styles.usernameChip} ${usernameObj.is_active ? styles.usernameChipActive : ''}`}
                    onClick={(e) => onUsernameClick(e, usernameObj.username)}
                  >
                    {usernameObj.username}
                  </button>
                ))}
              </div>
            </InfoItem>
          </div>
        )}

        {stats && (
          <div className={styles.gridFullWidth}>
            <InfoItem icon={<AutoGraph />} label={t('profile.stats')}>
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <span>{t('profile.avg_likes_per_post')}:</span>
                  <span>{stats.avg_likes_per_post}</span>
                </div>
                <div className={styles.statItem}>
                  <span>{t('profile.days_active')}:</span>
                  <span>{stats.days_active}</span>
                </div>
                <div className={styles.statItem}>
                  <span>{t('profile.posts_count')}:</span>
                  <span>{stats.posts_count}</span>
                </div>
                <div className={styles.statItem}>
                  <span>{t('profile.total_likes')}:</span>
                  <span>{stats.total_likes}</span>
                </div>
              </div>
            </InfoItem>
          </div>
            
        )
          }
        

        {/* Социальные сети */}
        {socials && socials.length > 0 && (
          <div className={styles.gridFullWidth}>
            <InfoItem icon={<div />} label={t('profile.socials')}>
              <div className={styles.socialsContainer}>
                {socials.map((social, index) => (
                  <SocialButton key={index} social={social} index={index} />
                ))}
              </div>
            </InfoItem>
          </div>
        )}

        {/* Секция подписки */}
        {user?.subscription && (
          <div className={styles.gridFullWidth}>
            <div className={`${styles.subscriptionContainer} ${getSubscriptionContainerClass()}`}>
              <div className={`${styles.subscriptionIcon} ${getSubscriptionIconClass()}`}>
                {/* Показываем значок длительности подписки, если есть total_duration_months */}
                {user.subscription.total_duration_months > 0 ? (
                  <Tooltip title={`${t('profile.subscription.subscriber')} • ${user.subscription.total_duration_months} ${t('profile.subscription.months')}`} arrow>
                    <img 
                      src={`/static/subs/${user.subscription.total_duration_months >= 6 ? 'diamond' : 
                            user.subscription.total_duration_months >= 3 ? 'gold' : 
                            user.subscription.total_duration_months >= 2 ? 'silver' : 'bronze'}.svg`}
                      alt="Подписка"
                      className={styles.subscriptionIconImage}
                    />
                  </Tooltip>
                ) : (
                  /* Обычные иконки для подписок без длительности */
                  user.subscription.type === 'channel' ? (
                    <StarIcon />
                  ) : (
                    <DiamondIcon />
                  )
                )}
              </div>
              
              <div className={styles.subscriptionContent}>
                <div className={styles.subscriptionHeader}>
                  <div className={`${styles.subscriptionTitle} ${getSubscriptionTitleClass()}`}>
                    {user.subscription.type === 'channel' ? t('profile.subscription.channel') :
                     user.subscription.type === 'premium' ? t('balance.subscription_types.premium') :
                     user.subscription.type === 'ultimate' ? t('balance.subscription_types.ultimate') :
                     user.subscription.type === 'pick-me' ? t('profile.subscription.pick_me') :
                     t('balance.subscription_types.basic')}
                  </div>
                </div>
                
                <div className={styles.subscriptionExpires}>
                  {user.subscription.expires_at ? (
                    <>
                      {t('profile.subscription.expires')}: {new Date(user.subscription.expires_at).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </>
                  ) : (
                    t('profile.subscription.active')
                  )}
                </div>
                
                {user.subscription.total_duration_months > 0 && (
                  <div className={`${styles.subscriptionDuration} ${getSubscriptionDurationClass()}`}>
                    {t('profile.subscription.total_duration')}: {user.subscription.total_duration_months} {t('profile.subscription.months')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileInfo; 