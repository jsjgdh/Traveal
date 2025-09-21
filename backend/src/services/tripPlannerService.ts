import { TripPlan, TripDestination, ItineraryItem, TripCompanion, BookingItem, PackingItem, PlaceSearchResult, TripExportOptions, SharePermission, OfflineItineraryData } from '../types/index.js';
import logger from '../utils/logger.js';

// Mock database operations - in real implementation, this would use a database
class MockTripPlannerDB {
  private tripPlans: Map<string, TripPlan> = new Map();
  private destinations: Map<string, TripDestination> = new Map();
  private itineraryItems: Map<string, ItineraryItem> = new Map();
  private companions: Map<string, TripCompanion> = new Map();
  private bookings: Map<string, BookingItem> = new Map();
  private packingItems: Map<string, PackingItem> = new Map();

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Trip Plan CRUD
  createTripPlan(tripPlan: TripPlan): TripPlan {
    const id = this.generateId();
    const newTripPlan = { ...tripPlan, id };
    this.tripPlans.set(id, newTripPlan);
    return newTripPlan;
  }

  getTripPlan(id: string): TripPlan | undefined {
    return this.tripPlans.get(id);
  }

  updateTripPlan(id: string, updateData: Partial<TripPlan>): TripPlan | undefined {
    const existing = this.tripPlans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData, id };
    this.tripPlans.set(id, updated);
    return updated;
  }

  deleteTripPlan(id: string): boolean {
    return this.tripPlans.delete(id);
  }

  getUserTripPlans(userId: string, filters: any): TripPlan[] {
    const plans = Array.from(this.tripPlans.values()).filter(plan => plan.userId === userId);
    
    if (filters.status) {
      return plans.filter(plan => plan.status === filters.status);
    }
    
    if (filters.upcoming) {
      const now = new Date();
      return plans.filter(plan => plan.startDate > now);
    }
    
    return plans;
  }

  // Destination CRUD
  addDestination(destination: TripDestination): TripDestination {
    const id = this.generateId();
    const newDestination = { ...destination, id };
    this.destinations.set(id, newDestination);
    return newDestination;
  }

  updateDestination(id: string, updateData: Partial<TripDestination>): TripDestination | undefined {
    const existing = this.destinations.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData, id };
    this.destinations.set(id, updated);
    return updated;
  }

  removeDestination(id: string): boolean {
    return this.destinations.delete(id);
  }

  getTripDestinations(tripPlanId: string): TripDestination[] {
    return Array.from(this.destinations.values()).filter(dest => dest.tripPlanId === tripPlanId);
  }

  // Itinerary CRUD
  addItineraryItem(item: ItineraryItem): ItineraryItem {
    const id = this.generateId();
    const newItem = { ...item, id };
    this.itineraryItems.set(id, newItem);
    return newItem;
  }

  updateItineraryItem(id: string, updateData: Partial<ItineraryItem>): ItineraryItem | undefined {
    const existing = this.itineraryItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData, id };
    this.itineraryItems.set(id, updated);
    return updated;
  }

  removeItineraryItem(id: string): boolean {
    return this.itineraryItems.delete(id);
  }

  getTripItinerary(tripPlanId: string): ItineraryItem[] {
    return Array.from(this.itineraryItems.values()).filter(item => item.tripPlanId === tripPlanId);
  }

  // Companion CRUD
  addCompanion(companion: TripCompanion): TripCompanion {
    const id = this.generateId();
    const newCompanion = { ...companion, id };
    this.companions.set(id, newCompanion);
    return newCompanion;
  }

  // Booking CRUD
  addBookingItem(booking: BookingItem): BookingItem {
    const id = this.generateId();
    const newBooking = { ...booking, id };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  getTripBookings(tripPlanId: string): BookingItem[] {
    return Array.from(this.bookings.values()).filter(booking => booking.tripPlanId === tripPlanId);
  }

  // Packing List CRUD
  updatePackingItems(tripPlanId: string, items: PackingItem[]): PackingItem[] {
    // Remove existing items for this trip
    const existingKeys = Array.from(this.packingItems.keys());
    existingKeys.forEach(key => {
      const item = this.packingItems.get(key);
      if (item && item.tripPlanId === tripPlanId) {
        this.packingItems.delete(key);
      }
    });

    // Add new items
    const newItems: PackingItem[] = [];
    items.forEach(item => {
      const id = this.generateId();
      const newItem = { ...item, id, tripPlanId };
      this.packingItems.set(id, newItem);
      newItems.push(newItem);
    });

    return newItems;
  }

  getTripPackingList(tripPlanId: string): PackingItem[] {
    return Array.from(this.packingItems.values()).filter(item => item.tripPlanId === tripPlanId);
  }
}

