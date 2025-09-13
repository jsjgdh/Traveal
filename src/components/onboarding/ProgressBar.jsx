function ProgressBar({ currentStep, totalSteps, steps }) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                  index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                style={{ width: '40px' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Step {currentStep + 1} of {totalSteps}</span>
          <span className="text-primary-600 font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Current step title */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {steps[currentStep].title}
        </h2>
      </div>
    </div>
  )
}

export default ProgressBar