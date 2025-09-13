import { useState } from 'react'
import { TripValidation, ManualTripEntry } from '../components/trip'

function TripValidationDemo() {
  const [currentView, setCurrentView] = useState('selection')
  
  // Mock trip data for validation demo
  const mockTrip = {
    id: '12345',
    mode: 'car',
    origin: 'Ernakulam Junction',
    destination: 'Kochi Metro Station',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes later
    distance: '2.3 km',
    duration: '15 min'
  }

  const handleTripValidated = (tripData) => {
    console.log('Trip validated:', tripData)
    alert('Trip validated successfully!')
    setCurrentView('selection')
  }

  const handleTripSaved = (tripData) => {
    console.log('Trip saved:', tripData)
    alert(`Trip ${tripData.isDraft ? 'saved as draft' : 'saved'} successfully!`)
    setCurrentView('selection')
  }

  const handleCancel = () => {
    setCurrentView('selection')
  }

  if (currentView === 'validation') {
    return (
      <TripValidation
        trip={mockTrip}
        onConfirm={handleTripValidated}
        onCancel={handleCancel}
        onEdit={() => setCurrentView('manual')}
      />
    )
  }

  if (currentView === 'manual') {
    return (
      <ManualTripEntry
        onSave={handleTripSaved}
        onCancel={handleCancel}
        initialData={currentView === 'manual' && mockTrip ? {
          origin: mockTrip.origin,
          destination: mockTrip.destination,
          mode: mockTrip.mode
        } : null}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Trip Entry Demo</h1>
          <p className="text-sm text-gray-600">Test trip validation and manual entry components</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        <div className="card text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Component Demo</h2>
          <p className="text-gray-600 mb-6">
            Experience the new trip validation and manual entry components
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('validation')}
              className="btn-primary w-full py-4 text-lg"
            >
              Show Trip Validation
            </button>
            
            <button
              onClick={() => setCurrentView('manual')}
              className="btn-secondary w-full py-4 text-lg"
            >
              Show Manual Trip Entry
            </button>
          </div>
        </div>

        {/* Component Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">New Features</h3>
          
          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-3">Trip Validation Screen</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Comprehensive trip details card with route visualization</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Interactive trip purpose selector with icons</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Companions counter with + and - buttons</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Form validation requiring trip purpose</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Loading states and confirmation feedback</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h4 className="font-semibold text-gray-900 mb-3">Manual Trip Entry Form</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Auto-complete location inputs with Kerala locations</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Date and time pickers with validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Visual transportation mode selector</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Trip purpose dropdown with multiple options</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Companion count and optional notes</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Save as draft functionality</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Comprehensive form validation with error messages</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TripValidationDemo