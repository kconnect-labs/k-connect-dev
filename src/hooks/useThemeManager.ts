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
        root.style.setProperty('--theme-type', 'blur');
        root.setAttribute('data-theme', 'blur');
      } else {
        root.style.setProperty('--theme-background', THEME_SETTINGS.default.background);
        root.style.setProperty('--theme-backdrop-filter', 'none');
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
    toggleTheme: async () => {
      const newTheme = currentTheme === 'default' ? 'blur' : 'default';
      await applyThemeWithNotification(newTheme);
    },
    applyTheme: applyThemeWithNotification,
  };
}; 