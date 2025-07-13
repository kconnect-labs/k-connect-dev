import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Paper,
  Grid,
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
  Avatar
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
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import ProfileKonnectModal from './ProfileKonnectModal';
import { ThemeSettingsContext } from '../../../../App';

// Компонент для отображения декорации
const DecorationItem = styled('img')(({ customStyles }: { customStyles?: any }) => ({
  position: 'absolute',
  right: 0,
  height: 'max-content',
  maxHeight: 60,
  opacity: 1,
  pointerEvents: 'none',
  zIndex: 1,
  ...customStyles
}));

// Компонент для превью декорации
const DecorationPreview = ({ decoration, children }: { decoration: any; children: React.ReactNode }) => {
  const isGradient = decoration?.background?.includes('linear-gradient');
  const isImage = decoration?.background?.includes('/');
  const isHexColor = decoration?.background?.startsWith('#');

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 60,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        background: decoration?.background ? (
          isImage ? 'none' : decoration.background
        ) : 'background.default',
        '&::before': isImage ? {
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
        } : {},
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

const CustomizationForm: React.FC<CustomizationFormProps> = ({ onSuccess, profileData, subscription }) => {
  const { globalProfileBackgroundEnabled, setGlobalProfileBackgroundEnabled } = useContext(ThemeSettingsContext);
  const [loading, setLoading] = useState(false);
  const [userDecorations, setUserDecorations] = useState<Decoration[]>([]);
  const [loadingDecorations, setLoadingDecorations] = useState(false);
  const [pendingAccentColor, setPendingAccentColor] = useState(() => localStorage.getItem('accentColorOverride') || '#d0bcff');
  const [pendingTextColorMode, setPendingTextColorMode] = useState(() => localStorage.getItem('accentTextColorMode') || 'light');
  const [appliedAccentColor, setAppliedAccentColor] = useState(() => localStorage.getItem('accentColorOverride') || '#d0bcff');
  const [appliedTextColorMode, setAppliedTextColorMode] = useState(() => localStorage.getItem('accentTextColorMode') || 'light');
  const [isApplying, setIsApplying] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState('#d0bcff');
  const [red, setRed] = useState(208);
  const [green, setGreen] = useState(188);
  const [blue, setBlue] = useState(255);
  const [konnectModalOpen, setKonnectModalOpen] = useState(false);
  const [profileBackgroundUrl, setProfileBackgroundUrl] = useState<string | null>(null);

  // Загрузка декораций и обоев профиля
  useEffect(() => {
    fetchUserDecorations();
    if (profileData?.user?.profile_background_url) {
      setProfileBackgroundUrl(profileData.user.profile_background_url);
    }
    
    // Отладка данных
    console.log('CustomizationForm - profileData:', profileData);
    console.log('CustomizationForm - subscription:', subscription);
    console.log('CustomizationForm - subscription?.type:', subscription?.type);
    console.log('CustomizationForm - subscription?.active:', subscription?.active);
  }, [profileData, subscription]);

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

  // Переключение декораций
  const handleToggleDecoration = async (decorationId: number, isActive: boolean) => {
    try {
      const response = await fetch('/api/decorations/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decoration_id: decorationId,
          is_active: isActive
        })
      });

      if (response.ok) {
        fetchUserDecorations();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error toggling decoration:', error);
    }
  };

  // Глобальные обои профиля
  const handleGlobalProfileBackgroundToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    try {
      await axios.post('/api/user/settings/global-profile-bg', { enabled });
      setGlobalProfileBackgroundEnabled(enabled);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving global background setting:', error);
    }
  };

  // Загрузка обоев профиля
  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('background', file);
    
    try {
      const response = await axios.post('/api/profile/background', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data?.background_url) {
        setProfileBackgroundUrl(response.data.background_url);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading background:', error);
      // Можно добавить уведомление об ошибке
    }
  };

  // Удаление обоев профиля
  const handleDeleteBackground = async () => {
    try {
      await axios.delete('/api/profile/background');
      setProfileBackgroundUrl(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error deleting background:', error);
      // Можно добавить уведомление об ошибке
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
          primary_color: pendingAccentColor
        })
      });

      const data = await response.json();
      if (data && data.success) {
        window.location.reload();
      }
      
      setAppliedAccentColor(pendingAccentColor);
      setAppliedTextColorMode(pendingTextColorMode);
      if (onSuccess) onSuccess();
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
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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

  const isChanged = pendingAccentColor !== appliedAccentColor || pendingTextColorMode !== appliedTextColorMode;

  const containerStyle = {
    p: 3,
    borderRadius: 2,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    mb: 3
  };

  const sectionStyle = {
    p: 2,
    borderRadius: 1.5,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    mb: 2
  };

  return (
    <Box >
      <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BrushIcon /> 
        Кастомизация
      </Typography>


      {/* Изменение цвета */}
      <Box sx={sectionStyle}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon /> 
          Цвет акцента
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 120, color: 'text.secondary' }}>
            Цвет акцента
          </Typography>
          <Tooltip title="Нажмите для выбора цвета">
            <Badge 
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                  borderRadius: '50%',
                  backgroundColor: pendingAccentColor,
                  cursor: 'pointer',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `0 4px 12px ${pendingAccentColor}40`
                }}
              />
            </Badge>
          </Tooltip>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Цвет оформления</Typography>
          <ToggleButtonGroup
            value={pendingTextColorMode}
            exclusive
            onChange={(_, val) => val && setPendingTextColorMode(val)}
            size="small"
          >
            <ToggleButton value="light">Светлый текст</ToggleButton>
            <ToggleButton value="dark">Тёмный текст</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={handleApplyAccentColor}
            disabled={!isChanged || isApplying}
          >
            {isApplying ? <CircularProgress size={16} /> : 'Применить'}
          </Button>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleResetAccentColor}
          >
            Сбросить
          </Button>
        </Box>
      </Box>

      {/* Декорации */}
      <Box sx={sectionStyle}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BrushIcon /> 
          Декорации профиля
        </Typography>
        
        {loadingDecorations ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : userDecorations.length === 0 ? (
          <Typography color="textSecondary">
            У вас пока нет декораций
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {userDecorations.map((item) => {
              const decoration = item.decoration || item;
              return (
                <Paper
                  key={decoration.id}
                  sx={{
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    border: item.is_active ? '2px solid primary.main' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <DecorationPreview decoration={decoration}>
                    {decoration.item_path && (() => {
                      const [path, ...styles] = decoration.item_path.split(';');
                      const styleObj = styles.reduce((acc: any, style: string) => {
                        const [key, value] = style.split(':').map(s => s.trim());
                        return { ...acc, [key]: value };
                      }, {});
                      
                      return (
                        <DecorationItem
                          src={path}
                          alt=""
                          customStyles={styleObj}
                        />
                      );
                    })()}
                  </DecorationPreview>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 1 
                  }}>
                    <Typography variant="subtitle1">
                      {decoration.name}
                    </Typography>
                    <Switch
                      checked={item.is_active || false}
                      onChange={(e) => handleToggleDecoration(decoration.id, e.target.checked)}
                    />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {subscription?.type === 'ultimate' && (
    <Box sx={sectionStyle}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WallpaperIcon /> 
        Фоновая картинка профиля
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {profileBackgroundUrl ? (
          <Box sx={{ position: 'relative' }}>
            <Avatar
              variant="rounded"
              src={profileBackgroundUrl}
              alt="Profile Background"
              sx={{ width: 96, height: 96, borderRadius: 3, boxShadow: 2 }}
            />
            <IconButton
              size="small"
              color="error"
              sx={{ 
                position: 'absolute', 
                top: 0, 
                right: 0, 
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                }
              }}
              onClick={handleDeleteBackground}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Avatar
            variant="rounded"
            sx={{ 
              width: 96, 
              height: 96, 
              borderRadius: 3, 
              bgcolor: 'background.default', 
              color: 'text.disabled', 
              boxShadow: 1 
            }}
          >
            <PhotoCameraIcon fontSize="large" />
          </Avatar>
        )}
        <Box>
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCameraIcon />}
            sx={{ borderRadius: 2, fontWeight: 500 }}
          >
            Загрузить фон
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/gif"
              hidden
              onChange={handleBackgroundUpload}
            />
          </Button>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Только для подписки Ultimate. PNG, JPG, GIF. До 5MB.
          </Typography>
        </Box>
      </Box>
      {/* Глобальные обои профиля */}
      {profileBackgroundUrl && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch
            checked={globalProfileBackgroundEnabled}
            onChange={handleGlobalProfileBackgroundToggle}
          />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Глобальные обои профиля
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              При включении ваша фоновая картинка будет использоваться по всему сайту
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )}

      {/* Экспорт / Импорт профиля */}
      <Box sx={sectionStyle}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudDownloadIcon /> 
          Экспорт / Импорт профиля
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Экспортируйте или импортируйте настройки профиля в формате .konnect
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          sx={{ borderRadius: 2, fontWeight: 500 }}
          onClick={() => setKonnectModalOpen(true)}
        >
          Экспорт / Импорт профиля (.konnect)
        </Button>
      </Box>

      {/* ColorPicker Dialog */}
      <Dialog 
        open={colorPickerOpen} 
        onClose={() => setColorPickerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaletteIcon fontSize="small" color="primary" />
            <Typography variant="h6">Выберите цвет</Typography>
          </Box>
          <IconButton size="small" onClick={() => setColorPickerOpen(false)} color="inherit">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ 
            height: 100, 
            width: '100%', 
            backgroundColor: currentColor, 
            borderRadius: 2, 
            mb: 3,
            boxShadow: `0 4px 20px ${currentColor}50`,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }} />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
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
            <Typography variant="body2" color="text.secondary" gutterBottom>
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
            <Typography variant="body2" color="text.secondary" gutterBottom>
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
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Готовые цвета
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['#d0bcff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'].map((color) => (
                <Box
                  key={color}
                  onClick={() => handlePresetColorClick(color)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: currentColor === color ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
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
            variant="contained"
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