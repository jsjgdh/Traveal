import { useNavigate } from 'react-router-dom'

function Welcome() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    // Navigate to dashboard
    navigate('/dashboard')
  }

  const handleLearnMore = () => {
    navigate('/learn-more')
  }

  // For testing - allow resetting onboarding
  const resetOnboarding = () => {
    localStorage.removeItem('natpac_onboarded')
    localStorage.removeItem('natpac_consent')
    window.location.reload()
  }

  return (
    <div className="px-4 py-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        {/* App Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Welcome to Smart Transportation Data Collection
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Help improve Kerala's transportation by sharing your trips
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Automated Trip Detection</h3>
              <p className="text-sm text-gray-600">Smart technology detects your trips automatically with minimal input required.</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Privacy Protected</h3>
              <p className="text-sm text-gray-600">Your data is anonymized and used only for transportation research purposes.</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Real-time Insights</h3>
              <p className="text-sm text-gray-600">Get instant feedback on your travel patterns and contribute to better planning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 pt-4">
        <button 
          onClick={handleGetStarted}
          className="btn-primary w-full text-lg"
        >
          Get Started
        </button>
        <button 
          onClick={handleLearnMore}
          className="btn-secondary w-full"
        >
          Learn More
        </button>
      </div>

      {/* Footer */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500">
          Powered by NATPAC - Kerala Government
        </p>
        <p className="text-xs text-gray-400 mt-1">
          National Transportation Planning and Research Centre
        </p>
        <button
          onClick={resetOnboarding}
          className="text-xs text-gray-400 mt-2 underline"
        >
          Reset Onboarding (Dev)
        </button>
      </div>
    </div>
  )
}

export default Welcome