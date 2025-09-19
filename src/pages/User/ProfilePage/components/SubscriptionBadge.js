import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { MaxIcon } from '../../../../components/icons/CustomIcons';
import { useLanguage } from '../../../../context/LanguageContext';

const SubscriptionBadge = ({
  duration,
  subscriptionDate,
  subscriptionType,
}) => {
  const { t } = useLanguage();

  if (!duration || duration < 1 || !['ultimate', 'max'].includes(subscriptionType)) return null;

  console.log(
    `SubscriptionBadge: duration=${duration}, type=${subscriptionType}`
  );

  let badgeType = 'bronze';
  if (subscriptionType === 'max') {
    badgeType = 'max';
  } else if (duration >= 6) {
    badgeType = 'diamond';
  } else if (duration >= 3) {
    badgeType = 'gold';
  } else if (duration >= 2) {
    badgeType = 'silver';
  }

  console.log(`SubscriptionBadge: selected badge type=${badgeType}`);

  const tooltipText = `${t('profile.subscription.subscriber')} • ${duration} ${t('profile.subscription.days_left')}`;

  return (
    <Tooltip title={tooltipText} arrow placement='top'>
      <Box
        sx={{
          width: 24,
          height: 24,
          ml: 0.5,
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            transform: 'scale(1.2)',
          },
        }}
      >
        {subscriptionType === 'max' ? (
          <MaxIcon size={24} color="#FF4D50" />
        ) : (
          <Box
            component='img'
            src={`/static/subs/${badgeType}.svg`}
            alt={`${badgeType} подписка`}
            sx={{ width: '100%', height: '100%' }}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default SubscriptionBadge;
