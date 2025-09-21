import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

// Enhanced Components
import { EnhancedRouter, RouteWrapper, ProtectedRoute } from './components/shared/EnhancedRouter'
import { SwipeNavigationProvider, SwipeHint, NavigationDots } from './components/shared/SwipeNavigationProvider'
import { HapticProvider } from './components/shared/HapticProvider'
import { AccessibilityProvider, SkipLink } from './components/shared/AccessibilityProvider'
import { AppInfoProvider, SystemStatusIndicator } from './components/shared/AppInfoProvider'
import { TooltipProvider, OnboardingProvider } from './components/shared/HelpSystem'

// Layout and Pages
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import LearnMore from './pages/LearnMore'
import Dashboard from './pages/Dashboard'
import TripPage from './pages/TripPage'
import DataPage from './pages/DataPage'
import RewardsPage from './pages/RewardsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import DiscoverPage from './pages/DiscoverPage'
import TripValidationDemo from './pages/TripValidationDemo'
import DataAnalyticsDemo from './pages/DataAnalyticsDemo'
import NotificationDemo from './pages/NotificationDemo'
import TripPlannerPage from './pages/TripPlannerPage'

// Onboarding and Notifications
import { OnboardingFlow } from './components/onboarding'
import { NotificationProvider, NotificationBanner, NotificationPermissionFlow } from './components/notifications'

// SOS Safety Components
import SOSManager from './components/sos/SOSManager'
import SOSSettings from './components/sos/SOSSettings'
import VoiceAlertTest from './components/sos/VoiceAlertTest'
import PermissionRequestFlow from './components/sos/PermissionRequestFlow'

// Theme Context
import { ThemeProvider } from './contexts/ThemeContext'

// Responsive utilities
import { useResponsiveDesign } from './utils/appUtils'

// Import test script for development
if (process.env.NODE_ENV === 'development') {
  import('./test-notifications.js')
}

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showNotificationPermission, setShowNotificationPermission] = useState(false)
  const { deviceInfo, getResponsivePadding, getContainerMaxWidth } = useResponsiveDesign()

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem('natpac_onboarded')
    const hasShownNotificationPermission = localStorage.getItem('natpac_notification_permission_shown')
    
    setIsOnboarded(onboardingStatus === 'true')
    
    // Show notification permission flow after onboarding if not shown before
    if (onboardingStatus === 'true' && !hasShownNotificationPermission) {
      setTimeout(() => setShowNotificationPermission(true), 2000)
    }
    
    setIsLoading(false)
  }, [])

  const handleOnboardingComplete = (consentData) => {
    console.log('Onboarding completed with consent data:', consentData)
    setIsOnboarded(true)
    
    // Show notification permission flow after onboarding
    setTimeout(() => setShowNotificationPermission(true), 1000)
  }

  const handleNotificationPermissionComplete = () => {
    setShowNotificationPermission(false)
    localStorage.setItem('natpac_notification_permission_shown', 'true')
  }

  if (isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 animate-pulse">Loading Traveal...</p>
          <div className="mt-4">
            <SystemStatusIndicator />
          </div>
        </div>
      </div>
    )
  }

  if (!isOnboarded) {
    return (
      <ThemeProvider>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </ThemeProvider>
    )
  }

  // Dynamic container classes based on screen size
  const containerClasses = `mobile-container mx-auto w-full ${getResponsivePadding()} ${getContainerMaxWidth()}`

  return (
    <ThemeProvider>
      <HapticProvider>
      <AccessibilityProvider>
        <AppInfoProvider>
          <TooltipProvider>
            <OnboardingProvider>
              <NotificationProvider>
                <EnhancedRouter>
                  <SwipeNavigationProvider>
                    <div className={containerClasses}>
                      {/* Skip Link for Accessibility */}
                      <SkipLink targetId="main-content">Skip to main content</SkipLink>
                      
                      <NotificationBanner />
                      
                      <Layout>
                        <main id="main-content" className="focus:outline-none" tabIndex={-1}>
                          <Routes>
                            {/* Legacy routes for backward compatibility */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/welcome" element={<RouteWrapper title="Welcome"><Welcome /></RouteWrapper>} />
                            <Route path="/learn-more" element={<RouteWrapper title="Learn More"><LearnMore /></RouteWrapper>} />
                            
                            {/* Main app routes with protection and loading */}
                            <Route path="/dashboard" element={<ProtectedRoute><RouteWrapper title="Dashboard"><Dashboard /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/discover" element={<ProtectedRoute><RouteWrapper title="Discover Gems"><DiscoverPage /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/trip" element={<ProtectedRoute><RouteWrapper title="Trip Management"><TripPage /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/trip-planner" element={<ProtectedRoute><RouteWrapper title="Trip Planner"><TripPlannerPage /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/data" element={<ProtectedRoute><RouteWrapper title="Data Analytics"><DataPage /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/rewards" element={<ProtectedRoute><RouteWrapper title="Rewards"><RewardsPage /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><RouteWrapper title="Profile"><ProfilePage /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><RouteWrapper title="Settings"><SettingsPage /></RouteWrapper></ProtectedRoute>} />
                            
                            {/* SOS Safety routes */}
                            <Route path="/sos" element={<ProtectedRoute><RouteWrapper title="SOS Safety"><SOSManager /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/sos/settings" element={<ProtectedRoute><RouteWrapper title="SOS Settings"><SOSSettings /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/sos/test" element={<ProtectedRoute><RouteWrapper title="Voice Alert Test"><VoiceAlertTest /></RouteWrapper></ProtectedRoute>} />
                            <Route path="/sos/permissions" element={<ProtectedRoute><RouteWrapper title="SOS Permissions"><PermissionRequestFlow /></RouteWrapper></ProtectedRoute>} />
                            
                            {/* Demo routes */}
                            <Route path="/trip-validation-demo" element={<RouteWrapper title="Trip Validation Demo"><TripValidationDemo /></RouteWrapper>} />
                            <Route path="/data-analytics-demo" element={<RouteWrapper title="Data Analytics Demo"><DataAnalyticsDemo /></RouteWrapper>} />
                            <Route path="/notification-demo" element={<RouteWrapper title="Notification Demo"><NotificationDemo /></RouteWrapper>} />
                          </Routes>
                        </main>
                      </Layout>
                      
                      {/* Navigation helpers for mobile */}
                      {deviceInfo.isMobile && (
                        <>
                          <SwipeHint />
                          <NavigationDots className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-30" />
                        </>
                      )}
                      
                      {/* Notification Permission Flow */}
                      {showNotificationPermission && (
                        <NotificationPermissionFlow
                          onComplete={handleNotificationPermissionComplete}
                          autoShow={true}
                        />
                      )}
                    </div>
                  </SwipeNavigationProvider>
                </EnhancedRouter>
              </NotificationProvider>
            </OnboardingProvider>
          </TooltipProvider>
        </AppInfoProvider>
      </AccessibilityProvider>
    </HapticProvider>
    </ThemeProvider>
  )
}

export default App