import { useState } from 'react'

function PrivacyConsentStep({ consentData, onConsentChange, onNext, onPrevious, isValid }) {
  const [showInfo, setShowInfo] = useState(null)

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
    onConsentChange(categoryId, optionKey, !currentValue)
  }

  const InfoModal = ({ info, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900">Information</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{info}</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Your Privacy Matters
        </h1>
        <p className="text-gray-600">
          Choose what data you're comfortable sharing. You can change these settings anytime.
        </p>
      </div>

      {/* Consent Categories */}
      <div className="space-y-6">
        {consentCategories.map((category) => (
          <div key={category.id} className="card">
            {/* Category Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {category.options.map((option) => (
                <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {option.label}
                        {option.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      <button
                        onClick={() => setShowInfo(option.info)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleConsent(category.id, option.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      consentData[category.id][option.key]
                        ? 'bg-primary-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
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
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">Required Permissions</p>
            <p className="text-xs text-amber-700 mt-1">
              Location tracking and at least one sensor permission are required for the app to function properly.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          onClick={onPrevious}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button
          onClick={onNext}
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