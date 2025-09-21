import { Home, BarChart3, Gift, User, Settings, Compass, Calendar } from 'lucide-react'
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
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      path: '/discover',
      active: location.pathname === '/discover'
    },
    {
      id: 'planner',
      label: 'Planner',
      icon: Calendar,
      path: '/trip-planner',
      active: location.pathname === '/trip-planner'
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
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 md:hidden">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 touch-friendly ${
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