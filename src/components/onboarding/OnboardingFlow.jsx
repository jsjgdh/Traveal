import { useState } from 'react'
import ProgressBar from './ProgressBar'
import WelcomeStep from './WelcomeStep'
import PrivacyConsentStep from './PrivacyConsentStep'
import SetupCompleteStep from './SetupCompleteStep'

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'privacy', title: 'Privacy & Consent' },
  { id: 'complete', title: 'Setup Complete' }
]

function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [consentData, setConsentData] = useState({
    locationData: {
      allowTracking: false,
      preciseLocation: false
    },
    sensorData: {
      motionSensors: false,
      activityDetection: false
    },
    usageAnalytics: {
      anonymousStats: false,
      crashReports: false
    }
  })

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleConsentChange = (category, option, value) => {
    setConsentData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: value
      }
    }))
  }

  const handleComplete = () => {
    // Save consent data and complete onboarding
    localStorage.setItem('natpac_consent', JSON.stringify(consentData))
    localStorage.setItem('natpac_onboarded', 'true')
    onComplete(consentData)
  }

  const isRequiredConsentsGiven = () => {
    // Required: Location tracking and at least one sensor permission
    return consentData.locationData.allowTracking && 
           (consentData.sensorData.motionSensors || consentData.sensorData.activityDetection)
  }

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return <WelcomeStep onNext={handleNext} />
      case 'privacy':
        return (
          <PrivacyConsentStep
            consentData={consentData}
            onConsentChange={handleConsentChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isValid={isRequiredConsentsGiven()}
          />
        )
      case 'complete':
        return (
          <SetupCompleteStep
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            consentData={consentData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="mobile-container bg-white min-h-screen">
      <div className="px-4 py-6">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
        />
        
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default OnboardingFlow