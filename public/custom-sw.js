// ПУШ УВЕДОМЛЕНИЯ + БАЗОВЫЙ КЕШ - Этот сервис воркер обрабатывает пуш уведомления и базовое кеширование
// Версия: пуш-кеш-2.1.0 (обновлено для работы без vite-plugin-pwa)

const PUSH_SW_VERSION = 'Пуш-кеш-2.9';
const PUSH_SW_NAME = 'К-Коннект';
const CACHE_NAME = 'k-connect-cache-v2.9';

// Ассеты для кеширования
const CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/fonts.css'
];

// Красивый ASCII-арт логотип К-Коннект
const K_CONNECT_LOGO = `
  █████████████████████████████████████████████████
  █████████████████████████████████████████████████
  ██████╔╗╔═╗╔═══╗╔═╗█╔╗╔═╗█╔╗╔═══╗╔═══╗╔════╗█████
  ██████║║║╔╝║╔═╗║║║╚╗║║║║╚╗║║║╔══╝║╔═╗║║╔╗╔╗║█████
  ██████║╚╝╝█║║█║║║╔╗╚╝║║╔╗╚╝║║╚══╗║║█╚╝╚╝║║╚╝█████
  ██████║╔╗║█║║█║║║║╚╗║║║║╚╗║║║╔══╝║║█╔╗██║║███████
  ██████║║║╚╗║╚═╝║║║█║║║║║█║║║║╚══╗║╚═╝║██║║███████
  ██████╚╝╚═╝╚═══╝╚╝█╚═╝╚╝█╚═╝╚═══╝╚═══╝██╚╝███████
  █████████████████████████████████████████████████
  █████████████████████████████████████████████████


                Что тебе тут нужно?
`;

// Функция для вывода логотипа в консоль
const showLogo = () => {
  console.log(`%c${K_CONNECT_LOGO}`, 'color: #D0BCFF; font-family: monospace; font-size: 18px;');
};

// Показываем логотип при загрузке
showLogo();
console.log(`[${PUSH_SW_NAME}] версия ${PUSH_SW_VERSION} запичкурена в твой браузер! 🎉`);

self.addEventListener('install', event => {
  console.log(`[${PUSH_SW_NAME}] установка ${PUSH_SW_VERSION} - начинаем загрузку! 🚀`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[${PUSH_SW_NAME}] кеш базовых ассеттиков браток, загружаем всё что нужно! 📦`);
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log(`[${PUSH_SW_NAME}] базовые ассетики успешно запичкурены брадок! ✅`);
        return self.skipWaiting();
      })
      .then(() => {
        console.log(`[${PUSH_SW_NAME}] установка завершена! 🎉`);
      })
      .catch(error => {
        console.error(`[${PUSH_SW_NAME}] кеш не установился и умир, но мы продолжаем! 💀`, error);
        return self.skipWaiting();
      })
  );
});

// Активация - чистим старые кеши и захватываем клиентов
self.addEventListener('activate', event => {
  console.log(`[${PUSH_SW_NAME}] активация ${PUSH_SW_VERSION} ВЗРЫВ ЧЕРЕЗ 3..2..1.. БУМ! 💥`);
  
  event.waitUntil(
    // Чистим старые кеши
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[${PUSH_SW_NAME}] удаление старого кеша: ${cacheName} - прощай старина! 🗑️`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Захватываем клиентов для немедленного контроля
      console.log(`[${PUSH_SW_NAME}] захватываем всех клиентов! 🎯`);
      return self.clients.claim();
    })
    .then(() => {
      // Принудительно отписываемся от пуша чтобы обновить ключи
      return self.registration.pushManager.getSubscription()
        .then(subscription => {
          if (subscription) {
            console.log(`[${PUSH_SW_NAME}] отписываемся от пуша чтобы принудительно обновить ключи! 🔄`);
            return subscription.unsubscribe();
          }
        })
        .catch(error => {
          console.error(`[${PUSH_SW_NAME}] ошибка при отписке:`, error);
        });
    })
    .then(() => {
      console.log(`[${PUSH_SW_NAME}] активация завершена! 🚀`);
    })
  );
});

