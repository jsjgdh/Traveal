import { prisma } from '../config/database.js';
import { config } from '../config/environment.js';
import { 
  SOSProfileData, 
  SOSAlertData, 
  RouteMonitoringData, 
  LocationPoint,
  RouteDeviationCheck,
  EmergencyContact
} from '../types/index.js';
import { calculateDistance } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import { EncryptionService } from './encryptionService.js';

export class SOSService {
  /**
   * Create or update SOS profile for user
   */
  static async createOrUpdateSOSProfile(profileData: SOSProfileData): Promise<any | null> {
    try {
      // Hash passwords for secure storage
      const fullPasswordHash = await EncryptionService.hashPassword(profileData.fullPassword);
      const partialPasswordHash = await EncryptionService.hashPassword(profileData.partialPassword);

      const sosProfile = await (prisma as any).sOSProfile.upsert({
        where: {
          userId: profileData.userId
        },
        update: {
          fullPassword: JSON.stringify(fullPasswordHash),
          partialPassword: JSON.stringify(partialPasswordHash),
          biometricEnabled: profileData.biometricEnabled,
          emergencyContacts: JSON.stringify(profileData.emergencyContacts),
          isEnabled: profileData.isEnabled,
          voiceLanguage: profileData.voiceLanguage,
          backgroundPermissions: profileData.backgroundPermissions,
          updatedAt: new Date()
        },
        create: {
          userId: profileData.userId,
          fullPassword: JSON.stringify(fullPasswordHash),
          partialPassword: JSON.stringify(partialPasswordHash),
          biometricEnabled: profileData.biometricEnabled,
          emergencyContacts: JSON.stringify(profileData.emergencyContacts),
          isEnabled: profileData.isEnabled,
          voiceLanguage: profileData.voiceLanguage,
          backgroundPermissions: profileData.backgroundPermissions
        }
      });

      logger.info(`SOS profile created/updated for user: ${profileData.userId}`);
      return this.formatSOSProfileData(sosProfile);
    } catch (error) {
      logger.error('Error creating/updating SOS profile:', error);
      return null;
    }
  }

