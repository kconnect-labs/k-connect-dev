// Утилиты для работы с Service Worker

const S3_DOMAIN = 's3.k-connect.ru';

/**
 * Регистрирует Service Worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('[SW] Service Worker зарегистрирован:', registration);
      
      // Обрабатываем обновления Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Новый Service Worker установлен, можно обновить страницу
            console.log('[SW] Новый Service Worker готов к использованию');
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('[SW] Ошибка регистрации Service Worker:', error);
      return null;
    }
  }
  return null;
};

/**
 * Очищает кэш S3 файлов в Service Worker
 */
export const clearS3Cache = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('[SW] Кэш S3 файлов очищен');
        }
        resolve(event.data);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_S3_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  return Promise.resolve({ success: false });
};

/**
 * Проверяет, поддерживается ли Service Worker
 */
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

/**
 * Получает информацию о Service Worker
 */
export const getServiceWorkerInfo = async () => {
  if (!isServiceWorkerSupported()) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return null;
    }
    
    return {
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      scope: registration.scope,
      updateViaCache: registration.updateViaCache
    };
  } catch (error) {
    console.error('[SW] Ошибка получения информации о Service Worker:', error);
    return null;
  }
};

/**
 * Принудительно обновляет Service Worker
 */
export const updateServiceWorker = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
};

/**
 * Проверяет, является ли URL S3 файлом
 */
export const isS3Url = (url) => {
  return url && url.includes(S3_DOMAIN);
};

/**
 * Создает fetch запрос к S3 файлу через Service Worker
 */
export const fetchS3File = async (url, options = {}) => {
  if (!isS3Url(url)) {
    return fetch(url, options);
  }
  
  // Для S3 файлов убираем no-cache заголовки
  const cleanOptions = { ...options };
  if (cleanOptions.headers) {
    const headers = { ...cleanOptions.headers };
    delete headers['Cache-Control'];
    delete headers['cache-control'];
    delete headers['Pragma'];
    delete headers['pragma'];
    delete headers['Expires'];
    delete headers['expires'];
    cleanOptions.headers = headers;
  }
  
  return fetch(url, cleanOptions);
};
