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
import MoreVertIcon from '@mui/icons-material/MoreVert';

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
  cardRadius,
  forceUnfollow,
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
          <IconButton
            size='small'
            sx={{ ml: 1, alignSelf: 'flex-start' }}
            onClick={handleFollowClick}
            aria-label={forceUnfollow || is_following ? 'Отписаться' : 'Добавить'}
          >
            <MoreVertIcon />
          </IconButton>
        </UserCardContainer>
      </MuiLink>
    </Box>
  );
};

export default UserCard;