  /**
   * Get SOS profile by user ID
   */
  static async getSOSProfile(userId: string): Promise<any | null> {
    try {
      const sosProfile = await (prisma as any).sOSProfile.findUnique({
        where: { userId },
        include: {
          sosAlerts: {
            where: { status: { not: 'resolved' } },
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!sosProfile) return null;

      return this.formatSOSProfileData(sosProfile);
    } catch (error) {
      logger.error('Error getting SOS profile:', error);
      return null;
    }
  }

  /**
   * Start route monitoring for a trip
   */
  static async startRouteMonitoring(monitoringData: RouteMonitoringData): Promise<any | null> {
    try {
      const routeMonitoring = await (prisma as any).routeMonitoring.create({
        data: {
          userId: monitoringData.userId,
          sosProfileId: monitoringData.sosProfileId,
          tripId: monitoringData.tripId || null,
          plannedRoute: JSON.stringify(monitoringData.plannedRoute),
          currentRoute: JSON.stringify([]),
          deviationThreshold: monitoringData.deviationThreshold,
          isActive: true,
          startTime: monitoringData.startTime,
          destination: JSON.stringify(monitoringData.destination),
          estimatedArrival: monitoringData.estimatedArrival || null,
          lastKnownLocation: JSON.stringify(monitoringData.lastKnownLocation)
        }
      });

      logger.info(`Route monitoring started: ${routeMonitoring.id}`);
      return this.formatRouteMonitoringData(routeMonitoring);
    } catch (error) {
      logger.error('Error starting route monitoring:', error);
      return null;
    }
  }

  /**
   * Update current location and check for route deviation
   */
  static async updateLocationAndCheckDeviation(
    monitoringId: string,
    currentLocation: LocationPoint
  ): Promise<RouteDeviationCheck | null> {
    try {
      const monitoring = await (prisma as any).routeMonitoring.findUnique({
        where: { id: monitoringId },
        include: { sosProfile: true }
      });

      if (!monitoring || !monitoring.isActive) {
        return null;
      }

      const plannedRoute: LocationPoint[] = JSON.parse(monitoring.plannedRoute);
      const currentRoute: LocationPoint[] = JSON.parse(monitoring.currentRoute);
      
      // Add current location to route
      currentRoute.push(currentLocation);

      // Update monitoring record with new location
      await (prisma as any).routeMonitoring.update({
        where: { id: monitoringId },
        data: {
          currentRoute: JSON.stringify(currentRoute),
          lastKnownLocation: JSON.stringify({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: currentLocation.timestamp
          }),
          updatedAt: new Date()
        }
      });

      // Check for route deviation
      const deviationCheck = this.checkRouteDeviation(
        currentLocation,
        plannedRoute,
        monitoring.deviationThreshold
      );

      // If deviation detected, update monitoring and potentially trigger alert
      if (deviationCheck.isDeviated && !monitoring.deviationDetected) {
        await (prisma as any).routeMonitoring.update({
          where: { id: monitoringId },
          data: { deviationDetected: true }
        });

        // Start grace period before triggering alert
        if (deviationCheck.suggestedAction === 'trigger_alert') {
          await this.triggerSOSAlert({
            userId: monitoring.userId,
            sosProfileId: monitoring.sosProfileId,
            routeMonitoringId: monitoringId,
            alertType: 'route_deviation',
            severity: this.calculateAlertSeverity(deviationCheck.deviationDistance || 0),
            status: 'grace_period',
            triggerLocation: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              timestamp: currentLocation.timestamp
            },
            deviationDistance: deviationCheck.deviationDistance,
            gracePeriodEnd: new Date(Date.now() + (2 * 60 * 1000)), // 2 minutes grace period
            voiceAlertPlayed: false,
            passwordAttempts: 0,
            maxPasswordAttempts: 3,
            isStealthMode: false,
            authoritiesNotified: false,
            contactsNotified: false
          });
        }
      }

      return deviationCheck;
    } catch (error) {
      logger.error('Error updating location and checking deviation:', error);
      return null;
    }
  }

  /**
   * Check if current location deviates from planned route
   */
  static checkRouteDeviation(
    currentLocation: LocationPoint,
    plannedRoute: LocationPoint[],
    threshold: number
  ): RouteDeviationCheck {
    if (plannedRoute.length === 0) {
      return {
        currentLocation,
        plannedRoute,
        deviationThreshold: threshold,
        isDeviated: false,
        suggestedAction: 'continue'
      };
    }

    // Find closest point on planned route
    let minDistance = Infinity;
    for (const routePoint of plannedRoute) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        routePoint.latitude,
        routePoint.longitude
      );
      minDistance = Math.min(minDistance, distance);
    }

    const isDeviated = minDistance > threshold;
    
    let suggestedAction: 'continue' | 'grace_period' | 'trigger_alert' = 'continue';
    
    if (isDeviated) {
      if (minDistance > threshold * 2) {
        suggestedAction = 'trigger_alert';
      } else {
        suggestedAction = 'grace_period';
      }
    }

    return {
      currentLocation,
      plannedRoute,
      deviationThreshold: threshold,
      isDeviated,
      deviationDistance: minDistance,
      suggestedAction
    };
  }

  /**
   * Trigger SOS alert
   */
  static async triggerSOSAlert(alertData: SOSAlertData): Promise<any | null> {
    try {
      const sosAlert = await (prisma as any).sOSAlert.create({
        data: {
          userId: alertData.userId,
          sosProfileId: alertData.sosProfileId,
          routeMonitoringId: alertData.routeMonitoringId || null,
          alertType: alertData.alertType,
          severity: alertData.severity,
          status: alertData.status,
          triggerLocation: JSON.stringify(alertData.triggerLocation),
          deviationDistance: alertData.deviationDistance || null,
          gracePeriodEnd: alertData.gracePeriodEnd || null,
          voiceAlertPlayed: alertData.voiceAlertPlayed,
          passwordAttempts: alertData.passwordAttempts,
          maxPasswordAttempts: alertData.maxPasswordAttempts,
          isStealthMode: alertData.isStealthMode,
          authoritiesNotified: alertData.authoritiesNotified,
          contactsNotified: alertData.contactsNotified,
          alertData: alertData.alertData ? JSON.stringify(alertData.alertData) : null
        }
      });

      // Log the alert trigger
      await this.logSOSAction(sosAlert.id, 'alert_triggered', {
        alertType: alertData.alertType,
        severity: alertData.severity,
        location: alertData.triggerLocation
      });

      logger.warn(`SOS alert triggered: ${sosAlert.id} - ${alertData.alertType}`);
      return this.formatSOSAlertData(sosAlert);
    } catch (error) {
      logger.error('Error triggering SOS alert:', error);
      return null;
    }
  }

