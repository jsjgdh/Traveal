import { useState } from 'react'
import { 
  ArrowLeft, 
  Database, 
  Download, 
  Trash2, 
  FileText,
  Shield,
  AlertTriangle,
  Calendar,
  HardDrive,
  ChevronRight,
  CheckCircle
} from 'lucide-react'

function DataPrivacySettings({ onBack }) {
  const [activeView, setActiveView] = useState('main') // 'main', 'consent', 'export', 'delete'
  const [dataStats] = useState({
    tripsCollected: 156,
    dataSize: '2.4 MB',
    lastExport: '2024-01-10',
    joinedDate: '2023-12-01'
  })

  if (activeView === 'consent') {
    return <ConsentManagement onBack={() => setActiveView('main')} />
  }

  if (activeView === 'export') {
    return <DataExport onBack={() => setActiveView('main')} />
  }

  if (activeView === 'delete') {
    return <DeleteAccount onBack={() => setActiveView('main')} />
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
          <h2 className="text-xl font-bold text-gray-900">Data & Privacy</h2>
          <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
        </div>
      </div>

      {/* Data Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Data Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{dataStats.tripsCollected}</p>
            <p className="text-sm text-blue-700">Trips Collected</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{dataStats.dataSize}</p>
            <p className="text-sm text-green-700">Data Size</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Export</span>
            <span className="text-gray-900">{new Date(dataStats.lastExport).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Member Since</span>
            <span className="text-gray-900">{new Date(dataStats.joinedDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Privacy Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Privacy Controls</h3>
        
        <div className="space-y-2">
          <button
            onClick={() => setActiveView('consent')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Consent Management</h4>
                <p className="text-sm text-gray-600">Review and update your permissions</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => setActiveView('export')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download size={18} className="text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Export Data</h4>
                <p className="text-sm text-gray-600">Download your complete travel data</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => setActiveView('delete')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4 border-red-200 bg-red-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700">Permanently remove your data</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Data Usage Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Database size={16} className="text-white" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">How Your Data is Used</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your anonymized travel data helps NATPAC improve Kerala's transportation 
              infrastructure. Location data is processed locally and only aggregated 
              patterns are shared for research purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConsentManagement({ onBack }) {
  const [consentSettings, setConsentSettings] = useState({
    dataCollection: true,
    locationTracking: true,
    usageAnalytics: false,
    researchSharing: true,
    marketingEmails: false
  })

  const handleConsentChange = (key) => {
    setConsentSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const consentOptions = [
    {
      key: 'dataCollection',
      title: 'Data Collection',
      description: 'Allow the app to collect your travel data for research',
      required: true,
      icon: Database
    },
    {
      key: 'locationTracking',
      title: 'Location Tracking',
      description: 'Enable GPS tracking for automatic trip detection',
      required: true,
      icon: Database
    },
    {
      key: 'usageAnalytics',
      title: 'Usage Analytics',
      description: 'Help improve the app with anonymous usage data',
      required: false,
      icon: FileText
    },
    {
      key: 'researchSharing',
      title: 'Research Data Sharing',
      description: 'Share anonymized data with transportation researchers',
      required: false,
      icon: Shield
    },
    {
      key: 'marketingEmails',
      title: 'Marketing Communications',
      description: 'Receive updates about transportation initiatives',
      required: false,
      icon: FileText
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
          <h2 className="text-xl font-bold text-gray-900">Consent Management</h2>
          <p className="text-sm text-gray-600">Control how your data is used</p>
        </div>
      </div>

      {/* Consent Options */}
      <div className="space-y-3">
        {consentOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <div key={option.key} className={`card p-4 ${option.required ? 'border-blue-200 bg-blue-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    option.required ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent size={18} className={option.required ? 'text-blue-600' : 'text-gray-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                      {option.required && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Required</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => !option.required && handleConsentChange(option.key)}
                  disabled={option.required}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                    consentSettings[option.key] ? 'bg-primary-500' : 'bg-gray-300'
                  } ${option.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                    consentSettings[option.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Withdrawal Notice */}
      <div className="card border-yellow-200 bg-yellow-50">
        <div className="flex items-start space-x-3">
          <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Consent Withdrawal</h4>
            <p className="text-sm text-yellow-700 mt-1">
              You can withdraw your consent at any time. Note that some features may not work 
              without required permissions, and you may need to delete your account to fully 
              stop data collection.
            </p>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      <button className="w-full btn-primary">
        Save Consent Preferences
      </button>
    </div>
  )
}

function DataExport({ onBack }) {
  const [exportStatus, setExportStatus] = useState('ready') // 'ready', 'preparing', 'complete'

  const handleExport = () => {
    setExportStatus('preparing')
    
    // Simulate export preparation
    setTimeout(() => {
      setExportStatus('complete')
      
      // Create and download a sample file
      const data = {
        trips: [],
        preferences: {},
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `travel-data-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }, 2000)
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
          <h2 className="text-xl font-bold text-gray-900">Export Your Data</h2>
          <p className="text-sm text-gray-600">Download your complete travel data</p>
        </div>
      </div>

      {/* Export Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-700">All recorded trips and routes</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-700">Transportation mode preferences</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-700">Privacy and consent settings</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-700">App usage statistics</span>
          </div>
        </div>
      </div>

      {/* Export Status */}
      {exportStatus === 'ready' && (
        <div className="space-y-4">
          <button
            onClick={handleExport}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Download size={18} />
            <span>Export My Data</span>
          </button>
          
          <div className="card bg-gray-50">
            <p className="text-sm text-gray-600">
              Your data will be exported as a JSON file. The export may take a few moments 
              to prepare, especially for accounts with extensive travel history.
            </p>
          </div>
        </div>
      )}

      {exportStatus === 'preparing' && (
        <div className="card text-center py-8">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-2">Preparing Your Export</h3>
          <p className="text-sm text-gray-600">Please wait while we gather your data...</p>
        </div>
      )}

      {exportStatus === 'complete' && (
        <div className="card bg-green-50 border-green-200 text-center py-8">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-green-900 mb-2">Export Complete!</h3>
          <p className="text-sm text-green-700 mb-4">
            Your data has been downloaded successfully. Check your downloads folder.
          </p>
          <button
            onClick={() => setExportStatus('ready')}
            className="btn-secondary"
          >
            Export Again
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteAccount({ onBack }) {
  const [confirmationStep, setConfirmationStep] = useState(0) // 0: warning, 1: confirmation, 2: processing
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = () => {
    if (confirmText === 'DELETE MY ACCOUNT') {
      setConfirmationStep(2)
      // Simulate account deletion
      setTimeout(() => {
        localStorage.clear()
        window.location.reload()
      }, 2000)
    }
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
          <h2 className="text-xl font-bold text-red-900">Delete Account</h2>
          <p className="text-sm text-red-600">Permanently remove your data</p>
        </div>
      </div>

      {confirmationStep === 0 && (
        <div className="space-y-4">
          <div className="card border-red-200 bg-red-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={24} className="text-red-500 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Warning: This Action Cannot Be Undone</h3>
                <div className="space-y-2 text-sm text-red-700">
                  <p>• All your travel data will be permanently deleted</p>
                  <p>• Your account and profile will be removed</p>
                  <p>• You will stop contributing to transportation research</p>
                  <p>• This action cannot be reversed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h4 className="font-medium text-gray-900 mb-2">Before You Delete</h4>
            <p className="text-sm text-gray-600 mb-3">
              Consider exporting your data first if you want to keep a personal copy 
              of your travel history.
            </p>
            <button className="btn-secondary">
              Export Data First
            </button>
          </div>

          <button
            onClick={() => setConfirmationStep(1)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            I Understand, Continue to Delete
          </button>
        </div>
      )}

      {confirmationStep === 1 && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Final Confirmation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Type <strong>DELETE MY ACCOUNT</strong> to confirm account deletion:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE MY ACCOUNT"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setConfirmationStep(0)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE MY ACCOUNT'}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {confirmationStep === 2 && (
        <div className="card text-center py-8">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="font-semibold text-red-900 mb-2">Deleting Your Account</h3>
          <p className="text-sm text-red-600">Please wait while we remove your data...</p>
        </div>
      )}
    </div>
  )
}

export default DataPrivacySettings