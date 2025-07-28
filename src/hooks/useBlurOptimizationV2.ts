import { useState, useEffect, useCallback } from 'react';

interface BlurOptimizationState {
  isEnabled: boolean;
  isLoading: boolean;
}

interface BlurOptimizationActions {
  enableBlurOptimizationV2: () => Promise<void>;
  disableBlurOptimization: () => Promise<void>;
  toggleBlurOptimization: () => Promise<void>;
}

interface BlurOptimizationReturn
  extends BlurOptimizationState,
    BlurOptimizationActions {}

const BLUR_OPTIMIZATION_KEY = 'blurOptimizationEnabled';
const BLUR_OPTIMIZATION_V2_KEY = 'blurOptimizationV2Enabled';
const DB_NAME = 'KConnectOptimization';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

// Data attributes for tracking processed elements
const OPTIMIZED_ATTR = 'data-blur-optimized-v2';
const ORIGINAL_STYLES_ATTR = 'data-original-styles-v2';

// Performance optimization: batch DOM operations
let optimizationQueue: HTMLElement[] = [];
let isProcessingQueue = false;

const processOptimizationQueue = () => {
  if (isProcessingQueue || optimizationQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  requestAnimationFrame(() => {
    const elements = [...optimizationQueue];
    optimizationQueue = [];
    
    elements.forEach(element => {
      if (element && element.isConnected) {
        applyOptimizationToElement(element);
      }
    });
    
    isProcessingQueue = false;
    
    // Process any new elements that were added during processing
    if (optimizationQueue.length > 0) {
      processOptimizationQueue();
    }
  });
};

const queueElementForOptimization = (element: HTMLElement) => {
  if (!element.hasAttribute(OPTIMIZED_ATTR)) {
    optimizationQueue.push(element);
    processOptimizationQueue();
  }
};

const applyOptimizationToElement = (element: HTMLElement) => {
  if (element.hasAttribute(OPTIMIZED_ATTR)) return;
  
  // Save original styles
  const originalStyles = {
    backdropFilter: element.style.backdropFilter,
    webkitBackdropFilter: (element.style as any).webkitBackdropFilter,
    background: element.style.background,
    backgroundColor: element.style.backgroundColor,
    backgroundImage: element.style.backgroundImage,
  };
  
  element.setAttribute(ORIGINAL_STYLES_ATTR, JSON.stringify(originalStyles));
  
  // Apply optimizations - Enhanced V2 with darker colors and transparency
  if (element.style.backdropFilter && element.style.backdropFilter.includes('blur(20px)')) {
    element.style.backdropFilter = element.style.backdropFilter.replace(/blur\(20px\)/g, '');
    element.style.backgroundColor = 'rgba(15, 15, 15, 0.98)';
  }
  
  const webkitBackdropFilter = (element.style as any).webkitBackdropFilter;
  if (webkitBackdropFilter && webkitBackdropFilter.includes('blur(20px)')) {
    (element.style as any).webkitBackdropFilter = webkitBackdropFilter.replace(/blur\(20px\)/g, '');
    element.style.backgroundColor = 'rgba(15, 15, 15, 0.98)';
  }
  
  if (element.style.background && element.style.background.includes('rgba(255, 255, 255, 0.03)')) {
    element.style.background = element.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.backgroundColor && element.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
    element.style.backgroundColor = element.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.backgroundImage && element.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)')) {
    element.style.backgroundImage = element.style.backgroundImage.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  // Enhanced V2: Also optimize other semi-transparent backgrounds
  if (element.style.background && element.style.background.includes('rgba(255, 255, 255, 0.05)')) {
    element.style.background = element.style.background.replace(/rgba\(255, 255, 255, 0\.05\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.backgroundColor && element.style.backgroundColor.includes('rgba(255, 255, 255, 0.05)')) {
    element.style.backgroundColor = element.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.05\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.background && element.style.background.includes('rgba(255, 255, 255, 0.08)')) {
    element.style.background = element.style.background.replace(/rgba\(255, 255, 255, 0\.08\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.backgroundColor && element.style.backgroundColor.includes('rgba(255, 255, 255, 0.08)')) {
    element.style.backgroundColor = element.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.08\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.background && element.style.background.includes('rgba(255, 255, 255, 0.12)')) {
    element.style.background = element.style.background.replace(/rgba\(255, 255, 255, 0\.12\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  if (element.style.backgroundColor && element.style.backgroundColor.includes('rgba(255, 255, 255, 0.12)')) {
    element.style.backgroundColor = element.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.12\)/g, 'rgba(15, 15, 15, 0.98)');
  }
  
  // Mark as processed
  element.setAttribute(OPTIMIZED_ATTR, 'true');
};

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

// Check if V1 optimization is enabled
const isV1Enabled = async (): Promise<boolean> => {
  try {
    const v1State = await getFromIndexedDB(BLUR_OPTIMIZATION_KEY);
    return v1State === 'true';
  } catch {
    return false;
  }
};

// Disable V1 optimization
const disableV1Optimization = async (): Promise<void> => {
  try {
    await setToIndexedDB(BLUR_OPTIMIZATION_KEY, 'false');
    
    // Remove V1 optimized elements
    const v1OptimizedElements = document.querySelectorAll('[data-blur-optimized]');
    v1OptimizedElements.forEach(element => {
      const el = element as HTMLElement;
      
      // Restore original styles
      const originalStylesAttr = el.getAttribute('data-original-styles');
      if (originalStylesAttr) {
        try {
          const originalStyles = JSON.parse(originalStylesAttr);
          el.style.backdropFilter = originalStyles.backdropFilter || '';
          (el.style as any).webkitBackdropFilter = originalStyles.webkitBackdropFilter || '';
          el.style.background = originalStyles.background || '';
          el.style.backgroundColor = originalStyles.backgroundColor || '';
          el.style.backgroundImage = originalStyles.backgroundImage || '';
        } catch (e) {
          console.warn('Failed to restore V1 original styles:', e);
        }
      }

      // Remove V1 tracking attributes
      el.removeAttribute('data-blur-optimized');
      el.removeAttribute('data-original-styles');
    });
  } catch (error) {
    console.warn('Failed to disable V1 optimization:', error);
  }
};

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

export const useBlurOptimizationV2 = (): BlurOptimizationReturn => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const shouldOptimizeElement = useCallback((element: Element): boolean => {
    const el = element as HTMLElement;

    // Skip if already processed
    if (el.hasAttribute(OPTIMIZED_ATTR)) {
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
        el.style.background.includes('rgba(255, 255, 255, 0.03)')) ||
      (el.style.backgroundColor &&
        el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)'));

    if (hasBlur20px || hasTargetBackground) {
      return true;
    }

    const isModalOrBox = element.matches(MODAL_AND_BOX_SELECTORS);

    return isModalOrBox;
  }, []);

  const applyBlurOptimization = useCallback(() => {
    // Process existing elements
    const allElements = document.querySelectorAll('*');
    const elementsToOptimize = Array.from(allElements).filter(shouldOptimizeElement);

    elementsToOptimize.forEach(element => {
      queueElementForOptimization(element as HTMLElement);
    });

    // Process CSS rules
    processCSSRules();
    processEmotionStyles();
  }, [shouldOptimizeElement]);

  const processCSSRules = useCallback(() => {
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
                 rule.style.background.includes('rgba(255, 255, 255, 0.05)') ||
                 rule.style.background.includes('rgba(255, 255, 255, 0.08)') ||
                 rule.style.background.includes('rgba(255, 255, 255, 0.12)'))) ||
              (rule.style.backgroundColor &&
                (rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                 rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.05)') ||
                 rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.08)') ||
                 rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.12)')));

            if (
              selector &&
              (selector.match(
                /\.Mui(Modal|Dialog|Drawer|Popover|Tooltip|Menu|Autocomplete|Popper|Paper|Card|Box|Container|Grid|Stack)-root/
              ) ||
                selector.match(/\.css-[a-zA-Z0-9]+/) ||
                hasTargetStyles)
            ) {
              if (
                rule.style.backdropFilter &&
                rule.style.backdropFilter.includes('blur(20px)')
              ) {
                rule.style.backdropFilter = rule.style.backdropFilter.replace(
                  /blur\(20px\)/g,
                  ''
                );
                rule.style.backgroundColor = 'rgba(15, 15, 15, 0.98)';
              }

              if (
                rule.style.background &&
                (rule.style.background.includes('rgba(255, 255, 255, 0.03)') ||
                 rule.style.background.includes('rgba(255, 255, 255, 0.05)') ||
                 rule.style.background.includes('rgba(255, 255, 255, 0.08)') ||
                 rule.style.background.includes('rgba(255, 255, 255, 0.12)'))
              ) {
                rule.style.background = rule.style.background.replace(
                  /rgba\(255, 255, 255, 0\.(03|05|08|12)\)/g,
                  'rgba(15, 15, 15, 0.98)'
                );
              }

              if (
                rule.style.backgroundColor &&
                (rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                 rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.05)') ||
                 rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.08)') ||
                 rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.12)'))
              ) {
                rule.style.backgroundColor = rule.style.backgroundColor.replace(
                  /rgba\(255, 255, 255, 0\.(03|05|08|12)\)/g,
                  'rgba(15, 15, 15, 0.98)'
                );
              }
            }
          }
        });
      } catch (e) {
        // Ignore CORS errors for external stylesheets
      }
    });
  }, []);

  const processEmotionStyles = useCallback(() => {
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
                   rule.style.background.includes('rgba(255, 255, 255, 0.05)') ||
                   rule.style.background.includes('rgba(255, 255, 255, 0.08)') ||
                   rule.style.background.includes('rgba(255, 255, 255, 0.12)'))) ||
                (rule.style.backgroundColor &&
                  (rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                   rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.05)') ||
                   rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.08)') ||
                   rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.12)')));

              if (hasTargetStyles) {
                if (
                  rule.style.backdropFilter &&
                  rule.style.backdropFilter.includes('blur(20px)')
                ) {
                  rule.style.backdropFilter = rule.style.backdropFilter.replace(
                    /blur\(20px\)/g,
                    ''
                  );
                  rule.style.backgroundColor = 'rgba(15, 15, 15, 0.98)';
                }

                if (
                  rule.style.background &&
                  (rule.style.background.includes('rgba(255, 255, 255, 0.03)') ||
                   rule.style.background.includes('rgba(255, 255, 255, 0.05)') ||
                   rule.style.background.includes('rgba(255, 255, 255, 0.08)') ||
                   rule.style.background.includes('rgba(255, 255, 255, 0.12)'))
                ) {
                  rule.style.background = rule.style.background.replace(
                    /rgba\(255, 255, 255, 0\.(03|05|08|12)\)/g,
                    'rgba(15, 15, 15, 0.98)'
                  );
                }

                if (
                  rule.style.backgroundColor &&
                  (rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)') ||
                   rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.05)') ||
                   rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.08)') ||
                   rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.12)'))
                ) {
                  rule.style.backgroundColor = rule.style.backgroundColor.replace(
                    /rgba\(255, 255, 255, 0\.(03|05|08|12)\)/g,
                    'rgba(15, 15, 15, 0.98)'
                  );
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

  const removeBlurOptimization = useCallback(() => {
    // Restore DOM elements
    const optimizedElements = document.querySelectorAll(`[${OPTIMIZED_ATTR}]`);

    optimizedElements.forEach(element => {
      const el = element as HTMLElement;
      
      // Restore original styles
      const originalStylesAttr = el.getAttribute(ORIGINAL_STYLES_ATTR);
      if (originalStylesAttr) {
        try {
          const originalStyles = JSON.parse(originalStylesAttr);
          el.style.backdropFilter = originalStyles.backdropFilter || '';
          (el.style as any).webkitBackdropFilter = originalStyles.webkitBackdropFilter || '';
          el.style.background = originalStyles.background || '';
          el.style.backgroundColor = originalStyles.backgroundColor || '';
          el.style.backgroundImage = originalStyles.backgroundImage || '';
        } catch (e) {
          console.warn('Failed to restore original styles:', e);
        }
      }

      // Remove tracking attributes
      el.removeAttribute(OPTIMIZED_ATTR);
      el.removeAttribute(ORIGINAL_STYLES_ATTR);
    });

    // Clear optimization queue
    optimizationQueue = [];
    isProcessingQueue = false;

    restoreCSSRules();
    restoreEmotionStyles();
  }, []);

  const restoreCSSRules = useCallback(() => {
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            if (
              selector &&
              selector.match(
                /\.Mui(Modal|Dialog|Drawer|Popover|Tooltip|Menu|Autocomplete|Popper|Paper|Card|Box|Container|Grid|Stack)-root/
              )
            ) {
              if (
                rule.style.backdropFilter &&
                !rule.style.backdropFilter.includes('blur(20px)')
              ) {
                rule.style.backdropFilter = rule.style.backdropFilter + ' blur(20px)';
              }

              if (
                rule.style.background &&
                rule.style.background.includes('rgba(15, 15, 15, 0.98)')
              ) {
                rule.style.background = rule.style.background.replace(
                  /rgba\(15, 15, 15, 0\.98\)/g,
                  'rgba(255, 255, 255, 0.03)'
                );
              }

              if (
                rule.style.backgroundColor &&
                rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')
              ) {
                rule.style.backgroundColor = rule.style.backgroundColor.replace(
                  /rgba\(15, 15, 15, 0\.98\)/g,
                  'rgba(255, 255, 255, 0.03)'
                );
              }
            }
          }
        });
      } catch (e) {
        // Ignore CORS errors
      }
    });
  }, []);

  const restoreEmotionStyles = useCallback(() => {
    const emotionStyleTags = document.querySelectorAll('style[data-emotion="css"]');

    emotionStyleTags.forEach(styleTag => {
      const styleElement = styleTag as HTMLStyleElement;
      if (styleElement.sheet) {
        try {
          Array.from(styleElement.sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const hasTargetStyles =
                (rule.style.backdropFilter &&
                  !rule.style.backdropFilter.includes('blur(20px)')) ||
                (rule.style.background &&
                  rule.style.background.includes('rgba(15, 15, 15, 0.98)')) ||
                (rule.style.backgroundColor &&
                  rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)'));

              if (hasTargetStyles) {
                if (
                  rule.style.backdropFilter &&
                  !rule.style.backdropFilter.includes('blur(20px)')
                ) {
                  rule.style.backdropFilter = rule.style.backdropFilter + ' blur(20px)';
                }

                if (
                  rule.style.background &&
                  rule.style.background.includes('rgba(15, 15, 15, 0.98)')
                ) {
                  rule.style.background = rule.style.background.replace(
                    /rgba\(15, 15, 15, 0\.98\)/g,
                    'rgba(255, 255, 255, 0.03)'
                  );
                }

                if (
                  rule.style.backgroundColor &&
                  rule.style.backgroundColor.includes('rgba(15, 15, 15, 0.98)')
                ) {
                  rule.style.backgroundColor = rule.style.backgroundColor.replace(
                    /rgba\(15, 15, 15, 0\.98\)/g,
                    'rgba(255, 255, 255, 0.03)'
                  );
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

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await getFromIndexedDB(BLUR_OPTIMIZATION_V2_KEY);
        console.log('V2 LoadState - savedState:', savedState);
        const enabled = savedState === 'true';
        console.log('V2 LoadState - enabled:', enabled);
        setIsEnabled(enabled);

        if (enabled) {
          if (document.readyState === 'loading') {
            document.addEventListener(
              'DOMContentLoaded',
              () => {
                setTimeout(applyBlurOptimization, 50);
              },
              { once: true }
            );
          } else {
            setTimeout(applyBlurOptimization, 100);
          }

          if (document.readyState !== 'complete') {
            window.addEventListener(
              'load',
              () => {
                setTimeout(applyBlurOptimization, 100);
              },
              { once: true }
            );
          }
        }
      } catch (error) {
        console.error('Error loading blur optimization V2 state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [applyBlurOptimization]);

  const enableBlurOptimizationV2 = async (): Promise<void> => {
    console.log('V2 Enable - starting...');
    // Check if V1 is enabled and disable it first
    const v1Enabled = await isV1Enabled();
    console.log('V2 Enable - V1 enabled:', v1Enabled);
    if (v1Enabled) {
      await disableV1Optimization();
      console.log('V2 Enable - V1 disabled');
    }
    
    setIsEnabled(true);
    await setToIndexedDB(BLUR_OPTIMIZATION_V2_KEY, 'true');
    console.log('V2 Enable - state saved, applying optimization');
    applyBlurOptimization();
  };

  const disableBlurOptimization = async (): Promise<void> => {
    setIsEnabled(false);
    await setToIndexedDB(BLUR_OPTIMIZATION_V2_KEY, 'false');
    removeBlurOptimization();
  };

  const toggleBlurOptimization = async (): Promise<void> => {
    if (isEnabled) {
      await disableBlurOptimization();
    } else {
      await enableBlurOptimizationV2();
    }
  };

  useEffect(() => {
    if (!isEnabled) return;

    const observer = new MutationObserver(mutations => {
      let shouldReapply = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (shouldOptimizeElement(element)) {
                shouldReapply = true;
              }

              const childElements = element.querySelectorAll
                ? element.querySelectorAll('*')
                : [];
              childElements.forEach(child => {
                if (shouldOptimizeElement(child)) {
                  shouldReapply = true;
                }
              });
            }
          });
        } else if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'style' || mutation.attributeName === 'class')
        ) {
          // Only reapply if the element was previously optimized and now has new styles
          const target = mutation.target as Element;
          if (target.hasAttribute(OPTIMIZED_ATTR)) {
            target.removeAttribute(OPTIMIZED_ATTR);
            target.removeAttribute(ORIGINAL_STYLES_ATTR);
            if (shouldOptimizeElement(target)) {
              shouldReapply = true;
            }
          }
        }
      });

      if (shouldReapply) {
        requestAnimationFrame(() => {
          applyBlurOptimization();
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Reduce interval frequency and use requestAnimationFrame
    let intervalId: NodeJS.Timeout;
    const checkOptimization = () => {
      if (isEnabled) {
        requestAnimationFrame(() => {
          applyBlurOptimization();
        });
      }
      intervalId = setTimeout(checkOptimization, 5000); // Check every 5 seconds
    };
    
    intervalId = setTimeout(checkOptimization, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(intervalId);
    };
  }, [isEnabled, shouldOptimizeElement, applyBlurOptimization]);

  return {
    isEnabled,
    isLoading,
    enableBlurOptimizationV2,
    disableBlurOptimization,
    toggleBlurOptimization,
  };
};