// Fetch событие - отдаем кешированные ассеты когда офлайн
self.addEventListener('fetch', event => {
  // Обрабатываем только GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  // Пропускаем не-GET запросы и внешние запросы
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Пропускаем API запросы - они не должны кешироваться
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Для навигационных запросов пробуем сеть сначала, потом кеш
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/');
        })
        .then(response => {
          return response;
        })
    );
    return;
  }

  // Для остальных запросов пробуем кеш сначала, потом сеть
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log(`[${PUSH_SW_NAME}] нашли в кеше: ${event.request.url} 🎯`);
          return response;
        }
        return fetch(event.request);
      })
      .then(response => {
        return response;
      })
      .catch(() => {
        // Возвращаем fallback ответ для критических ассетов
        if (event.request.url.includes('/manifest.json')) {
          return new Response(JSON.stringify({
            name: 'К-Коннект',
            short_name: 'К-Коннект',
            start_url: '/',
            display: 'standalone'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
  );
});

// Обрабатываем пуш событие
self.addEventListener('push', function(event) {
  console.log(`[${PUSH_SW_NAME}] получили пуш уведомление! 🔔`);
  
  if (event.data) {
    try {
      // Пробуем распарсить как JSON
      const data = event.data.json();
      const options = {
        body: data.notification.body,
        icon: data.notification.icon || '/icon-192.png',
        badge: '/icon-192.png',
        data: {
          url: data.notification.url || data.notification.link || 'https://k-connect.ru',
          time: Date.now()
        },
        requireInteraction: true,
        tag: 'k-connect-notification-' + Date.now() // Обеспечиваем уникальность
      };

      event.waitUntil(
        self.registration.showNotification('К-Коннект', options)
          .then(() => {
          })
          .catch(error => {
          })
      );
    } catch (error) {
      // Fallback для текстовых данных
      try {
        const text = event.data.text();
        event.waitUntil(
          self.registration.showNotification('К-Коннект', {
            body: text,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: {
              url: 'https://k-connect.ru',
              time: Date.now()
            },
            requireInteraction: true,
            tag: 'k-connect-notification-' + Date.now() // Обеспечиваем уникальность
          })
        );
      } catch (textError) {
      }
    }
  }
});

// Обрабатываем клик по уведомлению
self.addEventListener('notificationclick', function(event) {
  console.log(`[${PUSH_SW_NAME}] кликнули по уведомлению! 👆`);
  event.notification.close();
  
  // Фокусируем клиент или открываем окно
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(function(clientList) {
        // Если есть существующий клиент, фокусируем его
        if (clientList.length > 0) {
          const url = event.notification.data && event.notification.data.url ? 
            event.notification.data.url : 'https://k-connect.ru';
            
          for (const client of clientList) {
            if ('focus' in client && client.url.includes(self.location.origin)) {
              console.log(`[${PUSH_SW_NAME}] фокусируем существующее окно! 🎯`);
              return client.focus().then(client => {
                if (client.url !== url) {
                  console.log(`[${PUSH_SW_NAME}] переходим по ссылке: ${url} 🔗`);
                  return client.navigate(url);
                }
              });
            }
          }
        }
        
        // Иначе открываем новое окно
        if (clients.openWindow) {
          const url = event.notification.data && event.notification.data.url ? 
            event.notification.data.url : 'https://k-connect.ru';
          console.log(`[${PUSH_SW_NAME}] открываем новое окно: ${url} 🪟`);
          return clients.openWindow(url);
        }
      })
      .then(() => {
      })
  );
});

// Обрабатываем изменение подписки
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log(`[${PUSH_SW_NAME}] подписка на пуш изменилась, обновляем сервер! 🔄`);
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Будет использовать тот же ключ, что передаётся при подписке в NotificationService.js
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    })
    .then(subscription => {
      console.log(`[${PUSH_SW_NAME}] сгенерирована новая подписка, отправляем на сервер! 📡`);
      
      // Отправляем новую подписку на сервер
      return fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth
          },
          platform: 'web',
          send_test: false // Не отправлять тестовое уведомление при обновлении
        }),
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Не удалось обновить подписку на сервере');
        }
        return response.json();
      })
      .then(data => {
        console.log(`[${PUSH_SW_NAME}] ответ сервера на обновление подписки:`, data);
        return data;
      });
    })
    .catch(error => {
      console.error(`[${PUSH_SW_NAME}] ошибка обновления подписки:`, error);
    })
  );
});