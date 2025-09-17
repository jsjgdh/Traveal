import { Bell, Settings, MapPin, Battery, Target, Car, Bus, Footprints, Plus, History, Gift, Share2, Compass, Utensils, Star, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications, SystemStatusMonitor } from '../components/notifications'

function Dashboard() {
  const navigate = useNavigate()
  const { systemStatus } = useNotifications()
  const todaysTrips = [
    { id: 1, mode: 'car', icon: Car, distance: '2.5km', time: '9:15 AM' },
    { id: 2, mode: 'bus', icon: Bus, distance: '4.2km', time: '2:30 PM' },
    { id: 3, mode: 'walking', icon: Footprints, distance: '0.8km', time: '6:45 PM' }
  ]

  const quickActions = [
    { id: 1, title: 'SOS Safety', icon: AlertTriangle, color: 'bg-red-500', action: () => navigate('/sos') },
    { id: 2, title: 'Manual Trip', icon: Plus, color: 'bg-primary-500', action: () => navigate('/trip-demo') },
    { id: 3, title: 'Discover Gems', icon: Compass, color: 'bg-green-500', action: () => navigate('/discover') },
    { id: 4, title: 'Rewards Center', icon: Gift, color: 'bg-purple-500', action: () => navigate('/rewards') }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NATPAC</h1>
                <p className="text-xs text-gray-500">Travel Tracker</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <Settings size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6 pb-24">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Good Evening!</h2>
          <p className="text-gray-600">Here's your travel summary for today</p>
        </div>

        {/* Today's Summary Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Summary</h3>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl font-bold text-primary-600">{todaysTrips.length}</span>
              <span className="text-gray-700">Trips Detected</span>
            </div>
          </div>

          <div className="space-y-3">
            {todaysTrips.map((trip, index) => {
              const IconComponent = trip.icon
              return (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trip.mode === 'car' ? 'bg-blue-100 text-blue-600' :
                      trip.mode === 'bus' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{trip.mode}</p>
                      <p className="text-sm text-gray-500">{trip.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{trip.distance}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Status Card */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Tracking Active</p>
                  <p className="text-sm text-gray-500">Location services enabled</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Battery size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Battery: Good</p>
                  <p className="text-sm text-gray-500">85% remaining</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold">85%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Points: 245</p>
                  <p className="text-sm text-gray-500">12 points to next level</p>
                </div>
              </div>
              <span className="text-primary-600 font-semibold">245</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="card hover:shadow-md transition-shadow duration-200 p-4 text-center"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <p className="font-medium text-gray-900">{action.title}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* System Status Monitor */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <SystemStatusMonitor compact={true} />
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Trip to Kochi completed - 15 points earned</p>
              <span className="text-xs text-gray-400 ml-auto">2h ago</span>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Weekly challenge: 3/5 public transport trips</p>
              <span className="text-xs text-gray-400 ml-auto">1d ago</span>
            </div>
            <div className="flex items-center space-x-3 p-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Level up! You reached Bronze tier</p>
              <span className="text-xs text-gray-400 ml-auto">2d ago</span>
            </div>
          </div>
        </div>

        {/* Discover Hidden Gems */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Discover Hidden Gems</h3>
            <button 
              onClick={() => navigate('/discover')}
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            <div 
              onClick={() => navigate('/discover')}
              className="flex items-center space-x-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Secret Beach at Vypin</p>
                <p className="text-sm text-gray-600">Hidden pristine beach • 2.3 km away</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">4.8 rating</span>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => navigate('/discover')}
              className="flex items-center space-x-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Utensils size={20} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Ammachi's Kitchen</p>
                <p className="text-sm text-gray-600">Traditional Kerala meals • 1.2 km away</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">4.9 rating</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Discover 12 hidden local attractions and food spots in your area!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard