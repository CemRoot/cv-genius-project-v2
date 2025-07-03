// Basic service worker for PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // List of external domains that should bypass service worker caching
  const externalDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'pagead2.googlesyndication.com',
    'googleads.g.doubleclick.net',
    'www.googletagmanager.com',
    'tpc.googlesyndication.com',
    'www.google-analytics.com',
    'monetag.com',
    'doubleclick.net'
  ];
  
  // Check if request is to an external domain
  const isExternal = externalDomains.some(domain => url.includes(domain));
  
  if (isExternal) {
    // For external resources (ads, fonts, analytics), use network-first strategy
    event.respondWith(
      fetch(event.request, {
        mode: 'cors',
        credentials: 'omit'
      }).catch(() => {
        // If fetch fails, return a network error (don't cache failed requests)
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