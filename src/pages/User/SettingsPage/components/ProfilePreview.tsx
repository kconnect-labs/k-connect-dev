import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { LinkRounded as LinkRoundedIcon } from '@mui/icons-material';
// import { VerificationBadge, Badge } from '../../../../UIKIT'; // Комментируем, если не используется/нет экспорта
// import { getLighterColor } from '../../ProfilePage/utils/colorUtils';

interface ProfilePreviewProps {
  user: any;
  profileData?: any;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  user,
  profileData,
}) => {
  if (!user) {
    return (
      <Paper
        className='theme-aware'
        sx={{
          p: 2,
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          variant='body2'
          sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center' }}
        >
          Загрузка профиля...
        </Typography>
      </Paper>
    );
  }

  // Объединяем данные пользователя с данными профиля
  const displayUser = {
    ...user,
    avatar_url: profileData?.avatar || user?.avatar_url,
    banner_url: profileData?.banner || user?.banner_url,
    name: profileData?.name || user?.name,
    username: profileData?.username || user?.username,
    about: profileData?.about || user?.about,
    status_text: profileData?.status_text || user?.status_text,
    status_color: profileData?.status_color || user?.status_color,
    achievement: user?.achievement,
    verification_status: user?.verification_status,
    subscription: user?.subscription,
    connect_info: user?.connect_info,
    profile_id: user?.profile_id,
  };

  return (
    <Paper
      className='theme-aware'
      sx={{
        p: 0,
        borderRadius: '16px',
        background:
          displayUser?.profile_id === 2 && displayUser?.banner_url
            ? `url(${displayUser.banner_url}), rgba(255,255,255,0.03)`
            : 'rgba(255,255,255,0.03)',
        backgroundSize:
          displayUser?.profile_id === 2 && displayUser?.banner_url
            ? 'cover'
            : undefined,
        backgroundPosition:
          displayUser?.profile_id === 2 && displayUser?.banner_url
            ? 'center'
            : undefined,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(20px)',
        // boxShadow убран
      }}
    >
      {/* Banner section */}
      {displayUser?.profile_id !== 2 ? (
        displayUser?.banner_url ? (
          <Box
            sx={{
              width: '100%',
              height: 120,
              backgroundImage: `url(${displayUser.banner_url})`,
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
              height: 80,
              position: 'relative',
            }}
          ></Box>
        )
      ) : null}

      <Box
        sx={{ px: 2, pb: 2, pt: 0, mt: displayUser?.profile_id === 2 ? 1 : -4 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={displayUser?.avatar_url}
              alt={displayUser?.name}
              sx={{
                width: 80,
                height: 80,
                border:
                  displayUser?.status_color &&
                  displayUser?.status_text &&
                  displayUser?.subscription
                    ? `3px solid ${displayUser.status_color}`
                    : displayUser?.subscription
                      ? `3px solid var(--primary)`
                      : theme =>
                          theme.palette.mode === 'dark'
                            ? '3px solid #121212'
                            : '3px solid #ffffff',
                // boxShadow убран
                bgcolor: 'primary.dark',
                transition: 'all 0.3s ease',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ whiteSpace: 'nowrap', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color:
                  displayUser?.profile_id === 2
                    ? 'var(--theme-text-primary)'
                    : 'var(--theme-text-primary)',
                textShadow:
                  displayUser?.profile_id === 2
                    ? '0 1px 3px rgba(0,0,0,0.7)'
                    : 'none',
                background: 'none',
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: 'unset',
                fontSize: '1.1rem',
              }}
            >
              {displayUser?.name || 'Пользователь'}
            </Typography>
            {/* <VerificationBadge status={displayUser?.verification_status} size="small" /> */}

            {/* {displayUser?.achievement && (
              <Badge
                achievement={displayUser.achievement}
                size='small'
                className='profile-achievement-badge'
                showTooltip={true}
                tooltipText={displayUser.achievement.bage}
                onError={(e: any) => {
                  console.error('Achievement badge failed to load:', e);
                }}
              />
            )} */}
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
                  displayUser?.profile_id === 2
                    ? 'var(--theme-text-secondary)'
                    : 'var(--theme-text-secondary)',
                textShadow:
                  displayUser?.profile_id === 2
                    ? '0 1px 2px rgba(0,0,0,0.5)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: '0.8rem',
              }}
            >
              @{displayUser?.username || 'username'}
            </Typography>

            {displayUser?.connect_info &&
              displayUser.connect_info.length > 0 && (
                <>
                  <LinkRoundedIcon
                    sx={{
                      width: '1.5em',
                      height: '1.5em',
                      fontSize: 14,
                      color: 'var(--theme-text-secondary)',
                    }}
                  />
                  <Typography
                    variant='body2'
                    sx={{
                      fontWeight: 500,
                      color: 'var(--theme-text-secondary)',
                      textShadow:
                        displayUser?.profile_id === 2
                          ? '0 1px 2px rgba(0,0,0,0.5)'
                          : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)',
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '0.8rem',
                    }}
                  >
                    @{displayUser.connect_info[0].username}
                  </Typography>
                </>
              )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfilePreview;
