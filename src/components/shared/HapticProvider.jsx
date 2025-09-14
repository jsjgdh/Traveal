import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useHapticFeedback } from '../../utils/appUtils'

const HapticContext = createContext()

// Haptic feedback patterns for different interactions
const HAPTIC_PATTERNS = {
  // Basic interactions
  tap: [10],
  press: [20],
  release: [5],
  
  // UI interactions
  button: [15],
  toggle: [10, 5, 10],
  slider: [5],
  swipe: [8],
  
  // Feedback types
  success: [10, 10, 20],
  error: [50, 20, 50, 20, 50],
  warning: [30, 10, 30],
  notification: [20, 10, 20],
  
  // Game-like interactions
  achievement: [10, 20, 10, 30, 10],
  levelUp: [20, 30, 20, 40, 20],
  points: [5, 5, 15],
  
  // Navigation
  pageChange: [12],
  modalOpen: [15, 10],
  modalClose: [10, 15],
  
  // Form interactions
  inputFocus: [8],
  inputValid: [10, 5],
  inputError: [25, 15, 25],
  formSubmit: [20, 15, 20]
}

export const HapticProvider = ({ children }) => {
  const { triggerHaptic } = useHapticFeedback()
  const [isEnabled, setIsEnabled] = useState(true)
  const [debugMode, setDebugMode] = useState(false)

  // Check if haptic feedback is supported and enabled
  useEffect(() => {
    const hapticEnabled = localStorage.getItem('haptic_enabled')
    if (hapticEnabled !== null) {
      setIsEnabled(hapticEnabled === 'true')
    } else {
      // Enable by default on mobile devices
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsEnabled(isMobile)
      localStorage.setItem('haptic_enabled', isMobile.toString())
    }
    
    const debugEnabled = localStorage.getItem('haptic_debug')
    setDebugMode(debugEnabled === 'true')
  }, [])

  // Enhanced haptic trigger with pattern support
  const haptic = useCallback((pattern, intensity = 1) => {
    if (!isEnabled) return
    
    try {
      let vibrationPattern
      
      if (typeof pattern === 'string') {
        vibrationPattern = HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.tap
      } else if (Array.isArray(pattern)) {
        vibrationPattern = pattern
      } else {
        vibrationPattern = [pattern || 10]
      }
      
      // Apply intensity multiplier
      vibrationPattern = vibrationPattern.map(duration => 
        Math.round(duration * Math.max(0.1, Math.min(2, intensity)))
      )
      
      if ('vibrate' in navigator) {
        navigator.vibrate(vibrationPattern)
        
        if (debugMode) {
          console.log('Haptic feedback:', pattern, vibrationPattern)
        }
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error)
    }
  }, [isEnabled, debugMode])

  // Predefined haptic methods for common interactions
  const hapticMethods = {
    // Basic interactions
    tap: () => haptic('tap'),
    press: () => haptic('press'),
    release: () => haptic('release'),
    
    // UI interactions
    button: () => haptic('button'),
    toggle: () => haptic('toggle'),
    slider: () => haptic('slider'),
    swipe: () => haptic('swipe'),
    
    // Feedback types
    success: () => haptic('success'),
    error: () => haptic('error'),
    warning: () => haptic('warning'),
    notification: () => haptic('notification'),
    
    // Game-like interactions
    achievement: () => haptic('achievement'),
    levelUp: () => haptic('levelUp'),
    points: () => haptic('points'),
    
    // Navigation
    pageChange: () => haptic('pageChange'),
    modalOpen: () => haptic('modalOpen'),
    modalClose: () => haptic('modalClose'),
    
    // Form interactions
    inputFocus: () => haptic('inputFocus'),
    inputValid: () => haptic('inputValid'),
    inputError: () => haptic('inputError'),
    formSubmit: () => haptic('formSubmit'),
    
    // Custom patterns
    custom: (pattern, intensity) => haptic(pattern, intensity)
  }

  const contextValue = {
    isEnabled,
    setIsEnabled: (enabled) => {
      setIsEnabled(enabled)
      localStorage.setItem('haptic_enabled', enabled.toString())
    },
    debugMode,
    setDebugMode: (enabled) => {
      setDebugMode(enabled)
      localStorage.setItem('haptic_debug', enabled.toString())
    },
    haptic,
    ...hapticMethods
  }

  return (
    <HapticContext.Provider value={contextValue}>
      {children}
    </HapticContext.Provider>
  )
}

// Hook to use haptic feedback
export const useHaptic = () => {
  const context = useContext(HapticContext)
  if (!context) {
    throw new Error('useHaptic must be used within HapticProvider')
  }
  return context
}

// Enhanced Button with Haptic Feedback
export const HapticButton = ({ 
  children, 
  hapticType = 'button', 
  hapticIntensity = 1, 
  disabled = false,
  className = '',
  onClick = () => {},
  ...props 
}) => {
  const { haptic } = useHaptic()

  const handleClick = useCallback((event) => {
    if (!disabled) {
      haptic(hapticType, hapticIntensity)
      onClick(event)
    }
  }, [disabled, haptic, hapticType, hapticIntensity, onClick])

  return (
    <button
      className={`btn-enhanced focus-ring ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Enhanced Toggle Switch with Haptic Feedback
export const HapticToggle = ({ 
  checked = false, 
  onChange = () => {}, 
  disabled = false,
  className = '',
  ...props 
}) => {
  const { toggle } = useHaptic()

  const handleToggle = useCallback(() => {
    if (!disabled) {
      toggle()
      onChange(!checked)
    }
  }, [checked, disabled, onChange, toggle])

  return (
    <button
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={handleToggle}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      {...props}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

// Haptic Settings Component
export const HapticSettings = ({ className = '' }) => {
  const { isEnabled, setIsEnabled, debugMode, setDebugMode } = useHaptic()

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Haptic Feedback</h3>
          <p className="text-sm text-gray-500">Feel vibrations for interactions</p>
        </div>
        <HapticToggle
          checked={isEnabled}
          onChange={setIsEnabled}
        />
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Debug Mode</h3>
            <p className="text-sm text-gray-500">Log haptic feedback events</p>
          </div>
          <HapticToggle
            checked={debugMode}
            onChange={setDebugMode}
          />
        </div>
      )}
    </div>
  )
}