  /**
   * Verify password for SOS alert
   */
  static async verifySOSPassword(
    alertId: string,
    password: string,
    isPartialPassword: boolean = false
  ): Promise<{ success: boolean; action: 'deactivate' | 'stealth' | 'invalid' }> {
    try {
      const alert = await (prisma as any).sOSAlert.findUnique({
        where: { id: alertId },
        include: { sosProfile: true }
      });

      if (!alert) {
        return { success: false, action: 'invalid' };
      }

      const targetPasswordData = isPartialPassword 
        ? JSON.parse(alert.sosProfile.partialPassword)
        : JSON.parse(alert.sosProfile.fullPassword);

      const isValid = await EncryptionService.verifyPassword(
        password, 
        targetPasswordData.hash, 
        targetPasswordData.salt, 
        targetPasswordData.pepper
      );

      // Update password attempts
      await (prisma as any).sOSAlert.update({
        where: { id: alertId },
        data: {
          passwordAttempts: alert.passwordAttempts + 1,
          updatedAt: new Date()
        }
      });

      if (isValid) {
        const action = isPartialPassword ? 'stealth' : 'deactivate';
        
        await (prisma as any).sOSAlert.update({
          where: { id: alertId },
          data: {
            status: action === 'deactivate' ? 'false_alarm' : 'confirmed',
            isStealthMode: action === 'stealth',
            resolvedAt: action === 'deactivate' ? new Date() : null,
            resolvedBy: 'user',
            updatedAt: new Date()
          }
        });

        await this.logSOSAction(alertId, 'password_verified', {
          isPartialPassword,
          action,
          attempts: alert.passwordAttempts + 1
        });

        return { success: true, action };
      } else {
        await this.logSOSAction(alertId, 'password_failed', {
          attempts: alert.passwordAttempts + 1,
          maxAttempts: alert.maxPasswordAttempts
        });

        // Check if max attempts reached
        if (alert.passwordAttempts + 1 >= alert.maxPasswordAttempts) {
          await this.escalateSOSAlert(alertId);
        }

        return { success: false, action: 'invalid' };
      }
    } catch (error) {
      logger.error('Error verifying SOS password:', error);
      return { success: false, action: 'invalid' };
    }
  }

  /**
   * Escalate SOS alert (max password attempts reached)
   */
  static async escalateSOSAlert(alertId: string): Promise<void> {
    try {
      await (prisma as any).sOSAlert.update({
        where: { id: alertId },
        data: {
          status: 'confirmed',
          severity: 'critical',
          updatedAt: new Date()
        }
      });

      await this.logSOSAction(alertId, 'alert_escalated', {
        reason: 'max_password_attempts_reached'
      });

      // Trigger immediate notification to authorities and contacts
      await this.notifyEmergencyContacts(alertId);
      
      logger.warn(`SOS alert escalated: ${alertId}`);
    } catch (error) {
      logger.error('Error escalating SOS alert:', error);
    }
  }

  /**
   * Notify emergency contacts and authorities
   */
  static async notifyEmergencyContacts(alertId: string): Promise<void> {
    try {
      const alert = await (prisma as any).sOSAlert.findUnique({
        where: { id: alertId },
        include: { sosProfile: true }
      });

      if (!alert) return;

      const emergencyContacts: EmergencyContact[] = JSON.parse(alert.sosProfile.emergencyContacts);
      const triggerLocation = JSON.parse(alert.triggerLocation);

      // Sort contacts by priority
      const sortedContacts = emergencyContacts
        .filter(contact => contact.isActive)
        .sort((a, b) => a.priority - b.priority);

      // Notify contacts (implementation would depend on SMS/email service)
      for (const contact of sortedContacts) {
        // TODO: Implement actual notification sending
        logger.info(`Notifying emergency contact: ${contact.name} - ${contact.phoneNumber}`);
      }

      // Update alert status
      await (prisma as any).sOSAlert.update({
        where: { id: alertId },
        data: {
          contactsNotified: true,
          authoritiesNotified: true,
          updatedAt: new Date()
        }
      });

      await this.logSOSAction(alertId, 'contacts_notified', {
        contactCount: sortedContacts.length,
        location: triggerLocation
      });

    } catch (error) {
      logger.error('Error notifying emergency contacts:', error);
    }
  }

