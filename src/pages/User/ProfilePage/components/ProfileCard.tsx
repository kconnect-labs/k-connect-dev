import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { MaxIcon } from '../../../../components/icons/CustomIcons';
import VerificationBadge from '../../../../UIKIT/VerificationBadge';
import Badge from '../../../../UIKIT/Badge';
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

// Типизация компонентов
const TypedEquippedItem = EquippedItem as React.ComponentType<EquippedItemProps>;
const TypedVerificationBadge = VerificationBadge as React.ComponentType<VerificationBadgeProps>;

interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
  banner_url?: string;
  profile_id?: number;
  status_color?: string;
  status_text?: string;
  subscription?: {
    type: string;
  };
  verification_status?: string;
  achievement?: any;
  connect_info?: Array<{ username: string }>;
  is_private?: boolean;
  is_friend?: boolean;
  photo?: string;
}

interface EquippedItemType {
  id: number;
  profile_position_x: number | null;
  profile_position_y: number | null;
  upgradeable?: boolean | string;
  is_equipped?: boolean;
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
  return items.some(item => isOverlayItem(item) && item.is_equipped);
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
  t,
  getLighterColor,
  openLightbox,
  setFallbackAvatarUrl,
  handleItemPositionUpdate,
  handleEditModeActivate,
  handleUsernameClick,
}) => {
  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: '16px',
        background:
          user?.profile_id === 2 && user?.banner_url
            ? `url(${user.banner_url}), var(--theme-background, rgba(255, 255, 255, 0.03))`
            : 'var(--theme-background, rgba(255, 255, 255, 0.03))',
        backgroundSize:
          user?.profile_id === 2 && user?.banner_url
            ? 'cover'
            : undefined,
        backgroundPosition:
          user?.profile_id === 2 && user?.banner_url
            ? 'center'
            : undefined,
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        mb: '5px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Контейнер для надетых айтемов 1 уровня на весь Paper */}
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
      {user?.profile_id !== 2 ? (
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
              '&:hover': {
                transform: 'scale(1.02)',
              },
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
        sx={{ px: 3, pb: 3, pt: 0, mt: user?.profile_id === 2 ? 2 : -7 }}
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
              <Avatar
                src={user?.avatar_url}
                alt={user?.name}
                onClick={() => {
                  const imageUrl = user?.avatar_url || fallbackAvatarUrl;
                  if (imageUrl) openLightbox(imageUrl);
                }}
                sx={{
                  width: { xs: 110, sm: 130 },
                  height: { xs: 110, sm: 130 },
                  border:
                    user?.status_color &&
                    user?.status_text &&
                    user?.subscription
                      ? `4px solid ${user.status_color}`
                      : user?.subscription
                        ? `4px solid ${user.subscription.type === 'premium' ? 'rgba(186, 104, 200)' : user.subscription.type === 'pick-me' ? 'rgba(208, 188, 255)' : user.subscription.type === 'ultimate' ? 'rgba(124, 77, 255)' : 'rgba(66, 165, 245)'}`
                        : theme =>
                            theme.palette.mode === 'dark'
                              ? '4px solid #121212'
                              : '4px solid #ffffff',
                  boxShadow:
                    user?.status_color &&
                    user?.status_text &&
                    user.subscription
                      ? `0 0 15px ${user.status_color}80`
                      : user?.subscription
                        ? user.subscription.type === 'premium'
                          ? '0 0 15px rgba(186, 104, 200, 0.5)'
                          : user.subscription.type === 'pick-me'
                            ? '0 0 15px rgba(208, 188, 255, 0.5)'
                            : user.subscription.type === 'ultimate'
                              ? '0 0 15px rgba(124, 77, 255, 0.5)'
                              : '0 0 15px rgba(66, 165, 245, 0.5)'
                        : '0 8px 20px rgba(0, 0, 0, 0.25)',
                  bgcolor: 'primary.dark',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  if (user?.id) {
                    const fallbackSrc = `/static/uploads/avatar/${user.id}/${user.photo || 'default.png'}`;
                    e.currentTarget.src = fallbackSrc;
                    setFallbackAvatarUrl(fallbackSrc);
                  }
                }}
              />
            </Tooltip>

            {isOnline && user?.subscription?.type !== 'channel' && (
              <Box
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#4caf50',
                  border: theme =>
                    theme.palette.mode === 'dark'
                      ? '2px solid #121212'
                      : '2px solid #ffffff',
                  bottom: 5,
                  right: 15,
                  boxShadow: '0 0 8px rgba(76, 175, 80, 0.9)',
                  zIndex: 2,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
                    },
                    '70%': {
                      boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)',
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
                    },
                  },
                }}
              />
            )}

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
                  color: user?.profile_id === 2 ? '#fff' : 'inherit',
                  textShadow:
                    user?.profile_id === 2
                      ? '0 1px 3px rgba(0,0,0,0.7)'
                      : 'none',
                  background:
                    user?.profile_id === 2
                      ? 'none'
                      : theme =>
                          theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)'
                            : 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.8) 100%)',
                  WebkitBackgroundClip:
                    user?.profile_id === 2 ? 'unset' : 'text',
                  WebkitTextFillColor:
                    user?.profile_id === 2 ? 'unset' : 'transparent',
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

              {user?.subscription?.type === 'max' && (
                <MaxIcon 
                  size={24} 
                  color={user?.status_color || "#FF4D50"} 
                  style={{ marginLeft: '5px' }}
                  className=""
                />
              )}

              {user?.achievement && (
                <Badge
                  achievement={user.achievement}
                  size='medium'
                  className='profile-achievement-badge'
                  showTooltip={true}
                  tooltipText={user.achievement.bage}
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
                  user?.profile_id === 2
                    ? 'rgba(255,255,255,0.9)'
                    : theme => theme.palette.text.secondary,
                textShadow:
                  user?.profile_id === 2
                    ? '0 1px 2px rgba(0,0,0,0.5)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                background:
                  user?.profile_id === 2
                    ? 'rgba(0,0,0,0.3)'
                    : theme =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.03)',
                px: 1.2,
                py: 0.4,
                borderRadius: 1,
                border:
                  user?.profile_id === 2
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
                      user?.profile_id === 2
                        ? 'rgba(255,255,255,0.9)'
                        : theme.palette.text.secondary,
                    textShadow:
                      user?.profile_id === 2
                        ? '0 1px 2px rgba(0,0,0,0.5)'
                        : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    background:
                      user?.profile_id === 2
                        ? 'rgba(0,0,0,0.3)'
                        : theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.03)',
                    px: 1.2,
                    py: 0.4,
                    borderRadius: 1,
                    border:
                      user?.profile_id === 2
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
                  borderRadius: 1,
                  textAlign: 'center',
                  background: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(5px)',
                  border:
                    user.status_color &&
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
                      user.status_color &&
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
                    color: user?.status_color
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
                  borderRadius: 1,
                  textAlign: 'center',
                  background: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(5px)',
                  border:
                    user.status_color &&
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
                      user.status_color &&
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
                    color: user?.status_color
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
                    borderRadius: 1,
                    textAlign: 'center',
                    background: theme =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(5px)',
                    border:
                      user.status_color &&
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
                        user.status_color &&
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
                      color: user?.status_color
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
                borderRadius: 1,
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
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileCard;