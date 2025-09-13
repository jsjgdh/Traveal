import { Home, BarChart3, Gift, User, Settings } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      id: 'data',
      label: 'Data',
      icon: BarChart3,
      path: '/data',
      active: location.pathname === '/data'
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Gift,
      path: '/rewards',
      active: location.pathname === '/rewards'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      active: location.pathname === '/profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      active: location.pathname === '/settings'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.active && (
                  <div className="w-1 h-1 bg-primary-600 rounded-full mt-1"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default BottomNavigation