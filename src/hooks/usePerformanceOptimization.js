import { useEffect, useRef, useCallback } from 'react';

export const usePerformanceOptimization = () => {
  const isOldBrowser = useRef(false);
  const isMobile = useRef(false);
  const isLowEndDevice = useRef(false);

  // Определяем характеристики браузера и устройства
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isOldChrome = userAgent.includes('chrome') && parseInt(userAgent.match(/chrome\/(\d+)/)?.[1] || '0') < 80;
    const isOldFirefox = userAgent.includes('firefox') && parseInt(userAgent.match(/firefox\/(\d+)/)?.[1] || '0') < 75;
    const isOldSafari = userAgent.includes('safari') && !userAgent.includes('chrome') && parseInt(userAgent.match(/version\/(\d+)/)?.[1] || '0') < 13;
    const isOldEdge = userAgent.includes('edge') && parseInt(userAgent.match(/edge\/(\d+)/)?.[1] || '0') < 80;
    const isIE = userAgent.includes('msie') || userAgent.includes('trident');

    isOldBrowser.current = isOldChrome || isOldFirefox || isOldSafari || isOldEdge || isIE;
    isMobile.current = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Определяем слабое устройство по количеству ядер и памяти
    const cores = navigator.hardwareConcurrency || 1;
    const memory = navigator.deviceMemory || 4;
    isLowEndDevice.current = cores <= 2 || memory <= 2;
  }, []);

  // Оптимизация скролла
  const optimizeScroll = useCallback(() => {
    if (isOldBrowser.current || isLowEndDevice.current) {
      // Отключаем плавный скролл на старых браузерах
      document.documentElement.style.scrollBehavior = 'auto';
      
      // Оптимизируем скролл для мобильных
      if (isMobile.current) {
        document.body.style.webkitOverflowScrolling = 'auto';
      }
    }
  }, []);

  // Оптимизация анимаций
  const optimizeAnimations = useCallback(() => {
    if (isOldBrowser.current || isLowEndDevice.current) {
      // Уменьшаем количество анимаций
      const style = document.createElement('style');
      style.textContent = `
        * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }
        .MuiCircularProgress-root {
          animation-duration: 0.5s !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Оптимизация рендеринга
  const optimizeRendering = useCallback(() => {
    if (isOldBrowser.current) {
      // Применяем только к анимированным элементам
      const animatedElements = document.querySelectorAll('.animated, .MuiCircularProgress-root, .MuiSkeleton-root');
      animatedElements.forEach(el => {
        if (el.style) {
          el.style.transform = 'translateZ(0)';
          el.style.willChange = 'auto';
        }
      });
    }
  }, []);

  // Оптимизация памяти
  const optimizeMemory = useCallback(() => {
    if (isLowEndDevice.current) {
      // Очищаем неиспользуемые ресурсы
      const cleanup = () => {
        if ('gc' in window) {
          window.gc();
        }
      };
      
      // Очистка каждые 30 секунд на слабых устройствах
      const interval = setInterval(cleanup, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);



  // Применяем все оптимизации
  useEffect(() => {
    optimizeScroll();
    optimizeAnimations();
    optimizeRendering();
    const memoryCleanup = optimizeMemory();

    // Оптимизация при изменении размера окна
    const handleResize = () => {
      optimizeRendering();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (memoryCleanup) memoryCleanup();
    };
  }, [optimizeScroll, optimizeAnimations, optimizeRendering, optimizeMemory]);

  return {
    isOldBrowser: isOldBrowser.current,
    isMobile: isMobile.current,
    isLowEndDevice: isLowEndDevice.current,
    optimizeScroll,
    optimizeAnimations,
    optimizeRendering,
    optimizeMemory
  };
}; 