/**
 * Voice Alert Service for SOS Emergency System
 * Provides multi-language voice alerts with Web Speech API
 */

class VoiceAlertService {
  constructor() {
    this.isSupported = 'speechSynthesis' in window
    this.voices = []
    this.currentUtterance = null
    this.isPlaying = false
    this.callbacks = {
      onStart: null,
      onEnd: null,
      onError: null
    }

    // Load available voices
    this.loadVoices()
    
    // Listen for voice changes
    if (this.isSupported) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }

  /**
   * Load available voices
   */
  loadVoices() {
    if (this.isSupported) {
      this.voices = speechSynthesis.getVoices()
    }
  }

  /**
   * Get voice messages in different languages
   */
  getVoiceMessages(localArea = 'your area', language = 'en') {
    const messages = {
      en: {
        primary: `This is the police of ${localArea}. We are checking on you to confirm if you are fine.`,
        secondary: 'You have 1 minute to enter your password to confirm you are safe, or the police will arrive at your destination.',
        timeWarning: 'Time is running out. Please enter your password now.',
        escalated: 'Emergency services have been notified and are on their way.'
      },
      hi: {
        primary: `यह ${localArea} की पुलिस है। हम आपसे संपर्क कर रहे हैं यह सुनिश्चित करने के लिए कि आप ठीक हैं।`,
        secondary: 'आपके पास अपनी सुरक्षा की पुष्टि करने के लिए पासवर्ड दर्ज करने के लिए 1 मिनट है, या पुलिस आपके गंतव्य पर पहुंच जाएगी।',
        timeWarning: 'समय समाप्त हो रहा है। कृपया अभी अपना पासवर्ड दर्ज करें।',
        escalated: 'आपातकालीन सेवाओं को सूचित कर दिया गया है और वे रास्ते में हैं।'
      },
      ml: {
        primary: `ഇത് ${localArea} പോലീസാണ്. നിങ്ങൾ സുരക്ഷിതരാണെന്ന് ഉറപ്പാക്കാൻ ഞങ്ങൾ നിങ്ങളെ പരിശോധിക്കുകയാണ്.`,
        secondary: 'നിങ്ങളുടെ സുരക്ഷ സ്ഥിരീകരിക്കാൻ പാസ്‌വേഡ് നൽകാൻ നിങ്ങൾക്ക് 1 മിനിറ്റ് സമയമുണ്ട്, അല്ലെങ്കിൽ പോലീസ് നിങ്ങളുടെ ലക്ഷ്യസ്ഥാനത്ത് എത്തും.',
        timeWarning: 'സമയം തീർന്നുകൊണ്ടിരിക്കുന്നു. ദയവായി ഇപ്പോൾ നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക.',
        escalated: 'അടിയന്തര സേവനങ്ങളെ അറിയിച്ചിട്ടുണ്ട്, അവർ വഴിയിലാണ്.'
      },
      ta: {
        primary: `இது ${localArea} பொலிஸ். நீங்கள் நன்றாக இருக்கிறீர்களா என்பதை உறுதிப்படுத்த நாங்கள் உங்களைச் சரிபார்க்கிறோம்.`,
        secondary: 'நீங்கள் பாதுகாப்பாக இருப்பதை உறுதிப்படுத்த கடவுச்சொல்லை உள்ளிட உங்களுக்கு 1 நிமிடம் உள்ளது, அல்லது பொலிஸார் உங்கள் இலக்கிற்கு வருவார்கள்.',
        timeWarning: 'நேரம் முடிந்துவிடுகிறது. தயவுசெய்து இப்போது உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்.',
        escalated: 'அவசர சேவைகளுக்கு அறிவிக்கப்பட்டுள்ளது மற்றும் அவை வழியில் உள்ளன.'
      },
      te: {
        primary: `ఇది ${localArea} పోలీసులు. మీరు సురక్షితంగా ఉన్నారా అని నిర్ధారించుకోవడానికి మేము మిమ్మల్ని చెక్ చేస్తున్నాము.`,
        secondary: 'మీరు సురక్షితంగా ఉన్నారని నిర్ధారించడానికి పాస్‌వర్డ్ ఎంటర్ చేయడానికి మీకు 1 నిమిషం సమయం ఉంది, లేకపోతే పోలీసులు మీ గమ్యస్థానానికి చేరుకుంటారు.',
        timeWarning: 'సమయం అయిపోతుంది. దయచేసి ఇప్పుడే మీ పాస్‌వర్డ్ ఎంటర్ చేయండి.',
        escalated: 'అత్యవసర సేవలకు తెలియజేయబడింది మరియు అవి దారిలో ఉన్నాయి.'
      },
      kn: {
        primary: `ಇದು ${localArea} ಪೊಲೀಸ್. ನೀವು ಸುರಕ್ಷಿತವಾಗಿ ಇದ್ದೀರಾ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು ನಾವು ನಿಮ್ಮನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇವೆ.`,
        secondary: 'ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ ಎಂದು ದೃಢೀಕರಿಸಲು ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ನಮೂದಿಸಲು ನಿಮಗೆ 1 ನಿಮಿಷ ಸಮಯವಿದೆ, ಅಥವಾ ಪೊಲೀಸರು ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನಕ್ಕೆ ಬರುತ್ತಾರೆ.',
        timeWarning: 'ಸಮಯ ಮುಗಿಯುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಈಗ ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ನಮೂದಿಸಿ.',
        escalated: 'ತುರ್ತು ಸೇವೆಗಳಿಗೆ ತಿಳಿಸಲಾಗಿದೆ ಮತ್ತು ಅವರು ದಾರಿಯಲ್ಲಿದ್ದಾರೆ.'
      }
    }

    return messages[language] || messages.en
  }

