import { prisma } from '@/config/database';
import { config } from '@/config/environment';
import { TripData, LocationPoint } from '@/types';
import { calculateDistance } from '@/utils/helpers';
import logger from '@/utils/logger';

export class TripService {
  /**
   * Create a new trip
   */
  static async createTrip(tripData: TripData): Promise<any | null> {
    try {
      const trip = await prisma.trip.create({
        data: {
          userId: tripData.userId,
          startLatitude: tripData.startLocation.latitude,
          startLongitude: tripData.startLocation.longitude,
          startAddress: tripData.startLocation.address || null,
          endLatitude: tripData.endLocation?.latitude || null,
          endLongitude: tripData.endLocation?.longitude || null,
          endAddress: tripData.endLocation?.address || null,
          startTime: tripData.startTime,
          endTime: tripData.endTime || null,
          distance: tripData.distance || null,
          mode: tripData.mode || null,
          purpose: tripData.purpose || null,
          companions: tripData.companions || 0,
          validated: tripData.validated || false,
          isActive: tripData.isActive !== undefined ? tripData.isActive : true
        },
        include: {
          locationPoints: true
        }
      });

      logger.info(`Trip created: ${trip.id}`);
      return this.formatTripData(trip);
    } catch (error) {
      logger.error('Error creating trip:', error);
      return null;
    }
  }

