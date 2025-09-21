import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  User, 
  Settings, 
  Globe, 
  Bell,
  Palette,
  Check,
  X,
  Save
} from 'lucide-react'
import { apiService } from '../../services/api'

function ProfileEdit({ onBack }) {
  const [profileData, setProfileData] = useState({
    preferences: {
      notificationSettings: {
        tripValidation: true,
        achievements: true,
        system: true,
        pushEnabled: false
      },
      privacySettings: {
        dataRetentionDays: 90,
        shareAggregatedData: true
      },
      appSettings: {
        theme: 'system',
        language: 'en',
        units: 'metric'
      }
    }
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success', 'error'
  const [isLoading, setIsLoading] = useState(true)

  // Load current user profile on mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getCurrentUser()
      if (response && response.preferences) {
        setProfileData({
          preferences: response.preferences
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (category, key, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [key]: value
        }
      }
    }))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setSaveStatus(null)
    
    try {
      const response = await apiService.updatePreferences(profileData.preferences)
      
      if (response) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const settingsCategories = [
    {
      id: 'notificationSettings',
      title: 'Notifications',
      description: 'Control when and how you receive notifications',
      icon: <Bell size={20} />,
      settings: [
        {
          key: 'tripValidation',
          label: 'Trip validation reminders',
          description: 'Get notified to validate your trips',
          type: 'toggle'
        },
        {
          key: 'achievements',
          label: 'Achievement notifications',
          description: 'Celebrate when you earn new badges',
          type: 'toggle'
        },
        {
          key: 'system',
          label: 'System notifications',
          description: 'Important app updates and announcements',
          type: 'toggle'
        },
        {
          key: 'pushEnabled',
          label: 'Push notifications',
          description: 'Allow notifications when app is closed',
          type: 'toggle'
        }
      ]
    },
    {
      id: 'appSettings',
      title: 'App Preferences',
      description: 'Customize your app experience',
      icon: <Settings size={20} />,
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System Default' }
          ]
        },
        {
          key: 'language',
          label: 'Language',
          description: 'Select your preferred language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'ml', label: 'മലയാളം (Malayalam)' },
            { value: 'hi', label: 'हिन्दी (Hindi)' }
          ]
        },
        {
          key: 'units',
          label: 'Measurement Units',
          description: 'Distance and speed units',
          type: 'select',
          options: [
            { value: 'metric', label: 'Metric (km, m/s)' },
            { value: 'imperial', label: 'Imperial (miles, mph)' }
          ]
        }
      ]
    },
    {
      id: 'privacySettings',
      title: 'Privacy Preferences',
      description: 'Control your data and privacy settings',
      icon: <User size={20} />,
      settings: [
        {
          key: 'dataRetentionDays',
          label: 'Data retention period',
          description: 'How long to keep your personal data',
          type: 'select',
          options: [
            { value: 30, label: '30 days' },
            { value: 90, label: '90 days (recommended)' },
            { value: 180, label: '6 months' },
            { value: 365, label: '1 year' }
          ]
        },
        {
          key: 'shareAggregatedData',
          label: 'Share aggregated data',
          description: 'Help improve transportation research with anonymous data',
          type: 'toggle'
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
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-600">Loading your settings...</p>
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
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <p className="text-sm text-gray-600">Customize your app preferences</p>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <Check size={20} className="text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">Profile Updated</h4>
              <p className="text-sm text-green-700">Your preferences have been saved successfully.</p>
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
              <p className="text-sm text-red-700">There was an error updating your profile. Please try again.</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Categories */}
      <div className="space-y-6">
        {settingsCategories.map((category) => (
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

            {/* Category Settings */}
            <div className="space-y-4">
              {category.settings.map((setting) => (
                <div key={setting.key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{setting.label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  
                  <div className="ml-4">
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => handleSettingChange(category.id, setting.key, !profileData.preferences[category.id]?.[setting.key])}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                          profileData.preferences[category.id]?.[setting.key] ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                          profileData.preferences[category.id]?.[setting.key] ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    )}

                    {setting.type === 'select' && (
                      <select
                        value={profileData.preferences[category.id]?.[setting.key] || ''}
                        onChange={(e) => {
                          const value = setting.key === 'dataRetentionDays' ? Number(e.target.value) : e.target.value
                          handleSettingChange(category.id, setting.key, value)
                        }}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      >
                        {setting.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
              <Save size={18} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ProfileEdit