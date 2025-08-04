import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Switch,
  Paper,
} from '@mui/material';
import { Save as SaveIcon, Check as CheckIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { usePrivacy } from '../hooks/usePrivacy';

// IOS Switch стиль
const IOSSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#D0BCFF',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#D0BCFF',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#555' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

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
  subscription?: any;
  onError?: (message: string) => void;
  settings?: any;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  profileInfo,
  onSave,
  loading = false,
  onSuccess,
  subscription,
  onError,
  settings,
}) => {
  const defaultProfileInfo: ProfileInfo = {
    name: '',
    username: '',
    about: '',
  };

  const [formData, setFormData] = useState<ProfileInfo>(
    profileInfo || defaultProfileInfo
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isCustomProfileActive, setIsCustomProfileActive] = useState(false);
  const [updatingProfileStyle, setUpdatingProfileStyle] = useState(false);
  const [isPrivateUsername, setIsPrivateUsername] = useState(false);
  const [updatingPrivateUsername, setUpdatingPrivateUsername] = useState(false);
  
  // Используем хук только для приватности профиля
  const {
    privacySettings,
    loading: privacyLoading,
    error: privacyError,
    updateProfilePrivacy,
  } = usePrivacy();

  // Обновляем форму при изменении profileInfo
  useEffect(() => {
    if (profileInfo) {
      setFormData(profileInfo);
    }
  }, [profileInfo]);

  // Получаем текущее состояние стиля профиля
  useEffect(() => {
    const fetchProfileStyle = async () => {
      if (!subscription || (subscription.type !== 'ultimate' && subscription.type !== 'max')) {
        setIsCustomProfileActive(false);
        return;
      }

      try {
        const response = await fetch(
          '/api/profile/' + (profileInfo?.username || '')
        );
        const data = await response.json();
        if (data.user && data.user.profile_id) {
          setIsCustomProfileActive(data.user.profile_id === 2);
        }
      } catch (error) {
        console.error('Error fetching profile style:', error);
        setIsCustomProfileActive(false);
      }
    };

    fetchProfileStyle();
  }, [subscription, profileInfo?.username]);

  // Инициализируем настройку приватности юзернеймов
  useEffect(() => {
    if (settings) {
      const privateUsername = settings.private_username || false;
      setIsPrivateUsername(privateUsername);
    }
  }, [settings]);

  const handleChange =
    (field: keyof ProfileInfo) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleProfileStyleToggle = async () => {
    if (!subscription || (subscription.type !== 'ultimate' && subscription.type !== 'max')) return;

    setUpdatingProfileStyle(true);
    try {
      const newProfileId = isCustomProfileActive ? 1 : 2;
      const response = await fetch('/api/user/profile-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: newProfileId }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCustomProfileActive(!isCustomProfileActive);
        if (onSuccess) {
          onSuccess();
        }
        // Показываем уведомление об успехе
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Error updating profile style:', data.error);
        if (onError) {
          onError(data.error || 'Не удалось обновить стиль профиля');
        }
      }
    } catch (error) {
      console.error('Error updating profile style:', error);
      if (onError) {
        onError('Ошибка при обновлении стиля профиля');
      }
    } finally {
      setUpdatingProfileStyle(false);
    }
  };

  const handlePrivateUsernameToggle = async () => {
    setUpdatingPrivateUsername(true);
    try {
      const response = await fetch('/api/user/settings/private-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ private_username: !isPrivateUsername }),
      });

      const data = await response.json();
      if (data.success) {
        setIsPrivateUsername(!isPrivateUsername);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Error updating private username setting:', data.error);
        if (onError) {
          onError(data.error || 'Не удалось обновить настройку приватности');
        }
      }
    } catch (error) {
      console.error('Error updating private username setting:', error);
      if (onError) {
        onError('Ошибка при обновлении настройки приватности');
      }
    } finally {
      setUpdatingPrivateUsername(false);
    }
  };

  const handlePrivateProfileToggle = async () => {
    try {
      await updateProfilePrivacy(!privacySettings.isPrivate);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError('Не удалось обновить настройку приватности профиля');
      }
    }
  };

  // Показываем ошибки из хука приватности
  useEffect(() => {
    if (privacyError && onError) {
      onError(privacyError);
    }
  }, [privacyError, onError]);

  const hasChanges = () => {
    if (!profileInfo) return true;
    return (
      formData.name !== profileInfo.name ||
      formData.username !== profileInfo.username ||
      formData.about !== profileInfo.about
    );
  };

  const containerStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  };

  return (
    <Box sx={containerStyle}>
      <Typography
        variant='h6'
        sx={{
          mb: 3,
          color: 'text.primary',
          fontSize: '1.2rem',
          fontWeight: 600,
        }}
      >
        Основная информация
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label='Имя'
            value={formData.name}
            onChange={handleChange('name')}
            fullWidth
            margin='normal'
            variant='outlined'
            helperText={`${formData.name?.length || 0}/16 символов`}
            inputProps={{ maxLength: 16 }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
            disabled={loading || saving}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label='Имя пользователя'
            value={formData.username}
            onChange={handleChange('username')}
            fullWidth
            margin='normal'
            variant='outlined'
            helperText={`${formData.username?.length || 0}/16 символов, без пробелов`}
            inputProps={{ maxLength: 16 }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
            disabled={loading || saving}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label='О себе'
            value={formData.about}
            onChange={handleChange('about')}
            fullWidth
            multiline
            rows={4}
            margin='normal'
            variant='outlined'
            helperText={`${formData.about?.length || 0}/200 символов`}
            inputProps={{ maxLength: 200 }}
            FormHelperTextProps={{ sx: { ml: 0 } }}
            disabled={loading || saving}
          />
        </Grid>
      </Grid>

      {/* Profile style toggle - only for Ultimate and MAX subscription */}
      {(subscription?.type === 'ultimate' || subscription?.type === 'max') && (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Paper
            sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(18, 18, 18, 0.9)' }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant='subtitle1' fontWeight={600}>
                  Новый вид профиля
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Изменить внешний вид профиля
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {updatingProfileStyle && <CircularProgress size={16} />}
                <IOSSwitch
                  checked={isCustomProfileActive}
                  onChange={handleProfileStyleToggle}
                  disabled={updatingProfileStyle}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Private username toggle */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(18, 18, 18, 0.9)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant='subtitle1' fontWeight={600}>
                Скрыть купленные юзернеймы
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Скрыть список купленных юзернеймов от других пользователей
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {updatingPrivateUsername && <CircularProgress size={16} />}
              <IOSSwitch
                checked={isPrivateUsername}
                onChange={handlePrivateUsernameToggle}
                disabled={updatingPrivateUsername}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Private profile toggle */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(18, 18, 18, 0.9)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant='subtitle1' fontWeight={600}>
                Полная приватность
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Скрыть посты, друзей и инвентарь от всех, кроме взаимных друзей
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {privacyLoading && <CircularProgress size={16} />}
              <IOSSwitch
                checked={privacySettings.isPrivate}
                onChange={handlePrivateProfileToggle}
                disabled={privacyLoading}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant='contained'
          color='primary'
          startIcon={
            saving ? (
              <CircularProgress size={20} />
            ) : success ? (
              <CheckIcon />
            ) : (
              <SaveIcon />
            )
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
