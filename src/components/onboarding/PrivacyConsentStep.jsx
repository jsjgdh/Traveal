import { useState } from 'react'

function PrivacyConsentStep({ consentData, onConsentChange, onNext, onPrevious, isValid }) {
  const [showInfo, setShowInfo] = useState(null)
  const [viewMode, setViewMode] = useState('simple') // 'simple' or 'custom'

  const consentCategories = [
    {
      id: 'locationData',
      title: 'Location Data',
      description: 'Essential for trip detection and route analysis',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      options: [
        {
          key: 'allowTracking',
          label: 'Allow location tracking',
          description: 'Required for automatic trip detection',
          required: true,
          info: 'We use your location to automatically detect when you start and end trips. This data is processed locally and anonymized before sending to our servers.'
        },
        {
          key: 'preciseLocation',
          label: 'Precise location data',
          description: 'More accurate route mapping',
          required: false,
          info: 'Precise GPS coordinates help us better understand traffic patterns and route efficiency. This is optional but provides more valuable research data.'
        }
      ]
    },
    {
      id: 'sensorData',
      title: 'Sensor Data',
      description: 'Helps identify transportation modes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      options: [
        {
          key: 'motionSensors',
          label: 'Motion sensors',
          description: 'Detect walking, driving, etc.',
          required: false,
          info: 'Motion sensors help us automatically identify whether you are walking, driving, or using public transport, making trip logging more accurate.'
        },
        {
          key: 'activityDetection',
          label: 'Activity detection',
          description: 'Identify transportation modes',
          required: false,
          info: 'Activity recognition uses device sensors to distinguish between different types of movement and transportation methods.'
        }
      ]
    },
    {
      id: 'usageAnalytics',
      title: 'Usage Analytics',
      description: 'Help us improve the app experience',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      options: [
        {
          key: 'anonymousStats',
          label: 'Anonymous usage statistics',
          description: 'App performance and usage patterns',
          required: false,
          info: 'Anonymous statistics help us understand how the app is used and identify areas for improvement. No personal information is collected.'
        },
        {
          key: 'crashReports',
          label: 'Crash reports',
          description: 'Help us fix bugs and improve stability',
          required: false,
          info: 'Crash reports contain technical information about app errors to help us fix bugs. No personal data is included in these reports.'
        }
      ]
    }
  ]

  const toggleConsent = (categoryId, optionKey) => {
    const currentValue = consentData[categoryId][optionKey]
    console.log(`Toggling ${categoryId}.${optionKey} from ${currentValue} to ${!currentValue}`)
    onConsentChange(categoryId, optionKey, !currentValue)
  }

  const handleAcceptAll = () => {
    // Enable all permissions
    consentCategories.forEach(category => {
      category.options.forEach(option => {
        onConsentChange(category.id, option.key, true)
      })
    })
    // Auto-proceed after a brief delay for better UX
    setTimeout(() => {
      onNext()
    }, 500)
  }

  const handleCustomSettings = () => {
    setViewMode('custom')
  }

  const handleBackToSimple = () => {
    setViewMode('simple')
  }

  const handleNext = () => {
    console.log('Privacy step - Next button clicked', { isValid, consentData })
    if (isValid) {
      onNext()
    }
  }

  const handlePrevious = () => {
    console.log('Privacy step - Back button clicked')
    onPrevious()
  }

  const InfoModal = ({ info, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Information</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{info}</p>
          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )

  if (viewMode === 'simple') {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Privacy & Data Sharing
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            We respect your privacy. Choose how you'd like to share data to help improve transportation research.
          </p>
        </div>

        {/* Benefits Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">What we collect and why:</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Location data</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">To automatically detect trips and understand mobility patterns</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Device sensors</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">To identify transportation modes (walking, driving, etc.)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Usage analytics</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">To improve app performance and fix issues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee */}
        <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">Your data is protected</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                All data is anonymized, encrypted, and used only for transportation research. You can change these settings or delete your data anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleAcceptAll}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 dark:from-blue-500 dark:to-green-500 dark:hover:from-blue-600 dark:hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Accept All & Continue</span>
            </div>
            <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">Recommended for the best experience</p>
          </button>

          <button
            onClick={handleCustomSettings}
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium py-4 px-6 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-lg">Customize Settings</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose specific permissions</p>
          </button>
        </div>

        {/* Back Button */}
        <div className="pt-4">
          <button
            onClick={handlePrevious}
            className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-600"
          >
            ← Back to Welcome
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Custom Settings Header */}
      <div className="text-center space-y-3">
        <button
          onClick={handleBackToSimple}
          className="inline-flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to simple options</span>
        </button>
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Custom Privacy Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Fine-tune your data sharing preferences. You can change these anytime in settings.
        </p>
      </div>

      {/* Consent Categories */}
      <div className="space-y-6">
        {consentCategories.map((category) => (
          <div key={category.id} className="card">
            {/* Category Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-400">
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {category.options.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                        {option.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                      </span>
                      <button
                        onClick={() => setShowInfo(option.info)}
                        className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleConsent(category.id, option.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                      consentData[category.id][option.key]
                        ? 'bg-primary-600 dark:bg-primary-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        consentData[category.id][option.key]
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Required Notice */}
      <div className={`rounded-lg p-4 border transition-all duration-200 ${
        isValid 
          ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' 
          : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700'
      }`}>
        <div className="flex items-start space-x-3">
          {isValid ? (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <div>
            <p className={`text-sm font-medium ${
              isValid ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'
            }`}>
              {isValid ? 'Ready to Continue!' : 'Required Permissions'}
            </p>
            <p className={`text-xs mt-1 ${
              isValid ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
            }`}>
              {isValid 
                ? 'All required permissions have been granted. You can now continue with setup.' 
                : 'Please enable location tracking and at least one sensor permission to continue.'
              }
            </p>
            {!isValid && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center space-x-2">
                  {consentData.locationData.allowTracking ? (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">Location tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  {(consentData.sensorData.motionSensors || consentData.sensorData.activityDetection) ? (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">At least one sensor permission</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Only show in custom settings mode */}
      {showCustomSettings && (
        <div className="flex space-x-3 pt-4">
          <button
            onClick={handlePrevious}
            className="btn-secondary flex-1"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
              isValid
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Accept & Continue
          </button>
        </div>
      )}

      {/* Simple back button for quick options mode */}
      {!showCustomSettings && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handlePrevious}
            className="btn-secondary px-8"
          >
            ← Back to Welcome
          </button>
        </div>
      )}

      {/* Info Modal */}
      {showInfo && (
        <InfoModal
          info={showInfo}
          onClose={() => setShowInfo(null)}
        />
      )}
    </div>
  )
}

export default PrivacyConsentStep