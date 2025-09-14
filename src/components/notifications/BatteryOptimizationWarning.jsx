import React, { useState, useEffect } from 'react'
import { Battery, BatteryLow, AlertTriangle, X, ExternalLink, Settings, Smartphone } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function BatteryOptimizationWarning() {
  const { addNotification, updateSystemStatus } = useNotifications()
  const [batteryInfo, setBatteryInfo] = useState({
    level: 1,
    charging: false,
    dischargingTime: Infinity
  })
  const [isOptimized, setIsOptimized] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [hasShownWarning, setHasShownWarning] = useState(false)

  // Get battery information if available
  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        setBatteryInfo({
          level: battery.level,
          charging: battery.charging,
          dischargingTime: battery.dischargingTime
        })

        // Listen for battery events
        battery.addEventListener('chargingchange', () => {
          setBatteryInfo(prev => ({ ...prev, charging: battery.charging }))
        })

        battery.addEventListener('levelchange', () => {
          setBatteryInfo(prev => ({ ...prev, level: battery.level }))
        })
      })
    } else {
      // Simulate battery info for demo
      setBatteryInfo({
        level: 0.75,
        charging: false,
        dischargingTime: 14400 // 4 hours
      })
    }
  }, [])

  // Check for battery optimization issues
  useEffect(() => {
    // Simulate battery optimization detection
    const checkOptimization = () => {
      // In a real app, this would check actual battery optimization settings
      const isAppOptimized = Math.random() < 0.3 // 30% chance app is being optimized
      setIsOptimized(isAppOptimized)
      
      if (isAppOptimized && !hasShownWarning) {
        setShowWarning(true)
        setHasShownWarning(true)
        
        addNotification({
          type: NOTIFICATION_TYPES.BATTERY_WARNING,
          priority: NOTIFICATION_PRIORITY.HIGH,
          title: 'Battery Optimization Detected',
          message: 'Background activity may be limited. This could affect trip detection.',
          actionText: 'Fix Now',
          showBanner: true,
          onAction: () => setShowWarning(true)
        })

        updateSystemStatus({ batteryOptimized: isAppOptimized })
      }
    }

    checkOptimization()
    const interval = setInterval(checkOptimization, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [hasShownWarning, addNotification, updateSystemStatus])

  // Show low battery warning
  useEffect(() => {
    if (batteryInfo.level <= 0.15 && !batteryInfo.charging) {
      addNotification({
        type: NOTIFICATION_TYPES.BATTERY_WARNING,
        priority: NOTIFICATION_PRIORITY.MEDIUM,
        title: 'Low Battery Warning',
        message: 'Battery is low. Trip detection may be affected.',
        showBanner: false
      })
    }
  }, [batteryInfo.level, batteryInfo.charging, addNotification])

  const getBatteryIcon = () => {
    if (batteryInfo.charging) {
      return <Battery size={20} className="text-green-600" />
    } else if (batteryInfo.level <= 0.15) {
      return <BatteryLow size={20} className="text-red-600" />
    } else {
      return <Battery size={20} className="text-gray-600" />
    }
  }

  const getBatteryPercentage = () => {
    return Math.round(batteryInfo.level * 100)
  }

  const formatTime = (seconds) => {
    if (seconds === Infinity) return 'Unknown'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const handleFixOptimization = () => {
    // In a real app, this would guide users to the battery settings
    setShowWarning(false)
    
    // Simulate fixing the issue
    setTimeout(() => {
      setIsOptimized(false)
      updateSystemStatus({ batteryOptimized: false })
      
      addNotification({
        type: NOTIFICATION_TYPES.BATTERY_WARNING,
        priority: NOTIFICATION_PRIORITY.LOW,
        title: 'Battery Optimization Fixed',
        message: 'App can now run in the background normally',
        showBanner: false
      })
    }, 2000)
  }

  const openBatterySettings = () => {
    // Guide users to battery settings
    if ('androidBridge' in window) {
      // Android WebView bridge
      window.androidBridge.openBatterySettings()
    } else {
      // Web fallback - show instructions
      alert('Please go to your device Settings > Battery > App Optimization and exclude this app from battery optimization.')
    }
  }

  return (
    <>
      {/* Battery Status Indicator */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getBatteryIcon()}
            <span className="text-sm font-medium text-gray-900">
              Battery
            </span>
          </div>
          
          <span className={`text-sm font-medium ${
            batteryInfo.level <= 0.15 ? 'text-red-600' :
            batteryInfo.level <= 0.30 ? 'text-orange-600' :
            'text-gray-900'
          }`}>
            {getBatteryPercentage()}%
          </span>
        </div>
        
        {/* Battery Level Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              batteryInfo.charging ? 'bg-green-500 animate-pulse' :
              batteryInfo.level <= 0.15 ? 'bg-red-500' :
              batteryInfo.level <= 0.30 ? 'bg-orange-500' :
              'bg-gray-500'
            }`}
            style={{ width: `${getBatteryPercentage()}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <div className="font-medium">Status</div>
            <div>{batteryInfo.charging ? 'Charging' : 'Discharging'}</div>
          </div>
          <div>
            <div className="font-medium">Time Left</div>
            <div>{batteryInfo.charging ? 'Charging' : formatTime(batteryInfo.dischargingTime)}</div>
          </div>
        </div>

        {/* Optimization Warning */}
        {isOptimized && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={14} className="text-orange-600" />
              <span className="text-xs text-orange-700 font-medium">
                Battery optimization enabled
              </span>
            </div>
            <button
              onClick={() => setShowWarning(true)}
              className="text-xs text-orange-600 hover:text-orange-700 mt-1"
            >
              Fix this issue
            </button>
          </div>
        )}
      </div>

      {/* Battery Optimization Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-bounce">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Battery Optimization Warning
                    </h2>
                    <p className="text-sm text-gray-600">
                      Background activity is being limited
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarning(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">
                  What's happening?
                </h3>
                <p className="text-sm text-orange-800">
                  Your device is optimizing battery usage for this app, which may prevent:
                </p>
                <ul className="text-sm text-orange-800 mt-2 space-y-1">
                  <li>• Automatic trip detection</li>
                  <li>• Background data synchronization</li>
                  <li>• Timely notifications</li>
                  <li>• Real-time location tracking</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">
                  How to fix this:
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Go to your device <strong>Settings</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Find <strong>Battery</strong> or <strong>Power Management</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Look for <strong>App Optimization</strong> or <strong>Battery Optimization</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">4</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Find <strong>NATPAC Travel App</strong> and set it to <strong>"Don't optimize"</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 space-y-3">
              <button
                onClick={openBatterySettings}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Settings size={16} />
                <span>Open Battery Settings</span>
                <ExternalLink size={14} />
              </button>
              
              <button
                onClick={handleFixOptimization}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                I've Fixed It
              </button>
              
              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BatteryOptimizationWarning