  /**
   * End route monitoring
   */
  static async endRouteMonitoring(monitoringId: string): Promise<boolean> {
    try {
      await (prisma as any).routeMonitoring.update({
        where: { id: monitoringId },
        data: {
          isActive: false,
          endTime: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info(`Route monitoring ended: ${monitoringId}`);
      return true;
    } catch (error) {
      logger.error('Error ending route monitoring:', error);
      return false;
    }
  }

  /**
   * Get active SOS alerts for user
   */
  static async getActiveSOSAlerts(userId: string): Promise<any[]> {
    try {
      const alerts = await (prisma as any).sOSAlert.findMany({
        where: {
          userId,
          status: { in: ['triggered', 'grace_period', 'confirmed'] }
        },
        include: {
          sosLogs: {
            orderBy: { timestamp: 'desc' },
            take: 10
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return alerts.map((alert: any) => this.formatSOSAlertData(alert));
    } catch (error) {
      logger.error('Error getting active SOS alerts:', error);
      return [];
    }
  }

  /**
   * Log SOS action
   */
  static async logSOSAction(alertId: string, action: string, details: Record<string, any>): Promise<void> {
    try {
      await (prisma as any).sOSLog.create({
        data: {
          sosAlertId: alertId,
          action,
          details: JSON.stringify(details)
        }
      });
    } catch (error) {
      logger.error('Error logging SOS action:', error);
    }
  }

  /**
   * Calculate alert severity based on deviation distance
   */
  private static calculateAlertSeverity(deviationDistance: number): 'low' | 'medium' | 'high' | 'critical' {
    if (deviationDistance < 1000) return 'low';
    if (deviationDistance < 2000) return 'medium';
    if (deviationDistance < 5000) return 'high';
    return 'critical';
  }

  /**
   * Format SOS profile data for API response
   */
  private static formatSOSProfileData(profile: any): any {
    return {
      id: profile.id,
      userId: profile.userId,
      isEnabled: profile.isEnabled,
      biometricEnabled: profile.biometricEnabled,
      voiceLanguage: profile.voiceLanguage,
      backgroundPermissions: profile.backgroundPermissions,
      emergencyContacts: JSON.parse(profile.emergencyContacts || '[]'),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      activeAlerts: profile.sosAlerts?.length || 0
    };
  }

  /**
   * Format route monitoring data for API response
   */
  private static formatRouteMonitoringData(monitoring: any): any {
    return {
      id: monitoring.id,
      userId: monitoring.userId,
      sosProfileId: monitoring.sosProfileId,
      tripId: monitoring.tripId,
      plannedRoute: JSON.parse(monitoring.plannedRoute),
      currentRoute: JSON.parse(monitoring.currentRoute),
      deviationThreshold: monitoring.deviationThreshold,
      isActive: monitoring.isActive,
      startTime: monitoring.startTime,
      endTime: monitoring.endTime,
      destination: JSON.parse(monitoring.destination),
      estimatedArrival: monitoring.estimatedArrival,
      lastKnownLocation: JSON.parse(monitoring.lastKnownLocation),
      deviationDetected: monitoring.deviationDetected,
      createdAt: monitoring.createdAt,
      updatedAt: monitoring.updatedAt
    };
  }

  /**
   * Format SOS alert data for API response
   */
  private static formatSOSAlertData(alert: any): any {
    return {
      id: alert.id,
      userId: alert.userId,
      sosProfileId: alert.sosProfileId,
      routeMonitoringId: alert.routeMonitoringId,
      alertType: alert.alertType,
      severity: alert.severity,
      status: alert.status,
      triggerLocation: JSON.parse(alert.triggerLocation),
      deviationDistance: alert.deviationDistance,
      gracePeriodEnd: alert.gracePeriodEnd,
      voiceAlertPlayed: alert.voiceAlertPlayed,
      passwordAttempts: alert.passwordAttempts,
      maxPasswordAttempts: alert.maxPasswordAttempts,
      isStealthMode: alert.isStealthMode,
      authoritiesNotified: alert.authoritiesNotified,
      contactsNotified: alert.contactsNotified,
      resolvedAt: alert.resolvedAt,
      resolvedBy: alert.resolvedBy,
      alertData: alert.alertData ? JSON.parse(alert.alertData) : null,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt,
      logs: alert.sosLogs?.map((log: any) => ({
        id: log.id,
        action: log.action,
        details: JSON.parse(log.details),
        timestamp: log.timestamp
      })) || []
    };
  }
}