import { useEffect, useRef, useCallback } from 'react';

interface UseLottieOptimizationOptions {
  lottieRef: React.RefObject<any>;
  isVisible: boolean;
  isDragging: boolean;
  reduceMotion?: boolean;
}

/**
 * Хук для оптимизации производительности Lottie анимаций
 * Автоматически управляет воспроизведением, качеством и производительностью
 */
export const useLottieOptimization = ({
  lottieRef,
  isVisible,
  isDragging,
  reduceMotion = false,
}: UseLottieOptimizationOptions) => {
  const performanceModeRef = useRef<'high' | 'medium' | 'low'>('high');
  const lastVisibilityChange = useRef<number>(0);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout>();

  // Определяем режим производительности на основе системных настроек
  const getPerformanceMode = useCallback(() => {
    if (reduceMotion) return 'low';

    // Проверяем производительность устройства
    const connection = (navigator as any).connection;
    if (connection) {
      if (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g'
      ) {
        return 'low';
      }
      if (connection.effectiveType === '3g') {
        return 'medium';
      }
    }

    // Проверяем количество ядер процессора
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return 'medium';
    }

    return 'high';
  }, [reduceMotion]);

  // Применяем настройки производительности к Lottie
  const applyPerformanceSettings = useCallback(
    (mode: 'high' | 'medium' | 'low') => {
      if (!lottieRef.current) return;

      const lottie = lottieRef.current;

      switch (mode) {
        case 'high':
          // Максимальное качество и производительность
          lottie.setSpeed(1);
          lottie.setDirection(1);
          break;
        case 'medium':
          // Среднее качество, сниженная скорость
          lottie.setSpeed(0.8);
          lottie.setDirection(1);
          break;
        case 'low':
          // Минимальное качество, очень низкая скорость или статичное изображение
          lottie.setSpeed(0.5);
          lottie.setDirection(1);
          break;
      }
    },
    [lottieRef]
  );

  // Управление видимостью и воспроизведением
  useEffect(() => {
    if (!lottieRef.current) return;

    const lottie = lottieRef.current;
    const now = Date.now();

    // Предотвращаем слишком частые изменения состояния
    if (now - lastVisibilityChange.current < 100) {
      return;
    }

    if (isVisible && !isDragging) {
      // Запускаем анимацию с небольшой задержкой для плавности
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }

      visibilityTimeoutRef.current = setTimeout(() => {
        if (lottieRef.current && isVisible) {
          lottie.play();
          applyPerformanceSettings(performanceModeRef.current);
        }
      }, 50);
    } else {
      // Останавливаем анимацию
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
      lottie.pause();
    }

    lastVisibilityChange.current = now;

    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [isVisible, isDragging, lottieRef, applyPerformanceSettings]);

  // Инициализация режима производительности
  useEffect(() => {
    performanceModeRef.current = getPerformanceMode();
  }, [getPerformanceMode]);

  // Обработка изменения размера окна для адаптации производительности
  useEffect(() => {
    const handleResize = () => {
      const newMode = getPerformanceMode();
      if (newMode !== performanceModeRef.current) {
        performanceModeRef.current = newMode;
        applyPerformanceSettings(newMode);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getPerformanceMode, applyPerformanceSettings]);

  // Обработка изменения видимости страницы
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Страница скрыта - останавливаем анимацию
        if (lottieRef.current) {
          lottieRef.current.pause();
        }
      } else if (isVisible) {
        // Страница видима - возобновляем анимацию
        if (lottieRef.current) {
          lottieRef.current.play();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isVisible, lottieRef]);

  return {
    performanceMode: performanceModeRef.current,
    applyPerformanceSettings,
  };
};
