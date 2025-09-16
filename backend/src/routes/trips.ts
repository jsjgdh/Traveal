import express from 'express';
import { TripController } from '../controllers/tripController.js';
import { authenticate, requireOnboarding } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { apiRateLimit, geolocationValidation, inputValidation } from '../middleware/security.js';

const router = express.Router();

// Apply middleware to all routes
router.use(apiRateLimit);
router.use(authenticate);
router.use(requireOnboarding);
router.use(inputValidation);

// Trip management routes
router.post('/',
  validate(schemas.createTrip),
  geolocationValidation,
  TripController.createTrip
);

router.get('/',
  validate(schemas.getTripsPagination),
  TripController.getUserTrips
);

router.get('/active',
  TripController.getActiveTrip
);

router.get('/stats',
  TripController.getTripStats
);

router.get('/:id',
  validate(schemas.getTripById),
  TripController.getTripById
);

router.put('/:id',
  validate(schemas.updateTrip),
  geolocationValidation,
  TripController.updateTrip
);

router.delete('/:id',
  validate(schemas.getTripById),
  TripController.deleteTrip
);

router.post('/:id/end',
  validate(schemas.endTrip),
  geolocationValidation,
  TripController.endTrip
);

router.post('/:id/locations',
  validate(schemas.addLocationPoint),
  geolocationValidation,
  TripController.addLocationPoint
);

router.post('/:id/validate',
  validate(schemas.validateTrip),
  TripController.validateTrip
);

export default router;