import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { config } from '../config/environment';
import { ConsentData, UserPreferences, AuthTokens } from '../types';
import logger from '../utils/logger';

export class AuthService {
  /**
   * Register a new anonymous user
   */
  static async registerUser(
    deviceId: string,
    consentData: ConsentData
  ): Promise<{ user: any; tokens: AuthTokens } | null> {
    try {
      // Generate anonymous UUID
      const uuid = uuidv4();

      // Create user in database
      const user = await prisma.user.create({
        data: {
          uuid,
          deviceId,
          consentData: JSON.stringify(consentData),
          onboarded: true,
          preferences: JSON.stringify({
            notificationSettings: {
              tripValidation: true,
              achievements: true,
              system: true,
              pushEnabled: false
            },
            privacySettings: {
              dataRetentionDays: 90,
              shareAggregatedData: true
            },
            appSettings: {
              theme: 'system',
              language: 'en',
              units: 'metric'
            }
          } as UserPreferences)
        }
      });

      // Generate tokens
      const tokens = this.generateTokens(user.id);

      logger.info(`New user registered: ${user.uuid}`);

      return {
        user: {
          id: user.id,
          uuid: user.uuid,
          deviceId: user.deviceId,
          onboarded: user.onboarded,
          consentData: JSON.parse(user.consentData),
          preferences: user.preferences ? JSON.parse(user.preferences) : null,
          createdAt: user.createdAt
        },
        tokens
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      return null;
    }
  }

  /**
   * Get user by UUID
   */
  static async getUserByUuid(uuid: string): Promise<any | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { uuid },
        include: {
          _count: {
            select: {
              trips: true,
              notifications: { where: { read: false } }
            }
          }
        }
      });

      if (!user) return null;

      return {
        id: user.id,
        uuid: user.uuid,
        deviceId: user.deviceId,
        onboarded: user.onboarded,
        consentData: JSON.parse(user.consentData),
        preferences: user.preferences ? JSON.parse(user.preferences) : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        stats: {
          totalTrips: user._count.trips,
          unreadNotifications: user._count.notifications
        }
      };
    } catch (error) {
      logger.error('Error getting user by UUID:', error);
      return null;
    }
  }

  /**
   * Get user by device ID
   */
  static async getUserByDeviceId(deviceId: string): Promise<any | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { deviceId }
      });

      if (!user) return null;

      return {
        id: user.id,
        uuid: user.uuid,
        deviceId: user.deviceId,
        onboarded: user.onboarded,
        consentData: JSON.parse(user.consentData),
        preferences: user.preferences ? JSON.parse(user.preferences) : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('Error getting user by device ID:', error);
      return null;
    }
  }

  /**
   * Update user consent data
   */
  static async updateConsent(
    userId: string,
    consentData: ConsentData
  ): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          consentData: JSON.stringify(consentData),
          updatedAt: new Date()
        }
      });

      logger.info(`User consent updated: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error updating user consent:', error);
      return false;
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: JSON.stringify(preferences),
          updatedAt: new Date()
        }
      });

      logger.info(`User preferences updated: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      return false;
    }
  }

  /**
   * Delete user account (GDPR compliance)
   */
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      // This will cascade delete all related data
      await prisma.user.delete({
        where: { id: userId }
      });

      logger.info(`User account deleted: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Generate JWT tokens
   */
  static generateTokens(userId: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      if (decoded.type !== 'access') return null;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
      if (decoded.type !== 'refresh') return null;
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      if (!decoded) return null;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) return null;

      // Generate new tokens
      return this.generateTokens(user.id);
    } catch (error) {
      logger.error('Error refreshing token:', error);
      return null;
    }
  }
}