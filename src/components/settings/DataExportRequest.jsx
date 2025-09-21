import { useState, useEffect } from 'react'
import { 
  Download, 
  FileText, 
  Database, 
  Calendar, 
  Clock, 
  Check, 
  X,
  ArrowLeft,
  Mail,
  Shield,
  AlertCircle,
  Zap,
  MapPin,
  BarChart3,
  Settings,
  Award
} from 'lucide-react'
import { apiService } from '../../services/api'

function DataExportRequest({ onBack }) {
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    profile: true,
    tripHistory: true,
    analytics: false,
    preferences: true
  })
  
  const [exportFormat, setExportFormat] = useState('json')
  const [dateRange, setDateRange] = useState('all')
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestStatus, setRequestStatus] = useState(null) // null, 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('')
  
  const [existingRequests, setExistingRequests] = useState([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)

  // Load existing export requests on component mount
  useEffect(() => {
    loadExportRequests()
  }, [])

  const loadExportRequests = async () => {
    try {
      setIsLoadingRequests(true)
      const response = await apiService.request('/auth/export-requests')
      if (response.success) {
        setExistingRequests(response.data.requests || [])
      }
    } catch (error) {
      console.error('Failed to load export requests:', error)
    } finally {
      setIsLoadingRequests(false)
    }
  }

  const dataTypes = [
    {
      key: 'profile',
      name: 'Profile Information',
      description: 'Personal details, contact info, preferences',
      icon: Settings,
      estimatedSize: '< 1 KB',
      color: 'text-blue-600'
    },
    {
      key: 'tripHistory',
      name: 'Trip History',
      description: 'All recorded trips, routes, timestamps',
      icon: MapPin,
      estimatedSize: '2-5 MB',
      color: 'text-green-600'
    },
    {
      key: 'analytics',
      name: 'Analytics Data',
      description: 'Travel patterns, insights, statistics',
      icon: BarChart3,
      estimatedSize: '1-3 MB',
      color: 'text-purple-600'
    },
    {
      key: 'achievements',
      name: 'Achievements & Badges',
      description: 'Earned badges, milestones, rewards',
      icon: Award,
      estimatedSize: '< 1 KB',
      color: 'text-orange-600'
    },
    {
      key: 'preferences',
      name: 'App Preferences',
      description: 'Settings, notifications, customizations',
      icon: Settings,
      estimatedSize: '< 1 KB',
      color: 'text-indigo-600'
    },
    {
      key: 'accountHistory',
      name: 'Account History',
      description: 'Login history, security events, changes',
      icon: Shield,
      estimatedSize: '< 1 KB',
      color: 'text-red-600'
    }
  ]

  const formatOptions = [
    { value: 'json', label: 'JSON', description: 'Structured data format' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet-compatible format' }
  ]

  const dateRangeOptions = [
    { value: 'all', label: 'All Time', description: 'Complete data history' },
    { value: 'last-year', label: 'Last 12 Months', description: 'Past year of data' },
    { value: 'last-month', label: 'Last Month', description: 'Past 30 days' }
  ]

  const handleDataTypeChange = (key) => {
    setSelectedDataTypes(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const calculateEstimatedSize = () => {
    const selectedTypes = Object.keys(selectedDataTypes).filter(key => selectedDataTypes[key])
    if (selectedTypes.length === 0) return '0 KB'
    
    // Simple estimation logic
    let totalSizeMB = 0
    selectedTypes.forEach(type => {
      switch (type) {
        case 'tripHistory': totalSizeMB += 3.5; break
        case 'analytics': totalSizeMB += 2; break
        default: totalSizeMB += 0.001; break
      }
    })
    
    if (totalSizeMB < 1) return `${Math.round(totalSizeMB * 1000)} KB`
    return `${totalSizeMB.toFixed(1)} MB`
  }

  const handleExportRequest = async () => {
    const selectedCount = Object.values(selectedDataTypes).filter(Boolean).length
    if (selectedCount === 0) {
      setErrorMessage('Please select at least one data type to export')
      return
    }

    setIsRequesting(true)
    setErrorMessage('')
    
    try {
      const response = await apiService.request('/auth/export-data', {
        method: 'POST',
        body: JSON.stringify({
          selectedDataTypes,
          exportFormat,
          dateRange,
          customDateStart: customDateStart || undefined,
          customDateEnd: customDateEnd || undefined
        })
      })

      if (response.success) {
        setRequestStatus('success')
        // Reload the requests list
        await loadExportRequests()
      } else {
        setErrorMessage(response.message || 'Failed to create export request')
      }
    } catch (error) {
      console.error('Export request failed:', error)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check size={16} className="text-green-600" />
      case 'processing': return <Clock size={16} className="text-orange-600" />
      case 'failed': return <X size={16} className="text-red-600" />
      default: return <Clock size={16} className="text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-50 border-green-200'
      case 'processing': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'failed': return 'text-red-700 bg-red-50 border-red-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  if (requestStatus === 'success') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setRequestStatus(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Export Request Submitted</h2>
            <p className="text-sm text-gray-600">Your data export is being prepared</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Request Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your data export request has been submitted successfully.
          </p>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Mail size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">What happens next?</h4>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Your export is being processed (usually takes 1-24 hours)</li>
                <li>• You'll receive an email when it's ready for download</li>
                <li>• The download link will be valid for 30 days</li>
                <li>• You can track progress in the "Previous Requests" section</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="flex-1 btn-primary"
          >
            Back to Settings
          </button>
          <button
            onClick={() => setRequestStatus(null)}
            className="flex-1 btn-secondary"
          >
            Make Another Request
          </button>
        </div>
      </div>
    )
  }

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
          <h2 className="text-xl font-bold text-gray-900">Export Your Data</h2>
          <p className="text-sm text-gray-600">Download a copy of your personal data</p>
        </div>
      </div>

      {/* Previous Requests */}
      {existingRequests.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Previous Export Requests</h3>
          <div className="space-y-3">
            {existingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {request.format} Export
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested: {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {request.status === 'completed' ? (
                    <div>
                      <a 
                        href={request.downloadUrl}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        Download
                      </a>
                      <div className="text-xs text-gray-500">
                        Expires: {new Date(request.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  ) : request.status === 'processing' ? (
                    <div className="text-sm text-orange-600">
                      Estimated completion: {new Date(request.estimatedCompletion).toLocaleDateString()}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Type Selection */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Select Data to Export</h3>
        <div className="space-y-3">
          {dataTypes.map((dataType) => {
            const IconComponent = dataType.icon
            const isSelected = selectedDataTypes[dataType.key]
            
            return (
              <label
                key={dataType.key}
                className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                style={{ 
                  borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                  backgroundColor: isSelected ? '#F0F9FF' : 'white'
                }}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleDataTypeChange(dataType.key)}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                  />
                  <IconComponent size={20} className={dataType.color} />
                  <div>
                    <div className="font-medium text-gray-900">{dataType.name}</div>
                    <div className="text-sm text-gray-600">{dataType.description}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {dataType.estimatedSize}
                </div>
              </label>
            )
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Estimated total size: {calculateEstimatedSize()}
            </span>
          </div>
        </div>
      </div>

      {/* Export Format */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Export Format</h3>
        <div className="grid grid-cols-2 gap-3">
          {formatOptions.map((format) => (
            <label
              key={format.value}
              className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
              style={{ 
                borderColor: exportFormat === format.value ? '#3B82F6' : '#E5E7EB',
                backgroundColor: exportFormat === format.value ? '#F0F9FF' : 'white'
              }}
            >
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={exportFormat === format.value}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">{format.label}</div>
                <div className="text-sm text-gray-600">{format.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Date Range</h3>
        <div className="space-y-3">
          {dateRangeOptions.map((range) => (
            <label
              key={range.value}
              className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50"
            >
              <input
                type="radio"
                name="dateRange"
                value={range.value}
                checked={dateRange === range.value}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">{range.label}</div>
                <div className="text-sm text-gray-600">{range.description}</div>
              </div>
            </label>
          ))}
        </div>

        {dateRange === 'custom' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Privacy & Security Notice</h4>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1">
              <li>• Your data export will be encrypted and password-protected</li>
              <li>• Download links expire after 30 days for security</li>
              <li>• Only you can access the download link sent to your email</li>
              <li>• We recommend downloading and storing your data securely</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-3">
        <button
          onClick={handleExportRequest}
          disabled={isRequesting || Object.values(selectedDataTypes).every(v => !v)}
          className="flex-1 btn-primary flex items-center justify-center space-x-2"
        >
          {isRequesting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Download size={16} />
          )}
          <span>{isRequesting ? 'Processing Request...' : 'Request Data Export'}</span>
        </button>
      </div>
    </div>
  )
}

export default DataExportRequest