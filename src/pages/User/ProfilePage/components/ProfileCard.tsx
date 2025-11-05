import React, { useState, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import VerificationBadge from '../../../../UIKIT/VerificationBadge';
import Badge from '../../../../UIKIT/Badge';

// Типизация для Badge компонента
interface BadgeProps {
  achievement: any;
  size?: string;
  className?: string;
  onError?: (e: any) => void;
  showTooltip?: boolean;
  tooltipText?: string;
  onClick?: () => void;
  isProfile?: boolean; // Новый пропс для профиля
}
import CurrentTrackDisplay from '../../../../UIKIT/CurrentTrackDisplay/CurrentTrackDisplay';
import MusicLabel from '../../../../UIKIT/MusicLabel';
import {
  UserStatus,
  EquippedItem,
  OverlayAvatar,
  OwnedUsernames,
  UserBanInfo,
  UserScamBadge,
  UserSubscriptionBadge,
  ProfileAbout,
} from './index';

// Ленивая загрузка модалки - загружается только при первом использовании
const BadgeInfoModal = lazy(() => import('../../../../components/BadgeInfoModal'));

// Типизация компонентов
const TypedEquippedItem = EquippedItem as React.ComponentType<EquippedItemProps>;
const TypedVerificationBadge = VerificationBadge as React.ComponentType<VerificationBadgeProps>;
const TypedBadge = Badge as React.ComponentType<BadgeProps>;

interface Achievement {
  bage: string;
  color_upgrade?: string | null;
  image_path: string;
  upgrade?: string | null;
}

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  banner_url?: string;
  profile_id?: number;
  status_color?: string;
  status_text?: string;
  profile_color?: string;  // Новое поле для цвета профиля
  subscription?: {
    type: string;
  };
  verification_status?: string;
  achievement?: Achievement;
  connect_info?: Array<{ username: string }>;
  is_private?: boolean;
  is_friend?: boolean;
  photo?: string;
  music?: {
    id: number;
    title: string;
    artist: string;
    album?: string;
    duration?: number;
    plays_count?: number;
    is_verified?: boolean;
    display_mode?: string;
    lyrics_display_mode?: string;
  };
  music_privacy?: number;
  inventory_privacy?: number;
  musician_type?: 'musician' | 'representative';
  total_artists_count?: number;
}

interface EquippedItemType {
  id: number;
  image_url: string;
  profile_position_x: number | null;
  profile_position_y: number | null;
  upgradeable?: boolean | string;
  is_equipped?: boolean;
  item_type?: string; // Тип файла (png, jpg, json, etc.)
  [key: string]: any; // Для других свойств айтема
}

interface EquippedItemProps {
  item: EquippedItemType;
  index: number;
  onPositionUpdate: (itemId: number, newPosition: { x: number; y: number }) => void;
  isEditMode: boolean;
  onEditModeActivate?: () => void;
}

interface VerificationBadgeProps {
  status?: string;
  size?: string;
}

interface Social {
  link: string;
  name: string;
  title?: string;
  url?: string;
  color?: string;
  icon?: string;
}

interface ProfileCardProps {
  user: User;
  currentUser: User | null;
  equippedItems: EquippedItemType[];
  normalEquippedItems?: EquippedItemType[];
  overlayEquippedItems?: EquippedItemType[];
  isOwnProfile: boolean;
  isEditMode: boolean;
  isOnline: boolean;
  isCurrentUser: boolean;
  isCurrentUserModerator: boolean;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  ownedUsernames: string[];
  userBanInfo: any;
  fallbackAvatarUrl: string;
  socials: Social[];
  t: (key: string) => string;
  getLighterColor: (color: string) => string;
  openLightbox: (imageUrl: string) => void;
  setFallbackAvatarUrl: (url: string) => void;
  handleItemPositionUpdate: (itemId: number, newPosition: { x: number; y: number }) => void;
  handleEditModeActivate: () => void;
  handleUsernameClick: (event: React.MouseEvent, username: string) => void;
}

