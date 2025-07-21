import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DiamondIcon from '@mui/icons-material/Diamond';
import { MaxIcon } from '../../../../components/icons/CustomIcons';
import { useLanguage } from '../../../../context/LanguageContext';

const UserSubscriptionBadge = ({ user }) => {
  const { t } = useLanguage();
  if (!user?.subscription) return null;

  if (user.subscription.type === 'channel') {
    return (
      <Chip
        icon={<ChatIcon fontSize='small' />}
        label={t('profile.subscription.channel')}
        size='small'
        sx={{
          backdropFilter: 'blur(10px)',
          borderRadius: 1,
          bgcolor: user.status_color
            ? `${user.status_color}26`
            : theme =>
                theme.palette.mode === 'dark'
                  ? 'rgba(208, 188, 255, 0.15)'
                  : 'rgba(124, 77, 255, 0.15)',
          color: user.status_color
            ? user.status_color
            : theme => (theme.palette.mode === 'dark' ? '#d0bcff' : '#7c4dff'),
          fontWeight: 'bold',
          border: '1px solid',
          borderColor: user.status_color
            ? `${user.status_color}4D`
            : theme =>
                theme.palette.mode === 'dark'
                  ? 'rgba(208, 188, 255, 0.3)'
                  : 'rgba(124, 77, 255, 0.3)',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
          py: 0.1,
          height: 'auto',
          animation: 'pulse-light 2s infinite',
          '@keyframes pulse-light': {
            '0%': {
              boxShadow: user.status_color
                ? `0 0 0 0 ${user.status_color}66`
                : '0 0 0 0 rgba(124, 77, 255, 0.4)',
            },
            '70%': {
              boxShadow: user.status_color
                ? `0 0 0 6px ${user.status_color}00`
                : '0 0 0 6px rgba(124, 77, 255, 0)',
            },
            '100%': {
              boxShadow: user.status_color
                ? `0 0 0 0 ${user.status_color}00`
                : '0 0 0 0 rgba(124, 77, 255, 0)',
            },
          },
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
          borderRadius: 1,
                    bgcolor:
            user.subscription.type === 'premium'
              ? 'rgba(186, 104, 200, 0.5)'
              : user.subscription.type === 'ultimate'
                ? 'rgba(124, 77, 255, 0.6)'
                : user.subscription.type === 'max'
                  ? 'rgba(208, 7, 7, 0.3)'
                  : user.subscription.type === 'pick-me'
                    ? 'rgba(208, 188, 255, 0.15)'
                    : 'rgba(66, 165, 245, 0.4)',
          color:
            user.subscription.type === 'premium'
              ? '#E1BEE7'
              : user.subscription.type === 'ultimate'
                ? '#B8A9FF'
                : user.subscription.type === 'max'
                  ? '#FF4D50'
                  : user.subscription.type === 'pick-me'
                    ? 'rgb(208, 188, 255)'
                    : '#90CAF9',
          fontWeight: 'bold',
          border: '1px solid',
          borderColor:
            user.subscription.type === 'premium'
              ? 'rgba(186, 104, 200, 0.6)'
              : user.subscription.type === 'ultimate'
                ? 'rgba(124, 77, 255, 0.7)'
                : user.subscription.type === 'max'
                  ? 'rgba(208, 7, 7, 0.3)'
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
          animation: 'pulse-light 2s infinite',
          '@keyframes pulse-light': {
            '0%': {
              boxShadow:
                user.status_color && user.status_text
                  ? `0 0 0 0 ${user.status_color}66`
                  : user.subscription.type === 'ultimate'
                    ? '0 0 0 0 rgba(124, 77, 255, 0.6)'
                    : user.subscription.type === 'max'
                      ? '0 0 0 0 rgba(255, 77, 80, 0.6)'
                      : '0 0 0 0 rgba(124, 77, 255, 0.4)',
            },
            '70%': {
              boxShadow:
                user.status_color && user.status_text
                  ? `0 0 0 6px ${user.status_color}00`
                  : user.subscription.type === 'ultimate'
                    ? '0 0 0 8px rgba(124, 77, 255, 0)'
                    : user.subscription.type === 'max'
                      ? '0 0 0 8px rgba(255, 77, 80, 0)'
                      : '0 0 0 6px rgba(124, 77, 255, 0)',
            },
            '100%': {
              boxShadow:
                user.status_color && user.status_text
                  ? `0 0 0 0 ${user.status_color}00`
                  : user.subscription.type === 'ultimate'
                    ? '0 0 0 0 rgba(124, 77, 255, 0)'
                    : user.subscription.type === 'max'
                      ? '0 0 0 0 rgba(255, 77, 80, 0)'
                      : '0 0 0 0 rgba(124, 77, 255, 0)',
            },
          },
        }}
      />
    </Tooltip>
  );
};

export default UserSubscriptionBadge;
