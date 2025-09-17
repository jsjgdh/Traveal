import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Shield, Clock, MapPin, Phone, Volume2, VolumeX } from 'lucide-react'

function SOSEmergencyAlert({ 
  alert, 
  onPasswordSubmit, 
  onDismiss, 
  showVoicePlayer = true 
}) {
  const [password, setPassword] = useState('')
  const [isPartialPassword, setIsPartialPassword] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60) // 60 seconds grace period
  const [isVoicePlaying, setIsVoicePlaying] = useState(false)
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Voice message content
  const voiceMessage = {
    primary: `This is the police of ${alert.localArea || 'your area'}. We are checking on you to confirm if you are fine.`,
    secondary: 'You have 1 minute to enter your password to confirm you are safe, or the police will arrive at your destination.'
  }

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(time => time - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // Time expired, escalate alert
      onPasswordSubmit(null, false, true) // escalate = true
    }
  }, [timeRemaining, onPasswordSubmit])

  // Auto-play voice alert after 3 seconds
  useEffect(() => {
    const autoPlayTimer = setTimeout(() => {
      if (showVoicePlayer && !alert.isStealthMode) {
        playVoiceAlert()
      }
    }, 3000)

    return () => clearTimeout(autoPlayTimer)
  }, [alert.isStealthMode, showVoicePlayer])

  const playVoiceAlert = useCallback(() => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel()
      
      setIsVoicePlaying(true)
      
      // Create speech utterances
      const primarySpeech = new SpeechSynthesisUtterance(voiceMessage.primary)
      const secondarySpeech = new SpeechSynthesisUtterance(voiceMessage.secondary)
      
      // Set voice properties
      primarySpeech.rate = 0.8
      primarySpeech.volume = 1.0
      primarySpeech.pitch = 1.0
      
      secondarySpeech.rate = 0.8
      secondarySpeech.volume = 1.0
      secondarySpeech.pitch = 1.0
      
      // Set language if specified
      if (alert.voiceLanguage && alert.voiceLanguage !== 'en') {
        const languageMap = {
          'hi': 'hi-IN',
          'ml': 'ml-IN',
          'ta': 'ta-IN',
          'te': 'te-IN',
          'kn': 'kn-IN'
        }
        primarySpeech.lang = languageMap[alert.voiceLanguage] || 'en-US'
      }
      
      // Play primary message first
      primarySpeech.onend = () => {
        // Short pause before secondary message
        setTimeout(() => {
          secondarySpeech.lang = 'en-US' // Secondary always in English
          window.speechSynthesis.speak(secondarySpeech)
        }, 1000)
      }
      
      secondarySpeech.onend = () => {
        setIsVoicePlaying(false)
        setShowPasswordInput(true)
      }
      
      primarySpeech.onerror = () => {
        setIsVoicePlaying(false)
        setShowPasswordInput(true)
      }
      
      secondarySpeech.onerror = () => {
        setIsVoicePlaying(false)
        setShowPasswordInput(true)
      }
      
      window.speechSynthesis.speak(primarySpeech)
    } else {
      // Fallback if speech synthesis not available
      setShowPasswordInput(true)
    }
  }, [voiceMessage, alert.voiceLanguage])

  const stopVoiceAlert = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsVoicePlaying(false)
    setShowPasswordInput(true)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) return

    setIsSubmitting(true)
    try {
      const success = await onPasswordSubmit(password, isPartialPassword, false)
      if (!success) {
        setAttempts(prev => prev + 1)
        setPassword('')
        
        if (attempts >= 2) { // Max 3 attempts (0, 1, 2)
          // Escalate alert after max attempts
          onPasswordSubmit(null, false, true)
        }
      }
    } catch (error) {
      console.error('Error submitting password:', error)
      setAttempts(prev => prev + 1)
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'high': return 'text-red-600 bg-red-100'
      case 'critical': return 'text-red-700 bg-red-200'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">SOS ALERT ACTIVATED</h2>
              <p className="text-red-100">Emergency safety protocol engaged</p>
            </div>
          </div>
        </div>

        {/* Alert Info */}
        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-600" />
              <span className="font-medium">Alert Status:</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(alert.severity)}`}>
              {alert.severity.toUpperCase()}
            </span>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium">Time Remaining:</span>
            </div>
            <span className={`text-lg font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-orange-600'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Location */}
          {alert.triggerLocation && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Location:</span>
              <span className="text-sm text-gray-600">
                {alert.triggerLocation.latitude.toFixed(6)}, {alert.triggerLocation.longitude.toFixed(6)}
              </span>
            </div>
          )}

          {/* Alert Type */}
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium">Trigger:</span>
            <span className="text-sm text-gray-600">
              {alert.alertType.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Voice Alert Section */}
        {showVoicePlayer && !alert.isStealthMode && (
          <div className="px-6 pb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-blue-900">Voice Alert</h3>
                {isVoicePlaying ? (
                  <button
                    onClick={stopVoiceAlert}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <VolumeX size={16} />
                    <span className="text-sm">Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={playVoiceAlert}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <Volume2 size={16} />
                    <span className="text-sm">Play</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-blue-800">
                <p className="font-medium">{voiceMessage.primary}</p>
                <p>{voiceMessage.secondary}</p>
              </div>
              
              {isVoicePlaying && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700">Playing voice alert...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Input */}
        {(showPasswordInput || alert.isStealthMode) && (
          <div className="px-6 pb-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your safety password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Enter password"
                  autoFocus
                />
                {attempts > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Invalid password. Attempts remaining: {3 - attempts}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="partialPassword"
                  checked={isPartialPassword}
                  onChange={(e) => setIsPartialPassword(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="partialPassword" className="text-sm text-gray-700">
                  This is my stealth mode password
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !password.trim()}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'I\'m Safe'
                  )}
                </button>
                
                {alert.alertType === 'manual_trigger' && (
                  <button
                    type="button"
                    onClick={onDismiss}
                    className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Emergency Contacts Info */}
        <div className="px-6 pb-6 border-t bg-gray-50">
          <div className="pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Emergency Response</span>
            </div>
            <p className="text-xs text-gray-600">
              If you cannot enter your password within the time limit, your emergency contacts 
              and local authorities will be notified with your location.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SOSEmergencyAlert