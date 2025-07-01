// Basic service worker for PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip CSP for service worker requests to external resources
  if (event.request.url.includes('fonts.googleapis.com') || 
      event.request.url.includes('fonts.gstatic.com') ||
      event.request.url.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      fetch(event.request, {
        mode: 'cors',
        credentials: 'omit'
      }).catch(() => {
        // If fetch fails, return a network error
        return new Response('', {
          status: 408,
          statusText: 'Request Timeout'
        });
      })
    );
    return;
  }
  
  // For all other requests, pass through normally
  event.respondWith(fetch(event.request));
});