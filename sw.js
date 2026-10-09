/* Tokyo Date Ideas — service worker (cache-first for offline) */
const CACHE = 'tokyo-date-v3';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './bg.webp',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tokyo-date-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: serve from cache when possible, fetch+cache otherwise.
// Cross-origin CDNs (Tailwind, Google Fonts) get cached as opaque responses
// so the app still works fully offline after the first online visit.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Refresh the app screen online while keeping an offline copy.
  // User archives and lists live in IndexedDB, separate from these caches.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (res.ok) {
          await cache.put('./index.html', res.clone());
          return res;
        }
        return (await cache.match('./index.html')) || res;
      } catch (error) {
        const cached = await cache.match('./index.html');
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
