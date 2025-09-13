import { useState, useEffect } from 'react'
import { MapPin, Clock, Car, Bus, Footprints, Bike, Save, Plus, Minus, ArrowLeft, AlertCircle } from 'lucide-react'

function ManualTripEntry({ onSave, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    startTime: '',
    endTime: '',
    mode: 'car',
    purpose: '',
    companions: 0,
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [suggestions, setSuggestions] = useState({
    origin: [],
    destination: []
  })

  // Common locations for auto-complete
  const commonLocations = [
    'Kochi Metro Station',
    'Ernakulam Junction',
    'Marine Drive',
    'MG Road',
    'Kaloor Stadium',
    'Edapally',
    'Aluva',
    'Angamaly',
    'Thrippunithura',
    'Fort Kochi',
    'Mattancherry',
    'Kakkanad',
    'Palarivattom',
    'Vyttila',
    'Kalamassery'
  ]

  const transportModes = [
    { id: 'car', icon: Car, label: 'Driving', color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'bus', icon: Bus, label: 'Bus', color: 'text-green-600', bg: 'bg-green-100' },
    { id: 'walking', icon: Footprints, label: 'Walking', color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'bike', icon: Bike, label: 'Cycling', color: 'text-purple-600', bg: 'bg-purple-100' }
  ]

  const tripPurposes = [
    { id: 'work', label: 'Work' },
    { id: 'school', label: 'School/Education' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'medical', label: 'Medical' },
    { id: 'social', label: 'Social/Recreation' },
    { id: 'other', label: 'Other' }
  ]

  // Initialize form with current date/time and any initial data
  useEffect(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().slice(0, 5)

    setFormData(prev => ({
      ...prev,
      date: today,
      startTime: currentTime,
      ...initialData
    }))
  }, [initialData])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Handle auto-complete for locations
    if ((field === 'origin' || field === 'destination') && value.length > 1) {
      const filtered = commonLocations.filter(location =>
        location.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(prev => ({ ...prev, [field]: filtered.slice(0, 5) }))
    } else if (field === 'origin' || field === 'destination') {
      setSuggestions(prev => ({ ...prev, [field]: [] }))
    }
  }

  const handleLocationSelect = (field, location) => {
    setFormData(prev => ({ ...prev, [field]: location }))
    setSuggestions(prev => ({ ...prev, [field]: [] }))
  }

  const handleCompanionChange = (delta) => {
    const newCount = Math.max(0, Math.min(10, formData.companions + delta))
    setFormData(prev => ({ ...prev, companions: newCount }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.origin.trim()) {
      newErrors.origin = 'Starting location is required'
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required'
    }

    if (formData.origin === formData.destination) {
      newErrors.destination = 'Destination must be different from origin'
    }

    if (!formData.date) {
      newErrors.date = 'Trip date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate > today) {
        newErrors.date = 'Trip date cannot be in the future'
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Trip purpose is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (saveAsDraft = false) => {
    if (!saveAsDraft && !validateForm()) {
      return
    }

    setIsSaving(true)
    setIsDraft(saveAsDraft)

    // Simulate API call
    setTimeout(() => {
      const tripData = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        isDraft: saveAsDraft,
        manual: true
      }

      onSave && onSave(tripData)
      setIsSaving(false)
      setIsDraft(false)
    }, 1500)
  }

  const currentMode = transportModes.find(mode => mode.id === formData.mode)

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
              <h1 className="text-xl font-bold text-gray-900">Add Trip Manually</h1>
              <p className="text-sm text-gray-600">Enter your trip details</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Locations */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route</h3>
          
          {/* Origin */}
          <div className="space-y-2 mb-4 relative">
            <label className="block text-sm font-medium text-gray-700">
              From <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                placeholder="Enter starting location"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.origin ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {suggestions.origin.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {suggestions.origin.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect('origin', location)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.origin && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle size={16} />
                <span>{errors.origin}</span>
              </p>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700">
              To <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                placeholder="Enter destination"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.destination ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {suggestions.destination.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                  {suggestions.destination.map((location, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect('destination', location)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.destination && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle size={16} />
                <span>{errors.destination}</span>
              </p>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">When</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle size={16} />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle size={16} />
                    <span>{errors.startTime}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && (
                  <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle size={16} />
                    <span>{errors.endTime}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transportation Mode */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transportation Mode</h3>
          <div className="grid grid-cols-2 gap-3">
            {transportModes.map((mode) => {
              const IconComponent = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => setFormData(prev => ({ ...prev, mode: mode.id }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.mode === mode.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 ${mode.bg} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <IconComponent size={20} className={mode.color} />
                  </div>
                  <p className={`font-medium text-sm ${
                    formData.mode === mode.id ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {mode.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Trip Purpose */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Trip Purpose <span className="text-red-500">*</span>
          </h3>
          <select
            value={formData.purpose}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.purpose ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select trip purpose</option>
            {tripPurposes.map((purpose) => (
              <option key={purpose.id} value={purpose.id}>
                {purpose.label}
              </option>
            ))}
          </select>
          {errors.purpose && (
            <p className="text-sm text-red-500 flex items-center space-x-1 mt-2">
              <AlertCircle size={16} />
              <span>{errors.purpose}</span>
            </p>
          )}
        </div>

        {/* Companions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Companions</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium">Number of companions</p>
              <p className="text-sm text-gray-500">Including yourself: {formData.companions + 1} people</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleCompanionChange(-1)}
                disabled={formData.companions === 0}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  formData.companions === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold text-gray-900 w-8 text-center">
                {formData.companions}
              </span>
              <button
                onClick={() => handleCompanionChange(1)}
                disabled={formData.companions >= 10}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  formData.companions >= 10 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                }`}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional details about your trip (optional)"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-6">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              isSaving && !isDraft
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isSaving && !isDraft ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Trip...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Trip</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              isSaving && isDraft
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            }`}
          >
            {isSaving && isDraft ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Draft...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save as Draft</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

export default ManualTripEntry