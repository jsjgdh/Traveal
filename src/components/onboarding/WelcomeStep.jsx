function WelcomeStep({ onNext }) {
  return (
    <div className="space-y-8 text-center animate-fade-in">
      {/* Hero Icon */}
      <div className="flex justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center shadow-xl">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>

      {/* Welcome Content */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Let's Get Started!
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          We'll need a few permissions to help make your travel data collection experience seamless and secure.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-4 p-4 bg-primary-50 rounded-xl">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Automatic Trip Detection</h3>
            <p className="text-sm text-gray-600">Smart technology detects your trips with minimal effort</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-xl">
          <div className="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Privacy First</h3>
            <p className="text-sm text-gray-600">Your data is anonymized and securely protected</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-primary-50 rounded-xl">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Impact Transportation</h3>
            <p className="text-sm text-gray-600">Help improve Kerala's transportation infrastructure</p>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="pt-6">
        <button
          onClick={onNext}
          className="btn-primary w-full text-lg py-4 transform hover:scale-105 transition-transform duration-200"
        >
          Continue Setup
          <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default WelcomeStep