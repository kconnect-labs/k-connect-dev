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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ReportDialog = ({
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
  <Dialog
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        bgcolor: 'rgba(32, 32, 36, 0.8)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '450px',
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF9800'%3E%3Cpath d='M14.4 6l-.24-1.2c-.09-.46-.5-.8-.98-.8H6c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1v-6h5.6l.24 1.2c.09.47.5.8.98.8H19c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-4.6z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        },
      }}
    >
      {t('post.report_dialog.title')}
    </DialogTitle>
    {reportDialog.submitted ? (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 56, color: '#4CAF50', mb: 2 }} />
        <Typography variant='h6' sx={{ mb: 1, color: 'white' }}>
          {t('post.report_dialog.success_title')}
        </Typography>
        <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {t('post.report_dialog.success_message')}
        </Typography>
      </Box>
    ) : (
      <>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Typography
            variant='body2'
            sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {t('post.report_dialog.description')}
          </Typography>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}
          >
            {reportReasons.map(reason => (
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
                  borderRadius: '10px',
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
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('post.report.placeholder')}
              variant='outlined'
              value={reportDialog.customReason || ''}
              onChange={e =>
                setReportDialog({
                  ...reportDialog,
                  customReason: e.target.value,
                })
              }
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 152, 0, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff9800',
                    borderWidth: '1px',
                  },
                },
              }}
            />
          )}
          <Box
            sx={{
              p: 2,
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: '10px',
              bgcolor: 'rgba(255, 152, 0, 0.05)',
            }}
          >
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.5)',
                mb: 1,
              }}
            >
              {t('post.report_dialog.post_by_user', {
                username: post?.user?.name,
              })}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
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
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
            }}
          >
            {t('post.report_dialog.cancel')}
          </Button>
          <Button
            onClick={handleReportSubmit}
            disabled={submitting || !reportDialog.reason}
            variant='contained'
            color='warning'
            startIcon={
              submitting ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <ReportProblemIcon />
              )
            }
            sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
          >
            {submitting
              ? t('post.report_dialog.submitting')
              : t('post.report_dialog.submit')}
          </Button>
        </DialogActions>
      </>
    )}
  </Dialog>
);

export default ReportDialog;
