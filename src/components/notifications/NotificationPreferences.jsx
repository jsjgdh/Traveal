import React, { useState } from 'react'
import { Bell, BellOff, Clock, Volume2, VolumeX, Vibrate, Smartphone, Moon, Settings, Save, RotateCcw, X } from 'lucide-react'
import { useNotifications } from './NotificationProvider'

function NotificationPreferences({ onClose }) {
  const { preferences, updatePreferences, isPermissionGranted, requestPermission } = useNotifications()
  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [hasChanges, setHasChanges] = useState(false)

  const handlePreferenceChange = (key, value) => {
    setLocalPreferences(prev => {
      const newPrefs = { ...prev, [key]: value }
      setHasChanges(JSON.stringify(newPrefs) !== JSON.stringify(preferences))
      return newPrefs
    })
  }

  const handleQuietHoursChange = (key, value) => {
    setLocalPreferences(prev => {
      const newPrefs = {
        ...prev,
        quietHours: { ...prev.quietHours, [key]: value }
      }
      setHasChanges(JSON.stringify(newPrefs) !== JSON.stringify(preferences))
      return newPrefs
    })
  }

  const handleSave = () => {
    updatePreferences(localPreferences)
    setHasChanges(false)
    onClose?.()
  }

  const handleReset = () => {
    setLocalPreferences(preferences)
    setHasChanges(false)
  }

  const toggleSwitch = (key, value) => (
    <div
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors cursor-pointer ${
        value ? 'bg-primary-600' : 'bg-gray-300'
      }`}
      onClick={() => handlePreferenceChange(key, !value)}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell size={24} className="text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Notification Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Browser Permission Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Browser Notifications</h3>
            
            <div className={`p-4 rounded-lg border ${
              isPermissionGranted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center space-x-3">
                {isPermissionGranted ? (
                  <Bell size={20} className="text-green-600" />
                ) : (
                  <BellOff size={20} className="text-orange-600" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${
                    isPermissionGranted ? 'text-green-900' : 'text-orange-900'
                  }`}>
                    {isPermissionGranted ? 'Notifications Enabled' : 'Notifications Disabled'}
                  </div>
                  <div className={`text-sm ${
                    isPermissionGranted ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {isPermissionGranted 
                      ? 'You\'ll receive push notifications' 
                      : 'Browser notifications are blocked'
                    }
                  </div>
                </div>
                {!isPermissionGranted && (
                  <button
                    onClick={requestPermission}
                    className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-600">Receive browser notifications</div>
                </div>
                {toggleSwitch('enablePush', localPreferences.enablePush)}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">In-App Notifications</div>
                  <div className="text-sm text-gray-600">Show notifications within the app</div>
                </div>
                {toggleSwitch('enableInApp', localPreferences.enableInApp)}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Sound</div>
                  <div className="text-sm text-gray-600">Play sound for notifications</div>
                </div>
                {toggleSwitch('soundEnabled', localPreferences.soundEnabled)}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Vibration</div>
                  <div className="text-sm text-gray-600">Vibrate device for notifications</div>
                </div>
                {toggleSwitch('vibrationEnabled', localPreferences.vibrationEnabled)}
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Notification Types</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    🚗
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Trip Validation</div>
                    <div className="text-sm text-gray-600">Reminders to validate detected trips</div>
                  </div>
                </div>
                {toggleSwitch('tripValidation', localPreferences.tripValidation)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Achievements</div>
                    <div className="text-sm text-gray-600">Celebrate unlocked achievements</div>
                  </div>
                </div>
                {toggleSwitch('achievements', localPreferences.achievements)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    🎯
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Challenges</div>
                    <div className="text-sm text-gray-600">Progress updates and new challenges</div>
                  </div>
                </div>
                {toggleSwitch('challenges', localPreferences.challenges)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    ⚙️
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">System Alerts</div>
                    <div className="text-sm text-gray-600">Important app updates and issues</div>
                  </div>
                </div>
                {toggleSwitch('systemAlerts', localPreferences.systemAlerts)}
              </div>
            </div>
          </div>

          {/* Do Not Disturb */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Moon size={20} />
              <span>Do Not Disturb</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Do Not Disturb Mode</div>
                  <div className="text-sm text-gray-600">
                    {localPreferences.doNotDisturb ? 'All notifications disabled' : 'Notifications enabled'}
                  </div>
                </div>
                {toggleSwitch('doNotDisturb', localPreferences.doNotDisturb)}
              </div>

              {/* Quiet Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Quiet Hours</div>
                    <div className="text-sm text-gray-600">Disable notifications during specific hours</div>
                  </div>
                  <div
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors cursor-pointer ${
                      localPreferences.quietHours.enabled ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                    onClick={() => handleQuietHoursChange('enabled', !localPreferences.quietHours.enabled)}
                  >
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        localPreferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </div>
                </div>

                {localPreferences.quietHours.enabled && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-slide-down">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={localPreferences.quietHours.start}
                          onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={localPreferences.quietHours.end}
                          onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                      <Clock size={12} />
                      <span>
                        Notifications will be silenced from {localPreferences.quietHours.start} to {localPreferences.quietHours.end}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 space-y-3">
          {hasChanges && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-700">
                You have unsaved changes
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
            
            <button
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationPreferences