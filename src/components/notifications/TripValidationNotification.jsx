import React, { useState, useEffect } from 'react'
import { MapPin, Clock, Car, Bus, Bike, PersonStanding, Users, AlertCircle, Check, X } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function TripValidationNotification({ trip, onValidate, onDismiss }) {
  const { addNotification, updateSystemStatus } = useNotifications()
  const [timeLeft, setTimeLeft] = useState(null)
  const [isExpanding, setIsExpanding] = useState(false)

  // Calculate time left for validation
  useEffect(() => {
    if (trip?.detectedAt) {
      const detectedTime = new Date(trip.detectedAt)
      const validationWindow = 30 * 60 * 1000 // 30 minutes in milliseconds
      
      const updateTimeLeft = () => {
        const now = new Date()
        const elapsed = now - detectedTime
        const remaining = validationWindow - elapsed
        
        if (remaining <= 0) {
          setTimeLeft(null)
          handleAutoExpire()
        } else {
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
      }
      
      updateTimeLeft()
      const interval = setInterval(updateTimeLeft, 1000)
      
      return () => clearInterval(interval)
    }
  }, [trip?.detectedAt])

  // Send push notification for trip validation
  useEffect(() => {
    if (trip) {
      addNotification({
        type: NOTIFICATION_TYPES.TRIP_VALIDATION,
        priority: NOTIFICATION_PRIORITY.HIGH,
        title: 'Trip Detected',
        message: `Please validate your trip from ${trip.origin} to ${trip.destination}`,
        actionText: 'Validate Now',
        showBanner: true,
        onAction: () => setIsExpanding(true),
        data: { tripId: trip.id }
      })
    }
  }, [trip, addNotification])

  const handleAutoExpire = () => {
    addNotification({
      type: NOTIFICATION_TYPES.TRIP_VALIDATION,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      title: 'Trip Validation Expired',
      message: 'The validation window has closed. Trip recorded with detected details.',
      data: { tripId: trip.id, autoValidated: true }
    })
    onDismiss?.()
  }

  const handleValidation = (purpose, companions = 0) => {
    const validatedTrip = {
      ...trip,
      purpose,
      companions,
      validatedAt: new Date().toISOString(),
      validated: true
    }
    
    onValidate?.(validatedTrip)
    
    // Add success notification
    addNotification({
      type: NOTIFICATION_TYPES.TRIP_VALIDATION,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      title: 'Trip Validated Successfully',
      message: `${trip.origin} to ${trip.destination} validated for ${purpose}`,
      data: { tripId: trip.id, validated: true }
    })
    
    // Update system status
    updateSystemStatus({ 
      lastValidation: new Date().toISOString(),
      pendingValidations: 0 
    })
  }

  const getTransportIcon = (mode) => {
    const iconProps = { size: 20, className: "text-primary-600" }
    
    switch (mode?.toLowerCase()) {
      case 'car':
        return <Car {...iconProps} />
      case 'bus':
        return <Bus {...iconProps} />
      case 'bike':
      case 'bicycle':
        return <Bike {...iconProps} />
      case 'walking':
      case 'walk':
        return <PersonStanding {...iconProps} />
      default:
        return <Car {...iconProps} />
    }
  }

  if (!trip) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
      <div className="bg-white border-t border-gray-200 shadow-2xl max-w-sm mx-auto">
        {/* Quick validation header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {getTransportIcon(trip.mode)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Trip Detected</h3>
                {timeLeft && (
                  <p className="text-sm text-orange-600 font-medium animate-pulse">
                    ⏰ {timeLeft} to validate
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Trip details */}
        <div className="p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <div className="font-medium text-gray-900 truncate">{trip.origin}</div>
                <div className="text-gray-500 my-1">↓</div>
                <div className="font-medium text-gray-900 truncate">{trip.destination}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{new Date(trip.startTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>{trip.distance || 'Unknown'} km</span>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {['Work', 'School', 'Shopping', 'Other'].map((purpose) => (
              <button
                key={purpose}
                onClick={() => handleValidation(purpose)}
                className="py-2 px-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors quick-action-btn"
              >
                {purpose}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setIsExpanding(!isExpanding)}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {isExpanding ? 'Less options' : 'More options'}
          </button>
        </div>

        {/* Expanded validation form */}
        {isExpanding && (
          <div className="border-t border-gray-100 p-4 space-y-4 animate-slide-down">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip Purpose
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'work', label: 'Work', icon: '💼' },
                  { key: 'school', label: 'School', icon: '🎓' },
                  { key: 'shopping', label: 'Shopping', icon: '🛒' },
                  { key: 'leisure', label: 'Leisure', icon: '🎯' },
                  { key: 'medical', label: 'Medical', icon: '🏥' },
                  { key: 'other', label: 'Other', icon: '📍' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => handleValidation(label)}
                    className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <span>{icon}</span>
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Companions
              </label>
              <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <button className="p-2 bg-white rounded-lg border hover:bg-gray-50">
                  <Users size={16} className="text-gray-600" />
                </button>
                <span className="text-lg font-medium">0</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleValidation('Other', num)}
                      className="w-8 h-8 rounded-lg border bg-white hover:bg-primary-50 hover:border-primary-300 text-sm transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleValidation('Work', 0)}
              className="w-full btn-primary"
            >
              <Check size={16} className="mr-2" />
              Confirm Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TripValidationNotification