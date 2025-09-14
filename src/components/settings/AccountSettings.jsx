import { useState } from 'react'
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Bell, 
  ChevronRight,
  Edit3,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import PrivacyCenter from './PrivacyCenter'

function AccountSettings({ onBack }) {
  const [activeView, setActiveView] = useState('main') // 'main', 'privacy-center', 'notifications'
  const [profileData, setProfileData] = useState({
    name: 'NATPAC User',
    email: 'user@example.com',
    phone: '+91 98765 43210',
    region: 'Kerala, India'
  })
  const [notificationSettings, setNotificationSettings] = useState({
    tripDetection: true,
    dataExport: true,
    weeklyReport: false,
    achievements: true,
    systemUpdates: true
  })

  if (activeView === 'privacy-center') {
    return (
      <PrivacyCenter 
        onBack={() => setActiveView('main')}
        isStandalone={false}
      />
    )
  }

  if (activeView === 'notifications') {
    return <NotificationSettings 
      settings={notificationSettings}
      onSettingsChange={setNotificationSettings}
      onBack={() => setActiveView('main')}
    />
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
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-sm text-gray-600">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
        
        <div className="card">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{profileData.name}</h4>
              <p className="text-sm text-gray-600">Contributing to transportation research</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit3 size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail size={16} className="text-gray-500" />
              <span className="text-sm text-gray-900">{profileData.email}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone size={16} className="text-gray-500" />
              <span className="text-sm text-gray-900">{profileData.phone}</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm text-gray-900">{profileData.region}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
        
        <div className="space-y-2">
          <button
            onClick={() => setActiveView('privacy-center')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-green-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Privacy Center</h4>
                <p className="text-sm text-gray-600">Manage data collection and sharing</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>

          <button
            onClick={() => setActiveView('notifications')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center justify-between p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-600">Configure alerts and reminders</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Account Status */}
      <div className="card bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h4 className="font-medium text-green-900">Account Verified</h4>
            <p className="text-sm text-green-700 mt-1">
              Your account is active and contributing to Kerala's transportation research. 
              Thank you for participating in this important initiative.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationSettings({ settings, onSettingsChange, onBack }) {
  const handleToggle = (key) => {
    onSettingsChange(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const notificationOptions = [
    {
      key: 'tripDetection',
      label: 'Trip Detection',
      description: 'Notify when new trips are detected',
      icon: MapPin
    },
    {
      key: 'dataExport',
      label: 'Data Export Ready',
      description: 'Alert when data export is complete',
      icon: Mail
    },
    {
      key: 'weeklyReport',
      label: 'Weekly Reports',
      description: 'Receive weekly travel summaries',
      icon: User
    },
    {
      key: 'achievements',
      label: 'Achievements',
      description: 'Celebrate milestones and goals',
      icon: Bell
    },
    {
      key: 'systemUpdates',
      label: 'System Updates',
      description: 'Important app and system notifications',
      icon: Shield
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
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600">Choose what you want to be notified about</p>
        </div>
      </div>

      {/* Notification Options */}
      <div className="space-y-3">
        {notificationOptions.map((option) => {
          const IconComponent = option.icon
          return (
            <div key={option.key} className="card flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <IconComponent size={18} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggle(option.key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  settings[option.key] ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5 ${
                  settings[option.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button
          onClick={() => {
            const allEnabled = Object.values(settings).every(v => v)
            const newSettings = {}
            Object.keys(settings).forEach(key => {
              newSettings[key] = !allEnabled
            })
            onSettingsChange(newSettings)
          }}
          className="w-full btn-secondary"
        >
          {Object.values(settings).every(v => v) ? 'Disable All' : 'Enable All'}
        </button>
      </div>
    </div>
  )
}

export default AccountSettings