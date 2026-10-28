/**
 * AZBEK GROUP SUPER APP — Offline Service Worker (v7.0 TOTAL OFFLINE FIRST)
 * 100% Bulletproof Offline-First Navigation & Instant Cache Fallback
 * Never returns undefined (prevents ERR_FAILED on Chromium/Android/iOS)
 */

const CACHE_NAME = 'azbek-group-v7.0';
const CORE_ASSETS = [
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

// Helper to reliably find any cached HTML page
async function getCachedHtml(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    // 1. Try exact match
    let res = await cache.match(request);
    if (res) return res;

    // 2. Try '/index.html'
    res = await cache.match('/index.html');
    if (res) return res;

    // 3. Try '/'
    res = await cache.match('/');
    if (res) return res;

    // 4. Try any cached file across all caches
    res = await caches.match('/index.html') || await caches.match('/');
    if (res) return res;

    const keys = await cache.keys();
    for (const k of keys) {
      if (k.url.endsWith('.html') || k.url.endsWith('/')) {
        const match = await cache.match(k);
        if (match) return match;
      }
    }
  } catch (e) {
    console.warn('[AZBEK SW] getCachedHtml xatosi:', e);
  }
  return null;
}

// 1. INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      console.log('[AZBEK SW v7.0] Oflayn resurslar keshlanmoqda...');
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache index.html under both '/' and '/index.html' first
        try {
          const indexRes = await fetch('/index.html');
          if (indexRes && indexRes.status === 200) {
            await cache.put('/index.html', indexRes.clone());
            await cache.put('/', indexRes.clone());
          }
        } catch (e) {
          console.warn('[AZBEK SW] Birlamchi index.html olinmadi:', e);
        }

        // Cache all core assets individually so one failure does not break the rest
        await Promise.allSettled(
          CORE_ASSETS.map(url => cache.add(url).catch(err => console.warn('[AZBEK SW] Fayl yuklanmadi:', url, err)))
        );
      } catch (err) {
        console.warn('[AZBEK SW] Install xatolik:', err);
      }
    })()
  );
});

// 2. ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[AZBEK SW] Eski kesh tozalandi:', key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// 3. FETCH
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // 1. Skip non-GET requests (POST, PUT, DELETE go straight to network)
  if (req.method !== 'GET') {
    return;
  }

  // 2. Dynamic POST /api/ and ping requests pass directly
  if (url.includes('/api/ping') || url.includes('/api/health')) {
    return;
  }

  // 3. GET /api/data (Offline Data Cache)
  if (url.includes('/api/data')) {
    event.respondWith(
      (async () => {
        try {
          const netRes = await fetch(req);
          if (netRes && netRes.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, netRes.clone());
            return netRes;
          }
        } catch (e) {
          console.log('[AZBEK SW] Oflayn rejim: /api/data keshdan olinmoqda');
        }
        const cached = await caches.match(req);
        if (cached) return cached;
        // Never return undefined! Return fallback JSON
        return new Response(JSON.stringify({ success: true, offline: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      })()
    );
    return;
  }

  // 4. Other API requests pass through
  if (url.includes('/api/')) {
    return;
  }

  // 5. NAVIGATION / DOCUMENT REQUESTS (Entering or refreshing page)
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      (async () => {
        // Step A: Immediately check if we have a cached page
        const cachedHtml = await getCachedHtml(req);

        // Step B: If offline (navigator.onLine === false), return cached page IMMEDIATELY!
        if (typeof navigator !== 'undefined' && navigator.onLine === false && cachedHtml) {
          console.log('[AZBEK SW] Qurilma oflayn: Keshdagi sahifa uzatildi');
          return cachedHtml;
        }

        // Step C: If online or uncertain, attempt network with 2.5s timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const netRes = await fetch(req, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (netRes && netRes.status === 200) {
            const textClone = await netRes.clone().text();
            // Validate response is actual AZBEK app (not Render "Service Waking Up" page)
            if (textClone.includes('AZBEK')) {
              const cache = await caches.open(CACHE_NAME);
              cache.put('/index.html', netRes.clone());
              cache.put('/', netRes.clone());
              cache.put(req, netRes.clone());
              return netRes;
            } else {
              console.log('[AZBEK SW] Render uyg\'onish ekrani sezildi, keshdagi ilova ochildi.');
              if (cachedHtml) return cachedHtml;
              return netRes;
            }
          }

          if (cachedHtml) return cachedHtml;
          return netRes;
        } catch (netErr) {
          // Network failed (No internet / airplane mode / offline)
          console.log('[AZBEK SW] Tarmoq xatosi (Oflayn): Keshdagi sahifa ko\'rsatilmoqda.');
          if (cachedHtml) {
            return cachedHtml;
          }
          // Ultimate safe fallback response (GUARANTEED NO ERR_FAILED)
          return new Response(
            `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AZBEK GROUP OFLAYN</title><style>body{background:#0b0f17;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:24px;box-sizing:border-box}.card{background:#111827;border:1px solid #374151;border-radius:24px;padding:32px;max-width:380px}h1{color:#f59e0b;font-size:20px;margin-bottom:8px}p{color:#9ca3af;font-size:13px;line-height:1.5}button{margin-top:16px;width:100%;padding:12px;background:linear-gradient(to right,#f59e0b,#d97706);color:#000;border:none;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer}</style></head><body><div class="card"><div style="font-size:40px;margin-bottom:12px">⚡</div><h1>AZBEK GROUP OFLAYN</h1><p>Ilova oflayn xotiraga yuklanmoqda. Bir marta internetni yoqib sahifani yangilang, shundan so'ng doimiy internetsiz ishlaydi!</p><button onclick="location.reload()">Qayta yuklash ➔</button></div></body></html>`,
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })()
    );
    return;
  }

  // 6. STATIC ASSETS (Cache-First with Network Fallback)
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const netRes = await fetch(req);
        if (netRes && netRes.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone());
        }
        return netRes;
      } catch (err) {
        // Fallback for missing images/assets
        return new Response('', { status: 408, statusText: 'Offline Asset' });
      }
    })()
  );
});
