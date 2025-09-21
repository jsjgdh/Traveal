import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Shield, 
  Database, 
  FileText, 
  AlertTriangle,
  Check,
  X,
  MapPin,
  BarChart3,
  Mail
} from 'lucide-react'
import { apiService } from '../../services/api'

function ConsentManagement({ onBack }) {
  const [consentSettings, setConsentSettings] = useState({
    locationData: {
      allowTracking: true,
      preciseLocation: true
    },
    sensorData: {
      motionSensors: true,
      activityDetection: false
    },
    usageAnalytics: {
      anonymousStats: false,
      crashReports: true
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success', 'error'
  const [isLoading, setIsLoading] = useState(true)

  // Load current consent settings on mount
  useEffect(() => {
    loadConsentSettings()
  }, [])

  const loadConsentSettings = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentUser()
      if (response && response.consentData) {
        setConsentSettings(response.consentData)
      }
    } catch (error) {
      console.error('Failed to load consent settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConsentChange = (category, key) => {
    setConsentSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    
    try {
      const response = await apiService.updateConsent(consentSettings)
      
      if (response) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Failed to update consent:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const consentCategories = [
    {
      id: 'locationData',
      title: 'Location Data',
      description: 'Controls how your location information is collected and used',
      icon: <MapPin size={20} />,
      options: [
        {
          key: 'allowTracking',
          label: 'Allow location tracking',
          description: 'Required for automatic trip detection and route recording',
          required: true
        },
        {
          key: 'preciseLocation',
          label: 'Precise location data',
          description: 'Enables more accurate route mapping and analytics',
          required: false
        }
      ]
    },
    {
      id: 'sensorData',
      title: 'Sensor Data',
      description: 'Device sensors used for enhanced trip detection',
      icon: <BarChart3 size={20} />,
      options: [
        {
          key: 'motionSensors',
          label: 'Motion sensors',
          description: 'Accelerometer and gyroscope for detecting travel modes',
          required: false
        },
        {
          key: 'activityDetection',
          label: 'Activity recognition',
          description: 'Automatically detect walking, driving, cycling',
          required: false
        }
      ]
    },
    {
      id: 'usageAnalytics',
      title: 'Usage Analytics',
      description: 'Help improve the app with anonymous usage data',
      icon: <Database size={20} />,
      options: [
        {
          key: 'anonymousStats',
          label: 'Anonymous statistics',
          description: 'Share aggregated, anonymous usage patterns',
          required: false
        },
        {
          key: 'crashReports',
          label: 'Crash reports',
          description: 'Automatically send crash reports to help fix bugs',
          required: false
        }
      ]
    }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Consent Management</h2>
            <p className="text-sm text-gray-600">Loading your privacy settings...</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

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
          <h2 className="text-xl font-bold text-gray-900">Consent Management</h2>
          <p className="text-sm text-gray-600">Control how your data is collected and used</p>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <Check size={20} className="text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Settings Saved</h4>
              <p className="text-sm text-green-700">Your consent preferences have been updated successfully.</p>
            </div>
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <X size={20} className="text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Save Failed</h4>
              <p className="text-sm text-red-700">There was an error updating your settings. Please try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Consent Categories */}
      <div className="space-y-6">
        {consentCategories.map((category) => (
          <div key={category.id} className="card">
            {/* Category Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>

            {/* Category Options */}
            <div className="space-y-4">
              {category.options.map((option) => (
                <div key={option.key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      {option.required && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Required</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                  
                  <button
                    onClick={() => !option.required && handleConsentChange(category.id, option.key)}
                    disabled={option.required}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 relative ml-4 ${
                      consentSettings[category.id]?.[option.key] ? 'bg-primary-500' : 'bg-gray-300'
                    } ${option.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                      consentSettings[category.id]?.[option.key] ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="card border-yellow-200 bg-yellow-50">
        <div className="flex items-start space-x-3">
          <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Important Privacy Information</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• You can withdraw consent at any time by changing these settings</li>
              <li>• Required permissions are necessary for core app functionality</li>
              <li>• All data is anonymized before being used for research purposes</li>
              <li>• Location data is processed locally and aggregated for privacy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Shield size={18} />
              <span>Save Consent Preferences</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ConsentManagement