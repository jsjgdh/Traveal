import React, { useState, useEffect } from 'react'
import { MapPin, MapPinOff, Navigation, AlertCircle, Settings, ExternalLink, CheckCircle } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function LocationStatusIndicator() {
  const { addNotification, updateSystemStatus } = useNotifications()
  const [locationStatus, setLocationStatus] = useState('unknown')
  const [accuracy, setAccuracy] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  useEffect(() => {
    checkLocationPermission()
    startLocationTracking()
  }, [])

  const checkLocationPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        
        permission.onchange = () => {
          handlePermissionChange(permission.state)
        }
        
        handlePermissionChange(permission.state)
      } catch (error) {
        console.warn('Permission API not supported')
        // Fallback to trying geolocation directly
        tryGeolocation()
      }
    } else {
      tryGeolocation()
    }
  }

  const handlePermissionChange = (state) => {
    switch (state) {
      case 'granted':
        setLocationStatus('enabled')
        setPermissionDenied(false)
        startLocationTracking()
        updateSystemStatus({ locationEnabled: true })
        break
      case 'denied':
        setLocationStatus('disabled')
        setPermissionDenied(true)
        setIsTracking(false)
        updateSystemStatus({ locationEnabled: false })
        
        addNotification({
          type: NOTIFICATION_TYPES.LOCATION_UPDATE,
          priority: NOTIFICATION_PRIORITY.HIGH,
          title: 'Location Access Denied',
          message: 'Trip detection requires location access. Please enable it in settings.',
          actionText: 'Enable Location',
          showBanner: true,
          onAction: () => setShowLocationModal(true)
        })
        break
      case 'prompt':
        setLocationStatus('prompt')
        break
      default:
        setLocationStatus('unknown')
    }
  }

  const tryGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus('enabled')
          setAccuracy(position.coords.accuracy)
          setLastUpdate(new Date())
          updateSystemStatus({ locationEnabled: true })
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationStatus('disabled')
              setPermissionDenied(true)
              updateSystemStatus({ locationEnabled: false })
              break
            case error.POSITION_UNAVAILABLE:
              setLocationStatus('unavailable')
              break
            case error.TIMEOUT:
              setLocationStatus('timeout')
              break
            default:
              setLocationStatus('error')
              break
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      setLocationStatus('unsupported')
    }
  }

  const startLocationTracking = () => {
    if ('geolocation' in navigator && locationStatus === 'enabled') {
      setIsTracking(true)
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setAccuracy(position.coords.accuracy)
          setLastUpdate(new Date())
          setLocationStatus('enabled')
          
          // Check accuracy and notify if poor
          if (position.coords.accuracy > 100) {
            addNotification({
              type: NOTIFICATION_TYPES.LOCATION_UPDATE,
              priority: NOTIFICATION_PRIORITY.LOW,
              title: 'Location Accuracy Warning',
              message: 'GPS accuracy is low. Trip detection may be affected.',
              showBanner: false
            })
          }
        },
        (error) => {
          setIsTracking(false)
          handleLocationError(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000
        }
      )

      // Store watch ID to clear later
      return () => {
        navigator.geolocation.clearWatch(watchId)
        setIsTracking(false)
      }
    }
  }

  const handleLocationError = (error) => {
    let message = 'Location tracking error occurred'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access was denied'
        setPermissionDenied(true)
        break
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable'
        break
      case error.TIMEOUT:
        message = 'Location request timed out'
        break
    }

    addNotification({
      type: NOTIFICATION_TYPES.LOCATION_UPDATE,
      priority: NOTIFICATION_PRIORITY.MEDIUM,
      title: 'Location Error',
      message,
      showBanner: false
    })
  }

  const requestLocationPermission = () => {
    setShowLocationModal(false)
    tryGeolocation()
  }

  const openLocationSettings = () => {
    // Guide users to location settings
    if ('androidBridge' in window) {
      window.androidBridge.openLocationSettings()
    } else {
      alert('Please enable location access in your browser settings for this site.')
    }
  }

  const getLocationIcon = () => {
    switch (locationStatus) {
      case 'enabled':
        return isTracking ? 
          <Navigation size={16} className="text-green-600 animate-pulse" /> :
          <MapPin size={16} className="text-green-600" />
      case 'disabled':
        return <MapPinOff size={16} className="text-red-600" />
      case 'prompt':
        return <MapPin size={16} className="text-yellow-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (locationStatus) {
      case 'enabled':
        return isTracking ? 'Tracking' : 'Enabled'
      case 'disabled':
        return 'Disabled'
      case 'prompt':
        return 'Permission needed'
      case 'unavailable':
        return 'Unavailable'
      case 'timeout':
        return 'Timeout'
      case 'unsupported':
        return 'Not supported'
      default:
        return 'Unknown'
    }
  }

  const getAccuracyColor = () => {
    if (!accuracy) return 'text-gray-600'
    if (accuracy <= 10) return 'text-green-600'
    if (accuracy <= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyText = () => {
    if (!accuracy) return 'Unknown'
    if (accuracy <= 10) return 'Excellent'
    if (accuracy <= 50) return 'Good'
    if (accuracy <= 100) return 'Fair'
    return 'Poor'
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getLocationIcon()}
            <span className="text-sm font-medium text-gray-900">
              Location
            </span>
          </div>
          
          {permissionDenied && (
            <button
              onClick={() => setShowLocationModal(true)}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Enable
            </button>
          )}
        </div>
        
        <div className="text-xs text-gray-600 mb-2">
          Status: <span className={`font-medium ${
            locationStatus === 'enabled' ? 'text-green-600' :
            locationStatus === 'disabled' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {getStatusText()}
          </span>
        </div>

        {locationStatus === 'enabled' && (
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <div className="font-medium">Accuracy</div>
              <div className={getAccuracyColor()}>
                {accuracy ? `±${Math.round(accuracy)}m` : 'Unknown'}
              </div>
              <div className="text-xs text-gray-500">
                {getAccuracyText()}
              </div>
            </div>
            <div>
              <div className="font-medium">Last Update</div>
              <div>
                {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        )}

        {locationStatus === 'disabled' && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
            <div className="text-red-700">
              Location access is required for automatic trip detection
            </div>
          </div>
        )}
      </div>

      {/* Location Permission Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-bounce">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Enable Location Access
                  </h2>
                  <p className="text-sm text-gray-600">
                    Required for automatic trip detection
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Why we need location access:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Automatically detect when you start a trip</li>
                  <li>• Calculate accurate distance and duration</li>
                  <li>• Determine transportation mode</li>
                  <li>• Provide better analytics and insights</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-medium text-green-900">Privacy Protected</span>
                </div>
                <p className="text-sm text-green-800">
                  Your location data is processed locally and only used for trip analysis. 
                  We never share your exact location with third parties.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={requestLocationPermission}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <MapPin size={16} />
                <span>Allow Location Access</span>
              </button>
              
              <button
                onClick={openLocationSettings}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Settings size={16} />
                <span>Open Settings</span>
                <ExternalLink size={14} />
              </button>
              
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LocationStatusIndicator