import React from 'react';
import {
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Avatar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { ReportDialogProps } from './types';
import UniversalModal from '../../UIKIT/UniversalModal';
import ModalButtonContainer from './ModalButtonContainer';

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  reportDialog,
  t,
  post,
  reportReasons,
  setReportDialog,
  handleReportSubmit,
  submitting,
  error,
}) => (
  <UniversalModal
    open={open}
    onClose={onClose}
    title={
      reportDialog.submitted
        ? t('post.report_dialog.success_title')
        : t('post.report_dialog.title')
    }
    maxWidth='sm'
    fullWidth
    addBottomPadding
  >
    {reportDialog.submitted ? (
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
          {t('post.report_dialog.success_title')}
        </Typography>
        <Typography
          variant='body2'
          sx={{
            color: 'rgba(207, 188, 251, 0.8)',
            maxWidth: '80%',
            mx: 'auto',
          }}
        >
          {t('post.report_dialog.success_message')}
        </Typography>
      </Box>
    ) : (
      <>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: '#ff9800',
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
            }}
          >
            <ReportProblemIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography
            variant='h6'
            sx={{ mb: 1, color: '#cfbcfb', fontWeight: 600 }}
          >
            {t('post.report_dialog.title')}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(207, 188, 251, 0.8)',
              maxWidth: '80%',
              mx: 'auto',
            }}
          >
            {t('post.report_dialog.description')}
          </Typography>
        </Box>

        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          {reportReasons.map((reason: string) => (
            <Button
              key={reason}
              variant={
                reportDialog.reason === reason ? 'contained' : 'outlined'
              }
              color={reportDialog.reason === reason ? 'warning' : 'inherit'}
              onClick={() =>
                setReportDialog({ ...reportDialog, reason, error: null })
              }
              sx={{
                borderRadius: 'var(--large-border-radius)!important',
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 1,
                backgroundColor:
                  reportDialog.reason === reason
                    ? 'rgba(255, 152, 0, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                borderColor:
                  reportDialog.reason === reason
                    ? 'rgba(255, 152, 0, 0.5)'
                    : 'rgba(255, 255, 255, 0.1)',
                color:
                  reportDialog.reason === reason
                    ? '#ff9800'
                    : 'rgba(207, 188, 251, 0.8)',
                '&:hover': {
                  backgroundColor:
                    reportDialog.reason === reason
                      ? 'rgba(255, 152, 0, 0.15)'
                      : 'rgba(255, 255, 255, 0.1)',
                  borderColor:
                    reportDialog.reason === reason
                      ? 'rgba(255, 152, 0, 0.6)'
                      : 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              {reason}
            </Button>
          ))}
        </Box>

        {reportDialog.reason === t('post.report.reasons.other') && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('post.report.placeholder')}
              variant='outlined'
              value={reportDialog.customReason || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReportDialog({
                  ...reportDialog,
                  customReason: e.target.value,
                })
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--large-border-radius)!important',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 152, 0, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff9800',
                    borderWidth: '1px',
                  },
                  '& textarea': {
                    color: 'rgba(207, 188, 251, 0.9)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(207, 188, 251, 0.7)',
                },
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            p: 2,
            border: '1px solid rgba(255, 152, 0, 0.3)',
            borderRadius: 'var(--large-border-radius)!important',
            bgcolor: 'rgba(255, 152, 0, 0.05)',
            mb: 3,
          }}
        >
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              color: 'rgba(207, 188, 251, 0.6)',
              mb: 1,
            }}
          >
            {t('post.report_dialog.post_by_user')} {post?.user?.name}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: 'rgba(207, 188, 251, 0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.8rem',
            }}
          >
            {post?.content}
          </Typography>
        </Box>
      </>
    )}

    <ModalButtonContainer>
      {reportDialog.submitted ? (
        <Button
          onClick={onClose}
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
            {t('post.report_dialog.cancel')}
          </Button>
          <Button
            onClick={handleReportSubmit}
            disabled={submitting || !reportDialog.reason}
            variant='contained'
            startIcon={
              submitting ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <ReportProblemIcon />
              )
            }
            sx={{
              backgroundImage: 'linear-gradient(90deg, #ff9800, #f57c00)',
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
              ? t('post.report_dialog.submitting')
              : t('post.report_dialog.submit')}
          </Button>
        </>
      )}
    </ModalButtonContainer>
  </UniversalModal>
);

export default ReportDialog;
