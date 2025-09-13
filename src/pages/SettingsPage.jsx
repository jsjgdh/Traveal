import { Settings, Shield, Bell, MapPin, Smartphone, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function SettingsPage() {
  const navigate = useNavigate()
  const settingsGroups = [
    {
      title: 'Privacy & Data',
      items: [
        { icon: Shield, label: 'Privacy Controls', description: 'Manage data sharing preferences' },
        { icon: Database, label: 'Data Export', description: 'Download your travel data' },
        { icon: MapPin, label: 'Location Settings', description: 'Configure tracking preferences' }
      ]
    },
    {
      title: 'App Preferences',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Configure alerts and reminders' },
        { icon: Smartphone, label: 'Battery Optimization', description: 'Manage power usage' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Customize your app experience</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {settingsGroups.map((group, index) => (
          <div key={index} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon
                return (
                  <div key={itemIndex} className="card flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent size={20} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="w-6 h-6 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Reset Section */}
        <div className="card border-red-200 bg-red-50">
          <h3 className="font-medium text-red-900 mb-2">Reset Options</h3>
          <button 
            onClick={() => {
              localStorage.removeItem('natpac_onboarded')
              localStorage.removeItem('natpac_consent')
              window.location.reload()
            }}
            className="text-sm text-red-600 underline"
          >
            Reset Onboarding (For Testing)
          </button>
        </div>

        {/* Demo Section */}
        <div className="card border-blue-200 bg-blue-50">
          <h3 className="font-medium text-blue-900 mb-2">Development</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/trip-demo')}
              className="text-sm text-blue-600 underline block"
            >
              View Trip Components Demo
            </button>
            <button 
              onClick={() => navigate('/trip-validation-demo')}
              className="text-sm text-blue-600 underline block"
            >
              View Trip Validation Demo
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage