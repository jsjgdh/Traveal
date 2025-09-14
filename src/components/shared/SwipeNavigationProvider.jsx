import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSwipeGestures, useHapticFeedback } from '../../utils/appUtils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SwipeNavigationContext = createContext()

// Navigation routes configuration
const navigationRoutes = [
  { path: '/dashboard', name: 'Dashboard', swipeable: true },
  { path: '/trip', name: 'Trip', swipeable: true },
  { path: '/data', name: 'Data', swipeable: true },
  { path: '/rewards', name: 'Rewards', swipeable: true },
  { path: '/profile', name: 'Profile', swipeable: true },
  { path: '/settings', name: 'Settings', swipeable: true }
]

export const SwipeNavigationProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { triggerHaptic } = useHapticFeedback()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(true)
  const [swipeIndicator, setSwipeIndicator] = useState({ show: false, direction: null })

  // Find current route index
  useEffect(() => {
    const index = navigationRoutes.findIndex(route => route.path === location.pathname)
    if (index !== -1) {
      setCurrentIndex(index)
    }
  }, [location.pathname])

  // Handle swipe navigation
  const handleSwipeLeft = useCallback(() => {
    if (!isSwipeEnabled) return
    
    const nextIndex = currentIndex + 1
    if (nextIndex < navigationRoutes.length && navigationRoutes[nextIndex].swipeable) {
      triggerHaptic('light')
      setSwipeIndicator({ show: true, direction: 'left' })
      
      setTimeout(() => {
        navigate(navigationRoutes[nextIndex].path)
        setSwipeIndicator({ show: false, direction: null })
      }, 150)
    }
  }, [currentIndex, isSwipeEnabled, navigate, triggerHaptic])

  const handleSwipeRight = useCallback(() => {
    if (!isSwipeEnabled) return
    
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0 && navigationRoutes[prevIndex].swipeable) {
      triggerHaptic('light')
      setSwipeIndicator({ show: true, direction: 'right' })
      
      setTimeout(() => {
        navigate(navigationRoutes[prevIndex].path)
        setSwipeIndicator({ show: false, direction: null })
      }, 150)
    }
  }, [currentIndex, isSwipeEnabled, navigate, triggerHaptic])

  // Set up swipe gestures
  const swipeHandlers = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    preventScrollOnSwipe: true
  })

  const contextValue = {
    currentIndex,
    isSwipeEnabled,
    setIsSwipeEnabled,
    navigationRoutes,
    swipeHandlers,
    canSwipeLeft: currentIndex < navigationRoutes.length - 1,
    canSwipeRight: currentIndex > 0,
    currentRoute: navigationRoutes[currentIndex]
  }

  return (
    <SwipeNavigationContext.Provider value={contextValue}>
      <div 
        className="relative w-full h-full touch-pan-y"
        {...swipeHandlers}
      >
        {children}
        
        {/* Swipe Indicator */}
        {swipeIndicator.show && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className={`
              bg-black/20 backdrop-blur-sm rounded-full p-4
              ${swipeIndicator.direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right'}
            `}>
              {swipeIndicator.direction === 'left' ? (
                <ChevronRight className="w-8 h-8 text-white" />
              ) : (
                <ChevronLeft className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
        )}
      </div>
    </SwipeNavigationContext.Provider>
  )
}

// Swipe Navigation Hook
export const useSwipeNavigation = () => {
  const context = useContext(SwipeNavigationContext)
  if (!context) {
    throw new Error('useSwipeNavigation must be used within SwipeNavigationProvider')
  }
  return context
}

// Swipe Hint Component
export const SwipeHint = ({ className = '' }) => {
  const { canSwipeLeft, canSwipeRight, currentRoute } = useSwipeNavigation()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    // Show hint on first visit
    const hintShown = localStorage.getItem('swipe_hint_shown')
    if (!hintShown && (canSwipeLeft || canSwipeRight)) {
      setShowHint(true)
      setTimeout(() => {
        setShowHint(false)
        localStorage.setItem('swipe_hint_shown', 'true')
      }, 3000)
    }
  }, [canSwipeLeft, canSwipeRight])

  if (!showHint || (!canSwipeLeft && !canSwipeRight)) return null

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 ${className}`}>
      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm animate-fade-in-up">
        <div className="flex items-center gap-2">
          {canSwipeRight && <ChevronLeft className="w-4 h-4" />}
          <span>Swipe to navigate</span>
          {canSwipeLeft && <ChevronRight className="w-4 h-4" />}
        </div>
      </div>
    </div>
  )
}

// Page Navigation Dots
export const NavigationDots = ({ className = '' }) => {
  const { currentIndex, navigationRoutes } = useSwipeNavigation()
  const navigate = useNavigate()
  const { triggerHaptic } = useHapticFeedback()

  const handleDotClick = (index) => {
    triggerHaptic('light')
    navigate(navigationRoutes[index].path)
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {navigationRoutes.map((route, index) => (
        <button
          key={route.path}
          onClick={() => handleDotClick(index)}
          className={`
            w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${index === currentIndex 
              ? 'bg-blue-600 w-6' 
              : 'bg-gray-300 hover:bg-gray-400'
            }
          `}
          aria-label={`Navigate to ${route.name}`}
        />
      ))}
    </div>
  )
}

// Swipe Tutorial Component
export const SwipeTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const { triggerHaptic } = useHapticFeedback()

  const tutorialSteps = [
    {
      title: 'Swipe Navigation',
      description: 'Swipe left or right to navigate between sections',
      icon: <ChevronLeft className="w-8 h-8 text-blue-600" />,
      gesture: 'swipe'
    },
    {
      title: 'Quick Access',
      description: 'Use the dots at the bottom for quick navigation',
      icon: <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
      </div>,
      gesture: 'tap'
    }
  ]

  const handleNext = () => {
    triggerHaptic('light')
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    triggerHaptic('light')
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {tutorialSteps[currentStep].icon}
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {tutorialSteps[currentStep].title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {tutorialSteps[currentStep].description}
          </p>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-500"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for managing swipe tutorial
export const useSwipeTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    const tutorialShown = localStorage.getItem('swipe_tutorial_shown')
    if (!tutorialShown) {
      setTimeout(() => setShowTutorial(true), 1000)
    }
  }, [])

  const completeTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem('swipe_tutorial_shown', 'true')
  }, [])

  return { showTutorial, completeTutorial }
}