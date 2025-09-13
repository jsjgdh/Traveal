import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './pages/Welcome'
import LearnMore from './pages/LearnMore'
import Dashboard from './pages/Dashboard'
import TripPage from './pages/TripPage'
import DataPage from './pages/DataPage'
import RewardsPage from './pages/RewardsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import TripValidationDemo from './pages/TripValidationDemo'
import DataAnalyticsDemo from './pages/DataAnalyticsDemo'
import { OnboardingFlow } from './components/onboarding'

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingStatus = localStorage.getItem('natpac_onboarded')
    setIsOnboarded(onboardingStatus === 'true')
    setIsLoading(false)
  }, [])

  const handleOnboardingComplete = (consentData) => {
    console.log('Onboarding completed with consent data:', consentData)
    setIsOnboarded(true)
  }

  if (isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600">Loading NATPAC...</p>
        </div>
      </div>
    )
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <Router>
      <div className="mobile-container">
        <Layout>
          <Routes>
            {/* Legacy routes for backward compatibility */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/learn-more" element={<LearnMore />} />
            
            {/* Main app routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trip" element={<TripPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/trip-validation-demo" element={<TripValidationDemo />} />
            <Route path="/data-analytics-demo" element={<DataAnalyticsDemo />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App