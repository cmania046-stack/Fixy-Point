const CACHE_NAME = 'my-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png'
];

// 1. Proses Install: Menyimpan file ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache terbuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Proses Fetch: Mengambil file dari cache jika offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ada di cache, kembalikan. Jika tidak, ambil dari jaringan.
        return response || fetch(event.request);
      })
  );
});