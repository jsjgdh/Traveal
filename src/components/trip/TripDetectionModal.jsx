import { useState, useEffect } from 'react'
import { Car, Bus, Footprints, MapPin, Clock, Edit3, X, CheckCircle, XCircle } from 'lucide-react'

function TripDetectionModal({ trip, isVisible, onConfirm, onReject, onEdit, onClose }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [userResponse, setUserResponse] = useState(null) // 'yes', 'no', null

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      setUserResponse(null)
    }
  }, [isVisible])

  const transportModes = {
    car: { icon: Car, label: 'Driving', color: 'text-blue-600', bg: 'bg-blue-100' },
    bus: { icon: Bus, label: 'Bus', color: 'text-green-600', bg: 'bg-green-100' },
    walking: { icon: Footprints, label: 'Walking', color: 'text-orange-600', bg: 'bg-orange-100' }
  }

  const currentMode = transportModes[trip?.mode] || transportModes.car
  const IconComponent = currentMode.icon

  const handleConfirm = () => {
    setUserResponse('yes')
    setTimeout(() => {
      onConfirm && onConfirm(trip)
      setIsAnimating(false)
    }, 500)
  }

  const handleReject = () => {
    setUserResponse('no')
    setTimeout(() => {
      onReject && onReject(trip)
      setIsAnimating(false)
    }, 500)
  }

  const handleEdit = () => {
    onEdit && onEdit(trip)
    setIsAnimating(false)
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose && onClose()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
      <div 
        className={`bg-white rounded-t-2xl sm:rounded-2xl max-w-sm w-full transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-0 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">New Trip Detected</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="p-6 space-y-4">
          {/* Transport Mode */}
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 ${currentMode.bg} rounded-xl flex items-center justify-center`}>
              <IconComponent size={28} className={currentMode.color} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{currentMode.label}</h3>
              <p className="text-sm text-gray-600">
                {trip?.startTime && new Date(trip.startTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin size={16} className="text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Destination</p>
                <p className="text-sm text-gray-600">{trip?.destination || 'Unknown location'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium text-gray-900">{trip?.duration || '15 min'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-sm font-medium text-gray-900">{trip?.distance || '2.3 km'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="text-center py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Was this correct?</h3>
            <p className="text-sm text-gray-600">
              Help us improve trip detection by confirming the details
            </p>
          </div>

          {/* Response Feedback */}
          {userResponse && (
            <div className={`flex items-center justify-center space-x-2 py-3 rounded-lg animate-fade-in ${
              userResponse === 'yes' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {userResponse === 'yes' ? (
                <>
                  <CheckCircle size={20} />
                  <span className="font-medium">Thank you for confirming!</span>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <span className="font-medium">Thanks for the feedback!</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!userResponse && (
          <div className="p-6 space-y-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleConfirm}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CheckCircle size={18} />
                <span>Yes</span>
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <XCircle size={18} />
                <span>No</span>
              </button>
            </div>
            
            <button
              onClick={handleEdit}
              className="btn-secondary w-full py-3 flex items-center justify-center space-x-2"
            >
              <Edit3 size={18} />
              <span>Edit Details</span>
            </button>
          </div>
        )}

        {/* Auto-close timer indicator */}
        <div className="px-6 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-primary-600 h-1 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: userResponse ? '100%' : '0%',
                transitionDuration: userResponse ? '500ms' : '10000ms'
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {userResponse ? 'Saving...' : 'This notification will close automatically in 10 seconds'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TripDetectionModal