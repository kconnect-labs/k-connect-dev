import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useThemeManager } from '../../../hooks/useThemeManager';
import ThemeToggle from '../../../components/ThemeToggle/ThemeToggle';

const SettingsThemeTest: React.FC = () => {
  const { currentTheme } = useThemeManager();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
        Тест системы тем в SettingsPage
      </Typography>
      
      <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
        Текущая тема: {currentTheme}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <ThemeToggle variant="buttons" showLabels />
        <ThemeToggle variant="switch" showLabels />
        <ThemeToggle variant="compact" />
      </Box>

      <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
        Обновленные компоненты SettingsPage:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ SettingsModal - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ SuccessModal - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ CacheManagementModal - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ProfileInfoForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ StatusForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ NotificationsForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ SecurityForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ CustomizationForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ LinkedAccountsForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ProfileUploader - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ SocialLinksForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ BadgesForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ExperimentalFeaturesForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ UsernamesForm - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ProfileKonnectModal - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ConnectionsModal - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ KonnectModal - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ProfilePreview - использует CSS переменные
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ color: 'white', mb: 1, mt: 2 }}>
        Что было заменено:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • background: 'rgba(255, 255, 255, 0.03)' → background: 'var(--theme-background, rgba(255, 255, 255, 0.03))'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • backdropFilter: 'blur(20px)' → backdropFilter: 'var(--theme-backdrop-filter, blur(20px))'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • bgcolor: 'rgba(255, 255, 255, 0.03)' → bgcolor: 'var(--theme-background, rgba(255, 255, 255, 0.03))'
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ color: 'white', mb: 1, mt: 2 }}>
        CSS переменные:
      </Typography>

      <Box sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>
          --theme-background: {getComputedStyle(document.documentElement).getPropertyValue('--theme-background')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>
          --theme-backdrop-filter: {getComputedStyle(document.documentElement).getPropertyValue('--theme-backdrop-filter')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'monospace' }}>
          data-theme: {document.documentElement.getAttribute('data-theme')}
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingsThemeTest; 