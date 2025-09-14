import React, { useState, useEffect } from 'react'
import { X, Clock, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function NotificationBanner() {
  const { notifications, markAsRead, removeNotification } = useNotifications()
  const [currentNotification, setCurrentNotification] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Show the most recent unread high/critical priority notification
  useEffect(() => {
    const highPriorityNotifications = notifications.filter(
      n => !n.read && 
      (n.priority === NOTIFICATION_PRIORITY.HIGH || n.priority === NOTIFICATION_PRIORITY.CRITICAL) &&
      n.showBanner !== false
    )

    if (highPriorityNotifications.length > 0) {
      const newest = highPriorityNotifications[0]
      if (newest.id !== currentNotification?.id) {
        setCurrentNotification(newest)
        setIsVisible(true)
      }
    } else {
      setIsVisible(false)
      setTimeout(() => setCurrentNotification(null), 300) // Wait for animation
    }
  }, [notifications, currentNotification?.id])

  // Auto-dismiss after 5 seconds for non-critical notifications
  useEffect(() => {
    if (currentNotification && currentNotification.priority !== NOTIFICATION_PRIORITY.CRITICAL) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [currentNotification])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (currentNotification) {
        markAsRead(currentNotification.id)
      }
    }, 300)
  }

  const handleAction = () => {
    if (currentNotification?.onAction) {
      currentNotification.onAction()
    }
    handleDismiss()
  }

  const getNotificationIcon = () => {
    if (!currentNotification) return null

    const iconProps = { size: 20, className: "flex-shrink-0" }

    switch (currentNotification.type) {
      case NOTIFICATION_TYPES.TRIP_VALIDATION:
        return <Clock {...iconProps} className="text-blue-600" />
      case NOTIFICATION_TYPES.ACHIEVEMENT:
        return <CheckCircle {...iconProps} className="text-green-600" />
      case NOTIFICATION_TYPES.BATTERY_WARNING:
        return <AlertCircle {...iconProps} className="text-orange-600" />
      case NOTIFICATION_TYPES.SYSTEM_STATUS:
        return <XCircle {...iconProps} className="text-red-600" />
      default:
        return <Info {...iconProps} className="text-blue-600" />
    }
  }

  const getBannerStyle = () => {
    if (!currentNotification) return ""

    switch (currentNotification.priority) {
      case NOTIFICATION_PRIORITY.CRITICAL:
        return "bg-red-100 border-red-300 text-red-800"
      case NOTIFICATION_PRIORITY.HIGH:
        return "bg-orange-100 border-orange-300 text-orange-800"
      default:
        return "bg-blue-100 border-blue-300 text-blue-800"
    }
  }

  if (!currentNotification) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`mx-auto max-w-sm border-b-2 p-4 ${getBannerStyle()}`}>
        <div className="flex items-start space-x-3">
          {getNotificationIcon()}
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">
              {currentNotification.title}
            </h4>
            {currentNotification.message && (
              <p className="text-sm mt-1 opacity-90">
                {currentNotification.message}
              </p>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center space-x-3 mt-2">
              {currentNotification.actionText && (
                <button
                  onClick={handleAction}
                  className="text-sm font-medium hover:underline focus:outline-none"
                >
                  {currentNotification.actionText}
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="text-sm hover:underline focus:outline-none opacity-75"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress indicator for auto-dismiss */}
        {currentNotification.priority !== NOTIFICATION_PRIORITY.CRITICAL && (
          <div className="mt-3 w-full bg-black bg-opacity-20 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-current animate-[shrink_5s_linear]"
              style={{
                animation: 'shrink 5s linear forwards'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationBanner