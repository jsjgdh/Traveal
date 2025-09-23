import { useState, useEffect } from 'react'
import { Shield, MapPin, Bell, Smartphone, Battery, Wifi, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import backgroundServiceManager from '../../services/backgroundServiceManager'

function PermissionRequestFlow({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [permissions, setPermissions] = useState({
    location: 'prompt',
    notifications: 'default',
    background: 'prompt'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [support, setSupport] = useState({})
  const [batteryInfo, setBatteryInfo] = useState(null)

  useEffect(() => {
    initializePermissions()
  }, [])

  const initializePermissions = async () => {
    setIsLoading(true)
    try {
      await backgroundServiceManager.initialize()
      const currentPermissions = await backgroundServiceManager.checkPermissions()
      const supportInfo = backgroundServiceManager.checkBackgroundSupport()
      const battery = await backgroundServiceManager.getBatteryStatus()
      
      setPermissions(currentPermissions)
      setSupport(supportInfo)
      setBatteryInfo(battery)
    } catch (error) {
      console.error('Error initializing permissions:', error)
      setError('Failed to initialize permission system')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      id: 'location',
      title: 'Location Access',
      description: 'Allow the app to access your location for route monitoring and emergency detection',
      icon: MapPin,
      required: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Enable notifications for emergency alerts and safety updates',
      icon: Bell,
      required: true
    },
    {
      id: 'background',
      title: 'Background Operation',
      description: 'Allow the app to run in the background for continuous monitoring',
      icon: Smartphone,
      required: false
    }
  ]

  const handleLocationPermission = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Check if browser supports geolocation
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser')
        setIsLoading(false)
        return
      }
      
      const result = await backgroundServiceManager.requestLocationPermission()
      
      if (result.granted) {
        setPermissions(prev => ({ ...prev, location: 'granted' }))
        setCurrentStep(prev => prev + 1)
      } else if (result.state === 'denied') {
        setError('Location permission was denied. This is required for the SOS system to work properly')
      } else if (result.state === 'prompt') {
        setError('Please grant location permission when prompted by your browser')
      } else {
        setError('Location permission request failed')
      }
    } catch (error) {
      console.error('Location permission error:', error)
      setError(`Failed to request location permission: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationPermission = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        setError('Notifications are not supported by your browser')
        setIsLoading(false)
        setCurrentStep(prev => prev + 1)
        return
      }
      
      const result = await backgroundServiceManager.requestNotificationPermission()
      
      if (result.granted) {
        setPermissions(prev => ({ ...prev, notifications: 'granted' }))
        setCurrentStep(prev => prev + 1)
      } else if (result.state === 'denied') {
        setError('Notification permission was denied. You can enable it later in browser settings')
        // Allow proceeding even if notifications are denied
        setTimeout(() => {
          setCurrentStep(prev => prev + 1)
        }, 2000)
      } else if (result.state === 'prompt') {
        setError('Please grant notification permission when prompted by your browser')
        setTimeout(() => {
          setCurrentStep(prev => prev + 1)
        }, 2000)
      } else {
        setError('Notification permission request failed')
        setTimeout(() => {
          setCurrentStep(prev => prev + 1)
        }, 2000)
      }
    } catch (error) {
      console.error('Notification permission error:', error)
      setError(`Failed to request notification permission: ${error.message || 'Unknown error'}`)
      setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackgroundPermission = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Check if browser supports background operations
      if (!backgroundServiceManager.isSupported()) {
        setError('Background operations are not supported by your browser')
        setIsLoading(false)
        onComplete(backgroundServiceManager.getPermissionSummary())
        return
      }
      
      const result = await backgroundServiceManager.requestBackgroundPermission()
      
      if (result.granted) {
        setPermissions(prev => ({ ...prev, background: 'granted' }))
      } else if (result.state === 'denied') {
        setError('Background permission was denied. The app will have limited functionality')
      } else if (result.state === 'prompt') {
        setError('Please grant background permission when prompted by your browser')
      } else {
        setError('Background permission request failed')
      }
      
      // Complete the flow regardless of background permission
      onComplete(backgroundServiceManager.getPermissionSummary())
    } catch (error) {
      console.error('Background permission error:', error)
      setError(`Failed to request background permission: ${error.message || 'Unknown error'}`)
      onComplete(backgroundServiceManager.getPermissionSummary())
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepAction = () => {
    const step = steps[currentStep]
    
    switch (step.id) {
      case 'location':
        handleLocationPermission()
        break
      case 'notifications':
        handleNotificationPermission()
        break
      case 'background':
        handleBackgroundPermission()
        break
      default:
        setError('Unknown step')
    }
  }

  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(backgroundServiceManager.getPermissionSummary())
    }
  }

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'denied':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    }
  }

  const getPermissionStatus = (permission) => {
    switch (permission) {
      case 'granted':
        return { text: 'Granted', color: 'text-green-600' }
      case 'denied':
        return { text: 'Denied', color: 'text-red-600' }
      default:
        return { text: 'Not Requested', color: 'text-yellow-600' }
    }
  }

  if (isLoading && currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Safety Permissions</h1>
          <p className="text-gray-600">
            Grant permissions to enable the SOS safety features
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep + 1) / steps.length * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="card mb-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <currentStepData.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600">
              {currentStepData.description}
            </p>
          </div>

          {/* Permission Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Status:</span>
              <div className="flex items-center space-x-2">
                {getPermissionIcon(permissions[currentStepData.id])}
                <span className={getPermissionStatus(permissions[currentStepData.id]).color}>
                  {getPermissionStatus(permissions[currentStepData.id]).text}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStepAction}
              disabled={isLoading || permissions[currentStepData.id] === 'granted'}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : permissions[currentStepData.id] === 'granted' ? (
                'Permission Granted'
              ) : (
                `Grant ${currentStepData.title}`
              )}
            </button>
            
            {!currentStepData.required && (
              <button
                onClick={handleSkipStep}
                disabled={isLoading}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Skip This Step
              </button>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="space-y-3">
            {/* Support Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${support.geolocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>GPS Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${support.notifications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Notifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${support.serviceWorker ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Background Tasks</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${support.wakeLock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Wake Lock</span>
              </div>
            </div>

            {/* Battery Info */}
            {batteryInfo && !batteryInfo.error && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm">
                  <Battery className="w-4 h-4 text-gray-600" />
                  <span>Battery: {Math.round(batteryInfo.level * 100)}%</span>
                  {batteryInfo.charging && (
                    <span className="text-green-600">(Charging)</span>
                  )}
                </div>
              </div>
            )}
            
            {/* Browser Support Warning */}
            {!support.geolocation || !support.notifications || !support.serviceWorker ? (
              <div className="pt-3 border-t border-gray-200">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Browser Compatibility:</strong> Some features may not work properly in your browser. 
                    For the best experience, use the latest version of Chrome, Firefox, or Edge.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Skip All Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onSkip(backgroundServiceManager.getPermissionSummary())}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Skip all permissions (limited functionality)
          </button>
        </div>
      </div>
    </div>
  )
}

export default PermissionRequestFlow