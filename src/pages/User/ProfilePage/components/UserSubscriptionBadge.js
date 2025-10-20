import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DiamondIcon from '@mui/icons-material/Diamond';
import { MaxIcon } from '../../../../components/icons/CustomIcons';
import { useLanguage } from '../../../../context/LanguageContext';

const UserSubscriptionBadge = ({ user }) => {
  const { t } = useLanguage();
  if (!user?.subscription) return null;

  // Используем profile_color вместо status_color для всех цветов
  const mainColor = user?.profile_color;

  if (user.subscription.type === 'channel') {
    return (
      <Chip
        icon={<ChatIcon fontSize='small' />}
        label={t('profile.subscription.channel')}
        size='small'
        sx={{
          backdropFilter: 'blur(10px)',
          borderRadius: 'var(--main-border-radius)',
          bgcolor: mainColor
            ? `${mainColor}26`
            : theme =>
                theme.palette.mode === 'dark'
                  ? 'rgba(208, 188, 255, 0.15)'
                  : 'rgba(124, 77, 255, 0.15)',
          color: mainColor
            ? mainColor
            : theme => (theme.palette.mode === 'dark' ? '#d0bcff' : '#7c4dff'),
          fontWeight: 'bold',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          borderColor: mainColor
            ? `${mainColor}4D`
            : theme =>
                theme.palette.mode === 'dark'
                  ? 'rgba(208, 188, 255, 0.3)'
                  : 'rgba(124, 77, 255, 0.3)',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
          py: 0.1,
          height: 'auto',
        }}
      />
    );
  }

  const subscriptionTypeLabel = t(
    `balance.subscription_types.${user.subscription.type}`
  );
  return (
    <Tooltip
      title={t('profile.subscription.active', {
        type: subscriptionTypeLabel,
        date: user.subscription.expires_at
          ? new Date(user.subscription.expires_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '',
      })}
    >
      <Chip
        icon={
          user.subscription.type === 'max'
            ? <MaxIcon size={16} color="currentColor" />
            : <DiamondIcon fontSize='small' />
        }
        label={
          user.subscription.type === 'pick-me'
            ? t('profile.subscription.pick_me')
            : subscriptionTypeLabel
        }
        size='small'
        sx={{
          borderRadius: 'var(--main-border-radius)',
          bgcolor:
            user.subscription.type === 'premium'
              ? 'rgba(186, 104, 200, 0.5)'
              : user.subscription.type === 'ultimate'
                ? 'rgba(124, 77, 255, 0.6)'
                : user.subscription.type === 'max'
                  ? (mainColor ? `${mainColor}26` : 'rgba(208, 7, 7, 0.3)')
                  : user.subscription.type === 'pick-me'
                    ? 'rgba(208, 188, 255, 0.15)'
                    : 'rgba(66, 165, 245, 0.4)',
          color:
            user.subscription.type === 'premium'
              ? '#E1BEE7'
              : user.subscription.type === 'ultimate'
                ? '#B8A9FF'
                : user.subscription.type === 'max'
                  ? (mainColor || '#FF4D50')
                  : user.subscription.type === 'pick-me'
                    ? 'rgb(208, 188, 255)'
                    : '#90CAF9',
          fontWeight: 'bold',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          borderColor:
            user.subscription.type === 'premium'
              ? 'rgba(186, 104, 200, 0.6)'
              : user.subscription.type === 'ultimate'
                ? 'rgba(124, 77, 255, 0.7)'
                : user.subscription.type === 'max'
                  ? (mainColor ? `${mainColor}4D` : 'rgba(208, 7, 7, 0.3)')
                  : user.subscription.type === 'pick-me'
                    ? 'rgba(208, 188, 255, 0.3)'
                    : 'rgba(66, 165, 245, 0.5)',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
          '& .MuiChip-label': {
            color: user.subscription.type === 'ultimate' ? '#B8A9FF !important' : 
                   user.subscription.type === 'premium' ? '#E1BEE7 !important' :
                   user.subscription.type === 'basic' ? '#90CAF9 !important' : 'inherit',
          },
          py: 0.25,
          height: 'auto',
        }}
      />
    </Tooltip>
  );
};

export default UserSubscriptionBadge;
