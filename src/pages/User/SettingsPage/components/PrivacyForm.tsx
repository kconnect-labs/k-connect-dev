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
} from '@mui/material';

interface PrivacyFormProps {
  onSuccess?: () => void;
}

interface PrivacySettings {
  music_privacy: number;
  music_display_mode: string;
  static_music_id?: number;
  current_music_id?: number;
  current_music_updated_at?: string;
}

interface ProfilePrivacySettings {
  isPrivate: boolean;
}

const PrivacyForm: React.FC<PrivacyFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    music_privacy: 0,
    music_display_mode: 'static',
  });

  const [profilePrivacySettings, setProfilePrivacySettings] = useState<ProfilePrivacySettings>({
    isPrivate: false,
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
          static_music_id: data.static_music?.id,
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
      const response = await fetch('/api/profile/privacy');
      const data = await response.json();
      
      if (data.success) {
        setProfilePrivacySettings({
          isPrivate: data.isPrivate || false,
        });
      }
    } catch (err) {
      console.error('Error fetching profile privacy settings:', err);
    }
  };

  const handleMusicPrivacyChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPrivacy = parseInt(event.target.value);
    await updatePrivacySettings({ music_privacy: newPrivacy });
  };

  const handleMusicDisplayModeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value;
    await updatePrivacySettings({ music_display_mode: newMode });
  };

  const handleProfilePrivacyToggle = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/profile/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPrivate: !profilePrivacySettings.isPrivate,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfilePrivacySettings(prev => ({ 
          isPrivate: !prev.isPrivate 
        }));
        setSuccess('Настройки приватности профиля обновлены');
        onSuccess?.();
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Не удалось обновить настройки приватности профиля');
      }
    } catch (err) {
      console.error('Error updating profile privacy settings:', err);
      setError('Ошибка при обновлении настроек приватности профиля');
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('/api/user/settings/music-privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...privacySettings,
          ...updates,
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
    <Box sx={{ p: 2 }}>

      {/* Приватность профиля */}
      <Box sx={{ mb: 4 }}>        
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(18, 18, 18, 0.9)' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)' }}>
                Полная приватность
              </Typography>
              <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
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

      <Divider sx={{ my: 3 }} />

      {/* Приватность музыки */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
          Приватность музыки
        </Typography>
        
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
            Кто может видеть вашу музыку?
          </FormLabel>
          <RadioGroup
            value={privacySettings.music_privacy}
            onChange={handleMusicPrivacyChange}
          >
            <FormControlLabel
              value={0}
              control={<Radio />}
              label="Все пользователи"
              sx={{ color: 'var(--theme-text-primary)' }}
            />
            <FormControlLabel
              value={1}
              control={<Radio />}
              label="Только друзья"
              sx={{ color: 'var(--theme-text-primary)' }}
            />
            <FormControlLabel
              value={2}
              control={<Radio />}
              label="Скрыто"
              sx={{ color: 'var(--theme-text-primary)' }}
            />
          </RadioGroup>
        </FormControl>

        <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 2 }}>
          Выберите, кто может видеть информацию о музыке, которую вы слушаете
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Режим отображения музыки */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
          Режим отображения музыки
        </Typography>
        
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
            Как отображать музыку в профиле?
          </FormLabel>
          <RadioGroup
            value={privacySettings.music_display_mode}
            onChange={handleMusicDisplayModeChange}
          >
            <FormControlLabel
              value="dynamic"
              control={<Radio />}
              label="Динамический - показывать текущий трек"
              sx={{ color: 'var(--theme-text-primary)' }}
            />
            <FormControlLabel
              value="static"
              control={<Radio />}
              label="Статический - зафиксированный трек"
              sx={{ color: 'var(--theme-text-primary)' }}
            />
          </RadioGroup>
        </FormControl>

        <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
          {privacySettings.music_display_mode === 'dynamic' 
            ? 'Музыка будет автоматически обновляться в зависимости от того, что вы слушаете'
            : 'Вы сможете выбрать один трек, который будет отображаться в профиле'
          }
        </Typography>

        {/* Информация о текущем треке в динамическом режиме */}
        {privacySettings.music_display_mode === 'dynamic' && privacySettings.current_music_id && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-primary)', fontWeight: 600 }}>
              Текущий трек:
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
              ID: {privacySettings.current_music_id}
            </Typography>
            {privacySettings.current_music_updated_at && (
              <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                Обновлен: {new Date(privacySettings.current_music_updated_at).toLocaleString()}
              </Typography>
            )}
          </Box>
        )}
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
