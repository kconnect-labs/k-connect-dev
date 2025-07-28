import { useState, useEffect, useCallback } from 'react';

export type ThemeType = 'default' | 'blur';

interface ThemeSettings {
  type: ThemeType;
  blurGlass: {
    background: string;
    backdropFilter: string;
  };
  default: {
    background: string;
  };
}

const THEME_SETTINGS: ThemeSettings = {
  type: 'default',
  blurGlass: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
  },
  default: {
    background: 'rgba(15, 15, 15, 0.98)',
  },
};

export const useThemeManager = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('theme-type');
    return (saved as ThemeType) || 'default';
  });

  const [isApplying, setIsApplying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Применение темы к CSS переменным
  const applyTheme = useCallback(async (themeType: ThemeType) => {
    setIsApplying(true);
    
    try {
      // Устанавливаем CSS переменные и data-атрибут
      const root = document.documentElement;
      
      if (themeType === 'blur') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.blurGlass.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.blurGlass.backdropFilter);
        root.style.setProperty('--theme-type', 'blur');
        root.setAttribute('data-theme', 'blur');
      } else {
        root.style.setProperty('--theme-background', THEME_SETTINGS.default.background);
        root.style.setProperty('--theme-backdrop-filter', 'none');
        root.style.setProperty('--theme-type', 'default');
        root.setAttribute('data-theme', 'default');
      }

      // Сохраняем в localStorage
      localStorage.setItem('theme-type', themeType);
      setCurrentTheme(themeType);

      // Обновляем все элементы с классом theme-aware
      const themeElements = document.querySelectorAll('.theme-aware');
      themeElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          // Принудительно применяем стили
          if (themeType === 'blur') {
            element.style.background = THEME_SETTINGS.blurGlass.background;
            element.style.backdropFilter = THEME_SETTINGS.blurGlass.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.blurGlass.backdropFilter;
          } else {
            element.style.background = THEME_SETTINGS.default.background;
            element.style.backdropFilter = 'none';
            (element.style as any).webkitBackdropFilter = 'none';
          }
        }
      });

      // Небольшая задержка для плавности
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Error applying theme:', error);
    } finally {
      setIsApplying(false);
    }
  }, []);

  // Переключение на дефолтную тему
  const switchToDefaultTheme = useCallback(async () => {
    await applyTheme('default');
  }, [applyTheme]);

  // Переключение на блюрную тему
  const switchToBlurTheme = useCallback(async () => {
    await applyTheme('blur');
  }, [applyTheme]);

  // Переключение между темами
  const toggleTheme = useCallback(async () => {
    const newTheme = currentTheme === 'default' ? 'blur' : 'default';
    await applyTheme(newTheme);
  }, [currentTheme, applyTheme]);

  // Инициализация темы при загрузке
  useEffect(() => {
    const initializeTheme = async () => {
      await applyTheme(currentTheme);
      setIsInitialized(true);
    };
    
    initializeTheme();
  }, [applyTheme, currentTheme]);

  // Слушатель изменений в localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme-type' && e.newValue) {
        const newTheme = e.newValue as ThemeType;
        if (newTheme !== currentTheme) {
          applyTheme(newTheme);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentTheme, applyTheme]);

  return {
    currentTheme,
    isApplying,
    isInitialized,
    switchToDefaultTheme,
    switchToBlurTheme,
    toggleTheme,
    applyTheme,
  };
}; 