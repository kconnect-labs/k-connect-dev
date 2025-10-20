import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Wallpaper as WallpaperIcon,
  Palette as PaletteIcon,
  Brush as BrushIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  ColorLens as ColorLensIcon,
  Check as CheckIcon,
  CloudDownload as CloudDownloadIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import ProfileKonnectModal from './ProfileKonnectModal';
import { ThemeSettingsContext } from '../../../../App';
import { useClientSettings } from '../../../../context/ClientSettingsContext';

// Компонент для отображения декорации
const DecorationItem = styled('img')(
  ({ customStyles }: { customStyles?: any }) => ({
    position: 'absolute',
    right: 0,
    height: 'max-content',
    maxHeight: 60,
    opacity: 1,
    pointerEvents: 'none',
    zIndex: 1,
    ...customStyles,
  })
);

// Компонент для превью декорации
const DecorationPreview = ({
  decoration,
  children,
}: {
  decoration: any;
  children: React.ReactNode;
}) => {
  const isImage = decoration?.background?.includes('/');

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 60,
        borderRadius: 'var(--main-border-radius)',
        overflow: 'hidden',
        bgcolor: 'background.default',
        background: decoration?.background
          ? isImage
            ? 'none'
            : decoration.background
          : 'background.default',
        '&::before': isImage
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${decoration.background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.75,
              zIndex: 0,
            }
          : {},
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  );
};

interface CustomizationFormProps {
  onSuccess?: () => void;
  profileData?: any;
  subscription?: any;
}

interface Decoration {
  id: number;
  name: string;
  item_path?: string;
  is_active?: boolean;
  decoration?: {
    id: number;
    name: string;
    background?: string;
    item_path?: string;
  };
}

