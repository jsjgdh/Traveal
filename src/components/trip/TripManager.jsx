import { useState, useEffect } from 'react'
import ActiveTrip from './ActiveTrip'
import TripDetectionModal from './TripDetectionModal'
import { Car, Bus, Footprints, Play, Loader } from 'lucide-react'

function TripManager() {
  const [currentTrip, setCurrentTrip] = useState(null)
  const [detectedTrip, setDetectedTrip] = useState(null)
  const [showDetectionModal, setShowDetectionModal] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState('idle') // idle, detecting, detected

  // Simulate trip detection
  useEffect(() => {
    const simulateDetection = () => {
      setIsDetecting(true)
      setDetectionStatus('detecting')
      
      setTimeout(() => {
        const mockTrip = {
          id: Date.now(),
          mode: ['car', 'bus', 'walking'][Math.floor(Math.random() * 3)],
          startTime: new Date(),
          destination: ['Kochi Metro Station', 'Ernakulam Junction', 'Marine Drive', 'MG Road'][Math.floor(Math.random() * 4)],
          duration: `${Math.floor(Math.random() * 30 + 10)} min`,
          distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        }
        
        setDetectedTrip(mockTrip)
        setShowDetectionModal(true)
        setIsDetecting(false)
        setDetectionStatus('detected')
      }, 3000) // 3 second detection delay
    }

    // Simulate random trip detection every 15-30 seconds
    const detectionInterval = setInterval(() => {
      if (!currentTrip && !showDetectionModal && detectionStatus === 'idle') {
        simulateDetection()
      }
    }, Math.random() * 15000 + 15000) // 15-30 seconds

    return () => clearInterval(detectionInterval)
  }, [currentTrip, showDetectionModal, detectionStatus])

  const handleStartManualTrip = () => {
    const manualTrip = {
      id: Date.now(),
      mode: 'car',
      startTime: new Date(),
      isManual: true
    }
    setCurrentTrip(manualTrip)
    setDetectionStatus('idle')
  }

  const handleConfirmDetection = (trip) => {
    setCurrentTrip(trip)
    setShowDetectionModal(false)
    setDetectedTrip(null)
    setDetectionStatus('idle')
  }

  const handleRejectDetection = (trip) => {
    console.log('Trip rejected:', trip)
    setShowDetectionModal(false)
    setDetectedTrip(null)
    setDetectionStatus('idle')
  }

  const handleEditTrip = (trip) => {
    console.log('Edit trip:', trip)
    // Navigate to trip editing screen
    setShowDetectionModal(false)
    setDetectedTrip(null)
    setDetectionStatus('idle')
  }

  const handleEndTrip = (tripData) => {
    console.log('Trip ended:', tripData)
    setCurrentTrip(null)
    setDetectionStatus('idle')
  }

  const handleAddStop = () => {
    console.log('Add stop/note to current trip')
    // Navigate to add stop/note screen
  }

  const handleCloseModal = () => {
    setShowDetectionModal(false)
    setDetectedTrip(null)
    setDetectionStatus('idle')
  }

  // Auto-close detection modal after 10 seconds
  useEffect(() => {
    if (showDetectionModal) {
      const autoCloseTimer = setTimeout(() => {
        handleCloseModal()
      }, 10000)

      return () => clearTimeout(autoCloseTimer)
    }
  }, [showDetectionModal])

  // If there's an active trip, show the active trip screen
  if (currentTrip) {
    return (
      <ActiveTrip
        trip={currentTrip}
        onEndTrip={handleEndTrip}
        onAddStop={handleAddStop}
      />
    )
  }

  // Main trip management dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Trip Tracking</h1>
          <p className="text-sm text-gray-600">Start or detect your trips automatically</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Detection Status */}
        {isDetecting && (
          <div className="card border-l-4 border-blue-500 bg-blue-50">
            <div className="flex items-center space-x-3">
              <Loader size={20} className="text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-800">Detecting Trip...</p>
                <p className="text-sm text-blue-700">Analyzing your movement patterns</p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Trip Start */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Start Manual Trip</h2>
          <p className="text-gray-600 mb-6">
            Begin tracking a trip manually if automatic detection isn't working
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Car size={32} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Driving</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Bus size={32} className="text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Bus</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Footprints size={32} className="text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Walking</span>
            </button>
          </div>
          
          <button
            onClick={handleStartManualTrip}
            className="btn-primary w-full py-4 flex items-center justify-center space-x-2"
          >
            <Play size={20} />
            <span>Start Trip</span>
          </button>
        </div>

        {/* Automatic Detection Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Automatic Detection</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Location services active</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Motion sensors enabled</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700">Monitoring for trips...</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Keep the app running in the background for automatic trip detection
            </p>
          </div>
        </div>

        {/* Recent Trips */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Home to Office</p>
                <p className="text-sm text-gray-600">2 hours ago • 8.5 km</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bus size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Metro to Mall</p>
                <p className="text-sm text-gray-600">Yesterday • 3.2 km</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trip Detection Modal */}
      <TripDetectionModal
        trip={detectedTrip}
        isVisible={showDetectionModal}
        onConfirm={handleConfirmDetection}
        onReject={handleRejectDetection}
        onEdit={handleEditTrip}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default TripManager