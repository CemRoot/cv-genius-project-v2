// Basic service worker for PWA
self.addEventListener('install', (event) => {
  console.log('[PWA] Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[PWA] Service Worker activated.');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  event.respondWith(fetch(event.request));
});