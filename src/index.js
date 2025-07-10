import React from 'react';

import { createRoot } from 'react-dom/client';

import './utils/ensure-global-functions';
import './utils/createSvgIcon';
import './utils/consoleFilter';

import indexedDbCache from './utils/indexedDbCache';
import { initLazyLoading } from './utils/imageUtils';

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
              console.debug('[ServiceWorker] Сохранен для push-уведомлений:', registration.scope);
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
    window.fetch = function(resource, options = {}) {
      const url = resource instanceof Request ? resource.url : resource;
      
      if (typeof url === 'string' && url.includes('/assets/')) {
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
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      if (typeof url === 'string' && url.includes('/assets/')) {
        originalXhrOpen.call(this, method, url, ...rest);
        return;
      }
      
      this.setRequestHeader = this.setRequestHeader || function() {};
      
      originalXhrOpen.call(this, method, url, ...rest);
      
      const originalSetRequestHeader = this.setRequestHeader;
      this.setRequestHeader = function(header, value) {
        if (header === 'Cache-Control' || header === 'Pragma' || header === 'Expires') {
          return;
        }
        originalSetRequestHeader.call(this, header, value);
      };
      
      try {
        this.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        this.setRequestHeader('Pragma', 'no-cache');
        this.setRequestHeader('Expires', '0');
      } catch (e) {
      }
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
      '/static/uploads/system/album_placeholder.jpg'
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

setupCaching().then(() => {
  return setupPerformanceOptimizations();
}).then(() => {
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