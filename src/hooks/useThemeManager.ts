import { useState, useEffect, useCallback } from 'react';

export type ThemeType = 'default' | 'blur' | 'midnight' | 'ocean' | 'sunset' | 'forest' | 'aurora' | 'cosmic' | 'neon' | 'vintage';

interface ThemeSettings {
  type: ThemeType;
  blurGlass: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  default: {
    background: string;
    siteBackground: string;
  };
  midnight: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  ocean: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  sunset: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  forest: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  aurora: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  cosmic: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  neon: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
  vintage: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
}

const THEME_SETTINGS: ThemeSettings = {
  type: 'default',
  blurGlass: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#0a0a0a',
  },
  default: {
    background: 'rgba(15, 15, 15, 0.98)',
    siteBackground: '#0a0a0a',
  },
  midnight: {
    background: 'rgba(5, 8, 20, 0.95)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#030510',
  },
  ocean: {
    background: 'rgba(8, 25, 40, 0.92)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#051520',
  },
  sunset: {
    background: 'rgba(40, 15, 8, 0.94)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#250a05',
  },
  forest: {
    background: 'rgba(8, 30, 15, 0.93)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#051a0a',
  },
  aurora: {
    background: 'rgba(12, 35, 25, 0.91)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#082015',
  },
  cosmic: {
    background: 'rgba(30, 8, 35, 0.96)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#1a051a',
  },
  neon: {
    background: 'rgba(8, 20, 45, 0.89)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#051025',
  },
  vintage: {
    background: 'rgba(35, 20, 8, 0.95)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#221205',
  },
};

// IndexedDB утилиты
class ThemeDatabase {
  private dbName = 'KConnectDB';
  private dbVersion = 1;
  private storeName = 'themeSettings';

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Создаем хранилище для настроек темы
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('key', 'key', { unique: true });
        }
      };
    });
  }

  async getThemeType(): Promise<ThemeType> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('theme-type');

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : 'default');
        };
      });
    } catch (error) {
      console.error('Error getting theme from IndexedDB:', error);
      return 'default';
    }
  }

  async setThemeType(themeType: ThemeType): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ key: 'theme-type', value: themeType });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Error setting theme in IndexedDB:', error);
    }
  }
}

const themeDB = new ThemeDatabase();

