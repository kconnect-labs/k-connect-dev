const PUSH_SW_VERSION = 'Пуш-кеш-2.9';
const PUSH_SW_NAME = 'К-Коннект';
const CACHE_NAME = 'k-connect-cache-v2.9';

const CACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/fonts.css'
];



console.log(`%c$[${PUSH_SW_NAME}] версия ${PUSH_SW_VERSION} запичкурена в твой браузер! 🎉`, 'color: #D0BCFF; font-family: monospace; font-size: 16px;');

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      )
    )
    .then(() => self.clients.claim())
    .then(() => self.registration.pushManager.getSubscription())
    .then(subscription => subscription?.unsubscribe())
    .catch(() => {})
  );
});

self.addEventListener('fetch', event => {
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes('/api/')
  ) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        if (event.request.url.includes('/manifest.json')) {
          return new Response(JSON.stringify({
            name: 'К-Коннект',
            short_name: 'К-Коннект',
            start_url: '/',
            display: 'browser'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;
  try {
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
      tag: 'k-connect-notification-' + Date.now()
    };
    event.waitUntil(self.registration.showNotification('К-Коннект', options));
  } catch {
    const text = event.data.text();
    event.waitUntil(self.registration.showNotification('К-Коннект', {
      body: text,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: {
        url: 'https://k-connect.ru',
        time: Date.now()
      },
      requireInteraction: true,
      tag: 'k-connect-notification-' + Date.now()
    }));
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://k-connect.ru';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsArr => {
      for (const client of clientsArr) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          return client.focus().then(() => {
            if (client.url !== url) return client.navigate(url);
          });
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    })
    .then(subscription => {
      return fetch('/api/notifications/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth
          },
          platform: 'web',
          send_test: false
        })
      });
    })
    .catch(() => {})
  );
});
