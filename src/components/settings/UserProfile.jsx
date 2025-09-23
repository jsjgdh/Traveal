import { useState, useEffect } from 'react'
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  Car,
  Bus,
  Bike,
  Train,
  Edit3,
  Save,
  X,
  Check,
  Shield,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'

function UserProfile({ onBack }) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+91 98765 43210',
    ageGroup: '25-34',
    occupation: 'Software Engineer',
    location: 'Kochi, Kerala',
    profilePicture: null,
    transportationPreferences: {
      car: true,
      bus: true,
      bike: false,
      train: true,
      walking: true,
      other: false
    },
    completionPercentage: 75
  })

  const [accountStats] = useState({
    memberSince: 'January 2024',
    tripsContributed: 127,
    totalDistance: '2,340 km',
    dataQualityScore: 94,
    badgesEarned: 8,
    level: 'Explorer'
  })

  const [errors, setErrors] = useState({})
  const [isUploading, setIsUploading] = useState(false)

  // Calculate profile completion
  const calculateCompletion = (data) => {
    const fields = ['name', 'email', 'phone', 'ageGroup', 'occupation', 'location']
    const transportPrefs = Object.values(data.transportationPreferences).some(v => v)
    const completedFields = fields.filter(field => data[field] && data[field].trim() !== '').length
    const hasTransport = transportPrefs ? 1 : 0
    const hasPicture = data.profilePicture ? 1 : 0
    
    return Math.round(((completedFields + hasTransport + hasPicture) / 8) * 100)
  }

  useEffect(() => {
    const completion = calculateCompletion(profileData)
    setProfileData(prev => ({ ...prev, completionPercentage: completion }))
  }, [profileData.name, profileData.email, profileData.phone, profileData.ageGroup, 
      profileData.occupation, profileData.location, profileData.profilePicture, 
      JSON.stringify(profileData.transportationPreferences)])

  const validateForm = () => {
    const newErrors = {}
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!profileData.ageGroup) {
      newErrors.ageGroup = 'Please select your age group'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      setIsEditing(false)
      // Here you would typically save to backend
      console.log('Profile saved:', profileData)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setIsUploading(true)
      // Simulate upload
      setTimeout(() => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setProfileData(prev => ({ ...prev, profilePicture: e.target.result }))
          setIsUploading(false)
        }
        reader.readAsDataURL(file)
      }, 1000)
    }
  }

  const handleTransportationChange = (transport) => {
    setProfileData(prev => ({
      ...prev,
      transportationPreferences: {
        ...prev.transportationPreferences,
        [transport]: !prev.transportationPreferences[transport]
      }
    }))
  }

  const ageGroups = [
    { value: '', label: 'Select age group' },
    { value: '18-24', label: '18-24 years' },
    { value: '25-34', label: '25-34 years' },
    { value: '35-44', label: '35-44 years' },
    { value: '45-54', label: '45-54 years' },
    { value: '55-64', label: '55-64 years' },
    { value: '65+', label: '65+ years' }
  ]

  const transportationOptions = [
    { key: 'car', label: 'Car', icon: Car, color: 'text-blue-600' },
    { key: 'bus', label: 'Bus', icon: Bus, color: 'text-green-600' },
    { key: 'bike', label: 'Bike/Motorcycle', icon: Bike, color: 'text-orange-600' },
    { key: 'train', label: 'Train/Metro', icon: Train, color: 'text-purple-600' },
    { key: 'walking', label: 'Walking', icon: User, color: 'text-emerald-600' },
    { key: 'other', label: 'Other', icon: MapPin, color: 'text-gray-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Completion Progress */}
      <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Profile Completion</h3>
            <p className="text-sm text-gray-600">Complete your profile to unlock all features</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{profileData.completionPercentage}%</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500 animate-pulse-slow"
            style={{ width: `${profileData.completionPercentage}%` }}
          />
        </div>
        {profileData.completionPercentage < 100 && (
          <p className="text-xs text-gray-500 mt-2">
            Add missing information to reach 100% completion
          </p>
        )}
      </div>

      {/* Profile Picture Section */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              {profileData.profilePicture ? (
                <img 
                  src={profileData.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer transition-colors" data-testid="camera-icon">
              <Camera size={12} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
            <p className="text-gray-600">{profileData.occupation}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{profileData.location}</span>
            </div>
          </div>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
            <span>{isEditing ? 'Save' : 'Edit'}</span>
          </button>
        </div>
      </div>

      {/* Basic Information Form */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-900">{profileData.name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={16} className="text-gray-500" />
                <span className="text-gray-900">{profileData.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={16} className="text-gray-500" />
                <span className="text-gray-900">{profileData.phone}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group *
              </label>
              {isEditing ? (
                <div>
                  <select
                    value={profileData.ageGroup}
                    onChange={(e) => setProfileData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.ageGroup ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {ageGroups.map(group => (
                      <option key={group.value} value={group.value}>{group.label}</option>
                    ))}
                  </select>
                  {errors.ageGroup && <p className="text-red-500 text-sm mt-1">{errors.ageGroup}</p>}
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-gray-900">{profileData.ageGroup}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.occupation}
                  onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your occupation"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase size={16} className="text-gray-500" />
                  <span className="text-gray-900">{profileData.occupation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transportation Preferences */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transportation Preferences</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the transportation modes you typically use. This helps us provide better insights.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {transportationOptions.map((option) => {
            const IconComponent = option.icon
            const isSelected = profileData.transportationPreferences[option.key]
            
            return (
              <button
                key={option.key}
                onClick={() => isEditing && handleTransportationChange(option.key)}
                disabled={!isEditing}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <IconComponent size={20} className={isSelected ? 'text-primary-600' : option.color} />
                <span className="font-medium">{option.label}</span>
                {isSelected && <Check size={16} className="ml-auto text-primary-600" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Account Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Member Since</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{accountStats.memberSince}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-900">Trips Contributed</span>
            </div>
            <p className="text-lg font-bold text-green-900">{accountStats.tripsContributed}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Total Distance</span>
            </div>
            <p className="text-lg font-bold text-purple-900">{accountStats.totalDistance}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award size={16} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Data Quality</span>
            </div>
            <p className="text-lg font-bold text-orange-900">{accountStats.dataQualityScore}%</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-900">Current Level: {accountStats.level}</h4>
              <p className="text-sm text-yellow-700">
                You've earned {accountStats.badgesEarned} badges and contributed valuable data to transportation research.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Edit Mode */}
      {isEditing && (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setIsEditing(false)
              setErrors({})
            }}
            className="flex-1 btn-secondary flex items-center justify-center space-x-2"
          >
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default UserProfile