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
      // Implementation would depend on WebSocket service (Socket.IO, etc.)
      // For now, we'll log the attempt
      
      logger.info(`WebSocket notification sent to user ${userId}: ${notification.title}`);
      
      // Actual implementation would use Socket.IO:
      /*
      const socketService = getSocketService();
      socketService.sendToUser(userId, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        createdAt: notification.createdAt
      });
      */
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