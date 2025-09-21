import { useState } from 'react'
import { 
  User, 
  MapPin, 
  Shield, 
  Bell, 
  Award,
  Calendar,
  Settings,
  Edit3,
  ChevronRight,
  Mail,
  Phone,
  TrendingUp,
  Download,
  Trash2,
  Lock,
  Database,
  Key,
  Check
} from 'lucide-react'
import { 
  PrivacyCenter, 
  UserProfile, 
  EnhancedAccountSettings, 
  AccountDeletionFlow, 
  DataExportRequest,
  ConsentManagement,
  ProfileEdit
} from '../components/settings'

function ProfilePage() {
  const [activeView, setActiveView] = useState('main') // 'main', 'profile', 'account-settings', 'privacy', 'data-export', 'delete-account', 'consent-management', 'profile-edit'
  const [userStats] = useState({
    tripsThisMonth: 42,
    totalDistance: '284 km',
    carbonSaved: '15.2 kg',
    memberSince: 'December 2023',
    profileCompletion: 85,
    dataQualityScore: 94
  })

  if (activeView === 'privacy') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Privacy Center</h1>
            <p className="text-sm text-gray-600">Manage your data and privacy</p>
          </div>
        </header>
        <main className="px-4 py-6">
          <PrivacyCenter onBack={() => setActiveView('main')} isStandalone={true} />
        </main>
      </div>
    )
  }

  if (activeView === 'consent-management') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Consent Management</h1>
            <p className="text-sm text-gray-600">Control how your data is collected and used</p>
          </div>
        </header>
        <main className="px-4 py-6">
          <ConsentManagement onBack={() => setActiveView('main')} />
        </main>
      </div>
    )
  }

  if (activeView === 'profile-edit') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-600">Customize your app preferences</p>
          </div>
        </header>
        <main className="px-4 py-6">
          <ProfileEdit onBack={() => setActiveView('main')} />
        </main>
      </div>
    )
  }

  if (activeView === 'data-export') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Export Your Data</h1>
            <p className="text-sm text-gray-600">Download a copy of your personal data</p>
          </div>
        </header>
        <main className="px-4 py-6">
          <DataExportRequest onBack={() => setActiveView('main')} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-6">
          <h1 className="text-xl font-bold mb-2">Your Profile</h1>
          <div className="flex items-center justify-between">
            <p className="text-primary-100 text-sm">Manage your account and preferences</p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <TrendingUp size={14} />
                <span>{userStats.profileCompletion}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="card bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center relative">
              <User size={32} className="text-white" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Alex Johnson</h2>
              <p className="text-gray-600 mb-1">Software Engineer • Level 3 Explorer</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-1" />
                <span>Member since {userStats.memberSince}</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveView('profile')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit3 size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Profile Completion Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm text-primary-600 font-semibold">{userStats.profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${userStats.profileCompletion}%` }}
              />
            </div>
            {userStats.profileCompletion < 100 && (
              <p className="text-xs text-gray-500 mt-1">
                Complete your profile to unlock all features and improve data quality
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-bold text-primary-600">{userStats.tripsThisMonth}</p>
              <p className="text-xs text-gray-600">Trips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{userStats.totalDistance}</p>
              <p className="text-xs text-gray-600">Distance</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600">{userStats.carbonSaved}</p>
              <p className="text-xs text-gray-600">CO₂ Saved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{userStats.dataQualityScore}%</p>
              <p className="text-xs text-gray-600">Quality</p>
            </div>
          </div>
        </div>

        {/* Profile Management Sections */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 px-1">Account Management</h3>
          
          <button
            onClick={() => setActiveView('profile-edit')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-3 p-4 group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Edit3 size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Edit Profile</h3>
              <p className="text-sm text-gray-600">Customize your app preferences and settings</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
          </button>

          <button
            onClick={() => setActiveView('consent-management')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-3 p-4 group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Shield size={20} className="text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">Manage Consent</h3>
              <p className="text-sm text-gray-600">Control how your data is collected and used</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
          </button>
          <button
            onClick={() => setActiveView('privacy')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-3 p-4 group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Lock size={20} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">Privacy Center</h3>
              <p className="text-sm text-gray-600">Manage data collection and sharing preferences</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-green-500 transition-colors" />
          </button>

          <button
            onClick={() => setActiveView('data-export')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-3 p-4 group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Download size={20} className="text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">Export My Data</h3>
              <p className="text-sm text-gray-600">Download a copy of your personal data</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-green-500 transition-colors" />
          </button>

          <div className="card flex items-center space-x-3 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Achievements & Rewards</h3>
              <p className="text-sm text-gray-600">View your travel milestones and badges</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>

          <div className="card flex items-center space-x-3 p-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Travel Analytics</h3>
              <p className="text-sm text-gray-600">Detailed insights about your trips and patterns</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-700 px-1">Danger Zone</h3>
          
          <button
            onClick={() => setActiveView('delete-account')}
            className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-3 p-4 border-red-200 hover:border-red-300 group"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-red-900 group-hover:text-red-800 transition-colors">Delete Account</h3>
              <p className="text-sm text-red-600">Permanently remove your account and all data</p>
            </div>
            <ChevronRight size={18} className="text-red-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-500" />
                <span className="text-sm text-gray-900">alex.johnson@example.com</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Verified" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-500" />
                <span className="text-sm text-gray-900">+91 98765 43210</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Verified" />
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-sm text-gray-900">Kerala, India</span>
            </div>
          </div>
        </div>

        {/* Contribution Status */}
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">Active Contributor - Verified Account</h4>
              <p className="text-sm text-green-700 mt-1">
                Thank you for contributing to Kerala's transportation research! Your high-quality data 
                (Quality Score: {userStats.dataQualityScore}%) helps improve mobility solutions for everyone in the region.
              </p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-green-600">
                <span>• {userStats.tripsThisMonth} trips this month</span>
                <span>• Member since {userStats.memberSince}</span>
                <span>• {userStats.profileCompletion}% profile complete</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage