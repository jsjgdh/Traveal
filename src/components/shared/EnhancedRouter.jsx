import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLoadingState, useErrorHandler, announceToScreenReader } from '../../utils/appUtils'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

// Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'p-8'}`}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-gray-600 text-sm" aria-live="polite">{message}</p>
      </div>
    </div>
  )
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error for monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      )
    }

    return this.props.children
  }
}

// Error Fallback Component
const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    resetError()
    navigate('/dashboard')
  }

  const handleRefresh = () => {
    resetError()
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. The page encountered an unexpected error.
        </p>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">Error Details</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.toString()}
            </pre>
          </details>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleGoHome}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Go to Dashboard
          </button>
          
          <button
            onClick={handleRefresh}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

// Route Loading Wrapper
const RouteWrapper = ({ children, requiresAuth = false, title }) => {
  const location = useLocation()
  const { isLoading, startLoading, stopLoading } = useLoadingState()

  useEffect(() => {
    startLoading(`Loading ${title || 'page'}...`)
    
    // Simulate route loading (in real app, this would be actual data loading)
    const timer = setTimeout(() => {
      stopLoading()
      
      // Update page title
      if (title) {
        document.title = `${title} - Traveal`
      }
      
      // Announce page change to screen readers
      announceToScreenReader(`Navigated to ${title || 'page'}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [location.pathname, title, startLoading, stopLoading])

  if (isLoading) {
    return <LoadingSpinner message={`Loading ${title || 'page'}...`} />
  }

  return (
    <div className="route-content">
      {children}
    </div>
  )
}

// Navigation Guard Hook
const useNavigationGuards = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateWithGuard = useCallback(async (to, options = {}) => {
    const { confirm = false, confirmMessage = 'Are you sure you want to leave this page?' } = options
    
    try {
      setIsNavigating(true)
      
      // Check if confirmation is needed
      if (confirm) {
        const userConfirmed = window.confirm(confirmMessage)
        if (!userConfirmed) {
          setIsNavigating(false)
          return false
        }
      }
      
      // Navigate
      navigate(to, options)
      return true
      
    } catch (error) {
      console.error('Navigation error:', error)
      setIsNavigating(false)
      return false
    }
  }, [navigate])

  return { navigateWithGuard, isNavigating, currentPath: location.pathname }
}

// Page Transition Component
const PageTransition = ({ children, className = '' }) => {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitionStage, setTransitionStage] = useState('fadeIn')

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fadeOut')
    }
  }, [location, displayLocation])

  return (
    <div
      className={`transition-opacity duration-300 ${
        transitionStage === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      } ${className}`}
      onTransitionEnd={() => {
        if (transitionStage === 'fadeOut') {
          setDisplayLocation(location)
          setTransitionStage('fadeIn')
        }
      }}
    >
      {children}
    </div>
  )
}

// Protected Route Component
const ProtectedRoute = ({ children, requiresAuth = false, fallback = null }) => {
  const [isAuthorized, setIsAuthorized] = useState(null)

  useEffect(() => {
    // Check authorization (replace with real auth logic)
    const checkAuth = async () => {
      try {
        if (requiresAuth) {
          // Simulate auth check
          const isLoggedIn = localStorage.getItem('user_authenticated') === 'true'
          setIsAuthorized(isLoggedIn)
        } else {
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthorized(false)
      }
    }

    checkAuth()
  }, [requiresAuth])

  if (isAuthorized === null) {
    return <LoadingSpinner message="Verifying access..." />
  }

  if (!isAuthorized) {
    return fallback || <Navigate to="/welcome" replace />
  }

  return children
}

// Breadcrumb Component
const Breadcrumb = ({ items = [] }) => {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {item.href ? (
              <a 
                href={item.href}
                className="hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                {item.label}
              </a>
            ) : (
              <span className={index === items.length - 1 ? 'text-gray-900 font-medium' : ''}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Enhanced Router Component
const EnhancedRouter = ({ children, onRouteChange = () => {} }) => {
  const [routeHistory, setRouteHistory] = useState([])
  
  useEffect(() => {
    const handleRouteChange = (location) => {
      setRouteHistory(prev => [...prev.slice(-9), location.pathname])
      onRouteChange(location)
    }

    // This would be implemented with router history in a real app
    // For now, we'll use a simplified version
  }, [onRouteChange])

  return (
    <ErrorBoundary>
      <Router>
        <div className="app-router">
          <Suspense fallback={<LoadingSpinner fullScreen message="Loading application..." />}>
            <PageTransition>
              {children}
            </PageTransition>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

// Route Configuration
export const routeConfig = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    requiresAuth: true,
    breadcrumb: [{ label: 'Dashboard' }]
  },
  {
    path: '/trip',
    title: 'Trip Management',
    requiresAuth: true,
    breadcrumb: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Trip Management' }
    ]
  },
  {
    path: '/data',
    title: 'Data Analytics',
    requiresAuth: true,
    breadcrumb: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Data Analytics' }
    ]
  },
  {
    path: '/rewards',
    title: 'Rewards',
    requiresAuth: true,
    breadcrumb: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Rewards' }
    ]
  },
  {
    path: '/profile',
    title: 'Profile',
    requiresAuth: true,
    breadcrumb: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Profile' }
    ]
  },
  {
    path: '/settings',
    title: 'Settings',
    requiresAuth: true,
    breadcrumb: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings' }
    ]
  }
]

export {
  EnhancedRouter,
  RouteWrapper,
  ProtectedRoute,
  LoadingSpinner,
  ErrorBoundary,
  ErrorFallback,
  PageTransition,
  Breadcrumb,
  useNavigationGuards
}