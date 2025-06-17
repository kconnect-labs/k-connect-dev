import React, { useState, useEffect } from 'react';
import { Box, Typography, keyframes, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RepeatIcon from '@mui/icons-material/Repeat';
import PostAddIcon from '@mui/icons-material/PostAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GavelIcon from '@mui/icons-material/Gavel';
import MessageIcon from '@mui/icons-material/Message';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Icon } from '@iconify/react';
import walletMoneyIcon from '@iconify-icons/solar/wallet-money-bold';

// Keyframes animations for different notification types
const pillExpand = keyframes`
  0% { width: 100px; border-radius: 50px; opacity: 0; transform: translateY(-20px) scale(0.8); }
  20% { opacity: 1; transform: translateY(0) scale(1); }
  80% { width: 300px; border-radius: 24px; }
  100% { width: 300px; border-radius: 24px; }
`;

const pillContract = keyframes`
  0% { width: 300px; border-radius: 24px; opacity: 1; }
  20% { width: 250px; border-radius: 30px; opacity: 0.9; }
  80% { width: 100px; border-radius: 50px; opacity: 0.3; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px) scale(0.8); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const dropAnimation = keyframes`
  0% { transform: translateY(-50px); opacity: 0; }
  50% { transform: translateY(10px); opacity: 1; }
  70% { transform: translateY(-5px); }
  100% { transform: translateY(0); opacity: 1; }
`;

// Styled components for the notification
const NotificationContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isVisible' && prop !== 'animationType'
})(({ theme, isVisible, animationType }) => {
  const animation = isVisible 
    ? `${pillExpand} 0.5s forwards`
    : `${pillContract} 0.5s forwards`;
  
  const pulseAnim = `${pulseAnimation} 2s infinite`;
  const bounceAnim = `${bounceAnimation} 2s infinite`;
  const dropAnim = `${dropAnimation} 0.5s forwards`;
  
  let additionalAnimation = '';
  if (animationType === 'pulse') additionalAnimation = pulseAnim;
  if (animationType === 'bounce') additionalAnimation = bounceAnim;
  if (animationType === 'drop') additionalAnimation = dropAnim;
  
  return {
    position: 'fixed',
    top: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(20, 20, 22, 0.95)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    animation: animation,
    overflow: 'hidden',
    width: '300px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '& .animation-wrapper': {
      animation: additionalAnimation,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minWidth: 0,
    },
    '& .notification-bg-icon': {
      position: 'absolute',
      right: 20,
      top: '50%',
      transform: 'translateY(-50%) rotate(-15deg)',
      fontSize: '3rem',
      opacity: 0.3,
      color: theme.palette.primary.main,
      pointerEvents: 'none',
      filter: 'blur(2px)',
      '& svg': {
        filter: `drop-shadow(0 0 8px ${alpha(theme.palette.primary.main, 0.6)})`,
      }
    }
  };
});

const IconContainer = styled(Box)(({ theme, notificationType }) => {
  const colors = {
    success: '#4caf50',
    error: '#ff5252',
    warning: '#fb8c00',
    info: '#2196f3',
    notification: '#D0BCFF'
  };
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    color: colors[notificationType] || colors.info,
    '& svg': {
      fontSize: 20
    }
  };
});

const MessageContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden',
});

const getNotificationIcon = (type) => {
  switch (type) {
    case 'comment_like':
    case 'reply_like':
    case 'post_like':
      return <FavoriteIcon sx={{ fontSize: '3rem' }} />;
    case 'comment':
    case 'reply':
      return <ChatBubbleIcon sx={{ fontSize: '3rem' }} />;
    case 'follow':
      return <PersonAddIcon sx={{ fontSize: '3rem' }} />;
    case 'repost':
      return <RepeatIcon sx={{ fontSize: '3rem' }} />;
    case 'wall_post':
      return <PostAddIcon sx={{ fontSize: '3rem' }} />;
    case 'points_transfer':
      return <Icon icon={walletMoneyIcon} width="3rem" height="3rem" />;
    case 'badge_purchase':
    case 'username_auction_bid':
    case 'username_bid_accepted':
    case 'username_auction_outbid':
    case 'username_auction_sold':
    case 'username_auction_won':
    case 'username_auction_cancelled':
    case 'username_auction_bid_increased':
    case 'auction_win':
    case 'auction_sold':
    case 'auction_refund':
    case 'new_auction_bid':
      return <MonetizationOnIcon sx={{ fontSize: '3rem' }} />;
    case 'moderation':
    case 'ban':
    case 'unban':
    case 'warning':
      return <GavelIcon sx={{ fontSize: '3rem' }} />;
    case 'mention':
      return <MessageIcon sx={{ fontSize: '3rem' }} />;
    case 'medal':
      return <EmojiEventsIcon sx={{ fontSize: '3rem' }} />;
    default:
      return <NotificationsIcon sx={{ fontSize: '3rem' }} />;
  }
};

/**
 * Dynamic Island style notification component
 */
const DynamicIslandNotification = ({ 
  open = false,
  message = "",
  shortMessage = "",
  notificationType = "info",
  animationType = "pill",
  autoHideDuration = 3000,
  onClose = () => {},
  icon = null,
  notificationData = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle visibility with animation timing
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      
      // Auto hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        
        // Additional delay to allow exit animation to complete
        setTimeout(() => {
          onClose();
        }, 500);
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [open, autoHideDuration, onClose]);
  
  // Select the right icon based on notification type
  const getIcon = () => {
    if (icon) return icon;
    
    switch (notificationType) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return notificationType === 'network' ? <WifiOffIcon /> : <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'auth':
        return <LockIcon />;
      case 'notification':
        return <NotificationsIcon />;
      case 'info':
      default:
        return <InfoIcon />;
    }
  };
  
  // Bail out if not open
  if (!open && !isVisible) return null;
  
  return (
    <NotificationContainer isVisible={isVisible} animationType={animationType}>
      <div className="animation-wrapper">
        <IconContainer notificationType={notificationType}>
          {getIcon()}
        </IconContainer>
        
        {isVisible && (
          <MessageContainer>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {shortMessage || message}
            </Typography>
            {shortMessage && message && shortMessage !== message && (
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {message}
              </Typography>
            )}
          </MessageContainer>
        )}
      </div>
      <Box className="notification-bg-icon">
        {notificationData ? getNotificationIcon(notificationData.type) : getNotificationIcon('default')}
      </Box>
    </NotificationContainer>
  );
};

export default DynamicIslandNotification; 