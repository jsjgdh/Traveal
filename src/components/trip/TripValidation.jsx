import { useState } from 'react'
import { MapPin, Clock, Car, Bus, Footprints, Bike, Plus, Minus, CheckCircle, ArrowLeft } from 'lucide-react'

function TripValidation({ trip, onConfirm, onCancel, onEdit }) {
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [companionCount, setCompanionCount] = useState(0)
  const [isConfirming, setIsConfirming] = useState(false)

  const transportModes = {
    car: { icon: Car, label: 'Driving', color: 'text-blue-600', bg: 'bg-blue-100' },
    bus: { icon: Bus, label: 'Bus', color: 'text-green-600', bg: 'bg-green-100' },
    walking: { icon: Footprints, label: 'Walking', color: 'text-orange-600', bg: 'bg-orange-100' },
    bike: { icon: Bike, label: 'Cycling', color: 'text-purple-600', bg: 'bg-purple-100' }
  }

  const tripPurposes = [
    { id: 'work', label: 'Work', icon: '💼' },
    { id: 'school', label: 'School', icon: '🎓' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'other', label: 'Other', icon: '📍' }
  ]

  const currentMode = transportModes[trip?.mode] || transportModes.car
  const IconComponent = currentMode.icon

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const handleCompanionChange = (delta) => {
    const newCount = Math.max(0, Math.min(10, companionCount + delta))
    setCompanionCount(newCount)
  }

  const handleConfirm = async () => {
    if (!selectedPurpose) {
      return // Don't allow confirmation without purpose
    }

    setIsConfirming(true)
    
    // Simulate API call
    setTimeout(() => {
      const validatedTrip = {
        ...trip,
        purpose: selectedPurpose,
        companions: companionCount,
        validated: true,
        validatedAt: new Date().toISOString()
      }
      
      onConfirm && onConfirm(validatedTrip)
      setIsConfirming(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Validate Trip</h1>
              <p className="text-sm text-gray-600">Confirm trip details and add information</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Trip Details Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Trip Details</h2>
            <button
              onClick={onEdit}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Edit
            </button>
          </div>

          {/* Transport Mode */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 ${currentMode.bg} rounded-xl flex items-center justify-center`}>
              <IconComponent size={32} className={currentMode.color} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{currentMode.label}</h3>
              <p className="text-sm text-gray-600">{formatDate(trip?.startTime)}</p>
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">From</p>
                <p className="text-gray-900">{trip?.origin || 'Starting location'}</p>
                <p className="text-sm text-gray-500">{formatTime(trip?.startTime)}</p>
              </div>
            </div>

            <div className="ml-1.5 w-0.5 h-8 bg-gray-300"></div>

            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">To</p>
                <p className="text-gray-900">{trip?.destination || 'Destination'}</p>
                <p className="text-sm text-gray-500">{formatTime(trip?.endTime)}</p>
              </div>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-lg font-semibold text-gray-900">{trip?.distance || '2.3 km'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900">{trip?.duration || '15 min'}</p>
            </div>
          </div>
        </div>

        {/* Trip Purpose Selector */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Purpose</h3>
          <div className="grid grid-cols-2 gap-3">
            {tripPurposes.map((purpose) => (
              <button
                key={purpose.id}
                onClick={() => setSelectedPurpose(purpose.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedPurpose === purpose.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{purpose.icon}</div>
                <p className={`font-medium ${
                  selectedPurpose === purpose.id ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {purpose.label}
                </p>
              </button>
            ))}
          </div>
          {!selectedPurpose && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              Please select a trip purpose to continue
            </p>
          )}
        </div>

        {/* Companions Counter */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Companions</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">Number of companions</p>
              <p className="text-sm text-gray-500">Including yourself: {companionCount + 1} people</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleCompanionChange(-1)}
                disabled={companionCount === 0}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  companionCount === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold text-gray-900 w-8 text-center">
                {companionCount}
              </span>
              <button
                onClick={() => handleCompanionChange(1)}
                disabled={companionCount >= 10}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  companionCount >= 10 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pb-6">
          <button
            onClick={handleConfirm}
            disabled={!selectedPurpose || isConfirming}
            className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              !selectedPurpose || isConfirming
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isConfirming ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Confirming Trip...</span>
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                <span>Confirm Trip</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

export default TripValidation