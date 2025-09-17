import React from 'react';

import { createRoot } from 'react-dom/client';

import './utils/ensure-global-functions';
import './utils/createSvgIcon';
import './utils/consoleFilter';

import indexedDbCache from './utils/indexedDbCache';
import { initLazyLoading } from './utils/imageUtils';
import { registerServiceWorker, clearS3Cache } from './utils/serviceWorkerUtils';

import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import './services/axiosConfig';

import ErrorBoundary from './components/ErrorBoundary';
import LoadingIndicator from './components/LoadingIndicator';

async function setupCaching() {
  console.debug('[Cache] Настройка кэширования...');

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        try {
          const active = registration.active;
          if (active) {
            const scriptURL = active.scriptURL || '';
            if (scriptURL.includes('service-worker.js')) {
              console.debug(
                '[ServiceWorker] Сохранен для push-уведомлений:',
                registration.scope
              );
              continue;
            }
          }

          await registration.unregister();
          console.debug('[ServiceWorker] Деактивирован:', registration.scope);
        } catch (err) {
          console.error('[ServiceWorker] Ошибка при проверке:', err);
        }
      }
    }

    const originalFetch = window.fetch;
    window.fetch = function (resource, options = {}) {
      const url = resource instanceof Request ? resource.url : resource;

      if (typeof url === 'string' && (url.includes('/assets/') || url.includes('s3.k-connect.ru'))) {
        // Для S3 файлов принудительно очищаем все no-cache заголовки
        if (options.headers) {
          if (options.headers instanceof Headers) {
            options.headers.delete('Cache-Control');
            options.headers.delete('Pragma');
            options.headers.delete('Expires');
          } else {
            delete options.headers['Cache-Control'];
            delete options.headers['cache-control'];
            delete options.headers['Pragma'];
            delete options.headers['pragma'];
            delete options.headers['Expires'];
            delete options.headers['expires'];
          }
        }
        
        // Для S3 файлов Service Worker будет обрабатывать кэширование
        return originalFetch(resource, options);
      }

      if (!options.headers) {
        options.headers = {};
      }

      if (options.headers instanceof Headers) {
        const headersObj = {};
        for (const [key, value] of options.headers.entries()) {
          headersObj[key] = value;
        }
        options.headers = headersObj;
      }

      options.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      options.headers['Pragma'] = 'no-cache';
      options.headers['Expires'] = '0';

      return originalFetch(resource, options);
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      if (typeof url === 'string' && (url.includes('/assets/') || url.includes('s3.k-connect.ru'))) {
        originalXhrOpen.call(this, method, url, ...rest);
        // Для S3 файлов не добавляем no-cache заголовки
        return;
      }

      this.setRequestHeader = this.setRequestHeader || function () {};

      originalXhrOpen.call(this, method, url, ...rest);

      const originalSetRequestHeader = this.setRequestHeader;
      this.setRequestHeader = function (header, value) {
        if (
          header === 'Cache-Control' ||
          header === 'Pragma' ||
          header === 'Expires'
        ) {
          return;
        }
        originalSetRequestHeader.call(this, header, value);
      };

      try {
        this.setRequestHeader(
          'Cache-Control',
          'no-cache, no-store, must-revalidate'
        );
        this.setRequestHeader('Pragma', 'no-cache');
        this.setRequestHeader('Expires', '0');
      } catch (e) {}
    };

    console.debug('[Cache] Настройка кэширования завершена');
  } catch (error) {
    console.error('[Cache] Ошибка при настройке кэширования:', error);
  }
}
async function setupPerformanceOptimizations() {
  console.debug('[Performance] Настройка оптимизаций производительности...');

  try {
    initLazyLoading();

    const criticalImages = [
      '/static/uploads/avatar/system/avatar.png',
      '/static/uploads/system/album_placeholder.jpg',
    ];

    //прелоад для критических изображений
    criticalImages.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });

    console.debug('[Performance] Оптимизации производительности настроены');
  } catch (error) {
    console.error('[Performance] Ошибка при настройке оптимизаций:', error);
  }
}

indexedDbCache.init();

// Регистрируем Service Worker для кэширования S3 файлов
registerServiceWorker().then((registration) => {
  if (registration) {
    console.log('[SW] Service Worker успешно зарегистрирован');
  }
});

setupCaching()
  .then(() => {
    return setupPerformanceOptimizations();
  })
  .then(() => {
    // Очищаем кэш S3 файлов через Service Worker
    clearS3Cache().then((result) => {
      if (result.success) {
        console.log('[SW] Кэш S3 файлов очищен через Service Worker');
      }
    });
    
    const container = document.getElementById('root');
    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <LoadingIndicator />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );
  });
