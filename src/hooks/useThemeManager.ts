import { useState, useEffect, useCallback } from 'react';

export type ThemeType = 'default' | 'blur' | 'light' | 'midnight' | 'ocean' | 'sunset' | 'forest' | 'aurora' | 'cosmic' | 'neon' | 'vintage' | 'pickme';

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
  light: {
    background: string;
    backdropFilter: string;
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
  pickme: {
    background: string;
    backdropFilter: string;
    siteBackground: string;
  };
}

// Статический объект с настройками тем (синхронизирован с CSS)
const THEME_SETTINGS: Record<ThemeType, { background: string; backdropFilter: string; siteBackground: string }> = {
  default: {
    background: 'rgba(15, 15, 15, 0.98)',
    backdropFilter: 'none',
    siteBackground: '#0a0a0a',
  },
  blur: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#0a0a0a',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'none',
    siteBackground: '#f5f5f5',
  },
  midnight: {
    background: 'rgba(5, 8, 20, 0.95)',
    backdropFilter: 'none',
    siteBackground: '#030510',
  },
  ocean: {
    background: 'rgba(8, 25, 40, 0.92)',
    backdropFilter: 'none',
    siteBackground: '#051520',
  },
  sunset: {
    background: 'rgba(40, 15, 8, 0.94)',
    backdropFilter: 'none',
    siteBackground: '#250a05',
  },
  forest: {
    background: 'rgba(8, 30, 15, 0.93)',
    backdropFilter: 'none',
    siteBackground: '#051a0a',
  },
  aurora: {
    background: 'rgba(12, 35, 25, 0.91)',
    backdropFilter: 'none',
    siteBackground: '#082015',
  },
  cosmic: {
    background: 'rgba(30, 8, 35, 0.96)',
    backdropFilter: 'none',
    siteBackground: '#1a051a',
  },
  neon: {
    background: 'rgba(8, 20, 45, 0.89)',
    backdropFilter: 'none',
    siteBackground: '#051025',
  },
  vintage: {
    background: 'rgba(35, 20, 8, 0.95)',
    backdropFilter: 'none',
    siteBackground: '#221205',
  },
  pickme: {
    background: 'rgba(131, 61, 96, 0.93)',
    backdropFilter: 'none',
    siteBackground: '#b6668a',
  },
};

// Класс для работы с IndexedDB
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

  // Применение темы к CSS переменным
  const applyTheme = useCallback(async (themeType: ThemeType) => {
    setIsApplying(true);
    
    try {
      const root = document.documentElement;
      const settings = THEME_SETTINGS[themeType];
      
      // Применяем CSS переменные
      root.style.setProperty('--theme-background', settings.background);
      root.style.setProperty('--theme-backdrop-filter', settings.backdropFilter);
      root.style.setProperty('--theme-site-background', settings.siteBackground);
      root.style.setProperty('--theme-type', themeType);
      root.setAttribute('data-theme', themeType);
      
      // Обновляем состояние
      setCurrentTheme(themeType);
      
      // Сохраняем в IndexedDB
      await themeDB.setThemeType(themeType);
      
      // Уведомляем другие вкладки
      notifyThemeChange(themeType);
      
      // Принудительно обновляем элементы с классом theme-aware
      const themeAwareElements = document.querySelectorAll('.theme-aware');
      themeAwareElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.background = settings.background;
          element.style.backdropFilter = settings.backdropFilter;
          (element.style as any).webkitBackdropFilter = settings.backdropFilter;
        }
      });
      
      // Принудительно обновляем элементы с классами цветов текста
      const textElements = document.querySelectorAll('.text-primary, .text-secondary, .text-disabled, .text-accent, .text-error, .text-success, .text-warning, .text-info');
      textElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          // Перезагружаем CSS переменные для текста
          element.style.color = getComputedStyle(root).getPropertyValue('--theme-text-primary');
        }
      });
      
    } catch (error) {
      console.error('Ошибка при применении темы:', error);
    } finally {
      setIsApplying(false);
    }
  }, [notifyThemeChange]);

  // Переключение на дефолтную тему
  const switchToDefaultTheme = useCallback(async () => {
    await applyTheme('default');
  }, [applyTheme]);

  // Переключение на блюрную тему
  const switchToBlurTheme = useCallback(async () => {
    await applyTheme('blur');
  }, [applyTheme]);

  // Переключение на белую тему
  const switchToLightTheme = useCallback(async () => {
    await applyTheme('light');
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

  // Переключение на тему pickme
  const switchToPickmeTheme = useCallback(async () => {
    await applyTheme('pickme');
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

  // Функция для применения темы с уведомлением
  const applyThemeWithNotification = useCallback(async (themeType: ThemeType) => {
    try {
      await applyTheme(themeType);
      // Здесь можно добавить уведомление пользователю
    } catch (error) {
      console.error('Ошибка при применении темы с уведомлением:', error);
    }
  }, [applyTheme]);

  return {
    currentTheme,
    isApplying,
    isInitialized,
    switchToDefaultTheme: () => applyThemeWithNotification('default'),
    switchToBlurTheme: () => applyThemeWithNotification('blur'),
    switchToLightTheme: () => applyThemeWithNotification('light'),
    switchToMidnightTheme: () => applyThemeWithNotification('midnight'),
    switchToOceanTheme: () => applyThemeWithNotification('ocean'),
    switchToSunsetTheme: () => applyThemeWithNotification('sunset'),
    switchToForestTheme: () => applyThemeWithNotification('forest'),
    switchToAuroraTheme: () => applyThemeWithNotification('aurora'),
    switchToCosmicTheme: () => applyThemeWithNotification('cosmic'),
    switchToNeonTheme: () => applyThemeWithNotification('neon'),
    switchToVintageTheme: () => applyThemeWithNotification('vintage'),
    switchToPickmeTheme: () => applyThemeWithNotification('pickme'),
    toggleTheme: async () => {
      const newTheme = currentTheme === 'default' ? 'blur' : 'default';
      await applyThemeWithNotification(newTheme);
    },
    applyTheme: applyThemeWithNotification,
  };
}; 