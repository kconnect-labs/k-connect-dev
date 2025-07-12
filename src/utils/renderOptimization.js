// Утилиты для оптимизации рендеринга

// Оптимизация для старых браузеров
export const isOldBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isOldChrome = userAgent.includes('chrome') && parseInt(userAgent.match(/chrome\/(\d+)/)?.[1] || '0') < 80;
  const isOldFirefox = userAgent.includes('firefox') && parseInt(userAgent.match(/firefox\/(\d+)/)?.[1] || '0') < 75;
  const isOldSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && parseInt(userAgent.match(/version\/(\d+)/)?.[1] || '0') < 13;
  const isOldEdge = userAgent.includes('edge') && parseInt(userAgent.match(/edge\/(\d+)/)?.[1] || '0') < 80;
  const isIE = userAgent.includes('msie') || userAgent.includes('trident');
  
  return isOldChrome || isOldFirefox || isOldSafari || isOldEdge || isIE;
};

// Оптимизация для слабых устройств
export const isLowEndDevice = () => {
  const cores = navigator.hardwareConcurrency || 1;
  const memory = navigator.deviceMemory || 4;
  return cores <= 2 || memory <= 2;
};

// Оптимизация скролла
export const optimizeScrollPerformance = () => {
  if (isOldBrowser() || isLowEndDevice()) {
    // Отключаем плавный скролл
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Оптимизируем для мобильных
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)) {
      document.body.style.webkitOverflowScrolling = 'auto';
    }
  }
};

// Оптимизация анимаций
export const optimizeAnimations = () => {
  if (isOldBrowser() || isLowEndDevice()) {
    const style = document.createElement('style');
    style.textContent = `
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      .MuiCircularProgress-root {
        animation-duration: 0.5s !important;
      }
      .MuiSkeleton-root {
        animation-duration: 0.8s !important;
      }
    `;
    document.head.appendChild(style);
  }
};

// Оптимизация рендеринга элементов
export const optimizeElementRendering = (element) => {
  if (isOldBrowser() && element && element.style) {
    // Применяем только к анимированным элементам
    if (element.classList.contains('animated') || 
        element.classList.contains('MuiCircularProgress-root') ||
        element.classList.contains('MuiSkeleton-root')) {
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'auto';
      element.style.backfaceVisibility = 'hidden';
    }
  }
};



// Оптимизация памяти
export const optimizeMemoryUsage = () => {
  if (isLowEndDevice()) {
    // Очистка неиспользуемых ресурсов
    const cleanup = () => {
      if ('gc' in window) {
        window.gc();
      }
    };
    
    // Очистка каждые 30 секунд
    return setInterval(cleanup, 30000);
  }
  return null;
};

// Оптимизация событий
export const optimizeEventHandling = (element, eventType, handler, options = {}) => {
  if (isOldBrowser()) {
    // Используем passive listeners для лучшей производительности
    const passiveOptions = { ...options, passive: true };
    element.addEventListener(eventType, handler, passiveOptions);
    
    return () => {
      element.removeEventListener(eventType, handler, passiveOptions);
    };
  } else {
    element.addEventListener(eventType, handler, options);
    
    return () => {
      element.removeEventListener(eventType, handler, options);
    };
  }
};

// Оптимизация DOM операций
export const batchDOMUpdates = (updates) => {
  if (isOldBrowser()) {
    // Группируем DOM обновления
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  } else {
    // На новых браузерах выполняем сразу
    updates.forEach(update => update());
  }
};

// Оптимизация виртуализации для больших списков
export const createVirtualizedList = (items, itemHeight, containerHeight) => {
  if (isLowEndDevice()) {
    // Уменьшаем количество отображаемых элементов на слабых устройствах
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.floor(visibleCount * 0.5);
    
    return {
      getVisibleItems: (scrollTop) => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const endIndex = Math.min(items.length, startIndex + visibleCount + buffer * 2);
        
        return items.slice(startIndex, endIndex).map((item, index) => ({
          ...item,
          index: startIndex + index,
          style: {
            position: 'absolute',
            top: (startIndex + index) * itemHeight,
            height: itemHeight
          }
        }));
      }
    };
  }
  
  return {
    getVisibleItems: () => items
  };
}; 