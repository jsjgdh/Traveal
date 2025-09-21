// Trip Planner API Service
const API_BASE_URL = 'http://localhost:5000/api/v1';

class TripPlannerAPI {
  // Helper method to get auth headers
  static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'X-Device-ID': localStorage.getItem('device_id') || 'web-client'
    };
  }

  // Trip Plan CRUD Operations
  static async createTripPlan(tripPlanData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tripPlanData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating trip plan:', error);
      throw error;
    }
  }

  static async getTripPlans(page = 1, limit = 20, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/trip-planner?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trip plans:', error);
      throw error;
    }
  }

  static async getTripPlanById(tripPlanId) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trip plan:', error);
      throw error;
    }
  }

  static async updateTripPlan(tripPlanId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating trip plan:', error);
      throw error;
    }
  }

  static async deleteTripPlan(tripPlanId) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting trip plan:', error);
      throw error;
    }
  }

  // Destination Management
  static async addDestination(tripPlanId, destinationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/destinations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(destinationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding destination:', error);
      throw error;
    }
  }

  static async updateDestination(tripPlanId, destinationId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/destinations/${destinationId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating destination:', error);
      throw error;
    }
  }

  static async removeDestination(tripPlanId, destinationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/destinations/${destinationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing destination:', error);
      throw error;
    }
  }

  // Itinerary Management
  static async addItineraryItem(tripPlanId, itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/itinerary`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding itinerary item:', error);
      throw error;
    }
  }

  static async updateItineraryItem(tripPlanId, itemId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/itinerary/${itemId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating itinerary item:', error);
      throw error;
    }
  }

  static async removeItineraryItem(tripPlanId, itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/itinerary/${itemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error removing itinerary item:', error);
      throw error;
    }
  }

  // Places Search
  static async searchPlaces(query, type, location, radius = 50000) {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...(type && { type }),
        ...(location && { location }),
        radius: radius.toString()
      });
      
      const response = await fetch(`${API_BASE_URL}/trip-planner/places/search?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching places:', error);
      throw error;
    }
  }

  // Companion Management
  static async addCompanion(tripPlanId, companionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/companions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(companionData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding companion:', error);
      throw error;
    }
  }

  // Booking Management
  static async addBookingItem(tripPlanId, bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding booking item:', error);
      throw error;
    }
  }

  // Packing List Management
  static async updatePackingList(tripPlanId, packingItems) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/packing-list`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ items: packingItems })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating packing list:', error);
      throw error;
    }
  }

  // Sharing and Export
  static async shareTripPlan(tripPlanId, shareWith, permissions) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/share`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ shareWith, permissions })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sharing trip plan:', error);
      throw error;
    }
  }

  static async exportTripPlan(tripPlanId, options = {}) {
    try {
      const queryParams = new URLSearchParams({
        format: options.format || 'pdf',
        includeMap: options.includeMap ? 'true' : 'false',
        includeBookings: options.includeBookings ? 'true' : 'false',
        includePackingList: options.includePackingList ? 'true' : 'false',
        includeNotes: options.includeNotes ? 'true' : 'false'
      });
      
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/export?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error exporting trip plan:', error);
      throw error;
    }
  }

  // Offline Sync
  static async syncOfflineData(tripPlanId, offlineData) {
    try {
      const response = await fetch(`${API_BASE_URL}/trip-planner/${tripPlanId}/sync`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(offlineData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error syncing offline data:', error);
      throw error;
    }
  }
}

export default TripPlannerAPI;