// CVGenius Service Worker - Mobile-First Offline Support
const CACHE_NAME = 'cvgenius-v1.0.0'
const STATIC_CACHE = 'cvgenius-static-v1'
const DYNAMIC_CACHE = 'cvgenius-dynamic-v1'
const IMAGES_CACHE = 'cvgenius-images-v1'
const API_CACHE = 'cvgenius-api-v1'

// Core app shell files that should always be cached
const CORE_FILES = [
  '/',
  '/builder',
  '/ats-check',
  '/templates',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/templates',
  '/api/ats/analyze'
]

// Files to cache on install
const PRECACHE_FILES = [
  '/offline',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
]

// Maximum cache sizes
const MAX_CACHE_SIZE = {
  static: 50,
  dynamic: 30,
  images: 20,
  api: 15
}

// Cache strategies
const CACHE_STRATEGIES = {
  // Core app shell - Cache First
  coreApp: 'cache-first',
  // Static assets - Cache First with network fallback
  static: 'cache-first',
  // API calls - Network First with cache fallback
  api: 'network-first',
  // Images - Cache First with network fallback
  images: 'cache-first',
  // Dynamic content - Stale While Revalidate
  dynamic: 'stale-while-revalidate'
}

// Install event - precache core files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache core app shell
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching core app shell')
        return cache.addAll(CORE_FILES)
      }),
      
      // Cache additional static files
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(PRECACHE_FILES)
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete')
      // Skip waiting to activate immediately
      return self.skipWaiting()
    }).catch(error => {
      console.error('Service Worker: Installation failed', error)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGES_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete')
    })
  )
})

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip cross-origin requests (except for known CDNs)
  if (url.origin !== location.origin && !isTrustedOrigin(url.origin)) {
    return
  }
  
  // Route request based on type
  if (isCoreAppRequest(request)) {
    event.respondWith(handleCoreApp(request))
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPI(request))
  } else if (isImageRequest(request)) {
    event.respondWith(handleImage(request))
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
  } else {
    event.respondWith(handleDynamic(request))
  }
})

// Handle core app requests (Cache First)
async function handleCoreApp(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Core app request failed:', error)
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    throw error
  }
}

// Handle API requests (Network First)
async function handleAPI(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
      
      // Cleanup old API cache entries
      await cleanupCache(API_CACHE, MAX_CACHE_SIZE.api)
    }
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache for API:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Add offline indicator header
      const response = cachedResponse.clone()
      response.headers.set('X-Served-From', 'cache')
      return response
    }
    
    // Return offline response for critical API calls
    if (request.url.includes('/api/templates')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Templates not available offline',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Handle image requests (Cache First)
async function handleImage(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(IMAGES_CACHE)
      cache.put(request, networkResponse.clone())
      
      // Cleanup old image cache entries
      await cleanupCache(IMAGES_CACHE, MAX_CACHE_SIZE.images)
    }
    return networkResponse
  } catch (error) {
    console.log('Image request failed:', error)
    // Return placeholder image
    return caches.match('/icons/icon-192x192.png')
  }
}

// Handle static assets (Cache First)
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Static asset request failed:', error)
    throw error
  }
}

// Handle dynamic requests (Stale While Revalidate)
async function handleDynamic(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
      // Cleanup old dynamic cache entries
      cleanupCache(DYNAMIC_CACHE, MAX_CACHE_SIZE.dynamic)
    }
    return networkResponse
  }).catch(() => cachedResponse)
  
  return cachedResponse || fetchPromise
}

// Utility functions
function isCoreAppRequest(request) {
  const url = new URL(request.url)
  return CORE_FILES.some(file => url.pathname === file) || 
         (request.mode === 'navigate' && url.pathname.startsWith('/'))
}

function isAPIRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

function isImageRequest(request) {
  const url = new URL(request.url)
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)
}

function isStaticAsset(request) {
  const url = new URL(request.url)
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.startsWith('/_next/static/')
}

function isTrustedOrigin(origin) {
  const trustedOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com'
  ]
  return trustedOrigins.includes(origin)
}

// Cache cleanup function
async function cleanupCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  
  if (keys.length > maxSize) {
    // Remove oldest entries
    const entriesToDelete = keys.slice(0, keys.length - maxSize)
    await Promise.all(entriesToDelete.map(key => cache.delete(key)))
    console.log(`Cleaned up ${entriesToDelete.length} entries from ${cacheName}`)
  }
}

// Background sync for analytics
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics())
  }
})

async function syncAnalytics() {
  try {
    // Get stored analytics data
    const cache = await caches.open('analytics-queue')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        await fetch(request)
        await cache.delete(request)
      } catch (error) {
        console.log('Analytics sync failed, will retry:', error)
      }
    }
  } catch (error) {
    console.error('Analytics sync error:', error)
  }
}

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: data.data,
    actions: [
      {
        action: 'open',
        title: 'Open CVGenius'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handling for cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status)
    })
  }
})

async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {}
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    status[cacheName] = keys.length
  }
  
  return status
}

console.log('Service Worker: Loaded successfully')