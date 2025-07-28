import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
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
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const getNotificationIcon = type => {
  switch (type) {
    case 'comment_like':
    case 'reply_like':
    case 'post_like':
      return <FavoriteIcon />;
    case 'comment':
    case 'reply':
      return <ChatBubbleIcon />;
    case 'follow':
      return <PersonAddIcon />;
    case 'repost':
      return <RepeatIcon />;
    case 'wall_post':
      return <PostAddIcon />;
    case 'points_transfer':
      return <Icon icon={walletMoneyIcon} width='20' height='20' />;
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
      return <MonetizationOnIcon />;
    case 'moderation':
    case 'ban':
    case 'unban':
    case 'warning':
      return <GavelIcon />;
    case 'mention':
      return <MessageIcon />;
    case 'medal':
      return <EmojiEventsIcon />;
    default:
      return <NotificationsIcon />;
  }
};

const getNotificationMessage = (notification, t) => {
  if (!t || !notification || !notification.message)
    return notification?.message || '';

  const pointsMatch = notification.message.match(/(\d+)\s+балл[а-я]*/);
  const points = pointsMatch ? pointsMatch[1] : null;
  const badgeMatch = notification.message.match(/бейджик «([^»]+)»/);
  const badgeName = badgeMatch ? badgeMatch[1] : null;
  const priceMatch = notification.message.match(/за (\d+) балл/);
  const price = priceMatch ? priceMatch[1] : null;
  const royaltyMatch = notification.message.match(/\+(\d+) балл/);
  const royalty = royaltyMatch ? royaltyMatch[1] : null;

  switch (notification.type) {
    case 'post_like':
      return t('notifications.messages.post_like');
    case 'post_comment':
      return t('notifications.messages.post_comment');
    case 'comment_like':
      return t('notifications.messages.comment_like');
    case 'post_repost':
      return t('notifications.messages.post_repost');
    case 'points_transfer':
      return points
        ? t('notifications.messages.points_transfer', { points })
        : notification.message;
    case 'badge_purchase':
      return badgeName && price && royalty
        ? t('notifications.messages.badge_purchase', {
            badge: badgeName,
            price,
            royalty,
          })
        : notification.message;
    case 'wall_post':
      return t('notifications.messages.wall_post');
    case 'comment_reply':
      return t('notifications.messages.comment_reply', {
        username:
          notification.sender_user?.name || t('notifications.user.default'),
      });
    default:
      return notification.message;
  }
};

/**
 * iOS Dynamic Island style notification component with spring physics
 */
const DynamicIslandNotification = ({
  open = false,
  message = '',
  shortMessage = '',
  notificationType = 'info',
  autoHideDuration = 3000,
  onClose = () => {},
  icon = null,
  notificationData = null,
}) => {
  let t;
  try {
    const langContext = useLanguage();
    t = langContext?.t;
  } catch (e) {
    t = null;
  }

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

  const getDisplayMessage = () => {
    if (notificationData) {
      return getNotificationMessage(notificationData, t);
    }
    return message;
  };

  // iOS Dynamic Island spring animations
  const islandVariants = {
    hidden: {
      scale: 0.8,
      y: -20,
      opacity: 0,
      borderRadius: 25,
      height: 40,
    },
    visible: {
      scale: 1,
      y: 0,
      opacity: 1,
      borderRadius: 25,
      height: 60,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      }
    },
    exit: {
      scale: 0.8,
      y: -20,
      opacity: 0,
      borderRadius: 25,
      height: 40,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
        mass: 0.5,
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: 0.1,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
      }
    }
  };

  const iconVariants = {
    hidden: { rotate: -180, scale: 0 },
    visible: { 
      rotate: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 20,
        delay: 0.2,
      }
    },
    exit: { 
      rotate: 180, 
      scale: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
      }
    }
  };

  const textVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.3,
      }
    },
    exit: { 
      x: 20, 
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      }
    }
  };



  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{
            position: 'fixed',
            top: 20,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <motion.div
            variants={islandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={(definition) => {
              if (definition === "visible") {
                // Auto hide after duration
                setTimeout(() => {
                  onClose();
                }, autoHideDuration);
              }
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              position: 'relative',
              overflow: 'hidden',
              minWidth: '200px',
              maxWidth: '400px',
            }}
          >
            {/* Main content */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Icon */}
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  color: '#D0BCFF',
                }}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
          {getIcon()}
              </motion.div>

              {/* Text content */}
              <motion.div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                }}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
            <Typography
                  variant="subtitle2"
                  style={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {shortMessage || getDisplayMessage()}
            </Typography>
            {shortMessage && message && shortMessage !== message && (
              <Typography
                    variant="caption"
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '12px',
                      lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {getDisplayMessage()}
              </Typography>
            )}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicIslandNotification;
