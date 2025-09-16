import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Palette, 
  Globe, 
  Battery,
  Moon,
  Sun,
  Smartphone,
  Volume2,
  VolumeX,
  Zap,
  Settings2
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

function AppPreferences({ onBack }) {
  const { theme, isSystemTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme()
  const [language, setLanguage] = useState('en')
  const [batteryMode, setBatteryMode] = useState('balanced') // 'performance', 'balanced', 'saver'
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hapticEnabled, setHapticEnabled] = useState(true)

  const getCurrentTheme = () => {
    if (isSystemTheme) return 'auto'
    return theme
  }

  const handleThemeChange = (selectedTheme) => {
    switch (selectedTheme) {
      case 'light':
        setLightTheme()
        break
      case 'dark':
        setDarkTheme()
        break
      case 'auto':
        setSystemTheme()
        break
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark theme' },
    { value: 'auto', label: 'Auto', icon: Smartphone, description: 'Follow system setting' }
  ]

  const languageOptions = [
    { value: 'en', label: 'English', native: 'English' },
    { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { value: 'ta', label: 'Tamil', native: 'தமிழ்' }
  ]

  const batteryModes = [
    { 
      value: 'performance', 
      label: 'Performance', 
      description: 'Most accurate tracking, higher battery usage',
      icon: Zap
    },
    { 
      value: 'balanced', 
      label: 'Balanced', 
      description: 'Good accuracy with moderate battery usage',
      icon: Battery
    },
    { 
      value: 'saver', 
      label: 'Battery Saver', 
      description: 'Reduced tracking frequency to save battery',
      icon: Battery
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">App Preferences</h2>
          <p className="text-sm text-gray-600">Customize your app experience</p>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
        </div>
        
        <div className="grid gap-3">
          {themeOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`card p-4 text-left transition-all duration-200 ${
                  getCurrentTheme() === option.value 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400' 
                    : 'hover:shadow-lg dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    getCurrentTheme() === option.value ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{option.label}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Language Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Globe size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Language</h3>
        </div>
        
        <div className="card">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.native})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-2">
            Changes will take effect after restarting the app
          </p>
        </div>
      </div>

      {/* Battery Optimization */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Battery size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Battery Optimization</h3>
        </div>
        
        <div className="space-y-3">
          {batteryModes.map((mode) => {
            const IconComponent = mode.icon
            return (
              <button
                key={mode.value}
                onClick={() => setBatteryMode(mode.value)}
                className={`w-full card p-4 text-left transition-all duration-200 ${
                  batteryMode === mode.value 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    batteryMode === mode.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{mode.label}</h4>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Other Preferences */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings2 size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Other Preferences</h3>
        </div>
        
        <div className="space-y-3">
          <div className="card flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                {soundEnabled ? <Volume2 size={18} className="text-gray-600" /> : <VolumeX size={18} className="text-gray-600" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Sound Effects</h4>
                <p className="text-sm text-gray-600">Play sounds for app interactions</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                soundEnabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="card flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Smartphone size={18} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Haptic Feedback</h4>
                <p className="text-sm text-gray-600">Vibration for button taps and alerts</p>
              </div>
            </div>
            <button
              onClick={() => setHapticEnabled(!hapticEnabled)}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                hapticEnabled ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                hapticEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full btn-primary">
        Save Preferences
      </button>
    </div>
  )
}

export default AppPreferences