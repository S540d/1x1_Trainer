/**
 * Service Worker für 1x1 Trainer PWA
 * Bietet Offline-Funktionalität und intelligentes Caching
 */

const CACHE_VERSION = 'v2';
const CACHE_NAMES = {
  static: `1x1-trainer-static-${CACHE_VERSION}`,
  dynamic: `1x1-trainer-dynamic-${CACHE_VERSION}`,
  images: `1x1-trainer-images-${CACHE_VERSION}`,
};

// URLs zum cachen beim Installation
const urlsToCache = [
  '/1x1_Trainer/testing/',
  '/1x1_Trainer/testing/index.html',
  '/1x1_Trainer/testing/manifest.json',
  '/1x1_Trainer/testing/icon.png',
  '/1x1_Trainer/testing/icon-96.png',
  '/1x1_Trainer/testing/icon-128.png',
  '/1x1_Trainer/testing/icon-192.png',
  '/1x1_Trainer/testing/icon-512.png',
];

/**
 * Installation: Cache kritische Assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch(() => {
          // Silent error handling
        });
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

/**
 * Aktivierung: Alte Caches löschen
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Lösche alte Cache-Versionen
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_ACTIVATED' });
          });
        });
      })
  );
});

/**
 * Fetch: Intelligente Cache-Strategien
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Statische Assets - Cache First
  if (request.method === 'GET' && /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request).then((response) => {
            // Nur erfolgreich geladene Responses cachen
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            const cacheName = request.url.includes('.png') || request.url.includes('.jpg')
              ? CACHE_NAMES.images
              : CACHE_NAMES.static;
            caches.open(cacheName).then((cache) => {
              cache.put(request, responseToCache);
            });
            return response;
          });
        })
        .catch(() => {
          // Fallback für fehlende statische Assets
          return new Response('Asset not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        })
    );
  }

  // HTML & API - Network First, dann Cache
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Erfolgreiche Response cachen
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAMES.dynamic).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback auf gecachte Version
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Offline Fallback Page
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/1x1_Trainer/testing/index.html');
              }
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain',
                }),
              });
            });
        })
    );
  }
});

/**
 * Message Handler - für Updates von Clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
