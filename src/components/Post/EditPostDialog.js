import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTheme } from '@mui/material/styles';

const EditPostDialog = ({
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
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          bgcolor: 'rgba(32, 32, 36, 0.8)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          width: '95%',
          maxWidth: '600px',
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
      fullWidth
      maxWidth='md'
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232196f3'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
          },
        }}
      >
        {t('post.edit_dialog.title')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: 3 }}>
        <Typography
          variant='caption'
          sx={{ display: 'block', color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}
        >
          {t('post.edit_dialog.time_limit')}
        </Typography>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
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
                borderColor: '#2196f3',
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
        {(post.images?.length > 0 || post.image) &&
          !editDialog.deleteImages && (
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant='subtitle2' gutterBottom>
                {t('post.edit_dialog.current_images')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {post.images
                  ? post.images.map((img, idx) => (
                      <Box
                        key={`current-img-${idx}`}
                        component='img'
                        src={img}
                        alt={t('post.edit_dialog.image_alt', {
                          number: idx + 1,
                        })}
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
                        color: '#2196f3',
                      },
                    }}
                  />
                }
                label={t('post.edit_dialog.delete_current_images')}
                sx={{
                  mt: 1,
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem',
                  },
                }}
              />
            </Box>
          )}
        {post.video && !editDialog.deleteVideo && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant='subtitle2' gutterBottom>
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
                      color: '#2196f3',
                    },
                  }}
                />
              }
              label={t('post.edit_dialog.delete_current_video')}
              sx={{
                mt: 1,
                display: 'block',
                color: 'rgba(255, 255, 255, 0.8)',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>
        )}
        {post.music && post.music.length > 0 && !editDialog.deleteMusic && (
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant='subtitle2' gutterBottom>
              {t('post.edit_dialog.current_audio')}
            </Typography>
            <List dense>
              {post.music.map((track, idx) => (
                <ListItem key={`track-${idx}`}>
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
                      color: '#2196f3',
                    },
                  }}
                />
              }
              label={t('post.edit_dialog.delete_current_audio')}
              sx={{
                mt: 1,
                display: 'block',
                color: 'rgba(255, 255, 255, 0.8)',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          {t('post.edit_dialog.cancel')}
        </Button>
        <Button
          onClick={handleSubmitEdit}
          disabled={submitting}
          variant='contained'
          color='primary'
          startIcon={
            submitting ? <CircularProgress size={16} color='inherit' /> : null
          }
          sx={{
            bgcolor: '#2196f3',
            '&:hover': {
              bgcolor: '#1976d2',
            },
          }}
        >
          {submitting
            ? t('post.edit_dialog.submitting')
            : t('post.edit_dialog.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostDialog;
