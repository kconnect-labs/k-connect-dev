import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid, Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Check as CheckIcon } from '@mui/icons-material';

interface ProfileInfo {
  name: string;
  username: string;
  about: string;
}

interface ProfileInfoFormProps {
  profileInfo?: ProfileInfo;
  onSave?: (info: ProfileInfo) => Promise<void>;
  loading?: boolean;
  onSuccess?: () => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  profileInfo,
  onSave,
  loading = false,
  onSuccess,
}) => {
  const defaultProfileInfo: ProfileInfo = {
    name: '',
    username: '',
    about: ''
  };
  
  const [formData, setFormData] = useState<ProfileInfo>(profileInfo || defaultProfileInfo);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Обновляем форму при изменении profileInfo
  useEffect(() => {
    if (profileInfo) {
      setFormData(profileInfo);
    }
  }, [profileInfo]);

  const handleChange = (field: keyof ProfileInfo) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setSaving(true);
    setSuccess(false);
    
    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Ошибка обрабатывается в родительском компоненте
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    if (!profileInfo) return true;
    return (
      formData.name !== profileInfo.name ||
      formData.username !== profileInfo.username ||
      formData.about !== profileInfo.about
    );
  };

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  };

  return (
    <Box sx={containerStyle}>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
        Основная информация
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Имя"
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            margin="normal"
            variant="outlined"
            helperText={`${formData.name?.length || 0}/16 символов`}
            inputProps={{ maxLength: 16 }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
            disabled={loading || saving}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Имя пользователя"
            value={formData.username}
            onChange={handleChange('username')}
            fullWidth
            margin="normal"
            variant="outlined"
            helperText={`${formData.username?.length || 0}/16 символов, без пробелов`}
            inputProps={{ maxLength: 16 }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
            disabled={loading || saving}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="О себе"
            value={formData.about}
            onChange={handleChange('about')}
            fullWidth
            multiline
            rows={4}
            margin="normal"
            variant="outlined"
            helperText={`${formData.about?.length || 0}/200 символов`}
            inputProps={{ maxLength: 200 }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
            disabled={loading || saving}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            saving ? <CircularProgress size={20} /> : 
            success ? <CheckIcon /> : 
            <SaveIcon />
          }
          onClick={handleSave}
          disabled={saving || loading || !hasChanges()}
          sx={{ 
            borderRadius: '12px', 
            py: 1,
            px: 3,
            minWidth: 140,
          }}
        >
          {saving ? 'Сохранение...' : success ? 'Сохранено' : 'Сохранить'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileInfoForm; 