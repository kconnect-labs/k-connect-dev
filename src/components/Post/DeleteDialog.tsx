import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DeleteDialogProps } from './types';
import UniversalModal from '../../UIKIT/UniversalModal';
import ModalButtonContainer from './ModalButtonContainer';

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  deleteDialog,
  setDeleteDialog,
  confirmDelete,
  t,
}) => {
  const handleClose = () => {
    if (!deleteDialog.deleting && !deleteDialog.deleted) {
      setDeleteDialog({ ...deleteDialog, open: false });
    }
  };

  return (
    <UniversalModal
      open={open}
      onClose={handleClose}
      title={
        deleteDialog.deleted
          ? t('post.delete_dialog.success_title')
          : t('post.delete_dialog.title')
      }
      maxWidth='sm'
      fullWidth
      addBottomPadding
    >
      {deleteDialog.deleted ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Avatar
            sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              color: '#4CAF50',
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography
            variant='h6'
            sx={{ mb: 1, color: '#cfbcfb', fontWeight: 600 }}
          >
            {t('post.delete_dialog.success_title')}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(207, 188, 251, 0.8)',
              maxWidth: '80%',
              mx: 'auto',
            }}
          >
            {t('post.delete_dialog.success_message')}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
                color: '#f44336',
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2,
              }}
            >
              <DeleteIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography
              variant='h6'
              sx={{ mb: 1, color: '#cfbcfb', fontWeight: 600 }}
            >
              {t('post.delete_dialog.title')}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(207, 188, 251, 0.8)',
                maxWidth: '80%',
                mx: 'auto',
              }}
            >
              {t('post.delete_dialog.confirmation')}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(244, 67, 54, 0.05)',
              borderRadius: 'var(--main-border-radius)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              mb: 3,
            }}
          >
            <Typography
              variant='body2'
              sx={{ color: 'rgba(207, 188, 251, 0.9)', textAlign: 'center' }}
            >
              Это действие нельзя отменить
            </Typography>
          </Box>
        </>
      )}

      <ModalButtonContainer>
        {deleteDialog.deleted ? (
          <Button
            onClick={handleClose}
            variant='contained'
            fullWidth
            sx={{
              backgroundImage: 'linear-gradient(90deg, #6b5d97, #827095)',
              color: 'white',
              '&:hover': {
                opacity: 0.9,
              },
            }}
          >
            Закрыть
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
              disabled={deleteDialog.deleting}
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
              {t('post.delete_dialog.cancel')}
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteDialog.deleting}
              variant='contained'
              color='error'
              startIcon={
                deleteDialog.deleting ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <DeleteIcon />
                )
              }
              sx={{
                backgroundColor: '#f44336',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(244, 67, 54, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {deleteDialog.deleting
                ? t('post.delete_dialog.deleting')
                : t('post.delete_dialog.delete')}
            </Button>
          </>
        )}
      </ModalButtonContainer>
    </UniversalModal>
  );
};

export default DeleteDialog;
