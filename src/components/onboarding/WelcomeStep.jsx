function WelcomeStep({ onNext }) {
  return (
    <div className="space-y-8 text-center animate-fade-in">
      {/* Hero Icon */}
      <div className="flex justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl animate-pulse-slow">
          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      {/* Welcome Content */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Traveal!
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-md mx-auto">
          Your smart travel companion for seamless trip tracking and meaningful transportation insights.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="space-y-4 text-left">
        <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Automatic Trip Detection</h3>
            <p className="text-gray-700 text-sm">Smart AI detects your journeys without any manual input</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Privacy Protected</h3>
            <p className="text-gray-700 text-sm">Bank-level security with complete data anonymization</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Make an Impact</h3>
            <p className="text-gray-700 text-sm">Help improve transportation infrastructure and sustainability</p>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="pt-8">
        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-3">
            <span>Let's Get Started</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-gray-500 px-4">
        This will only take 30 seconds to set up
      </p>
    </div>
  )
}

export default WelcomeStep