/* eslint-disable no-restricted-globals */
const SW_VERSION = 'pp-v8';
const APP_SHELL = [
  '/app/',
  '/app/index.html',
  '/app/style.css',
  '/app/app.js',
  '/app/manifest.webmanifest',
  '/brand/pp-monogram.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SW_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Routing:
// - Do NOT intercept /api/* (network-only).
// - Static assets -> cache-first.
// - Navigations & other GETs in /app -> network-first with cache fallback.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only operate within our /app scope on same origin
  if (url.origin !== location.origin || !url.pathname.startsWith('/app/')) return;

  // Never handle API
  if (url.pathname.startsWith('/api/')) return;

  // Static assets
  if (/\.(css|js|mjs|map|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(SW_VERSION).then((c) => c.put(request, copy));
          return res;
        })
      )
    );
    return;
  }

  // Navigations & other GETs inside /app
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(SW_VERSION).then((c) => c.put(request, copy));
        return res;
      }).catch(() =>
        caches.match(request).then((hit) => hit || caches.match('/app/index.html'))
      )
    );
  }
});
