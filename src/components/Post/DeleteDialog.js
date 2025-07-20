import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DeleteDialog = ({
  open,
  onClose,
  deleteDialog,
  setDeleteDialog,
  confirmDelete,
  t,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() =>
        !deleteDialog.deleting &&
        !deleteDialog.deleted &&
        setDeleteDialog({ ...deleteDialog, open: false })
      }
      PaperProps={{
        sx: {
          bgcolor: 'rgba(32, 32, 36, 0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '400px',
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
      <Box sx={{ p: 3 }}>
        {deleteDialog.deleted ? (
          <>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: '#4CAF50', mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 1, color: 'white' }}>
                {t('post.delete_dialog.success_title')}
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {t('post.delete_dialog.success_message')}
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography
              variant='h6'
              sx={{
                mb: 2,
                color: '#f44336',
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <DeleteIcon sx={{ mr: 1 }} /> {t('post.delete_dialog.title')}
            </Typography>
            <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
              {t('post.delete_dialog.confirmation')}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                onClick={() =>
                  setDeleteDialog({ ...deleteDialog, open: false })
                }
                disabled={deleteDialog.deleting}
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
                {t('post.delete_dialog.cancel')}
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteDialog.deleting}
                variant='contained'
                color='error'
                sx={{
                  borderRadius: '10px',
                  boxShadow: 'none',
                  px: 2,
                }}
                endIcon={
                  deleteDialog.deleting ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : null
                }
              >
                {deleteDialog.deleting
                  ? t('post.delete_dialog.deleting')
                  : t('post.delete_dialog.delete')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default DeleteDialog;
