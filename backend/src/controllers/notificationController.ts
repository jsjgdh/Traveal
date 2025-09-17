import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

export class NotificationController {
  /**
   * Get user notifications with pagination
   * GET /api/v1/notifications
   */
  static getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await NotificationService.getUserNotifications(userId, page, limit, unreadOnly);

    if (!result) {
      return sendError(res, 'Failed to fetch notifications', 500);
    }

    return sendSuccess(res, {
      notifications: result.notifications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      },
      unreadCount: result.unread
    }, 'Notifications retrieved successfully');
  });

  /**
   * Get notification statistics
   * GET /api/v1/notifications/stats
   */
  static getNotificationStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await NotificationService.getNotificationStats(userId);

    if (!stats) {
      return sendError(res, 'Failed to fetch notification statistics', 500);
    }

    return sendSuccess(res, { stats }, 'Notification statistics retrieved successfully');
  });

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/:id/read
   */
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const success = await NotificationService.markAsRead(userId, notificationId);

    if (!success) {
      return sendError(res, 'Notification not found', 404);
    }

    // Log analytics event
    await AnalyticsService.trackEngagementEvent(
      'notification_clicked',
      { notificationId },
      userId
    );

    return sendSuccess(res, null, 'Notification marked as read');
  });

  /**
   * Mark all notifications as read
   * PUT /api/v1/notifications/read-all
   */
  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const success = await NotificationService.markAllAsRead(userId);

    if (!success) {
      return sendError(res, 'Failed to mark notifications as read', 500);
    }

    // Log analytics event
    await AnalyticsService.trackEngagementEvent(
      'feature_used',
      { feature: 'notifications_clear_all' },
      userId
    );

    return sendSuccess(res, null, 'All notifications marked as read');
  });

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:id
   */
  static deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const success = await NotificationService.deleteNotification(userId, notificationId);

    if (!success) {
      return sendError(res, 'Notification not found', 404);
    }

    return sendSuccess(res, null, 'Notification deleted successfully');
  });

  /**
   * Clear all notifications
   * DELETE /api/v1/notifications/clear-all
   */
  static clearAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const success = await NotificationService.clearAllNotifications(userId);

    if (!success) {
      return sendError(res, 'Failed to clear notifications', 500);
    }

    return sendSuccess(res, null, 'All notifications cleared successfully');
  });

  /**
   * Send notification (admin/system use)
   * POST /api/v1/notifications/send
   */
  static sendNotification = asyncHandler(async (req: Request, res: Response) => {
    const { userId, type, title, message, data, priority } = req.body;

    const notificationId = await NotificationService.sendNotification(
      userId,
      { type, title, message, data, userId },
      priority
    );

    if (!notificationId) {
      return sendError(res, 'Failed to send notification', 500);
    }

    logger.info(`Notification sent: ${notificationId} to user ${userId}`);

    return sendSuccess(res, { notificationId }, 'Notification sent successfully');
  });
}