  /**
   * Get trip by ID
   */
  static async getTripById(tripId: string, userId: string): Promise<any | null> {
    try {
      const trip = await prisma.trip.findFirst({
        where: {
          id: tripId,
          userId: userId
        },
        include: {
          locationPoints: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!trip) return null;

      return this.formatTripData(trip);
    } catch (error) {
      logger.error('Error getting trip by ID:', error);
      return null;
    }
  }

  /**
   * Get user trips with pagination
   */
  static async getUserTrips(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      mode?: string;
      purpose?: string;
      validated?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ trips: any[]; total: number } | null> {
    try {
      const offset = (page - 1) * limit;
      
      const where: any = {
        userId,
        isActive: false // Only completed trips
      };

      // Apply filters
      if (filters) {
        if (filters.mode) where.mode = filters.mode;
        if (filters.purpose) where.purpose = filters.purpose;
        if (filters.validated !== undefined) where.validated = filters.validated;
        if (filters.dateFrom || filters.dateTo) {
          where.startTime = {};
          if (filters.dateFrom) where.startTime.gte = filters.dateFrom;
          if (filters.dateTo) where.startTime.lte = filters.dateTo;
        }
      }

      const [trips, total] = await Promise.all([
        prisma.trip.findMany({
          where,
          include: {
            locationPoints: {
              take: 10, // Limit location points for list view
              orderBy: { timestamp: 'asc' }
            }
          },
          orderBy: { startTime: 'desc' },
          skip: offset,
          take: limit
        }),
        prisma.trip.count({ where })
      ]);

      return {
        trips: trips.map((trip: any) => this.formatTripData(trip)),
        total
      };
    } catch (error) {
      logger.error('Error getting user trips:', error);
      return null;
    }
  }

  /**
   * Get active trip for user
   */
  static async getActiveTrip(userId: string): Promise<any | null> {
    try {
      const trip = await prisma.trip.findFirst({
        where: {
          userId,
          isActive: true
        },
        include: {
          locationPoints: {
            orderBy: { timestamp: 'desc' },
            take: 100 // Recent location points
          }
        }
      });

      if (!trip) return null;

      return this.formatTripData(trip);
    } catch (error) {
      logger.error('Error getting active trip:', error);
      return null;
    }
  }

  /**
   * Update trip
   */
  static async updateTrip(
    tripId: string,
    userId: string,
    updateData: Partial<TripData>
  ): Promise<any | null> {
    try {
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId }
      });

      if (!trip) return null;

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          ...(updateData.endLocation && {
            endLatitude: updateData.endLocation.latitude,
            endLongitude: updateData.endLocation.longitude,
            endAddress: updateData.endLocation.address
          }),
          ...(updateData.endTime && { endTime: updateData.endTime }),
          ...(updateData.mode && { mode: updateData.mode }),
          ...(updateData.purpose && { purpose: updateData.purpose }),
          ...(updateData.companions !== undefined && { companions: updateData.companions }),
          ...(updateData.validated !== undefined && { validated: updateData.validated }),
          ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
          updatedAt: new Date()
        },
        include: {
          locationPoints: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      // Calculate distance if end location is provided
      if (updateData.endLocation && !updateData.isActive) {
        const distance = calculateDistance(
          trip.startLatitude,
          trip.startLongitude,
          updateData.endLocation.latitude,
          updateData.endLocation.longitude
        );

        await prisma.trip.update({
          where: { id: tripId },
          data: { distance }
        });

        updatedTrip.distance = distance;
      }

      logger.info(`Trip updated: ${tripId}`);
      return this.formatTripData(updatedTrip);
    } catch (error) {
      logger.error('Error updating trip:', error);
      return null;
    }
  }

  /**
   * End active trip
   */
  static async endTrip(
    tripId: string,
    userId: string,
    endLocation: { latitude: number; longitude: number; address?: string },
    endTime: Date
  ): Promise<any | null> {
    try {
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId, isActive: true }
      });

      if (!trip) return null;

      // Calculate distance
      const distance = calculateDistance(
        trip.startLatitude,
        trip.startLongitude,
        endLocation.latitude,
        endLocation.longitude
      );

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: {
          endLatitude: endLocation.latitude,
          endLongitude: endLocation.longitude,
          endAddress: endLocation.address || null,
          endTime,
          distance,
          isActive: false,
          updatedAt: new Date()
        },
        include: {
          locationPoints: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      logger.info(`Trip ended: ${tripId}`);
      return this.formatTripData(updatedTrip);
    } catch (error) {
      logger.error('Error ending trip:', error);
      return null;
    }
  }

  /**
   * Add location point to trip
   */
  static async addLocationPoint(
    tripId: string,
    userId: string,
    locationPoint: LocationPoint
  ): Promise<boolean> {
    try {
      // Verify trip belongs to user and is active
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId, isActive: true }
      });

      if (!trip) return false;

      // Check if location is accurate enough
      if (locationPoint.accuracy && locationPoint.accuracy > config.LOCATION_ACCURACY_THRESHOLD) {
        logger.warn(`Location point rejected due to poor accuracy: ${locationPoint.accuracy}`);
        return false;
      }

      await prisma.locationPoint.create({
        data: {
          tripId,
          latitude: locationPoint.latitude,
          longitude: locationPoint.longitude,
          accuracy: locationPoint.accuracy || null,
          speed: locationPoint.speed || null,
          altitude: locationPoint.altitude || null,
          timestamp: locationPoint.timestamp
        }
      });

      return true;
    } catch (error) {
      logger.error('Error adding location point:', error);
      return false;
    }
  }

  /**
   * Delete trip
   */
  static async deleteTrip(tripId: string, userId: string): Promise<boolean> {
    try {
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId }
      });

      if (!trip) return false;

      await prisma.trip.delete({
        where: { id: tripId }
      });

      logger.info(`Trip deleted: ${tripId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting trip:', error);
      return false;
    }
  }

  /**
   * Get trip statistics for user
   */
  static async getTripStats(userId: string): Promise<any | null> {
    try {
      const stats = await prisma.trip.aggregate({
        where: {
          userId,
          isActive: false,
          validated: true
        },
        _count: {
          id: true
        },
        _sum: {
          distance: true
        },
        _avg: {
          distance: true
        }
      });

      const modeStats = await prisma.trip.groupBy({
        by: ['mode'],
        where: {
          userId,
          isActive: false,
          validated: true,
          mode: { not: null }
        },
        _count: {
          mode: true
        }
      });

      const purposeStats = await prisma.trip.groupBy({
        by: ['purpose'],
        where: {
          userId,
          isActive: false,
          validated: true,
          purpose: { not: null }
        },
        _count: {
          purpose: true
        }
      });

      return {
        totalTrips: stats._count.id,
        totalDistance: stats._sum.distance || 0,
        averageDistance: stats._avg.distance || 0,
        modeBreakdown: modeStats.reduce((acc: Record<string, number>, item: any) => {
          if (item.mode) {
            acc[item.mode] = item._count.mode;
          }
          return acc;
        }, {} as Record<string, number>),
        purposeBreakdown: purposeStats.reduce((acc: Record<string, number>, item: any) => {
          if (item.purpose) {
            acc[item.purpose] = item._count.purpose;
          }
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      logger.error('Error getting trip stats:', error);
      return null;
    }
  }

  /**
   * Detect trip patterns and auto-classify
   */
  static async detectTripPatterns(tripId: string): Promise<void> {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          locationPoints: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!trip || trip.locationPoints.length < 2) return;

      // Simple speed-based mode detection
      const speeds = trip.locationPoints
        .filter((point: any) => point.speed && point.speed > 0)
        .map((point: any) => point.speed!);

      if (speeds.length > 0) {
        const avgSpeed = speeds.reduce((sum: number, speed: number) => sum + speed, 0) / speeds.length;
        const maxSpeed = Math.max(...speeds);

        let detectedMode = 'walking';

        if (maxSpeed > 80) { // 80 km/h
          detectedMode = 'driving';
        } else if (maxSpeed > 25) { // 25 km/h
          detectedMode = 'cycling';
        } else if (avgSpeed > 15) { // 15 km/h average
          detectedMode = 'public_transport';
        }

        // Update trip with detected mode if not already set
        if (!trip.mode) {
          await prisma.trip.update({
            where: { id: tripId },
            data: { mode: detectedMode }
          });

          logger.info(`Trip mode auto-detected: ${tripId} -> ${detectedMode}`);
        }
      }
    } catch (error) {
      logger.error('Error detecting trip patterns:', error);
    }
  }

  /**
   * Format trip data for API response
   */
  private static formatTripData(trip: any): any {
    return {
      id: trip.id,
      startLocation: {
        latitude: trip.startLatitude,
        longitude: trip.startLongitude,
        address: trip.startAddress
      },
      endLocation: trip.endLatitude ? {
        latitude: trip.endLatitude,
        longitude: trip.endLongitude,
        address: trip.endAddress
      } : null,
      startTime: trip.startTime,
      endTime: trip.endTime,
      distance: trip.distance,
      mode: trip.mode,
      purpose: trip.purpose,
      companions: trip.companions,
      validated: trip.validated,
      isActive: trip.isActive,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      locationPoints: trip.locationPoints?.map((point: any) => ({
        id: point.id,
        latitude: point.latitude,
        longitude: point.longitude,
        accuracy: point.accuracy,
        speed: point.speed,
        altitude: point.altitude,
        timestamp: point.timestamp
      })) || []
    };
  }
}