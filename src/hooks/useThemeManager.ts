import { useState, useEffect, useCallback, useRef } from 'react';

export type ThemeMode = 'default' | 'blur';

interface ThemeManagerState {
  currentTheme: ThemeMode;
  isLoading: boolean;
}

interface ThemeManagerActions {
  switchToDefaultTheme: () => Promise<void>;
  switchToBlurTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  softReloadApp?: () => void;
}

interface ThemeManagerReturn
  extends ThemeManagerState,
    ThemeManagerActions {}

const THEME_MODE_KEY = 'themeMode';

// Data attributes for tracking processed elements
const THEME_ATTR = 'data-theme-processed';
const ORIGINAL_STYLES_ATTR = 'data-original-styles';

// IndexedDB константы
const DB_NAME = 'KConnectTheme';
const DB_VERSION = 1;
const STORE_NAME = 'themeSettings';

// Функции для работы с IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

const getFromIndexedDB = async (key: string): Promise<string | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB error, falling back to localStorage:', error);
    return localStorage.getItem(key);
  }
};

const setToIndexedDB = async (key: string, value: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    await store.put({ key, value });
  } catch (error) {
    console.warn('IndexedDB error, falling back to localStorage:', error);
    localStorage.setItem(key, value);
  }
};

// Performance optimization: batch DOM operations
let themeQueue: HTMLElement[] = [];
let isProcessingQueue = false;

const processThemeQueue = (themeMode?: ThemeMode) => {
  if (isProcessingQueue || themeQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  requestAnimationFrame(() => {
    const elements = [...themeQueue];
    themeQueue = [];
    
    elements.forEach(element => {
      if (element && element.isConnected) {
        applyThemeToElement(element, themeMode);
      }
    });
    
    isProcessingQueue = false;
    
    // Process any new elements that were added during processing
    if (themeQueue.length > 0) {
      processThemeQueue(themeMode);
    }
  });
};

const queueElementForTheme = (element: HTMLElement, themeMode?: ThemeMode) => {
  if (!element.hasAttribute(THEME_ATTR)) {
    themeQueue.push(element);
    processThemeQueue(themeMode);
  }
};

const applyThemeToElement = (element: HTMLElement, themeMode?: ThemeMode) => {
  if (element.hasAttribute(THEME_ATTR)) return;
  
  // Save original styles
  const originalStyles = {
    backdropFilter: element.style.backdropFilter,
    webkitBackdropFilter: (element.style as any).webkitBackdropFilter,
    background: element.style.background,
    backgroundColor: element.style.backgroundColor,
    backgroundImage: element.style.backgroundImage,
  };
  
  element.setAttribute(ORIGINAL_STYLES_ATTR, JSON.stringify(originalStyles));
  
  // Get current theme mode
  const currentTheme = themeMode || 'default';
  
  // Дополнительно обрабатываем элементы с sx стилями (Material-UI)
  const computedStyle = window.getComputedStyle(element);
  const hasSxStyles = computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                     computedStyle.background !== 'rgba(0, 0, 0, 0) none repeat scroll 0% 0%';
  
  if (currentTheme === 'default') {
    // Apply default theme (solid background, no blur)
    if (element.style.backdropFilter && element.style.backdropFilter.includes('blur(20px)')) {
      element.style.backdropFilter = element.style.backdropFilter.replace(/blur\(20px\)/g, '');
    }
    
    const webkitBackdropFilter = (element.style as any).webkitBackdropFilter;
    if (webkitBackdropFilter && webkitBackdropFilter.includes('blur(20px)')) {
      (element.style as any).webkitBackdropFilter = webkitBackdropFilter.replace(/blur\(20px\)/g, '');
    }
    
    // Replace rgba(255, 255, 255, 0.03) with rgba(15, 15, 15, 0.98)
    if (element.style.background && element.style.background.includes('rgba(255, 255, 255, 0.03)')) {
      element.style.background = element.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
    }
    
    if (element.style.backgroundColor && element.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
      element.style.backgroundColor = element.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
    }
    
    if (element.style.backgroundImage && element.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)')) {
      element.style.backgroundImage = element.style.backgroundImage.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
    }
    
    // Обрабатываем computed стили для sx элементов
    if (hasSxStyles) {
      const computedBg = computedStyle.backgroundColor;
      if (computedBg && computedBg.includes('rgba(255, 255, 255, 0.03)')) {
        element.style.backgroundColor = 'rgba(15, 15, 15, 0.98)';
      }
    }
  } else if (currentTheme === 'blur') {
    // Apply blur theme (with blur effects and transparent background)
    if (element.style.background && element.style.background.includes('rgba(15, 15, 15, 0.98)')) {
      element.style.background = element.style.background.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
      if (!element.style.backdropFilter || !element.style.backdropFilter.includes('blur(20px)')) {
        element.style.backdropFilter = (element.style.backdropFilter || '') + ' blur(20px)';
      }
    }
    
    if (element.style.backgroundColor && element.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')) {
      element.style.backgroundColor = element.style.backgroundColor.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
      if (!element.style.backdropFilter || !element.style.backdropFilter.includes('blur(20px)')) {
        element.style.backdropFilter = (element.style.backdropFilter || '') + ' blur(20px)';
      }
    }
    
    if (element.style.backgroundImage && element.style.backgroundImage.includes('rgba(15, 15, 15, 0.98)')) {
      element.style.backgroundImage = element.style.backgroundImage.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
      if (!element.style.backdropFilter || !element.style.backdropFilter.includes('blur(20px)')) {
        element.style.backgroundImage = element.style.backgroundImage.replace(/rgba\(15, 15, 15, 0\.98\)/g, 'rgba(255, 255, 255, 0.03)');
        if (!element.style.backdropFilter || !element.style.backdropFilter.includes('blur(20px)')) {
          element.style.backdropFilter = (element.style.backdropFilter || '') + ' blur(20px)';
        }
      }
    }
    
    // Обрабатываем computed стили для sx элементов
    if (hasSxStyles) {
      const computedBg = computedStyle.backgroundColor;
      if (computedBg && computedBg.includes('rgba(15, 15, 15, 0.98)')) {
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        if (!element.style.backdropFilter || !element.style.backdropFilter.includes('blur(20px)')) {
          element.style.backdropFilter = (element.style.backdropFilter || '') + ' blur(20px)';
        }
      }
    }
  }
  
  // Mark as processed
  element.setAttribute(THEME_ATTR, 'true');
};

