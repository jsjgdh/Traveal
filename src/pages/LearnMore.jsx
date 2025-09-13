import { useNavigate } from 'react-router-dom'

function LearnMore() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/')
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">
          About NATPAC Travel Data Collection
        </h1>
        <p className="text-gray-600">
          Understanding how the app works and helps improve transportation in Kerala
        </p>
      </div>

      {/* How It Works Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
        
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Enable Location Services</h3>
                <p className="text-sm text-gray-600">Allow the app to detect your movements and identify trips automatically.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Travel Naturally</h3>
                <p className="text-sm text-gray-600">Continue your daily commute and travel routines as normal.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Verify Trip Details</h3>
                <p className="text-sm text-gray-600">Confirm automatically detected trips and add any missing information.</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Contribute to Research</h3>
                <p className="text-sm text-gray-600">Your anonymized data helps improve Kerala's transportation infrastructure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
        
        <div className="card space-y-3">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium text-gray-900">Data Anonymization</span>
          </div>
          <p className="text-sm text-gray-600 ml-9">
            All personal identifiers are removed before data analysis. Your trips cannot be traced back to you.
          </p>
          
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium text-gray-900">Secure Storage</span>
          </div>
          <p className="text-sm text-gray-600 ml-9">
            Data is encrypted and stored securely following government data protection standards.
          </p>
          
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-gray-900">User Control</span>
          </div>
          <p className="text-sm text-gray-600 ml-9">
            You can pause data collection, delete your data, or opt out at any time.
          </p>
        </div>
      </div>

      {/* Research Impact */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Research Impact</h2>
        
        <div className="card">
          <p className="text-sm text-gray-600 mb-3">
            Your participation helps NATPAC researchers understand:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Travel patterns and peak usage times</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Public transportation efficiency</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Infrastructure improvement opportunities</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Environmental impact of transportation choices</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4">
        <button 
          onClick={handleGetStarted}
          className="btn-primary w-full"
        >
          Start Contributing Now
        </button>
      </div>

      {/* Contact */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 mb-2">
          Questions? Contact NATPAC Research Team
        </p>
        <p className="text-xs text-gray-400">
          research@natpac.kerala.gov.in
        </p>
      </div>
    </div>
  )
}

export default LearnMore