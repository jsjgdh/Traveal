import { useState, useEffect, useCallback } from 'react'
import { Shield, MapPin, Clock, AlertTriangle, Settings, Users, Play, Pause, PhoneCall } from 'lucide-react'
import SOSPasswordSetup from './SOSPasswordSetup'
import SOSEmergencyAlert from './SOSEmergencyAlert'

function SOSManager() {
  const [sosProfile, setSOSProfile] = useState(null)
  const [routeMonitoring, setRouteMonitoring] = useState(null)
  const [activeAlert, setActiveAlert] = useState(null)
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showPasswordSetup, setShowPasswordSetup] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [tripRoute, setTripRoute] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load SOS profile on component mount
  useEffect(() => {
    loadSOSProfile()
    getCurrentLocation()
  }, [])

  // Location tracking when monitoring is active
  useEffect(() => {
    let locationWatcher = null
    
    if (isMonitoring && routeMonitoring) {
      locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            timestamp: new Date()
          }
          
          setCurrentLocation(newLocation)
          updateRouteMonitoring(newLocation)
        },
        (error) => {
          console.error('Location tracking error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      )
    }
    
    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher)
      }
    }
  }, [isMonitoring, routeMonitoring])

  const loadSOSProfile = async () => {
    try {
      // Simulate API call to load SOS profile
      const response = await fetch('/api/v1/sos/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (response.ok) {
        const profile = await response.json()
        setSOSProfile(profile.data)
        setEmergencyContacts(profile.data.emergencyContacts || [])
      }
    } catch (error) {
      console.error('Error loading SOS profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          })
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }

  const handlePasswordSetupComplete = async (passwordData) => {
    try {
      const response = await fetch('/api/v1/sos/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...passwordData,
          emergencyContacts: emergencyContacts.length > 0 ? emergencyContacts : [
            {
              name: 'Emergency Contact',
              phoneNumber: '',
              relationship: 'family',
              priority: 1,
              isActive: true
            }
          ],
          isEnabled: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSOSProfile(result.data)
        setShowPasswordSetup(false)
        
        // Show success message
        alert('SOS profile created successfully!')
      } else {
        throw new Error('Failed to create SOS profile')
      }
    } catch (error) {
      console.error('Error creating SOS profile:', error)
      alert('Error creating SOS profile. Please try again.')
    }
  }

  const startCabMonitoring = async (destination, plannedRoute) => {
    if (!sosProfile || !currentLocation) {
      alert('SOS profile and location are required to start monitoring')
      return
    }

    try {
      const response = await fetch('/api/v1/sos/monitoring/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sosProfileId: sosProfile.id,
          plannedRoute: plannedRoute || [currentLocation, destination],
          destination,
          deviationThreshold: 500, // 500 meters
          estimatedArrival: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        })
      })

      if (response.ok) {
        const result = await response.json()
        setRouteMonitoring(result.data)
        setIsMonitoring(true)
        setTripRoute([currentLocation])
        
        alert('Cab safety monitoring started!')
      } else {
        throw new Error('Failed to start monitoring')
      }
    } catch (error) {
      console.error('Error starting monitoring:', error)
      alert('Error starting monitoring. Please try again.')
    }
  }

  const stopMonitoring = async () => {
    if (!routeMonitoring) return

    try {
      const response = await fetch(`/api/v1/sos/monitoring/${routeMonitoring.id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        setRouteMonitoring(null)
        setIsMonitoring(false)
        setTripRoute([])
        
        alert('Monitoring stopped successfully!')
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error)
    }
  }

  const updateRouteMonitoring = async (location) => {
    if (!routeMonitoring) return

    try {
      const response = await fetch(`/api/v1/sos/monitoring/${routeMonitoring.id}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(location)
      })

      if (response.ok) {
        const result = await response.json()
        
        // Check if deviation detected
        if (result.data.isDeviated && result.data.suggestedAction === 'trigger_alert') {
          // Alert will be triggered by backend, load active alerts
          loadActiveAlerts()
        }
        
        // Update trip route
        setTripRoute(prev => [...prev, location])
      }
    } catch (error) {
      console.error('Error updating route monitoring:', error)
    }
  }

  const loadActiveAlerts = async () => {
    try {
      const response = await fetch('/api/v1/sos/alerts/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.data.length > 0) {
          setActiveAlert(result.data[0]) // Show the most recent alert
        }
      }
    } catch (error) {
      console.error('Error loading active alerts:', error)
    }
  }

  const triggerManualSOS = async () => {
    if (!sosProfile || !currentLocation) {
      alert('SOS profile and location are required')
      return
    }

    try {
      const response = await fetch('/api/v1/sos/alert/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sosProfileId: sosProfile.id,
          alertType: 'manual_trigger',
          currentLocation,
          isStealthMode: false
        })
      })

      if (response.ok) {
        const result = await response.json()
        setActiveAlert(result.data)
      } else {
        throw new Error('Failed to trigger SOS alert')
      }
    } catch (error) {
      console.error('Error triggering SOS alert:', error)
      alert('Error triggering SOS alert. Please try again.')
    }
  }

  const handlePasswordSubmit = async (password, isPartial, escalate) => {
    if (!activeAlert) return false

    try {
      if (escalate) {
        // Handle escalation (max attempts reached or time expired)
        alert('Alert escalated! Emergency contacts and authorities have been notified.')
        setActiveAlert(null)
        return true
      }

      const response = await fetch(`/api/v1/sos/alert/${activeAlert.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          password,
          isPartialPassword: isPartial
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.data.success) {
          if (result.data.action === 'deactivate') {
            setActiveAlert(null)
            alert('SOS alert deactivated successfully!')
          } else if (result.data.action === 'stealth') {
            setActiveAlert(prev => ({ ...prev, isStealthMode: true }))
            alert('Stealth mode activated. Monitoring continues silently.')
          }
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (error) {
      console.error('Error verifying password:', error)
      return false
    }
  }

  const handleAlertDismiss = () => {
    setActiveAlert(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SOS system...</p>
        </div>
      </div>
    )
  }

  if (showPasswordSetup || !sosProfile) {
    return (
      <SOSPasswordSetup
        onComplete={handlePasswordSetupComplete}
        onCancel={() => setShowPasswordSetup(false)}
        existingProfile={sosProfile}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">SOS Safety System</h1>
              <p className="text-sm text-gray-600">
                {isMonitoring ? 'Monitoring active' : 'Ready for emergency protection'}
              </p>
            </div>
            <button
              onClick={() => setShowPasswordSetup(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4">
          {/* Emergency SOS Button */}
          <div className="card border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Emergency SOS</h3>
                <p className="text-sm text-gray-600">Trigger immediate emergency alert</p>
              </div>
              <button
                onClick={triggerManualSOS}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                <Shield size={20} className="inline mr-2" />
                SOS
              </button>
            </div>
          </div>

          {/* Cab Monitoring */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Cab Safety Monitoring</h3>
                <p className="text-sm text-gray-600">
                  {isMonitoring ? 'Currently monitoring your route' : 'Start route deviation monitoring'}
                </p>
              </div>
              {isMonitoring ? (
                <button
                  onClick={stopMonitoring}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  <Pause size={16} />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const destination = {
                      latitude: currentLocation.latitude + 0.01,
                      longitude: currentLocation.longitude + 0.01,
                      address: 'Sample Destination'
                    }
                    startCabMonitoring(destination)
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Play size={16} />
                  <span>Start</span>
                </button>
              )}
            </div>

            {isMonitoring && routeMonitoring && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin size={16} className="text-blue-600" />
                  <span>Destination: {JSON.parse(routeMonitoring.destination).address || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock size={16} className="text-green-600" />
                  <span>Started: {new Date(routeMonitoring.startTime).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <span>Deviation threshold: {routeMonitoring.deviationThreshold}m</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">SOS Profile</h4>
            <p className="text-sm text-gray-600 mt-1">
              {sosProfile.isEnabled ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Emergency Contacts</h4>
            <p className="text-sm text-gray-600 mt-1">
              {emergencyContacts.length} contacts
            </p>
          </div>
        </div>

        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
            <div className="space-y-3">
              {emergencyContacts.slice(0, 3).map((contact, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <PhoneCall className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Priority: {contact.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Location */}
        {currentLocation && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Current Location</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin size={16} />
              <span>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </span>
            </div>
            {currentLocation.accuracy && (
              <p className="text-xs text-gray-500 mt-1">
                Accuracy: ±{Math.round(currentLocation.accuracy)}m
              </p>
            )}
          </div>
        )}

        {/* Safety Tips */}
        <div className="card border-l-4 border-blue-500 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-3">Safety Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Always inform someone about your cab ride</li>
            <li>• Verify the cab details before getting in</li>
            <li>• Keep your phone charged and accessible</li>
            <li>• Practice using your SOS passwords safely</li>
            <li>• Trust your instincts - activate SOS if you feel unsafe</li>
          </ul>
        </div>
      </main>

      {/* Emergency Alert Modal */}
      {activeAlert && (
        <SOSEmergencyAlert
          alert={activeAlert}
          onPasswordSubmit={handlePasswordSubmit}
          onDismiss={handleAlertDismiss}
        />
      )}
    </div>
  )
}

export default SOSManager