  /**
   * Get the best voice for a given language
   */
  getBestVoice(language = 'en') {
    const languageMap = {
      'en': ['en-US', 'en-GB', 'en'],
      'hi': ['hi-IN', 'hi'],
      'ml': ['ml-IN', 'ml'],
      'ta': ['ta-IN', 'ta'],
      'te': ['te-IN', 'te'],
      'kn': ['kn-IN', 'kn']
    }

    const preferredLanguages = languageMap[language] || ['en-US', 'en']
    
    // Find voice matching preferred languages
    for (const lang of preferredLanguages) {
      const voice = this.voices.find(v => v.lang.startsWith(lang))
      if (voice) return voice
    }

    // Fallback to default voice
    return this.voices[0] || null
  }

  /**
   * Play voice alert with specified message and language
   */
  async playAlert({
    message,
    language = 'en',
    rate = 0.8,
    volume = 1.0,
    pitch = 1.0,
    onStart = null,
    onEnd = null,
    onError = null
  }) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        const error = new Error('Speech synthesis not supported')
        if (onError) onError(error)
        reject(error)
        return
      }

      // Stop any current speech
      this.stop()

      // Create utterance
      this.currentUtterance = new SpeechSynthesisUtterance(message)
      
      // Set voice properties
      this.currentUtterance.rate = rate
      this.currentUtterance.volume = volume
      this.currentUtterance.pitch = pitch

      // Set voice
      const voice = this.getBestVoice(language)
      if (voice) {
        this.currentUtterance.voice = voice
        this.currentUtterance.lang = voice.lang
      } else {
        this.currentUtterance.lang = language === 'en' ? 'en-US' : `${language}-IN`
      }

      // Set event handlers
      this.currentUtterance.onstart = () => {
        this.isPlaying = true
        if (onStart) onStart()
      }

      this.currentUtterance.onend = () => {
        this.isPlaying = false
        this.currentUtterance = null
        if (onEnd) onEnd()
        resolve()
      }

      this.currentUtterance.onerror = (event) => {
        this.isPlaying = false
        this.currentUtterance = null
        const error = new Error(`Speech synthesis error: ${event.error}`)
        if (onError) onError(error)
        reject(error)
      }

      // Speak
      speechSynthesis.speak(this.currentUtterance)
    })
  }

  /**
   * Play emergency alert sequence
   */
  async playEmergencySequence({
    localArea = 'your area',
    language = 'en',
    primaryLanguage = 'en',
    pauseBetweenMessages = 1000,
    onStart = null,
    onEnd = null,
    onError = null,
    onMessageComplete = null
  }) {
    try {
      if (onStart) onStart()

      const messages = this.getVoiceMessages(localArea, language)
      const englishMessages = this.getVoiceMessages(localArea, 'en')

      // Play primary message in local language
      await this.playAlert({
        message: messages.primary,
        language: language,
        rate: 0.8,
        volume: 1.0,
        onError
      })

      if (onMessageComplete) onMessageComplete('primary', language)

      // Pause between messages
      await this.delay(pauseBetweenMessages)

      // Play secondary message in English
      await this.playAlert({
        message: englishMessages.secondary,
        language: 'en',
        rate: 0.8,
        volume: 1.0,
        onError
      })

      if (onMessageComplete) onMessageComplete('secondary', 'en')

      if (onEnd) onEnd()
    } catch (error) {
      if (onError) onError(error)
      throw error
    }
  }

  /**
   * Play time warning message
   */
  async playTimeWarning(language = 'en') {
    const messages = this.getVoiceMessages('', language)
    return this.playAlert({
      message: messages.timeWarning,
      language: language,
      rate: 0.9,
      volume: 1.0,
      pitch: 1.1
    })
  }

  /**
   * Play escalation message
   */
  async playEscalationAlert(language = 'en') {
    const messages = this.getVoiceMessages('', language)
    return this.playAlert({
      message: messages.escalated,
      language: language,
      rate: 0.8,
      volume: 1.0,
      pitch: 0.9
    })
  }

  /**
   * Test voice alert
   */
  async testVoiceAlert(language = 'en', localArea = 'test area') {
    const testMessage = language === 'en' 
      ? `This is a test of the emergency voice alert system for ${localArea}.`
      : this.getVoiceMessages(localArea, language).primary

    return this.playAlert({
      message: testMessage,
      language: language,
      rate: 0.8,
      volume: 0.8
    })
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.isSupported && speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    this.isPlaying = false
    this.currentUtterance = null
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.isSupported && speechSynthesis.speaking) {
      speechSynthesis.pause()
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.isSupported && speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }

  /**
   * Check if speech is currently playing
   */
  isCurrentlyPlaying() {
    return this.isPlaying && speechSynthesis.speaking
  }

  /**
   * Get available voices for a language
   */
  getAvailableVoices(language = null) {
    if (!language) return this.voices
    
    return this.voices.filter(voice => 
      voice.lang.startsWith(language) || 
      voice.lang.startsWith(language.split('-')[0])
    )
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
    ]
  }

  /**
   * Check browser compatibility
   */
  checkCompatibility() {
    return {
      speechSynthesis: 'speechSynthesis' in window,
      voicesAvailable: this.voices.length > 0,
      supportedLanguages: this.getSupportedLanguages().filter(lang => 
        this.getAvailableVoices(lang.code).length > 0
      )
    }
  }
}

// Export singleton instance
export const voiceAlertService = new VoiceAlertService()
export default voiceAlertService