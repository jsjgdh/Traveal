import React, { useState, useEffect } from 'react'
import { Activity, Wifi, WifiOff, Circle, AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react'
import { useNotifications } from './NotificationProvider'
import WebSocketIndicator from './WebSocketIndicator'
import LiveDataSyncIndicator from './LiveDataSyncIndicator'
import BatteryOptimizationWarning from './BatteryOptimizationWarning'
import LocationStatusIndicator from './LocationStatusIndicator'

function SystemStatusMonitor({ compact = false }) {
  const { systemStatus, updateSystemStatus } = useNotifications()
  const [backgroundActivity, setBackgroundActivity] = useState({
    isActive: false,
    lastActivity: null,
    activityCount: 0
  })
  const [connectionStatus, setConnectionStatus] = useState('online')
  const [showAllIndicators, setShowAllIndicators] = useState(!compact)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online')
      updateSystemStatus({ isOnline: true })
    }

    const handleOffline = () => {
      setConnectionStatus('offline')
      updateSystemStatus({ isOnline: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set initial status
    setConnectionStatus(navigator.onLine ? 'online' : 'offline')
    updateSystemStatus({ isOnline: navigator.onLine })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateSystemStatus])

  // Simulate background activity monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random background activities
      if (Math.random() < 0.3) {
        setBackgroundActivity(prev => ({
          isActive: true,
          lastActivity: new Date(),
          activityCount: prev.activityCount + 1
        }))
        
        updateSystemStatus({ backgroundAppActive: true })
        
        // Reset activity status after 2 seconds
        setTimeout(() => {
          setBackgroundActivity(prev => ({ ...prev, isActive: false }))
          updateSystemStatus({ backgroundAppActive: false })
        }, 2000)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [updateSystemStatus])

  // Check if any systems have issues
  const hasIssues = () => {
    return (
      !systemStatus.isOnline ||
      !systemStatus.locationEnabled ||
      systemStatus.batteryOptimized ||
      !systemStatus.wsConnected
    )
  }

  const getOverallStatus = () => {
    if (!systemStatus.isOnline) return { status: 'offline', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (!systemStatus.wsConnected) return { status: 'degraded', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    if (!systemStatus.locationEnabled || systemStatus.batteryOptimized) {
      return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    }
    return { status: 'healthy', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  const overall = getOverallStatus()

  const getStatusIcon = () => {
    switch (overall.status) {
      case 'healthy':
        return <CheckCircle size={16} className={overall.color} />
      case 'warning':
        return <AlertTriangle size={16} className={overall.color} />
      case 'degraded':
      case 'offline':
        return <Circle size={16} className={overall.color} />
      default:
        return <Activity size={16} className="text-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (overall.status) {
      case 'healthy':
        return 'All systems operational'
      case 'warning':
        return 'Some features may be affected'
      case 'degraded':
        return 'Limited functionality'
      case 'offline':
        return 'No internet connection'
      default:
        return 'Checking status...'
    }
  }

  const refreshStatus = () => {
    // Trigger a status refresh
    updateSystemStatus({
      isOnline: navigator.onLine,
      lastSync: new Date().toISOString()
    })
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-900">
              System Status
            </span>
          </div>
          
          <button
            onClick={() => setShowAllIndicators(!showAllIndicators)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showAllIndicators ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        <div className="text-xs text-gray-600 mt-1">
          {getStatusText()}
        </div>

        {hasIssues() && (
          <div className="mt-2 flex space-x-1">
            {!systemStatus.isOnline && (
              <span className="w-2 h-2 bg-red-500 rounded-full" title="Offline" />
            )}
            {!systemStatus.locationEnabled && (
              <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Location disabled" />
            )}
            {systemStatus.batteryOptimized && (
              <span className="w-2 h-2 bg-orange-500 rounded-full" title="Battery optimized" />
            )}
            {!systemStatus.wsConnected && (
              <span className="w-2 h-2 bg-blue-500 rounded-full" title="Connection issue" />
            )}
          </div>
        )}

        {showAllIndicators && (
          <div className="mt-3 space-y-3 animate-slide-down">
            <LocationStatusIndicator />
            <BatteryOptimizationWarning />
            <WebSocketIndicator />
            <LiveDataSyncIndicator />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Status Header */}
      <div className={`rounded-lg border p-4 ${overall.bgColor} border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-medium text-gray-900">System Status</h3>
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>
          
          <button
            onClick={refreshStatus}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <RefreshCw size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-700">
              {systemStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.wsConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-700">
              {systemStatus.wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.locationEnabled ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-700">
              {systemStatus.locationEnabled ? 'Location' : 'No Location'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              backgroundActivity.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-700">
              Background Activity
            </span>
          </div>
        </div>

        {/* Background Activity Details */}
        {backgroundActivity.activityCount > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            <div>Activities today: {backgroundActivity.activityCount}</div>
            {backgroundActivity.lastActivity && (
              <div>
                Last activity: {backgroundActivity.lastActivity.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Status Components */}
      <div className="grid gap-4">
        <LocationStatusIndicator />
        <BatteryOptimizationWarning />
        <WebSocketIndicator />
        <LiveDataSyncIndicator />
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {systemStatus.isOnline ? (
              <Wifi size={16} className="text-green-600" />
            ) : (
              <WifiOff size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-900">
              Internet Connection
            </span>
          </div>
          
          <span className={`text-sm font-medium ${
            systemStatus.isOnline ? 'text-green-600' : 'text-red-600'
          }`}>
            {systemStatus.isOnline ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="text-xs text-gray-600">
          {systemStatus.isOnline ? (
            'All features are available'
          ) : (
            'Some features may not work offline'
          )}
        </div>
      </div>
    </div>
  )
}

export default SystemStatusMonitor