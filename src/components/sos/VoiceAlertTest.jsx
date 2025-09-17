import { useState, useEffect } from 'react'
import { Volume2, VolumeX, Play, Pause, Settings, TestTube } from 'lucide-react'
import voiceAlertService from '../../services/voiceAlertService'

function VoiceAlertTest() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [localArea, setLocalArea] = useState('Kerala')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [volume, setVolume] = useState(80)
  const [rate, setRate] = useState(80)
  const [compatibility, setCompatibility] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')

  useEffect(() => {
    // Check compatibility
    const compat = voiceAlertService.checkCompatibility()
    setCompatibility(compat)

    // Load available voices
    const voices = voiceAlertService.getAvailableVoices()
    setAvailableVoices(voices)
    
    if (voices.length > 0) {
      setSelectedVoice(voices[0].name)
    }
  }, [])

  const supportedLanguages = voiceAlertService.getSupportedLanguages()

  const handleTestVoice = async () => {
    if (isPlaying) {
      voiceAlertService.stop()
      setIsPlaying(false)
      setCurrentMessage('')
      return
    }

    try {
      setIsPlaying(true)
      setCurrentMessage('Testing voice alert...')
      
      await voiceAlertService.testVoiceAlert(selectedLanguage, localArea)
      
      setIsPlaying(false)
      setCurrentMessage('')
    } catch (error) {
      console.error('Voice test error:', error)
      setIsPlaying(false)
      setCurrentMessage('Voice test failed')
    }
  }

  const handleEmergencySequence = async () => {
    if (isPlaying) {
      voiceAlertService.stop()
      setIsPlaying(false)
      setCurrentMessage('')
      return
    }

    try {
      setIsPlaying(true)
      
      await voiceAlertService.playEmergencySequence({
        localArea,
        language: selectedLanguage,
        onStart: () => setCurrentMessage('Starting emergency sequence...'),
        onMessageComplete: (messageType, lang) => {
          setCurrentMessage(`Played ${messageType} message in ${lang}`)
        },
        onEnd: () => {
          setIsPlaying(false)
          setCurrentMessage('Emergency sequence completed')
        },
        onError: (error) => {
          console.error('Emergency sequence error:', error)
          setIsPlaying(false)
          setCurrentMessage('Emergency sequence failed')
        }
      })
    } catch (error) {
      console.error('Emergency sequence error:', error)
      setIsPlaying(false)
      setCurrentMessage('Emergency sequence failed')
    }
  }

  if (!compatibility) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voice system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TestTube className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Voice Alert Test</h1>
          <p className="text-gray-600">
            Test the emergency voice alert system with different languages and settings
          </p>
        </div>

        {/* Settings */}
        <div className="card mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Voice Settings</h3>
          </div>
          
          <div className="space-y-4">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Local Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Local Area
              </label>
              <input
                type="text"
                value={localArea}
                onChange={(e) => setLocalArea(e.target.value)}
                className="input"
                placeholder="Enter local area name"
              />
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Test Controls</h3>
          
          {/* Current Status */}
          {(isPlaying || currentMessage) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                {isPlaying && (
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                )}
                <span className="text-blue-800 text-sm">
                  {currentMessage || 'Playing voice alert...'}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* Simple Test */}
            <button
              onClick={handleTestVoice}
              disabled={!compatibility.speechSynthesis}
              className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                isPlaying 
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
              }`}
            >
              {isPlaying ? (
                <>
                  <VolumeX size={20} />
                  <span>Stop Test</span>
                </>
              ) : (
                <>
                  <Volume2 size={20} />
                  <span>Test Voice Alert</span>
                </>
              )}
            </button>

            {/* Emergency Sequence */}
            <button
              onClick={handleEmergencySequence}
              disabled={!compatibility.speechSynthesis || isPlaying}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Play size={20} />
              <span>Test Emergency Sequence</span>
            </button>
          </div>
        </div>

        {/* Sample Messages */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Sample Messages</h3>
          <div className="space-y-4">
            {(() => {
              const messages = voiceAlertService.getVoiceMessages(localArea, selectedLanguage)
              return (
                <>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Primary Message:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {messages.primary}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Secondary Message:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {messages.secondary}
                    </p>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceAlertTest