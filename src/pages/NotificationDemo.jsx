import React, { useState, useEffect } from 'react'
import PushNotificationComponent, { NotificationStatusIndicator } from '../components/notifications/PushNotificationComponent'
import { Bell, MapPin, Trophy, Target } from 'lucide-react'

const NotificationDemo = () => {
  const [permission, setPermission] = useState('default')
  const [isSupported, setIsSupported] = useState(false)
  const [notificationAPI, setNotificationAPI] = useState(null)

  useEffect(() => {
    // Check support
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)
    setPermission(supported ? Notification.permission : 'denied')

    // Access the API after component mounts
    const interval = setInterval(() => {
      if (window.PushNotificationAPI) {
        setNotificationAPI(window.PushNotificationAPI)
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleNotificationClick = (data) => {
    console.log('Notification clicked:', data)
    // Handle navigation based on notification type
  }

  const handlePermissionRequest = (newPermission) => {
    setPermission(newPermission)
  }

  // Demo functions
  const sendDemoTripValidation = async () => {
    if (notificationAPI && notificationAPI.sendTripValidationReminder) {
      await notificationAPI.sendTripValidationReminder({
        id: 'demo-trip-' + Date.now(),
        from: 'Home',
        to: 'Work',
        distance: '5.2 km',
        mode: 'car'
      })
    }
  }

  const sendDemoAchievement = async () => {
    if (notificationAPI && notificationAPI.sendAchievementNotification) {
      await notificationAPI.sendAchievementNotification({
        id: 'demo-achievement-' + Date.now(),
        title: 'Eco Warrior',
        description: 'Completed 5 eco-friendly trips',
        points: 250,
        level: 'gold'
      })
    }
  }

  const sendDemoChallenge = async () => {
    if (notificationAPI && notificationAPI.sendWeeklyChallengeUpdate) {
      await notificationAPI.sendWeeklyChallengeUpdate({
        id: 'demo-challenge-' + Date.now(),
        title: 'Complete 10 trips this week',
        progress: 80,
        target: 10,
        current: 8
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Push Notification Demo
          </h1>
          <p className="text-blue-100 mt-1">
            Test the push notification system for Traveal
          </p>
        </div>

        <div className="p-6">
          {/* Status Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Status</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Browser Support:</span>
                  <span className={`font-medium ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
                    {isSupported ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Permission:</span>
                  <NotificationStatusIndicator permission={permission} isSupported={isSupported} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">API Ready:</span>
                  <span className={`font-medium ${notificationAPI ? 'text-green-600' : 'text-gray-400'}`}>
                    {notificationAPI ? 'Ready' : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Section */}
          {permission !== 'granted' && (
            <div className="mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800">Enable Push Notifications</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      To receive trip reminders, achievement notifications, and challenge updates, 
                      please enable push notifications.
                    </p>
                    {isSupported && (
                      <button
                        onClick={() => notificationAPI?.requestPermission()}
                        className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                      >
                        Enable Notifications
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Section */}
          {permission === 'granted' && notificationAPI && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Notifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Trip Validation Demo */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Trip Validation</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    Reminds users to validate their completed trips
                  </p>
                  <button
                    onClick={sendDemoTripValidation}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Send Trip Reminder
                  </button>
                </div>

                {/* Achievement Demo */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-medium text-gray-900">Achievement</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    Celebrates user achievements and milestones
                  </p>
                  <button
                    onClick={sendDemoAchievement}
                    className="w-full bg-yellow-600 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Send Achievement
                  </button>
                </div>

                {/* Challenge Demo */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Weekly Challenge</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    Updates on weekly challenge progress
                  </p>
                  <button
                    onClick={sendDemoChallenge}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                  >
                    Send Challenge Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">How to Use</h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Enable push notifications when prompted</li>
              <li>2. Click the demo buttons above to test different notification types</li>
              <li>3. Notifications will appear in your browser/device notification center</li>
              <li>4. Click on notifications to see how they navigate to different parts of the app</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Include the PushNotificationComponent */}
      <PushNotificationComponent
        isEnabled={true}
        debugMode={true}
        onNotificationClick={handleNotificationClick}
        onPermissionRequest={handlePermissionRequest}
      />
    </div>
  )
}

export default NotificationDemo