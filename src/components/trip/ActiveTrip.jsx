import { useState, useEffect } from 'react'
import { Car, MapPin, Clock, Gauge, StopCircle, Plus, AlertCircle, Wifi, WifiOff } from 'lucide-react'

function ActiveTrip({ onEndTrip, onAddStop }) {
  const [tripData, setTripData] = useState({
    mode: 'driving',
    icon: Car,
    duration: 0, // in seconds
    distance: 0, // in kilometers
    speed: 0, // in km/h
    isActive: true
  })
  
  const [gpsStatus, setGpsStatus] = useState('connected') // connected, weak, disconnected
  const [isLoading, setIsLoading] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  // Simulate real-time trip updates
  useEffect(() => {
    if (!tripData.isActive) return

    const interval = setInterval(() => {
      setTripData(prev => ({
        ...prev,
        duration: prev.duration + 1,
        distance: prev.distance + (prev.speed / 3600), // Convert speed to distance per second
        speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 10) // Simulate speed changes
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [tripData.isActive])

  // Simulate GPS status changes
  useEffect(() => {
    const statusInterval = setInterval(() => {
      const statuses = ['connected', 'weak', 'disconnected']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      setGpsStatus(randomStatus)
    }, 10000) // Change every 10 seconds for demo

    return () => clearInterval(statusInterval)
  }, [])

  // Initialize trip with random starting values
  useEffect(() => {
    setTripData(prev => ({
      ...prev,
      speed: Math.random() * 40 + 20 // Random speed between 20-60 km/h
    }))
  }, [])

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDistance = (km) => {
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
  }

  const handleEndTrip = () => {
    setIsLoading(true)
    setTimeout(() => {
      setTripData(prev => ({ ...prev, isActive: false }))
      setIsLoading(false)
      setShowEndConfirm(false)
      onEndTrip && onEndTrip(tripData)
    }, 2000) // Simulate processing time
  }

  const getGpsIcon = () => {
    switch (gpsStatus) {
      case 'connected':
        return <Wifi size={16} className="text-green-600" />
      case 'weak':
        return <AlertCircle size={16} className="text-yellow-600" />
      case 'disconnected':
        return <WifiOff size={16} className="text-red-600" />
      default:
        return <Wifi size={16} className="text-green-600" />
    }
  }

  const getGpsMessage = () => {
    switch (gpsStatus) {
      case 'connected':
        return 'GPS Connected'
      case 'weak':
        return 'GPS Signal Weak'
      case 'disconnected':
        return 'GPS Disconnected'
      default:
        return 'GPS Connected'
    }
  }

  if (!tripData.isActive && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car size={32} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Trip</h2>
          <p className="text-gray-600">Start a new trip to see live tracking</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Active Trip</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getGpsIcon()}
                <span className={`text-sm ${
                  gpsStatus === 'connected' ? 'text-green-600' :
                  gpsStatus === 'weak' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getGpsMessage()}
                </span>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Transport Mode Indicator */}
        <div className="card text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car size={40} className="text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Driving</h2>
          <p className="text-gray-600">Trip in progress</p>
        </div>

        {/* Live Map Placeholder */}
        <div className="card relative">
          <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-blue-200 transform rotate-45 scale-150"></div>
            </div>
            
            {/* Route Visualization */}
            <div className="relative z-10 text-center">
              <MapPin size={32} className="text-primary-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Live Route Tracking</p>
              <p className="text-sm text-gray-600">Map integration coming soon</p>
            </div>

            {/* Animated Route Line */}
            <div className="absolute bottom-4 left-4 right-4 h-1 bg-primary-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <Clock size={24} className="text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-lg font-bold text-gray-900">{formatDuration(tripData.duration)}</p>
          </div>
          
          <div className="card text-center">
            <MapPin size={24} className="text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Distance</p>
            <p className="text-lg font-bold text-gray-900">{formatDistance(tripData.distance)}</p>
          </div>
          
          <div className="card text-center">
            <Gauge size={24} className="text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Speed</p>
            <p className="text-lg font-bold text-gray-900">{Math.round(tripData.speed)} km/h</p>
          </div>
        </div>

        {/* GPS Warning */}
        {gpsStatus !== 'connected' && (
          <div className={`card border-l-4 ${
            gpsStatus === 'weak' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center space-x-3">
              <AlertCircle size={20} className={gpsStatus === 'weak' ? 'text-yellow-600' : 'text-red-600'} />
              <div>
                <p className={`font-medium ${gpsStatus === 'weak' ? 'text-yellow-800' : 'text-red-800'}`}>
                  {gpsStatus === 'weak' ? 'GPS Signal Weak' : 'GPS Connection Lost'}
                </p>
                <p className={`text-sm ${gpsStatus === 'weak' ? 'text-yellow-700' : 'text-red-700'}`}>
                  {gpsStatus === 'weak' 
                    ? 'Trip tracking may be less accurate' 
                    : 'Please check your location settings'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onAddStop}
            className="btn-secondary w-full py-4 text-lg flex items-center justify-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Stop/Note</span>
          </button>
          
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Ending Trip...</span>
              </>
            ) : (
              <>
                <StopCircle size={20} />
                <span>End Trip</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* End Trip Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-slide-up">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <StopCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">End Current Trip?</h3>
              <p className="text-gray-600">
                This will save your trip data and stop tracking your location.
              </p>
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleEndTrip}
                  disabled={isLoading}
                  className="btn-primary w-full py-3"
                >
                  Yes, End Trip
                </button>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="btn-secondary w-full py-3"
                >
                  Continue Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActiveTrip