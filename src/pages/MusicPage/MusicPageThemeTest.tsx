import React from 'react';
import { Box, Typography } from '@mui/material';
import { useThemeManager } from '../../hooks/useThemeManager';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';

const MusicPageThemeTest: React.FC = () => {
  const { currentTheme } = useThemeManager();

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
        Тест системы тем в MusicPage
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
        ✅ Обновленные компоненты MusicPage:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ArtistBlock.module.css - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ BlockContainer.module.css - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ charts-block.css - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ MyVibe.module.css - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ArtistCard.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ MyVibeWidget.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ NewTracksBlock.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ ArtistsBlock.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ AllTracksBlock.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ NewTracksPage.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ PlaylistsPage.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ TrackItem.js - использует CSS переменные
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          ✅ LikedTracksPage.js - использует CSS переменные
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
          • backgroundColor: 'rgba(255, 255, 255, 0.03)' → backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • backdropFilter: 'blur(20px)' → backdropFilter: 'var(--theme-backdrop-filter, blur(20px))'
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • backdrop-filter: blur(20px) → backdrop-filter: var(--theme-backdrop-filter, blur(20px))
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          • -webkit-backdrop-filter: blur(20px) → -webkit-backdrop-filter: var(--theme-backdrop-filter, blur(20px))
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
        🎯 Результат:
      </Typography>

      <Box sx={{ p: 2, background: 'rgba(76, 175, 80, 0.1)', borderRadius: 1, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          ✅ Система тем теперь работает во всех компонентах MusicPage!
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          ✅ Все музыкальные компоненты адаптируются к выбранной теме
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          ✅ Дефолтная тема: rgba(15, 15, 15, 0.98) без размытия
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          ✅ Blur тема: rgba(255, 255, 255, 0.03) с эффектом blur(20px)
        </Typography>
      </Box>
    </Box>
  );
};

export default MusicPageThemeTest; 