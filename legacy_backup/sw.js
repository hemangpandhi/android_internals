// Service Worker for Android Internals Website
// Provides offline functionality and caching

const CACHE_NAME = 'android-internals-v1.0.0';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/scripts.js',
    '/assets/images/android_logo.PNG',
    '/assets/images/MyPhotofinal.png',
    '/assets/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static resources');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed', error);
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        throw error;
                    });
            })
    );
});
