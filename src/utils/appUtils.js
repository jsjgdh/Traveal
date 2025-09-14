// App Utilities for Enhanced User Experience
import { useState, useEffect, useCallback } from 'react'

// App Version and Configuration
export const APP_CONFIG = {
  version: '1.0.0',
  buildNumber: '001',
  environment: process.env.NODE_ENV || 'development',
  apiVersion: 'v1',
  supportEmail: 'support@traveal.gov',
  updateCheckInterval: 1000 * 60 * 60 * 4, // 4 hours
}

// Device Detection
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    hasTouch: false,
    orientation: 'portrait',
    screenSize: 'sm'
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        hasTouch,
        orientation: height > width ? 'portrait' : 'landscape',
        screenSize: width < 640 ? 'sm' : width < 768 ? 'md' : width < 1024 ? 'lg' : 'xl'
      })
    }

    updateDeviceInfo()
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Haptic Feedback
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 20, 10],
        error: [50, 50, 50],
        notification: [20, 10, 20]
      }
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }, [])

  return { triggerHaptic }
}

// Focus Management
export const useFocusManagement = () => {
  const [focusStack, setFocusStack] = useState([])

  const pushFocus = useCallback((element) => {
    if (element && element !== document.activeElement) {
      setFocusStack(prev => [...prev, document.activeElement])
      element.focus()
    }
  }, [])

  const popFocus = useCallback(() => {
    setFocusStack(prev => {
      if (prev.length === 0) return prev
      const [lastElement, ...rest] = prev.slice(-1)
      if (lastElement && lastElement.focus) {
        lastElement.focus()
      }
      return rest
    })
  }, [])

  const clearFocusStack = useCallback(() => {
    setFocusStack([])
  }, [])

  return { pushFocus, popFocus, clearFocusStack, focusStackLength: focusStack.length }
}

// Keyboard Navigation
export const useKeyboardNavigation = (options = {}) => {
  const {
    onEscape = null,
    onEnter = null,
    onArrowUp = null,
    onArrowDown = null,
    onArrowLeft = null,
    onArrowRight = null,
    onTab = null,
    preventDefault = []
  } = options

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, code, ctrlKey, altKey, shiftKey } = event

      // Handle specific keys
      switch (key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape(event)
          }
          break
        case 'Enter':
          if (onEnter) {
            event.preventDefault()
            onEnter(event)
          }
          break
        case 'ArrowUp':
          if (onArrowUp) {
            event.preventDefault()
            onArrowUp(event)
          }
          break
        case 'ArrowDown':
          if (onArrowDown) {
            event.preventDefault()
            onArrowDown(event)
          }
          break
        case 'ArrowLeft':
          if (onArrowLeft) {
            event.preventDefault()
            onArrowLeft(event)
          }
          break
        case 'ArrowRight':
          if (onArrowRight) {
            event.preventDefault()
            onArrowRight(event)
          }
          break
        case 'Tab':
          if (onTab) {
            onTab(event)
          }
          break
      }

      // Prevent default for specified keys
      if (preventDefault.includes(key) || preventDefault.includes(code)) {
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, preventDefault])
}

// Screen Reader Support
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Loading States
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)
  const [loadingMessage, setLoadingMessage] = useState('')

  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true)
    setLoadingMessage(message)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
  }, [])

  return { isLoading, loadingMessage, startLoading, stopLoading }
}

// Error Handling
export const useErrorHandler = () => {
  const [error, setError] = useState(null)

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error)
    setError({
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    })
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { error, handleError, clearError }
}

// App Update Detection
export const useAppUpdates = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // In a real app, this would check against a server
        const currentVersion = APP_CONFIG.version
        const storedVersion = localStorage.getItem('app_version')
        
        if (storedVersion && storedVersion !== currentVersion) {
          setUpdateAvailable(true)
          setUpdateInfo({
            currentVersion: storedVersion,
            newVersion: currentVersion,
            features: ['Improved performance', 'New notification system', 'Enhanced accessibility']
          })
        }
        
        localStorage.setItem('app_version', currentVersion)
      } catch (error) {
        console.error('Update check failed:', error)
      }
    }

    checkForUpdates()
    const interval = setInterval(checkForUpdates, APP_CONFIG.updateCheckInterval)

    return () => clearInterval(interval)
  }, [])

  const dismissUpdate = useCallback(() => {
    setUpdateAvailable(false)
    localStorage.setItem('update_dismissed', Date.now().toString())
  }, [])

  return { updateAvailable, updateInfo, dismissUpdate }
}

// Swipe Gesture Detection
export const useSwipeGestures = (options = {}) => {
  const {
    onSwipeLeft = null,
    onSwipeRight = null,
    onSwipeUp = null,
    onSwipeDown = null,
    threshold = 50,
    preventScrollOnSwipe = true
  } = options

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [])

  const onTouchMove = useCallback((e) => {
    if (preventScrollOnSwipe && touchStart) {
      const deltaX = Math.abs(e.targetTouches[0].clientX - touchStart.x)
      const deltaY = Math.abs(e.targetTouches[0].clientY - touchStart.y)
      
      if (deltaX > deltaY) {
        e.preventDefault()
      }
    }
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [touchStart, preventScrollOnSwipe])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0 && onSwipeLeft) {
        onSwipeLeft()
      } else if (deltaX < 0 && onSwipeRight) {
        onSwipeRight()
      }
    } else if (absDeltaY > threshold) {
      if (deltaY > 0 && onSwipeUp) {
        onSwipeUp()
      } else if (deltaY < 0 && onSwipeDown) {
        onSwipeDown()
      }
    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return { onTouchStart, onTouchMove, onTouchEnd }
}

// Performance Monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  })

  useEffect(() => {
    const updateMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0]
        const memory = performance.memory || null

        setMetrics({
          loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
          renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
          memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0 // MB
        })
      }
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Utility Functions
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}