import { Request, Response } from 'express';
import { TripPlannerService } from '../services/tripPlannerService.js';
import { NotificationService } from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

export class TripPlannerController {
  /**
   * Create a new trip plan
   * POST /api/v1/trip-planner
   */
  static createTripPlan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanData = {
      ...req.body,
      userId,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tripPlan = await TripPlannerService.createTripPlan(tripPlanData);

    if (!tripPlan) {
      return sendError(res, 'Failed to create trip plan', 500);
    }

    logger.info(`Trip plan created: ${tripPlan.id} for user ${userId}`);
    return sendSuccess(res, { tripPlan }, 'Trip plan created successfully', 201);
  });

  /**
   * Get user's trip plans
   * GET /api/v1/trip-planner
   */
  static getUserTripPlans = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters = {
      status: req.query.status as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined,
      upcoming: req.query.upcoming === 'true'
    };

    const result = await TripPlannerService.getUserTripPlans(userId, page, limit, filters);

    if (!result) {
      return sendError(res, 'Failed to fetch trip plans', 500);
    }

    return sendSuccess(res, {
      tripPlans: result.tripPlans,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    }, 'Trip plans retrieved successfully');
  });

  /**
   * Get specific trip plan by ID
   * GET /api/v1/trip-planner/:id
   */
  static getTripPlanById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;

    const tripPlan = await TripPlannerService.getTripPlanById(tripPlanId, userId);

    if (!tripPlan) {
      return sendError(res, 'Trip plan not found', 404);
    }

    return sendSuccess(res, { tripPlan }, 'Trip plan retrieved successfully');
  });

  /**
   * Update trip plan
   * PUT /api/v1/trip-planner/:id
   */
  static updateTripPlan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const tripPlan = await TripPlannerService.updateTripPlan(tripPlanId, userId, updateData);

    if (!tripPlan) {
      return sendError(res, 'Trip plan not found or update failed', 404);
    }

    logger.info(`Trip plan updated: ${tripPlanId} by user ${userId}`);
    return sendSuccess(res, { tripPlan }, 'Trip plan updated successfully');
  });

  /**
   * Delete trip plan
   * DELETE /api/v1/trip-planner/:id
   */
  static deleteTripPlan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;

    const success = await TripPlannerService.deleteTripPlan(tripPlanId, userId);

    if (!success) {
      return sendError(res, 'Trip plan not found or deletion failed', 404);
    }

    logger.info(`Trip plan deleted: ${tripPlanId} by user ${userId}`);
    return sendSuccess(res, null, 'Trip plan deleted successfully');
  });

  /**
   * Add destination to trip plan
   * POST /api/v1/trip-planner/:id/destinations
   */
  static addDestination = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const destinationData = req.body;

    const destination = await TripPlannerService.addDestination(tripPlanId, userId, destinationData);

    if (!destination) {
      return sendError(res, 'Failed to add destination', 400);
    }

    return sendSuccess(res, { destination }, 'Destination added successfully', 201);
  });

  /**
   * Update destination
   * PUT /api/v1/trip-planner/:id/destinations/:destinationId
   */
  static updateDestination = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const destinationId = req.params.destinationId;
    const updateData = req.body;

    const destination = await TripPlannerService.updateDestination(tripPlanId, destinationId, userId, updateData);

    if (!destination) {
      return sendError(res, 'Destination not found or update failed', 404);
    }

    return sendSuccess(res, { destination }, 'Destination updated successfully');
  });

  /**
   * Remove destination
   * DELETE /api/v1/trip-planner/:id/destinations/:destinationId
   */
  static removeDestination = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const destinationId = req.params.destinationId;

    const success = await TripPlannerService.removeDestination(tripPlanId, destinationId, userId);

    if (!success) {
      return sendError(res, 'Destination not found or removal failed', 404);
    }

    return sendSuccess(res, null, 'Destination removed successfully');
  });

  /**
   * Add itinerary item
   * POST /api/v1/trip-planner/:id/itinerary
   */
  static addItineraryItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const itemData = req.body;

    const item = await TripPlannerService.addItineraryItem(tripPlanId, userId, itemData);

    if (!item) {
      return sendError(res, 'Failed to add itinerary item', 400);
    }

    return sendSuccess(res, { item }, 'Itinerary item added successfully', 201);
  });

  /**
   * Update itinerary item
   * PUT /api/v1/trip-planner/:id/itinerary/:itemId
   */
  static updateItineraryItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const itemId = req.params.itemId;
    const updateData = req.body;

    const item = await TripPlannerService.updateItineraryItem(tripPlanId, itemId, userId, updateData);

    if (!item) {
      return sendError(res, 'Itinerary item not found or update failed', 404);
    }

    return sendSuccess(res, { item }, 'Itinerary item updated successfully');
  });

  /**
   * Remove itinerary item
   * DELETE /api/v1/trip-planner/:id/itinerary/:itemId
   */
  static removeItineraryItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const itemId = req.params.itemId;

    const success = await TripPlannerService.removeItineraryItem(tripPlanId, itemId, userId);

    if (!success) {
      return sendError(res, 'Itinerary item not found or removal failed', 404);
    }

    return sendSuccess(res, null, 'Itinerary item removed successfully');
  });

  /**
   * Search places for trip planning
   * GET /api/v1/trip-planner/places/search
   */
  static searchPlaces = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const type = req.query.type as string;
    const location = req.query.location as string; // lat,lng format
    const radius = parseInt(req.query.radius as string) || 50000; // 50km default

    if (!query) {
      return sendError(res, 'Search query is required', 400);
    }

    const places = await TripPlannerService.searchPlaces(query, type, location, radius);

    return sendSuccess(res, { places }, 'Places retrieved successfully');
  });

  /**
   * Add companion to trip
   * POST /api/v1/trip-planner/:id/companions
   */
  static addCompanion = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const companionData = req.body;

    const companion = await TripPlannerService.addCompanion(tripPlanId, userId, companionData);

    if (!companion) {
      return sendError(res, 'Failed to add companion', 400);
    }

    // Send invitation if email provided
    if (companion.email) {
      await NotificationService.sendTripInvitation(companion.email, tripPlanId, userId);
    }

    return sendSuccess(res, { companion }, 'Companion added successfully', 201);
  });

  /**
   * Add booking item
   * POST /api/v1/trip-planner/:id/bookings
   */
  static addBookingItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const bookingData = req.body;

    const booking = await TripPlannerService.addBookingItem(tripPlanId, userId, bookingData);

    if (!booking) {
      return sendError(res, 'Failed to add booking item', 400);
    }

    return sendSuccess(res, { booking }, 'Booking item added successfully', 201);
  });

  /**
   * Update packing list
   * PUT /api/v1/trip-planner/:id/packing-list
   */
  static updatePackingList = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const packingItems = req.body.items;

    const updatedItems = await TripPlannerService.updatePackingList(tripPlanId, userId, packingItems);

    if (!updatedItems) {
      return sendError(res, 'Failed to update packing list', 400);
    }

    return sendSuccess(res, { items: updatedItems }, 'Packing list updated successfully');
  });

  /**
   * Share trip plan
   * POST /api/v1/trip-planner/:id/share
   */
  static shareTripPlan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const { shareWith, permissions } = req.body;

    const shareResult = await TripPlannerService.shareTripPlan(tripPlanId, userId, shareWith, permissions);

    if (!shareResult) {
      return sendError(res, 'Failed to share trip plan', 400);
    }

    return sendSuccess(res, { shareResult }, 'Trip plan shared successfully');
  });

  /**
   * Export trip plan
   * GET /api/v1/trip-planner/:id/export
   */
  static exportTripPlan = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const format = req.query.format as string || 'pdf';
    const options = {
      format,
      includeMap: req.query.includeMap === 'true',
      includeBookings: req.query.includeBookings === 'true',
      includePackingList: req.query.includePackingList === 'true',
      includeNotes: req.query.includeNotes === 'true'
    };

    const exportResult = await TripPlannerService.exportTripPlan(tripPlanId, userId, options);

    if (!exportResult) {
      return sendError(res, 'Failed to export trip plan', 400);
    }

    return sendSuccess(res, { exportResult }, 'Trip plan exported successfully');
  });

  /**
   * Sync offline data
   * POST /api/v1/trip-planner/:id/sync
   */
  static syncOfflineData = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const tripPlanId = req.params.id;
    const offlineData = req.body;

    const syncResult = await TripPlannerService.syncOfflineData(tripPlanId, userId, offlineData);

    if (!syncResult) {
      return sendError(res, 'Failed to sync offline data', 400);
    }

    return sendSuccess(res, { syncResult }, 'Offline data synced successfully');
  });
}