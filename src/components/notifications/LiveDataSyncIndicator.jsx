import React, { useState, useEffect } from 'react'
import { RotateCcw, CheckCircle, AlertCircle, Clock, Wifi, Database, Upload, Download } from 'lucide-react'
import { useNotifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from './NotificationProvider'

function LiveDataSyncIndicator() {
  const { updateSystemStatus, addNotification } = useNotifications()
  const [syncStatus, setSyncStatus] = useState('idle')
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [pendingUploads, setPendingUploads] = useState(0)
  const [pendingDownloads, setPendingDownloads] = useState(0)
  const [syncProgress, setSyncProgress] = useState(0)
  const [dataStats, setDataStats] = useState({
    tripsToSync: 0,
    achievementsToSync: 0,
    preferencesToSync: 0
  })

  // Simulate sync activities
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random data changes that need syncing
      if (Math.random() < 0.3) {
        setDataStats(prev => ({
          tripsToSync: prev.tripsToSync + Math.floor(Math.random() * 2),
          achievementsToSync: prev.achievementsToSync + Math.floor(Math.random() * 1),
          preferencesToSync: prev.preferencesToSync + Math.floor(Math.random() * 1)
        }))
      }
      
      // Auto-sync every 30 seconds if there's data to sync
      const totalPending = dataStats.tripsToSync + dataStats.achievementsToSync + dataStats.preferencesToSync
      if (totalPending > 0 && syncStatus === 'idle') {
        performSync()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [dataStats, syncStatus])

  const performSync = async () => {
    setSyncStatus('syncing')
    setSyncProgress(0)
    
    const totalItems = dataStats.tripsToSync + dataStats.achievementsToSync + dataStats.preferencesToSync
    setPendingUploads(totalItems)
    
    // Simulate sync progress
    for (let i = 0; i <= totalItems; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
      setSyncProgress((i / totalItems) * 100)
      setPendingUploads(totalItems - i)
      
      // Simulate some downloads
      if (i % 3 === 0) {
        setPendingDownloads(prev => Math.max(0, prev - 1))
      }
    }
    
    // Complete sync
    setSyncStatus('success')
    setLastSyncTime(new Date())
    setDataStats({ tripsToSync: 0, achievementsToSync: 0, preferencesToSync: 0 })
    setPendingUploads(0)
    
    updateSystemStatus({ 
      lastSync: new Date().toISOString(),
      syncInProgress: false 
    })
    
    addNotification({
      type: NOTIFICATION_TYPES.SYNC_STATUS,
      priority: NOTIFICATION_PRIORITY.LOW,
      title: 'Sync Complete',
      message: `${totalItems} items synchronized successfully`,
      showBanner: false
    })
    
    // Reset to idle after showing success
    setTimeout(() => setSyncStatus('idle'), 2000)
  }

  const forceSyncNow = () => {
    if (syncStatus !== 'syncing') {
      // Add some dummy data to sync
      setDataStats(prev => ({
        tripsToSync: prev.tripsToSync + 1,
        achievementsToSync: prev.achievementsToSync + 1,
        preferencesToSync: prev.preferencesToSync + 1
      }))
      performSync()
    }
  }

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RotateCcw size={16} className="text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return <Database size={16} className="text-gray-500" />
    }
  }

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return `Syncing... ${Math.round(syncProgress)}%`
      case 'success':
        return 'Sync complete'
      case 'error':
        return 'Sync failed'
      default: {
        const totalPending = dataStats.tripsToSync + dataStats.achievementsToSync + dataStats.preferencesToSync
        return totalPending > 0 ? `${totalPending} items pending` : 'Up to date'
      }
    }
  }

  const totalPending = dataStats.tripsToSync + dataStats.achievementsToSync + dataStats.preferencesToSync

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getSyncIcon()}
          <span className="text-sm font-medium text-gray-900">
            Data Sync
          </span>
        </div>
        
        <button
          onClick={forceSyncNow}
          disabled={syncStatus === 'syncing'}
          className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 transition-colors"
        >
          Sync Now
        </button>
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        {getSyncStatusText()}
      </div>
      
      {/* Sync Progress Bar */}
      {syncStatus === 'syncing' && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Data Breakdown */}
      {totalPending > 0 && syncStatus !== 'syncing' && (
        <div className="space-y-1">
          {dataStats.tripsToSync > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Trips</span>
              <span className="text-orange-600 font-medium">{dataStats.tripsToSync}</span>
            </div>
          )}
          {dataStats.achievementsToSync > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Achievements</span>
              <span className="text-green-600 font-medium">{dataStats.achievementsToSync}</span>
            </div>
          )}
          {dataStats.preferencesToSync > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Preferences</span>
              <span className="text-blue-600 font-medium">{dataStats.preferencesToSync}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Transfer Indicators */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          {pendingUploads > 0 && (
            <div className="flex items-center space-x-1">
              <Upload size={10} className="text-blue-500" />
              <span className="text-xs text-blue-600">{pendingUploads}</span>
            </div>
          )}
          
          {pendingDownloads > 0 && (
            <div className="flex items-center space-x-1">
              <Download size={10} className="text-green-500" />
              <span className="text-xs text-green-600">{pendingDownloads}</span>
            </div>
          )}
        </div>
        
        {lastSyncTime && (
          <span className="text-xs text-gray-500">
            {lastSyncTime.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {/* Sync Status Indicators */}
      <div className="flex items-center space-x-2 mt-2">
        <div className={`w-2 h-2 rounded-full ${
          syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' :
          syncStatus === 'success' ? 'bg-green-500' :
          syncStatus === 'error' ? 'bg-red-500' :
          totalPending > 0 ? 'bg-orange-500' : 'bg-gray-300'
        }`} />
        <span className="text-xs text-gray-500">
          {syncStatus === 'syncing' ? 'Synchronizing' :
           syncStatus === 'success' ? 'All data synchronized' :
           syncStatus === 'error' ? 'Sync error occurred' :
           totalPending > 0 ? 'Changes pending sync' : 'All changes saved'}
        </span>
      </div>
    </div>
  )
}

export default LiveDataSyncIndicator