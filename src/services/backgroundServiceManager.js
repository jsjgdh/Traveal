/**
 * Background Service and GPS Monitoring Utilities
 * Handles background permissions, location tracking, and service worker integration
 */

class BackgroundServiceManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator
    this.serviceWorker = null
    this.locationWatcher = null
    this.permissions = {
      location: 'prompt',
      notifications: 'default',
      background: 'prompt'
    }
    this.isMonitoring = false
    this.callbacks = {
      onLocationUpdate: null,
      onPermissionChange: null,
      onError: null
    }
  }

  /**
   * Initialize the background service manager
   */
  async initialize() {
    try {
      if (!this.isSupported) {
        throw new Error('Service Worker not supported')
      }

      // Register service worker
      await this.registerServiceWorker()
      
      // Check current permissions
      await this.checkPermissions()

      return true
    } catch (error) {
      console.error('Failed to initialize background service:', error)
      return false
    }
  }

  /**
   * Register service worker for background operations
   */
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      this.serviceWorker = registration

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this))

      console.log('Service Worker registered successfully')
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      throw error
    }
  }

  /**
   * Handle messages from service worker
   */
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data

    switch (type) {
      case 'LOCATION_UPDATE':
        if (this.callbacks.onLocationUpdate) {
          this.callbacks.onLocationUpdate(data)
        }
        break
      case 'PERMISSION_CHANGE':
        this.permissions = { ...this.permissions, ...data }
        if (this.callbacks.onPermissionChange) {
          this.callbacks.onPermissionChange(this.permissions)
        }
        break
      case 'ERROR':
        if (this.callbacks.onError) {
          this.callbacks.onError(data)
        }
        break
      default:
        console.log('Unknown service worker message:', type, data)
    }
  }

  /**
   * Check and request necessary permissions
   */
  async checkPermissions() {
    const permissions = {}

    try {
      // Check location permission
      if ('permissions' in navigator) {
        const locationPermission = await navigator.permissions.query({ name: 'geolocation' })
        permissions.location = locationPermission.state

        // Listen for permission changes
        locationPermission.addEventListener('change', () => {
          this.permissions.location = locationPermission.state
          if (this.callbacks.onPermissionChange) {
            this.callbacks.onPermissionChange(this.permissions)
          }
        })
      }

      // Check notification permission
      if ('Notification' in window) {
        permissions.notifications = Notification.permission
      }

      // Check background sync permission (if available)
      if ('permissions' in navigator) {
        try {
          const backgroundSync = await navigator.permissions.query({ name: 'background-sync' })
          permissions.background = backgroundSync.state
        } catch (error) {
          // Background sync permission not available in all browsers
          permissions.background = 'unsupported'
        }
      }

      this.permissions = { ...this.permissions, ...permissions }
      return this.permissions
    } catch (error) {
      console.error('Error checking permissions:', error)
      return this.permissions
    }
  }

  /**
   * Request location permission
   */
  async requestLocationPermission() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        })
      })

      this.permissions.location = 'granted'
      return {
        granted: true,
        position: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        }
      }
    } catch (error) {
      this.permissions.location = 'denied'
      return {
        granted: false,
        error: error.message
      }
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported')
      }

      const permission = await Notification.requestPermission()
      this.permissions.notifications = permission

      return {
        granted: permission === 'granted',
        permission
      }
    } catch (error) {
      return {
        granted: false,
        error: error.message
      }
    }
  }

  /**
   * Request background app permission (PWA)
   */
  async requestBackgroundPermission() {
    try {
      // For PWA, this involves checking if app is installed
      let isInstalled = false
      
      if ('getInstalledRelatedApps' in navigator) {
        const relatedApps = await navigator.getInstalledRelatedApps()
        isInstalled = relatedApps.length > 0
      }

      // Check if running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true

      this.permissions.background = isInstalled || isStandalone ? 'granted' : 'prompt'

      return {
        granted: this.permissions.background === 'granted',
        isInstalled,
        isStandalone
      }
    } catch (error) {
      return {
        granted: false,
        error: error.message
      }
    }
  }

  /**
   * Start GPS monitoring in background
   */
  async startGPSMonitoring(options = {}) {
    try {
      if (this.permissions.location !== 'granted') {
        const locationResult = await this.requestLocationPermission()
        if (!locationResult.granted) {
          throw new Error('Location permission denied')
        }
      }

      const watchOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
        ...options
      }

      this.locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            heading: position.coords.heading,
            altitude: position.coords.altitude,
            timestamp: new Date(position.timestamp)
          }

          // Send to service worker for background processing
          if (this.serviceWorker) {
            this.serviceWorker.active?.postMessage({
              type: 'LOCATION_UPDATE',
              data: locationData
            })
          }

          // Call callback if provided
          if (this.callbacks.onLocationUpdate) {
            this.callbacks.onLocationUpdate(locationData)
          }
        },
        (error) => {
          console.error('GPS monitoring error:', error)
          if (this.callbacks.onError) {
            this.callbacks.onError({
              type: 'location_error',
              message: error.message,
              code: error.code
            })
          }
        },
        watchOptions
      )

      this.isMonitoring = true
      return { success: true, watcherId: this.locationWatcher }
    } catch (error) {
      console.error('Failed to start GPS monitoring:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Stop GPS monitoring
   */
  stopGPSMonitoring() {
    if (this.locationWatcher) {
      navigator.geolocation.clearWatch(this.locationWatcher)
      this.locationWatcher = null
      this.isMonitoring = false

      // Notify service worker
      if (this.serviceWorker) {
        this.serviceWorker.active?.postMessage({
          type: 'STOP_MONITORING'
        })
      }

      return true
    }
    return false
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(options = {}) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
          ...options
        })
      })

      return {
        success: true,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          altitude: position.coords.altitude,
          timestamp: new Date(position.timestamp)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      }
    }
  }

  /**
   * Enable background sync for offline capability
   */
  async enableBackgroundSync(tag = 'sos-sync') {
    try {
      if (!this.serviceWorker || !('sync' in window.ServiceWorkerRegistration.prototype)) {
        throw new Error('Background Sync not supported')
      }

      await this.serviceWorker.sync.register(tag)
      return { success: true, tag }
    } catch (error) {
      console.error('Background sync registration failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Set callbacks for various events
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Check if device supports background operation
   */
  checkBackgroundSupport() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      notifications: 'Notification' in window,
      geolocation: 'geolocation' in navigator,
      wakeLock: 'wakeLock' in navigator,
      permissions: 'permissions' in navigator
    }
  }

  /**
   * Request wake lock to keep screen on during monitoring
   */
  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await navigator.wakeLock.request('screen')
        return { success: true, wakeLock }
      } else {
        throw new Error('Wake Lock API not supported')
      }
    } catch (error) {
      console.error('Wake lock request failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get battery status for background monitoring optimization
   */
  async getBatteryStatus() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery()
        return {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        }
      } else {
        throw new Error('Battery API not supported')
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  /**
   * Optimize monitoring based on battery level
   */
  async optimizeForBattery() {
    const battery = await this.getBatteryStatus()
    
    if (battery.level !== undefined) {
      // Adjust monitoring frequency based on battery level
      if (battery.level < 0.2 && !battery.charging) {
        return {
          enableHighAccuracy: false,
          maximumAge: 30000, // 30 seconds
          timeout: 15000
        }
      } else if (battery.level < 0.5 && !battery.charging) {
        return {
          enableHighAccuracy: true,
          maximumAge: 15000, // 15 seconds
          timeout: 10000
        }
      }
    }

    // Default high-accuracy settings
    return {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    }
  }

  /**
   * Send location data to backend
   */
  async syncLocationData(locationData, endpoint = '/api/v1/sos/monitoring') {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(locationData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('Location sync failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get permission status summary
   */
  getPermissionSummary() {
    return {
      location: this.permissions.location,
      notifications: this.permissions.notifications,
      background: this.permissions.background,
      allGranted: this.permissions.location === 'granted' && 
                  this.permissions.notifications === 'granted',
      isMonitoring: this.isMonitoring,
      support: this.checkBackgroundSupport()
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopGPSMonitoring()
    
    if (this.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', this.handleServiceWorkerMessage)
    }
    
    this.callbacks = {
      onLocationUpdate: null,
      onPermissionChange: null,
      onError: null
    }
  }
}

// Export singleton instance
export const backgroundServiceManager = new BackgroundServiceManager()
export default backgroundServiceManager