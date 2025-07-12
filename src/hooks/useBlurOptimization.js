import { useState, useEffect } from 'react';

const BLUR_OPTIMIZATION_KEY = 'blurOptimizationEnabled';
const DB_NAME = 'KConnectOptimization';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

// IndexedDB helper functions
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

const getFromIndexedDB = async (key) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB error, falling back to localStorage:', error);
    return localStorage.getItem(key);
  }
};

const setToIndexedDB = async (key, value) => {
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

export const useBlurOptimization = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await getFromIndexedDB(BLUR_OPTIMIZATION_KEY);
        const enabled = savedState === 'true';
        setIsEnabled(enabled);
        if (enabled) {
          applyBlurOptimization();
        }
      } catch (error) {
        console.error('Error loading blur optimization state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadState();
  }, []);

  const enableBlurOptimization = async () => {
    setIsEnabled(true);
    await setToIndexedDB(BLUR_OPTIMIZATION_KEY, 'true');
    applyBlurOptimization();
  };

  const disableBlurOptimization = async () => {
    setIsEnabled(false);
    await setToIndexedDB(BLUR_OPTIMIZATION_KEY, 'false');
    removeBlurOptimization();
  };

  const applyBlurOptimization = () => {
    const elementsWithBlur = [];
    
    // Удаляем все blur эффекты и запоминаем элементы
    document.querySelectorAll('*').forEach(el => {
      let hadBlur = false;
      
      if (el.style && el.style.filter && el.style.filter.includes('blur')) {
        el.style.filter = el.style.filter.replace(/blur\([^)]+\)/g, '');
        hadBlur = true;
      }
      if (el.style && el.style.backdropFilter && el.style.backdropFilter.includes('blur')) {
        el.style.backdropFilter = el.style.backdropFilter.replace(/blur\([^)]+\)/g, '');
        hadBlur = true;
      }
      if (el.style && el.style.webkitBackdropFilter && el.style.webkitBackdropFilter.includes('blur')) {
        el.style.webkitBackdropFilter = el.style.webkitBackdropFilter.replace(/blur\([^)]+\)/g, '');
        hadBlur = true;
      }
      
      if (hadBlur) {
        elementsWithBlur.push(el);
      }
    });

    // Изменяем цвет хедера на более темный
    const headerElements = document.querySelectorAll('[data-header], .header, header, [class*="header"], [class*="Header"], [class*="appbar"], [class*="AppBar"]');
    headerElements.forEach(header => {
      if (header.style) {
        // Убираем только прозрачный белый фон, оставляем остальные стили
        if (header.style.backgroundColor === 'rgba(255, 255, 255, 0.03)' || 
            header.style.backgroundColor === 'rgba(255, 255, 255, 0.1)' ||
            header.style.backgroundColor === 'rgba(255, 255, 255, 0.05)') {
          header.style.backgroundColor = 'rgba(28, 28, 28, 0.95)';
        }
        // Отключаем только blur эффекты
        if (header.style.backdropFilter && header.style.backdropFilter.includes('blur')) {
          header.style.backdropFilter = header.style.backdropFilter.replace(/blur\([^)]+\)/g, '');
        }
        if (header.style.webkitBackdropFilter && header.style.webkitBackdropFilter.includes('blur')) {
          header.style.webkitBackdropFilter = header.style.webkitBackdropFilter.replace(/blur\([^)]+\)/g, '');
        }
      }
    });


    // Обрабатываем CSS правила в стилях
    processCSSRules();

        // Добавляем затемнение ко всем элементам, где был удален blur
    addDarkeningEffect(elementsWithBlur);
  };

  const removeBlurOptimization = () => {
    // Удаляем эффект зернистости
    const grainStyle = document.getElementById('grain-effect-style');
    if (grainStyle) {
      grainStyle.remove();
    }

    // Удаляем эффект затемнения
    const darkeningStyle = document.getElementById('darkening-effect-style');
    if (darkeningStyle) {
      darkeningStyle.remove();
    }

    // Удаляем глобальный CSS отключения blur
    const globalBlurStyle = document.getElementById('global-blur-disable-style');
    if (globalBlurStyle) {
      globalBlurStyle.remove();
    }

    // Удаляем классы эффектов со всех элементов
    document.querySelectorAll('.grain-effect, .darkening-effect').forEach(el => {
      el.classList.remove('grain-effect', 'darkening-effect');
    });

    // Восстанавливаем оригинальные стили хедера
    const headerElements = document.querySelectorAll('[data-header], .header, header, [class*="header"], [class*="Header"], [class*="appbar"], [class*="AppBar"]');
    headerElements.forEach(header => {
      if (header.style) {
        // Восстанавливаем оригинальный прозрачный фон
        if (header.style.backgroundColor === 'rgba(28, 28, 28, 0.95)') {
          header.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
        }
      }
    });

    // Восстанавливаем оригинальные стили bottom navigation

  };

  const processCSSRules = () => {
    // Обрабатываем CSS правила в стилях
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.style) {
            if (rule.style.filter && rule.style.filter.includes('blur')) {
              rule.style.filter = rule.style.filter.replace(/blur\([^)]+\)/g, '');
            }
            if (rule.style.backdropFilter && rule.style.backdropFilter.includes('blur')) {
              rule.style.backdropFilter = rule.style.backdropFilter.replace(/blur\([^)]+\)/g, '');
            }
            if (rule.style.webkitBackdropFilter && rule.style.webkitBackdropFilter.includes('blur')) {
              rule.style.webkitBackdropFilter = rule.style.webkitBackdropFilter.replace(/blur\([^)]+\)/g, '');
            }
          }
        }
      } catch (e) {
        // Пропускаем кроссдоменные стили
      }
    }

    // Добавляем глобальный CSS для отключения blur эффектов
    addGlobalBlurDisableCSS();
  };

  const addGlobalBlurDisableCSS = () => {
    // Удаляем существующий стиль если есть
    const existingStyle = document.getElementById('global-blur-disable-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Создаем глобальный CSS для отключения blur эффектов
    const style = document.createElement('style');
    style.id = 'global-blur-disable-style';
    style.textContent = `
      /* Глобальное отключение blur эффектов */
      * {
        filter: none !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      
      /* Исключения для элементов, которые должны сохранить другие фильтры */
      *:not([style*="blur"]) {
        filter: inherit !important;
      }
      
      /* Отключаем только blur в backdrop-filter */
      *[style*="backdrop-filter"] {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      
      /* Отключаем только blur в filter */
      *[style*="filter"] {
        filter: none !important;
      }
      
    `;
    document.head.appendChild(style);
  };

  const addDarkeningEffect = (elementsWithBlur = []) => {
    // Удаляем существующий стиль если есть
    const existingStyle = document.getElementById('darkening-effect-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Определяем мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Создаем новый стиль с эффектом затемнения
    const style = document.createElement('style');
    style.id = 'darkening-effect-style';
    style.textContent = `
      /* Эффект затемнения для элементов без blur */
      .darkening-effect {
        position: relative;
      }
      
      .darkening-effect::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: 1;
        border-radius: inherit;
      }
      
      /* Более сильное затемнение для элементов с backdrop-filter */
      .darkening-effect[style*="backdrop-filter"]::after,
      .darkening-effect[style*="webkit-backdrop-filter"]::after {
        background: rgba(0, 0, 0, 0.15);
      }
      
      /* Отключаем эффект на мобильных для экономии ресурсов */
      @media (max-width: 768px) {
        .darkening-effect::after {
          background: rgba(0, 0, 0, 0.05) !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Применяем класс ко всем элементам, где был удален blur
    elementsWithBlur.forEach(el => {
      if (el && el.classList) {
        el.classList.add('darkening-effect');
      }
    });

    // Также применяем к элементам с backdrop-filter
    document.querySelectorAll('[style*="backdrop-filter"], [style*="webkit-backdrop-filter"]').forEach(el => {
      if (!el.classList.contains('darkening-effect')) {
        el.classList.add('darkening-effect');
      }
    });
  };

  const addGrainEffect = (elementsWithBlur = []) => {
    // Удаляем существующий стиль если есть
    const existingStyle = document.getElementById('grain-effect-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Определяем мобильное устройство
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Создаем новый стиль с оптимизированным эффектом зернистости
    const style = document.createElement('style');
    style.id = 'grain-effect-style';
    style.textContent = `
      /* Оптимизированный эффект зернистости для мобильных устройств */
      .grain-effect {
        position: relative;
      }
      
      .grain-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
          radial-gradient(circle at 25% 25%, rgba(255,255,255,0.015) 1px, transparent 1px),
          radial-gradient(circle at 75% 75%, rgba(255,255,255,0.015) 1px, transparent 1px);
        background-size: ${isMobile ? '6px 6px' : '4px 4px'};
        pointer-events: none;
        z-index: 1;
        opacity: ${isMobile ? '0.2' : '0.3'};
        mix-blend-mode: ${isIOS ? 'normal' : 'overlay'};
        will-change: auto;
        transform: translateZ(0);
      }
      
      /* Отключаем эффект на мобильных для экономии ресурсов */
      @media (max-width: 768px) {
        .grain-effect::before {
          display: none;
        }
      }
      
      /* Альтернативный легкий эффект для мобильных */
      @media (max-width: 768px) {
        .grain-effect {
          background-color: rgba(255, 255, 255, 0.01) !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Применяем класс ко всем элементам, где был удален blur
    elementsWithBlur.forEach(el => {
      if (el && el.classList) {
        el.classList.add('grain-effect');
      }
    });

    // Также применяем к элементам с backdrop-filter (для совместимости)
    if (!isMobile) {
      document.querySelectorAll('[style*="backdrop-filter"], [style*="webkit-backdrop-filter"]').forEach(el => {
        if (!el.classList.contains('grain-effect')) {
          el.classList.add('grain-effect');
        }
      });
    }
  };

  useEffect(() => {
    if (isEnabled) {
      applyBlurOptimization();
    } else {
      removeBlurOptimization();
    }
  }, [isEnabled]);

  return {
    isEnabled,
    enableBlurOptimization,
    disableBlurOptimization,
    toggleBlurOptimization: () => {
      if (isEnabled) {
        disableBlurOptimization();
      } else {
        enableBlurOptimization();
      }
    }
  };
}; 