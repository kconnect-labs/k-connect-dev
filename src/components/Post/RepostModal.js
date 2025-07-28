import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Repeat2 } from 'lucide-react';
import { formatTimeAgo } from '../../utils/dateUtils';
import { USERNAME_MENTION_REGEX } from '../../utils/LinkUtils';

const RepostModal = ({
  open,
  onClose,
  post,
  repostContent,
  setRepostContent,
  repostLoading,
  handleCreateRepost,
  t,
}) => {
  const renderRepostInputWithMentions = () => {
    if (!repostContent) return null;

    const parts = [];
    let lastIndex = 0;

    USERNAME_MENTION_REGEX.lastIndex = 0;

    let match;
    while ((match = USERNAME_MENTION_REGEX.exec(repostContent)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {repostContent.substring(lastIndex, match.index)}
          </span>
        );
      }

      parts.push(
        <span
          key={`mention-${match.index}`}
          style={{
            color: '#7B68EE',
            fontWeight: 'bold',
            background: 'rgba(123, 104, 238, 0.08)',
            padding: '0 4px',
            borderRadius: '4px',
          }}
        >
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < repostContent.length) {
      parts.push(
        <span key={`text-end`}>{repostContent.substring(lastIndex)}</span>
      );
    }

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '16.5px 14px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '0.95rem',
          pointerEvents: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
        }}
      >
        {parts}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={e => e.stopPropagation()}
      PaperProps={{
        sx: {
          bgcolor: 'rgba(32, 32, 36, 0.8)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '500px',
          borderRadius: '16px',
          border: '1px solid rgba(100, 90, 140, 0.1)',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '16px',
            background:
              'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
            backdropFilter: 'blur(30px)',
            zIndex: -1,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid rgba(100, 90, 140, 0.1)',
          px: 3,
          py: 2,
          color: 'white',
          fontWeight: 500,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          '&:before': {
            content: '""',
            display: 'inline-block',
            width: '18px',
            height: '18px',
            marginRight: '10px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237B68EE'%3E%3Cpath d='M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          },
        }}
      >
        {t('post.repost_dialog.title')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: 3 }}>
        {post.type === 'repost' && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: '8px',
              bgcolor: 'rgba(123, 104, 238, 0.08)',
              border: '1px solid rgba(123, 104, 238, 0.15)',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            <Repeat2
              size={18}
              color='#7B68EE'
              style={{ marginRight: '8px', marginTop: '2px' }}
            />
            <Typography variant='body2' sx={{ fontSize: '0.85rem' }}>
              {t('post.repost_dialog.original_post_notice')}
            </Typography>
          </Box>
        )}
        <Box sx={{ position: 'relative' }}>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            placeholder={t('post.repost_dialog.comment_placeholder')}
            value={repostContent}
            onChange={e => setRepostContent(e.target.value)}
            variant='outlined'
            helperText={t('post.repost_dialog.mention_helper')}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(100, 90, 140, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7B68EE',
                  borderWidth: '1px',
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '0.95rem',
                  color: 'transparent',
                  caretColor: 'rgba(255, 255, 255, 0.9)',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                marginTop: '4px',
              },
            }}
          />
          {renderRepostInputWithMentions()}
        </Box>

        <Box
          sx={{
            p: 2.5,
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '12px',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(5px)',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(100, 90, 140, 0.02)',
              backdropFilter: 'blur(5px)',
              borderRadius: '12px',
              zIndex: 0,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1.5,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Avatar
              src={post?.user?.avatar_url}
              alt={post?.user?.name}
              sx={{
                width: 35,
                height: 35,
                mr: 1.5,
              }}
            >
              {post?.user?.name ? post?.user?.name[0] : '?'}
            </Avatar>
            <Box>
              <Typography
                variant='body2'
                fontWeight='medium'
                sx={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: 1.2,
                }}
              >
                {post?.user?.name}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  display: 'block',
                }}
              >
                {formatTimeAgo(post?.timestamp)}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant='body2'
            sx={{
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'rgba(255, 255, 255, 0.85)',
              position: 'relative',
              zIndex: 1,
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {post?.content}
          </Typography>
          {post?.image && (
            <Box
              component='img'
              src={post.image}
              alt={t('post.media.post_image_alt')}
              sx={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '8px',
                mt: 1,
                opacity: 0.9,
                position: 'relative',
                zIndex: 1,
              }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 1.5, justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            color: 'rgba(255, 255, 255, 0.7)',
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          {t('post.dialog.cancel')}
        </Button>
        <Button
          onClick={handleCreateRepost}
          variant='contained'
          disabled={repostLoading}
          sx={{
            borderRadius: '10px',
            bgcolor: '#7B68EE',
            boxShadow: 'none',
            px: 3,
            '&:hover': {
              bgcolor: '#8778F0',
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(100, 90, 140, 0.3)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }}
          endIcon={
            repostLoading ? (
              <CircularProgress size={16} color='inherit' />
            ) : null
          }
        >
          {t('post.repost_dialog.repost_button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepostModal;
