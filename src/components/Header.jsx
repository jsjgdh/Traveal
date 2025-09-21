import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import { useNotifications, NotificationCenter } from './notifications'
import ThemeToggle from './shared/ThemeToggle'

function Header() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const { unreadCount } = useNotifications()
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)

  // Get page title from pathname
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/discover') return 'Discover Gems'
    if (path === '/trip') return 'Trip Management'
    if (path === '/trip-planner') return 'Trip Planner'
    if (path === '/data') return 'Data Analytics'
    if (path === '/rewards') return 'Rewards'
    if (path === '/profile') return 'Profile'
    if (path === '/settings') return 'Settings'
    if (path === '/sos') return 'SOS Safety'
    if (path === '/sos/settings') return 'SOS Settings'
    if (path === '/sos/test') return 'Voice Alert Test'
    if (path === '/sos/permissions') return 'SOS Permissions'
    return 'NATPAC'
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo placeholder */}
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 fluid-text-base">
                {getPageTitle()}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Travel Data Collection
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle showLabel={false} size="sm" />
            
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {!isHomePage && (
              <button 
                onClick={() => window.history.back()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </header>
  )
}

export default Header