// Убрали IndexedDB - используем только localStorage

const MODAL_AND_BOX_SELECTORS = [
  '[role="dialog"]',
  '[role="presentation"]',
  '.MuiModal-root',
  '.MuiDialog-root',
  '.MuiDrawer-root',
  '.MuiPopover-root',
  '.MuiTooltip-root',
  '.MuiMenu-root',
  '.MuiAutocomplete-popper',
  '.MuiPopper-root',
  '.MuiPaper-root',
  '.MuiCard-root',
  '.MuiBox-root',
  '.MuiContainer-root',
  '.MuiGrid-root',
  '.MuiStack-root',
  '[class*="modal"]',
  '[class*="Modal"]',
  '[class*="dialog"]',
  '[class*="Dialog"]',
  '[class*="drawer"]',
  '[class*="Drawer"]',
  '[class*="popover"]',
  '[class*="Popover"]',
  '[class*="tooltip"]',
  '[class*="Tooltip"]',
  '[class*="menu"]',
  '[class*="Menu"]',
  '[class*="autocomplete"]',
  '[class*="Autocomplete"]',
  '[class*="popper"]',
  '[class*="Popper"]',
  '[data-modal]',
  '[data-dialog]',
  '[data-drawer]',
  '[data-popover]',
  '[data-tooltip]',
  '[data-menu]',
  '[data-autocomplete]',
  '[data-popper]',
  '[class*="paper"]',
  '[class*="Paper"]',
  '[class*="card"]',
  '[class*="Card"]',
  '[class*="box"]',
  '[class*="Box"]',
  '[class*="container"]',
  '[class*="Container"]',
  '[class*="grid"]',
  '[class*="Grid"]',
  '[class*="stack"]',
  '[class*="Stack"]',
  '[class*="inventory-item-card"]',
  '[class*="equipped-item-compact"]',
  '[class*="sidebar-container"]',
  '[class*="css-"]',
  '[style*="backdrop-filter"]',
  '[style*="webkit-backdrop-filter"]',
  '[style*="rgba(255, 255, 255, 0.03)"]',
  '[style*="rgba(15, 15, 15, 0.98)"]',
  // Добавляем селекторы для MainLayout элементов
  '[data-testid="main-container"]',
  '[class*="MainContainer"]',
  '[class*="ContentWrapper"]',
  '[class*="ContentContainer"]',
  '[class*="SidebarContainer"]',
  '[class*="Overlay"]',
  // Добавляем селекторы для ProfilePage элементов
  '[data-profile-container]',
  '[class*="profile"]',
  '[class*="Profile"]',
  '[class*="user-card"]',
  '[class*="UserCard"]',
  '[class*="profile-card"]',
  '[class*="ProfileCard"]',
  '[class*="profile-info"]',
  '[class*="ProfileInfo"]',
  '[class*="profile-stats"]',
  '[class*="ProfileStats"]',
  '[class*="profile-about"]',
  '[class*="ProfileAbout"]',
  '[class*="profile-banner"]',
  '[class*="ProfileBanner"]',
  '[class*="profile-avatar"]',
  '[class*="ProfileAvatar"]',
  '[class*="profile-name"]',
  '[class*="ProfileName"]',
  '[class*="profile-username"]',
  '[class*="ProfileUsername"]',
  '[class*="profile-badges"]',
  '[class*="ProfileBadges"]',
  '[class*="profile-follow"]',
  '[class*="ProfileFollow"]',
  '[class*="profile-tabs"]',
  '[class*="ProfileTabs"]',
  '[class*="profile-content"]',
  '[class*="ProfileContent"]',
  '[class*="profile-posts"]',
  '[class*="ProfilePosts"]',
  '[class*="profile-wall"]',
  '[class*="ProfileWall"]',
  '[class*="profile-inventory"]',
  '[class*="ProfileInventory"]',
  '[class*="profile-about"]',
  '[class*="ProfileAbout"]',
].join(',');

