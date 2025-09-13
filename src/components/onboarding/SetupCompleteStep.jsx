function SetupCompleteStep({ onComplete, onPrevious, consentData }) {
  const getGrantedPermissions = () => {
    const permissions = []
    
    if (consentData.locationData.allowTracking) {
      permissions.push('Location Tracking')
    }
    if (consentData.locationData.preciseLocation) {
      permissions.push('Precise Location')
    }
    if (consentData.sensorData.motionSensors) {
      permissions.push('Motion Sensors')
    }
    if (consentData.sensorData.activityDetection) {
      permissions.push('Activity Detection')
    }
    if (consentData.usageAnalytics.anonymousStats) {
      permissions.push('Usage Analytics')
    }
    if (consentData.usageAnalytics.crashReports) {
      permissions.push('Crash Reports')
    }
    
    return permissions
  }

  const grantedPermissions = getGrantedPermissions()

  return (
    <div className="space-y-8 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          All Set!
        </h1>
        <p className="text-lg text-gray-600">
          Your NATPAC Travel Data Collection app is ready to use.
        </p>
      </div>

      {/* Granted Permissions Summary */}
      <div className="card text-left">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          Permissions Granted
        </h3>
        <div className="space-y-2">
          {grantedPermissions.map((permission, index) => (
            <div key={index} className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-secondary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{permission}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            You can modify these permissions anytime in the app settings.
          </p>
        </div>
      </div>

      {/* What's Next */}
      <div className="space-y-4 text-left">
        <h3 className="font-semibold text-gray-900 text-center">What's Next?</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Start Collecting Data</p>
              <p className="text-sm text-gray-600">The app will automatically detect your trips in the background.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg">
            <div className="w-8 h-8 bg-secondary-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Review Your Trips</p>
              <p className="text-sm text-gray-600">Verify and add details to automatically detected trips.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Make an Impact</p>
              <p className="text-sm text-gray-600">Your data contributes to better transportation planning for Kerala.</p>
            </div>
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
          onClick={onComplete}
          className="btn-primary flex-1 text-lg py-4 transform hover:scale-105 transition-transform duration-200"
        >
          Start Using App
          <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Privacy Reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-blue-800 font-medium">Your privacy is protected</p>
        </div>
        <p className="text-xs text-blue-700 text-center mt-1">
          All data is anonymized and used only for transportation research
        </p>
      </div>
    </div>
  )
}

export default SetupCompleteStep