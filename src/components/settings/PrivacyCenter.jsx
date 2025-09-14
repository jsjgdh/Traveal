import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  MapPin, 
  Smartphone, 
  BarChart3, 
  Users,
  Shield,
  Database,
  Calendar,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

function PrivacyCenter({ onBack, isStandalone = true }) {
  const [dataCollectionSettings, setDataCollectionSettings] = useState({
    location: true,
    motion: true,
    usage: false,
    contacts: false
  })

  const [dataSummary] = useState({
    tripsCollected: 156,
    dataSize: '2.4 MB',
    lastExport: '2024-01-10',
    collectionSince: '2023-12-01'
  })

  const [sharingPreferences, setSharingPreferences] = useState({
    aggregatedData: true,
    researchInstitutions: true,
    governmentAgencies: true,
    thirdPartyApps: false,
    marketingPartners: false
  })

  const handleDataToggle = (key) => {
    if (key === 'location' || key === 'motion') {
      // These are core features - show warning
      if (dataCollectionSettings[key]) {
        setShowWarning(key)
        return
      }
    }
    
    setDataCollectionSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSharingToggle = (key) => {
    setSharingPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const [showWarning, setShowWarning] = useState(null)

  const dataCollectionOptions = [
    {
      key: 'location',
      title: 'Location Data',
      description: 'GPS tracking for automatic trip detection',
      icon: MapPin,
      color: 'text-blue-600 bg-blue-100',
      required: true,
      details: 'Used to detect when trips start and end, calculate distances, and identify transportation modes.'
    },
    {
      key: 'motion',
      title: 'Motion & Activity',
      description: 'Accelerometer data for transportation mode detection',
      icon: Smartphone,
      color: 'text-green-600 bg-green-100',
      required: true,
      details: 'Helps distinguish between walking, cycling, driving, and public transport.'
    },
    {
      key: 'usage',
      title: 'App Usage Analytics',
      description: 'How you interact with the app features',
      icon: BarChart3,
      color: 'text-purple-600 bg-purple-100',
      required: false,
      details: 'Anonymous data about which features you use to improve the app experience.'
    },
    {
      key: 'contacts',
      title: 'Contacts Access',
      description: 'For sharing trip information (optional)',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      required: false,
      details: 'Only used if you choose to share trip updates with family or friends.'
    }
  ]

  const sharingOptions = [
    {
      key: 'aggregatedData',
      title: 'Aggregated Research Data',
      description: 'Anonymous, combined data for transportation studies',
      organization: 'NATPAC & Research Partners',
      recommended: true
    },
    {
      key: 'researchInstitutions',
      title: 'Academic Research',
      description: 'Universities studying transportation patterns',
      organization: 'Academic Institutions',
      recommended: true
    },
    {
      key: 'governmentAgencies',
      title: 'Government Planning',
      description: 'Transportation departments for infrastructure planning',
      organization: 'Kerala Government',
      recommended: true
    },
    {
      key: 'thirdPartyApps',
      title: 'Third-party Apps',
      description: 'Other transportation or mapping applications',
      organization: 'App Partners',
      recommended: false
    },
    {
      key: 'marketingPartners',
      title: 'Marketing Partners',
      description: 'Companies for targeted transportation offers',
      organization: 'Commercial Partners',
      recommended: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      {isStandalone && (
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Privacy Center</h2>
            <p className="text-sm text-gray-600">Control your data collection and sharing</p>
          </div>
        </div>
      )}

      {!isStandalone && (
        <div>
          <h2 className="text-xl font-bold text-gray-900">Privacy Center</h2>
          <p className="text-sm text-gray-600">Control your data collection and sharing</p>
        </div>
      )}

      {/* Data Summary Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Database size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Your Data Summary</h3>
            <p className="text-sm text-gray-600">Overview of collected information</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{dataSummary.tripsCollected}</p>
            <p className="text-xs text-gray-600">Trips Collected</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-green-600">{dataSummary.dataSize}</p>
            <p className="text-xs text-gray-600">Storage Used</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last Export: {new Date(dataSummary.lastExport).toLocaleDateString()}</span>
          <button className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Data Collection Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Collection Settings</h3>
        
        <div className="space-y-3">
          {dataCollectionOptions.map((option) => {
            const IconComponent = option.icon
            const isEnabled = dataCollectionSettings[option.key]
            
            return (
              <div key={option.key} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${option.color}`}>
                      <IconComponent size={18} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{option.title}</h4>
                        {option.required && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Required</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                      <p className="text-xs text-gray-500">{option.details}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => handleDataToggle(option.key)}
                      disabled={option.required && isEnabled}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                        isEnabled ? 'bg-primary-500' : 'bg-gray-300'
                      } ${option.required && isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                    
                    {isEnabled ? (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle size={12} className="mr-1" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-gray-500">
                        <EyeOff size={12} className="mr-1" />
                        Disabled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Data Sharing Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Data Sharing Preferences</h3>
        <p className="text-sm text-gray-600">Control who can access your anonymized data</p>
        
        <div className="space-y-3">
          {sharingOptions.map((option) => {
            const isEnabled = sharingPreferences[option.key]
            
            return (
              <div key={option.key} className={`card ${option.recommended ? 'border-green-200 bg-green-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                      {option.recommended && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{option.description}</p>
                    <p className="text-xs text-gray-500">Shared with: {option.organization}</p>
                  </div>
                  
                  <button
                    onClick={() => handleSharingToggle(option.key)}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                      isEnabled ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="card text-center py-4 hover:shadow-lg transition-all duration-200">
            <Download size={20} className="text-primary-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Export Data</span>
          </button>
          
          <button className="card text-center py-4 hover:shadow-lg transition-all duration-200">
            <Shield size={20} className="text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Manage Consent</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Privacy Protection</h4>
            <p className="text-sm text-blue-700 mt-1">
              All location data is processed locally on your device. Only anonymized, 
              aggregated patterns are shared with research partners. Your exact routes 
              and personal information are never disclosed.
            </p>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle size={24} className="text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Disable {showWarning === 'location' ? 'Location' : 'Motion'} Data?</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {showWarning === 'location' 
                ? 'Disabling location data will stop automatic trip detection. You will need to manually record all trips.'
                : 'Disabling motion data will reduce the accuracy of transportation mode detection.'
              }
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWarning(null)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setDataCollectionSettings(prev => ({
                    ...prev,
                    [showWarning]: false
                  }))
                  setShowWarning(null)
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Disable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrivacyCenter