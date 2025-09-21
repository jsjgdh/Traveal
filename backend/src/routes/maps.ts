import { Router } from 'express';
import { MapsController } from '../controllers/mapsController.js';
import { authenticate } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validation.js';
import Joi from 'joi';

const router = Router();

// Validation schemas
const setProviderSchema = Joi.object({
  provider: Joi.string().valid('google', 'mapmyindia').required()
});

const routeCalculationSchema = Joi.object({
  origin: Joi.alternatives().try(
    Joi.string().min(1),
    Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    })
  ).required(),
  destination: Joi.alternatives().try(
    Joi.string().min(1),
    Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    })
  ).required(),
  waypoints: Joi.array().items(
    Joi.alternatives().try(
      Joi.string().min(1),
      Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
      })
    )
  ).optional()
});

const staticMapSchema = Joi.object({
  center: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).required(),
  zoom: Joi.number().min(1).max(20).optional(),
  size: Joi.object({
    width: Joi.number().min(100).max(2048).optional(),
    height: Joi.number().min(100).max(2048).optional()
  }).optional(),
  markers: Joi.array().items(
    Joi.object({
      location: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required()
      }).required(),
      label: Joi.string().max(1).optional(),
      color: Joi.string().optional()
    })
  ).optional()
});

// Provider management routes
router.get('/provider', 
  generalLimiter,
  authenticate,
  MapsController.getCurrentProvider
);

router.post('/provider', 
  generalLimiter,
  authenticate,
  validate(setProviderSchema),
  MapsController.setProvider
);

// Geocoding routes
router.get('/geocode', 
  generalLimiter,
  authenticate,
  MapsController.geocodeAddress
);

router.get('/reverse-geocode', 
  generalLimiter,
  authenticate,
  MapsController.reverseGeocode
);

// Places routes
router.get('/autocomplete', 
  generalLimiter,
  authenticate,
  MapsController.getAutocompleteSuggestions
);

router.get('/place-details', 
  generalLimiter,
  authenticate,
  MapsController.getPlaceDetails
);

// Routing routes
router.post('/route', 
  generalLimiter,
  authenticate,
  validate(routeCalculationSchema),
  MapsController.calculateRoute
);

// Static maps route
router.post('/static-map', 
  generalLimiter,
  authenticate,
  validate(staticMapSchema),
  MapsController.generateStaticMap
);

// Configuration and testing routes
router.get('/config', 
  generalLimiter,
  authenticate,
  MapsController.getMapConfig
);

router.get('/test-providers', 
  generalLimiter,
  authenticate,
  MapsController.testProviders
);

export default router;