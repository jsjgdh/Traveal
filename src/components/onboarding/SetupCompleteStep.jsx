function SetupCompleteStep({ onComplete, onPrevious, consentData }) {
  const getGrantedPermissions = () => {
    const permissions = []
    
    if (consentData.locationData.allowTracking) {
      permissions.push({ name: 'Location Tracking', icon: '📍', essential: true })
    }
    if (consentData.locationData.preciseLocation) {
      permissions.push({ name: 'Precise Location', icon: '🎯', essential: false })
    }
    if (consentData.sensorData.motionSensors) {
      permissions.push({ name: 'Motion Sensors', icon: '📱', essential: false })
    }
    if (consentData.sensorData.activityDetection) {
      permissions.push({ name: 'Activity Detection', icon: '🚶', essential: false })
    }
    if (consentData.usageAnalytics.anonymousStats) {
      permissions.push({ name: 'Usage Analytics', icon: '📊', essential: false })
    }
    if (consentData.usageAnalytics.crashReports) {
      permissions.push({ name: 'Crash Reports', icon: '🔧', essential: false })
    }
    
    return permissions
  }

  const grantedPermissions = getGrantedPermissions()

  return (
    <div className="space-y-8 text-center">
      {/* Success Animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Celebration particles */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          🎉 You're All Set!
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Welcome to Traveal! Your smart travel companion is ready to start collecting meaningful data.
        </p>
      </div>

      {/* Granted Permissions Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
        <h3 className="font-bold text-gray-900 mb-6 text-xl">
          ✅ Active Permissions
        </h3>
        <div className="grid gap-3">
          {grantedPermissions.map((permission, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{permission.icon}</span>
                <div className="text-left">
                  <span className="font-medium text-gray-900">{permission.name}</span>
                  {permission.essential && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Essential</span>
                  )}
                </div>
              </div>
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-100 rounded-xl">
          <p className="text-sm text-blue-800 font-medium">💡 Pro Tip</p>
          <p className="text-sm text-blue-700 mt-1">
            You can modify these permissions anytime by visiting Settings → Privacy & Data.
          </p>
        </div>
      </div>

      {/* What's Next Guide */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="font-bold text-gray-900 text-xl mb-6">🚀 What Happens Next?</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
              1
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-lg">🔄 Automatic Detection</p>
              <p className="text-gray-700">Your phone will quietly track trips in the background - no effort required!</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
              2
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-lg">✏️ Quick Validation</p>
              <p className="text-gray-700">Review detected trips and add details like purpose and companions in seconds.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
              3
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-lg">🌍 Make Impact</p>
              <p className="text-gray-700">Your anonymous data helps improve transportation planning across Kerala!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 pt-6">
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-5 px-8 rounded-2xl text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <span>🚀 Start My Journey</span>
          </div>
        </button>
        
        <button
          onClick={onPrevious}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200"
        >
          ← Back to Settings
        </button>
      </div>

      {/* Final Privacy Assurance */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h4 className="text-lg font-bold text-green-800">🔒 Privacy Promise</h4>
        </div>
        <p className="text-green-700 text-center">
          Your data is <strong>fully anonymized</strong>, <strong>encrypted</strong>, and used exclusively for transportation research. No personal information is ever shared.
        </p>
      </div>
    </div>
  )
}

export default SetupCompleteStep