const isOverlayItem = (item: EquippedItemType) => {
  const upgradeable = String(item.upgradeable);
  return upgradeable === '2' || upgradeable === '3' || upgradeable === '4';
};

const hasEquippedOverlayItems = (items: EquippedItemType[]) => {
  return Array.isArray(items) && items.some(item => isOverlayItem(item) && item.is_equipped);
};

// Функция для получения иконки социальной сети
const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
      </svg>
    );
  } else if (lowerName.includes('facebook')) {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5 1.583-5 4.615v3.385z' />
      </svg>
    );
  } else if (lowerName.includes('twitter') || lowerName.includes('x')) {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
      </svg>
    );
  } else if (lowerName.includes('vk')) {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M13.162 18.994c.609 0 .858-.406.851-.915-.031-1.917.714-2.949 2.059-1.604 1.488 1.488 1.796 2.519 3.603 2.519h3.2c.808 0 1.126-.26 1.126-.668 0-.863-1.421-2.386-2.625-3.504-1.686-1.565-1.765-1.602-.313-3.486 1.801-2.339 4.157-5.336 2.073-5.336h-3.981c-.772 0-.828.435-1.103 1.083-.995 2.347-2.886 5.387-3.604 4.922-.751-.485-.407-2.406-.35-5.261.015-.754.011-1.271-1.141-1.539-.629-.145-1.241-.205-1.809-.205-2.273 0-3.841.953-2.95 1.119 1.571.293 1.42 3.692 1.054 5.16-.638 2.556-3.036-2.024-4.035-4.305-.241-.548-.315-.974-1.175-.974h-3.255c-.492 0-.787.16-.787.516 0 .602 2.96 6.72 5.786 9.77 2.756 2.975 5.48 2.708 7.376 2.708z' />
      </svg>
    );
  } else if (lowerName.includes('youtube')) {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' />
      </svg>
    );
  } else if (lowerName.includes('telegram')) {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19l-9.5 5.97-4.1-1.34c-.88-.28-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z' />
      </svg>
    );
  } else if (lowerName.includes('element')) {
    return (
      <svg viewBox='0 0 12.7 12.7' fill='currentColor' width="20" height="20">
        <path d='M 4.9717204,2.3834823 A 5.0230292,5.0230292 0 0 0 0.59994682,7.3615548 5.0230292,5.0230292 0 0 0 5.6228197,12.384429 5.0230292,5.0230292 0 0 0 10.645693,7.3615548 5.0230292,5.0230292 0 0 0 10.630013,6.9628311 3.8648402,3.8648402 0 0 1 8.6139939,7.532543 3.8648402,3.8648402 0 0 1 4.7492118,3.6677608 3.8648402,3.8648402 0 0 1 4.9717204,2.3834823 Z' />
        <circle cx='8.6142359' cy='3.6677198' r='3.5209935' />
      </svg>
    );
  } else {
    return (
      <svg viewBox='0 0 24 24' fill='currentColor' width="20" height="20">
        <path d='M6.188 8.719c.439-.439.926-.801 1.444-1.087 2.887-1.591 6.589-.745 8.445 2.069l-2.246 2.245c-.644-1.469-2.243-2.305-3.834-1.949-.599.134-1.168.433-1.633.898l-4.304 4.306c-1.307 1.307-1.307 3.433 0 4.74 1.307 1.307 3.433 1.307 4.74 0l1.327-1.327c1.207.479 2.501.67 3.779.575l-2.929 2.929c-2.511 2.511-6.582 2.511-9.093 0s-2.511-6.582 0-9.093l4.304-4.306zm6.836-6.836l-2.929 2.929c1.277-.096 2.572.096 3.779.574l1.326-1.326c1.307-1.307 3.433-1.307 4.74 0 1.307 1.307 1.307 3.433 0 4.74l-4.305 4.305c-1.311 1.311-3.44 1.3-4.74 0-.303-.303-.564-.68-.727-1.051l-2.246 2.245c.236.358.481.667.796.982.812.812 1.846 1.417 3.036 1.704 1.542.371 3.194.166 4.613-.617.518-.286 1.005-.648 1.444-1.087l4.304-4.305c2.512-2.511 2.512-6.582.001-9.093-2.511-2.51-6.581-2.51-9.092 0z' />
      </svg>
    );
  }
};


