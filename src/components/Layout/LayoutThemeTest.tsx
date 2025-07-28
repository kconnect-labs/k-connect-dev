import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useThemeManager } from '../../hooks/useThemeManager';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

const LayoutThemeTest: React.FC = () => {
  const { currentTheme } = useThemeManager();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
        Тест системы тем в Layout
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
        Компоненты Layout с поддержкой тем:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ MainLayout - использует класс theme-aware
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ Header - использует класс theme-aware
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ Sidebar - использует класс theme-aware
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ CommandPalette - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ HeaderSearch - использует CSS переменные
        </Typography>
      </Box>

      <Typography variant="h6" sx={{ color: 'white', mb: 1, mt: 2 }}>
        Что было обновлено:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • MainLayout.tsx - добавлен класс theme-aware
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • Header.js - удалены хардкодные стили, добавлен класс theme-aware
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • Sidebar.js - удалены хардкодные стили, добавлен класс theme-aware
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • Sidebar.css - обновлен для использования CSS переменных
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • CommandPalleteModal.js - обновлен для использования CSS переменных
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • HeaderSearch.css - обновлен для использования CSS переменных
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

export default LayoutThemeTest; 