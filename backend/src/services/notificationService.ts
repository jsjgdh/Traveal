import { config } from '../config/environment.js';
import { NotificationData } from '../types/index.js';
import logger from '../utils/logger.js';
import { EncryptionService } from './encryptionService.js';

// Mock database connection - replace with actual implementation
interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export class NotificationService {
  private static notifications: Map<string, Notification[]> = new Map();

  /**
   * Send notification to user
   */
  static async sendNotification(
    userId: string,
    notificationData: NotificationData,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string | null> {
    try {
      const notificationId = EncryptionService.generateAPIKey();
      
      const notification: Notification = {
        id: notificationId,
        userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data ? EncryptionService.encrypt(notificationData.data) : undefined,
        read: false,
        priority,
        createdAt: new Date(),
        expiresAt: this.calculateExpiryDate(notificationData.type)
      };

      // Store notification
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      this.notifications.get(userId)!.push(notification);

      // Send push notification if enabled
      await this.sendPushNotification(userId, notification);

      // Send real-time notification via WebSocket
      await this.sendWebSocketNotification(userId, notification);

      logger.info(`Notification sent: ${notificationId} to user ${userId}`);
      return notificationId;
    } catch (error) {
      logger.error('Error sending notification:', error);
      return null;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ notifications: any[]; total: number; unread: number } | null> {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      
      // Filter expired notifications
      const validNotifications = userNotifications.filter(n => 
        !n.expiresAt || n.expiresAt > new Date()
      );

      // Apply unread filter
      const filteredNotifications = unreadOnly 
        ? validNotifications.filter(n => !n.read)
        : validNotifications;

      // Sort by creation date (newest first)
      filteredNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Pagination
      const offset = (page - 1) * limit;
      const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);

      // Format notifications for response
      const formattedNotifications = paginatedNotifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data ? EncryptionService.decrypt(n.data) : undefined,
        read: n.read,
        priority: n.priority,
        createdAt: n.createdAt,
        readAt: n.readAt
      }));

      const unreadCount = validNotifications.filter(n => !n.read).length;

      return {
        notifications: formattedNotifications,
        total: filteredNotifications.length,
        unread: unreadCount
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      return null;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const notification = userNotifications.find(n => n.id === notificationId);

      if (!notification) return false;

      notification.read = true;
      notification.readAt = new Date();

      logger.info(`Notification marked as read: ${notificationId}`);
      return true;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const now = new Date();

      userNotifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
          notification.readAt = now;
        }
      });

      logger.info(`All notifications marked as read for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const index = userNotifications.findIndex(n => n.id === notificationId);

      if (index === -1) return false;

      userNotifications.splice(index, 1);

      logger.info(`Notification deleted: ${notificationId}`);
      return true;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Clear all notifications for user
   */
  static async clearAllNotifications(userId: string): Promise<boolean> {
    try {
      this.notifications.set(userId, []);
      logger.info(`All notifications cleared for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Error clearing notifications:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(
    userId: string,
    notification: Notification
  ): Promise<void> {
    try {
      // Implementation would depend on push notification service (FCM, APNs, etc.)
      // For now, we'll log the attempt
      
      if (!config.FCM_SERVER_KEY) {
        logger.debug('Push notifications not configured');
        return;
      }

      // Mock push notification sending
      logger.info(`Push notification sent to user ${userId}: ${notification.title}`);
      
      // Get user's FCM token from user preferences/database
      const userPushToken = await this.getUserPushToken(userId);
      if (!userPushToken) {
        logger.debug(`No push token found for user ${userId}`);
        return;
      }

      // Create FCM message
      const message = {
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          priority: notification.priority,
          ...(notification.data ? { customData: JSON.stringify(notification.data) } : {})
        },
        token: userPushToken,
        android: {
          priority: this.mapPriorityToAndroid(notification.priority),
          notification: {
            channel_id: this.getChannelId(notification.type),
            sound: notification.priority === 'urgent' ? 'emergency_alert' : 'default'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.message
              },
              sound: notification.priority === 'urgent' ? 'emergency.caf' : 'default',
              'content-available': 1
            }
          }
        }
      };

      // Send via Firebase Admin SDK (mock implementation)
      const result = await this.sendViaFirebase(message);
      
      if (result.success) {
        logger.info(`Push notification sent successfully to user ${userId}`);
      } else {
        logger.error(`Failed to send push notification to user ${userId}:`, result.error);
      }
      
      // Actual implementation would use Firebase Cloud Messaging:
      /*
      const message = {
        notification: {
          title: notification.title,
          body: notification.message
        },
        data: notification.data ? JSON.stringify(notification.data) : undefined,
        token: userPushToken // Get from user preferences
      };
      
      await admin.messaging().send(message);
      */
    } catch (error) {
      logger.error('Error sending push notification:', error);
    }
  }

  /**
   * Send real-time notification via WebSocket
   */
  private static async sendWebSocketNotification(
    userId: string,
    notification: Notification
  ): Promise<void> {
    try {
      logger.info(`WebSocket notification sent to user ${userId}: ${notification.title}`);
      
      // Get WebSocket connection for user
      const socket = await this.getUserWebSocket(userId);
      if (!socket) {
        logger.debug(`No WebSocket connection found for user ${userId}`);
        return;
      }

      // Send real-time notification
      const notificationData = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        createdAt: notification.createdAt,
        read: notification.read
      };

      socket.emit('notification', notificationData);
      
      // For emergency notifications, also trigger browser alert
      if (notification.priority === 'urgent') {
        socket.emit('emergency_alert', {
          ...notificationData,
          requiresAction: true,
          timeout: 30000 // 30 seconds
        });
      }

      logger.info(`WebSocket notification delivered to user ${userId}`);
      
    } catch (error) {
      logger.error('Error sending WebSocket notification:', error);
    }
  }

  /**
   * Calculate notification expiry date based on type
   */
  private static calculateExpiryDate(type: string): Date | undefined {
    const now = new Date();
    
    switch (type) {
      case 'trip_validation':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'achievement':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case 'system':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'challenge':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }
  }

  /**
   * Send trip validation notification
   */
  static async sendTripValidationNotification(
    userId: string,
    tripId: string,
    tripDetails: any
  ): Promise<string | null> {
    return this.sendNotification(userId, {
      type: 'trip_validation',
      title: 'Trip Validation Required',
      message: 'Please confirm the details of your recent trip',
      data: {
        tripId,
        startLocation: tripDetails.startLocation,
        endLocation: tripDetails.endLocation,
        distance: tripDetails.distance,
        duration: tripDetails.duration
      },
      userId
    }, 'high');
  }

  /**
   * Send achievement notification
   */
  static async sendAchievementNotification(
    userId: string,
    achievementType: string,
    achievementData: any
  ): Promise<string | null> {
    const achievements: Record<string, string> = {
      'first_trip': 'Congratulations on your first trip!',
      'distance_milestone': `You've traveled ${achievementData.distance}km in total!`,
      'eco_warrior': 'Eco Warrior achievement unlocked!',
      'commuter_champion': 'Commuter Champion badge earned!',
      'explorer': 'Explorer achievement unlocked!'
    };

    return this.sendNotification(userId, {
      type: 'achievement',
      title: 'Achievement Unlocked! 🏆',
      message: achievements[achievementType] || 'New achievement unlocked!',
      data: {
        achievementType,
        ...achievementData
      },
      userId
    }, 'medium');
  }

  /**
   * Send system notification
   */
  static async sendSystemNotification(
    userId: string,
    systemMessage: string,
    urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<string | null> {
    return this.sendNotification(userId, {
      type: 'system',
      title: 'System Update',
      message: systemMessage,
      userId
    }, urgency);
  }

  /**
   * Send challenge notification
   */
  static async sendChallengeNotification(
    userId: string,
    challengeType: string,
    challengeData: any
  ): Promise<string | null> {
    return this.sendNotification(userId, {
      type: 'challenge',
      title: 'New Challenge Available! 🎯',
      message: challengeData.description || 'A new challenge is waiting for you',
      data: {
        challengeType,
        ...challengeData
      },
      userId
    }, 'medium');
  }

  /**
   * Send trip invitation notification
   */
  static async sendTripInvitation(
    email: string,
    tripPlanId: string,
    invitedByUserId: string
  ): Promise<string | null> {
    try {
      // In production, this would send an email invitation
      // For now, we'll create a notification for the inviting user
      logger.info(`Trip invitation sent to ${email} for trip ${tripPlanId} by user ${invitedByUserId}`);
      
      return this.sendNotification(invitedByUserId, {
        type: 'system',
        title: 'Trip Invitation Sent',
        message: `Invitation sent to ${email} for your trip plan`,
        data: {
          tripPlanId,
          invitedEmail: email,
          action: 'trip_invitation_sent'
        },
        userId: invitedByUserId
      }, 'low');
    } catch (error) {
      logger.error('Error sending trip invitation:', error);
      return null;
    }
  }

  /**
   * Cleanup expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      this.notifications.forEach((userNotifications, userId) => {
        const validNotifications = userNotifications.filter(n => 
          !n.expiresAt || n.expiresAt > now
        );
        
        const removedCount = userNotifications.length - validNotifications.length;
        cleanedCount += removedCount;

        this.notifications.set(userId, validNotifications);
      });

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired notifications`);
      }
    } catch (error) {
      logger.error('Error cleaning up expired notifications:', error);
    }
  }

  /**
   * Get user's FCM push token (mock implementation)
   */
  private static async getUserPushToken(userId: string): Promise<string | null> {
    // In production, this would query the user's stored FCM token
    // For now, return a mock token for testing
    return `fcm_token_${userId}_${Date.now()}`;
  }

  /**
   * Map notification priority to Android priority
   */
  private static mapPriorityToAndroid(priority: string): string {
    const priorityMap = {
      'urgent': 'high',
      'high': 'high',
      'medium': 'normal',
      'low': 'normal'
    };
    return priorityMap[priority as keyof typeof priorityMap] || 'normal';
  }

  /**
   * Get notification channel ID for Android
   */
  private static getChannelId(type: string): string {
    const channelMap = {
      'trip_validation': 'trip_alerts',
      'achievement': 'achievements',
      'system': 'system_notifications',
      'challenge': 'challenges',
      'emergency': 'emergency_alerts',
      'sos': 'emergency_alerts'
    };
    return channelMap[type as keyof typeof channelMap] || 'default';
  }

  /**
   * Send notification via Firebase (mock implementation)
   */
  private static async sendViaFirebase(message: any): Promise<{ success: boolean; error?: any }> {
    try {
      // In production, this would use Firebase Admin SDK:
      // const admin = require('firebase-admin');
      // const result = await admin.messaging().send(message);
      // return { success: true, messageId: result };
      
      // Mock implementation for development/testing
      logger.info('Mock Firebase push notification:', {
        to: message.token,
        title: message.notification.title,
        body: message.notification.body
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get user's WebSocket connection (mock implementation)
   */
  private static async getUserWebSocket(userId: string): Promise<any | null> {
    // In production, this would get the user's active WebSocket connection
    // from a connection manager or Socket.IO namespace
    // For now, return a mock socket for testing
    
    logger.debug(`Getting WebSocket connection for user ${userId}`);
    
    // Mock socket implementation
    return {
      emit: (event: string, data: any) => {
        logger.info(`Mock WebSocket emit - Event: ${event}, User: ${userId}`, data);
      },
      connected: true,
      userId
    };
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(userId: string): Promise<any> {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const now = new Date();
      
      const validNotifications = userNotifications.filter(n => 
        !n.expiresAt || n.expiresAt > now
      );

      const stats = {
        total: validNotifications.length,
        unread: validNotifications.filter(n => !n.read).length,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        recent: validNotifications.filter(n => 
          (now.getTime() - n.createdAt.getTime()) < 24 * 60 * 60 * 1000
        ).length
      };

      // Count by type
      validNotifications.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      return null;
    }
  }
}