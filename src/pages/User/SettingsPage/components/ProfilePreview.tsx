import React from 'react';
import { Box, Typography, Avatar, Paper, Tooltip } from '@mui/material';
import { LinkRounded as LinkRoundedIcon } from '@mui/icons-material';
import { VerificationBadge, Badge } from '../../../../UIKIT';
import { getLighterColor } from '../../ProfilePage/utils/colorUtils';

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
        sx={{
          p: 2,
          borderRadius: '16px',
          background: 'rgba(15, 15, 15, 0.98)',
          WebkitboxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          variant='body2'
          sx={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}
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
      sx={{
        p: 0,
        borderRadius: '16px',
        background:
          displayUser?.profile_id === 2 && displayUser?.banner_url
            ? `url(${displayUser.banner_url}), rgba(255, 255, 255, 0.03)`
            : 'rgba(15, 15, 15, 0.98)',
        backgroundSize:
          displayUser?.profile_id === 2 && displayUser?.banner_url
            ? 'cover'
            : undefined,
        backgroundPosition:
          displayUser?.profile_id === 2 && displayUser?.banner_url
            ? 'center'
            : undefined,
        WebkitboxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 2,
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
                      ? `3px solid ${displayUser.subscription.type === 'premium' ? 'rgba(186, 104, 200)' : displayUser.subscription.type === 'pick-me' ? 'rgba(208, 188, 255)' : displayUser.subscription.type === 'ultimate' ? 'rgba(124, 77, 255)' : displayUser.subscription.type === 'max' ? 'rgba(255, 77, 80)' : 'rgba(66, 165, 245)'}`
                      : theme =>
                          theme.palette.mode === 'dark'
                            ? '3px solid #121212'
                            : '3px solid #ffffff',
                boxShadow:
                  displayUser?.status_color &&
                  displayUser?.status_text &&
                  displayUser.subscription
                    ? `0 0 12px ${displayUser.status_color}80`
                    : displayUser?.subscription
                      ? displayUser.subscription.type === 'premium'
                        ? '0 0 12px rgba(186, 104, 200, 0.5)'
                        : displayUser.subscription.type === 'pick-me'
                          ? '0 0 12px rgba(208, 188, 255, 0.5)'
                          : displayUser.subscription.type === 'ultimate'
                            ? '0 0 12px rgba(124, 77, 255, 0.5)'
                            : displayUser.subscription.type === 'max'
                              ? '0 0 12px rgba(255, 77, 80, 0.5)'
                              : '0 0 12px rgba(66, 165, 245, 0.5)'
                      : '0 6px 16px rgba(0, 0, 0, 0.25)',
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
                color: displayUser?.profile_id === 2 ? '#fff' : 'inherit',
                textShadow:
                  displayUser?.profile_id === 2
                    ? '0 1px 3px rgba(0,0,0,0.7)'
                    : 'none',
                background:
                  displayUser?.profile_id === 2
                    ? 'none'
                    : theme =>
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)'
                          : 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.8) 100%)',
                WebkitBackgroundClip:
                  displayUser?.profile_id === 2 ? 'unset' : 'text',
                WebkitTextFillColor:
                  displayUser?.profile_id === 2 ? 'unset' : 'transparent',
                fontSize: '1.1rem',
              }}
            >
              {displayUser?.name || 'Пользователь'}
            </Typography>
            {/* <VerificationBadge status={displayUser?.verification_status} size="small" /> */}

            {displayUser?.achievement && (
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
            )}
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
                    ? 'rgba(255,255,255,0.9)'
                    : theme => theme.palette.text.secondary,
                textShadow:
                  displayUser?.profile_id === 2
                    ? '0 1px 2px rgba(0,0,0,0.5)'
                    : 'none',
                display: 'flex',
                alignItems: 'center',
                background:
                  displayUser?.profile_id === 2
                    ? 'rgba(0,0,0,0.3)'
                    : theme =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(15, 15, 15, 0.98)'
                          : 'rgba(15, 15, 15, 0.98)',
                px: 1,
                py: 0.3,
                borderRadius: 1,
                border:
                  displayUser?.profile_id === 2
                    ? '1px solid rgba(255,255,255,0.15)'
                    : theme =>
                        theme.palette.mode === 'dark'
                          ? '1px solid rgba(255,255,255,0.05)'
                          : '1px solid rgba(0,0,0,0.05)',
                fontSize: '0.8rem',
              }}
            >
              @{displayUser?.username || 'username'}
            </Typography>

            {displayUser?.connect_info &&
              displayUser.connect_info.length > 0 && (
                <>
                  <LinkRoundedIcon
                    sx={theme => ({
                      width: '1.5em',
                      height: '1.5em',
                      fontSize: 14,
                      color:
                        displayUser?.profile_id === 2
                          ? 'rgba(255,255,255,0.9)'
                          : theme.palette.text.secondary,
                    })}
                  />
                  <Typography
                    variant='body2'
                    sx={theme => ({
                      fontWeight: 500,
                      color:
                        displayUser?.profile_id === 2
                          ? 'rgba(255,255,255,0.9)'
                          : theme.palette.text.secondary,
                      textShadow:
                        displayUser?.profile_id === 2
                          ? '0 1px 2px rgba(0,0,0,0.5)'
                          : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      background:
                        displayUser?.profile_id === 2
                          ? 'rgba(0,0,0,0.3)'
                          : theme.palette.mode === 'dark'
                            ? 'rgba(15, 15, 15, 0.98)'
                            : 'rgba(15, 15, 15, 0.98)',
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      border:
                        displayUser?.profile_id === 2
                          ? '1px solid rgba(255,255,255,0.15)'
                          : theme.palette.mode === 'dark'
                            ? '1px solid rgba(255,255,255,0.05)'
                            : '1px solid rgba(0,0,0,0.05)',
                      fontSize: '0.8rem',
                    })}
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
