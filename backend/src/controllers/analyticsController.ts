import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

export class AnalyticsController {
  /**
   * Log analytics event
   * POST /api/v1/analytics/events
   */
  static logEvent = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { eventType, eventData, sessionId, deviceInfo, location } = req.body;

    const eventId = await AnalyticsService.logEvent(
      {
        eventType,
        eventData,
        userId,
        anonymized: true
      },
      sessionId,
      deviceInfo,
      location
    );

    if (!eventId) {
      return sendError(res, 'Failed to log analytics event', 500);
    }

    return sendSuccess(res, { eventId }, 'Analytics event logged successfully');
  });

  /**
   * Start analytics session
   * POST /api/v1/analytics/sessions/start
   */
  static startSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { deviceInfo } = req.body;

    const sessionId = await AnalyticsService.startSession(userId, deviceInfo);

    return sendSuccess(res, { sessionId }, 'Analytics session started successfully');
  });

  /**
   * End analytics session
   * POST /api/v1/analytics/sessions/:sessionId/end
   */
  static endSession = asyncHandler(async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId;

    const success = await AnalyticsService.endSession(sessionId);

    if (!success) {
      return sendError(res, 'Session not found or failed to end session', 404);
    }

    return sendSuccess(res, null, 'Analytics session ended successfully');
  });

  /**
   * Get user analytics summary
   * GET /api/v1/analytics/summary
   */
  static getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const analytics = await AnalyticsService.getUserAnalytics(userId, dateFrom, dateTo);

    if (!analytics) {
      return sendError(res, 'Failed to fetch analytics data', 500);
    }

    return sendSuccess(res, { analytics }, 'User analytics retrieved successfully');
  });

  /**
   * Export user analytics data
   * GET /api/v1/analytics/export
   */
  static exportAnalyticsData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const format = (req.query.format as string) || 'json';
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

    const exportData = await AnalyticsService.exportAnalyticsData(
      format as 'json' | 'csv',
      true, // Always anonymize user exports
      dateFrom,
      dateTo
    );

    if (!exportData) {
      return sendError(res, 'Failed to export analytics data', 500);
    }

    // Set appropriate content type and headers
    const contentType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `analytics_export_${Date.now()}.${format}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.send(exportData);
  });

  /**
   * Get aggregated analytics (admin/research use)
   * GET /api/v1/analytics/aggregated
   */
  static getAggregatedAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
    const anonymizeUsers = req.query.anonymizeUsers !== 'false'; // Default to true

    const analytics = await AnalyticsService.getAggregatedAnalytics(
      dateFrom,
      dateTo,
      anonymizeUsers
    );

    if (!analytics) {
      return sendError(res, 'Failed to fetch aggregated analytics', 500);
    }

    return sendSuccess(res, { analytics }, 'Aggregated analytics retrieved successfully');
  });

  /**
   * Get analytics health metrics
   * GET /api/v1/analytics/health
   */
  static getHealthMetrics = asyncHandler(async (req: Request, res: Response) => {
    const healthMetrics = await AnalyticsService.getHealthMetrics();

    if (!healthMetrics) {
      return sendError(res, 'Failed to fetch health metrics', 500);
    }

    return sendSuccess(res, { health: healthMetrics }, 'Health metrics retrieved successfully');
  });
}