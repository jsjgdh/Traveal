import { Request, Response } from 'express';
import { TripService } from '../services/tripService.js';
import { NotificationService } from '../services/notificationService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

export class TripController {
  /**
   * Create a new trip
   * POST /api/v1/trips
   */
  static createTrip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { startLocation, mode, purpose, companions } = req.body;

    const tripData = {
      userId,
      startLocation,
      startTime: new Date(),
      mode,
      purpose,
      companions,
      isActive: true
    };

    const trip = await TripService.createTrip(tripData);

    if (!trip) {
      return sendError(res, 'Failed to create trip', 500);
    }

    // Log analytics event
    await AnalyticsService.trackTripEvent('trip_started', trip, userId);

    logger.info(`Trip created: ${trip.id} for user ${userId}`);

    return sendSuccess(res, { trip }, 'Trip created successfully', 201);
  });

  /**
   * Get user trips with pagination and filters
   * GET /api/v1/trips
   */
  static getUserTrips = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters = {
      mode: req.query.mode as string,
      purpose: req.query.purpose as string,
      validated: req.query.validated === 'true' ? true : req.query.validated === 'false' ? false : undefined,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
    };

    const result = await TripService.getUserTrips(userId, page, limit, filters);

    if (!result) {
      return sendError(res, 'Failed to fetch trips', 500);
    }

    return sendSuccess(res, {
      trips: result.trips,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    }, 'Trips retrieved successfully');
  });

  /**
   * Get active trip
   * GET /api/v1/trips/active
   */
  static getActiveTrip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const trip = await TripService.getActiveTrip(userId);

    if (!trip) {
      return sendSuccess(res, { trip: null }, 'No active trip found');
    }

    return sendSuccess(res, { trip }, 'Active trip retrieved successfully');
  });

  /**
   * Get trip statistics
   * GET /api/v1/trips/stats
   */
  static getTripStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const stats = await TripService.getTripStats(userId);

    if (!stats) {
      return sendError(res, 'Failed to fetch trip statistics', 500);
    }

    return sendSuccess(res, { stats }, 'Trip statistics retrieved successfully');
  });

  /**
   * Get specific trip by ID
   * GET /api/v1/trips/:id
   */
  static getTripById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripId = req.params.id;

    const trip = await TripService.getTripById(tripId, userId);

    if (!trip) {
      return sendError(res, 'Trip not found', 404);
    }

    return sendSuccess(res, { trip }, 'Trip retrieved successfully');
  });

  /**
   * Update trip
   * PUT /api/v1/trips/:id
   */
  static updateTrip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripId = req.params.id;
    const updateData = req.body;

    const trip = await TripService.updateTrip(tripId, userId, updateData);

    if (!trip) {
      return sendError(res, 'Trip not found or update failed', 404);
    }

    // Log analytics event
    await AnalyticsService.trackTripEvent('trip_validated', trip, userId);

    logger.info(`Trip updated: ${tripId} by user ${userId}`);

    return sendSuccess(res, { trip }, 'Trip updated successfully');
  });

  /**
   * Delete trip
   * DELETE /api/v1/trips/:id
   */
  static deleteTrip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripId = req.params.id;

    const success = await TripService.deleteTrip(tripId, userId);

    if (!success) {
      return sendError(res, 'Trip not found or deletion failed', 404);
    }

    // Log analytics event
    await AnalyticsService.trackTripEvent('trip_deleted', { id: tripId }, userId);

    logger.info(`Trip deleted: ${tripId} by user ${userId}`);

    return sendSuccess(res, null, 'Trip deleted successfully');
  });

  /**
   * End active trip
   * POST /api/v1/trips/:id/end
   */
  static endTrip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripId = req.params.id;
    const { endLocation } = req.body;

    const trip = await TripService.endTrip(tripId, userId, endLocation, new Date());

    if (!trip) {
      return sendError(res, 'Trip not found or failed to end trip', 404);
    }

    // Send trip validation notification
    await NotificationService.sendTripValidationNotification(userId, tripId, {
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      distance: trip.distance,
      duration: trip.endTime ? new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime() : null
    });

    // Log analytics event
    await AnalyticsService.trackTripEvent('trip_ended', trip, userId);

    logger.info(`Trip ended: ${tripId} by user ${userId}`);

    return sendSuccess(res, { trip }, 'Trip ended successfully');
  });

  /**
   * Add location point to active trip
   * POST /api/v1/trips/:id/locations
   */
  static addLocationPoint = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripId = req.params.id;
    const locationPoint = {
      ...req.body,
      timestamp: new Date()
    };

    const success = await TripService.addLocationPoint(tripId, userId, locationPoint);

    if (!success) {
      return sendError(res, 'Failed to add location point', 400);
    }

    return sendSuccess(res, null, 'Location point added successfully');
  });

  /**
   * Validate trip
   * POST /api/v1/trips/:id/validate
   */
  static validateTrip = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripId = req.params.id;
    const { validated, corrections } = req.body;

    const updateData = {
      validated,
      ...(corrections && { 
        mode: corrections.mode,
        purpose: corrections.purpose,
        companions: corrections.companions
      })
    };

    const trip = await TripService.updateTrip(tripId, userId, updateData);

    if (!trip) {
      return sendError(res, 'Trip not found or validation failed', 404);
    }

    // Send achievement notification if this is the first validated trip
    const stats = await TripService.getTripStats(userId);
    if (stats && stats.totalTrips === 1) {
      await NotificationService.sendAchievementNotification(
        userId,
        'first_trip',
        { tripId, distance: trip.distance }
      );
    }

    // Log analytics event
    await AnalyticsService.trackTripEvent('trip_validated', trip, userId);

    logger.info(`Trip validated: ${tripId} by user ${userId}`);

    return sendSuccess(res, { trip }, 'Trip validated successfully');
  });
}