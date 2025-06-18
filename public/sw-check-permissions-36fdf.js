// PropuSH Service Worker for Push Notifications
// This file enables push notification functionality
// File must be accessible at: https://yoursite.com/sw-check-permissions-36fdf.js

self.addEventListener('install', function(event) {
  console.log('PropuSH Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('PropuSH Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      image: data.image,
      data: data.data,
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action) {
    // Handle action button clicks
    event.waitUntil(
      clients.openWindow(event.action.url || event.notification.data.url)
    );
  } else {
    // Handle notification click
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
}); 