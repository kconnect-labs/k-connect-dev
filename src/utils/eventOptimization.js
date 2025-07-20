// Утилиты для оптимизации обработки событий

// Throttle функция для ограничения частоты выполнения
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Debounce функция для отложенного выполнения
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Оптимизированный обработчик скролла
export const createOptimizedScrollHandler = (handler, options = {}) => {
  const { throttleMs = 16, passive = true } = options;

  const throttledHandler = throttle(handler, throttleMs);

  return event => {
    // Используем requestAnimationFrame для синхронизации с браузером
    requestAnimationFrame(() => {
      throttledHandler(event);
    });
  };
};

// Оптимизированный обработчик ресайза
export const createOptimizedResizeHandler = (handler, options = {}) => {
  const { debounceMs = 250 } = options;

  return debounce(handler, debounceMs);
};

// Оптимизированный обработчик клика
export const createOptimizedClickHandler = (handler, options = {}) => {
  const { preventDefault = false, stopPropagation = false } = options;

  return event => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    // Используем setTimeout для предотвращения блокировки UI
    setTimeout(() => {
      handler(event);
    }, 0);
  };
};

// Оптимизированный обработчик touch событий
export const createOptimizedTouchHandler = (handler, options = {}) => {
  const { passive = true } = options;

  return event => {
    // Предотвращаем двойное срабатывание на мобильных
    if (event.touches && event.touches.length > 1) return;

    requestAnimationFrame(() => {
      handler(event);
    });
  };
};

// Оптимизированный обработчик клавиатуры
export const createOptimizedKeyboardHandler = (handler, options = {}) => {
  const { preventDefault = false, stopPropagation = false } = options;

  return event => {
    if (preventDefault) event.preventDefault();
    if (stopPropagation) event.stopPropagation();

    // Обрабатываем только определенные клавиши
    const allowedKeys = [
      'Enter',
      'Space',
      'Escape',
      'Tab',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ];
    if (!allowedKeys.includes(event.key)) return;

    handler(event);
  };
};

// Оптимизированный обработчик фокуса
export const createOptimizedFocusHandler = handler => {
  return debounce(handler, 100);
};

// Оптимизированный обработчик изменения размера окна
export const createOptimizedWindowResizeHandler = handler => {
  return debounce(handler, 100);
};

// Оптимизированный обработчик видимости страницы
export const createOptimizedVisibilityHandler = handler => {
  return event => {
    // Обрабатываем только изменения видимости
    if (
      event.target.visibilityState !== 'hidden' &&
      event.target.visibilityState !== 'visible'
    )
      return;

    handler(event);
  };
};

// Оптимизированный обработчик сетевых событий
export const createOptimizedNetworkHandler = handler => {
  return event => {
    // Обрабатываем только изменения состояния сети
    if (event.type === 'online' || event.type === 'offline') {
      handler(event);
    }
  };
};
