import { prisma } from '../config/database.js';
import logger from '../utils/logger.js';

interface ExportRequestData {
  selectedDataTypes: {
    profile: boolean;
    tripHistory: boolean;
    analytics: boolean;
    preferences: boolean;
  };
  exportFormat: 'json' | 'csv';
  dateRange: 'all' | 'last-year' | 'last-month' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  deliveryMethod?: string;
}

export class DataExportService {
  /**
   * Create a new export request
   */
  static async createExportRequest(
    userId: string,
    requestData: ExportRequestData
  ): Promise<any | null> {
    try {
      // For simplicity, we'll generate the export immediately
      // In a real application, you might queue this for background processing
      const exportData = await this.generateUserDataExport(userId, requestData);
      
      if (!exportData) {
        return null;
      }

      // Create a mock export request record
      const mockRequest = {
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        requestDate: new Date().toISOString(),
        status: 'completed',
        format: requestData.exportFormat,
        downloadUrl: '/api/v1/auth/export/download',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        estimatedCompletion: new Date().toISOString(),
        exportData
      };

      return mockRequest;
    } catch (error) {
      logger.error('Error creating export request:', error);
      return null;
    }
  }

  /**
   * Get user's export requests
   */
  static async getUserExportRequests(userId: string): Promise<any[]> {
    try {
      // In a real implementation, this would query a database table
      // For now, return empty array since we're not persisting requests
      return [];
    } catch (error) {
      logger.error('Error getting export requests:', error);
      return [];
    }
  }

  /**
   * Get exported data for download
   */
  static async getExportedData(userId: string, requestId: string): Promise<any | null> {
    try {
      // In a real implementation, this would fetch the specific export
      // For now, generate fresh data
      const requestData: ExportRequestData = {
        selectedDataTypes: {
          profile: true,
          tripHistory: true,
          analytics: true,
          preferences: true
        },
        exportFormat: 'json',
        dateRange: 'all'
      };

      return await this.generateUserDataExport(userId, requestData);
    } catch (error) {
      logger.error('Error getting exported data:', error);
      return null;
    }
  }
  /**
   * Generate user data export
   */
  static async generateUserDataExport(
    userId: string,
    requestData: ExportRequestData
  ): Promise<any | null> {
    try {
      const userData: any = {};
      const { startDate, endDate } = this.getDateRange(requestData.dateRange);

      // Collect profile data
      if (requestData.selectedDataTypes.profile) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (user) {
          userData.profile = {
            id: user.uuid,
            memberSince: user.createdAt,
            onboarded: user.onboarded,
            lastActive: user.updatedAt
          };
        }
      }

      // Collect trip history
      if (requestData.selectedDataTypes.tripHistory) {
        const trips = await prisma.trip.findMany({
          where: {
            userId,
            startTime: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: { startTime: 'desc' }
        });

        userData.tripHistory = trips.map(trip => ({
          id: trip.id,
          startTime: trip.startTime,
          endTime: trip.endTime,
          startLocation: {
            latitude: trip.startLatitude ? Math.round(trip.startLatitude * 1000) / 1000 : null,
            longitude: trip.startLongitude ? Math.round(trip.startLongitude * 1000) / 1000 : null,
            address: trip.startAddress
          },
          endLocation: trip.endLatitude ? {
            latitude: Math.round(trip.endLatitude * 1000) / 1000,
            longitude: trip.endLongitude ? Math.round(trip.endLongitude * 1000) / 1000 : null,
            address: trip.endAddress
          } : null,
          distance: trip.distance,
          mode: trip.mode,
          purpose: trip.purpose,
          companions: trip.companions,
          validated: trip.validated
        }));
      }

      // Collect analytics data
      if (requestData.selectedDataTypes.analytics) {
        const analytics = await prisma.analyticsEvent.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        userData.analytics = analytics.map(event => ({
          eventType: event.eventType,
          createdAt: event.createdAt,
          eventData: event.eventData ? JSON.parse(event.eventData) : null,
          anonymized: event.anonymized
        }));
      }

      // Collect preferences
      if (requestData.selectedDataTypes.preferences) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (user) {
          userData.preferences = {
            userPreferences: user.preferences ? JSON.parse(user.preferences) : null,
            consentData: user.consentData ? JSON.parse(user.consentData) : null
          };
        }
      }

      return {
        exportMetadata: {
          exportDate: new Date().toISOString(),
          exportFormat: requestData.exportFormat,
          dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
          privacyNotice: 'This export contains your personal data. Please store it securely.'
        },
        userData
      };
    } catch (error) {
      logger.error('Error generating data export:', error);
      return null;
    }
  }

  /**
   * Get date range for filtering
   */
  private static getDateRange(dateRange: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    const endDate: Date = now;

    switch (dateRange) {
      case 'last-month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last-year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 'all'
        startDate = new Date(0);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Convert data to CSV format
   */
  static convertToCSV(data: any): string {
    if (!data.userData.tripHistory || data.userData.tripHistory.length === 0) {
      return 'No trip data available';
    }

    const trips = data.userData.tripHistory;
    const headers = 'Date,Start Time,End Time,Distance (m),Mode,Purpose,Companions,Validated\n';
    
    const rows = trips.map((trip: any) => {
      const startDate = new Date(trip.startTime).toLocaleDateString();
      const startTime = new Date(trip.startTime).toLocaleTimeString();
      const endTime = trip.endTime ? new Date(trip.endTime).toLocaleTimeString() : 'N/A';
      
      return `${startDate},${startTime},${endTime},${trip.distance || 0},${trip.mode || ''},${trip.purpose || ''},${trip.companions || 0},${trip.validated}`;
    }).join('\n');

    return headers + rows;
  }
}