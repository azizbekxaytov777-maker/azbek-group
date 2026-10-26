/**
 * AZBEK GROUP SUPER APP — Offline Service Worker (v6.1 INSTANT 24/7 LAUNCH)
 * Stale-While-Revalidate for Instant UI Load (Bypasses Render Cold Start)
 * Cache-First for static assets (images, icons, scripts)
 */

const CACHE_NAME = 'azbek-group-v6.1';
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
      console.log('[AZBEK SW v6.1] Keshlanmoqda:', ASSETS_TO_CACHE);
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
  const url = event.request.url;

  // 1. /api/data GET so'rovlarini oflayn uchun keshlaymiz
  if (url.includes('/api/data') && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[AZBEK SW] Oflayn rejim: /api/data keshdan olinmoqda');
          return caches.match(event.request);
        })
    );
    return;
  }

  // Boshqa dinamik POST /api so'rovlar to'g'ridan-to'g'ri o'tadi
  if (url.includes('/api/')) {
    return;
  }

  // 2. Sahifani ochish (Navigation) — Keshdan bir zumda ochish (Render uyg'onishini kutmasdan)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      caches.match('/index.html').then((cachedResponse) => {
        // Orqa fonda tarmoqdan yangilanishni tekshiramiz
        const networkFetch = fetch(event.request).then(async (networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            try {
              const textClone = await networkResponse.clone().text();
              // Faqat haqiqiy AZBEK ilovasi kelgandagina keshni yangilaymiz (Render'ning "waking up" sahifasi emas!)
              if (textClone.includes('AZBEK GROUP') || textClone.includes('AZBEK')) {
                const copy = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return networkResponse;
              } else {
                console.log('[AZBEK SW] Render uyg\'onish sahifasi aniqlandi. Keshdagi to\'liq ilova ko\'rsatilmoqda.');
                return cachedResponse || networkResponse;
              }
            } catch (e) {
              return networkResponse;
            }
          }
          return cachedResponse || networkResponse;
        }).catch(() => cachedResponse);

        // Agar keshda bo'lsa, 0.01 soniyada ochamiz! Bo'lmasa tarmoqdan kutamiz.
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 3. Statik resurslar (Rasmlar, skriptlar, ikonlar) — Cache-First
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
        return new Response('', { status: 408, statusText: 'Offline' });
      });
    })
  );
});
