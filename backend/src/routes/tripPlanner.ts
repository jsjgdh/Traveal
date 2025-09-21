import express from 'express';
import { TripPlannerController } from '../controllers/tripPlannerController.js';
import { authenticate, requireOnboarding } from '../middleware/auth.js';
// import { validate, schemas } from '../middleware/validation.js';
import { apiRateLimit, inputValidation } from '../middleware/security.js';

const router = express.Router();

// Apply middleware to all routes
router.use(apiRateLimit);
router.use(authenticate);
router.use(requireOnboarding);
router.use(inputValidation);

// Trip planner CRUD routes
// Places search route (must be before :id routes)
router.get('/places/search',
  TripPlannerController.searchPlaces
);

router.post('/',
  // validate(schemas.createTripPlan),
  TripPlannerController.createTripPlan
);

router.get('/',
  // validate(schemas.getTripPlans),
  TripPlannerController.getUserTripPlans
);

router.get('/:id',
  // validate(schemas.getTripPlanById),
  TripPlannerController.getTripPlanById
);

router.put('/:id',
  // validate(schemas.updateTripPlan),
  TripPlannerController.updateTripPlan
);

router.delete('/:id',
  // validate(schemas.getTripPlanById),
  TripPlannerController.deleteTripPlan
);

// Destination management routes
router.post('/:id/destinations',
  // validate(schemas.addDestination),
  TripPlannerController.addDestination
);

router.put('/:id/destinations/:destinationId',
  // validate(schemas.updateDestination),
  TripPlannerController.updateDestination
);

router.delete('/:id/destinations/:destinationId',
  TripPlannerController.removeDestination
);

// Itinerary management routes
router.post('/:id/itinerary',
  // validate(schemas.addItineraryItem),
  TripPlannerController.addItineraryItem
);

router.put('/:id/itinerary/:itemId',
  // validate(schemas.updateItineraryItem),
  TripPlannerController.updateItineraryItem
);

router.delete('/:id/itinerary/:itemId',
  TripPlannerController.removeItineraryItem
);

// Companion management routes
router.post('/:id/companions',
  // validate(schemas.addCompanion),
  TripPlannerController.addCompanion
);

// Booking organizer routes
router.post('/:id/bookings',
  // validate(schemas.addBookingItem),
  TripPlannerController.addBookingItem
);

// Packing list routes
router.put('/:id/packing-list',
  // validate(schemas.updatePackingList),
  TripPlannerController.updatePackingList
);

// Sharing routes
router.post('/:id/share',
  // validate(schemas.shareTripPlan),
  TripPlannerController.shareTripPlan
);

// Export routes
router.get('/:id/export',
  TripPlannerController.exportTripPlan
);

// Offline sync routes
router.post('/:id/sync',
  // validate(schemas.syncOfflineData),
  TripPlannerController.syncOfflineData
);

export default router;