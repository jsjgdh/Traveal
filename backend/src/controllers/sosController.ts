import { Request, Response } from 'express';
import { SOSService } from '../services/sosService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * SOS Controller for handling safety and emergency features
 */
export class SOSController {
  /**
   * Create or update SOS profile
   * POST /api/v1/sos/profile
   */
  static createOrUpdateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const {
      fullPassword,
      partialPassword,
      biometricEnabled,
      emergencyContacts,
      isEnabled,
      voiceLanguage,
      backgroundPermissions
    } = req.body;

    // Validate required fields
    if (!fullPassword || !partialPassword) {
      return sendError(res, 'Full password and partial password are required', 400);
    }

    if (!emergencyContacts || !Array.isArray(emergencyContacts)) {
      return sendError(res, 'Emergency contacts must be provided as an array', 400);
    }

    try {
      const sosProfile = await SOSService.createOrUpdateSOSProfile({
        userId,
        fullPassword,
        partialPassword,
        biometricEnabled: biometricEnabled || false,
        emergencyContacts,
        isEnabled: isEnabled !== undefined ? isEnabled : true,
        voiceLanguage: voiceLanguage || 'en',
        backgroundPermissions: backgroundPermissions || false
      });

      if (!sosProfile) {
        return sendError(res, 'Failed to create/update SOS profile', 500);
      }

      return sendSuccess(res, sosProfile, 'SOS profile updated successfully');
    } catch (error) {
      logger.error('Error in createOrUpdateProfile:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Get SOS profile
   * GET /api/v1/sos/profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    try {
      const sosProfile = await SOSService.getSOSProfile(userId);
      
      if (!sosProfile) {
        return sendError(res, 'SOS profile not found', 404);
      }

      return sendSuccess(res, sosProfile, 'SOS profile retrieved successfully');
    } catch (error) {
      logger.error('Error in getProfile:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Start route monitoring
   * POST /api/v1/sos/monitoring/start
   */
  static startRouteMonitoring = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const {
      sosProfileId,
      tripId,
      plannedRoute,
      destination,
      deviationThreshold,
      estimatedArrival
    } = req.body;

    // Validate required fields
    if (!sosProfileId || !plannedRoute || !destination) {
      return sendError(res, 'SOS profile ID, planned route, and destination are required', 400);
    }

    if (!Array.isArray(plannedRoute) || plannedRoute.length === 0) {
      return sendError(res, 'Planned route must be a non-empty array of coordinates', 400);
    }

    try {
      const monitoring = await SOSService.startRouteMonitoring({
        userId,
        sosProfileId,
        tripId: tripId || null,
        plannedRoute,
        currentRoute: [],
        deviationThreshold: deviationThreshold || 500, // 500 meters default
        isActive: true,
        startTime: new Date(),
        destination,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : undefined,
        lastKnownLocation: {
          latitude: plannedRoute[0].latitude,
          longitude: plannedRoute[0].longitude,
          timestamp: new Date()
        },
        deviationDetected: false
      });

      if (!monitoring) {
        return sendError(res, 'Failed to start route monitoring', 500);
      }

      return sendSuccess(res, monitoring, 'Route monitoring started successfully');
    } catch (error) {
      logger.error('Error in startRouteMonitoring:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Update location and check deviation
   * POST /api/v1/sos/monitoring/:monitoringId/location
   */
  static updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const { monitoringId } = req.params;
    const { latitude, longitude, accuracy, speed, altitude } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    try {
      const currentLocation = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : undefined,
        speed: speed ? parseFloat(speed) : undefined,
        altitude: altitude ? parseFloat(altitude) : undefined,
        timestamp: new Date()
      };

      const deviationCheck = await SOSService.updateLocationAndCheckDeviation(
        monitoringId,
        currentLocation
      );

      if (!deviationCheck) {
        return sendError(res, 'Monitoring session not found or inactive', 404);
      }

      return sendSuccess(res, deviationCheck, 'Location updated successfully');
    } catch (error) {
      logger.error('Error in updateLocation:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Manually trigger SOS alert
   * POST /api/v1/sos/alert/trigger
   */
  static triggerAlert = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const {
      sosProfileId,
      routeMonitoringId,
      alertType,
      currentLocation,
      isStealthMode
    } = req.body;

    // Validate required fields
    if (!sosProfileId || !alertType || !currentLocation) {
      return sendError(res, 'SOS profile ID, alert type, and current location are required', 400);
    }

    try {
      const alert = await SOSService.triggerSOSAlert({
        userId,
        sosProfileId,
        routeMonitoringId: routeMonitoringId || null,
        alertType: alertType || 'manual_trigger',
        severity: 'high',
        status: 'triggered',
        triggerLocation: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: new Date()
        },
        voiceAlertPlayed: false,
        passwordAttempts: 0,
        maxPasswordAttempts: 3,
        isStealthMode: isStealthMode || false,
        authoritiesNotified: false,
        contactsNotified: false
      });

      if (!alert) {
        return sendError(res, 'Failed to trigger SOS alert', 500);
      }

      return sendSuccess(res, alert, 'SOS alert triggered successfully');
    } catch (error) {
      logger.error('Error in triggerAlert:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Verify SOS password
   * POST /api/v1/sos/alert/:alertId/verify
   */
  static verifyPassword = asyncHandler(async (req: Request, res: Response) => {
    const { alertId } = req.params;
    const { password, isPartialPassword } = req.body;

    // Validate required fields
    if (!password) {
      return sendError(res, 'Password is required', 400);
    }

    try {
      const result = await SOSService.verifySOSPassword(
        alertId,
        password,
        isPartialPassword || false
      );

      return sendSuccess(res, result, 'Password verification completed');
    } catch (error) {
      logger.error('Error in verifyPassword:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Get active SOS alerts
   * GET /api/v1/sos/alerts/active
   */
  static getActiveAlerts = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    try {
      const alerts = await SOSService.getActiveSOSAlerts(userId);
      return sendSuccess(res, alerts, 'Active alerts retrieved successfully');
    } catch (error) {
      logger.error('Error in getActiveAlerts:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * End route monitoring
   * POST /api/v1/sos/monitoring/:monitoringId/end
   */
  static endRouteMonitoring = asyncHandler(async (req: Request, res: Response) => {
    const { monitoringId } = req.params;

    try {
      const success = await SOSService.endRouteMonitoring(monitoringId);
      
      if (!success) {
        return sendError(res, 'Failed to end route monitoring', 500);
      }

      return sendSuccess(res, { ended: true }, 'Route monitoring ended successfully');
    } catch (error) {
      logger.error('Error in endRouteMonitoring:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Test voice alert system
   * POST /api/v1/sos/test/voice
   */
  static testVoiceAlert = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { language, localArea } = req.body;

    try {
      // Generate test voice message
      const voiceMessage = {
        primaryMessage: `This is the police of ${localArea || 'your area'}. We are checking on you to confirm if you are fine.`,
        secondaryMessage: 'You have 1 minute to enter your password to confirm you are safe, or the police will arrive at your destination.',
        language: language || 'en',
        isTest: true
      };

      return sendSuccess(res, voiceMessage, 'Test voice alert generated successfully');
    } catch (error) {
      logger.error('Error in testVoiceAlert:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Add emergency contact
   * POST /api/v1/sos/contacts
   */
  static addEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { name, phoneNumber, email, relationship, priority } = req.body;

    // Validate required fields
    if (!name || !phoneNumber || !relationship) {
      return sendError(res, 'Name, phone number, and relationship are required', 400);
    }

    try {
      // Get current SOS profile
      const sosProfile = await SOSService.getSOSProfile(userId);
      if (!sosProfile) {
        return sendError(res, 'SOS profile not found. Please create one first.', 404);
      }

      const newContact = {
        id: Date.now().toString(),
        name,
        phoneNumber,
        email: email || null,
        relationship,
        priority: priority || 1,
        isActive: true
      };

      const updatedContacts = [...sosProfile.emergencyContacts, newContact];

      // Update SOS profile with new contact
      const updatedProfile = await SOSService.createOrUpdateSOSProfile({
        userId,
        fullPassword: 'unchanged', // Placeholder - won't be used in update
        partialPassword: 'unchanged', // Placeholder - won't be used in update
        biometricEnabled: sosProfile.biometricEnabled,
        emergencyContacts: updatedContacts,
        isEnabled: sosProfile.isEnabled,
        voiceLanguage: sosProfile.voiceLanguage,
        backgroundPermissions: sosProfile.backgroundPermissions
      });

      return sendSuccess(res, newContact, 'Emergency contact added successfully');
    } catch (error) {
      logger.error('Error in addEmergencyContact:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });

  /**
   * Update SOS settings
   * PUT /api/v1/sos/settings
   */
  static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const {
      isEnabled,
      biometricEnabled,
      voiceLanguage,
      backgroundPermissions,
      deviationThreshold
    } = req.body;

    try {
      // Get current SOS profile
      const sosProfile = await SOSService.getSOSProfile(userId);
      if (!sosProfile) {
        return sendError(res, 'SOS profile not found. Please create one first.', 404);
      }

      // Update only provided settings
      const updatedProfile = await SOSService.createOrUpdateSOSProfile({
        userId,
        fullPassword: 'unchanged', // Placeholder
        partialPassword: 'unchanged', // Placeholder
        biometricEnabled: biometricEnabled !== undefined ? biometricEnabled : sosProfile.biometricEnabled,
        emergencyContacts: sosProfile.emergencyContacts,
        isEnabled: isEnabled !== undefined ? isEnabled : sosProfile.isEnabled,
        voiceLanguage: voiceLanguage || sosProfile.voiceLanguage,
        backgroundPermissions: backgroundPermissions !== undefined ? backgroundPermissions : sosProfile.backgroundPermissions
      });

      return sendSuccess(res, updatedProfile, 'SOS settings updated successfully');
    } catch (error) {
      logger.error('Error in updateSettings:', error);
      return sendError(res, 'Internal server error', 500);
    }
  });
}