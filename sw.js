/* Tokyo Date Ideas — service worker (cache-first for offline) */
const CACHE = 'tokyo-date-v5';
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
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
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

  // Keep the screen matched to the active worker until an update is accepted.
  // IndexedDB user data is separate from these cached app files.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('./index.html');
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) await cache.put('./index.html', res.clone());
      return res;
    })());
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(cache => cache.match(req)).then((cached) => {
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
