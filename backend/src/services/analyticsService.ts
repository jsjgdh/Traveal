import { config } from '../config/environment.js';
import { AnalyticsEventData } from '../types/index.js';
import logger from '../utils/logger.js';
import { EncryptionService } from './encryptionService.js';

// Mock database connection - replace with actual implementation
interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  deviceInfo?: Record<string, any>;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  anonymized: boolean;
}

interface AnalyticsSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  eventCount: number;
  deviceInfo: Record<string, any>;
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static sessions: Map<string, AnalyticsSession> = new Map();

  /**
   * Log analytics event
   */
  static async logEvent(
    eventData: AnalyticsEventData,
    sessionId?: string,
    deviceInfo?: Record<string, any>,
    location?: { latitude: number; longitude: number; accuracy?: number }
  ): Promise<string | null> {
    try {
      const eventId = EncryptionService.generateAPIKey();
      
      // Anonymize sensitive data
      const processedEventData = eventData.anonymized 
        ? this.anonymizeEventData(eventData.eventData)
        : eventData.eventData;

      const event: AnalyticsEvent = {
        id: eventId,
        userId: eventData.userId,
        eventType: eventData.eventType,
        eventData: processedEventData,
        timestamp: new Date(),
        sessionId,
        deviceInfo: deviceInfo ? this.anonymizeDeviceInfo(deviceInfo) : undefined,
        location: location ? this.anonymizeLocation(location) : undefined,
        anonymized: eventData.anonymized || false
      };

      this.events.push(event);

      // Update session if provided
      if (sessionId) {
        this.updateSession(sessionId, eventData.userId, deviceInfo);
      }

      logger.info(`Analytics event logged: ${eventData.eventType}`);
      return eventId;
    } catch (error) {
      logger.error('Error logging analytics event:', error);
      return null;
    }
  }

  /**
   * Start analytics session
   */
  static async startSession(
    userId?: string,
    deviceInfo?: Record<string, any>
  ): Promise<string> {
    try {
      const sessionId = EncryptionService.generateAPIKey();
      
      const session: AnalyticsSession = {
        id: sessionId,
        userId,
        startTime: new Date(),
        eventCount: 0,
        deviceInfo: deviceInfo ? this.anonymizeDeviceInfo(deviceInfo) : {}
      };

      this.sessions.set(sessionId, session);

      logger.info(`Analytics session started: ${sessionId}`);
      return sessionId;
    } catch (error) {
      logger.error('Error starting analytics session:', error);
      return EncryptionService.generateAPIKey(); // Return fallback ID
    }
  }

  /**
   * End analytics session
   */
  static async endSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) return false;

      session.endTime = new Date();
      session.duration = session.endTime.getTime() - session.startTime.getTime();

      logger.info(`Analytics session ended: ${sessionId}, duration: ${session.duration}ms`);
      return true;
    } catch (error) {
      logger.error('Error ending analytics session:', error);
      return false;
    }
  }

  /**
   * Get user analytics summary
   */
  static async getUserAnalytics(
    userId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<any> {
    try {
      const userEvents = this.events.filter(event => {
        if (event.userId !== userId) return false;
        if (dateFrom && event.timestamp < dateFrom) return false;
        if (dateTo && event.timestamp > dateTo) return false;
        return true;
      });

      const eventTypes = userEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const userSessions = Array.from(this.sessions.values())
        .filter(session => session.userId === userId);

      const totalDuration = userSessions
        .filter(session => session.duration)
        .reduce((sum, session) => sum + (session.duration || 0), 0);

      return {
        userId,
        totalEvents: userEvents.length,
        totalSessions: userSessions.length,
        totalDuration,
        averageSessionDuration: userSessions.length > 0 ? totalDuration / userSessions.length : 0,
        eventTypeBreakdown: eventTypes,
        mostRecentEvent: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : null,
        dateRange: {
          from: dateFrom,
          to: dateTo
        }
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      return null;
    }
  }

  /**
   * Get aggregated analytics data
   */
  static async getAggregatedAnalytics(
    dateFrom?: Date,
    dateTo?: Date,
    anonymizeUsers: boolean = true
  ): Promise<any> {
    try {
      const filteredEvents = this.events.filter(event => {
        if (dateFrom && event.timestamp < dateFrom) return false;
        if (dateTo && event.timestamp > dateTo) return false;
        return true;
      });

      // Event type distribution
      const eventTypeDistribution = filteredEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // User activity (anonymized)
      const userActivity = filteredEvents.reduce((acc, event) => {
        if (!event.userId) return acc;
        
        const userKey = anonymizeUsers 
          ? EncryptionService.anonymizeData(event.userId)
          : event.userId;
        
        acc[userKey] = (acc[userKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Temporal patterns
      const hourlyDistribution = filteredEvents.reduce((acc, event) => {
        const hour = event.timestamp.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const dailyDistribution = filteredEvents.reduce((acc, event) => {
        const day = event.timestamp.getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Device info aggregation
      const deviceTypes = filteredEvents
        .filter(event => event.deviceInfo?.type)
        .reduce((acc, event) => {
          const deviceType = event.deviceInfo!.type;
          acc[deviceType] = (acc[deviceType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      // Session statistics
      const allSessions = Array.from(this.sessions.values());
      const validSessions = allSessions.filter(session => session.duration);
      
      const sessionStats = {
        totalSessions: allSessions.length,
        averageDuration: validSessions.length > 0 
          ? validSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / validSessions.length
          : 0,
        averageEventsPerSession: allSessions.length > 0
          ? allSessions.reduce((sum, session) => sum + session.eventCount, 0) / allSessions.length
          : 0
      };

      return {
        summary: {
          totalEvents: filteredEvents.length,
          uniqueUsers: Object.keys(userActivity).length,
          dateRange: { from: dateFrom, to: dateTo }
        },
        eventTypeDistribution,
        userActivity: Object.entries(userActivity)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 20) // Top 20 most active users
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as Record<string, number>),
        temporalPatterns: {
          hourlyDistribution,
          dailyDistribution
        },
        deviceTypes,
        sessionStatistics: sessionStats
      };
    } catch (error) {
      logger.error('Error getting aggregated analytics:', error);
      return null;
    }
  }

  /**
   * Export analytics data for research
   */
  static async exportAnalyticsData(
    format: 'json' | 'csv' = 'json',
    anonymize: boolean = true,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<string | null> {
    try {
      const filteredEvents = this.events.filter(event => {
        if (dateFrom && event.timestamp < dateFrom) return false;
        if (dateTo && event.timestamp > dateTo) return false;
        return true;
      });

      // Prepare export data
      const exportData = filteredEvents.map(event => ({
        id: event.id,
        userId: anonymize && event.userId 
          ? EncryptionService.anonymizeData(event.userId)
          : event.userId,
        eventType: event.eventType,
        eventData: anonymize 
          ? this.anonymizeEventData(event.eventData)
          : event.eventData,
        timestamp: event.timestamp.toISOString(),
        sessionId: event.sessionId,
        deviceType: event.deviceInfo?.type || 'unknown',
        platform: event.deviceInfo?.platform || 'unknown',
        hasLocation: !!event.location,
        anonymized: event.anonymized || anonymize
      }));

      // Generate export based on format
      let exportContent: string;
      
      if (format === 'csv') {
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => 
              JSON.stringify((row as any)[header] || '')
            ).join(',')
          )
        ];
        exportContent = csvRows.join('\n');
      } else {
        exportContent = JSON.stringify({
          exportMetadata: {
            exportDate: new Date().toISOString(),
            totalRecords: exportData.length,
            anonymized: anonymize,
            dateRange: { from: dateFrom, to: dateTo }
          },
          data: exportData
        }, null, 2);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `traveal_analytics_export_${timestamp}.${format}`;
      
      // In a real implementation, you would save to file system or cloud storage
      logger.info(`Analytics data exported: ${filename} (${exportData.length} records)`);
      
      return exportContent;
    } catch (error) {
      logger.error('Error exporting analytics data:', error);
      return null;
    }
  }

  /**
   * Track trip-related events
   */
  static async trackTripEvent(
    eventType: 'trip_started' | 'trip_ended' | 'trip_validated' | 'trip_deleted',
    tripData: any,
    userId?: string
  ): Promise<string | null> {
    return this.logEvent({
      eventType: `trip_${eventType}`,
      eventData: {
        tripId: tripData.id,
        mode: tripData.mode,
        purpose: tripData.purpose,
        distance: tripData.distance,
        duration: tripData.duration,
        validated: tripData.validated
      },
      userId,
      anonymized: true
    });
  }

  /**
   * Track user engagement events
   */
  static async trackEngagementEvent(
    eventType: 'app_opened' | 'feature_used' | 'setting_changed' | 'notification_clicked',
    eventData: Record<string, any>,
    userId?: string,
    sessionId?: string
  ): Promise<string | null> {
    return this.logEvent({
      eventType: `engagement_${eventType}`,
      eventData,
      userId,
      anonymized: false
    }, sessionId);
  }

  /**
   * Track performance metrics
   */
  static async trackPerformanceEvent(
    metricType: 'page_load' | 'api_response' | 'error' | 'crash',
    metricData: Record<string, any>,
    userId?: string
  ): Promise<string | null> {
    return this.logEvent({
      eventType: `performance_${metricType}`,
      eventData: metricData,
      userId,
      anonymized: true
    });
  }

  /**
   * Anonymize event data
   */
  private static anonymizeEventData(eventData: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['email', 'phone', 'name', 'address', 'deviceId'];
    const anonymized = { ...eventData };
    
    for (const field of sensitiveFields) {
      if (anonymized[field]) {
        anonymized[field] = EncryptionService.anonymizeData(String(anonymized[field]));
      }
    }
    
    return anonymized;
  }

  /**
   * Anonymize device information
   */
  private static anonymizeDeviceInfo(deviceInfo: Record<string, any>): Record<string, any> {
    return {
      type: deviceInfo.type || 'unknown',
      platform: deviceInfo.platform || 'unknown',
      version: deviceInfo.version ? 
        deviceInfo.version.split('.')[0] + '.x.x' : // Keep only major version
        'unknown',
      // Remove specific device identifiers
      hasGPS: !!deviceInfo.hasGPS,
      screenSize: deviceInfo.screenSize ? 'anonymized' : undefined
    };
  }

  /**
   * Anonymize location data
   */
  private static anonymizeLocation(location: { latitude: number; longitude: number; accuracy?: number }) {
    // Reduce precision to ~100m accuracy
    return {
      latitude: Math.round(location.latitude * 1000) / 1000,
      longitude: Math.round(location.longitude * 1000) / 1000,
      accuracy: location.accuracy ? Math.max(location.accuracy, 100) : undefined
    };
  }

  /**
   * Update session information
   */
  private static updateSession(
    sessionId: string,
    userId?: string,
    deviceInfo?: Record<string, any>
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.eventCount++;
      if (userId && !session.userId) {
        session.userId = userId;
      }
      if (deviceInfo && Object.keys(session.deviceInfo).length === 0) {
        session.deviceInfo = this.anonymizeDeviceInfo(deviceInfo);
      }
    }
  }

  /**
   * Cleanup old analytics data
   */
  static async cleanupOldData(retentionDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const originalEventCount = this.events.length;
      this.events = this.events.filter(event => event.timestamp >= cutoffDate);
      const cleanedEventCount = originalEventCount - this.events.length;

      // Clean up old sessions
      const originalSessionCount = this.sessions.size;
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.startTime < cutoffDate) {
          this.sessions.delete(sessionId);
        }
      }
      const cleanedSessionCount = originalSessionCount - this.sessions.size;

      if (cleanedEventCount > 0 || cleanedSessionCount > 0) {
        logger.info(`Cleaned up analytics data: ${cleanedEventCount} events, ${cleanedSessionCount} sessions`);
      }
    } catch (error) {
      logger.error('Error cleaning up analytics data:', error);
    }
  }

  /**
   * Get analytics health metrics
   */
  static async getHealthMetrics(): Promise<any> {
    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentEvents = this.events.filter(event => event.timestamp >= last24Hours);
      const weeklyEvents = this.events.filter(event => event.timestamp >= last7Days);

      const activeSessions = Array.from(this.sessions.values())
        .filter(session => !session.endTime);

      return {
        timestamp: now.toISOString(),
        eventCounts: {
          total: this.events.length,
          last24Hours: recentEvents.length,
          last7Days: weeklyEvents.length
        },
        sessionCounts: {
          total: this.sessions.size,
          active: activeSessions.length
        },
        dataHealth: {
          oldestEvent: this.events.length > 0 
            ? Math.min(...this.events.map(e => e.timestamp.getTime()))
            : null,
          newestEvent: this.events.length > 0
            ? Math.max(...this.events.map(e => e.timestamp.getTime()))
            : null,
          anonymizedPercentage: this.events.length > 0
            ? (this.events.filter(e => e.anonymized).length / this.events.length) * 100
            : 0
        }
      };
    } catch (error) {
      logger.error('Error getting analytics health metrics:', error);
      return null;
    }
  }
}