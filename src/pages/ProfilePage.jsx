import { User, MapPin, Shield, Bell } from 'lucide-react'

function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600">Manage your account settings</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        <div className="card text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">NATPAC User</h2>
          <p className="text-gray-600">Contributing to Kerala's transportation research</p>
        </div>

        <div className="space-y-3">
          <div className="card flex items-center space-x-3">
            <MapPin size={20} className="text-gray-600" />
            <span className="text-gray-900">Location Preferences</span>
          </div>
          <div className="card flex items-center space-x-3">
            <Shield size={20} className="text-gray-600" />
            <span className="text-gray-900">Privacy Settings</span>
          </div>
          <div className="card flex items-center space-x-3">
            <Bell size={20} className="text-gray-600" />
            <span className="text-gray-900">Notifications</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage