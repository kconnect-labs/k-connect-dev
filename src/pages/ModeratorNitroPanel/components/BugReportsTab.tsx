import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  BugReport,
  Search,
  Edit,
  Delete,
  Refresh,
  Person,
  Link,
  Image,
  Tag,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { BugReport as BugReportType } from '../types';

const BugReportsTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const {
    getBugReports,
    updateBugReportStatus,
    deleteBugReport,
    loading,
    error,
    clearError,
  } = useNitroApi();

  const [bugReports, setBugReports] = useState<BugReportType[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsLoadingMore, setReportsLoadingMore] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsHasNext, setReportsHasNext] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingReports, setDeletingReports] = useState<
    Record<number, boolean>
  >({});

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BugReportType | null>(
    null
  );
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  const canManageReports = permissions?.manage_bug_reports || false;
  const canDeleteReports = permissions?.delete_bug_reports || false;

  const BUG_STATUSES = [
    { value: 'open', label: 'Открыт', color: 'error' },
    { value: 'in_progress', label: 'В обработке', color: 'warning' },
    { value: 'resolved', label: 'Решено', color: 'success' },
  ];

  const fetchBugReports = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setReportsLoading(true);
      else setReportsLoadingMore(true);
      setReportsError(null);

      try {
        const response = await getBugReports({
          page,
          per_page: 20,
          search: searchQuery || undefined,
        });

        if (response.bug_reports) {
          console.log('[DEBUG] Bug reports response:', response);
          console.log('[DEBUG] Bug reports data:', response.bug_reports);

          setReportsTotal(response.total);
          setReportsPage(response.page);
          setReportsHasNext(response.has_next);

          setBugReports(prev => {
            const newReports = response.bug_reports;
            if (append) {
              const ids = new Set(prev.map((r: BugReportType) => r.id));
              return [
                ...prev,
                ...newReports.filter((r: BugReportType) => !ids.has(r.id)),
              ];
            }
            return newReports;
          });
        }
      } catch (err) {
        setReportsError('Ошибка загрузки баг репортов');
      } finally {
        setReportsLoading(false);
        setReportsLoadingMore(false);
      }
    },
    [getBugReports, searchQuery]
  );

  useEffect(() => {
    if (canManageReports || canDeleteReports) {
      fetchBugReports(1, false);
    }
  }, [fetchBugReports, canManageReports, canDeleteReports]);

  useEffect(() => {
    if (!reportsHasNext || reportsLoading || reportsLoadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchBugReports(reportsPage + 1, true);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [
    reportsHasNext,
    reportsLoading,
    reportsLoadingMore,
    reportsPage,
    fetchBugReports,
  ]);

  const handleSearch = () => {
    setBugReports([]);
    fetchBugReports(1, false);
  };

  const handleStatusChange = async () => {
    if (!selectedReport || !newStatus) return;

    setStatusLoading(true);
    try {
      await updateBugReportStatus(selectedReport.id, newStatus);

      setBugReports(prev =>
        prev.map(report =>
          report.id === selectedReport.id
            ? {
                ...report,
                status: newStatus as any,
                status_changed_date: new Date().toISOString(),
              }
            : report
        )
      );

      setStatusDialogOpen(false);
      setSelectedReport(null);
      setNewStatus('');
    } catch (err) {
      setReportsError('Ошибка обновления статуса');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!canDeleteReports) {
      setReportsError('У вас нет прав на удаление баг репортов');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить этот баг репорт?')) {
      return;
    }

    setDeletingReports(prev => ({ ...prev, [reportId]: true }));

    try {
      await deleteBugReport(reportId);
      setBugReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      setReportsError('Ошибка удаления баг репорта');
    } finally {
      setDeletingReports(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const openStatusDialog = (report: BugReportType) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setStatusDialogOpen(true);
  };

  const getStatusChip = (status: string) => {
    const statusInfo = BUG_STATUSES.find(s => s.value === status);
    return (
      <Chip
        label={statusInfo?.label || status}
        color={statusInfo?.color as any}
        size='small'
      />
    );
  };

  if (!canManageReports && !canDeleteReports) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity='error' sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant='h6' gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>У вас нет прав на управление баг репортами</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity='error' sx={{ mb: 1 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {reportsError && (
        <Alert
          severity='error'
          sx={{ mb: 1 }}
          onClose={() => setReportsError(null)}
        >
          {reportsError}
        </Alert>
      )}

      {/* Поиск */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          background: 'var(--theme-background)',
          backdropFilter: 'var(--theme-backdrop-filter)',
          border: '1px solid var(--main-border-color)',
          borderRadius: 'var(--main-border-radius)',
          p: 2,
          mb: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder='Поиск по теме или описанию...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          size='small'
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button
          variant='contained'
          onClick={handleSearch}
          startIcon={<Search />}
          size='small'
        >
          Поиск
        </Button>
      </Box>

      {/* Список баг репортов */}
      {reportsLoading && bugReports.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : bugReports.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 'var(--main-border-radius)',
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
          }}
        >
          <Typography variant='body1' color='text.secondary'>
            Нет баг репортов
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1}>
          {bugReports.map((report, idx) => {
            console.log('[DEBUG] Rendering bug report:', report);
            return (
              <Grid item xs={12} key={report.id}>
                <Card
                  sx={{
                    background: 'var(--theme-background)',
                    backdropFilter: 'var(--theme-backdrop-filter)',
                    border: '1px solid var(--main-border-color)',
                    borderRadius: 'var(--main-border-radius)',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 'bold', mb: 0.5 }}
                        >
                          {report.subject}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          {getStatusChip(report.status)}
                          <Typography variant='caption' color='text.secondary'>
                            #{report.id}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {report.date
                              ? new Date(report.date).toLocaleDateString()
                              : 'Дата неизвестна'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {canManageReports && (
                          <Tooltip title='Изменить статус'>
                            <IconButton
                              size='small'
                              onClick={() => openStatusDialog(report)}
                              sx={{
                                borderRadius: 'var(--main-border-radius)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                '&:hover': {
                                  background: 'rgba(255, 255, 255, 0.1)',
                                },
                              }}
                            >
                              <Edit fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDeleteReports && (
                          <Tooltip title='Удалить'>
                            <IconButton
                              size='small'
                              onClick={() => handleDeleteReport(report.id)}
                              disabled={deletingReports[report.id]}
                              sx={{
                                borderRadius: 'var(--main-border-radius)',
                                background: 'rgba(244, 67, 54, 0.05)',
                                '&:hover': {
                                  background: 'rgba(244, 67, 54, 0.1)',
                                },
                              }}
                            >
                              {deletingReports[report.id] ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Delete fontSize='small' />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      {report.text}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      {report.user && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Avatar
                            src={report.user.avatar_url || undefined}
                            sx={{ width: 20, height: 20 }}
                          >
                            {report.user.name
                              ? report.user.name.charAt(0)
                              : '?'}
                          </Avatar>
                          <Typography variant='caption' color='text.secondary'>
                            {report.user.name || 'Неизвестный пользователь'}
                          </Typography>
                        </Box>
                      )}

                      {report.site_link && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Link fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>
                            Ссылка
                          </Typography>
                        </Box>
                      )}

                      {report.image_name && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Image fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>
                            Изображение
                          </Typography>
                        </Box>
                      )}

                      {report.tags && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <Tag fontSize='small' color='action' />
                          <Typography variant='caption' color='text.secondary'>
                            {report.tags}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {idx === bugReports.length - 1 && reportsHasNext && (
                  <div ref={loaderRef} style={{ height: 1 }} />
                )}
              </Grid>
            );
          })}

          {reportsLoadingMore && (
            <Grid
              item
              xs={12}
              sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
            >
              <CircularProgress size={24} />
            </Grid>
          )}
        </Grid>
      )}

      {/* Диалог изменения статуса */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
            borderRadius: 'var(--main-border-radius)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Изменение статуса баг репорта</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectedReport && (
            <Box>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                {selectedReport.subject}
              </Typography>
              <FormControl fullWidth size='small'>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={newStatus}
                  label='Статус'
                  onChange={e => setNewStatus(e.target.value)}
                >
                  {BUG_STATUSES.map(status => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setStatusDialogOpen(false)} size='small'>
            Отмена
          </Button>
          <Button
            onClick={handleStatusChange}
            variant='contained'
            disabled={statusLoading}
            startIcon={
              statusLoading ? <CircularProgress size={20} /> : <Edit />
            }
            size='small'
          >
            {statusLoading ? 'Обновление...' : 'Обновить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BugReportsTab;