export const useThemeManager = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
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
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.blurGlass.siteBackground);
        root.style.setProperty('--theme-type', 'blur');
        root.setAttribute('data-theme', 'blur');
      } else if (themeType === 'midnight') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.midnight.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.midnight.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.midnight.siteBackground);
        root.style.setProperty('--theme-type', 'midnight');
        root.setAttribute('data-theme', 'midnight');
      } else if (themeType === 'ocean') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.ocean.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.ocean.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.ocean.siteBackground);
        root.style.setProperty('--theme-type', 'ocean');
        root.setAttribute('data-theme', 'ocean');
      } else if (themeType === 'sunset') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.sunset.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.sunset.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.sunset.siteBackground);
        root.style.setProperty('--theme-type', 'sunset');
        root.setAttribute('data-theme', 'sunset');
      } else if (themeType === 'forest') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.forest.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.forest.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.forest.siteBackground);
        root.style.setProperty('--theme-type', 'forest');
        root.setAttribute('data-theme', 'forest');
      } else if (themeType === 'aurora') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.aurora.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.aurora.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.aurora.siteBackground);
        root.style.setProperty('--theme-type', 'aurora');
        root.setAttribute('data-theme', 'aurora');
      } else if (themeType === 'cosmic') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.cosmic.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.cosmic.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.cosmic.siteBackground);
        root.style.setProperty('--theme-type', 'cosmic');
        root.setAttribute('data-theme', 'cosmic');
      } else if (themeType === 'neon') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.neon.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.neon.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.neon.siteBackground);
        root.style.setProperty('--theme-type', 'neon');
        root.setAttribute('data-theme', 'neon');
      } else if (themeType === 'vintage') {
        root.style.setProperty('--theme-background', THEME_SETTINGS.vintage.background);
        root.style.setProperty('--theme-backdrop-filter', THEME_SETTINGS.vintage.backdropFilter);
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.vintage.siteBackground);
        root.style.setProperty('--theme-type', 'vintage');
        root.setAttribute('data-theme', 'vintage');
      } else {
        root.style.setProperty('--theme-background', THEME_SETTINGS.default.background);
        root.style.setProperty('--theme-backdrop-filter', 'none');
        root.style.setProperty('--theme-site-background', THEME_SETTINGS.default.siteBackground);
        root.style.setProperty('--theme-type', 'default');
        root.setAttribute('data-theme', 'default');
      }

      // Сохраняем в IndexedDB
      await themeDB.setThemeType(themeType);
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
          } else if (themeType === 'midnight') {
            element.style.background = THEME_SETTINGS.midnight.background;
            element.style.backdropFilter = THEME_SETTINGS.midnight.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.midnight.backdropFilter;
          } else if (themeType === 'ocean') {
            element.style.background = THEME_SETTINGS.ocean.background;
            element.style.backdropFilter = THEME_SETTINGS.ocean.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.ocean.backdropFilter;
          } else if (themeType === 'sunset') {
            element.style.background = THEME_SETTINGS.sunset.background;
            element.style.backdropFilter = THEME_SETTINGS.sunset.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.sunset.backdropFilter;
          } else if (themeType === 'forest') {
            element.style.background = THEME_SETTINGS.forest.background;
            element.style.backdropFilter = THEME_SETTINGS.forest.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.forest.backdropFilter;
          } else if (themeType === 'aurora') {
            element.style.background = THEME_SETTINGS.aurora.background;
            element.style.backdropFilter = THEME_SETTINGS.aurora.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.aurora.backdropFilter;
          } else if (themeType === 'cosmic') {
            element.style.background = THEME_SETTINGS.cosmic.background;
            element.style.backdropFilter = THEME_SETTINGS.cosmic.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.cosmic.backdropFilter;
          } else if (themeType === 'neon') {
            element.style.background = THEME_SETTINGS.neon.background;
            element.style.backdropFilter = THEME_SETTINGS.neon.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.neon.backdropFilter;
          } else if (themeType === 'vintage') {
            element.style.background = THEME_SETTINGS.vintage.background;
            element.style.backdropFilter = THEME_SETTINGS.vintage.backdropFilter;
            (element.style as any).webkitBackdropFilter = THEME_SETTINGS.vintage.backdropFilter;
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

  // Переключение на тему midnight
  const switchToMidnightTheme = useCallback(async () => {
    await applyTheme('midnight');
  }, [applyTheme]);

  // Переключение на тему ocean
  const switchToOceanTheme = useCallback(async () => {
    await applyTheme('ocean');
  }, [applyTheme]);

  // Переключение на тему sunset
  const switchToSunsetTheme = useCallback(async () => {
    await applyTheme('sunset');
  }, [applyTheme]);

  // Переключение на тему forest
  const switchToForestTheme = useCallback(async () => {
    await applyTheme('forest');
  }, [applyTheme]);

  // Переключение на тему aurora
  const switchToAuroraTheme = useCallback(async () => {
    await applyTheme('aurora');
  }, [applyTheme]);

  // Переключение на тему cosmic
  const switchToCosmicTheme = useCallback(async () => {
    await applyTheme('cosmic');
  }, [applyTheme]);

  // Переключение на тему neon
  const switchToNeonTheme = useCallback(async () => {
    await applyTheme('neon');
  }, [applyTheme]);

  // Переключение на тему vintage
  const switchToVintageTheme = useCallback(async () => {
    await applyTheme('vintage');
  }, [applyTheme]);

  // Переключение между темами
  const toggleTheme = useCallback(async () => {
    const newTheme = currentTheme === 'default' ? 'blur' : 'default';
    await applyTheme(newTheme);
  }, [currentTheme, applyTheme]);

  // Инициализация темы при загрузке
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Загружаем тему из IndexedDB
        const savedTheme = await themeDB.getThemeType();
        setCurrentTheme(savedTheme);
        await applyTheme(savedTheme);
      } catch (error) {
        console.error('Error initializing theme:', error);
        // В случае ошибки используем дефолтную тему
        await applyTheme('default');
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeTheme();
  }, [applyTheme]);

  // Слушатель изменений в IndexedDB (через BroadcastChannel API)
  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    
    try {
      // Создаем канал для синхронизации между вкладками
      broadcastChannel = new BroadcastChannel('theme-changes');
      
      broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'theme-changed' && event.data.theme !== currentTheme) {
          applyTheme(event.data.theme);
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported, theme sync between tabs disabled');
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [currentTheme, applyTheme]);

  // Функция для уведомления других вкладок об изменении темы
  const notifyThemeChange = useCallback((themeType: ThemeType) => {
    try {
      const broadcastChannel = new BroadcastChannel('theme-changes');
      broadcastChannel.postMessage({
        type: 'theme-changed',
        theme: themeType
      });
      broadcastChannel.close();
    } catch (error) {
      console.warn('BroadcastChannel not supported');
    }
  }, []);

  // Обновленная функция applyTheme с уведомлением других вкладок
  const applyThemeWithNotification = useCallback(async (themeType: ThemeType) => {
    await applyTheme(themeType);
    notifyThemeChange(themeType);
  }, [applyTheme, notifyThemeChange]);

  return {
    currentTheme,
    isApplying,
    isInitialized,
    switchToDefaultTheme: () => applyThemeWithNotification('default'),
    switchToBlurTheme: () => applyThemeWithNotification('blur'),
    switchToMidnightTheme: () => applyThemeWithNotification('midnight'),
    switchToOceanTheme: () => applyThemeWithNotification('ocean'),
    switchToSunsetTheme: () => applyThemeWithNotification('sunset'),
    switchToForestTheme: () => applyThemeWithNotification('forest'),
    switchToAuroraTheme: () => applyThemeWithNotification('aurora'),
    switchToCosmicTheme: () => applyThemeWithNotification('cosmic'),
    switchToNeonTheme: () => applyThemeWithNotification('neon'),
    switchToVintageTheme: () => applyThemeWithNotification('vintage'),
    toggleTheme: async () => {
      const newTheme = currentTheme === 'default' ? 'blur' : 'default';
      await applyThemeWithNotification(newTheme);
    },
    applyTheme: applyThemeWithNotification,
  };
}; 