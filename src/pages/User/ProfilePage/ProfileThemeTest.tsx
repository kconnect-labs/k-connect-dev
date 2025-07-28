import React from 'react';
import { Box, Typography } from '@mui/material';
import { useThemeManager } from '../../../hooks/useThemeManager';
import ThemeToggle from '../../../components/ThemeToggle/ThemeToggle';

const ProfileThemeTest: React.FC = () => {
  const { currentTheme } = useThemeManager();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
        Тест системы тем в ProfilePage
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
        Обновленные компоненты ProfilePage:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ProfilePage.js - основной файл обновлен
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ CreatePost.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ PostsFeed.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ProfileInfo.module.css - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ StyledComponents.js - использует CSS переменные
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
          • WebkitBackdropFilter: 'blur(20px)' → WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))'
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

      <Typography variant="h6" sx={{ color: 'white', mb: 1, mt: 2 }}>
        Осталось обновить:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ InventoryTab.js - несколько вхождений background и backdropFilter
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ UserStatus.js - backdropFilter: 'blur(4px)'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ UserBanInfo.js - backdropFilter: 'blur(10px)'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ UserSubscriptionBadge.js - backdropFilter: 'blur(10px)'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ AttachmentsFeed.js - backdropFilter: 'blur(10px)'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ OwnedUsernames.js - backdropFilter: 'blur(5px)'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ⚠️ ProfileAbout.js - backdropFilter: 'blur(5px)'
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileThemeTest; 