const CACHE_NAME = 'pp-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './style.css',
  '/icon-192.png',
  '/icon-512.png',
  '/brand/pp-monogram.svg',
  '/brand/hero-glow.svg',
  './brand/preview-dashboard.svg',
  './brand/preview-live.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
