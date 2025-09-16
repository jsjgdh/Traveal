import { useState, useEffect } from 'react'
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

  // For debugging - log current state
  console.log(`OnboardingFlow rendered - currentStep: ${currentStep}, stepId: ${STEPS[currentStep]?.id}`)

  // Development helper - press Ctrl+R to reset onboarding
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (process.env.NODE_ENV === 'development' && e.ctrlKey && e.key === 'r') {
        console.log('Development: Resetting onboarding flow')
        localStorage.removeItem('natpac_onboarded')
        localStorage.removeItem('natpac_consent')
        setCurrentStep(0)
        setConsentData({
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
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleNext = () => {
    console.log(`OnboardingFlow - handleNext called, currentStep: ${currentStep}, maxStep: ${STEPS.length - 1}`)
    if (currentStep < STEPS.length - 1) {
      const newStep = currentStep + 1
      console.log(`OnboardingFlow - Moving to step ${newStep}: ${STEPS[newStep].title}`)
      setCurrentStep(newStep)
    }
  }

  const handlePrevious = () => {
    console.log(`OnboardingFlow - handlePrevious called, currentStep: ${currentStep}`)
    if (currentStep > 0) {
      const newStep = currentStep - 1
      console.log(`OnboardingFlow - Moving to step ${newStep}: ${STEPS[newStep].title}`)
      setCurrentStep(newStep)
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
    const hasLocationTracking = consentData.locationData.allowTracking
    const hasSensorPermission = consentData.sensorData.motionSensors || consentData.sensorData.activityDetection
    const isValid = hasLocationTracking && hasSensorPermission
    
    console.log('OnboardingFlow - Checking consent validation:', {
      hasLocationTracking,
      hasSensorPermission,
      isValid,
      consentData
    })
    
    return isValid
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