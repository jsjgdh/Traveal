import { Router } from 'express';
import { SOSController } from '../controllers/sosController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import Joi from 'joi';

const router = Router();

// Validation schemas
const sosProfileSchema = Joi.object({
  fullPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Full password must be at least 8 characters long',
      'string.pattern.base': 'Full password must contain uppercase, lowercase, number, and special character'
    }),
  partialPassword: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Partial password must be at least 6 characters long',
      'string.pattern.base': 'Partial password must contain uppercase, lowercase, and number'
    }),
  emergencyContacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().optional(),
      relationship: Joi.string().required(),
      priority: Joi.number().min(1).max(10).optional()
    })
  ).min(1).required(),
  biometricEnabled: Joi.boolean().optional(),
  isEnabled: Joi.boolean().optional(),
  voiceLanguage: Joi.string().valid('en', 'hi', 'ml', 'ta', 'te', 'kn').optional(),
  backgroundPermissions: Joi.boolean().optional()
});

const routeMonitoringSchema = Joi.object({
  sosProfileId: Joi.string().required(),
  tripId: Joi.string().optional(),
  plannedRoute: Joi.array().items(
    Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      timestamp: Joi.date().optional()
    })
  ).min(2).required(),
  destination: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().optional()
  }).required(),
  deviationThreshold: Joi.number().min(100).max(5000).optional(),
  estimatedArrival: Joi.date().optional()
});

const locationUpdateSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  accuracy: Joi.number().min(0).optional(),
  speed: Joi.number().min(0).optional(),
  altitude: Joi.number().optional()
});

const alertTriggerSchema = Joi.object({
  sosProfileId: Joi.string().required(),
  routeMonitoringId: Joi.string().optional(),
  alertType: Joi.string().valid('route_deviation', 'manual_trigger', 'tamper_detection', 'panic').required(),
  currentLocation: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).required(),
  isStealthMode: Joi.boolean().optional()
});

const passwordVerificationSchema = Joi.object({
  password: Joi.string().required(),
  isPartialPassword: Joi.boolean().optional()
});

const emergencyContactSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().optional(),
  relationship: Joi.string().required(),
  priority: Joi.number().min(1).max(10).optional()
});

const settingsUpdateSchema = Joi.object({
  isEnabled: Joi.boolean().optional(),
  biometricEnabled: Joi.boolean().optional(),
  voiceLanguage: Joi.string().valid('en', 'hi', 'ml', 'ta', 'te', 'kn').optional(),
  backgroundPermissions: Joi.boolean().optional()
});

const voiceTestSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'ml', 'ta', 'te', 'kn').optional(),
  localArea: Joi.string().optional()
});

// SOS Profile Routes
router.post('/profile', 
  generalLimiter,
  authenticate, 
  validate(sosProfileSchema),
  SOSController.createOrUpdateProfile
);

router.get('/profile', 
  generalLimiter,
  authenticate, 
  SOSController.getProfile
);

// Route Monitoring Routes
router.post('/monitoring/start', 
  generalLimiter,
  authenticate, 
  validate(routeMonitoringSchema),
  SOSController.startRouteMonitoring
);

router.post('/monitoring/:monitoringId/location', 
  generalLimiter,
  authenticate, 
  validate(locationUpdateSchema),
  SOSController.updateLocation
);

router.post('/monitoring/:monitoringId/end', 
  generalLimiter,
  authenticate, 
  SOSController.endRouteMonitoring
);

// Alert Management Routes
router.post('/alert/trigger', 
  generalLimiter,
  authenticate, 
  validate(alertTriggerSchema),
  SOSController.triggerAlert
);

router.post('/alert/:alertId/verify', 
  generalLimiter,
  validate(passwordVerificationSchema),
  SOSController.verifyPassword
);

router.get('/alerts/active', 
  generalLimiter,
  authenticate, 
  SOSController.getActiveAlerts
);

// Emergency Contact Routes
router.post('/contacts', 
  generalLimiter,
  authenticate, 
  validate(emergencyContactSchema),
  SOSController.addEmergencyContact
);

// Settings Routes
router.put('/settings', 
  generalLimiter,
  authenticate, 
  validate(settingsUpdateSchema),
  SOSController.updateSettings
);

// Testing Routes (for development and user testing)
router.post('/test/voice', 
  generalLimiter,
  authenticate, 
  validate(voiceTestSchema),
  SOSController.testVoiceAlert
);

export default router;