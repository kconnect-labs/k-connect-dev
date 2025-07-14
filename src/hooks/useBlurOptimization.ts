import { useState, useEffect, useCallback } from 'react';

interface BlurOptimizationState {
  isEnabled: boolean;
  isLoading: boolean;
}

interface BlurOptimizationActions {
  enableBlurOptimization: () => Promise<void>;
  disableBlurOptimization: () => Promise<void>;
  toggleBlurOptimization: () => Promise<void>;
}

interface BlurOptimizationReturn extends BlurOptimizationState, BlurOptimizationActions {}

const BLUR_OPTIMIZATION_KEY = 'blurOptimizationEnabled';
const DB_NAME = 'KConnectOptimization';
const DB_VERSION = 1;
const STORE_NAME = 'settings';


const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
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
  '[style*="rgba(255, 255, 255, 0.03)"]'
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
  '[data-btn]'
].join(',');

export const useBlurOptimization = (): BlurOptimizationReturn => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const shouldOptimizeElement = useCallback((element: Element): boolean => {
    const el = element as HTMLElement;
    

    const isButton = element.matches(BUTTON_EXCLUDE_SELECTORS);
    const hasButtonParent = element.closest(BUTTON_EXCLUDE_SELECTORS) !== null;
    
    if (isButton || hasButtonParent) {
      return false;
    }
    

    const hasBlur20px = (el.style.backdropFilter && el.style.backdropFilter.includes('blur(20px)')) ||
                       ((el.style as any).webkitBackdropFilter && (el.style as any).webkitBackdropFilter.includes('blur(20px)'));
    
    const hasTargetBackground = (el.style.background && el.style.background.includes('rgba(255, 255, 255, 0.03)')) ||
                               (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)'));
    

    if (hasBlur20px || hasTargetBackground) {
      return true;
    }
    

    const isModalOrBox = element.matches(MODAL_AND_BOX_SELECTORS);
    
    return isModalOrBox;
  }, []);


  const applyBlurOptimization = useCallback(() => {

    const allElements = document.querySelectorAll('*');
    const elementsToOptimize = Array.from(allElements).filter(shouldOptimizeElement);
    
    elementsToOptimize.forEach((element) => {
      const el = element as HTMLElement;
      

      if (el.style.backdropFilter && el.style.backdropFilter.includes('blur(20px)')) {
        el.style.backdropFilter = el.style.backdropFilter.replace(/blur\(20px\)/g, '');
        el.style.backgroundColor = 'rgb(37 37 37)';
      }
      

      const webkitBackdropFilter = (el.style as any).webkitBackdropFilter;
      if (webkitBackdropFilter && webkitBackdropFilter.includes('blur(20px)')) {
        (el.style as any).webkitBackdropFilter = webkitBackdropFilter.replace(/blur\(20px\)/g, '');
        el.style.backgroundColor = 'rgb(37 37 37)';
      }
      

      if (el.style.background && el.style.background.includes('rgba(255, 255, 255, 0.03)')) {
        el.style.background = el.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
      }
      
      if (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
        el.style.backgroundColor = el.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
      }
      
      if (el.style.backgroundImage && el.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)')) {
        el.style.backgroundImage = el.style.backgroundImage.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
      }
    });


    applyToElementsWithSpecificStyles();


    processCSSRules();
    

    processEmotionStyles();
  }, [shouldOptimizeElement]);


  const applyToElementsWithSpecificStyles = useCallback(() => {

    const elementsWithBlur20px = document.querySelectorAll('[style*="blur(20px)"]');
    elementsWithBlur20px.forEach((element) => {
      const el = element as HTMLElement;
      if (!shouldOptimizeElement(element)) return;
      
      if (el.style.backdropFilter && el.style.backdropFilter.includes('blur(20px)')) {
        el.style.backdropFilter = el.style.backdropFilter.replace(/blur\(20px\)/g, '');
        el.style.backgroundColor = 'rgb(37 37 37)';
      }
      
      const webkitBackdropFilter = (el.style as any).webkitBackdropFilter;
      if (webkitBackdropFilter && webkitBackdropFilter.includes('blur(20px)')) {
        (el.style as any).webkitBackdropFilter = webkitBackdropFilter.replace(/blur\(20px\)/g, '');
        el.style.backgroundColor = 'rgb(37 37 37)';
      }
    });


    const elementsWithTargetBackground = document.querySelectorAll('[style*="rgba(255, 255, 255, 0.03)"]');
    elementsWithTargetBackground.forEach((element) => {
      const el = element as HTMLElement;
      if (!shouldOptimizeElement(element)) return;
      
      if (el.style.background && el.style.background.includes('rgba(255, 255, 255, 0.03)')) {
        el.style.background = el.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
      }
      
      if (el.style.backgroundColor && el.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
        el.style.backgroundColor = el.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
      }
      
      if (el.style.backgroundImage && el.style.backgroundImage.includes('rgba(255, 255, 255, 0.03)')) {
        el.style.backgroundImage = el.style.backgroundImage.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
      }
    });
  }, [shouldOptimizeElement]);


  const processEmotionStyles = useCallback(() => {

    const emotionStyleTags = document.querySelectorAll('style[data-emotion="css"]');
    
    emotionStyleTags.forEach((styleTag) => {
      const styleElement = styleTag as HTMLStyleElement;
      if (styleElement.sheet) {
        try {
          Array.from(styleElement.sheet.cssRules).forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              const hasTargetStyles = (rule.style.backdropFilter && rule.style.backdropFilter.includes('blur(20px)')) ||
                                     (rule.style.background && rule.style.background.includes('rgba(255, 255, 255, 0.03)')) ||
                                     (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)'));
              

              if (hasTargetStyles) {

                if (rule.style.backdropFilter && rule.style.backdropFilter.includes('blur(20px)')) {
                  rule.style.backdropFilter = rule.style.backdropFilter.replace(/blur\(20px\)/g, '');
                  rule.style.backgroundColor = 'rgb(37 37 37)';
                }
                

                if (rule.style.background && rule.style.background.includes('rgba(255, 255, 255, 0.03)')) {
                  rule.style.background = rule.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
                }
                
                if (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
                  rule.style.backgroundColor = rule.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
                }
              }
            }
          });
        } catch (e) {

        }
      }
    });
  }, []);


  const removeBlurOptimization = useCallback(() => {

    const allElements = document.querySelectorAll('*');
    const elementsToRestore = Array.from(allElements).filter(shouldOptimizeElement);
    
    elementsToRestore.forEach((element) => {
      const el = element as HTMLElement;
      

      if (el.style.backdropFilter && !el.style.backdropFilter.includes('blur(20px)')) {
        el.style.backdropFilter = el.style.backdropFilter + ' blur(20px)';
      }
      

      const webkitBackdropFilter = (el.style as any).webkitBackdropFilter;
      if (webkitBackdropFilter && !webkitBackdropFilter.includes('blur(20px)')) {
        (el.style as any).webkitBackdropFilter = webkitBackdropFilter + ' blur(20px)';
      }
      

      if (el.style.background && el.style.background.includes('rgb(37 37 37)')) {
        el.style.background = el.style.background.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
      }
      
      if (el.style.backgroundColor && el.style.backgroundColor.includes('rgb(37 37 37)')) {
        el.style.backgroundColor = el.style.backgroundColor.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
      }
      
      if (el.style.backgroundImage && el.style.backgroundImage.includes('rgb(37 37 37)')) {
        el.style.backgroundImage = el.style.backgroundImage.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
      }
    });


    restoreCSSRules();
    

    restoreEmotionStyles();
  }, [shouldOptimizeElement]);


  const processCSSRules = useCallback(() => {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {

            const selector = rule.selectorText;
            const hasTargetStyles = (rule.style.backdropFilter && rule.style.backdropFilter.includes('blur(20px)')) ||
                                   (rule.style.background && rule.style.background.includes('rgba(255, 255, 255, 0.03)')) ||
                                   (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)'));
            
            if (selector && (selector.match(/\.Mui(Modal|Dialog|Drawer|Popover|Tooltip|Menu|Autocomplete|Popper|Paper|Card|Box|Container|Grid|Stack)-root/) || 
                           selector.match(/\.css-[a-zA-Z0-9]+/) ||
                           hasTargetStyles)) {

              if (rule.style.backdropFilter && rule.style.backdropFilter.includes('blur(20px)')) {
                rule.style.backdropFilter = rule.style.backdropFilter.replace(/blur\(20px\)/g, '');
                rule.style.backgroundColor = 'rgb(37 37 37)';
              }
              

              if (rule.style.background && rule.style.background.includes('rgba(255, 255, 255, 0.03)')) {
                rule.style.background = rule.style.background.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
              }
              
              if (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgba(255, 255, 255, 0.03)')) {
                rule.style.backgroundColor = rule.style.backgroundColor.replace(/rgba\(255, 255, 255, 0\.03\)/g, 'rgb(37 37 37)');
              }
            }
          }
        });
      } catch (e) {

      }
    });
  }, []);


  const restoreCSSRules = useCallback(() => {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            if (selector && selector.match(/\.Mui(Modal|Dialog|Drawer|Popover|Tooltip|Menu|Autocomplete|Popper|Paper|Card|Box|Container|Grid|Stack)-root/)) {

              if (rule.style.backdropFilter && !rule.style.backdropFilter.includes('blur(20px)')) {
                rule.style.backdropFilter = rule.style.backdropFilter + ' blur(20px)';
              }
              

              if (rule.style.background && rule.style.background.includes('rgb(37 37 37)')) {
                rule.style.background = rule.style.background.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
              }
              
              if (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgb(37 37 37)')) {
                rule.style.backgroundColor = rule.style.backgroundColor.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
              }
            }
          }
        });
      } catch (e) {

      }
    });
  }, []);


  const restoreEmotionStyles = useCallback(() => {

    const emotionStyleTags = document.querySelectorAll('style[data-emotion="css"]');
    
    emotionStyleTags.forEach((styleTag) => {
      const styleElement = styleTag as HTMLStyleElement;
      if (styleElement.sheet) {
        try {
          Array.from(styleElement.sheet.cssRules).forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              const hasTargetStyles = (rule.style.backdropFilter && !rule.style.backdropFilter.includes('blur(20px)')) ||
                                     (rule.style.background && rule.style.background.includes('rgb(37 37 37)')) ||
                                     (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgb(37 37 37)'));
              

              if (hasTargetStyles) {

                if (rule.style.backdropFilter && !rule.style.backdropFilter.includes('blur(20px)')) {
                  rule.style.backdropFilter = rule.style.backdropFilter + ' blur(20px)';
                }
                

                if (rule.style.background && rule.style.background.includes('rgb(37 37 37)')) {
                  rule.style.background = rule.style.background.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
                }
                
                if (rule.style.backgroundColor && rule.style.backgroundColor.includes('rgb(37 37 37)')) {
                  rule.style.backgroundColor = rule.style.backgroundColor.replace(/rgb\(37 37 37\)/g, 'rgba(255, 255, 255, 0.03)');
                }
              }
            }
          });
        } catch (e) {

        }
      }
    });
  }, []);


  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await getFromIndexedDB(BLUR_OPTIMIZATION_KEY);
        const enabled = savedState === 'true';
        setIsEnabled(enabled);
        

        if (enabled) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              setTimeout(applyBlurOptimization, 50);
            }, { once: true });
          } else {
            setTimeout(applyBlurOptimization, 100);
          }
          
          if (document.readyState !== 'complete') {
            window.addEventListener('load', () => {
              setTimeout(applyBlurOptimization, 100);
            }, { once: true });
          }
        }
      } catch (error) {
        console.error('Error loading blur optimization state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadState();
  }, [applyBlurOptimization]);


  const enableBlurOptimization = async (): Promise<void> => {
    setIsEnabled(true);
    await setToIndexedDB(BLUR_OPTIMIZATION_KEY, 'true');
    applyBlurOptimization();
  };


  const disableBlurOptimization = async (): Promise<void> => {
    setIsEnabled(false);
    await setToIndexedDB(BLUR_OPTIMIZATION_KEY, 'false');
    removeBlurOptimization();
  };


  const toggleBlurOptimization = async (): Promise<void> => {
    if (isEnabled) {
      await disableBlurOptimization();
    } else {
      await enableBlurOptimization();
    }
  };


  useEffect(() => {
    if (!isEnabled) return;

    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (shouldOptimizeElement(element)) {
                shouldReapply = true;
              }
              

              const childElements = element.querySelectorAll ? element.querySelectorAll('*') : [];
              childElements.forEach((child) => {
                if (shouldOptimizeElement(child)) {
                  shouldReapply = true;
                }
              });
            }
          });
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'style') {

          if (shouldOptimizeElement(mutation.target as Element)) {
            shouldReapply = true;
          }
        }
      });
      
      if (shouldReapply) {
        setTimeout(applyBlurOptimization, 50);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    

    const intervalId = setInterval(() => {
      if (isEnabled) {
        applyBlurOptimization();
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [isEnabled, shouldOptimizeElement, applyBlurOptimization]);

  return {
    isEnabled,
    isLoading,
    enableBlurOptimization,
    disableBlurOptimization,
    toggleBlurOptimization
  };
}; 