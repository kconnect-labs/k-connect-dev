import { useState, useEffect, useCallback } from 'react';

export type ThemeType =
  | 'default'
  | 'blur'
  | 'amoled'
  | 'light'
  | 'midnight'
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'aurora'
  | 'cosmic'
  | 'neon'
  | 'vintage'
  | 'pickme';

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
  amoled: {
    background: string;
    backdropFilter: string;
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

const THEME_SETTINGS: Record<
  ThemeType,
  {
    background: string;
    backdropFilter: string;
    siteBackground: string;
    themeColor: string;
    colorScheme: 'light' | 'dark';
    browserAccent: string;
    mainBorderRadius: string;
    smallBorderRadius: string;
    largeBorderRadius: string;
  }
> = {
  default: {
    background: 'rgba(15, 15, 15, 1)',
    backdropFilter: 'none',
    siteBackground: '#0a0a0a',
    themeColor: '#0f0f0f',
    colorScheme: 'dark',
    browserAccent: '#D0BCFF',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  blur: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    siteBackground: '#0a0a0a',
    themeColor: '#0a0a0a',
    colorScheme: 'dark',
    browserAccent: '#D0BCFF',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  amoled: {
    background: 'rgba(0, 0, 0, 1)',
    backdropFilter: 'none',
    siteBackground: '#000000',
    themeColor: '#0a0a0a',
    colorScheme: 'dark',
    browserAccent: '#D0BCFF',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  light: {
    background: 'rgba(255, 255, 255, 1)',
    backdropFilter: 'none',
    siteBackground: '#f5f5f5',
    themeColor: '#ffffff',
    colorScheme: 'light',
    browserAccent: '#6750A4',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  midnight: {
    background: 'rgba(5, 8, 20, 1)',
    backdropFilter: 'none',
    siteBackground: '#030510',
    themeColor: '#050814',
    colorScheme: 'dark',
    browserAccent: '#B69DF8',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  ocean: {
    background: 'rgba(8, 25, 40, 1)',
    backdropFilter: 'none',
    siteBackground: '#051520',
    themeColor: '#081928',
    colorScheme: 'dark',
    browserAccent: '#81C784',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  sunset: {
    background: 'rgba(40, 15, 8, 1)',
    backdropFilter: 'none',
    siteBackground: '#250a05',
    themeColor: '#280f08',
    colorScheme: 'dark',
    browserAccent: '#FFB74D',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  forest: {
    background: 'rgba(8, 30, 15, 1)',
    backdropFilter: 'none',
    siteBackground: '#051a0a',
    themeColor: '#081e0f',
    colorScheme: 'dark',
    browserAccent: '#A5D6A7',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  aurora: {
    background: 'rgba(12, 35, 25, 1)',
    backdropFilter: 'none',
    siteBackground: '#082015',
    themeColor: '#0c2319',
    colorScheme: 'dark',
    browserAccent: '#80CBC4',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  cosmic: {
    background: 'rgba(30, 8, 35, 1)',
    backdropFilter: 'none',
    siteBackground: '#1a051a',
    themeColor: '#1e0823',
    colorScheme: 'dark',
    browserAccent: '#CE93D8',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  neon: {
    background: 'rgba(8, 20, 45, 1)',
    backdropFilter: 'none',
    siteBackground: '#051025',
    themeColor: '#08142d',
    colorScheme: 'dark',
    browserAccent: '#64B5F6',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  vintage: {
    background: 'rgba(35, 20, 8, 1)',
    backdropFilter: 'none',
    siteBackground: '#221205',
    themeColor: '#231408',
    colorScheme: 'dark',
    browserAccent: '#D7CCC8',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
  pickme: {
    background: 'rgba(131, 61, 96, 1)',
    backdropFilter: 'none',
    siteBackground: '#b6668a',
    themeColor: '#833d60',
    colorScheme: 'dark',
    browserAccent: '#F8BBD9',
    mainBorderRadius: '18px',
    smallBorderRadius: '14px',
    largeBorderRadius: '22px',
  },
};

class ThemeDatabase {
  private dbName = 'KConnectDB';
  private dbVersion = 1;
  private storeName = 'themeSettings';

  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'key',
          });
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

  const notifyThemeChange = useCallback((themeType: ThemeType) => {
    try {
      const broadcastChannel = new BroadcastChannel('theme-changes');
      broadcastChannel.postMessage({
        type: 'theme-changed',
        theme: themeType,
      });
      broadcastChannel.close();
    } catch (error) {
      console.warn('BroadcastChannel not supported');
    }
  }, []);

  const applyTheme = useCallback(
    async (themeType: ThemeType) => {
      setIsApplying(true);

      try {
        const root = document.documentElement;
        const settings = THEME_SETTINGS[themeType];

        root.style.setProperty('--theme-background', settings.background);
        root.style.setProperty(
          '--theme-backdrop-filter',
          settings.backdropFilter
        );
        root.style.setProperty(
          '--theme-site-background',
          settings.siteBackground
        );
        root.style.setProperty('--theme-type', themeType);
        root.style.setProperty(
          '--main-border-radius !important',
          settings.mainBorderRadius
        );
        root.style.setProperty(
          '--small-border-radius',
          settings.smallBorderRadius
        );
        root.style.setProperty(
          '--large-border-radius',
          settings.largeBorderRadius
        );
        root.setAttribute('data-theme', themeType);

        // Принудительное обновление стилей для применения новых border-radius
        document.documentElement.style.setProperty(
          '--main-border-radius !important',
          settings.mainBorderRadius
        );
        document.documentElement.style.setProperty(
          '--small-border-radius',
          settings.smallBorderRadius
        );
        document.documentElement.style.setProperty(
          '--large-border-radius',
          settings.largeBorderRadius
        );

        const metaThemeColor = document.querySelector(
          'meta[name="theme-color"]'
        );
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', settings.themeColor);
          console.log(
            `🎨 Theme color updated to: ${settings.themeColor} for theme: ${themeType}`
          );
        }

        // Убираем изменение status bar style - это может вызывать проблемы с PWA
        // const appleStatusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        // if (appleStatusBarStyle) {
        //   const statusBarStyle = themeType === 'light' ? 'default' : 'black-translucent';
        //   appleStatusBarStyle.setAttribute('content', statusBarStyle);
        //   console.log(`📱 iOS status bar style updated to: ${statusBarStyle} for theme: ${themeType}`);
        // }

        let msNavButtonColor = document.querySelector(
          'meta[name="msapplication-navbutton-color"]'
        );
        if (!msNavButtonColor) {
          msNavButtonColor = document.createElement('meta');
          msNavButtonColor.setAttribute(
            'name',
            'msapplication-navbutton-color'
          );
          document.head.appendChild(msNavButtonColor);
        }
        msNavButtonColor.setAttribute('content', settings.themeColor);

        root.style.setProperty('color-scheme', settings.colorScheme);
        let colorSchemeMeta = document.querySelector(
          'meta[name="color-scheme"]'
        );
        if (!colorSchemeMeta) {
          colorSchemeMeta = document.createElement('meta');
          colorSchemeMeta.setAttribute('name', 'color-scheme');
          document.head.appendChild(colorSchemeMeta);
        }
        colorSchemeMeta.setAttribute('content', settings.colorScheme);

        root.style.setProperty('accent-color', settings.browserAccent);

        // Убираем дублирующий код для status bar style
        // let safariTintColor = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        // if (safariTintColor) {
        //   safariTintColor.setAttribute('content', themeType === 'light' ? 'default' : 'black-translucent');
        // }

        console.log(
          `🌐 Browser UI updated: color-scheme=${settings.colorScheme}, accent-color=${settings.browserAccent}`
        );

        setCurrentTheme(themeType);

        await themeDB.setThemeType(themeType);

        notifyThemeChange(themeType);

        const themeAwareElements = document.querySelectorAll('.theme-aware');
        themeAwareElements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.background = settings.background;
            element.style.backdropFilter = settings.backdropFilter;
            (element.style as any).webkitBackdropFilter =
              settings.backdropFilter;
          }
        });

        const textElements = document.querySelectorAll(
          '.text-primary, .text-secondary, .text-disabled, .text-accent, .text-error, .text-success, .text-warning, .text-info'
        );
        textElements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.style.color = getComputedStyle(root).getPropertyValue(
              '--theme-text-primary'
            );
          }
        });
      } catch (error) {
        console.error('Ошибка при применении темы:', error);
      } finally {
        setIsApplying(false);
      }
    },
    [notifyThemeChange]
  );

  const switchToDefaultTheme = useCallback(async () => {
    await applyTheme('default');
  }, [applyTheme]);

  const switchToBlurTheme = useCallback(async () => {
    await applyTheme('blur');
  }, [applyTheme]);

  const switchToAmoledTheme = useCallback(async () => {
    await applyTheme('amoled');
  }, [applyTheme]);

  const switchToLightTheme = useCallback(async () => {
    await applyTheme('light');
  }, [applyTheme]);

  const switchToMidnightTheme = useCallback(async () => {
    await applyTheme('midnight');
  }, [applyTheme]);

  const switchToOceanTheme = useCallback(async () => {
    await applyTheme('ocean');
  }, [applyTheme]);

  const switchToSunsetTheme = useCallback(async () => {
    await applyTheme('sunset');
  }, [applyTheme]);

  const switchToForestTheme = useCallback(async () => {
    await applyTheme('forest');
  }, [applyTheme]);

  const switchToAuroraTheme = useCallback(async () => {
    await applyTheme('aurora');
  }, [applyTheme]);

  const switchToCosmicTheme = useCallback(async () => {
    await applyTheme('cosmic');
  }, [applyTheme]);

  const switchToNeonTheme = useCallback(async () => {
    await applyTheme('neon');
  }, [applyTheme]);

  const switchToVintageTheme = useCallback(async () => {
    await applyTheme('vintage');
  }, [applyTheme]);

  const switchToPickmeTheme = useCallback(async () => {
    await applyTheme('pickme');
  }, [applyTheme]);

  const toggleTheme = useCallback(async () => {
    const newTheme = currentTheme === 'default' ? 'blur' : 'default';
    await applyTheme(newTheme);
  }, [currentTheme, applyTheme]);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedTheme = await themeDB.getThemeType();
        setCurrentTheme(savedTheme);
        await applyTheme(savedTheme);
      } catch (error) {
        console.error('Error initializing theme:', error);

        await applyTheme('default');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, [applyTheme]);

  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;

    try {
      broadcastChannel = new BroadcastChannel('theme-changes');

      broadcastChannel.onmessage = event => {
        if (
          event.data.type === 'theme-changed' &&
          event.data.theme !== currentTheme
        ) {
          applyTheme(event.data.theme);
        }
      };
    } catch (error) {
      console.warn(
        'BroadcastChannel not supported, theme sync between tabs disabled'
      );
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [currentTheme, applyTheme]);

  const applyThemeWithNotification = useCallback(
    async (themeType: ThemeType) => {
      try {
        await applyTheme(themeType);
      } catch (error) {
        console.error('Ошибка при применении темы с уведомлением:', error);
      }
    },
    [applyTheme]
  );

  return {
    currentTheme,
    isApplying,
    isInitialized,
    switchToDefaultTheme: () => applyThemeWithNotification('default'),
    switchToBlurTheme: () => applyThemeWithNotification('blur'),
    switchToAmoledTheme: () => applyThemeWithNotification('amoled'),
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
