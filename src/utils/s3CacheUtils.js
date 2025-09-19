// Утилиты для работы с кэшем S3 файлов

/**
 * Очищает кэш браузера для S3 файлов
 */
export const clearS3Cache = () => {
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.open(cacheName).then(cache => {
          cache.keys().then(keys => {
            keys.forEach(request => {
              if (request.url.includes('s3.k-connect.ru')) {
                cache.delete(request);
              }
            });
          });
        });
      });
    });
  }
};

/**
 * Добавляет параметр для обхода кэша к S3 URL
 * @param {string} url - URL файла
 * @returns {string} - URL с параметром обхода кэша
 */
export const addCacheBuster = (url) => {
  if (url.includes('s3.k-connect.ru')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}`;
  }
  return url;
};

/**
 * Проверяет, является ли URL S3 файлом
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если это S3 URL
 */
export const isS3Url = (url) => {
  return url && url.includes('s3.k-connect.ru');
};

/**
 * Создает img элемент с правильными настройками кэша для S3
 * @param {string} src - URL изображения
 * @param {Object} options - дополнительные опции
 * @returns {HTMLImageElement} - img элемент
 */
export const createS3Image = (src, options = {}) => {
  const img = new Image();
  
  if (isS3Url(src)) {
    // Для S3 файлов не добавляем параметры обхода кэша
    img.src = src;
  } else {
    // Для других файлов добавляем параметр обхода кэша
    img.src = addCacheBuster(src);
  }
  
  // Применяем дополнительные опции
  Object.assign(img, options);
  
  return img;
};