// Singleton database instance
const tripPlannerDB = new MockTripPlannerDB();

export class TripPlannerService {
  
  static async createTripPlan(tripPlanData: Partial<TripPlan>): Promise<TripPlan | null> {
    try {
      const tripPlan = tripPlannerDB.createTripPlan(tripPlanData as TripPlan);
      logger.info(`Trip plan created: ${tripPlan.id}`);
      return tripPlan;
    } catch (error) {
      logger.error('Error creating trip plan:', error);
      return null;
    }
  }

  static async getUserTripPlans(userId: string, page: number, limit: number, filters: any): Promise<{ tripPlans: TripPlan[], total: number } | null> {
    try {
      const allPlans = tripPlannerDB.getUserTripPlans(userId, filters);
      const total = allPlans.length;
      const startIndex = (page - 1) * limit;
      const tripPlans = allPlans.slice(startIndex, startIndex + limit);
      
      return { tripPlans, total };
    } catch (error) {
      logger.error('Error fetching user trip plans:', error);
      return null;
    }
  }

  static async getTripPlanById(tripPlanId: string, userId: string): Promise<TripPlan | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      // Populate related data
      const destinations = tripPlannerDB.getTripDestinations(tripPlanId);
      const itinerary = tripPlannerDB.getTripItinerary(tripPlanId);
      const bookings = tripPlannerDB.getTripBookings(tripPlanId);
      const packingList = tripPlannerDB.getTripPackingList(tripPlanId);