const BUTTON_EXCLUDE_SELECTORS = [
  'button',
  '[role="button"]',
  '.MuiButton-root',
  '.MuiIconButton-root',
  '.MuiFab-root',
  '.MuiSpeedDialAction-root',
  '[class*="button"]',
  '[class*="Button"]',
  '[class*="btn"]',
  '[class*="Btn"]',
  '[data-button]',
  '[data-btn]',
].join(',');

export const useThemeManager = (): ThemeManagerReturn => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Отслеживаем последнюю примененную тему для предотвращения повторных применений
  const lastAppliedTheme = useRef<ThemeMode | null>(null);
  
  // Флаг для предотвращения срабатывания MutationObserver во время переключения тем
  const isSwitchingTheme = useRef<boolean>(false);

  const shouldProcessElement = useCallback((element: Element): boolean => {
    const el = element as HTMLElement;

    // Skip if already processed
    if (el.hasAttribute(THEME_ATTR)) {
      return false;
    }

    const isButton = element.matches(BUTTON_EXCLUDE_SELECTORS);
    const hasButtonParent = element.closest(BUTTON_EXCLUDE_SELECTORS) !== null;

    if (isButton || hasButtonParent) {
      return false;
    }

    const hasBlur20px =
      (el.style.backdropFilter &&
        el.style.backdropFilter.includes('blur(20px)')) ||
      ((el.style as any).webkitBackdropFilter &&
        (el.style as any).webkitBackdropFilter.includes('blur(20px)'));

    const hasTargetBackground =
      (el.style.background &&
        (el.style.background.includes('rgba(255, 255, 255, 0.03)') ||
         el.style.background.includes('rgba(15, 15, 15, 0.98)'))) ||
      (el.style.backgroundColor &&
        (el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
         el.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)'))) ||
      (el.style.backgroundImage &&
        (el.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)') ||
         el.style.backgroundImage.includes('rgba(15, 15, 15, 0.98)')));

    if (hasBlur20px || hasTargetBackground) {
      return true;
    }

    // Дополнительно проверяем computed стили для элементов с sx
    const computedStyle = window.getComputedStyle(el);
    const hasComputedTargetStyles = 
      (computedStyle.background && 
       (computedStyle.background.includes('rgba(255, 255, 255, 0.03)') ||
        computedStyle.background.includes('rgba(15, 15, 15, 0.98)'))) ||
      (computedStyle.backgroundColor && 
       (computedStyle.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
        computedStyle.backgroundColor.includes('rgba(15, 15, 15, 0.98)'))) ||
      (computedStyle.backgroundImage && 
       (computedStyle.backgroundImage.includes('rgba(255, 255, 255, 0.03)') ||
        computedStyle.backgroundImage.includes('rgba(15, 15, 15, 0.98)')));
    
    if (hasComputedTargetStyles) {
      return true;
    }

    const isModalOrBox = element.matches(MODAL_AND_BOX_SELECTORS);
    
    // Дополнительно проверяем элементы с data-testid для MainLayout
    const isMainLayoutElement = el.hasAttribute('data-testid') && 
      (el.getAttribute('data-testid') === 'main-container' || 
       el.classList.contains('MainContainer') ||
       el.classList.contains('ContentWrapper') ||
       el.classList.contains('ContentContainer') ||
       el.classList.contains('SidebarContainer') ||
       el.classList.contains('Overlay'));

    return isModalOrBox || isMainLayoutElement;
  }, []);

  const applyThemeToAllElements = useCallback(async (themeMode?: ThemeMode) => {
    let targetTheme: ThemeMode;
    
    if (themeMode) {
      targetTheme = themeMode;
    } else {
      // Получаем тему из IndexedDB
      const savedTheme = await getFromIndexedDB(THEME_MODE_KEY);
      targetTheme = (savedTheme as ThemeMode) || 'default';
    }
    
    
    // Защита от повторных применений одной и той же темы
    if (lastAppliedTheme.current === targetTheme) {
      return;
    }
    
    lastAppliedTheme.current = targetTheme;
    
    console.log('🎨 Применяем тему ко всем элементам:', targetTheme);
    
    // Более агрессивная обработка - обрабатываем ВСЕ элементы с нужными стилями
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const el = element as HTMLElement;
      
      // Пропускаем уже обработанные элементы
      if (el.hasAttribute(THEME_ATTR)) {
        return;
      }
      
      // Проверяем inline стили
      const hasInlineTargetStyles = 
        (el.style.background && 
         (el.style.background.includes('rgba(255, 255, 255, 0.03)') ||
          el.style.background.includes('rgba(15, 15, 15, 0.98)'))) ||
        (el.style.backgroundColor && 
         (el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
          el.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)'))) ||
        (el.style.backgroundImage && 
         (el.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)') ||
          el.style.backgroundImage.includes('rgba(15, 15, 15, 0.98)'))) ||
        (el.style.backdropFilter && el.style.backdropFilter.includes('blur(20px)')) ||
        ((el.style as any).webkitBackdropFilter && (el.style as any).webkitBackdropFilter.includes('blur(20px)'));
      
      // Проверяем computed стили
      const computedStyle = window.getComputedStyle(el);
      const hasComputedTargetStyles = 
        (computedStyle.background && 
         (computedStyle.background.includes('rgba(255, 255, 255, 0.03)') ||
          computedStyle.background.includes('rgba(15, 15, 15, 0.98)'))) ||
        (computedStyle.backgroundColor && 
         (computedStyle.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
          computedStyle.backgroundColor.includes('rgba(15, 15, 15, 0.98)'))) ||
        (computedStyle.backgroundImage && 
         (computedStyle.backgroundImage.includes('rgba(255, 255, 255, 0.03)') ||
          computedStyle.backgroundImage.includes('rgba(15, 15, 15, 0.98)'))) ||
        (computedStyle.backdropFilter && computedStyle.backdropFilter.includes('blur(20px)')) ||
        ((computedStyle as any).webkitBackdropFilter && (computedStyle as any).webkitBackdropFilter.includes('blur(20px)'));
      
      // Проверяем, является ли элемент кнопкой (исключаем)
      const isButton = el.matches(BUTTON_EXCLUDE_SELECTORS);
      const hasButtonParent = el.closest(BUTTON_EXCLUDE_SELECTORS) !== null;
      
      if ((hasInlineTargetStyles || hasComputedTargetStyles) && !isButton && !hasButtonParent) {
        console.log('🎨 Найден элемент для обработки:', el.tagName, el.className);
        applyThemeToElement(el, targetTheme);
      }
    });

    // Дополнительно обрабатываем MainLayout элементы
    const mainContainer = document.querySelector('[data-testid="main-container"]');
    if (mainContainer) {
      console.log('🎨 Обрабатываем MainLayout контейнер');
      applyThemeToElement(mainContainer as HTMLElement, targetTheme);
      
      // Обрабатываем ВСЕ дочерние элементы MainLayout принудительно
      const mainLayoutElements = mainContainer.querySelectorAll('*');
      mainLayoutElements.forEach(element => {
        const el = element as HTMLElement;
        
        // Проверяем, есть ли у элемента нужные стили
        const hasTargetStyles = 
          (el.style.background && 
           (el.style.background.includes('rgba(255, 255, 255, 0.03)') ||
            el.style.background.includes('rgba(15, 15, 15, 0.98)'))) ||
          (el.style.backgroundColor && 
           (el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
            el.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)'))) ||
          (el.style.backgroundImage && 
           (el.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)') ||
            el.style.backgroundImage.includes('rgba(15, 15, 15, 0.98)')));
        
        // Проверяем computed стили
        const computedStyle = window.getComputedStyle(el);
        const hasComputedTargetStyles = 
          (computedStyle.background && 
           (computedStyle.background.includes('rgba(255, 255, 255, 0.03)') ||
            computedStyle.background.includes('rgba(15, 15, 15, 0.98)'))) ||
          (computedStyle.backgroundColor && 
           (computedStyle.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
            computedStyle.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));
        
        // Проверяем, является ли элемент кнопкой
        const isButton = el.matches(BUTTON_EXCLUDE_SELECTORS);
        const hasButtonParent = el.closest(BUTTON_EXCLUDE_SELECTORS) !== null;
        
        if ((hasTargetStyles || hasComputedTargetStyles) && !isButton && !hasButtonParent && !el.hasAttribute(THEME_ATTR)) {
          console.log('🎨 Обрабатываем элемент MainLayout:', el.tagName, el.className);
          applyThemeToElement(el, targetTheme);
        }
      });
    }

    // Дополнительно обрабатываем ProfilePage элементы
    const profileContainer = document.querySelector('[data-profile-container]');
    if (profileContainer) {
      applyThemeToElement(profileContainer as HTMLElement, targetTheme);
      
      // Обрабатываем все дочерние элементы ProfilePage
      const profileElements = profileContainer.querySelectorAll('*');
      profileElements.forEach(element => {
        const el = element as HTMLElement;
        if (shouldProcessElement(el) && !el.hasAttribute(THEME_ATTR)) {
          applyThemeToElement(el, targetTheme);
        }
      });
    }

    // Обрабатываем все Paper элементы (они часто используются в ProfilePage)
    const paperElements = document.querySelectorAll('.MuiPaper-root');
    paperElements.forEach(element => {
      const el = element as HTMLElement;
      if (shouldProcessElement(el) && !el.hasAttribute(THEME_ATTR)) {
        applyThemeToElement(el, targetTheme);
      }
    });

    // Process CSS rules
    await processCSSRules();
    await processEmotionStyles();
  }, [shouldProcessElement]);

  const processCSSRules = useCallback(async () => {
    const currentThemeMode = await getFromIndexedDB(THEME_MODE_KEY) || 'default';
    
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            const hasTargetStyles =
              (rule.style.backdropFilter &&
                rule.style.backdropFilter.includes('blur(20px)')) ||
              (rule.style.background &&
                (rule.style.background.includes('rgba(255, 255, 255, 0.03)') ||
                 rule.style.background.includes('rgba(15, 15, 15, 0.98)'))) ||
              (rule.style.backgroundColor &&
                (rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                 rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));

            if (
              selector &&
              (selector.match(
                /\.Mui(Modal|Dialog|Drawer|Popover|Tooltip|Menu|Autocomplete|Popper|Paper|Card|Box|Container|Grid|Stack)-root/
              ) ||
                selector.match(/\.css-[a-zA-Z0-9]+/) ||
                hasTargetStyles)
            ) {
              if (currentThemeMode === 'default') {
                // Apply default theme
                if (
                  rule.style.backdropFilter &&
                  rule.style.backdropFilter.includes('blur(20px)')
                ) {
                  rule.style.backdropFilter = rule.style.backdropFilter.replace(
                    /blur\(20px\)/g,
                    ''
                  );
                }

                if (
                  rule.style.background &&
                  rule.style.background.includes('rgba(255, 255, 255, 0.03)')
                ) {
                  rule.style.background = rule.style.background.replace(
                    /rgba\(255, 255, 255, 0\.03\)/g,
                    'rgba(15, 15, 15, 0.98)'
                  );
                }

                if (
                  rule.style.backgroundColor &&
                  rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')
                ) {
                  rule.style.backgroundColor = rule.style.backgroundColor.replace(
                    /rgba\(255, 255, 255, 0\.03\)/g,
                    'rgba(15, 15, 15, 0.98)'
                  );
                }
              } else if (currentThemeMode === 'blur') {
                // Apply blur theme
                if (
                  rule.style.background &&
                  rule.style.background.includes('rgba(15, 15, 15, 0.98)')
                ) {
                  rule.style.background = rule.style.background.replace(
                    /rgba\(15, 15, 15, 0\.98\)/g,
                    'rgba(255, 255, 255, 0.03)'
                  );
                  if (!rule.style.backdropFilter || !rule.style.backdropFilter.includes('blur(20px)')) {
                    rule.style.backdropFilter = (rule.style.backdropFilter || '') + ' blur(20px)';
                  }
                }

                if (
                  rule.style.backgroundColor &&
                  rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')
                ) {
                  rule.style.backgroundColor = rule.style.backgroundColor.replace(
                    /rgba\(15, 15, 15, 0\.98\)/g,
                    'rgba(255, 255, 255, 0.03)'
                  );
                  if (!rule.style.backdropFilter || !rule.style.backdropFilter.includes('blur(20px)')) {
                    rule.style.backdropFilter = (rule.style.backdropFilter || '') + ' blur(20px)';
                  }
                }
              }
            }
          }
        });
      } catch (e) {
        // Ignore CORS errors for external stylesheets
      }
    });
  }, []);

  const processEmotionStyles = useCallback(async () => {
    const currentThemeMode = await getFromIndexedDB(THEME_MODE_KEY) || 'default';
    const emotionStyleTags = document.querySelectorAll('style[data-emotion="css"]');

    emotionStyleTags.forEach(styleTag => {
      const styleElement = styleTag as HTMLStyleElement;
      if (styleElement.sheet) {
        try {
          Array.from(styleElement.sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const hasTargetStyles =
                (rule.style.backdropFilter &&
                  rule.style.backdropFilter.includes('blur(20px)')) ||
                (rule.style.background &&
                  (rule.style.background.includes('rgba(255, 255, 255, 0.03)') ||
                   rule.style.background.includes('rgba(15, 15, 15, 0.98)'))) ||
                (rule.style.backgroundColor &&
                  (rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                   rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));

              if (hasTargetStyles) {
                if (currentThemeMode === 'default') {
                  // Apply default theme
                  if (
                    rule.style.backdropFilter &&
                    rule.style.backdropFilter.includes('blur(20px)')
                  ) {
                    rule.style.backdropFilter = rule.style.backdropFilter.replace(
                      /blur\(20px\)/g,
                      ''
                    );
                  }

                  if (
                    rule.style.background &&
                    rule.style.background.includes('rgba(255, 255, 255, 0.03)')
                  ) {
                    rule.style.background = rule.style.background.replace(
                      /rgba\(255, 255, 255, 0\.03\)/g,
                      'rgba(15, 15, 15, 0.98)'
                    );
                  }

                  if (
                    rule.style.backgroundColor &&
                    rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')
                  ) {
                    rule.style.backgroundColor = rule.style.backgroundColor.replace(
                      /rgba\(255, 255, 255, 0\.03\)/g,
                      'rgba(15, 15, 15, 0.98)'
                    );
                  }
                } else if (currentThemeMode === 'blur') {
                  // Apply blur theme
                  if (
                    rule.style.background &&
                    rule.style.background.includes('rgba(15, 15, 15, 0.98)')
                  ) {
                    rule.style.background = rule.style.background.replace(
                      /rgba\(15, 15, 15, 0\.98\)/g,
                      'rgba(255, 255, 255, 0.03)'
                    );
                    if (!rule.style.backdropFilter || !rule.style.backdropFilter.includes('blur(20px)')) {
                      rule.style.backdropFilter = (rule.style.backdropFilter || '') + ' blur(20px)';
                    }
                  }

                  if (
                    rule.style.backgroundColor &&
                    rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')
                  ) {
                    rule.style.backgroundColor = rule.style.backgroundColor.replace(
                      /rgba\(15, 15, 15, 0\.98\)/g,
                      'rgba(255, 255, 255, 0.03)'
                    );
                    if (!rule.style.backdropFilter || !rule.style.backdropFilter.includes('blur(20px)')) {
                      rule.style.backdropFilter = (rule.style.backdropFilter || '') + ' blur(20px)';
                    }
                  }
                }
              }
            }
          });
        } catch (e) {
          // Ignore errors
        }
      }
    });
  }, []);

  const clearThemeProcessing = useCallback(() => {
    // Remove theme processing attributes
    const processedElements = document.querySelectorAll(`[${THEME_ATTR}]`);
    processedElements.forEach(element => {
      element.removeAttribute(THEME_ATTR);
      element.removeAttribute(ORIGINAL_STYLES_ATTR);
    });

    // Clear theme queue
    themeQueue = [];
    isProcessingQueue = false;
  }, []);

  useEffect(() => {
    const loadThemeState = async () => {
      try {
        // Используем IndexedDB для хранения темы
        const savedTheme = await getFromIndexedDB(THEME_MODE_KEY) || 'default';
        const theme = (savedTheme as ThemeMode);
        setCurrentTheme(theme);
        
        // Применяем тему при загрузке и после полной загрузки DOM
        const applyThemeImmediately = () => {
          applyThemeToAllElements(theme);
        };

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyThemeImmediately, { once: true });
        } else {
          applyThemeImmediately();
        }

        // Дополнительно применяем тему после полной загрузки страницы
        if (document.readyState !== 'complete') {
          window.addEventListener('load', () => {
            setTimeout(() => applyThemeToAllElements(theme), 200);
          }, { once: true });
        }
      } catch (error) {
        console.error('Error loading theme state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeState();
  }, [applyThemeToAllElements]);

  // Убираем StorageEvent listener - он создает конфликт при изменении localStorage в том же окне
  // Синхронизация происходит только при загрузке и переключении тем

  const switchToDefaultTheme = async (): Promise<void> => {
    
    // Проверяем, что тема действительно изменилась
    if (currentTheme === 'default') {
      return;
    }
    
    isSwitchingTheme.current = true;
    setCurrentTheme('default');
    await setToIndexedDB(THEME_MODE_KEY, 'default');
    
    // Clear previous processing and apply new theme immediately
    clearThemeProcessing();
    await applyThemeToAllElements('default');
    
    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isSwitchingTheme.current = false;
    }, 200);
  };

  const switchToBlurTheme = async (): Promise<void> => {
    
    // Проверяем, что тема действительно изменилась
    if (currentTheme === 'blur') {
      return;
    }
    
    isSwitchingTheme.current = true;
    setCurrentTheme('blur');
    await setToIndexedDB(THEME_MODE_KEY, 'blur');
    
    // Clear previous processing and apply new theme immediately
    clearThemeProcessing();
    await applyThemeToAllElements('blur');
    
    // Сбрасываем флаг через небольшую задержку
    setTimeout(() => {
      isSwitchingTheme.current = false;
    }, 200);
  };

  const toggleTheme = async (): Promise<void> => {
    if (currentTheme === 'default') {
      await switchToBlurTheme();
    } else {
      await switchToDefaultTheme();
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let reapplyCount = 0;
    
    const observer = new MutationObserver(mutations => {
      // Не срабатываем во время переключения тем
      if (isSwitchingTheme.current) {
        return;
      }
      
      let shouldReapply = false;
      let addedElements: Element[] = [];

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              addedElements.push(element);
              
              // Проверяем сам элемент
              if (shouldProcessElement(element)) {
                shouldReapply = true;
              }

              // Проверяем все дочерние элементы
              const childElements = element.querySelectorAll
                ? element.querySelectorAll('*')
                : [];
              childElements.forEach(child => {
                addedElements.push(child);
                if (shouldProcessElement(child)) {
                  shouldReapply = true;
                }
              });
            }
          });
        } else if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'style' || mutation.attributeName === 'class')
        ) {
          const target = mutation.target as Element;
          if (target.hasAttribute(THEME_ATTR)) {
            target.removeAttribute(THEME_ATTR);
            target.removeAttribute(ORIGINAL_STYLES_ATTR);
            if (shouldProcessElement(target)) {
              shouldReapply = true;
            }
          }
        }
      });

      if (shouldReapply) {
        reapplyCount++;
        console.log(`🎨 MutationObserver: обнаружены новые элементы (попытка ${reapplyCount})`);
        
        // Дебаунсинг с увеличивающейся задержкой
        clearTimeout(timeoutId);
        const delay = Math.min(100 + (reapplyCount * 50), 500); // от 100ms до 500ms
        
        timeoutId = setTimeout(async () => {
          // Получаем актуальную тему из IndexedDB
          const actualTheme = await getFromIndexedDB(THEME_MODE_KEY) || 'default';
          console.log(`🎨 MutationObserver: применяем тему к новым элементам (${addedElements.length} элементов):`, actualTheme);
          
          // Применяем тему ко всем новым элементам
          addedElements.forEach(element => {
            const el = element as HTMLElement;
            if (el && !el.hasAttribute(THEME_ATTR)) {
              // Проверяем, есть ли у элемента нужные стили
              const hasTargetStyles = 
                (el.style.background && 
                 (el.style.background.includes('rgba(255, 255, 255, 0.03)') ||
                  el.style.background.includes('rgba(15, 15, 15, 0.98)'))) ||
                (el.style.backgroundColor && 
                 (el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                  el.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));
              
              // Проверяем computed стили
              const computedStyle = window.getComputedStyle(el);
              const hasComputedTargetStyles = 
                (computedStyle.background && 
                 (computedStyle.background.includes('rgba(255, 255, 255, 0.03)') ||
                  computedStyle.background.includes('rgba(15, 15, 15, 0.98)'))) ||
                (computedStyle.backgroundColor && 
                 (computedStyle.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                  computedStyle.backgroundColor.includes('rgba(15, 15, 15, 0.98)')));
              
              if (hasTargetStyles || hasComputedTargetStyles) {
                console.log('🎨 Применяем тему к новому элементу:', el.tagName, el.className);
                applyThemeToElement(el, actualTheme as ThemeMode);
              }
            }
          });
          
          // Также применяем тему ко всем элементам для надежности
          await applyThemeToAllElements(actualTheme as ThemeMode);
          
          // Сбрасываем счетчик через некоторое время
          setTimeout(() => {
            reapplyCount = 0;
          }, 1000);
        }, delay);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Периодическая проверка для обработки пропущенных элементов
    const intervalId = setInterval(async () => {
      if (!isSwitchingTheme.current && currentTheme) {
        const actualTheme = await getFromIndexedDB(THEME_MODE_KEY) || 'default';
        if (actualTheme === currentTheme) {
          console.log('🎨 Периодическая проверка: применяем тему ко всем элементам');
          await applyThemeToAllElements(actualTheme as ThemeMode);
        }
      }
    }, 3000); // Проверяем каждые 3 секунды

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [currentTheme, shouldProcessElement, applyThemeToAllElements]);

  return {
    currentTheme,
    isLoading,
    switchToDefaultTheme,
    switchToBlurTheme,
    toggleTheme,
  };
}; 