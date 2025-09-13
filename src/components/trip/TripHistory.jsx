import { useState, useEffect } from 'react'
import { ChevronDown, Download, RefreshCw, Car, Bus, Bike, MapPin, Clock, Calendar } from 'lucide-react'

// Mock data for demonstration
const mockTrips = [
  {
    id: 1,
    date: '2024-01-15',
    startTime: '08:30',
    endTime: '09:15',
    from: 'Kakkanad',
    to: 'Kochi Metro',
    mode: 'bus',
    distance: '12.5 km',
    purpose: 'Work',
    duration: '45 min'
  },
  {
    id: 2,
    date: '2024-01-15',
    startTime: '18:00',
    endTime: '18:45',
    from: 'Kochi Metro',
    to: 'Kakkanad',
    mode: 'bus',
    distance: '12.5 km',
    purpose: 'Home',
    duration: '45 min'
  },
  {
    id: 3,
    date: '2024-01-14',
    startTime: '10:15',
    endTime: '10:35',
    from: 'Home',
    to: 'Grocery Store',
    mode: 'bike',
    distance: '3.2 km',
    purpose: 'Shopping',
    duration: '20 min'
  },
  {
    id: 4,
    date: '2024-01-13',
    startTime: '07:45',
    endTime: '08:20',
    from: 'Kakkanad',
    to: 'InfoPark',
    mode: 'car',
    distance: '8.1 km',
    purpose: 'Work',
    duration: '35 min'
  },
  {
    id: 5,
    date: '2024-01-12',
    startTime: '16:30',
    endTime: '17:00',
    from: 'InfoPark',
    to: 'Shopping Mall',
    mode: 'car',
    distance: '5.7 km',
    purpose: 'Shopping',
    duration: '30 min'
  }
]

const transportModeIcons = {
  car: Car,
  bus: Bus,
  bike: Bike,
  walk: MapPin
}

const transportModeColors = {
  car: 'text-blue-600 bg-blue-100',
  bus: 'text-green-600 bg-green-100',
  bike: 'text-orange-600 bg-orange-100',
  walk: 'text-purple-600 bg-purple-100'
}

function TripHistory() {
  const [trips, setTrips] = useState([])
  const [filteredTrips, setFilteredTrips] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('This Month')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  const filterOptions = ['This Week', 'This Month', 'All Time']

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTrips(mockTrips)
      setFilteredTrips(mockTrips)
      setIsLoading(false)
    }, 1500)
  }, [])

  useEffect(() => {
    filterTrips()
  }, [selectedFilter, trips])

  const filterTrips = () => {
    const now = new Date()
    let filtered = trips

    switch (selectedFilter) {
      case 'This Week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filtered = trips.filter(trip => new Date(trip.date) >= weekAgo)
        break
      case 'This Month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
        filtered = trips.filter(trip => new Date(trip.date) >= monthAgo)
        break
      case 'All Time':
      default:
        filtered = trips
    }

    setFilteredTrips(filtered)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      'Date,Start Time,End Time,From,To,Mode,Distance,Purpose,Duration',
      ...filteredTrips.map(trip => 
        `${trip.date},${trip.startTime},${trip.endTime},${trip.from},${trip.to},${trip.mode},${trip.distance},${trip.purpose},${trip.duration}`
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-history-${selectedFilter.toLowerCase().replace(' ', '-')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const groupTripsByDate = (trips) => {
    const grouped = {}
    trips.forEach(trip => {
      if (!grouped[trip.date]) {
        grouped[trip.date] = []
      }
      grouped[trip.date].push(trip)
    })
    return grouped
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const groupedTrips = groupTripsByDate(filteredTrips)

  if (isLoading) {
    return <TripHistoryLoadingSkeleton />
  }

  if (filteredTrips.length === 0) {
    return <TripHistoryEmptyState filter={selectedFilter} />
  }

  return (
    <div className="space-y-4">
      {/* Header with Filter and Export */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{selectedFilter}</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {filterOptions.map(option => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedFilter(option)
                    setShowFilterDropdown(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download size={16} />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Trip List */}
      <div className="space-y-6">
        {Object.entries(groupedTrips)
          .sort(([a], [b]) => new Date(b) - new Date(a))
          .map(([date, dayTrips]) => (
            <div key={date} className="space-y-3">
              {/* Date Header */}
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatDate(date)}
                </h3>
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">
                  {dayTrips.length} trip{dayTrips.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Trips for this date */}
              <div className="space-y-3">
                {dayTrips
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

function TripCard({ trip }) {
  const IconComponent = transportModeIcons[trip.mode] || MapPin
  const colorClass = transportModeColors[trip.mode] || 'text-gray-600 bg-gray-100'

  return (
    <div className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-500">
      <div className="flex items-start space-x-4">
        {/* Transport Mode Icon */}
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <IconComponent size={20} />
        </div>

        {/* Trip Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {trip.startTime} - {trip.endTime}
              </span>
              <span className="text-xs text-gray-500">({trip.duration})</span>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              {trip.purpose}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-900 font-medium">{trip.from}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-900 font-medium">{trip.to}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600 capitalize">
              {trip.mode.replace('_', ' ')}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {trip.distance}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TripHistoryLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Trip cards skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map(day => (
          <div key={day} className="space-y-3">
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2].map(trip => (
                <div key={trip} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TripHistoryEmptyState({ filter }) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <MapPin size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">No trips found</h3>
      <p className="text-gray-600 max-w-sm mx-auto">
        {filter === 'All Time' 
          ? "You haven't recorded any trips yet. Start traveling to see your trip history here!"
          : `No trips found for ${filter.toLowerCase()}. Try selecting a different time period.`
        }
      </p>
      <button className="btn-primary mt-4">
        Start Recording Trips
      </button>
    </div>
  )
}

export default TripHistory