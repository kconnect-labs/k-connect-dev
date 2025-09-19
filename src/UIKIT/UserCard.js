import React, { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Paper,
  Link as MuiLink,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VerifiedIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { UserMenu } from './index';

const UserCardContainer = styled(Paper, {
  shouldForwardProp: prop => prop !== 'cardRadius',
})(({ theme, cardRadius }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(1.2),
  borderRadius: cardRadius ?? 18,
  transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
  minHeight: 72,
  background: 'var(--theme-background, rgba(255,255,255,0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 2px 8px rgba(0,0,0,0.18)'
      : '0 2px 12px rgba(0,0,0,0.07)',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-1px) scale(1.012)',
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 6px 18px rgba(0,0,0,0.22)'
        : '0 8px 24px rgba(0,0,0,0.10)',
  },
}));

const TruncatedText = styled(Typography)(({ theme }) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const UserCard = ({
  id,
  username,
  name,
  about,
  photo,
  is_verified,
  is_following,
  onUnfollow,
  onFollow,
  onMessage,
  onCopyLink,
  onBlock,
  onReport,
  cardRadius,
  forceUnfollow,
  loading,
  showFollowButton = true,
  showMessageButton = true,
  showCopyLinkButton = true,
  showShareButton = true,
  showBlockButton = true,
  showReportButton = true,
}) => {
  let avatarUrl = photo;
  if (
    avatarUrl &&
    !avatarUrl.startsWith('http') &&
    !avatarUrl.startsWith('/')
  ) {
    avatarUrl = `/static/uploads/avatar/${id}/${avatarUrl}`;
  }

  const handleFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (forceUnfollow || is_following) {
      onUnfollow && onUnfollow(id);
    } else {
      onFollow && onFollow(id);
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <MuiLink
        href={`/profile/${username}`}
        underline='none'
        sx={{ display: 'block' }}
      >
        <UserCardContainer cardRadius={cardRadius}>
          <Avatar
            src={avatarUrl || '/static/uploads/avatar/system/avatar.png'}
            alt={name || username}
            sx={{
              width: 48,
              height: 48,
              minWidth: 48,
              marginRight: 2,
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: 1,
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TruncatedText
                variant='subtitle1'
                sx={{ color: 'text.primary', fontWeight: 600, maxWidth: 150 }}
              >
                {name || username}
              </TruncatedText>
              {is_verified && (
                <VerifiedIcon
                  sx={{ ml: 0.5, fontSize: 16, color: 'primary.main' }}
                />
              )}
            </Box>
            <TruncatedText
              variant='body2'
              sx={{ color: 'text.secondary', maxWidth: 200 }}
            >
              @{username}
            </TruncatedText>
          </Box>
          <UserMenu
            id={id}
            username={username}
            isFollowing={is_following}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onMessage={onMessage}
            onCopyLink={onCopyLink}
            onBlock={onBlock}
            onReport={onReport}
            forceUnfollow={forceUnfollow}
            loading={loading}
            size="small"
            showFollowButton={showFollowButton}
            showMessageButton={showMessageButton}
            showCopyLinkButton={showCopyLinkButton}
            showShareButton={showShareButton}
            showBlockButton={showBlockButton}
            showReportButton={showReportButton}
          />
        </UserCardContainer>
      </MuiLink>
    </Box>
  );
};

export default UserCard;
