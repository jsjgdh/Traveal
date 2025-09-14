// Service Worker for Push Notifications
// This file should be placed in the public directory as sw.js

const CACHE_NAME = 'traveal-notifications-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/trip-icon.png',
  '/icons/achievement-icon.png',
  '/icons/challenge-icon.png',
  '/icons/badge-icon.png'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.log('Cache install failed:', error)
      })
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  if (!event.data) {
    console.log('Push event has no data')
    return
  }

  try {
    const data = event.data.json()
    console.log('Push data received:', data)

    const options = {
      body: data.body,
      icon: data.icon || '/icons/default-icon.png',
      badge: data.badge || '/icons/badge-icon.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: data.vibrate || [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Traveal Notification', options)
    )
  } catch (error) {
    console.error('Error parsing push data:', error)
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Traveal', {
        body: 'You have a new notification',
        icon: '/icons/default-icon.png',
        badge: '/icons/badge-icon.png'
      })
    )
  }
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click event:', event)

  event.notification.close()

  const { data } = event.notification
  const action = event.action

  // Handle specific actions
  if (action) {
    console.log('Notification action clicked:', action)
    
    switch (action) {
      case 'validate':
        event.waitUntil(
          clients.openWindow(`/trip-validation/${data.tripId}`)
        )
        break
      case 'view':
        if (data.type === 'achievement') {
          event.waitUntil(clients.openWindow('/rewards'))
        } else if (data.type === 'weekly_challenge') {
          event.waitUntil(clients.openWindow('/challenges'))
        }
        break
      case 'share':
        // Handle sharing logic
        console.log('Share action triggered')
        break
      case 'dismiss':
        // Just close the notification (already handled above)
        break
      default:
        console.log('Unknown action:', action)
    }
  } else {
    // Default click behavior - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          const targetUrl = getTargetUrl(data)
          return clients.openWindow(targetUrl)
        }
      })
    )
  }
})

// Get target URL based on notification data
function getTargetUrl(data) {
  if (!data || !data.type) return '/'

  switch (data.type) {
    case 'trip_validation':
      return `/trip-validation/${data.tripId}`
    case 'achievement':
      return '/rewards'
    case 'weekly_challenge':
      return '/challenges'
    default:
      return '/'
  }
}

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)
  
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Handle any pending notifications when back online
      syncNotifications()
    )
  }
})

async function syncNotifications() {
  try {
    // This would typically sync with your backend
    console.log('Syncing notifications...')
    
    // Placeholder for actual sync logic
    // You would fetch any missed notifications from your server here
    
  } catch (error) {
    console.error('Notification sync failed:', error)
  }
}

// Handle notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag)
  
  // Optional: Track notification dismissals for analytics
  const { data } = event.notification
  if (data && data.type) {
    console.log(`${data.type} notification dismissed`)
  }
})