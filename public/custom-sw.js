// PUSH NOTIFICATIONS + BASIC CACHING - This service worker handles push notifications and basic caching
// Version: push-cache-2.1.0 (обновлено для работы без vite-plugin-pwa)

const PUSH_SW_VERSION = 'push-cache-2.1.0';
const PUSH_SW_NAME = 'k-connect-push-notifications';
const CACHE_NAME = 'k-connect-cache-v1';

// Assets to cache
const CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/fonts.css'
];

// Clearly log what this service worker is for
console.log(`[${PUSH_SW_NAME}] Version ${PUSH_SW_VERSION} loading`);

// Install event - cache basic assets
self.addEventListener('install', event => {
  console.log(`[${PUSH_SW_NAME}] Installing version ${PUSH_SW_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[${PUSH_SW_NAME}] Caching basic assets`);
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log(`[${PUSH_SW_NAME}] Basic assets cached successfully`);
        return self.skipWaiting();
      })
      .catch(error => {
        console.error(`[${PUSH_SW_NAME}] Cache installation failed:`, error);
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log(`[${PUSH_SW_NAME}] Activating version ${PUSH_SW_VERSION}`);
  
  event.waitUntil(
    // Clean up old caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[${PUSH_SW_NAME}] Deleting old cache:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Claim clients to force immediate control
      return self.clients.claim();
    })
    .then(() => {
      // Force resubscribe on next page load by unsubscribing now
      return self.registration.pushManager.getSubscription()
        .then(subscription => {
          if (subscription) {
            console.log(`[${PUSH_SW_NAME}] Unsubscribing from push to force key update`);
            return subscription.unsubscribe();
          }
        })
        .catch(error => {
          console.error(`[${PUSH_SW_NAME}] Error unsubscribing:`, error);
        });
    })
  );
});

// Fetch event - serve cached assets when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-GET requests and external requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For navigation requests, try network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // Return a fallback response for critical assets
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

// Handle the push event
self.addEventListener('push', function(event) {
  console.log(`[${PUSH_SW_NAME}] Push notification received`);
  
  if (event.data) {
    try {
      // Try to parse as JSON
      const data = event.data.json();
      const options = {
        body: data.notification.body,
        icon: data.notification.icon || '/icon-192.png',
        badge: '/icon-192.png',
        data: {
          url: data.notification.url || data.notification.link || 'https://k-connect.ru',
          time: new Date().getTime()
        },
        requireInteraction: true,
        tag: 'k-connect-notification-' + new Date().getTime() // Ensure uniqueness
      };

      event.waitUntil(
        self.registration.showNotification('К-Коннект', options)
      );
    } catch (error) {
      console.error(`[${PUSH_SW_NAME}] Error parsing notification data`, error);
      // Fallback for text data
      try {
        const text = event.data.text();
        event.waitUntil(
          self.registration.showNotification('К-Коннект', {
            body: text,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: {
              url: 'https://k-connect.ru',
              time: new Date().getTime()
            },
            requireInteraction: true,
            tag: 'k-connect-notification-' + new Date().getTime() // Ensure uniqueness
          })
        );
      } catch (textError) {
        console.error(`[${PUSH_SW_NAME}] Could not display notification`, textError);
      }
    }
  }
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log(`[${PUSH_SW_NAME}] Notification clicked`);
  event.notification.close();
  
  // Add client focus or open window
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(function(clientList) {
        // If there's an existing client, focus it
        if (clientList.length > 0) {
          const url = event.notification.data && event.notification.data.url ? 
            event.notification.data.url : 'https://k-connect.ru';
            
          for (const client of clientList) {
            if ('focus' in client && client.url.includes(self.location.origin)) {
              return client.focus().then(client => {
                if (client.url !== url) {
                  return client.navigate(url);
                }
              });
            }
          }
        }
        
        // Otherwise open a new window
        if (clients.openWindow) {
          const url = event.notification.data && event.notification.data.url ? 
            event.notification.data.url : 'https://k-connect.ru';
          return clients.openWindow(url);
        }
      })
  );
});

// Handle subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log(`[${PUSH_SW_NAME}] Push subscription changed, updating server`);
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Будет использовать тот же ключ, что передаётся при подписке в NotificationService.js
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    })
    .then(subscription => {
      console.log(`[${PUSH_SW_NAME}] New subscription generated, sending to server`);
      
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
          throw new Error('Failed to update subscription on server');
        }
        return response.json();
      })
      .then(data => {
        console.log(`[${PUSH_SW_NAME}] Server subscription update response:`, data);
        return data;
      });
    })
    .catch(error => {
      console.error(`[${PUSH_SW_NAME}] Subscription update error:`, error);
    })
  );
}); 