// Service Worker Version
const CACHE_VERSION = 'v1.2.1';
const CACHE_NAME = `color-detector-cache-${CACHE_VERSION}`;

// Files to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/apple-icon.png',
  '/splash.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});


self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  

  event.waitUntil(clients.claim());
  

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('color-detector-cache-') && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});


self.addEventListener('fetch', (event) => {

  if (event.request.url.includes('getUserMedia')) {
    return;
  }
  

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
  
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
        
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
        })
    );
    return;
  }
  

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
  
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cache a copy of the response
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        
        return response;
      });
    })
  );
});


self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const notification = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/icons.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100]
    })
  );
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
  
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
     
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});