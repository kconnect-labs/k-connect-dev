import React from 'react';
import {
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { EditPostDialogProps, MusicTrack } from './types';
import UniversalModal from '../../UIKIT/UniversalModal';
import ModalButtonContainer from './ModalButtonContainer';

const EditPostDialog: React.FC<EditPostDialogProps> = ({
  open,
  onClose,
  editDialog,
  t,
  post,
  handleEditContentChange,
  handleToggleDeleteImages,
  handleToggleDeleteVideo,
  handleToggleDeleteMusic,
  handleSubmitEdit,
  submitting,
  error,
}) => {
  const parseMusicTracks = (music: MusicTrack[] | string | undefined): MusicTrack[] => {
    if (!music) return [];
    if (Array.isArray(music)) return music;
    if (typeof music === 'string') {
      try {
        return JSON.parse(music);
      } catch {
        return [];
      }
    }
    return [];
  };

  const musicTracks = parseMusicTracks(post.music);

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={t('post.edit_dialog.title')}
      maxWidth="md"
      fullWidth
      addBottomPadding
    >
      <Box sx={{ mb: 3 }}>
        <Typography
          variant='body2'
          sx={{ 
            color: '#cfbcfb', 
            textAlign: 'center',
            mb: 3,
            opacity: 0.8
          }}
        >
          {t('post.edit_dialog.time_limit')}
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity='error' 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#f44336',
            '& .MuiAlert-icon': {
              color: '#f44336',
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={8}
          label={t('post.edit_dialog.post_text')}
          value={editDialog.content}
          onChange={handleEditContentChange}
          margin='normal'
          disabled={submitting}
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
                borderColor: '#6e5a9d',
                borderWidth: '1px',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiInputBase-input': {
              color: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        />
      </Box>

      {(post.images?.length > 0 || post.image) && !editDialog.deleteImages && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' gutterBottom sx={{ color: '#cfbcfb', mb: 2 }}>
            {t('post.edit_dialog.current_images')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {post.images
              ? post.images.map((img, idx) => (
                  <Box
                    key={`current-img-${idx}`}
                    component='img'
                    src={img}
                    alt={t('post.edit_dialog.image_alt', { number: idx + 1 })}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                ))
              : post.image && (
                  <Box
                    component='img'
                    src={post.image}
                    alt={t('post.edit_dialog.post_image_alt')}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                )}
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={editDialog.deleteImages}
                onChange={handleToggleDeleteImages}
                disabled={submitting}
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&.Mui-checked': {
                    color: '#6e5a9d',
                  },
                }}
              />
            }
            label={t('post.edit_dialog.delete_current_images')}
            sx={{
              color: 'rgba(207, 188, 251, 0.8)',
              '& .MuiFormControlLabel-label': {
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>
      )}

      {post.video && !editDialog.deleteVideo && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' gutterBottom sx={{ color: '#cfbcfb', mb: 2 }}>
            {t('post.edit_dialog.current_video')}
          </Typography>
          <Box
            component='video'
            src={post.video}
            controls
            sx={{
              maxWidth: '100%',
              height: 120,
              borderRadius: 1,
              mb: 2,
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={editDialog.deleteVideo}
                onChange={handleToggleDeleteVideo}
                disabled={submitting}
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&.Mui-checked': {
                    color: '#6e5a9d',
                  },
                }}
              />
            }
            label={t('post.edit_dialog.delete_current_video')}
            sx={{
              color: 'rgba(207, 188, 251, 0.8)',
              '& .MuiFormControlLabel-label': {
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>
      )}

      {musicTracks.length > 0 && !editDialog.deleteMusic && (
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' gutterBottom sx={{ color: '#cfbcfb', mb: 2 }}>
            {t('post.edit_dialog.current_audio')}
          </Typography>
          <List dense sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1, mb: 2 }}>
            {musicTracks.map((track, idx) => (
              <ListItem key={`track-${idx}`} sx={{ color: 'rgba(207, 188, 251, 0.8)' }}>
                {track.title || t('post.edit_dialog.audio_track')}
              </ListItem>
            ))}
          </List>
          <FormControlLabel
            control={
              <Checkbox
                checked={editDialog.deleteMusic}
                onChange={handleToggleDeleteMusic}
                disabled={submitting}
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&.Mui-checked': {
                    color: '#6e5a9d',
                  },
                }}
              />
            }
            label={t('post.edit_dialog.delete_current_audio')}
            sx={{
              color: 'rgba(207, 188, 251, 0.8)',
              '& .MuiFormControlLabel-label': {
                fontSize: '0.9rem',
              },
            }}
          />
        </Box>
      )}

      <ModalButtonContainer>
        <Button
          onClick={onClose}
          disabled={submitting}
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
          {t('post.edit_dialog.cancel')}
        </Button>
        <Button
          onClick={handleSubmitEdit}
          disabled={submitting}
          variant='contained'
          startIcon={
            submitting ? (
              <CircularProgress size={16} color='inherit' />
            ) : (
              <EditIcon />
            )
          }
          sx={{
            backgroundImage: 'linear-gradient(90deg, #6b5d97, #827095)',
            color: 'white',
            '&:hover': {
              opacity: 0.9,
            },
            '&:disabled': {
              color: 'rgba(255,255,255,0.5)',
              backgroundImage: 'none',
              backgroundColor: 'rgba(40, 40, 40, 0.4)',
            },
          }}
        >
          {submitting
            ? t('post.edit_dialog.submitting')
            : t('post.edit_dialog.save')}
        </Button>
      </ModalButtonContainer>
    </UniversalModal>
  );
};

export default EditPostDialog; 