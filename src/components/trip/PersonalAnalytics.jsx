import { useState, useEffect } from 'react'
import { Car, Bus, Bike, MapPin, TrendingUp, Leaf, Clock, Calendar, BarChart3, Award } from 'lucide-react'

// Mock analytics data
const mockAnalyticsData = {
  monthlyStats: {
    totalDistance: '284.5 km',
    totalTrips: 42,
    mostUsedMode: 'Bus',
    averagePerDay: '9.5 km',
    carbonSaved: '15.2 kg'
  },
  modeBreakdown: [
    { mode: 'Bus', percentage: 45, distance: '128 km', trips: 18, color: 'bg-green-500', icon: Bus },
    { mode: 'Car', percentage: 30, distance: '85 km', trips: 12, color: 'bg-blue-500', icon: Car },
    { mode: 'Bike', percentage: 20, distance: '57 km', trips: 9, color: 'bg-orange-500', icon: Bike },
    { mode: 'Walk', percentage: 5, distance: '14 km', trips: 3, color: 'bg-purple-500', icon: MapPin }
  ],
  peakTravelTimes: [
    { time: '8:00 AM', percentage: 85, label: 'Morning Rush' },
    { time: '6:00 PM', percentage: 92, label: 'Evening Rush' },
    { time: '12:00 PM', percentage: 35, label: 'Lunch Time' },
    { time: '10:00 AM', percentage: 25, label: 'Mid Morning' }
  ],
  weeklyTrend: [
    { day: 'Mon', trips: 8, distance: 45 },
    { day: 'Tue', trips: 6, distance: 32 },
    { day: 'Wed', trips: 7, distance: 38 },
    { day: 'Thu', trips: 9, distance: 52 },
    { day: 'Fri', trips: 8, distance: 46 },
    { day: 'Sat', trips: 3, distance: 18 },
    { day: 'Sun', trips: 1, distance: 8 }
  ],
  achievements: [
    { id: 1, title: 'Eco Warrior', description: 'Used public transport 20+ times', icon: Leaf, earned: true },
    { id: 2, title: 'Distance Master', description: 'Traveled 250+ km this month', icon: Award, earned: true },
    { id: 3, title: 'Consistent Traveler', description: 'Recorded trips for 7 days straight', icon: Calendar, earned: false }
  ]
}

function PersonalAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalytics(mockAnalyticsData)
      setIsLoading(false)
    }, 1200)
  }, [])

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />
  }

  if (!analytics) {
    return <AnalyticsEmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          title="Total Distance"
          value={analytics.monthlyStats.totalDistance}
          icon={MapPin}
          color="bg-blue-500"
          subtitle={`${analytics.monthlyStats.totalTrips} trips`}
        />
        <SummaryCard
          title="Most Used Mode"
          value={analytics.monthlyStats.mostUsedMode}
          icon={Bus}
          color="bg-green-500"
          subtitle="45% of trips"
        />
        <SummaryCard
          title="Daily Average"
          value={analytics.monthlyStats.averagePerDay}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="This month"
        />
        <SummaryCard
          title="Carbon Saved"
          value={analytics.monthlyStats.carbonSaved}
          icon={Leaf}
          color="bg-emerald-500"
          subtitle="CO₂ reduction"
        />
      </div>

      {/* Transportation Mode Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 size={20} className="text-primary-600 mr-2" />
          Transportation Mode Analysis
        </h3>
        <div className="space-y-4">
          {analytics.modeBreakdown.map((mode, index) => (
            <ModeBreakdownItem key={mode.mode} mode={mode} index={index} />
          ))}
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar size={20} className="text-primary-600 mr-2" />
          Weekly Activity
        </h3>
        <WeeklyTrendChart data={analytics.weeklyTrend} />
      </div>

      {/* Peak Travel Times */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock size={20} className="text-primary-600 mr-2" />
          Peak Travel Times
        </h3>
        <div className="space-y-3">
          {analytics.peakTravelTimes.map((time, index) => (
            <PeakTimeItem key={time.time} time={time} index={index} />
          ))}
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Environmental Impact</h3>
            <p className="text-sm text-green-700">Your contribution to sustainability</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-800">{analytics.monthlyStats.carbonSaved}</p>
            <p className="text-xs text-green-600">CO₂ Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-800">128 km</p>
            <p className="text-xs text-green-600">Public Transport</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-800">65%</p>
            <p className="text-xs text-green-600">Eco-friendly Trips</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-sm text-green-800">
            🌱 Great job! Your sustainable travel choices this month are equivalent to planting 3 trees.
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award size={20} className="text-primary-600 mr-2" />
          Achievements
        </h3>
        <div className="grid gap-3">
          {analytics.achievements.map((achievement) => (
            <AchievementItem key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function ModeBreakdownItem({ mode, index }) {
  const Icon = mode.icon

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-center space-x-3 mb-2">
        <div className={`w-8 h-8 ${mode.color} rounded-lg flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">{mode.mode}</span>
            <span className="text-sm text-gray-600">{mode.percentage}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{mode.distance}</span>
            <span>{mode.trips} trips</span>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className={`h-2 rounded-full ${mode.color} animate-scale-bounce`}
          style={{ 
            width: `${mode.percentage}%`,
            animationDelay: `${index * 150}ms`
          }}
        ></div>
      </div>
    </div>
  )
}

function WeeklyTrendChart({ data }) {
  const maxTrips = Math.max(...data.map(d => d.trips))
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end h-32 px-2">
        {data.map((day, index) => (
          <div key={day.day} className="flex flex-col items-center space-y-2">
            <div className="text-xs text-gray-500 mb-1">{day.trips}</div>
            <div 
              className="w-6 bg-primary-500 rounded-t-sm animate-slide-up"
              style={{ 
                height: `${(day.trips / maxTrips) * 80}px`,
                animationDelay: `${index * 100}ms`
              }}
            ></div>
            <div className="text-xs text-gray-600 font-medium">{day.day}</div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Total: {data.reduce((sum, day) => sum + day.trips, 0)} trips</span>
          <span>Avg: {Math.round(data.reduce((sum, day) => sum + day.trips, 0) / 7)} trips/day</span>
        </div>
      </div>
    </div>
  )
}

function PeakTimeItem({ time, index }) {
  return (
    <div className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{time.time}</span>
          <span className="text-xs text-gray-500">{time.label}</span>
        </div>
        <span className="text-sm text-gray-600">{time.percentage}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-scale-bounce"
          style={{ 
            width: `${time.percentage}%`,
            animationDelay: `${index * 150}ms`
          }}
        ></div>
      </div>
    </div>
  )
}

function AchievementItem({ achievement }) {
  const Icon = achievement.icon
  
  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
      achievement.earned 
        ? 'bg-yellow-50 border-yellow-200 animate-glow' 
        : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        achievement.earned ? 'bg-yellow-500' : 'bg-gray-400'
      }`}>
        <Icon size={18} className="text-white" />
      </div>
      
      <div className="flex-1">
        <h4 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
          {achievement.title}
        </h4>
        <p className={`text-xs ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
      </div>
      
      {achievement.earned && (
        <div className="text-yellow-500 animate-sparkle">✨</div>
      )}
    </div>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      {[1, 2, 3].map(i => (
        <div key={i} className="card">
          <div className="w-48 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(j => (
              <div key={j} className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-full h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalyticsEmptyState() {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <BarChart3 size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No analytics available</h3>
      <p className="text-gray-600 max-w-sm mx-auto">
        Start recording trips to see your personal travel analytics and insights.
      </p>
      <button className="btn-primary mt-4">
        Record Your First Trip
      </button>
    </div>
  )
}

export default PersonalAnalytics