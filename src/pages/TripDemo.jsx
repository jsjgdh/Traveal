import { useState } from 'react'
import { ActiveTrip, TripDetectionModal } from '../components/trip'

function TripDemo() {
  const [showActiveTrip, setShowActiveTrip] = useState(false)
  const [showTripModal, setShowTripModal] = useState(false)
  const [currentTrip, setCurrentTrip] = useState({
    mode: 'car',
    destination: 'Kochi City Center',
    startTime: new Date().toISOString(),
    duration: '15 min',
    distance: '2.3 km'
  })

  const handleStartTrip = () => {
    setShowActiveTrip(true)
  }

  const handleEndTrip = (tripData) => {
    console.log('Trip ended:', tripData)
    setShowActiveTrip(false)
  }

  const handleAddStop = () => {
    console.log('Adding stop/note')
    // Here you would typically open a modal or navigate to an add stop page
  }

  const handleShowTripDetection = () => {
    setShowTripModal(true)
  }

  const handleConfirmTrip = (trip) => {
    console.log('Trip confirmed:', trip)
    setShowTripModal(false)
    setShowActiveTrip(true)
  }

  const handleRejectTrip = (trip) => {
    console.log('Trip rejected:', trip)
    setShowTripModal(false)
  }

  const handleEditTrip = (trip) => {
    console.log('Edit trip:', trip)
    setShowTripModal(false)
    // Here you would typically open a trip editing interface
  }

  const handleCloseTripModal = () => {
    setShowTripModal(false)
  }

  if (showActiveTrip) {
    return (
      <ActiveTrip 
        onEndTrip={handleEndTrip}
        onAddStop={handleAddStop}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Trip Components Demo</h1>
          <p className="text-sm text-gray-600">Test the trip detection components</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        <div className="card text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Detection Components</h2>
          <p className="text-gray-600 mb-6">
            Experience the NATPAC travel data collection trip components
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleShowTripDetection}
              className="btn-primary w-full py-4 text-lg"
            >
              Show Trip Detection Modal
            </button>
            
            <button
              onClick={handleStartTrip}
              className="btn-secondary w-full py-4 text-lg"
            >
              Start Active Trip Demo
            </button>
          </div>
        </div>

        {/* Component Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Features Included</h3>
          
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-3">Active Trip Screen</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Large transport mode indicator with icon</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Live map placeholder with route visualization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time trip stats (Duration, Distance, Speed)</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>GPS status indicators and error handling</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>End Trip and Add Stop/Note buttons</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-3">Trip Detection Modal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>"New Trip Detected" header with close button</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Trip summary with transport mode icon</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Destination, duration, and distance details</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>"Was this correct?" confirmation question</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Yes/No buttons and Edit Details link</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Auto-close timer with progress indicator</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Trip Detection Modal */}
      <TripDetectionModal
        trip={currentTrip}
        isVisible={showTripModal}
        onConfirm={handleConfirmTrip}
        onReject={handleRejectTrip}
        onEdit={handleEditTrip}
        onClose={handleCloseTripModal}
      />
    </div>
  )
}

export default TripDemo