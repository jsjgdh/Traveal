import { useState } from 'react'
import { 
  Shield, 
  Lock, 
  Mail, 
  Bell, 
  Smartphone,
  MessageSquare,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Download,
  Trash2,
  ArrowLeft,
  Key,
  Settings,
  Globe,
  Database
} from 'lucide-react'

function EnhancedAccountSettings({ onBack }) {
  const [activeView, setActiveView] = useState('main')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [emailPreferences, setEmailPreferences] = useState({
    tripSummaries: true,
    weeklyReports: true,
    achievementNotifications: true,
    systemUpdates: true,
    marketingEmails: false,
    researchUpdates: true
  })

  const [notificationSettings, setNotificationSettings] = useState({
    push: {
      tripDetection: true,
      lowBattery: true,
      dataSync: true,
      achievements: true,
      challenges: true,
      systemAlerts: true
    },
    email: {
      weeklyReports: true,
      monthlyDigest: false,
      dataExports: true,
      securityAlerts: true,
      productUpdates: false
    },
    sms: {
      criticalAlerts: true,
      dataExportReady: false,
      accountSecurity: true
    }
  })

  const [dataRetentionSettings, setDataRetentionSettings] = useState({
    autoDelete: false,
    retentionPeriod: '2-years',
    exportBeforeDelete: true,
    anonymizeData: false
  })

  // Password validation
  const validatePassword = (password) => {
    const errors = []
    if (password.length < 8) errors.push('At least 8 characters')
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
    if (!/\d/.test(password)) errors.push('One number')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character')
    return errors
  }

  const handlePasswordChange = () => {
    const errors = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    
    const passwordValidation = validatePassword(passwordData.newPassword)
    if (passwordValidation.length > 0) {
      errors.newPassword = passwordValidation
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = ['New password must be different from current password']
    }
    
    setPasswordErrors(errors)
    
    if (Object.keys(errors).length === 0) {
      setIsChangingPassword(true)
      // Simulate API call
      setTimeout(() => {
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('Password changed successfully!')
      }, 2000)
    }
  }

  const handleNotificationChange = (category, setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }))
  }

  const renderPasswordChangeForm = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setActiveView('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-600">Update your account password</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <div className="mt-1">
                {Array.isArray(passwordErrors.newPassword) ? (
                  <ul className="text-red-500 text-sm space-y-1">
                    {passwordErrors.newPassword.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-500 text-sm">{passwordErrors.newPassword}</p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li className="flex items-center space-x-2">
                <Check size={14} className={passwordData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'} />
                <span>At least 8 characters</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'} />
                <span>One uppercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'} />
                <span>One lowercase letter</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className={/\d/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'} />
                <span>One number</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={14} className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'} />
                <span>One special character</span>
              </li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {isChangingPassword ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Key size={16} />
              )}
              <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setActiveView('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-sm text-gray-600">Manage how you receive notifications</p>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Smartphone size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-600">Receive notifications on your device</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(notificationSettings.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'tripDetection' && 'Alert when new trips are detected'}
                  {key === 'lowBattery' && 'Warn when device battery is low'}
                  {key === 'dataSync' && 'Notify when data sync is complete'}
                  {key === 'achievements' && 'Celebrate your milestones'}
                  {key === 'challenges' && 'Updates on weekly challenges'}
                  {key === 'systemAlerts' && 'Important system notifications'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('push', key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  value ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Mail size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-600">Receive updates via email</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(notificationSettings.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'weeklyReports' && 'Weekly travel summary reports'}
                  {key === 'monthlyDigest' && 'Monthly activity digest'}
                  {key === 'dataExports' && 'Data export completion notifications'}
                  {key === 'securityAlerts' && 'Account security notifications'}
                  {key === 'productUpdates' && 'New features and updates'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('email', key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  value ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
            <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
          </div>
        </div>
        <div className="space-y-3">
          {Object.entries(notificationSettings.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'criticalAlerts' && 'Important system alerts only'}
                  {key === 'dataExportReady' && 'Data export completion alerts'}
                  {key === 'accountSecurity' && 'Account security notifications'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('sms', key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  value ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                  value ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDataRetentionSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setActiveView('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Data Retention Settings</h2>
          <p className="text-sm text-gray-600">Control how long your data is stored</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Auto-Delete Old Data</h4>
              <p className="text-sm text-blue-700">Automatically delete data after retention period</p>
            </div>
            <button
              onClick={() => setDataRetentionSettings(prev => ({ ...prev, autoDelete: !prev.autoDelete }))}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                dataRetentionSettings.autoDelete ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                dataRetentionSettings.autoDelete ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {dataRetentionSettings.autoDelete && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retention Period
              </label>
              <select
                value={dataRetentionSettings.retentionPeriod}
                onChange={(e) => setDataRetentionSettings(prev => ({ ...prev, retentionPeriod: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="6-months">6 months</option>
                <option value="1-year">1 year</option>
                <option value="2-years">2 years</option>
                <option value="5-years">5 years</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-green-900">Export Before Delete</h4>
              <p className="text-sm text-green-700">Automatically export data before deletion</p>
            </div>
            <button
              onClick={() => setDataRetentionSettings(prev => ({ ...prev, exportBeforeDelete: !prev.exportBeforeDelete }))}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                dataRetentionSettings.exportBeforeDelete ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                dataRetentionSettings.exportBeforeDelete ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <h4 className="font-medium text-purple-900">Anonymize Data</h4>
              <p className="text-sm text-purple-700">Remove personal identifiers from stored data</p>
            </div>
            <button
              onClick={() => setDataRetentionSettings(prev => ({ ...prev, anonymizeData: !prev.anonymizeData }))}
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                dataRetentionSettings.anonymizeData ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                dataRetentionSettings.anonymizeData ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (activeView === 'password') return renderPasswordChangeForm()
  if (activeView === 'notifications') return renderNotificationSettings()
  if (activeView === 'data-retention') return renderDataRetentionSettings()

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
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-sm text-gray-600">Manage your account security and preferences</p>
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Security & Authentication</h3>
        
        <button
          onClick={() => setActiveView('password')}
          className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock size={18} className="text-red-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Change Password</h4>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Last changed 3 months ago
          </div>
        </button>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Communication Preferences</h3>
        
        <button
          onClick={() => setActiveView('notifications')}
          className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell size={18} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Notification Settings</h4>
              <p className="text-sm text-gray-600">Configure push, email, and SMS notifications</p>
            </div>
          </div>
          <div className="text-sm text-primary-600">
            {Object.values(notificationSettings.push).filter(Boolean).length + 
             Object.values(notificationSettings.email).filter(Boolean).length + 
             Object.values(notificationSettings.sms).filter(Boolean).length} active
          </div>
        </button>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        
        <button
          onClick={() => setActiveView('data-retention')}
          className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-purple-600" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-gray-900">Data Retention</h4>
              <p className="text-sm text-gray-600">Control how long your data is stored</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {dataRetentionSettings.autoDelete ? 'Auto-delete enabled' : 'Manual only'}
          </div>
        </button>
      </div>
    </div>
  )
}

export default EnhancedAccountSettings