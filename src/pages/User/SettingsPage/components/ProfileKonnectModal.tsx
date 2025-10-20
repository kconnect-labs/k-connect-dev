import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ProfileKonnectModalProps {
  open: boolean;
  onClose: () => void;
}

const EXPORT_FIELDS = [
  { key: 'avatar', label: 'Аватар' },
  { key: 'banner', label: 'Баннер' },
  { key: 'background', label: 'Фон профиля' },
  { key: 'theme', label: 'Тема' },
  { key: 'style', label: 'Стиль профиля' },
  { key: 'status', label: 'Статус' },
  { key: 'socials', label: 'Социальные сети' },
  { key: 'decorations', label: 'Декорации' },
];

const ProfileKonnectModal: React.FC<ProfileKonnectModalProps> = ({
  open,
  onClose,
}) => {
  const [selectedFields, setSelectedFields] = useState(
    EXPORT_FIELDS.map(f => f.key)
  );
  const [importFile, setImportFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<
    'success' | 'error' | 'warning'
  >('success');

  const handleFieldChange = (key: string) => {
    setSelectedFields(prev =>
      prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/user/profile/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: selectedFields }),
      });
      if (!response.ok) throw new Error('Ошибка экспорта профиля');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'profile.konnect';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMessageType('success');
      setMessage('Профиль успешно экспортирован!');
    } catch (e: any) {
      setMessageType('error');
      setMessage(e.message || 'Ошибка экспорта профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportFile(e.target.files?.[0] || null);
  };

  const handleImport = async () => {
    if (!importFile) {
      setMessageType('warning');
      setMessage('Выберите файл для импорта');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const response = await fetch('/api/user/profile/import', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.error || 'Ошибка импорта профиля');
      setMessageType('success');
      setMessage('Профиль успешно импортирован!');
    } catch (e: any) {
      setMessageType('error');
      setMessage(e.message || 'Ошибка импорта профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    setImportFile(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='xs'
      PaperProps={{
        sx: {
          borderRadius: 'var(--main-border-radius)',
                      background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                      backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.15rem', color: 'var(--theme-text-primary)' }}>
        Экспорт / Импорт профиля
      </DialogTitle>
      <DialogContent>
        <Typography variant='subtitle2' sx={{ mb: 1, color: 'var(--theme-text-secondary)' }}>
          Выберите, какие данные профиля экспортировать:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
          {EXPORT_FIELDS.map(field => (
            <FormControlLabel
              key={field.key}
              control={
                <Checkbox
                  checked={selectedFields.includes(field.key)}
                  onChange={() => handleFieldChange(field.key)}
                  size='small'
                  disabled={loading}
                  sx={{
                    '&.Mui-checked': {
                      color: 'var(--theme-main-color)',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.97rem' }}>
                  {field.label}
                </Typography>
              }
            />
          ))}
        </Box>
        <Button
          variant='contained'
          startIcon={<CloudDownloadIcon />}
          onClick={handleExport}
          disabled={loading || selectedFields.length === 0}
          fullWidth
          sx={{ mb: 2, borderRadius: 'var(--main-border-radius)', fontWeight: 500, color: 'var(--theme-text-primary)' }}
        >
          {loading ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            'Экспортировать'
          )}
        </Button>
        <Box sx={{ mt: 1, mb: 1 }}>
          <Typography
            variant='subtitle2'
              sx={{ color: 'var(--theme-text-secondary)', mb: 0.5 }}
          >
            Импортировать профиль (.konnect):
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant='outlined'
              component='label'
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: 'var(--main-border-radius)', fontWeight: 500, minWidth: 0, color: 'var(--theme-text-primary)' }}
              disabled={loading}
            >
              {importFile ? importFile.name : 'Выбрать файл'}
              <input
                type='file'
                accept='.konnect'
                hidden
                onChange={handleImportFileChange}
                disabled={loading}
              />
            </Button>
            <Button
              variant='contained'
              onClick={handleImport}
              disabled={loading || !importFile}
              sx={{ borderRadius: 'var(--main-border-radius)', fontWeight: 500, color: 'var(--theme-text-primary)' }}
            >
              {loading ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                'Импортировать'
              )}
            </Button>
          </Box>
        </Box>
        {message && (
          <Alert severity={messageType} sx={{ mt: 2, borderRadius: 2 }}>
            {message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileKonnectModal;
