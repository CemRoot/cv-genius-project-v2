// Basic service worker for PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  event.respondWith(fetch(event.request));
});