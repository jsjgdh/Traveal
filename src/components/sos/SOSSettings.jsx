import { useState, useEffect } from 'react'
import { Shield, Settings, Users, Volume2, Languages, Smartphone, Save, AlertTriangle, Plus, Trash2, Edit3 } from 'lucide-react'

function SOSSettings() {
  const [sosProfile, setSOSProfile] = useState(null)
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [settings, setSettings] = useState({
    isEnabled: true,
    biometricEnabled: false,
    voiceLanguage: 'en',
    backgroundPermissions: false,
    deviationThreshold: 500
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    relationship: 'family',
    priority: 1
  })
  const [errors, setErrors] = useState({})

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
  ]

  const relationships = [
    { value: 'family', label: 'Family Member' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
  ]

  useEffect(() => {
    loadSOSSettings()
  }, [])

  const loadSOSSettings = async () => {
    try {
      const response = await fetch('/api/v1/sos/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const profile = result.data
        
        setSOSProfile(profile)
        setEmergencyContacts(profile.emergencyContacts || [])
        setSettings({
          isEnabled: profile.isEnabled,
          biometricEnabled: profile.biometricEnabled,
          voiceLanguage: profile.voiceLanguage,
          backgroundPermissions: profile.backgroundPermissions,
          deviationThreshold: 500 // Default value, could be stored in profile
        })
      }
    } catch (error) {
      console.error('Error loading SOS settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/sos/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const result = await response.json()
        setSOSProfile(result.data)
        alert('Settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleContactFormSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = {}
    if (!contactForm.name.trim()) newErrors.name = 'Name is required'
    if (!contactForm.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    if (!contactForm.relationship) newErrors.relationship = 'Relationship is required'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    try {
      const response = await fetch('/api/v1/sos/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...contactForm,
          isActive: true
        })
      })

      if (response.ok) {
        await loadSOSSettings() // Reload to get updated contacts
        setShowAddContact(false)
        setContactForm({
          name: '',
          phoneNumber: '',
          email: '',
          relationship: 'family',
          priority: 1
        })
        alert('Emergency contact added successfully!')
      } else {
        throw new Error('Failed to add contact')
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('Error adding contact. Please try again.')
    }
  }

  const handleTestVoiceAlert = async () => {
    try {
      const response = await fetch('/api/v1/sos/test/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          language: settings.voiceLanguage,
          localArea: 'Kerala' // Default test area
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Play the voice message using browser's speech synthesis
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(result.data.primaryMessage)
          utterance.rate = 0.8
          utterance.volume = 0.8
          speechSynthesis.speak(utterance)
        }
      }
    } catch (error) {
      console.error('Error testing voice alert:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SOS settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">SOS Settings</h1>
              <p className="text-sm text-gray-600">Configure your emergency safety system</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* General Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>

          <div className="space-y-4">
            {/* SOS System Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">SOS System</h3>
                <p className="text-sm text-gray-600">Enable emergency safety system</p>
              </div>
              <button
                onClick={() => handleSettingChange('isEnabled', !settings.isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.isEnabled ? 'bg-red-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Biometric Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Biometric Authentication</h3>
                <p className="text-sm text-gray-600">Use fingerprint/face ID as backup</p>
              </div>
              <button
                onClick={() => handleSettingChange('biometricEnabled', !settings.biometricEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.biometricEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Background Permissions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Background Monitoring</h3>
                <p className="text-sm text-gray-600">Allow app to run in background</p>
              </div>
              <button
                onClick={() => handleSettingChange('backgroundPermissions', !settings.backgroundPermissions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.backgroundPermissions ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.backgroundPermissions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Voice Alert Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Language
              </label>
              <select
                value={settings.voiceLanguage}
                onChange={(e) => handleSettingChange('voiceLanguage', e.target.value)}
                className="input"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleTestVoiceAlert}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Volume2 size={16} />
              <span>Test Voice Alert</span>
            </button>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
            </div>
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={16} />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.phoneNumber}</p>
                  <p className="text-xs text-gray-500">
                    {relationships.find(r => r.value === contact.relationship)?.label} • Priority: {contact.priority}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600">
                    <Edit3 size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            {emergencyContacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No emergency contacts added yet</p>
                <p className="text-sm">Add at least one contact for emergency situations</p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-4">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full btn-primary py-4 flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Emergency Contact</h3>
              
              <form onSubmit={handleContactFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`input ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="Contact name"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={contactForm.phoneNumber}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className={`input ${errors.phoneNumber ? 'border-red-300' : ''}`}
                    placeholder="Phone number"
                  />
                  {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="Email address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                    className="input"
                  >
                    {relationships.map((rel) => (
                      <option key={rel.value} value={rel.value}>{rel.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={contactForm.priority}
                    onChange={(e) => setContactForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="input"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-2"
                  >
                    Add Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SOSSettings