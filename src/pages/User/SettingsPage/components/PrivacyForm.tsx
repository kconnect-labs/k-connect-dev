import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Paper,
  Button,
  ButtonGroup,
} from '@mui/material';

interface PrivacyFormProps {
  onSuccess?: () => void;
}

interface PrivacySettings {
  music_privacy: number;
  music_display_mode: string;
  lyrics_display_mode: string;
  static_music_id?: number;
  current_music_id?: number;
  current_music?: {
    id: number;
    title: string;
    artist: string;
    album?: string;
  };
  current_music_updated_at?: string;
}

interface ProfilePrivacySettings {
  isPrivate: boolean;
  privateUsername: boolean;
  inventoryPrivacy: number;
}

const PrivacyForm: React.FC<PrivacyFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    music_privacy: 0,
    music_display_mode: 'static',
    lyrics_display_mode: 'no',
  });

  const [profilePrivacySettings, setProfilePrivacySettings] =
    useState<ProfilePrivacySettings>({
      isPrivate: false,
      privateUsername: false,
      inventoryPrivacy: 0,
    });

  // Загрузка настроек приватности
  useEffect(() => {
    fetchPrivacySettings();
    fetchProfilePrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/settings/music-privacy');
      const data = await response.json();

      if (data.success) {
        setPrivacySettings({
          music_privacy: data.music_privacy || 0,
          music_display_mode: data.music_display_mode || 'static',
          lyrics_display_mode: data.lyrics_display_mode || 'no',
          static_music_id: data.static_music?.id,
          current_music_id: data.current_music_id,
          current_music: data.current_music,
        });
      } else {
        setError('Не удалось загрузить настройки приватности');
      }
    } catch (err) {
      console.error('Error fetching privacy settings:', err);
      setError('Ошибка при загрузке настроек приватности');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePrivacySettings = async () => {
    try {
      const response = await fetch('/api/user/settings/privacy');
      const data = await response.json();

      if (data.success) {
        setProfilePrivacySettings({
          isPrivate: data.is_private || false,
          privateUsername: data.private_username || false,
          inventoryPrivacy: data.inventory_privacy || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching profile privacy settings:', err);
    }
  };

  const handleMusicPrivacyChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPrivacy = parseInt(event.target.value);
    await updatePrivacySettings({ music_privacy: newPrivacy });
  };

  const handleMusicDisplayModeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMode = event.target.value;
    await updatePrivacySettings({ music_display_mode: newMode });
  };

  const handleUpdateStaticTrack = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/user/settings/update-static-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_music_id: privacySettings.current_music_id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPrivacySettings(prev => ({
          ...prev,
          static_music_id: data.static_music_id,
          music_display_mode: data.music_display_mode,
        }));
        setSuccess('Статический трек обновлен на текущий');
        onSuccess?.();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Не удалось обновить статический трек');
      }
    } catch (err) {
      console.error('Error updating static track:', err);
      setError('Ошибка при обновлении статического трека');
    } finally {
      setSaving(false);
    }
  };

  const handleLyricsDisplayModeToggle = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/user/settings/lyrics-display-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setPrivacySettings(prev => ({
          ...prev,
          lyrics_display_mode: data.lyrics_display_mode,
        }));
        setSuccess('Режим отображения лириков обновлен');
        onSuccess?.();

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Не удалось обновить режим отображения лириков');
      }
    } catch (err) {
      console.error('Error updating lyrics display mode:', err);
      setError('Ошибка при обновлении режима отображения лириков');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePrivacyToggle = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/user/settings/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_private: !profilePrivacySettings.isPrivate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfilePrivacySettings(prev => ({
          ...prev,
          isPrivate: !prev.isPrivate,
        }));
        setSuccess('Настройки приватности профиля обновлены');
        onSuccess?.();

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(
          data.error || 'Не удалось обновить настройки приватности профиля'
        );
      }
    } catch (err) {
      console.error('Error updating profile privacy settings:', err);
      setError('Ошибка при обновлении настроек приватности профиля');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivateUsernameToggle = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/user/settings/private-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          private_username: !profilePrivacySettings.privateUsername,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProfilePrivacySettings(prev => ({
          ...prev,
          privateUsername: !prev.privateUsername,
        }));
        setSuccess('Настройки приватности юзернеймов обновлены');
        onSuccess?.();

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(
          data.error || 'Не удалось обновить настройку приватности юзернеймов'
        );
      }
    } catch (err) {
      console.error('Error updating private username setting:', err);
      setError('Ошибка при обновлении настройки приватности юзернеймов');
    } finally {
      setSaving(false);
    }
  };

  const handleInventoryPrivacyToggle = async () => {
    try {
      setSaving(true);
      setError(null);

      const newInventoryPrivacy =
        profilePrivacySettings.inventoryPrivacy === 0 ? 1 : 0;

      const response = await fetch('/api/user/settings/inventory-privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inventory_privacy: newInventoryPrivacy }),
      });

      const data = await response.json();
      if (data.success) {
        setProfilePrivacySettings(prev => ({
          ...prev,
          inventoryPrivacy: newInventoryPrivacy,
        }));
        setSuccess('Настройки приватности инвентаря обновлены');
        onSuccess?.();

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(
          data.error || 'Не удалось обновить настройку приватности инвентаря'
        );
      }
    } catch (err) {
      console.error('Error updating inventory privacy setting:', err);
      setError('Ошибка при обновлении настройки приватности инвентаря');
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    try {
      setSaving(true);
      setError(null);

      // Фильтруем пустые значения - не передаем undefined, null или пустые значения
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => {
          if (value === undefined || value === null) return false;
          if (key === 'static_music_id' && value === '') return false;
          if (key === 'current_music_id' && value === '') return false;
          return true;
        })
      );

      const response = await fetch('/api/user/settings/music-privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...privacySettings,
          ...filteredUpdates,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPrivacySettings(prev => ({ ...prev, ...updates }));
        setSuccess('Настройки приватности обновлены');
        onSuccess?.();

        // Скрываем сообщение об успехе через 3 секунды
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Не удалось обновить настройки приватности');
      }
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Ошибка при обновлении настроек приватности');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Приватность профиля */}
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Полная приватность
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                Скрыть посты, друзей и инвентарь от всех, кроме взаимных друзей
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {saving && <CircularProgress size={16} />}
              <Switch
                checked={profilePrivacySettings.isPrivate}
                onChange={handleProfilePrivacyToggle}
                disabled={saving}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Приватность юзернеймов */}
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Скрыть купленные юзернеймы
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                Скрыть список купленных юзернеймов от других пользователей
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {saving && <CircularProgress size={16} />}
              <Switch
                checked={profilePrivacySettings.privateUsername}
                onChange={handlePrivateUsernameToggle}
                disabled={saving}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Приватность инвентаря */}
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Скрыть инвентарь полностью
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                {profilePrivacySettings.inventoryPrivacy === 0
                  ? 'Инвентарь виден всем пользователям'
                  : 'Инвентарь скрыт от всех, включая вас'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {saving && <CircularProgress size={16} />}
              <Switch
                checked={profilePrivacySettings.inventoryPrivacy === 1}
                onChange={handleInventoryPrivacyToggle}
                disabled={saving}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Приватность музыки */}
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Музыка
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                {privacySettings.music_privacy === 0
                  ? 'Все пользователи могут видеть вашу музыку'
                  : privacySettings.music_privacy === 1
                    ? 'Только друзья могут видеть вашу музыку'
                    : 'Музыка скрыта от всех'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ButtonGroup
                variant='outlined'
                size='small'
                sx={{
                  '& .MuiButton-root': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'var(--theme-text-primary)',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    minWidth: '60px',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'var(--theme-primary, #d0bcff)',
                      color: '#000',
                      borderColor: 'var(--theme-primary, #d0bcff)',
                      '&:hover': {
                        backgroundColor: 'var(--theme-primary, #d0bcff)',
                        opacity: 0.9,
                      },
                    },
                  },
                }}
              >
                <Button
                  variant={
                    privacySettings.music_privacy === 0
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleMusicPrivacyChange({ target: { value: '0' } } as any)
                  }
                  sx={{
                    backgroundColor:
                      privacySettings.music_privacy === 0
                        ? 'var(--theme-primary, #d0bcff)'
                        : 'transparent',
                    color:
                      privacySettings.music_privacy === 0
                        ? '#000'
                        : 'var(--theme-text-primary)',
                  }}
                >
                  Все
                </Button>
                <Button
                  variant={
                    privacySettings.music_privacy === 1
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleMusicPrivacyChange({ target: { value: '1' } } as any)
                  }
                  sx={{
                    backgroundColor:
                      privacySettings.music_privacy === 1
                        ? 'var(--theme-primary, #d0bcff)'
                        : 'transparent',
                    color:
                      privacySettings.music_privacy === 1
                        ? '#000'
                        : 'var(--theme-text-primary)',
                  }}
                >
                  Друзья
                </Button>
                <Button
                  variant={
                    privacySettings.music_privacy === 2
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleMusicPrivacyChange({ target: { value: '2' } } as any)
                  }
                  sx={{
                    backgroundColor:
                      privacySettings.music_privacy === 2
                        ? 'var(--theme-primary, #d0bcff)'
                        : 'transparent',
                    color:
                      privacySettings.music_privacy === 2
                        ? '#000'
                        : 'var(--theme-text-primary)',
                  }}
                >
                  Скрыто
                </Button>
              </ButtonGroup>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Режим отображения музыки */}
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Режим музыки
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                {privacySettings.music_display_mode === 'dynamic'
                  ? 'Автоматически обновляется текущий трек'
                  : 'Зафиксированный трек в профиле'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ButtonGroup
                variant='outlined'
                size='small'
                sx={{
                  '& .MuiButton-root': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'var(--theme-text-primary)',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    minWidth: '80px',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                  },
                }}
              >
                <Button
                  variant={
                    privacySettings.music_display_mode === 'dynamic'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleMusicDisplayModeChange({
                      target: { value: 'dynamic' },
                    } as any)
                  }
                  sx={{
                    backgroundColor:
                      privacySettings.music_display_mode === 'dynamic'
                        ? 'var(--theme-primary, #d0bcff)'
                        : 'transparent',
                    color:
                      privacySettings.music_display_mode === 'dynamic'
                        ? '#000'
                        : 'var(--theme-text-primary)',
                  }}
                >
                  Динамический
                </Button>
                <Button
                  variant={
                    privacySettings.music_display_mode === 'static'
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() =>
                    handleMusicDisplayModeChange({
                      target: { value: 'static' },
                    } as any)
                  }
                  sx={{
                    backgroundColor:
                      privacySettings.music_display_mode === 'static'
                        ? 'var(--theme-primary, #d0bcff)'
                        : 'transparent',
                    color:
                      privacySettings.music_display_mode === 'static'
                        ? '#000'
                        : 'var(--theme-text-primary)',
                  }}
                >
                  Статический
                </Button>
              </ButtonGroup>
            </Box>
          </Box>

          {/* Кнопка обновления статического трека */}
          {privacySettings.current_music_id && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant='outlined'
                size='small'
                onClick={handleUpdateStaticTrack}
                disabled={saving}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'var(--theme-text-primary)',
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  '&:disabled': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                {saving
                  ? 'Обновление...'
                  : 'Установить текущий трек как статический'}
              </Button>
            </Box>
          )}

          {/* Информация о текущем треке */}
          {privacySettings.current_music && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 1,
              }}
            >
              <Typography
                variant='caption'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                Текущий трек: {privacySettings.current_music.artist} -{' '}
                {privacySettings.current_music.title}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Режим отображения лириков */}
      <Box sx={{ mb: 1 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                variant='subtitle1'
                fontWeight={600}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                Показывать текст песни в профиле
              </Typography>

              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                Для отображения текста у песни должен быть синхронизированный
                текст (лирические строки).
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {saving && <CircularProgress size={16} />}
              <Switch
                checked={privacySettings.lyrics_display_mode === 'lyrics'}
                onChange={handleLyricsDisplayModeToggle}
                disabled={saving}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {saving && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default PrivacyForm;
