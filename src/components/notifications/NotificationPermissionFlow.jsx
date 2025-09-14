import React, { useState, useEffect } from 'react'
import { Bell, BellOff, CheckCircle, X, AlertCircle, Settings, Smartphone, Globe } from 'lucide-react'
import { useNotifications } from './NotificationProvider'

function NotificationPermissionFlow({ onComplete, autoShow = false }) {
  const { requestPermission, isPermissionGranted, updatePreferences } = useNotifications()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState('default')
  const [selectedNotificationTypes, setSelectedNotificationTypes] = useState({
    tripValidation: true,
    achievements: true,
    challenges: true,
    systemAlerts: false
  })

  const steps = [
    {
      id: 'intro',
      title: 'Stay in the Loop',
      icon: <Bell size={48} className="text-blue-500 mx-auto mb-4" />,
      content: (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Enable Notifications
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Get timely reminders to validate your trips, celebrate achievements, and stay updated with challenges to maximize your rewards.
          </p>
          
          <div className="space-y-3 mt-6">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell size={16} className="text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Trip Reminders</div>
                <div className="text-sm text-gray-600">Validate trips within 30 minutes</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Achievement Alerts</div>
                <div className="text-sm text-gray-600">Celebrate your milestones</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings size={16} className="text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">System Updates</div>
                <div className="text-sm text-gray-600">Important app notifications</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'customize',
      title: 'Customize Your Notifications',
      icon: <Settings size={48} className="text-purple-500 mx-auto mb-4" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            Choose What Matters to You
          </h2>
          <p className="text-gray-600 text-center">
            Select the types of notifications you'd like to receive. You can always change these later in settings.
          </p>
          
          <div className="space-y-3">
            {Object.entries({
              tripValidation: {
                title: 'Trip Validation Reminders',
                description: 'Get notified when trips need validation',
                icon: '🚗',
                priority: 'High Priority',
                recommended: true
              },
              achievements: {
                title: 'Achievement Notifications',
                description: 'Celebrate when you unlock new achievements',
                icon: '🏆',
                priority: 'Medium Priority',
                recommended: true
              },
              challenges: {
                title: 'Challenge Updates',
                description: 'Progress updates and new challenges',
                icon: '🎯',
                priority: 'Low Priority',
                recommended: true
              },
              systemAlerts: {
                title: 'System Alerts',
                description: 'Important app updates and maintenance',
                icon: '⚙️',
                priority: 'Critical Only',
                recommended: false
              }
            }).map(([key, config]) => (
              <div
                key={key}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                  selectedNotificationTypes[key]
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setSelectedNotificationTypes(prev => ({
                  ...prev,
                  [key]: !prev[key]
                }))}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{config.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{config.title}</h3>
                      {config.recommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{config.priority}</span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedNotificationTypes[key]
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedNotificationTypes[key] && (
                          <CheckCircle size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'permission',
      title: 'Enable Browser Notifications',
      icon: <Smartphone size={48} className="text-green-500 mx-auto mb-4" />,
      content: (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Almost There!
          </h2>
          <p className="text-gray-600">
            To receive notifications, we need your browser's permission. This ensures you never miss important updates about your trips and rewards.
          </p>
          
          {permissionStatus === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle size={20} className="text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-700">
                Notifications were blocked. You can enable them manually in your browser settings by clicking the lock icon in the address bar.
              </p>
            </div>
          )}
          
          {permissionStatus === 'default' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Bell size={20} className="text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700">
                Your browser will ask for permission to send notifications. Please click "Allow" to continue.
              </p>
            </div>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {Object.entries(selectedNotificationTypes).filter(([_, enabled]) => enabled).map(([key, _]) => (
                <li key={key} className="flex items-center space-x-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>
                    {key === 'tripValidation' ? 'Trip validation reminders' :
                     key === 'achievements' ? 'Achievement celebrations' :
                     key === 'challenges' ? 'Challenge progress updates' :
                     'System alerts and updates'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
    if (autoShow) {
      setIsVisible(true)
    }
  }, [autoShow])

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Last step - request permission
      const granted = await requestPermission()
      setPermissionStatus(granted ? 'granted' : 'denied')
      
      if (granted) {
        // Update preferences based on selections
        updatePreferences(selectedNotificationTypes)
        handleComplete()
      }
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    updatePreferences({ enablePush: false, enableInApp: true })
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => onComplete?.(), 300)
  }

  const handleManualSetup = () => {
    // Guide user to manually enable notifications
    window.open('https://support.google.com/chrome/answer/3220216', '_blank')
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-bounce">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentStep ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <button
              onClick={handleComplete}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          
          {currentStepData.icon}
        </div>

        {/* Content */}
        <div className="p-6 pt-0">
          {currentStepData.content}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          {currentStep === steps.length - 1 ? (
            <div className="space-y-3">
              {permissionStatus === 'default' && (
                <button
                  onClick={handleNext}
                  className="w-full btn-primary"
                >
                  Enable Notifications
                </button>
              )}
              
              {permissionStatus === 'denied' && (
                <button
                  onClick={handleManualSetup}
                  className="w-full btn-primary"
                >
                  Open Browser Settings
                </button>
              )}
              
              {permissionStatus === 'granted' && (
                <button
                  onClick={handleComplete}
                  className="w-full btn-primary"
                >
                  ✅ Notifications Enabled
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="w-full btn-primary"
            >
              {currentStep === 0 ? 'Get Started' : 'Continue'}
            </button>
          )}
          
          <button
            onClick={handleSkip}
            className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            {currentStep === steps.length - 1 ? 'Skip for now' : 'Maybe later'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationPermissionFlow