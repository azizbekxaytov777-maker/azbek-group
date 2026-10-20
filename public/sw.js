/**
 * AZBEK GROUP SUPER APP — Offline Service Worker (v5.3 UNIFIED)
 * Network-First for Navigation & Icons (updates appear instantly)
 * Cache-First with Network fallback for offline assets
 */

const CACHE_NAME = 'azbek-group-v5.3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.jpg',
  '/assets/azbek_icon_512.png',
  '/assets/azbek_icon_192.png',
  '/assets/icon.png',
  '/assets/icon.svg',
  '/assets/qrcode.min.js',
  '/assets/html5-qrcode.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[AZBEK SW] Keshlanmoqda:', ASSETS_TO_CACHE);
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[AZBEK SW] Ba\'zi fayllar keshlanmadi:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[AZBEK SW] Eski kesh tozalandi:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    return; // Pass dynamic API calls straight through
  }

  // Network-First for HTML/navigation so code changes appear immediately
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html').then(res => res || caches.match('/')))
    );
    return;
  }

  // Cache-First with Network fallback for images and scripts
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for missing images/resources
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
