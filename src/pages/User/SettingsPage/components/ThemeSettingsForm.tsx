import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Alert,
  CircularProgress,
  styled,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import { BlurOn as BlurOnIcon, BlurOff as BlurOffIcon } from '@mui/icons-material';
import { useThemeManager } from '../../../../hooks/useThemeManager';

interface ThemeSettingsFormProps {
  onSuccess?: () => void;
}

const ThemePreview = styled(Box)<{ themeMode: 'default' | 'blur' }>(({ theme, themeMode }) => ({
  width: 60,
  height: 40,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  flexShrink: 0,
  
  ...(themeMode === 'default' ? {
    backgroundColor: 'rgba(15, 15, 15, 0.98)',
  } : {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
  }),
}));

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({
  onSuccess,
}) => {
  const theme = useTheme();
  const { currentTheme, isLoading, switchToDefaultTheme, switchToBlurTheme } = useThemeManager();
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Дополнительная синхронизация с IndexedDB
  const [localTheme, setLocalTheme] = useState<'default' | 'blur'>(() => {
    return 'default'; // Будет загружено из IndexedDB
  });
  
  // Синхронизируем с IndexedDB при изменении
  useEffect(() => {
    const loadThemeFromIndexedDB = async () => {
      try {
        // Простая функция для получения из IndexedDB
        const getFromIndexedDB = async (key: string): Promise<string | null> => {
          try {
            const db = await indexedDB.open('KConnectTheme', 1);
            return new Promise((resolve, reject) => {
              db.onsuccess = () => {
                const transaction = db.result.transaction(['themeSettings'], 'readonly');
                const store = transaction.objectStore('themeSettings');
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result?.value || null);
                request.onerror = () => reject(request.error);
              };
              db.onerror = () => reject(db.error);
            });
          } catch (error) {
            console.warn('IndexedDB error:', error);
            return localStorage.getItem(key);
          }
        };
        
        const savedTheme = await getFromIndexedDB('themeMode') as 'default' | 'blur';
        if (savedTheme && savedTheme !== localTheme) {
          setLocalTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme from IndexedDB:', error);
      }
    };
    
    loadThemeFromIndexedDB();
  }, [localTheme]);
  
  // Используем localTheme как fallback
  const activeTheme = currentTheme || localTheme;

  const handleThemeChange = async (newTheme: 'default' | 'blur') => {
    if (isSwitching || isLoading) return;
    
    try {
      setIsSwitching(true);
      setLocalTheme(newTheme); // Обновляем локальное состояние сразу
      
      if (newTheme === 'default') {
        await switchToDefaultTheme();
      } else {
        await switchToBlurTheme();
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error switching theme:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Box sx={{  }}>



      {/* Обычная тема */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 1,
        background: activeTheme === 'default' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        border: activeTheme === 'default' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.08)',
        mb: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }} onClick={() => handleThemeChange('default')}>
        <Switch
          checked={activeTheme === 'default'}
          disabled={isLoading || isSwitching}
          color='primary'
          size="small"
        />
        
        <ThemePreview themeMode="default">
          <BlurOffIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
        </ThemePreview>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant='body2' fontWeight={500} sx={{ fontSize: '0.9rem' }}>
              Обычная тема
            </Typography>
            {activeTheme === 'default' && (
              <Chip label="Активна" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Box>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            Классический стиль без эффектов размытия
          </Typography>
        </Box>
        
        {isLoading || isSwitching ? (
          <CircularProgress size={16} />
        ) : (
          <BlurOffIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        )}
      </Box>

      {/* Блюр стекло */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: 1,
        background: activeTheme === 'blur' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        border: activeTheme === 'blur' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.08)',
        mb: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      }} onClick={() => handleThemeChange('blur')}>
        <Switch
          checked={activeTheme === 'blur'}
          disabled={isLoading || isSwitching}
          color='primary'
          size="small"
        />
        
        <ThemePreview themeMode="blur">
          <BlurOnIcon sx={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.7)' }} />
        </ThemePreview>
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant='body2' fontWeight={500} sx={{ fontSize: '0.9rem' }}>
              Блюр стекло
            </Typography>
            {activeTheme === 'blur' && (
              <Chip label="Активна" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Box>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
            Современный стиль с эффектами размытия
          </Typography>
        </Box>
        
        {isLoading || isSwitching ? (
          <CircularProgress size={16} />
        ) : (
          <BlurOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
        )}
      </Box>

      {/* Статус */}
      <Box sx={{ 
        mt: 2, 
        p: 1.5, 
        borderRadius: 1,
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          Текущая тема: {activeTheme === 'default' ? 'Обычная' : 'Блюр стекло'}
          {(isLoading || isSwitching) && ' • Применяется...'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ThemeSettingsForm; 