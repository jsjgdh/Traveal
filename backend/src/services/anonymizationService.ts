import { prisma } from '@/config/database';
import { config } from '@/config/environment';
import { AnonymizedTripData } from '@/types';
import { fuzzyLocation, roundTime, calculateDistance } from '@/utils/helpers';
import logger from '@/utils/logger';
import crypto from 'crypto';
// @ts-ignore - node-cron types not available
import cron from 'node-cron';

export class AnonymizationService {
  /**
   * Initialize anonymization service with scheduled jobs
   */
  static initialize() {
    // Run anonymization every hour
    cron.schedule('0 * * * *', () => {
      this.processUnprocessedTrips();
    });

    // Run data cleanup daily at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldData();
    });

    logger.info('Anonymization service initialized with scheduled jobs');
  }

  /**
   * Anonymize a single trip
   */
  static async anonymizeTrip(tripId: string): Promise<boolean> {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          locationPoints: {
            orderBy: { timestamp: 'asc' }
          },
          user: {
            select: {
              consentData: true
            }
          }
        }
      });

      if (!trip || trip.anonymizedData) {
        return false; // Already processed or doesn't exist
      }

      // Check user consent for data processing
      const consentData = JSON.parse(trip.user.consentData);
      if (!consentData.usageAnalytics.anonymousStats) {
        logger.info(`Skipping anonymization for trip ${tripId} - no consent`);
        return false;
      }

      const anonymizedData = this.createAnonymizedTripData(trip);
      
      // Store anonymized data
      await prisma.trip.update({
        where: { id: tripId },
        data: {
          anonymizedData: JSON.stringify(anonymizedData)
        }
      });

      // Store in analytics events for aggregation
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'trip_completed',
          eventData: JSON.stringify(anonymizedData),
          anonymized: true
        }
      });

      logger.info(`Trip anonymized: ${tripId}`);
      return true;
    } catch (error) {
      logger.error('Error anonymizing trip:', error);
      return false;
    }
  }

  /**
   * Process all unprocessed trips
   */
  static async processUnprocessedTrips(): Promise<number> {
    try {
      const unprocessedTrips = await prisma.trip.findMany({
        where: {
          anonymizedData: null,
          isActive: false,
          validated: true,
          endTime: { not: null }
        },
        select: { id: true }
      });

      let processedCount = 0;
      
      for (const trip of unprocessedTrips) {
        const success = await this.anonymizeTrip(trip.id);
        if (success) processedCount++;
      }

      if (processedCount > 0) {
        logger.info(`Processed ${processedCount} unprocessed trips`);
      }

      return processedCount;
    } catch (error) {
      logger.error('Error processing unprocessed trips:', error);
      return 0;
    }
  }

  /**
   * Create anonymized trip data
   */
  private static createAnonymizedTripData(trip: any): AnonymizedTripData {
    // Fuzzy start and end locations
    const fuzzedStart = fuzzyLocation(
      trip.startLatitude,
      trip.startLongitude,
      config.ANONYMIZATION_RADIUS
    );

    const fuzzedEnd = trip.endLatitude ? fuzzyLocation(
      trip.endLatitude,
      trip.endLongitude,
      config.ANONYMIZATION_RADIUS
    ) : fuzzedStart;

    // Round times to nearest hour/interval
    const roundedStartTime = roundTime(trip.startTime, config.TIME_ROUNDING_MINUTES);
    const roundedEndTime = trip.endTime ? 
      roundTime(trip.endTime, config.TIME_ROUNDING_MINUTES) : 
      roundedStartTime;

    // Round distance to nearest 100m
    const roundedDistance = trip.distance ? 
      Math.round(trip.distance / 100) * 100 : 0;

    return {
      id: this.generateAnonymousId(trip.id),
      startLocation: {
        latitude: fuzzedStart.latitude,
        longitude: fuzzedStart.longitude
      },
      endLocation: {
        latitude: fuzzedEnd.latitude,
        longitude: fuzzedEnd.longitude
      },
      startTime: roundedStartTime,
      endTime: roundedEndTime,
      distance: roundedDistance,
      mode: trip.mode || 'unknown',
      purpose: trip.purpose || 'unknown',
      companions: trip.companions || 0,
      weekday: roundedStartTime.getDay(),
      hour: roundedStartTime.getHours()
    };
  }

  /**
   * Generate anonymous trip ID
   */
  private static generateAnonymousId(originalId: string): string {
    // Create a hash-based anonymous ID
    return crypto.createHash('sha256')
      .update(originalId + config.JWT_SECRET)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Get aggregated statistics for government reporting
   */
  static async getAggregatedStats(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    mode?: string;
    purpose?: string;
    region?: { lat: number; lon: number; radius: number };
  }): Promise<any> {
    try {
      const whereClause: any = {
        eventType: 'trip_completed',
        anonymized: true
      };

      if (filters?.dateFrom || filters?.dateTo) {
        whereClause.createdAt = {};
        if (filters.dateFrom) whereClause.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) whereClause.createdAt.lte = filters.dateTo;
      }

      const events = await prisma.analyticsEvent.findMany({
        where: whereClause,
        select: {
          eventData: true,
          createdAt: true
        }
      });

      const trips = events.map((event: any) => JSON.parse(event.eventData));

      // Apply additional filters
      let filteredTrips = trips;
      
      if (filters?.mode) {
        filteredTrips = filteredTrips.filter((trip: any) => trip.mode === filters.mode);
      }

      if (filters?.purpose) {
        filteredTrips = filteredTrips.filter((trip: any) => trip.purpose === filters.purpose);
      }

      if (filters?.region) {
        filteredTrips = filteredTrips.filter((trip: any) => {
          const distance = calculateDistance(
            trip.startLocation.latitude,
            trip.startLocation.longitude,
            filters.region!.lat,
            filters.region!.lon
          );
          return distance <= filters.region!.radius;
        });
      }

      // Calculate statistics
      const totalTrips = filteredTrips.length;
      const totalDistance = filteredTrips.reduce((sum: number, trip: any) => sum + trip.distance, 0);
      const avgDistance = totalTrips > 0 ? totalDistance / totalTrips : 0;

      // Mode breakdown
      const modeBreakdown = filteredTrips.reduce((acc: Record<string, number>, trip: any) => {
        acc[trip.mode] = (acc[trip.mode] || 0) + 1;
        return acc;
      }, {});

      // Purpose breakdown
      const purposeBreakdown = filteredTrips.reduce((acc: Record<string, number>, trip: any) => {
        acc[trip.purpose] = (acc[trip.purpose] || 0) + 1;
        return acc;
      }, {});

      // Hourly distribution
      const hourlyDistribution = filteredTrips.reduce((acc: Record<number, number>, trip: any) => {
        acc[trip.hour] = (acc[trip.hour] || 0) + 1;
        return acc;
      }, {});

      // Weekly distribution
      const weeklyDistribution = filteredTrips.reduce((acc: Record<number, number>, trip: any) => {
        acc[trip.weekday] = (acc[trip.weekday] || 0) + 1;
        return acc;
      }, {});

      return {
        summary: {
          totalTrips,
          totalDistance,
          avgDistance,
          avgTripDuration: this.calculateAvgDuration(filteredTrips)
        },
        breakdown: {
          mode: modeBreakdown,
          purpose: purposeBreakdown,
          hourly: hourlyDistribution,
          weekly: weeklyDistribution
        },
        privacy: {
          anonymized: true,
          locationFuzzingRadius: config.ANONYMIZATION_RADIUS,
          timeRoundingMinutes: config.TIME_ROUNDING_MINUTES,
          minDataPoints: totalTrips >= 10 ? totalTrips : 'Insufficient data for reporting'
        }
      };
    } catch (error) {
      logger.error('Error getting aggregated stats:', error);
      return null;
    }
  }

  /**
   * Calculate average trip duration
   */
  private static calculateAvgDuration(trips: AnonymizedTripData[]): number {
    const durationsMinutes = trips
      .filter(trip => trip.endTime && trip.startTime)
      .map(trip => (trip.endTime.getTime() - trip.startTime.getTime()) / (1000 * 60));

    return durationsMinutes.length > 0 ? 
      durationsMinutes.reduce((sum, duration) => sum + duration, 0) / durationsMinutes.length : 0;
  }

  /**
   * Export anonymized data for government
   */
  static async exportAnonymizedData(filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    format?: 'json' | 'csv';
  }): Promise<string | null> {
    try {
      const filterParams: any = {};
      if (filters?.dateFrom) filterParams.dateFrom = filters.dateFrom;
      if (filters?.dateTo) filterParams.dateTo = filters.dateTo;
      
      const stats = await this.getAggregatedStats(filterParams);

      if (!stats) return null;

      if (filters?.format === 'csv') {
        return this.convertToCSV(stats);
      }

      return JSON.stringify(stats, null, 2);
    } catch (error) {
      logger.error('Error exporting anonymized data:', error);
      return null;
    }
  }

  /**
   * Convert stats to CSV format
   */
  private static convertToCSV(stats: any): string {
    const headers = ['metric', 'value'];
    const rows = [
      ['total_trips', stats.summary.totalTrips],
      ['total_distance_meters', stats.summary.totalDistance],
      ['avg_distance_meters', stats.summary.avgDistance],
      ['avg_duration_minutes', stats.summary.avgTripDuration]
    ];

    // Add mode breakdown
    Object.entries(stats.breakdown.mode).forEach(([mode, count]) => {
      rows.push([`mode_${mode}`, count]);
    });

    // Add purpose breakdown
    Object.entries(stats.breakdown.purpose).forEach(([purpose, count]) => {
      rows.push([`purpose_${purpose}`, count]);
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Clean up old personal data (GDPR compliance)
   */
  static async cleanupOldData(): Promise<number> {
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - 90); // 90 days retention

      // Delete old location points
      const deletedLocationPoints = await prisma.locationPoint.deleteMany({
        where: {
          createdAt: { lt: retentionDate }
        }
      });

      // Remove personal data from old trips (keep anonymized data)
      const oldTrips = await prisma.trip.findMany({
        where: {
          createdAt: { lt: retentionDate },
          anonymizedData: { not: null }
        },
        select: { id: true }
      });

      let updatedTrips = 0;
      for (const trip of oldTrips) {
        await prisma.trip.update({
          where: { id: trip.id },
          data: {
            startAddress: null,
            endAddress: null,
            // Keep coordinates for anonymized analysis but remove precise addresses
          }
        });
        updatedTrips++;
      }

      logger.info(`Cleanup completed: ${deletedLocationPoints.count} location points deleted, ${updatedTrips} trips anonymized`);
      
      return deletedLocationPoints.count + updatedTrips;
    } catch (error) {
      logger.error('Error cleaning up old data:', error);
      return 0;
    }
  }

  /**
   * Validate data anonymization compliance
   */
  static async validateAnonymization(): Promise<{
    compliant: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check for trips with personal data older than retention period
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - 90);

      const oldTripsWithPersonalData = await prisma.trip.count({
        where: {
          createdAt: { lt: retentionDate },
          OR: [
            { startAddress: { not: null } },
            { endAddress: { not: null } }
          ]
        }
      });

      if (oldTripsWithPersonalData > 0) {
        issues.push(`${oldTripsWithPersonalData} old trips contain personal data`);
      }

      // Check for location points older than retention period
      const oldLocationPoints = await prisma.locationPoint.count({
        where: {
          createdAt: { lt: retentionDate }
        }
      });

      if (oldLocationPoints > 0) {
        issues.push(`${oldLocationPoints} old location points found`);
      }

      // Check anonymization coverage
      const totalCompletedTrips = await prisma.trip.count({
        where: {
          isActive: false,
          validated: true,
          endTime: { not: null }
        }
      });

      const anonymizedTrips = await prisma.trip.count({
        where: {
          isActive: false,
          validated: true,
          endTime: { not: null },
          anonymizedData: { not: null }
        }
      });

      const anonymizationRate = totalCompletedTrips > 0 ? 
        (anonymizedTrips / totalCompletedTrips) * 100 : 100;

      if (anonymizationRate < 95) {
        issues.push(`Anonymization rate is ${anonymizationRate.toFixed(1)}% (should be >95%)`);
      }

      return {
        compliant: issues.length === 0,
        issues
      };
    } catch (error) {
      logger.error('Error validating anonymization:', error);
      return {
        compliant: false,
        issues: ['Error during validation check']
      };
    }
  }
}