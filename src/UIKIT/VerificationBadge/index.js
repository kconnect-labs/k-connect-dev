import React, { useState } from 'react';
import { Tooltip, SvgIcon, Box, styled } from '@mui/material';
import { ReactComponent as VerifSvg } from './badge/verif.svg';
import { ReactComponent as MainSvg } from './badge/main.svg';
import { ReactComponent as VipSvg } from './badge/vip.svg';
import { ReactComponent as ModeSvg } from './badge/mode.svg';
import { ReactComponent as SupSvg } from './badge/sup.svg';
import { ReactComponent as ChannelVerifSvg } from './badge/channelVERIF.svg';
import { ReactComponent as ChannelPremSvg } from './badge/channelPREM.svg';

/**
 * Modern verification badge component with different styles based on status
 *
 * @param {Object} props - Component props
 * @param {string|number} props.status - Verification status code
 * @param {string} props.size - Size of the badge ('small' or default)
 * @param {Function} props.onClick - Optional click handler
 * @returns {React.ReactElement}
 */
const VerifiedBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 19,
      height: props.size === 'small' ? 20 : 19,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <MainSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const OfficialBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 19,
      height: props.size === 'small' ? 20 : 19,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <VerifSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const VIPBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 19,
      height: props.size === 'small' ? 20 : 19,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <VipSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const ModeratorBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 19,
      height: props.size === 'small' ? 20 : 19,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <ModeSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const SupportBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 19,
      height: props.size === 'small' ? 20 : 19,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <SupSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const ChannelVerifiedBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 20,
      height: props.size === 'small' ? 20 : 20,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <ChannelVerifSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const ChannelPremiumBadge = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    onClick={props.onClick}
    onTouchStart={props.onTouchStart}
    sx={{
      width: props.size === 'small' ? 20 : 20,
      height: props.size === 'small' ? 20 : 20,
      ml: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: props.onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': props.onClick
        ? {
            transform: 'scale(1.1)',
          }
        : {},
      '&:active': props.onClick
        ? {
            transform: 'scale(0.95)',
          }
        : {},
    }}
  >
    <ChannelPremSvg style={{ width: '100%', height: '100%' }} />
  </Box>
));

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(40px)',
    fontSize: '0.75rem',
    maxWidth: 250,
    padding: '8px 12px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  '& .MuiTooltip-arrow': {
    color: 'rgba(255, 255, 255, 0.03)',
  },
}));

const VerificationBadge = React.forwardRef(({ status, size, onClick }, ref) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!status) return null;

  const getColorAndTitle = status => {
    if (status === 'verified') {
      return {
        color: '#D0BCFF',
        title: '✓ Верифицированный аккаунт',
        description:
          'Этот аккаунт прошел верификацию и подтвержден администрацией',
      };
    }

    switch (Number(status)) {
      case 1:
        return {
          color: '#9e9e9e',
          title: '✓ Верифицированный аккаунт',
          description: 'Этот аккаунт прошел верификацию.',
        };
      case 2:
        return {
          color: '#d67270',
          title: '🏛️ Официальный аккаунт',
          description: 'Официальный аккаунт подтвержденный администрацией',
        };
      case 3:
        return {
          color: '#b39ddb',
          title: '👑 VIP аккаунт',
          description: 'Аккаунт друга проекта',
        };
      case 4:
        return {
          color: '#ff9800',
          title: '🛡️ Модератор',
          description: 'Модератор платформы с правами управления контентом',
        };
      case 5:
        return {
          color: '#4caf50',
          title: '💬 Поддержка',
          description: 'Представитель службы поддержки платформы',
        };
      case 6:
        return {
          color: '#1e88e5',
          title: '📺 Канал (Верифицированный)',
          description:
            'Официальный верифицированный канал с подтвержденной подлинностью',
          isChannelVerified: true,
        };
      case 7:
        return {
          color: '#7c4dff',
          title: '⭐ Канал (Премиум)',
          description:
            'Премиум канал с расширенными возможностями и привилегиями',
          isChannelPremium: true,
        };
      default:
        return {
          color: '#D0BCFF',
          title: '✓ Верифицированный аккаунт',
          description:
            'Этот аккаунт прошел верификацию и подтвержден администрацией',
        };
    }
  };

  const { color, title, description, isChannelVerified, isChannelPremium } =
    getColorAndTitle(status);

  const handleClick = e => {
    e.stopPropagation();
    e.preventDefault();

    // Показываем тултип на мобильных устройствах при клике
    if (onClick) {
      onClick(status, title, description);
    } else {
      // Если нет onClick, просто показываем тултип
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), 3000);
    }
  };

  const handleTouchStart = e => {
    e.stopPropagation();
    e.preventDefault();

    // Показываем тултип на мобильных устройствах при касании
    if (onClick) {
      onClick(status, title, description);
    } else {
      setTooltipOpen(true);
      setTimeout(() => setTooltipOpen(false), 3000);
    }
  };

  const tooltipContent = (
    <Box sx={{ textAlign: 'center', p: 0.5 }}>
      <Box sx={{ fontWeight: 600, fontSize: '0.85rem', mb: 0.5 }}>{title}</Box>
      <Box sx={{ fontSize: '0.75rem', opacity: 0.8, maxWidth: 200 }}>
        {description}
      </Box>
    </Box>
  );

  return (
    <CustomTooltip
      title={tooltipContent}
      placement='top'
      arrow
      open={tooltipOpen}
      onClose={() => setTooltipOpen(false)}
      disableFocusListener
      disableHoverListener
      disableTouchListener
    >
      <span>
        {isChannelVerified ? (
          <ChannelVerifiedBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        ) : isChannelPremium ? (
          <ChannelPremiumBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        ) : Number(status) === 2 ? (
          <OfficialBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        ) : Number(status) === 3 ? (
          <VIPBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        ) : Number(status) === 4 ? (
          <ModeratorBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        ) : Number(status) === 5 ? (
          <SupportBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        ) : (
          <VerifiedBadge
            ref={ref}
            size={size}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
          />
        )}
      </span>
    </CustomTooltip>
  );
});

export default VerificationBadge;