      return {
        ...tripPlan,
        destinations,
        itinerary,
        bookingOrganizer: bookings,
        packingList
      };
    } catch (error) {
      logger.error('Error fetching trip plan by ID:', error);
      return null;
    }
  }

  static async updateTripPlan(tripPlanId: string, userId: string, updateData: Partial<TripPlan>): Promise<TripPlan | null> {
    try {
      const existing = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!existing || existing.userId !== userId) {
        return null;
      }

      const updated = tripPlannerDB.updateTripPlan(tripPlanId, updateData);
      logger.info(`Trip plan updated: ${tripPlanId}`);
      return updated || null;
    } catch (error) {
      logger.error('Error updating trip plan:', error);
      return null;
    }
  }

  static async deleteTripPlan(tripPlanId: string, userId: string): Promise<boolean> {
    try {
      const existing = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!existing || existing.userId !== userId) {
        return false;
      }

      const success = tripPlannerDB.deleteTripPlan(tripPlanId);
      if (success) {
        logger.info(`Trip plan deleted: ${tripPlanId}`);
      }
      return success;
    } catch (error) {
      logger.error('Error deleting trip plan:', error);
      return false;
    }
  }

  static async addDestination(tripPlanId: string, userId: string, destinationData: Partial<TripDestination>): Promise<TripDestination | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const destination = tripPlannerDB.addDestination({
        ...destinationData,
        tripPlanId
      } as TripDestination);

      return destination;
    } catch (error) {
      logger.error('Error adding destination:', error);
      return null;
    }
  }

  static async updateDestination(tripPlanId: string, destinationId: string, userId: string, updateData: Partial<TripDestination>): Promise<TripDestination | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const updated = tripPlannerDB.updateDestination(destinationId, updateData);
      return updated || null;
    } catch (error) {
      logger.error('Error updating destination:', error);
      return null;
    }
  }

  static async removeDestination(tripPlanId: string, destinationId: string, userId: string): Promise<boolean> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return false;
      }

      return tripPlannerDB.removeDestination(destinationId);
    } catch (error) {
      logger.error('Error removing destination:', error);
      return false;
    }
  }

  static async addItineraryItem(tripPlanId: string, userId: string, itemData: Partial<ItineraryItem>): Promise<ItineraryItem | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const item = tripPlannerDB.addItineraryItem({
        ...itemData,
        tripPlanId
      } as ItineraryItem);

      return item;
    } catch (error) {
      logger.error('Error adding itinerary item:', error);
      return null;
    }
  }

  static async updateItineraryItem(tripPlanId: string, itemId: string, userId: string, updateData: Partial<ItineraryItem>): Promise<ItineraryItem | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const updated = tripPlannerDB.updateItineraryItem(itemId, updateData);
      return updated || null;
    } catch (error) {
      logger.error('Error updating itinerary item:', error);
      return null;
    }
  }

  static async removeItineraryItem(tripPlanId: string, itemId: string, userId: string): Promise<boolean> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return false;
      }

      return tripPlannerDB.removeItineraryItem(itemId);
    } catch (error) {
      logger.error('Error removing itinerary item:', error);
      return false;
    }
  }

  static async searchPlaces(query: string, type?: string, location?: string, radius?: number): Promise<PlaceSearchResult[]> {
    try {
      // Mock implementation - in real app, this would call external APIs like Google Places, Foursquare, etc.
      const mockResults: PlaceSearchResult[] = [
        {
          placeId: 'mock-1',
          name: `${query} Hotel`,
          type: 'hotel',
          location: {
            latitude: 10.0261,
            longitude: 76.3271,
            address: 'Sample Hotel Address, Kochi'
          },
          rating: 4.5,
          priceLevel: 3
        },
        {
          placeId: 'mock-2',
          name: `${query} Restaurant`,
          type: 'restaurant',
          location: {
            latitude: 10.0261,
            longitude: 76.3271,
            address: 'Sample Restaurant Address, Kochi'
          },
          rating: 4.2,
          priceLevel: 2
        }
      ];

      return mockResults;
    } catch (error) {
      logger.error('Error searching places:', error);
      return [];
    }
  }

  static async addCompanion(tripPlanId: string, userId: string, companionData: Partial<TripCompanion>): Promise<TripCompanion | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const companion = tripPlannerDB.addCompanion({
        ...companionData,
        tripPlanId,
        inviteStatus: 'pending'
      } as TripCompanion);

      return companion;
    } catch (error) {
      logger.error('Error adding companion:', error);
      return null;
    }
  }

  static async addBookingItem(tripPlanId: string, userId: string, bookingData: Partial<BookingItem>): Promise<BookingItem | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const booking = tripPlannerDB.addBookingItem({
        ...bookingData,
        tripPlanId,
        receipts: []
      } as BookingItem);

      return booking;
    } catch (error) {
      logger.error('Error adding booking item:', error);
      return null;
    }
  }

  static async updatePackingList(tripPlanId: string, userId: string, packingItems: PackingItem[]): Promise<PackingItem[] | null> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      const updatedItems = tripPlannerDB.updatePackingItems(tripPlanId, packingItems);
      return updatedItems;
    } catch (error) {
      logger.error('Error updating packing list:', error);
      return null;
    }
  }

  static async shareTripPlan(tripPlanId: string, userId: string, shareWith: any[], permissions: string): Promise<any> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      // Mock sharing logic
      const shareToken = Math.random().toString(36).substr(2, 15);
      
      return {
        shareToken,
        shareUrl: `https://traveal.app/shared/${tripPlanId}/${shareToken}`,
        sharedWith: shareWith
      };
    } catch (error) {
      logger.error('Error sharing trip plan:', error);
      return null;
    }
  }

  static async exportTripPlan(tripPlanId: string, userId: string, options: any): Promise<any> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      // Mock export logic
      return {
        format: options.format,
        downloadUrl: `https://api.traveal.app/exports/${tripPlanId}.${options.format}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      logger.error('Error exporting trip plan:', error);
      return null;
    }
  }

  static async syncOfflineData(tripPlanId: string, userId: string, offlineData: any): Promise<any> {
    try {
      const tripPlan = tripPlannerDB.getTripPlan(tripPlanId);
      
      if (!tripPlan || tripPlan.userId !== userId) {
        return null;
      }

      // Mock sync logic
      return {
        synced: true,
        lastSyncAt: new Date(),
        conflicts: []
      };
    } catch (error) {
      logger.error('Error syncing offline data:', error);
      return null;
    }
  }
}