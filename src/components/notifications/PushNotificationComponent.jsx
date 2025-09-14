import React, { useState, useEffect, useCallback } from 'react'
import { Bell, MapPin, Trophy, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const PushNotificationComponent = ({ 
  isEnabled = true,
  onNotificationClick = () => {},
  onPermissionRequest = () => {},
  debugMode = false 
}) => {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [lastNotification, setLastNotification] = useState(null)

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
      setIsSupported(supported)
      
      if (supported) {
        setPermission(Notification.permission)
      }
    }

    checkSupport()
  }, [])

  // Register service worker
  useEffect(() => {
    if (isSupported && isEnabled) {
      registerServiceWorker()
    }
  }, [isSupported, isEnabled])

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('/sw.js')
        setRegistration(reg)
        console.log('Service Worker registered successfully')
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      onPermissionRequest(permission)
      
      if (permission === 'granted') {
        console.log('Notification permission granted')
        return true
      } else {
        console.log('Notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }, [isSupported, onPermissionRequest])

  // Send trip validation reminder
  const sendTripValidationReminder = useCallback(async (tripData) => {
    if (permission !== 'granted') return

    const notificationData = {
      title: '🚗 Trip Validation Needed',
      body: `Please validate your trip from ${tripData.from} to ${tripData.to}`,
      icon: '/icons/trip-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'trip-validation',
      data: {
        type: 'trip_validation',
        tripId: tripData.id,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'validate',
          title: 'Validate Trip',
          icon: '/icons/check-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Later',
          icon: '/icons/dismiss-icon.png'
        }
      ],
      requireInteraction: true
    }

    await sendNotification(notificationData)
  }, [permission])

  // Send achievement notification
  const sendAchievementNotification = useCallback(async (achievement) => {
    if (permission !== 'granted') return

    const notificationData = {
      title: '🏆 Achievement Unlocked!',
      body: `Congratulations! You've earned "${achievement.title}"`,
      icon: '/icons/achievement-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'achievement',
      data: {
        type: 'achievement',
        achievementId: achievement.id,
        points: achievement.points,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Achievement',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'share',
          title: 'Share',
          icon: '/icons/share-icon.png'
        }
      ],
      vibrate: [200, 100, 200],
      silent: false
    }

    await sendNotification(notificationData)
  }, [permission])

  // Send weekly challenge update
  const sendWeeklyChallengeUpdate = useCallback(async (challenge) => {
    if (permission !== 'granted') return

    const notificationData = {
      title: '🎯 Weekly Challenge Update',
      body: `${challenge.title}: ${challenge.progress}% complete. Keep going!`,
      icon: '/icons/challenge-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'weekly-challenge',
      data: {
        type: 'weekly_challenge',
        challengeId: challenge.id,
        progress: challenge.progress,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Progress',
          icon: '/icons/progress-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-icon.png'
        }
      ]
    }

    await sendNotification(notificationData)
  }, [permission])

  // Generic notification sender
  const sendNotification = async (notificationData) => {
    try {
      if (registration && registration.showNotification) {
        // Use service worker notification (supports actions)
        await registration.showNotification(notificationData.title, notificationData)
      } else {
        // Fallback to basic notification
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          badge: notificationData.badge,
          tag: notificationData.tag,
          data: notificationData.data
        })

        notification.onclick = () => {
          onNotificationClick(notificationData.data)
          notification.close()
        }
      }

      setLastNotification({
        ...notificationData,
        timestamp: Date.now()
      })

      if (debugMode) {
        console.log('Notification sent:', notificationData)
      }
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  // Handle notification click events
  useEffect(() => {
    if (!registration) return

    const handleNotificationClick = (event) => {
      event.notification.close()
      
      const { data } = event.notification
      const action = event.action

      if (action) {
        handleNotificationAction(action, data)
      } else {
        onNotificationClick(data)
      }
    }

    navigator.serviceWorker.addEventListener('notificationclick', handleNotificationClick)

    return () => {
      navigator.serviceWorker.removeEventListener('notificationclick', handleNotificationClick)
    }
  }, [registration, onNotificationClick])

  // Handle notification actions
  const handleNotificationAction = (action, data) => {
    switch (data.type) {
      case 'trip_validation':
        if (action === 'validate') {
          window.location.href = `/trip-validation/${data.tripId}`
        }
        break
      case 'achievement':
        if (action === 'view') {
          window.location.href = '/rewards'
        } else if (action === 'share') {
          // Handle sharing logic
          console.log('Share achievement:', data.achievementId)
        }
        break
      case 'weekly_challenge':
        if (action === 'view') {
          window.location.href = '/challenges'
        }
        break
      default:
        onNotificationClick(data)
    }
  }

  // Exposed API for other components
  const api = {
    requestPermission,
    sendTripValidationReminder,
    sendAchievementNotification,
    sendWeeklyChallengeUpdate,
    isSupported,
    permission,
    isEnabled: permission === 'granted' && isEnabled
  }

  // Test notifications for development
  const sendTestNotifications = async () => {
    if (!debugMode) return

    // Test trip validation
    await sendTripValidationReminder({
      id: 'test-trip-1',
      from: 'Home',
      to: 'Office',
      distance: '5.2 km'
    })

    // Test achievement
    setTimeout(async () => {
      await sendAchievementNotification({
        id: 'test-achievement-1',
        title: 'First Trip Logged',
        points: 100
      })
    }, 2000)

    // Test weekly challenge
    setTimeout(async () => {
      await sendWeeklyChallengeUpdate({
        id: 'test-challenge-1',
        title: 'Complete 10 trips',
        progress: 70
      })
    }, 4000)
  }

  return (
    <div className="push-notification-component">
      {debugMode && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Push Notifications</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Support:</span>
              <span className={`font-medium ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
                {isSupported ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Permission:</span>
              <span className={`font-medium ${
                permission === 'granted' ? 'text-green-600' : 
                permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {permission}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Service Worker:</span>
              <span className={`font-medium ${registration ? 'text-green-600' : 'text-gray-400'}`}>
                {registration ? 'Ready' : 'Not Ready'}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Request Permission
              </button>
            )}
            
            {permission === 'granted' && (
              <button
                onClick={sendTestNotifications}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
              >
                Send Test Notifications
              </button>
            )}
          </div>

          {lastNotification && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
              <div className="font-medium text-gray-900">Last Notification:</div>
              <div className="text-gray-600">{lastNotification.title}</div>
              <div className="text-gray-500">
                {new Date(lastNotification.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expose API through ref or context */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.PushNotificationAPI = ${JSON.stringify(api)};`
        }}
      />
    </div>
  )
}

// Notification status indicator component
export const NotificationStatusIndicator = ({ permission, isSupported }) => {
  const getStatusColor = () => {
    if (!isSupported) return 'text-gray-400'
    if (permission === 'granted') return 'text-green-500'
    if (permission === 'denied') return 'text-red-500'
    return 'text-yellow-500'
  }

  const getStatusIcon = () => {
    if (!isSupported) return <AlertCircle className="w-4 h-4" />
    if (permission === 'granted') return <CheckCircle className="w-4 h-4" />
    if (permission === 'denied') return <AlertCircle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  return (
    <div className={`flex items-center gap-1 ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">
        {!isSupported ? 'Not Supported' :
         permission === 'granted' ? 'Enabled' :
         permission === 'denied' ? 'Blocked' : 'Pending'}
      </span>
    </div>
  )
}

// Hook for using push notifications in other components
export const usePushNotifications = () => {
  const [component, setComponent] = useState(null)

  useEffect(() => {
    // This would typically be provided through React Context
    setComponent(window.PushNotificationAPI)
  }, [])

  return component
}

export default PushNotificationComponent