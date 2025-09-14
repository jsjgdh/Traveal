import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { HelpCircle, X, ChevronRight, Lightbulb, Target, Info } from 'lucide-react'
import { AccessibleModal, AccessibleButton } from './AccessibilityProvider'
import { useHaptic } from './HapticProvider'

const TooltipContext = createContext()
const OnboardingContext = createContext()

// Enhanced Tooltip Component
export const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 500,
  className = '',
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState(null)

  const showTooltip = useCallback(() => {
    if (disabled) return
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }, [delay, disabled])

  const hideTooltip = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }, [timeoutId])

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && content && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            animate-fade-in-up pointer-events-none max-w-xs
            ${positionClasses[position]}
          `}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  )
}

// Help Button with integrated tooltip
export const HelpButton = ({ 
  helpText, 
  title = 'Help', 
  className = '',
  size = 'small' 
}) => {
  const { tap } = useHaptic()
  const [showModal, setShowModal] = useState(false)

  const handleClick = useCallback(() => {
    tap()
    setShowModal(true)
  }, [tap])

  const sizeClasses = {
    small: 'w-5 h-5 p-1',
    medium: 'w-6 h-6 p-1.5',
    large: 'w-8 h-8 p-2'
  }

  return (
    <>
      <Tooltip content="Get help" position="top">
        <button
          onClick={handleClick}
          className={`
            ${sizeClasses[size]} text-gray-400 hover:text-blue-600 rounded-full 
            hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-500
            ${className}
          `}
          aria-label={`Get help: ${title}`}
        >
          <HelpCircle className="w-full h-full" />
        </button>
      </Tooltip>

      <AccessibleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        size="medium"
      >
        <div className="space-y-4">
          <div className="text-gray-700 text-sm leading-relaxed">
            {helpText}
          </div>
          <div className="flex justify-end">
            <AccessibleButton
              variant="primary"
              onClick={() => setShowModal(false)}
            >
              Got it
            </AccessibleButton>
          </div>
        </div>
      </AccessibleModal>
    </>
  )
}

// Interactive Tour Step
export const TourStep = ({ 
  stepNumber, 
  totalSteps, 
  title, 
  content, 
  targetRef,
  position = 'bottom',
  onNext,
  onPrev,
  onSkip,
  onComplete,
  showSkip = true
}) => {
  const { button } = useHaptic()
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect()
      setTargetPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      })
    }
  }, [targetRef])

  const handleNext = useCallback(() => {
    button()
    if (stepNumber === totalSteps) {
      onComplete?.()
    } else {
      onNext?.()
    }
  }, [button, stepNumber, totalSteps, onNext, onComplete])

  const handlePrev = useCallback(() => {
    button()
    onPrev?.()
  }, [button, onPrev])

  const handleSkip = useCallback(() => {
    button()
    onSkip?.()
  }, [button, onSkip])

  const getStepPosition = () => {
    const offset = 20
    switch (position) {
      case 'top':
        return {
          top: targetPosition.top - offset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, -100%)'
        }
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + offset,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translateX(-50%)'
        }
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - offset,
          transform: 'translate(-100%, -50%)'
        }
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + offset,
          transform: 'translateY(-50%)'
        }
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      
      {/* Highlight */}
      {targetRef?.current && (
        <div
          className="fixed z-50 border-4 border-blue-500 rounded-lg shadow-lg"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
          }}
        />
      )}
      
      {/* Step Content */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 animate-scale-in"
        style={getStepPosition()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {stepNumber}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500">Step {stepNumber} of {totalSteps}</p>
              </div>
            </div>
            
            {showSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 p-1 rounded focus:ring-2 focus:ring-gray-500"
                aria-label="Skip tour"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="text-gray-700 text-sm mb-6 leading-relaxed">
            {content}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index < stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {stepNumber > 1 && (
                <AccessibleButton
                  variant="outline"
                  size="small"
                  onClick={handlePrev}
                >
                  Previous
                </AccessibleButton>
              )}
              <AccessibleButton
                variant="primary"
                size="small"
                onClick={handleNext}
              >
                {stepNumber === totalSteps ? 'Finish' : 'Next'}
              </AccessibleButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Onboarding hints overlay
export const OnboardingHints = ({ hints = [], onComplete }) => {
  const [currentHint, setCurrentHint] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (hints.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [hints.length])

  const handleNext = useCallback(() => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1)
    } else {
      setIsVisible(false)
      onComplete?.()
    }
  }, [currentHint, hints.length, onComplete])

  const handleSkip = useCallback(() => {
    setIsVisible(false)
    onComplete?.()
  }, [onComplete])

  if (!isVisible || hints.length === 0) return null

  return (
    <TourStep
      stepNumber={currentHint + 1}
      totalSteps={hints.length}
      title={hints[currentHint]?.title}
      content={hints[currentHint]?.content}
      targetRef={hints[currentHint]?.targetRef}
      position={hints[currentHint]?.position}
      onNext={handleNext}
      onSkip={handleSkip}
      onComplete={onComplete}
    />
  )
}

// Feature highlight component
export const FeatureHighlight = ({ 
  feature, 
  isVisible = false, 
  onDismiss,
  className = '' 
}) => {
  const { notification } = useHaptic()

  useEffect(() => {
    if (isVisible) {
      notification()
    }
  }, [isVisible, notification])

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-40 animate-slide-in-up ${className}`}>
      <div className="max-w-md mx-auto bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{feature?.title}</h4>
            <p className="text-xs text-blue-100 mt-1">{feature?.description}</p>
            
            {feature?.action && (
              <button
                onClick={feature.action}
                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-100 hover:text-white transition-colors"
              >
                <span>{feature.actionText || 'Try it now'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-blue-500 rounded focus:ring-2 focus:ring-blue-300"
            aria-label="Dismiss feature highlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Progressive disclosure component
export const ProgressiveDisclosure = ({ 
  children, 
  triggerText = 'Show more',
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { button } = useHaptic()

  const handleToggle = useCallback(() => {
    button()
    setIsExpanded(!isExpanded)
  }, [button, isExpanded])

  return (
    <div className={className}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm transition-colors focus:ring-2 focus:ring-blue-500 rounded"
        aria-expanded={isExpanded}
      >
        <span>{isExpanded ? 'Show less' : triggerText}</span>
        <ChevronRight 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </button>
      
      {isExpanded && (
        <div className="mt-3 animate-slide-in-down">
          {children}
        </div>
      )}
    </div>
  )
}

// Context providers
export const TooltipProvider = ({ children, disabled = false }) => {
  const contextValue = { disabled }
  
  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  )
}

export const OnboardingProvider = ({ children }) => {
  const [currentTour, setCurrentTour] = useState(null)
  const [completedTours, setCompletedTours] = useState(new Set())

  const startTour = useCallback((tourId, steps) => {
    if (!completedTours.has(tourId)) {
      setCurrentTour({ id: tourId, steps, currentStep: 0 })
    }
  }, [completedTours])

  const completeTour = useCallback((tourId) => {
    setCurrentTour(null)
    setCompletedTours(prev => new Set([...prev, tourId]))
    localStorage.setItem('completed_tours', JSON.stringify([...completedTours, tourId]))
  }, [completedTours])

  useEffect(() => {
    // Load completed tours from storage
    const stored = localStorage.getItem('completed_tours')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCompletedTours(new Set(parsed))
      } catch (error) {
        console.warn('Failed to parse completed tours:', error)
      }
    }
  }, [])

  const contextValue = {
    currentTour,
    completedTours,
    startTour,
    completeTour
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  )
}

// Hooks
export const useTooltips = () => {
  const context = useContext(TooltipContext)
  return context || { disabled: false }
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}