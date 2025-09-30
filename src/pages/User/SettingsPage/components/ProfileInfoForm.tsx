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
import { usePrivacy } from '../hooks/usePrivacy';


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
  const [isCompactInvertedActive, setIsCompactInvertedActive] = useState(false);
  const [updatingCompactInverted, setUpdatingCompactInverted] = useState(false);
  
  // Используем хук только для приватности профиля
  const {
    privacySettings,
    loading: privacyLoading,
    error: privacyError,
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
        setIsCompactInvertedActive(false);
        return;
      }

      try {
        const response = await fetch(
          '/api/profile/' + (profileInfo?.username || '')
        );
        const data = await response.json();
        if (data.user && data.user.profile_id) {
          const profileId = data.user.profile_id;
          setIsCustomProfileActive(profileId === 2);
          setIsCompactInvertedActive(profileId === 3);
        }
      } catch (error) {
        console.error('Error fetching profile style:', error);
        setIsCustomProfileActive(false);
        setIsCompactInvertedActive(false);
      }
    };

    fetchProfileStyle();
  }, [subscription, profileInfo?.username]);


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
      // Если включаем компактный вид, отключаем инвертированный
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
        // Отключаем инвертированный вид при включении обычного компактного
        if (!isCustomProfileActive) {
          setIsCompactInvertedActive(false);
        }
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

  const handleCompactInvertedToggle = async () => {
    if (!subscription || (subscription.type !== 'ultimate' && subscription.type !== 'max')) return;

    setUpdatingCompactInverted(true);
    try {
      // Если включаем инвертированный вид, отключаем обычный компактный
      const newProfileId = isCompactInvertedActive ? 1 : 3;
      const response = await fetch('/api/user/profile-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: newProfileId }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCompactInvertedActive(!isCompactInvertedActive);
        // Отключаем обычный компактный вид при включении инвертированного
        if (!isCompactInvertedActive) {
          setIsCustomProfileActive(false);
        }
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Error updating compact inverted profile style:', data.error);
        if (onError) {
          onError(data.error || 'Не удалось обновить стиль профиля');
        }
      }
    } catch (error) {
      console.error('Error updating compact inverted profile style:', error);
      if (onError) {
        onError('Ошибка при обновлении стиля профиля');
      }
    } finally {
      setUpdatingCompactInverted(false);
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
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 'var(--main-border-radius)',
    padding: '20px',
    marginBottom: '20px',
  };

  return (
    <Box >
      <Typography
        variant='h6'
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'var(--theme-text-primary)',
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
        <>
          <Box sx={{ mt: 2, mb: 1 }}>
            <Paper
              sx={{ p: 2, borderRadius: 'var(--main-border-radius)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
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
                    Компактный вид профиля
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                   Убирается баннер из профиля и накладывается фоном карточки профиля
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {updatingProfileStyle && <CircularProgress size={16} />}
                  <Switch
                    checked={isCustomProfileActive}
                    onChange={handleProfileStyleToggle}
                    disabled={updatingProfileStyle || updatingCompactInverted}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ mt: 1, mb: 1 }}>
            <Paper
              sx={{ p: 2, borderRadius: 'var(--main-border-radius)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
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
                    Компактный вид профиля с инверсией
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                    Инвертированный компактный вид профиля
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {updatingCompactInverted && <CircularProgress size={16} />}
                  <Switch
                    checked={isCompactInvertedActive}
                    onChange={handleCompactInvertedToggle}
                    disabled={updatingCompactInverted || updatingProfileStyle}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
        </>
      )}




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
            borderRadius: 'var(--main-border-radius)',
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
