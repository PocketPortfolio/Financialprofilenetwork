/* eslint-disable no-restricted-globals */

/**
 * Pocket Portfolio SW — v9
 * - Cache-first for static shell (CSS, images, fonts)
 * - Network-first for /app/app.js so new UI ships immediately
 * - Network-first for navigations inside /app with cached fallback
 * - Never intercept /api/* (server decides)
 */
const SW_VERSION = 'pp-v13';

const APP_SHELL = [
  '/app/',
  '/app/index.html',
  '/app/style.css',
  '/app/manifest.webmanifest',
  '/brand/pp-monogram.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SW_VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle our own origin and /app/* scope
  if (url.origin !== location.origin || !url.pathname.startsWith('/app/')) return;

  // Never touch API calls
  if (url.pathname.startsWith('/api/')) return;

  // Always network-first for the app bundle so UI updates reach users
  if (url.pathname === '/app/app.js') {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(SW_VERSION).then((c) => c.put(request, copy));
        return res;
      }).catch(() => caches.match(request)) // offline fallback if we have a cached copy
    );
    return;
  }

  // Cache-first for static assets (keeps shell snappy)
  if (/\.(css|mjs|js|map|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((hit) =>
        hit ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(SW_VERSION).then((c) => c.put(request, copy));
          return res;
        })
      )
    );
    return;
  }

  // Navigations & other GETs inside /app — network-first with cached fallback
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
