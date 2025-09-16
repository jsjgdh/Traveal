import { useState } from 'react'
import { 
  ChevronRight, 
  User, 
  Shield, 
  Smartphone, 
  HelpCircle,
  Settings2
} from 'lucide-react'
import AccountSettings from './AccountSettings'
import DataPrivacySettings from './DataPrivacySettings'
import AppPreferences from './AppPreferences'
import SupportSection from './SupportSection'

function SettingsMenu() {
  const [activeSection, setActiveSection] = useState(null)

  const settingsSections = [
    {
      id: 'account',
      title: 'Account',
      description: 'Profile Info, Privacy Center, Notifications',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 'privacy',
      title: 'Data & Privacy',
      description: 'Data Usage, Consent Management, Export Data',
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      description: 'Battery Mode, Language, Theme, Notifications',
      icon: Smartphone,
      color: 'bg-purple-500'
    },
    {
      id: 'support',
      title: 'Support',
      description: 'Help Center, Contact Us, About',
      icon: HelpCircle,
      color: 'bg-orange-500'
    }
  ]

  if (activeSection) {
    const renderActiveSection = () => {
      switch (activeSection) {
        case 'account':
          return <AccountSettings onBack={() => setActiveSection(null)} />
        case 'privacy':
          return <DataPrivacySettings onBack={() => setActiveSection(null)} />
        case 'preferences':
          return <AppPreferences onBack={() => setActiveSection(null)} />
        case 'support':
          return <SupportSection onBack={() => setActiveSection(null)} />
        default:
          return null
      }
    }

    return renderActiveSection()
  }

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto">
          <Settings2 size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Customize your Travel experience</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-3">
        {settingsSections.map((section) => {
          const IconComponent = section.icon
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className="w-full card hover:shadow-lg transition-all duration-200 flex items-center space-x-4 p-4"
            >
              <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center`}>
                <IconComponent size={20} className="text-white" />
              </div>
              
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{section.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
              </div>
              
              <ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
            </button>
          )
        })}
      </div>

      {/* App Info */}
      <div className="card bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Travel Data Collection</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            NATPAC • Kerala Transportation Research
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsMenu