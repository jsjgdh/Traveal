import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { sendSuccess, sendError, asyncHandler } from '@/utils/helpers';
import logger from '@/utils/logger';

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
}