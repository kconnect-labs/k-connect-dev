import React from 'react';
import {
  TextField,
  Box,
  Avatar,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import { Repeat2 } from 'lucide-react';
import { formatTimeAgo } from '../../utils/dateUtils';
import { RepostModalProps } from './types';
import UniversalModal from '../../UIKIT/UniversalModal';
import ModalButtonContainer from './ModalButtonContainer';

const RepostModal: React.FC<RepostModalProps> = ({
  open,
  onClose,
  post,
  repostContent,
  setRepostContent,
  repostLoading,
  handleCreateRepost,
  t,
}) => {
  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={t('post.repost_dialog.title')}
      maxWidth="md"
      fullWidth
      addBottomPadding
    >
      {post.is_reposted && (
        <Box
          sx={{
            mb: 3,
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

      <Box sx={{ mb: 3 }}>
        <TextField
          autoFocus
          multiline
          rows={3}
          fullWidth
          placeholder={t('post.repost_dialog.comment_placeholder')}
          value={repostContent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepostContent(e.target.value)}
          variant='outlined'
          helperText={t('post.repost_dialog.mention_helper')}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
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
                color: 'rgba(255, 255, 255, 0.9)',
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
          mb: 3,
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

      <ModalButtonContainer>
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{
            color: '#cfbcfb',
            borderColor: 'rgba(207, 188, 251, 0.3)',
            '&:hover': {
              borderColor: '#cfbcfb',
              backgroundColor: 'rgba(207, 188, 251, 0.1)',
            },
          }}
        >
          {t('post.dialog.cancel')}
        </Button>
        <Button
          onClick={handleCreateRepost}
          variant='contained'
          disabled={repostLoading}
          startIcon={
            repostLoading ? (
              <CircularProgress size={16} color='inherit' />
            ) : null
          }
          sx={{
            backgroundImage: 'linear-gradient(90deg, #7B68EE, #8778F0)',
            color: 'white',
            '&:hover': {
              opacity: 0.9,
            },
            '&:disabled': {
              color: 'rgba(255, 255, 255, 0.5)',
              backgroundImage: 'none',
              backgroundColor: 'rgba(40, 40, 40, 0.4)',
            },
          }}
        >
          {t('post.repost_dialog.repost_button')}
        </Button>
      </ModalButtonContainer>
    </UniversalModal>
  );
};

export default RepostModal; 