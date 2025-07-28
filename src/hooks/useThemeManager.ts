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

// IndexedDB операции
const DB_NAME = 'ThemeDB';
const DB_VERSION = 1;
const STORE_NAME = 'theme';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const saveThemeToIndexedDB = async (theme: ThemeType): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: 'current-theme', theme });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving theme to IndexedDB:', error);
  }
};

const getThemeFromIndexedDB = async (): Promise<ThemeType | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise<ThemeType | null>((resolve, reject) => {
      const request = store.get('current-theme');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.theme : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting theme from IndexedDB:', error);
    return null;
  }
};

export const useThemeManager = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [isApplying, setIsApplying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация темы при загрузке
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Сначала пробуем получить из IndexedDB
        const savedTheme = await getThemeFromIndexedDB();
        
        if (savedTheme) {
          setCurrentTheme(savedTheme);
          await applyTheme(savedTheme);
        } else {
          // Если в IndexedDB нет, применяем дефолтную тему
          await applyTheme('default');
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
        // В случае ошибки применяем дефолтную тему
        await applyTheme('default');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, []);

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

      // Сохраняем в IndexedDB
      await saveThemeToIndexedDB(themeType);
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