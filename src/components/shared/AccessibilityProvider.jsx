import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from 'react'
import { useFocusManagement, announceToScreenReader } from '../../utils/appUtils'

const AccessibilityContext = createContext()

// Focus trap for modals and overlays
export const FocusTrap = ({ children, isActive = true, restoreFocus = true, className = '' }) => {
  const containerRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)
  const previousActiveElement = useRef(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors))
      .filter(element => {
        const style = window.getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
  }, [])

  useEffect(() => {
    if (!isActive) return

    previousActiveElement.current = document.activeElement
    
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0]
      lastFocusableRef.current = focusableElements[focusableElements.length - 1]
      firstFocusableRef.current?.focus()
    }

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        return
      }

      if (event.shiftKey) {
        if (document.activeElement === focusableElements[0]) {
          event.preventDefault()
          focusableElements[focusableElements.length - 1]?.focus()
        }
      } else {
        if (document.activeElement === focusableElements[focusableElements.length - 1]) {
          event.preventDefault()
          focusableElements[0]?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    
    return () => {
      document.removeEventListener('keydown', handleTabKey)
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, restoreFocus, getFocusableElements])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Skip Link for keyboard navigation
export const SkipLink = ({ targetId, children = 'Skip to main content', className = '' }) => {
  const handleClick = useCallback((event) => {
    event.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      announceToScreenReader(`Skipped to ${children}`)
    }
  }, [targetId, children])

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        bg-blue-600 text-white px-4 py-2 rounded-md z-50 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </a>
  )
}

// Live region for dynamic content announcements
export const LiveRegion = ({ children, politeness = 'polite', atomic = false, className = '' }) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  )
}

// Enhanced heading component with proper hierarchy
export const AccessibleHeading = ({ 
  level = 1, 
  children, 
  id, 
  className = '',
  ...props 
}) => {
  const Tag = `h${Math.max(1, Math.min(6, level))}`
  
  return (
    <Tag
      id={id}
      className={`focus:outline-none ${className}`}
      tabIndex={-1}
      {...props}
    >
      {children}
    </Tag>
  )
}

// Accessible button with enhanced ARIA support
export const AccessibleButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  onClick = () => {},
  className = '',
  ...props
}) => {
  const baseClasses = 'btn-enhanced focus-ring transition-all duration-200 font-medium rounded-lg'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  }
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">Loading...</span>
          Loading
        </span>
      ) : children}
    </button>
  )
}

// Accessible form input with validation
export const AccessibleInput = ({
  id,
  label,
  type = 'text',
  value = '',
  onChange = () => {},
  onBlur = () => {},
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [hasInteracted, setHasInteracted] = useState(false)
  const inputId = id || `input-${Date.now()}`
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const handleBlur = useCallback((event) => {
    setHasInteracted(true)
    onBlur(event)
  }, [onBlur])

  return (
    <div className="space-y-1">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-gray-500">
          {hint}
        </p>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        aria-invalid={hasInteracted && error ? 'true' : 'false'}
        aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`.trim()}
        className={`
          input-enhanced w-full
          ${error && hasInteracted ? 'border-red-500 ring-red-200' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && hasInteracted && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible modal with proper ARIA attributes
export const AccessibleModal = ({
  isOpen = false,
  onClose = () => {},
  title,
  children,
  size = 'medium',
  className = ''
}) => {
  const modalRef = useRef(null)
  const titleId = `modal-title-${Date.now()}`
  const contentId = `modal-content-${Date.now()}`

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      announceToScreenReader(`Modal opened: ${title}`)
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, title])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    xl: 'max-w-4xl'
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-hidden={!isOpen}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        
        <FocusTrap isActive={isOpen}>
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={contentId}
            className={`
              relative bg-white rounded-lg shadow-xl w-full
              ${sizeClasses[size]}
              ${className}
            `}
          >
            <div className="p-6">
              {title && (
                <AccessibleHeading
                  level={2}
                  id={titleId}
                  className="text-lg font-semibold text-gray-900 mb-4"
                >
                  {title}
                </AccessibleHeading>
              )}
              
              <div id={contentId}>
                {children}
              </div>
            </div>
          </div>
        </FocusTrap>
      </div>
    </div>
  )
}

// Screen reader only text component
export const ScreenReaderOnly = ({ children, as: Component = 'span', ...props }) => {
  return (
    <Component className="sr-only" {...props}>
      {children}
    </Component>
  )
}

// Accessibility provider for global settings
export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderEnabled: false
  })

  useEffect(() => {
    // Check for user preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    setSettings(prev => ({
      ...prev,
      reducedMotion,
      highContrast
    }))

    // Load saved settings
    const savedSettings = localStorage.getItem('accessibility_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error)
      }
    }
  }, [])

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      localStorage.setItem('accessibility_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  const contextValue = {
    settings,
    updateSetting,
    announce: announceToScreenReader
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div
        className={`
          ${settings.reducedMotion ? 'motion-reduce' : ''}
          ${settings.highContrast ? 'high-contrast' : ''}
          ${settings.largeText ? 'large-text' : ''}
        `}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

// Hook to use accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

// Accessibility settings panel
export const AccessibilitySettings = ({ className = '' }) => {
  const { settings, updateSetting } = useAccessibility()

  return (
    <div className={`space-y-4 ${className}`}>
      <AccessibleHeading level={3} className="text-lg font-semibold">
        Accessibility Settings
      </AccessibleHeading>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Reduce Motion</label>
            <p className="text-sm text-gray-500">Minimize animations and transitions</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.reducedMotion}
            onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition
                ${settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
            <ScreenReaderOnly>
              {settings.reducedMotion ? 'Disable' : 'Enable'} reduced motion
            </ScreenReaderOnly>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-900">Large Text</label>
            <p className="text-sm text-gray-500">Increase text size for better readability</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.largeText}
            onClick={() => updateSetting('largeText', !settings.largeText)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${settings.largeText ? 'bg-blue-600' : 'bg-gray-200'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition
                ${settings.largeText ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
            <ScreenReaderOnly>
              {settings.largeText ? 'Disable' : 'Enable'} large text
            </ScreenReaderOnly>
          </button>
        </div>
      </div>
    </div>
  )
}