const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  currentUser,
  equippedItems,
  normalEquippedItems = [],
  overlayEquippedItems = [],
  isOwnProfile,
  isEditMode,
  isOnline,
  isCurrentUser,
  isCurrentUserModerator,
  postsCount,
  followersCount,
  followingCount,
  ownedUsernames,
  userBanInfo,
  fallbackAvatarUrl,
  socials = [],
  t,
  getLighterColor,
  openLightbox,
  setFallbackAvatarUrl,
  handleItemPositionUpdate,
  handleEditModeActivate,
  handleUsernameClick,
}) => {
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadgeImagePath, setSelectedBadgeImagePath] = useState<string | null>(null);

  const handleBadgeClick = (imagePath: string) => {
    setSelectedBadgeImagePath(imagePath);
    setBadgeModalOpen(true);
  };
  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 'var(--small-border-radius)',
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        boxShadow: 'var(--box-shadow)',
                background:
          (user?.profile_id === 2 || user?.profile_id === 3) && user?.banner_url
            ? `url(${user.banner_url}), var(--theme-background, rgba(255, 255, 255, 0.03))`
            : 'var(--theme-background, rgba(255, 255, 255, 0.03))',
        backgroundSize:
          (user?.profile_id === 2 || user?.profile_id === 3) && user?.banner_url
            ? 'cover'
            : undefined,
        backgroundPosition:
          (user?.profile_id === 2 || user?.profile_id === 3) && user?.banner_url
            ? 'center'
            : undefined,
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        overflow: 'hidden',
        mb: '5px',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Метка музыканта/представителя в правом верхнем углу */}
      {user?.musician_type && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 30,
          }}
        >
          <MusicLabel
            type={user.musician_type}
            profileColor={user?.profile_color || user?.status_color}
            size="small"
            showTooltip={true}
          />
        </Box>
      )}

      {/* Контейнер для надетых айтемов 1 уровня на весь Paper */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: isOwnProfile && isEditMode ? 'auto' : 'none',
          zIndex: 20,
        }}
        data-profile-container="true"
      >
        {normalEquippedItems
          .map((item, index) => (
            <TypedEquippedItem 
              key={item.id} 
              item={item} 
              index={index} 
              onPositionUpdate={handleItemPositionUpdate}
              isEditMode={isOwnProfile && isEditMode}
              onEditModeActivate={isOwnProfile ? handleEditModeActivate : undefined}
            />
          ))}
      </Box>
      {/* Banner section */}
      {(user?.profile_id !== 2 && user?.profile_id !== 3) ? (
        user?.banner_url ? (
          <Box
            sx={{
              width: '100%',
              height: { xs: 150, sm: 200 },
              backgroundImage: `url(${user.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              transition: 'transform 0.5s ease',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              },
            }}
          ></Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: { xs: 100, sm: 120 },
              position: 'relative',
            }}
          ></Box>
        )
      ) : null}

      <Box
        sx={{ px: 3, pb: 3, pt: 0, mt: (user?.profile_id === 2 || user?.profile_id === 3) ? 2 : -7 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box 
            sx={{ position: 'relative' }}
            data-avatar-container="true"
          >
            {/* Контейнер для айтемов 2 и 3 уровня на аватарке */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: isOwnProfile && isEditMode ? 'auto' : 'none',
                zIndex: 10,
              }}
            >
              {overlayEquippedItems
                .map((item, index) => (
                  <OverlayAvatar 
                    key={item.id} 
                    item={item} 
                    index={index} 
                    onPositionUpdate={handleItemPositionUpdate}
                    isEditMode={isOwnProfile && isEditMode}
                    onEditModeActivate={isOwnProfile ? handleEditModeActivate : undefined}
                  />
                ))}
            </Box>

            <Tooltip title='Открыть аватар' arrow placement='top'>
              <Box
                onClick={() => {
                  const imageUrl = user?.avatar_url || fallbackAvatarUrl;
                  if (imageUrl) openLightbox(imageUrl);
                }}
                sx={{
                  width: { xs: 110, sm: 130 },
                  height: { xs: 110, sm: 130 },
                  border:
                    user?.profile_color
                      ? `4px solid ${user.profile_color}`
                      : user?.status_color &&
                        user?.status_text &&
                        user?.subscription
                        ? `4px solid ${user.status_color}`
                        : user?.subscription
                          ? `4px solid ${user.subscription.type === 'premium' ? 'rgba(186, 104, 200)' : user.subscription.type === 'pick-me' ? 'rgba(208, 188, 255)' : user.subscription.type === 'ultimate' ? 'rgba(124, 77, 255)' : 'rgba(66, 165, 245)'}`
                          : theme =>
                              theme.palette.mode === 'dark'
                                ? '4px solid #121212'
                                : '4px solid #ffffff',
                  bgcolor: 'primary.dark',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  borderRadius: 'var(--avatar-border-radius)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={user?.avatar_url || fallbackAvatarUrl}
                  alt={user?.name || 'User'}
                  width="100%"
                  height="100%"
                  style={{
                    borderRadius: 'var(--avatar-border-radius)',
                    objectFit: 'cover'
                  }}
                  onError={() => {
                    if (user?.id) {
                      const fallbackSrc = `/static/uploads/avatar/${user.id}/${user.photo || 'default.png'}`;
                      setFallbackAvatarUrl(fallbackSrc);
                    }
                  }}
                />
              </Box>
            </Tooltip>

            {/* {isOnline && user?.subscription?.type !== 'channel' && (
              <Box
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  borderRadius: 'var(--avatar-border-radius)',
                  bgcolor: '#4caf50',
                  border: theme =>
                    theme.palette.mode === 'dark'
                      ? '2px solid #121212'
                      : '2px solid #ffffff',
                  bottom: 5,
                  right: 15,
                  zIndex: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                    },
                    '70%': {
                    },
                    '100%': {
                    },
                  },
                }}
              />
            )} */}

            <UserStatus
              statusText={user?.status_text}
              statusColor={user?.status_color}
            />
          </Box>
        </Box>

        <Box sx={{ whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: hasEquippedOverlayItems(equippedItems) ? '15px' : 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: (user?.profile_id === 2 || user?.profile_id === 3) ? '#fff' : 'inherit',
                  textShadow:
                    (user?.profile_id === 2 || user?.profile_id === 3)
                      ? '0 1px 3px rgba(0,0,0,0.7)'
                      : 'none',
                  background:
                    (user?.profile_id === 2 || user?.profile_id === 3)
                      ? 'none'
                      : theme =>
                          theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)'
                            : 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.8) 100%)',
                  WebkitBackgroundClip:
                    (user?.profile_id === 2 || user?.profile_id === 3) ? 'unset' : 'text',
                  WebkitTextFillColor:
                    (user?.profile_id === 2 || user?.profile_id === 3) ? 'unset' : 'transparent',
                }}
              >
                {user?.name || 'Пользователь'}
              </Typography>
              <div>
                <TypedVerificationBadge
                  status={user?.verification_status}
                  size="small"
                />
              </div>

              {user?.achievement && (
                <TypedBadge
                  achievement={{
                    ...user.achievement,
                    upgrade: user.achievement.upgrade || '',
                    color_upgrade: user.achievement.color_upgrade || '#FFD700'
                  } as any}
                  size='medium'
                  className='profile-achievement-badge'
                  showTooltip={true}
                  tooltipText={user.achievement.image_path?.startsWith('shop/') 
                    ? `${user.achievement.bage} (нажмите для подробностей)`
                    : user.achievement.bage
                  }
                  isProfile={true} // Добавляем флаг для профиля
                  onClick={() => {
                    // Открываем модалку для всех бейджей
                    if (user.achievement?.image_path) {
                      const imagePath = user.achievement.image_path;
                      const isShopBadge = imagePath.includes('/shop/') || imagePath.startsWith('shop/') || imagePath.includes('bages/shop/');
                      
                      if (isShopBadge) {
                        let shopPath = imagePath;
                        
                        if (imagePath.startsWith('http')) {
                          // Если это полный URL, извлекаем путь после shop/
                          // Пример: https://s3.k-connect.ru/static/images/bages/shop/filename.svg
                          const shopMatch = imagePath.match(/shop\/([^/?]+)/);
                          if (shopMatch) {
                            shopPath = `shop/${shopMatch[1]}`;
                          } else {
                            // Пробуем найти после bages/
                            const bagesMatch = imagePath.match(/bages\/shop\/([^/?]+)/);
                            if (bagesMatch) {
                              shopPath = `shop/${bagesMatch[1]}`;
                            }
                          }
                        } else if (imagePath.startsWith('shop/')) {
                          shopPath = imagePath;
                        } else if (imagePath.includes('/shop/')) {
                          const match = imagePath.match(/\/shop\/([^/?]+)/);
                          if (match) {
                            shopPath = `shop/${match[1]}`;
                          }
                        }
                        
                        handleBadgeClick(shopPath);
                      } else {
                        console.log('Badge click on non-shop badge:', imagePath);
                      }
                    }
                  }}
                  onError={(e: any) => {
                    console.error('Achievement badge failed to load:', e);
                  }}
                />
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
              flexWrap: 'wrap',
              maxWidth: '100%',
            }}
          >
            <Typography
              variant='body2'
              sx={{
                fontWeight: 500,
                color:
                  (user?.profile_id === 2 || user?.profile_id === 3)
                    ? 'rgba(255,255,255,0.9)'
                    : theme => theme.palette.text.secondary,
                textShadow:
                  (user?.profile_id === 2 || user?.profile_id === 3)
                    ? '0 1px 2px rgba(0,0,0,0.5)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                background:
                  (user?.profile_id === 2 || user?.profile_id === 3)
                    ? 'rgba(0,0,0,0.3)'
                    : theme =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.03)',
                px: 1.2,
                py: 0.4,
                borderRadius: 'var(--main-border-radius)',
                border:
                  (user?.profile_id === 2 || user?.profile_id === 3)
                    ? '1px solid rgba(255,255,255,0.15)'
                    : theme =>
                        theme.palette.mode === 'dark'
                          ? '1px solid rgba(255,255,255,0.05)'
                          : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              @{user?.username || 'username'}
            </Typography>

            {user?.connect_info && user.connect_info.length > 0 && (
              <>
                <LinkRoundedIcon
                  sx={theme => ({
                    width: '2em',
                    height: '2em',
                    fontSize: 16,
                    color:
                      user?.profile_id === 2
                        ? 'rgba(255,255,255,0.9)'
                        : theme.palette.text.secondary,
                  })}
                />
                <Typography
                  variant='body2'
                  component={Link}
                  to={`/profile/${user.connect_info[0].username}`}
                  sx={theme => ({
                    fontWeight: 500,
                    color:
                      (user?.profile_id === 2 || user?.profile_id === 3)
                        ? 'rgba(255,255,255,0.9)'
                        : theme.palette.text.secondary,
                    textShadow:
                      (user?.profile_id === 2 || user?.profile_id === 3)
                        ? '0 1px 2px rgba(0,0,0,0.5)'
                        : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    background:
                      (user?.profile_id === 2 || user?.profile_id === 3)
                        ? 'rgba(0,0,0,0.3)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.03)',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 'var(--main-border-radius)',
                    border:
                      (user?.profile_id === 2 || user?.profile_id === 3)
                        ? '1px solid rgba(255,255,255,0.15)'
                        : theme.palette.mode === 'dark'
                          ? '1px solid rgba(255,255,255,0.05)'
                          : '1px solid rgba(0,0,0,0.05)',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  })}
                >
                  @{user.connect_info[0].username}
                </Typography>
              </>
            )}

            <UserScamBadge user={user} />

            <UserSubscriptionBadge user={user} />
          </Box>

          <OwnedUsernames
            ownedUsernames={ownedUsernames}
            user={user}
            t={t}
            getLighterColor={getLighterColor}
            handleUsernameClick={handleUsernameClick}
          />

          <UserBanInfo
            userBanInfo={userBanInfo}
            user={user}
            currentUser={currentUser}
            isCurrentUserModerator={isCurrentUserModerator}
            showTooltip={false}
            showDetailed={true}
          />

          <ProfileAbout user={user} getLighterColor={getLighterColor} />

          {/* Отображение текущего трека */}
          {user?.music && user.music_privacy !== 2 && (
            <Box sx={{ mt: 1, mb: 1 }}>
              <CurrentTrackDisplay
                track={{
                  id: user.music.id,
                  title: user.music.title,
                  artist: user.music.artist,
                  lyrics_display_mode: user.music?.lyrics_display_mode,
                }}
                userId={user.id}
                statusColor={user?.profile_color || user?.status_color}
                getLighterColor={getLighterColor}
              />
            </Box>
          )}

          {/* Показываем статистику только если профиль не приватный или у пользователя есть доступ */}
          {(!user?.is_private || isCurrentUser || user?.is_friend) ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns:
                  user?.subscription?.type === 'channel'
                    ? 'repeat(2, 1fr)'
                    : 'repeat(3, 1fr)',
                gap: 1,
                mt: 1,
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  borderRadius: 'var(--main-border-radius)',
                  boxShadow: 'var(--box-shadow)',
                  textAlign: 'center',
                  background: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(5px)',
                  border:
                    user.profile_color
                      ? `1px solid ${user.profile_color}33`
                      : user.status_color &&
                        user.status_text &&
                        user.subscription
                        ? `1px solid ${user.status_color}33`
                        : theme =>
                            theme.palette.mode === 'dark'
                              ? '1px solid rgba(255,255,255,0.05)'
                              : '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    color:
                      user.profile_color
                        ? user.profile_color
                        : user.status_color &&
                          user.status_text &&
                          user.subscription
                          ? user.status_color
                          : 'primary.main',
                  }}
                >
                  {postsCount || 0}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: user?.profile_color
                      ? getLighterColor(user.profile_color)
                      : user?.status_color
                        ? getLighterColor(user.status_color)
                        : theme => theme.palette.text.secondary,
                  }}
                >
                  {t('profile.info_stats.posts')}
                </Typography>
              </Paper>

              <Paper
                component={Link}
                to={`/friends/${user?.username}`}
                sx={{
                  p: 1,
                  borderRadius: 'var(--main-border-radius)',
                  boxShadow: 'var(--box-shadow)',
                  textAlign: 'center',
                  background: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(5px)',
                  border:
                    user.profile_color
                      ? `1px solid ${user.profile_color}33`
                      : user.status_color &&
                        user.status_text &&
                        user.subscription
                        ? `1px solid ${user.status_color}33`
                        : theme =>
                            theme.palette.mode === 'dark'
                              ? '1px solid rgba(255,255,255,0.05)'
                              : '1px solid rgba(0,0,0,0.05)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 700,
                    color:
                      user.profile_color
                        ? user.profile_color
                        : user.status_color &&
                          user.status_text &&
                          user.subscription
                          ? user.status_color
                          : 'primary.main',
                  }}
                >
                  {followersCount || 0}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    color: user?.profile_color
                      ? getLighterColor(user.profile_color)
                      : user?.status_color
                        ? getLighterColor(user.status_color)
                        : theme => theme.palette.text.secondary,
                  }}
                >
                  {t('profile.info_stats.followers')}
                </Typography>
              </Paper>

              {(!user?.subscription ||
                user.subscription.type !== 'channel') && (
                <Paper
                  component={Link}
                  to={`/friends/${user?.username}`}
                  sx={{
                    p: 1,
                    borderRadius: 'var(--main-border-radius)',
                    boxShadow: 'var(--box-shadow)',
                    textAlign: 'center',
                    background: theme =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(5px)',
                    border:
                      user.profile_color
                        ? `1px solid ${user.profile_color}33`
                        : user.status_color &&
                          user.status_text &&
                          user.subscription
                          ? `1px solid ${user.status_color}33`
                          : theme =>
                              theme.palette.mode === 'dark'
                                ? '1px solid rgba(255,255,255,0.05)'
                                : '1px solid rgba(0,0,0,0.05)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      color:
                        user.profile_color
                          ? user.profile_color
                          : user.status_color &&
                            user.status_text &&
                            user.subscription
                            ? user.status_color
                            : 'primary.main',
                    }}
                  >
                    {followingCount || 0}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      color: user?.profile_color
                        ? getLighterColor(user.profile_color)
                        : user?.status_color
                          ? getLighterColor(user.status_color)
                          : theme => theme.palette.text.secondary,
                    }}
                  >
                    {t('profile.info_stats.following')}
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            /* Сообщение о приватном профиле */
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 'var(--main-border-radius)',
                textAlign: 'center',
                background: theme =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                backdropFilter: 'blur(5px)',
                border: theme =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.05)'
                    : '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <Typography
                variant='body2'
                sx={{
                  color: theme => theme.palette.text.secondary,
                  fontWeight: 500,
                }}
              >
                 Приватный профиль
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: theme => theme.palette.text.secondary,
                  display: 'block',
                  mt: 0.5,
                }}
              >
                {t('profile.info_stats.private_profile')}
              </Typography>
            </Box>
          )}

          {/* Социальные ссылки */}
          {socials && socials.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 
                  socials.length === 1 ? '1fr' :
                  socials.length === 2 ? 'repeat(2, 1fr)' :
                  'repeat(3, 1fr)',
                gap: 1,
                mt: 1,
              }}
            >
              {socials.slice(0, 3).map((social, index) => (
                <Paper
                  key={index}
                  component="a"
                  href={social.url || social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    p: 1,
                    borderRadius: 'var(--main-border-radius)',
                    boxShadow: 'var(--box-shadow)',
                    textAlign: 'center',
                    background: theme =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(5px)',
                    border:
                      user.profile_color
                        ? `1px solid ${user.profile_color}33`
                        : user.status_color &&
                          user.status_text &&
                          user.subscription
                          ? `1px solid ${user.status_color}33`
                          : theme =>
                              theme.palette.mode === 'dark'
                                ? '1px solid rgba(255,255,255,0.05)'
                                : '1px solid rgba(0,0,0,0.05)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '15px',
                    '&:hover': {
                      backgroundColor: theme =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 0.5,
                      marginRight: '5px',
                      color: social.color || 
                        (user.profile_color
                          ? user.profile_color
                          : user.status_color &&
                            user.status_text &&
                            user.subscription
                            ? user.status_color
                            : 'primary.main'),
                    }}
                  >
                    {social.icon ? (
                      <img
                        src={social.icon}
                        alt={social.title || social.name}
                        style={{
                          width: '20px',
                          height: '20px',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      getSocialIcon(social.name)
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: user?.profile_color
                        ? getLighterColor(user.profile_color)
                        : user?.status_color
                          ? getLighterColor(user.status_color)
                          : theme => theme.palette.text.secondary,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                      flex: 1,
                      minWidth: 0, // Важно для правильной работы ellipsis
                    }}
                  >
                    {social.title || social.name}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Badge Info Modal - загружается только при открытии */}
      {badgeModalOpen && (
        <Suspense fallback={
          <Box sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}>
            <CircularProgress />
          </Box>
        }>
          <BadgeInfoModal
            open={badgeModalOpen}
            onClose={() => setBadgeModalOpen(false)}
            imagePath={selectedBadgeImagePath}
          />
        </Suspense>
      )}
    </Paper>
  );
};

export default ProfileCard;