const CustomizationForm: React.FC<CustomizationFormProps> = ({
  onSuccess,
  profileData,
  subscription,
}) => {
  const { globalProfileBackgroundEnabled, setGlobalProfileBackgroundEnabled } =
    useContext(ThemeSettingsContext);
  const [loading, setLoading] = useState(false);
  const [userDecorations, setUserDecorations] = useState<Decoration[]>([]);
  const [loadingDecorations, setLoadingDecorations] = useState(false);
  const [pendingAccentColor, setPendingAccentColor] = useState(
    () => localStorage.getItem('accentColorOverride') || '#d0bcff'
  );
  const [pendingTextColorMode, setPendingTextColorMode] = useState(
    () => localStorage.getItem('accentTextColorMode') || 'light'
  );
  const [appliedAccentColor, setAppliedAccentColor] = useState(
    () => localStorage.getItem('accentColorOverride') || '#d0bcff'
  );
  const [appliedTextColorMode, setAppliedTextColorMode] = useState(
    () => localStorage.getItem('accentTextColorMode') || 'light'
  );
  const [isApplying, setIsApplying] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#d0bcff');
  const [red, setRed] = useState(208);
  const [green, setGreen] = useState(188);
  const [blue, setBlue] = useState(255);
  const [konnectModalOpen, setKonnectModalOpen] = useState(false);
  const [profileBackgroundUrl, setProfileBackgroundUrl] = useState<
    string | null
  >(null);
  
  // Состояния для цвета профиля
  const [profileColor, setProfileColor] = useState('#D0BCFF');
  const [profileColorLoading, setProfileColorLoading] = useState(false);
  const [profileColorPickerOpen, setProfileColorPickerOpen] = useState(false);
  const [profileColorInput, setProfileColorInput] = useState('#D0BCFF');
  
  // Состояния для уведомлений
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  
  // Получаем настройки клиента из контекста
  const { settings: clientSettings, updateSetting } = useClientSettings();
  
  // Локальные состояния для UI
  const [sidebarPlayerEnabled, setSidebarPlayerEnabled] = useState(
    () => clientSettings.player_sidebar === 1
  );
  const [adsEnabled, setAdsEnabled] = useState(
    () => clientSettings.ads === 1
  );
  const [updateEnabled, setUpdateEnabled] = useState(
    () => clientSettings.update === 1
  );
  const [sidebarVersion, setSidebarVersion] = useState(
    () => clientSettings.sidebar_version || 'v1'
  );
  

  // Загрузка декораций и обоев профиля
  useEffect(() => {
    fetchUserDecorations();
    fetchProfileColor();
    if (profileData?.user?.profile_background_url) {
      setProfileBackgroundUrl(profileData.user.profile_background_url);
    }

    // Отладка данных
    console.log('CustomizationForm - profileData:', profileData);
    console.log('CustomizationForm - subscription:', subscription);
    console.log('CustomizationForm - subscription?.type:', subscription?.type);
    console.log(
      'CustomizationForm - subscription?.active:',
      subscription?.active
    );
  }, [profileData, subscription]);

  // Синхронизируем локальные состояния с контекстом
  useEffect(() => {
    setSidebarPlayerEnabled(clientSettings.player_sidebar === 1);
    setAdsEnabled(clientSettings.ads === 1);
    setUpdateEnabled(clientSettings.update === 1);
    setSidebarVersion(clientSettings.sidebar_version || 'v1');
  }, [clientSettings]);

  // Функция для показа уведомлений
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Функция для обновления данных после успешных операций
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    // Дополнительно можно обновить данные профиля
    fetchUserDecorations();
    fetchProfileColor();
  };

  // Обработчик смены версии MainLayout

  // Обработчик переключения плеера в сайдбаре
  const handleSidebarPlayerToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setSidebarPlayerEnabled(enabled);
    
    try {
      // Обновляем настройку через контекст
      const success = await updateSetting('player_sidebar', enabled ? 1 : 0);
      
      if (success) {
        showNotification('success', `Плеер в сайдбаре ${enabled ? 'включен' : 'выключен'}`);
      } else {
        showNotification('error', 'Ошибка при обновлении настройки');
      }
    } catch (error) {
      console.error('Error updating sidebar player setting:', error);
      showNotification('error', 'Ошибка при обновлении настройки');
    }
  };

  // Обработчик переключения рекламы
  const handleAdsToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Проверяем подписку
    if (!(subscription?.type === 'ultimate' || subscription?.type === 'max' || subscription?.type === 'pick-me')) {
      showNotification('error', 'Для изменения настройки рекламы необходима подписка Ultimate или выше');
      return;
    }

    const enabled = event.target.checked;
    setAdsEnabled(enabled);
    
    try {
      const success = await updateSetting('ads', enabled ? 1 : 0);
      if (success) {
        showNotification('success', `Реклама ${enabled ? 'включена' : 'отключена'}`);
      } else {
        showNotification('error', 'Ошибка при обновлении настройки рекламы');
      }
    } catch (error) {
      console.error('Error updating ads setting:', error);
      showNotification('error', 'Ошибка при обновлении настройки рекламы');
    }
  };

  // Обработчик переключения обновлений
  const handleUpdateToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Проверяем подписку
    if (!(subscription?.type === 'ultimate' || subscription?.type === 'max' || subscription?.type === 'pick-me')) {
      showNotification('error', 'Для изменения настройки обновлений необходима подписка Ultimate или выше');
      return;
    }

    const enabled = event.target.checked;
    setUpdateEnabled(enabled);
    
    try {
      const success = await updateSetting('update', enabled ? 1 : 0);
      if (success) {
        showNotification('success', `Обновления ${enabled ? 'включены' : 'отключены'}`);
      } else {
        showNotification('error', 'Ошибка при обновлении настройки обновлений');
      }
    } catch (error) {
      console.error('Error updating update setting:', error);
      showNotification('error', 'Ошибка при обновлении настройки обновлений');
    }
  };

  // Обработчик изменения версии сайдбара
  const handleSidebarVersionChange = async (event: React.MouseEvent<HTMLElement> | null, newVersion: string | null) => {
    if (!newVersion) return;
    
    console.log('CustomizationForm: Changing sidebar version to:', newVersion);
    console.log('CustomizationForm: Current clientSettings:', clientSettings);
    setSidebarVersion(newVersion);
    
    try {
      console.log('CustomizationForm: Calling updateSetting for sidebar_version:', newVersion);
      console.log('CustomizationForm: updateSetting function:', typeof updateSetting);
      const success = await updateSetting('sidebar_version', newVersion);
      console.log('CustomizationForm: Update result:', success);
      
      if (success) {
        showNotification('success', `Версия сайдбара изменена на ${newVersion.toUpperCase()}`);
        console.log('CustomizationForm: Sidebar version updated successfully');
      } else {
        showNotification('error', 'Ошибка при обновлении версии сайдбара');
        console.log('CustomizationForm: Failed to update sidebar version');
      }
    } catch (error) {
      console.error('CustomizationForm: Error updating sidebar version:', error);
      showNotification('error', 'Ошибка при обновлении версии сайдбара');
    }
  };

  const fetchUserDecorations = async () => {
    setLoadingDecorations(true);
    try {
      const response = await fetch('/api/decorations/current');
      if (!response.ok) throw new Error('Failed to fetch decorations');
      const data = await response.json();
      setUserDecorations(data.decorations || []);
    } catch (error) {
      console.error('Error fetching decorations:', error);
    } finally {
      setLoadingDecorations(false);
    }
  };

  // Загрузка цвета профиля
  const fetchProfileColor = async () => {
    try {
      const response = await fetch('/api/user/settings/profile-color');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile_color) {
          setProfileColor(data.profile_color);
          setProfileColorInput(data.profile_color);
        }
      }
    } catch (error) {
      console.error('Error fetching profile color:', error);
    }
  };

  // Сохранение цвета профиля
  const handleSaveProfileColor = async () => {
    setProfileColorLoading(true);
    try {
      const response = await fetch('/api/user/settings/profile-color', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_color: profileColorInput,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProfileColor(profileColorInput);
        
        // Сохраняем цвет в localStorage для глобального использования
        localStorage.setItem('profileColor', profileColorInput);
        document.cookie = `profileColor=${profileColorInput};path=/;max-age=31536000`;
        
        showNotification('success', 'Цвет профиля успешно сохранен!');
        handleSuccess();
      }
    } catch (error) {
      console.error('Error saving profile color:', error);
      showNotification('error', 'Ошибка при сохранении цвета профиля');
    } finally {
      setProfileColorLoading(false);
    }
  };

  // Валидация hex цвета
  const isValidHexColor = (color: string) => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  // Переключение декораций
  const handleToggleDecoration = async (
    decorationId: number,
    isActive: boolean
  ) => {
    try {
      const response = await fetch('/api/decorations/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decoration_id: decorationId,
          is_active: isActive,
        }),
      });

      if (response.ok) {
        // Обновляем локальное состояние сразу
        setUserDecorations(prev => 
          prev.map(item => {
            const decoration = item.decoration || item;
            if (decoration.id === decorationId) {
              return { ...item, is_active: isActive };
            }
            return item;
          })
        );
        
        showNotification('success', `Декорация ${isActive ? 'включена' : 'выключена'}!`);
        handleSuccess();
      }
    } catch (error) {
      console.error('Error toggling decoration:', error);
      showNotification('error', 'Ошибка при изменении декорации');
    }
  };

  // Глобальные обои профиля
  const handleGlobalProfileBackgroundToggle = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enabled = event.target.checked;
    try {
      // Обновляем настройку через контекст
      const success = await updateSetting('global_profile_bg', enabled);
      if (success) {
        setGlobalProfileBackgroundEnabled(enabled);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error saving global background setting:', error);
    }
  };

  // Загрузка обоев профиля
  const handleBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('background', file);

    try {
      const response = await axios.post('/api/profile/background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data?.profile_background_url) {
        setProfileBackgroundUrl(response.data.profile_background_url);
        
        // Сохраняем URL в localStorage для глобального использования
        localStorage.setItem('myProfileBackgroundUrl', response.data.profile_background_url);
        document.cookie = `myProfileBackgroundUrl=${response.data.profile_background_url};path=/;max-age=31536000`;
        
        showNotification('success', 'Фоновое изображение успешно загружено!');
        handleSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading background:', error);
      showNotification('error', 'Ошибка при загрузке фонового изображения');
    }
  };

  // Удаление обоев профиля
  const handleDeleteBackground = async () => {
    try {
      const response = await axios.delete('/api/profile/background');
      
      if (response.data?.success) {
        setProfileBackgroundUrl(null);

        // Очищаем localStorage от сохраненных обоев
        localStorage.removeItem('myProfileBackgroundUrl');
        document.cookie =
          'myProfileBackgroundUrl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Если глобальные обои включены, выключаем их
        if (globalProfileBackgroundEnabled) {
          try {
            const success = await updateSetting('global_profile_bg', false);
            if (success) {
              setGlobalProfileBackgroundEnabled(false);
            }
          } catch (error) {
            console.error('Error disabling global background:', error);
          }
        }

        showNotification('success', 'Фоновое изображение успешно удалено!');
        handleSuccess();
      }
    } catch (error: any) {
      console.error('Error deleting background:', error);
      showNotification('error', 'Ошибка при удалении фонового изображения');
    }
  };

  // Применение цвета акцента
  const handleApplyAccentColor = async () => {
    setIsApplying(true);
    try {
      localStorage.setItem('accentColorOverride', pendingAccentColor);
      localStorage.setItem('primaryColor', pendingAccentColor);

      const response = await fetch('/api/profile/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primary_color: pendingAccentColor,
        }),
      });

      const data = await response.json();
      if (data && data.success) {
        window.location.reload();
      }

      setAppliedAccentColor(pendingAccentColor);
      setAppliedTextColorMode(pendingTextColorMode);
      handleSuccess();
    } catch (error) {
      console.error('Ошибка при сохранении primary color:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Сброс цвета акцента
  const handleResetAccentColor = () => {
    setPendingAccentColor('#d0bcff');
    setPendingTextColorMode('light');
    localStorage.removeItem('accentColorOverride');
    localStorage.removeItem('primaryColor');
    setAppliedAccentColor('#d0bcff');
    setAppliedTextColorMode('light');
  };

  // Функции для ColorPicker
  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const updateColor = (r: number, g: number, b: number) => {
    const hexColor = rgbToHex(r, g, b);
    setCurrentColor(hexColor);
    setPendingAccentColor(hexColor);
  };

  const handleRedChange = (event: Event, value: number | number[]) => {
    const newRed = Array.isArray(value) ? value[0] : value;
    setRed(newRed);
    updateColor(newRed, green, blue);
  };

  const handleGreenChange = (event: Event, value: number | number[]) => {
    const newGreen = Array.isArray(value) ? value[0] : value;
    setGreen(newGreen);
    updateColor(red, newGreen, blue);
  };

  const handleBlueChange = (event: Event, value: number | number[]) => {
    const newBlue = Array.isArray(value) ? value[0] : value;
    setBlue(newBlue);
    updateColor(red, green, newBlue);
  };

  const handlePresetColorClick = (presetColor: string) => {
    const r = parseInt(presetColor.slice(1, 3), 16);
    const g = parseInt(presetColor.slice(3, 5), 16);
    const b = parseInt(presetColor.slice(5, 7), 16);

    setCurrentColor(presetColor);
    setPendingAccentColor(presetColor);
    setRed(r);
    setGreen(g);
    setBlue(b);
  };

  const isChanged =
    pendingAccentColor !== appliedAccentColor ||
    pendingTextColorMode !== appliedTextColorMode;

  const containerStyle = {
    p: 3,
    borderRadius: 'var(--main-border-radius)',
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    mb: 3,
  };

  const sectionStyle = {
    p: 2,
    borderRadius: 'var(--main-border-radius)',
    background: 'rgba(255, 255, 255, 0.02)',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    mb: 2,
  };

  return (
    <Box>
      {/* Уведомления */}
      {notification && (
        <Alert
          severity={notification.type}
          onClose={() => setNotification(null)}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}
      
      {/* Цвет профиля */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ColorLensIcon />
          Цвет профиля
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography
            variant='body2'
            sx={{  color: 'text.secondary' }}
          >
            Цвет профиля
          </Typography>
          <Tooltip title='Нажмите для выбора цвета'>
            <Badge
              overlap='circular'
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 'var(--avatar-border-radius)',
                    bgcolor: 'var(--theme-background-full, rgba(255, 255, 255, 0.95))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ColorLensIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                </Box>
              }
            >
              <Box
                onClick={() => setProfileColorPickerOpen(true)}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--avatar-border-radius)',
                  backgroundColor: profileColor,
                  cursor: 'pointer',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `0 4px 12px ${profileColor}40`,
                }}
              />
            </Badge>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography
            variant='body2'
            sx={{  color: 'text.secondary' }}
          >
            Hex код
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input
              type="text"
              value={profileColorInput}
              onChange={(e) => setProfileColorInput(e.target.value)}
              placeholder="#D0BCFF"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--main-border-radius)',
                border: `1px solid ${isValidHexColor(profileColorInput) ? 'rgba(66, 66, 66, 0.5)' : '#f44336'}`,
                backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                color: 'var(--theme-text-primary)',
                fontSize: '14px',
                fontFamily: 'monospace',
                width: '120px',
                outline: 'none',
              }}
            />
            <Button
              size='small'
              variant='contained'
              onClick={handleSaveProfileColor}
              disabled={!isValidHexColor(profileColorInput) || profileColorLoading || profileColorInput === profileColor}
              sx={{ borderRadius: 'var(--main-border-radius)', fontWeight: 500 }}
            >
              {profileColorLoading ? <CircularProgress size={16} /> : 'Применить'}
            </Button>
          </Box>
        </Box>

        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Цвет профиля будет отображаться в элементах интерфейса вашего профиля
        </Typography>
      </Box>
      {/* Версия MainLayout */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PaletteIcon />
          Версия Сайдбара
        </Typography>

        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
          Выберите версию сайдбара приложения
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent:'center'}}>
          <Box
            onClick={() => handleSidebarVersionChange(null, sidebarVersion === 'v1' ? 'v2' : 'v1')}
            sx={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '25px',
              padding: '4px',
              cursor: 'pointer',
              minWidth: 200,
              position: 'relative',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '4px',
                left: sidebarVersion === 'v1' ? '4px' : '50%',
                width: 'calc(50% - 4px)',
                height: 'calc(100% - 8px)',
                backgroundColor: 'primary.main',
                borderRadius: '20px',
                transition: 'left 0.3s ease',
                
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            />
            <Box
              sx={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 16px',
                position: 'relative',
                zIndex: 1,
                color: sidebarVersion === 'v1' ? 'white' : 'text.secondary',
                fontWeight: sidebarVersion === 'v1' ? 600 : 400,
                fontSize: '14px',
                transition: 'color 0.3s ease',
              }}
            >
              V1
            </Box>
            <Box
              sx={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 16px',
                position: 'relative',
                zIndex: 1,
                color: sidebarVersion === 'v2' ? 'white' : 'text.secondary',
                fontWeight: sidebarVersion === 'v2' ? 600 : 400,
                fontSize: '14px',
                transition: 'color 0.3s ease',
              }}
            >
              V2
            </Box>
          </Box>
        </Box>

        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          V1 - текущая версия макета. V2 - новая версия (в разработке)
        </Typography>
      </Box>

      {/* Настройка плеера в сайдбаре */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PaletteIcon />
          Плеер в сайдбаре
        </Typography>

        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
          Включить мини-плеер в боковой панели
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <Typography
            variant='body2'
            sx={{  color: 'text.secondary' }}
          >
            Плеер в сайдбаре
          </Typography>
          <Switch
            checked={sidebarPlayerEnabled}
            onChange={handleSidebarPlayerToggle}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'primary.main',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              },
            }}
          />
        </Box>

        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Показывать мини-плеер в боковой панели при воспроизведении музыки
        </Typography>
      </Box>

      {/* Настройки рекламы и обновлений - всегда видимы */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PaletteIcon />
          Дополнительные настройки
        </Typography>

        {/* Баннер с предупреждением для пользователей без Ultimate */}
        {!(subscription?.type === 'ultimate' || subscription?.type === 'max' || subscription?.type === 'pick-me') && (
          <Box
            sx={{
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: 'var(--main-border-radius)',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography
              variant='body2'
              sx={{
                color: 'warning.main',
                fontWeight: 500,
                flex: 1,
              }}
            >
              Для изменения данных настроек необходима подписка не ниже Ultimate
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2,justifyContent: 'space-between' }}>
          <Typography
            variant='body2'
            sx={{  color: 'text.secondary' }}
          >
            Реклама
          </Typography>
          <Switch
            checked={adsEnabled}
            onChange={handleAdsToggle}
            disabled={!(subscription?.type === 'ultimate' || subscription?.type === 'max' || subscription?.type === 'pick-me')}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'primary.main',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              },
              '& .MuiSwitch-switchBase.Mui-disabled': {
                color: 'text.disabled',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'action.disabled',
                },
              },
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <Typography
            variant='body2'
            sx={{  color: 'text.secondary' }}
          >
            Обновления
          </Typography>
          <Switch
            checked={updateEnabled}
            onChange={handleUpdateToggle}
            disabled={!(subscription?.type === 'ultimate' || subscription?.type === 'max' || subscription?.type === 'pick-me')}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: 'primary.main',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              },
              '& .MuiSwitch-switchBase.Mui-disabled': {
                color: 'text.disabled',
                '& + .MuiSwitch-track': {
                  backgroundColor: 'action.disabled',
                },
              },
            }}
          />
        </Box>

        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          Отключение рекламы и обновлений доступно только с подпиской Ultimate или выше
        </Typography>
      </Box>


      {(subscription?.type === 'ultimate' || subscription?.type === 'max' || subscription?.type === 'pick-me') && (
        <Box sx={sectionStyle}>
          <Typography
            variant='subtitle1'
            sx={{
              mb: 2,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <WallpaperIcon />
            Фоновая картинка профиля
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            {profileBackgroundUrl ? (
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  variant='rounded'
                  src={profileBackgroundUrl}
                  alt='Profile Background'
                  sx={{ width: 96, height: 96, borderRadius: 3, boxShadow: 2 }}
                />
                <IconButton
                  size='small'
                  color='error'
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)',
                    },
                  }}
                  onClick={handleDeleteBackground}
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Box>
            ) : (
              <Avatar
                variant='rounded'
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: 3,
                  bgcolor: 'background.default',
                  color: 'text.disabled',
                  boxShadow: 1,
                }}
              >
                <PhotoCameraIcon fontSize='large' />
              </Avatar>
            )}
            <Box>
              <Button
                variant='contained'
                component='label'
                startIcon={<PhotoCameraIcon />}
                sx={{ borderRadius: 'var(--main-border-radius)', fontWeight: 500 }}
              >
                Загрузить фон
                <input
                  type='file'
                  accept='image/png, image/jpeg, image/jpg, image/gif'
                  hidden
                  onChange={handleBackgroundUpload}
                />
              </Button>
              <Typography
                variant='caption'
                sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
              >
                Только для подписки Ultimate или MAX. PNG, JPG, GIF. До 5MB.
              </Typography>
            </Box>
          </Box>
          {/* Глобальные обои профиля */}
          {profileBackgroundUrl && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)' }}>
                      Глобальные обои профиля
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
                      При включении ваша фоновая картинка будет использоваться по всему сайту
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={globalProfileBackgroundEnabled}
                      onChange={handleGlobalProfileBackgroundToggle}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {/* Декорации */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <BrushIcon />
          Декорации профиля
        </Typography>

        {loadingDecorations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : userDecorations.length === 0 ? (
          <Typography color='textSecondary'>
            У вас пока нет декораций
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {userDecorations.map(item => {
              const decoration = item.decoration || item;
              return (
                <Paper
                  key={decoration.id}
                  sx={{
                    p: 2,
                    backgroundColor: 'var(--theme-background-full, rgba(255, 255, 255, 0.95))',
                    borderRadius: 'var(--main-border-radius)',
                    border: item.is_active
                      ? '2px solid primary.main'
                      : '1px solid rgba(66, 66, 66, 0.5)',
                  }}
                >
                  <DecorationPreview decoration={decoration}>
                    {decoration.item_path &&
                      (() => {
                        const [path, ...styles] =
                          decoration.item_path.split(';');
                        const styleObj = styles.reduce(
                          (acc: any, style: string) => {
                            const [key, value] = style
                              .split(':')
                              .map(s => s.trim());
                            return { ...acc, [key]: value };
                          },
                          {}
                        );

                        return (
                          <DecorationItem
                            src={path}
                            alt=''
                            customStyles={styleObj}
                          />
                        );
                      })()}
                  </DecorationPreview>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1,
                    }}
                  >
                    <Typography variant='subtitle1' fontWeight={600} sx={{ color: 'var(--theme-text-primary)' }}>
                      {decoration.name}
                    </Typography>
                    <Switch
                      checked={item.is_active || false}
                      onChange={e =>
                        handleToggleDecoration(decoration.id, e.target.checked)
                      }
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>


      {/* Экспорт / Импорт профиля */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CloudDownloadIcon />
          Экспорт / Импорт профиля
        </Typography>

        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
          Экспортируйте или импортируйте настройки профиля в формате .konnect
        </Typography>

        <Button
          variant='outlined'
          color='primary'
          sx={{ borderRadius: 'var(--main-border-radius)', fontWeight: 500 }}
          onClick={() => setKonnectModalOpen(true)}
        >
          Экспорт / Импорт профиля (.konnect)
        </Button>
      </Box>
      {/* Изменение цвета */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{
            mb: 2,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <PaletteIcon />
          Цвет акцента
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography
            variant='body2'
            sx={{  color: 'text.secondary' }}
          >
            Цвет акцента
          </Typography>
          <Tooltip title='Нажмите для выбора цвета'>
            <Badge
              overlap='circular'
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 'var(--avatar-border-radius)',
                    bgcolor: 'var(--theme-background-full, rgba(255, 255, 255, 0.95))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ColorLensIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                </Box>
              }
            >
              <Box
                onClick={() => setColorPickerOpen(true)}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--avatar-border-radius)',
                  backgroundColor: pendingAccentColor,
                  cursor: 'pointer',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `0 4px 12px ${pendingAccentColor}40`,
                }}
              />
            </Badge>
          </Tooltip>
        </Box>


        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size='small'
            variant='contained'
            onClick={handleApplyAccentColor}
            disabled={!isChanged || isApplying}
          >
            {isApplying ? <CircularProgress size={16} /> : 'Применить'}
          </Button>
          <Button
            size='small'
            variant='outlined'
            onClick={handleResetAccentColor}
          >
            Сбросить
          </Button>
        </Box>
      </Box>
      {/* ColorPicker Dialog */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon fontSize='small' color='primary' />
            <Typography variant='h6'>Выберите цвет</Typography>
          </Box>
          <IconButton
            size='small'
            onClick={() => setColorPickerOpen(false)}
            color='inherit'
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              height: 100,
              width: '100%',
              backgroundColor: currentColor,
              borderRadius: 'var(--main-border-radius)',
              mb: 3,
              boxShadow: `0 4px 20px ${currentColor}50`,
              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Красный ({red})
            </Typography>
            <Slider
              value={red}
              onChange={handleRedChange}
              min={0}
              max={255}
              sx={{
                color: '#f44336',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#f44336',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Зеленый ({green})
            </Typography>
            <Slider
              value={green}
              onChange={handleGreenChange}
              min={0}
              max={255}
              sx={{
                color: '#4caf50',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#4caf50',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Синий ({blue})
            </Typography>
            <Slider
              value={blue}
              onChange={handleBlueChange}
              min={0}
              max={255}
              sx={{
                color: '#2196f3',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#2196f3',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Готовые цвета
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                '#d0bcff',
                '#ff6b6b',
                '#4ecdc4',
                '#45b7d1',
                '#96ceb4',
                '#feca57',
                '#ff9ff3',
                '#54a0ff',
              ].map(color => (
                <Box
                  key={color}
                  onClick={() => handlePresetColorClick(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--avatar-border-radius)',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border:
                      currentColor === color
                        ? '2px solid white'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>Отмена</Button>
          <Button
            onClick={() => {
              setPendingAccentColor(currentColor);
              setColorPickerOpen(false);
            }}
            variant='contained'
          >
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Color Picker Dialog */}
      <Dialog
        open={profileColorPickerOpen}
        onClose={() => setProfileColorPickerOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ColorLensIcon fontSize='small' color='primary' />
            <Typography variant='h6'>Выберите цвет профиля</Typography>
          </Box>
          <IconButton
            size='small'
            onClick={() => setProfileColorPickerOpen(false)}
            color='inherit'
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              height: 100,
              width: '100%',
              backgroundColor: profileColorInput,
              borderRadius: 'var(--main-border-radius)',
              mb: 3,
              boxShadow: `0 4px 20px ${profileColorInput}50`,
              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Готовые цвета
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                '#D0BCFF',
                '#FF6B6B',
                '#4ECDC4',
                '#45B7D1',
                '#96CEB4',
                '#FECA57',
                '#FF9FF3',
                '#54A0FF',
                '#FF4D50',
                '#00D4AA',
                '#FFD700',
                '#FF69B4',
              ].map(color => (
                <Box
                  key={color}
                  onClick={() => setProfileColorInput(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--avatar-border-radius)',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border:
                      profileColorInput === color
                        ? '2px solid white'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setProfileColorPickerOpen(false)}>Отмена</Button>
          <Button
            onClick={() => {
              setProfileColorInput(profileColorInput);
              setProfileColorPickerOpen(false);
            }}
            variant='contained'
          >
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      {/* ProfileKonnectModal */}
      <ProfileKonnectModal
        open={konnectModalOpen}
        onClose={() => setKonnectModalOpen(false)}
      />
    </Box>
  );
};

export default CustomizationForm;
