const CACHE_NAME = 'android-internals-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/books.html',
  '/styles.css',
  '/scripts.js',
  '/android_logo.PNG',
  '/hal.html',
  '/framework.html',
  '/adb.html',
  '/articles/adb-complete-guide.html',
  '/articles/android-hal-deep-dive.html'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 