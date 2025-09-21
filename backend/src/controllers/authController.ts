import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { DataExportService } from '../services/dataExportService';
import { sendSuccess, sendError, asyncHandler } from '../utils/helpers';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Register a new anonymous user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { consentData } = req.body;
    const deviceId = req.headers['x-device-id'] as string;

    // Check if user already exists with this device ID
    const existingUser = await AuthService.getUserByDeviceId(deviceId);
    
    if (existingUser) {
      return sendError(res, 'Device already registered', 409);
    }

    // Create new user
    const result = await AuthService.registerUser(deviceId, consentData);
    
    if (!result) {
      return sendError(res, 'Failed to register user', 500);
    }

    logger.info(`New user registered with device ID: ${deviceId}`);

    return sendSuccess(res, {
      user: result.user,
      tokens: result.tokens
    }, 'User registered successfully', 201);
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    return sendSuccess(res, {
      user
    }, 'Profile retrieved successfully');
  });

  /**
   * Update user consent
   * PUT /api/v1/auth/consent
   */
  static updateConsent = asyncHandler(async (req: Request, res: Response) => {
    const { consentData } = req.body;
    const userId = req.user!.id;

    const success = await AuthService.updateConsent(userId, consentData);
    
    if (!success) {
      return sendError(res, 'Failed to update consent', 500);
    }

    // Get updated user data
    const updatedUser = await AuthService.getUserByUuid(req.user!.uuid);

    logger.info(`Consent updated for user: ${userId}`);

    return sendSuccess(res, {
      user: updatedUser
    }, 'Consent updated successfully');
  });

  /**
   * Update user preferences
   * PUT /api/v1/auth/preferences
   */
  static updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    const { preferences } = req.body;
    const userId = req.user!.id;

    const success = await AuthService.updatePreferences(userId, preferences);
    
    if (!success) {
      return sendError(res, 'Failed to update preferences', 500);
    }

    // Get updated user data
    const updatedUser = await AuthService.getUserByUuid(req.user!.uuid);

    logger.info(`Preferences updated for user: ${userId}`);

    return sendSuccess(res, {
      user: updatedUser
    }, 'Preferences updated successfully');
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token required', 400);
    }

    const tokens = await AuthService.refreshAccessToken(refreshToken);
    
    if (!tokens) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    logger.info('Access token refreshed');

    return sendSuccess(res, {
      tokens
    }, 'Token refreshed successfully');
  });

  /**
   * Login with device ID (for existing users)
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const deviceId = req.headers['x-device-id'] as string;

    // Get user by device ID
    const user = await AuthService.getUserByDeviceId(deviceId);
    
    if (!user) {
      return sendError(res, 'Device not registered', 404);
    }

    // Generate new tokens
    const tokens = AuthService.generateTokens(user.id);

    logger.info(`User logged in with device ID: ${deviceId}`);

    return sendSuccess(res, {
      user,
      tokens
    }, 'Login successful');
  });

  /**
   * Delete user account (GDPR compliance)
   * DELETE /api/v1/auth/account
   */
  static deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const uuid = req.user!.uuid;

    const success = await AuthService.deleteUser(userId);
    
    if (!success) {
      return sendError(res, 'Failed to delete account', 500);
    }

    logger.info(`User account deleted: ${uuid}`);

    return sendSuccess(res, null, 'Account deleted successfully');
  });

  /**
   * Check authentication status
   * GET /api/v1/auth/status
   */
  static checkStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    return sendSuccess(res, {
      authenticated: !!user,
      user: user || null
    }, 'Status retrieved successfully');
  });

  /**
   * Request data export
   * POST /api/v1/auth/export-data
   */
  static requestDataExport = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { 
      selectedDataTypes, 
      exportFormat, 
      dateRange, 
      customDateStart, 
      customDateEnd,
      deliveryMethod 
    } = req.body;

    const exportRequest = await DataExportService.createExportRequest(userId, {
      selectedDataTypes,
      exportFormat,
      dateRange,
      customDateStart,
      customDateEnd,
      deliveryMethod
    });

    if (!exportRequest) {
      return sendError(res, 'Failed to create export request', 500);
    }

    logger.info(`Data export requested by user: ${userId}`);

    return sendSuccess(res, {
      exportRequest
    }, 'Data export request created successfully', 201);
  });

  /**
   * Get user's export requests
   * GET /api/v1/auth/export-requests
   */
  static getExportRequests = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const requests = await DataExportService.getUserExportRequests(userId);

    return sendSuccess(res, {
      requests
    }, 'Export requests retrieved successfully');
  });

  /**
   * Download exported data
   * GET /api/v1/auth/export/:requestId/download
   */
  static downloadExportedData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { requestId } = req.params;

    const exportData = await DataExportService.getExportedData(userId, requestId);

    if (!exportData) {
      return sendError(res, 'Export not found or not ready', 404);
    }

    // Set appropriate headers for download
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
    
    logger.info(`Data export downloaded by user: ${userId}, request: ${requestId}`);

    return res.send(exportData.data);
  });

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { profileData } = req.body;

    const success = await AuthService.updateProfile(userId, profileData);
    
    if (!success) {
      return sendError(res, 'Failed to update profile', 500);
    }

    // Get updated user data
    const updatedUser = await AuthService.getUserByUuid(req.user!.uuid);

    logger.info(`Profile updated for user: ${userId}`);

    return sendSuccess(res, {
      user: updatedUser
    }, 'Profile updated successfully');
  });
}