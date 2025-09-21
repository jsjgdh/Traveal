// API Service for Traveal Backend Integration
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    this.deviceId = this.getDeviceId();
    this.authToken = localStorage.getItem('traveal_auth_token');
    this.refreshToken = localStorage.getItem('traveal_refresh_token');
  }

  // Device identification
  getDeviceId() {
    let deviceId = localStorage.getItem('traveal_device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('traveal_device_id', deviceId);
    }
    return deviceId;
  }

  generateDeviceId() {
    return 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Request helper with authentication
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Device-ID': this.deviceId,
      ...options.headers
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          // Retry the original request
          headers.Authorization = `Bearer ${this.authToken}`;
          const retryResponse = await fetch(url, { ...config, headers });
          return await retryResponse.json();
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async registerUser(consentData) {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ consentData })
      });

      if (response.success) {
        this.setAuthTokens(response.data.tokens);
        return {
          success: true,
          user: response.data.user,
          tokens: response.data.tokens
        };
      }

      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loginUser() {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST'
      });

      if (response.success) {
        this.setAuthTokens(response.data.tokens);
        return {
          success: true,
          user: response.data.user,
          tokens: response.data.tokens
        };
      }

      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async refreshAuthToken() {
    try {
      const response = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.success) {
        this.setAuthTokens(response.data.tokens);
        return true;
      }

      this.clearAuthTokens();
      return false;
    } catch (error) {
      this.clearAuthTokens();
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/auth/me');
      return response.success ? response.data.user : null;
    } catch (error) {
      return null;
    }
  }

  async updateConsent(consentData) {
    try {
      const response = await this.request('/auth/consent', {
        method: 'PUT',
        body: JSON.stringify({ consentData })
      });

      return response.success ? response.data.user : null;
    } catch (error) {
      console.error('Failed to update consent:', error);
      return null;
    }
  }

  async updatePreferences(preferences) {
    try {
      const response = await this.request('/auth/preferences', {
        method: 'PUT',
        body: JSON.stringify({ preferences })
      });

      return response.success ? response.data.user : null;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return null;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ profileData })
      });

      return response.success ? response.data.user : null;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }

  async requestDataExport(exportOptions) {
    try {
      const response = await this.request('/auth/export-data', {
        method: 'POST',
        body: JSON.stringify(exportOptions)
      });

      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to request data export:', error);
      return null;
    }
  }

  async getExportRequests() {
    try {
      const response = await this.request('/auth/export-requests');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get export requests:', error);
      return null;
    }
  }

  async downloadExport(requestId) {
    try {
      const response = await fetch(`${this.baseURL}/auth/export/${requestId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'X-Device-ID': this.getDeviceId()
        }
      });

      if (response.ok) {
        return response.blob();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to download export:', error);
      return null;
    }
  }

  async deleteAccount() {
    try {
      const response = await this.request('/auth/account', {
        method: 'DELETE'
      });

      if (response.success) {
        this.clearAuthTokens();
        localStorage.clear(); // Clear all local data
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  }

  // Trip management methods
  async createTrip(tripData) {
    try {
      const response = await this.request('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData)
      });

      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to create trip:', error);
      return null;
    }
  }

  async getTrips(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await this.request(`/trips?${queryParams}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get trips:', error);
      return null;
    }
  }

  async getActiveTrip() {
    try {
      const response = await this.request('/trips/active');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get active trip:', error);
      return null;
    }
  }

  async updateTrip(tripId, updateData) {
    try {
      const response = await this.request(`/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to update trip:', error);
      return null;
    }
  }

  async endTrip(tripId, endLocation, endTime = new Date()) {
    try {
      const response = await this.request(`/trips/${tripId}`, {
        method: 'PUT',
        body: JSON.stringify({
          endLocation,
          endTime: endTime.toISOString(),
          isActive: false
        })
      });

      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to end trip:', error);
      return null;
    }
  }

  async addLocationPoint(tripId, locationPoint) {
    try {
      const response = await this.request(`/trips/${tripId}/locations`, {
        method: 'POST',
        body: JSON.stringify(locationPoint)
      });

      return response.success;
    } catch (error) {
      console.error('Failed to add location point:', error);
      return false;
    }
  }

  async getTripStats() {
    try {
      const response = await this.request('/trips/stats');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get trip stats:', error);
      return null;
    }
  }

  // Analytics methods
  async logAnalyticsEvent(eventType, eventData) {
    try {
      const response = await this.request('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({
          eventType,
          eventData
        })
      });

      return response.success;
    } catch (error) {
      console.error('Failed to log analytics event:', error);
      return false;
    }
  }

  // Token management
  setAuthTokens(tokens) {
    this.authToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    localStorage.setItem('traveal_auth_token', tokens.accessToken);
    localStorage.setItem('traveal_refresh_token', tokens.refreshToken);
  }

  clearAuthTokens() {
    this.authToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('traveal_auth_token');
    localStorage.removeItem('traveal_refresh_token');
  }

  isAuthenticated() {
    return !!this.authToken;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api/v1', '')}/health`);
      return await response.json();
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}

// Mobile platform bridge
class MobileBridge {
  constructor() {
    this.platform = this.detectPlatform();
    this.isNative = this.platform !== 'web';
  }

  detectPlatform() {
    if (typeof window !== 'undefined') {
      if (window.ReactNativeWebView) {
        return 'react-native';
      }
      if (window.webkit?.messageHandlers?.LocationBridge) {
        return 'ios';
      }
      if (window.Android?.LocationBridge) {
        return 'android';
      }
    }
    return 'web';
  }

  // Location services
  async requestLocationPermission() {
    switch (this.platform) {
      case 'ios':
        return new Promise((resolve) => {
          window.webkit.messageHandlers.LocationBridge.postMessage({
            method: 'requestLocationPermission'
          });
          
          window.locationPermissionCallback = (result) => {
            resolve(result);
            delete window.locationPermissionCallback;
          };
        });

      case 'android':
        return new Promise((resolve) => {
          window.Android.LocationBridge.requestLocationPermission((error, result) => {
            resolve(error ? { error } : { result });
          });
        });

      case 'react-native':
        if (window.ReactNativeWebView?.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'location_permission_request'
          }));
        }
        return { result: 'web_fallback' };

      default:
        return this.requestWebLocationPermission();
    }
  }

  async requestWebLocationPermission() {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted') {
        return { result: 'granted' };
      }
      
      // Request permission through getCurrentPosition
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve({ result: 'granted' }),
          (error) => resolve({ error: error.message }),
          { timeout: 10000 }
        );
      });
    } catch (error) {
      return { error: error.message };
    }
  }

  async getCurrentLocation() {
    switch (this.platform) {
      case 'ios':
        return new Promise((resolve) => {
          window.webkit.messageHandlers.LocationBridge.postMessage({
            method: 'getCurrentLocation'
          });
          
          window.locationCallback = (result) => {
            resolve(result);
            delete window.locationCallback;
          };
        });

      case 'android':
        return new Promise((resolve) => {
          window.Android.LocationBridge.getCurrentLocation((error, result) => {
            resolve(error ? { error } : result);
          });
        });

      default:
        return this.getWebLocation();
    }
  }

  async getWebLocation() {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed || 0,
            timestamp: new Date().toISOString(),
            course: position.coords.heading || 0
          });
        },
        (error) => resolve({ error: error.message }),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }

  // Trip tracking
  async startTripTracking(tripId) {
    switch (this.platform) {
      case 'ios':
        return new Promise((resolve) => {
          window.webkit.messageHandlers.LocationBridge.postMessage({
            method: 'startTripTracking',
            tripId
          });
          
          window.tripTrackingCallback = (result) => {
            resolve(result);
            delete window.tripTrackingCallback;
          };
        });

      case 'android':
        return new Promise((resolve) => {
          window.Android.LocationBridge.startTripTracking(tripId, (error, result) => {
            resolve(error ? { error } : { result });
          });
        });

      default:
        return this.startWebTripTracking(tripId);
    }
  }

  async stopTripTracking() {
    switch (this.platform) {
      case 'ios':
        window.webkit.messageHandlers.LocationBridge.postMessage({
          method: 'stopTripTracking'
        });
        break;

      case 'android':
        window.Android.LocationBridge.stopTripTracking(() => {});
        break;

      default:
        this.stopWebTripTracking();
    }
  }

  startWebTripTracking(tripId) {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
    }

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          altitude: position.coords.altitude,
          timestamp: new Date().toISOString(),
          course: position.coords.heading || 0
        };

        // Dispatch location update event
        window.dispatchEvent(new CustomEvent('locationUpdate', {
          detail: { tripId, location: locationData }
        }));
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return { result: 'tracking_started' };
  }

  stopWebTripTracking() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  // Haptic feedback
  async playHaptic(type) {
    switch (this.platform) {
      case 'ios':
        window.webkit.messageHandlers.LocationBridge.postMessage({
          method: 'playHaptic',
          type
        });
        break;

      case 'android':
        window.Android.LocationBridge.playHaptic(type, () => {});
        break;

      default:
        this.playWebHaptic(type);
    }
  }

  playWebHaptic(type) {
    if ('vibrate' in navigator) {
      const patterns = {
        trip_start: [200, 100, 200],
        trip_end: [150, 75, 150, 75, 150],
        waypoint: [100],
        validation: [300],
        achievement: [100, 50, 100, 50, 100, 50, 100, 50, 100],
        error: [500]
      };

      navigator.vibrate(patterns[type] || patterns.waypoint);
    }
  }
}

// Create singleton instances
const apiService = new ApiService();
const mobileBridge = new MobileBridge();

export { apiService, mobileBridge };
export default apiService;