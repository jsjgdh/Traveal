import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Notification types
export const NOTIFICATION_TYPES = {
  TRIP_VALIDATION: 'trip_validation',
  ACHIEVEMENT: 'achievement',
  CHALLENGE: 'challenge',
  SYSTEM_STATUS: 'system_status',
  BATTERY_WARNING: 'battery_warning',
  LOCATION_UPDATE: 'location_update',
  SYNC_STATUS: 'sync_status',
  GENERAL: 'general'
}

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isPermissionGranted: false,
  preferences: {
    enablePush: true,
    enableInApp: true,
    tripValidation: true,
    achievements: true,
    challenges: true,
    systemAlerts: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    doNotDisturb: false,
    soundEnabled: true,
    vibrationEnabled: true
  },
  systemStatus: {
    isOnline: true,
    locationEnabled: false,
    batteryOptimized: true,
    backgroundAppActive: false,
    wsConnected: false,
    lastSync: null
  }
}

// Action types
const ACTION_TYPES = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  SET_PERMISSION: 'SET_PERMISSION',
  UPDATE_SYSTEM_STATUS: 'UPDATE_SYSTEM_STATUS',
  MARK_ALL_READ: 'MARK_ALL_READ'
}

// Reducer function
function notificationReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD_NOTIFICATION: {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload
      }
      return {
        ...state,
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }
    }
    
    case ACTION_TYPES.MARK_AS_READ: {
      const updatedNotifications = state.notifications.map(notif =>
        notif.id === action.payload.id ? { ...notif, read: true } : notif
      )
      const unreadCount = updatedNotifications.filter(n => !n.read).length
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount
      }
    }
    
    case ACTION_TYPES.MARK_ALL_READ: {
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      }
    }
    
    case ACTION_TYPES.REMOVE_NOTIFICATION: {
      const filteredNotifications = state.notifications.filter(notif => notif.id !== action.payload.id)
      const unreadCount = filteredNotifications.filter(n => !n.read).length
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount
      }
    }
    
    case ACTION_TYPES.CLEAR_ALL: {
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      }
    }
    
    case ACTION_TYPES.UPDATE_PREFERENCES: {
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      }
    }
    
    case ACTION_TYPES.SET_PERMISSION: {
      return {
        ...state,
        isPermissionGranted: action.payload
      }
    }
    
    case ACTION_TYPES.UPDATE_SYSTEM_STATUS: {
      return {
        ...state,
        systemStatus: { ...state.systemStatus, ...action.payload }
      }
    }
    
    default:
      return state
  }
}

// Create context
const NotificationContext = createContext()

// Provider component
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('natpac_notification_preferences')
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences)
        dispatch({ type: ACTION_TYPES.UPDATE_PREFERENCES, payload: preferences })
      } catch (error) {
        console.error('Failed to load notification preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('natpac_notification_preferences', JSON.stringify(state.preferences))
  }, [state.preferences])

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      dispatch({ 
        type: ACTION_TYPES.SET_PERMISSION, 
        payload: Notification.permission === 'granted' 
      })
    }
  }, [])

  // Context methods
  const contextValue = {
    ...state,
    
    // Add notification
    addNotification: (notification) => {
      // Check if notifications are enabled for this type
      const { type, priority = NOTIFICATION_PRIORITY.MEDIUM } = notification
      
      if (!shouldShowNotification(state.preferences, type)) {
        return
      }
      
      dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification })
      
      // Show browser notification if permission granted and push enabled
      if (state.isPermissionGranted && state.preferences.enablePush) {
        showBrowserNotification(notification)
      }
      
      // Play sound if enabled
      if (state.preferences.soundEnabled) {
        playNotificationSound(priority)
      }
      
      // Vibrate if enabled and supported
      if (state.preferences.vibrationEnabled && 'vibrate' in navigator) {
        vibrateDevice(priority)
      }
    },
    
    // Mark notification as read
    markAsRead: (id) => {
      dispatch({ type: ACTION_TYPES.MARK_AS_READ, payload: { id } })
    },
    
    // Mark all as read
    markAllAsRead: () => {
      dispatch({ type: ACTION_TYPES.MARK_ALL_READ })
    },
    
    // Remove notification
    removeNotification: (id) => {
      dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: { id } })
    },
    
    // Clear all notifications
    clearAll: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_ALL })
    },
    
    // Update preferences
    updatePreferences: (preferences) => {
      dispatch({ type: ACTION_TYPES.UPDATE_PREFERENCES, payload: preferences })
    },
    
    // Request notification permission
    requestPermission: async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        const granted = permission === 'granted'
        dispatch({ type: ACTION_TYPES.SET_PERMISSION, payload: granted })
        return granted
      }
      return false
    },
    
    // Update system status
    updateSystemStatus: (status) => {
      dispatch({ type: ACTION_TYPES.UPDATE_SYSTEM_STATUS, payload: status })
    }
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Helper functions
function shouldShowNotification(preferences, type) {
  if (preferences.doNotDisturb) return false
  
  // Check quiet hours
  if (preferences.quietHours.enabled) {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const startTime = timeStringToMinutes(preferences.quietHours.start)
    const endTime = timeStringToMinutes(preferences.quietHours.end)
    
    if (startTime <= endTime) {
      // Same day quiet hours
      if (currentTime >= startTime && currentTime <= endTime) {
        return false
      }
    } else {
      // Overnight quiet hours
      if (currentTime >= startTime || currentTime <= endTime) {
        return false
      }
    }
  }
  
  // Check type-specific preferences
  switch (type) {
    case NOTIFICATION_TYPES.TRIP_VALIDATION:
      return preferences.tripValidation
    case NOTIFICATION_TYPES.ACHIEVEMENT:
      return preferences.achievements
    case NOTIFICATION_TYPES.CHALLENGE:
      return preferences.challenges
    case NOTIFICATION_TYPES.SYSTEM_STATUS:
    case NOTIFICATION_TYPES.BATTERY_WARNING:
    case NOTIFICATION_TYPES.LOCATION_UPDATE:
      return preferences.systemAlerts
    default:
      return true
  }
}

function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

function showBrowserNotification(notification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const options = {
      body: notification.message || notification.description,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.type,
      silent: false,
      requireInteraction: notification.priority === NOTIFICATION_PRIORITY.CRITICAL
    }
    
    new Notification(notification.title, options)
  }
}

function playNotificationSound(priority) {
  // Create audio context for playing notification sounds
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different frequencies for different priorities
    const frequencies = {
      [NOTIFICATION_PRIORITY.LOW]: 200,
      [NOTIFICATION_PRIORITY.MEDIUM]: 400,
      [NOTIFICATION_PRIORITY.HIGH]: 600,
      [NOTIFICATION_PRIORITY.CRITICAL]: 800
    }
    
    oscillator.frequency.setValueAtTime(frequencies[priority] || 400, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.warn('Unable to play notification sound:', error)
  }
}

function vibrateDevice(priority) {
  // Different vibration patterns for different priorities
  const patterns = {
    [NOTIFICATION_PRIORITY.LOW]: [100],
    [NOTIFICATION_PRIORITY.MEDIUM]: [100, 50, 100],
    [NOTIFICATION_PRIORITY.HIGH]: [200, 50, 200, 50, 200],
    [NOTIFICATION_PRIORITY.CRITICAL]: [300, 100, 300, 100, 300]
  }
  
  navigator.vibrate(patterns[priority] || [100])
}

export default NotificationProvider