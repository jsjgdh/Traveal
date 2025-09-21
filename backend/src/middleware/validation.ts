import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/helpers.js';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details[0].message;
      sendError(res, `Validation error: ${message}`, 400);
      return;
    }
    
    next();
  };
};

/**
 * Validation schemas
 */
export const schemas = {
  // User registration
  registerUser: Joi.object({
    consentData: Joi.object({
      locationData: Joi.object({
        allowTracking: Joi.boolean().required(),
        preciseLocation: Joi.boolean().required()
      }).required(),
      sensorData: Joi.object({
        motionSensors: Joi.boolean().required(),
        activityDetection: Joi.boolean().required()
      }).required(),
      usageAnalytics: Joi.object({
        anonymousStats: Joi.boolean().required(),
        crashReports: Joi.boolean().required()
      }).required()
    }).required()
  }),

  // Update consent
  updateConsent: Joi.object({
    consentData: Joi.object({
      locationData: Joi.object({
        allowTracking: Joi.boolean().required(),
        preciseLocation: Joi.boolean().required()
      }).required(),
      sensorData: Joi.object({
        motionSensors: Joi.boolean().required(),
        activityDetection: Joi.boolean().required()
      }).required(),
      usageAnalytics: Joi.object({
        anonymousStats: Joi.boolean().required(),
        crashReports: Joi.boolean().required()
      }).required()
    }).required()
  }),

  // Update preferences
  updatePreferences: Joi.object({
    preferences: Joi.object({
      notificationSettings: Joi.object({
        tripValidation: Joi.boolean(),
        achievements: Joi.boolean(),
        system: Joi.boolean(),
        pushEnabled: Joi.boolean()
      }),
      privacySettings: Joi.object({
        dataRetentionDays: Joi.number().min(30).max(365),
        shareAggregatedData: Joi.boolean()
      }),
      appSettings: Joi.object({
        theme: Joi.string().valid('light', 'dark', 'system'),
        language: Joi.string().length(2),
        units: Joi.string().valid('metric', 'imperial')
      })
    }).required()
  }),

  // Create trip
  createTrip: Joi.object({
    startLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().optional()
    }).required(),
    endLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      address: Joi.string().optional()
    }).optional(),
    startTime: Joi.date().required(),
    endTime: Joi.date().optional(),
    mode: Joi.string().valid('walking', 'driving', 'public_transport', 'cycling').optional(),
    purpose: Joi.string().valid('work', 'school', 'shopping', 'other').optional(),
    companions: Joi.number().min(0).max(10).optional()
  }),

  // Update trip
  updateTrip: Joi.object({
    endLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      address: Joi.string().optional()
    }).optional(),
    endTime: Joi.date().optional(),
    mode: Joi.string().valid('walking', 'driving', 'public_transport', 'cycling').optional(),
    purpose: Joi.string().valid('work', 'school', 'shopping', 'other').optional(),
    companions: Joi.number().min(0).max(10).optional(),
    validated: Joi.boolean().optional()
  }),

  // Add location point
  addLocationPoint: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0).optional(),
    speed: Joi.number().min(0).optional(),
    altitude: Joi.number().optional(),
    timestamp: Joi.date().required()
  }),

  // Analytics event
  analyticsEvent: Joi.object({
    eventType: Joi.string().required(),
    eventData: Joi.object().required()
  }),

  // Additional schemas for new routes
  getTripById: Joi.object({
    id: Joi.string().uuid().required()
  }),

  getTripsPagination: Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    mode: Joi.string().valid('walking', 'driving', 'public_transport', 'cycling').optional(),
    purpose: Joi.string().valid('work', 'school', 'shopping', 'other').optional(),
    validated: Joi.boolean().optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional()
  }),

  endTrip: Joi.object({
    endLocation: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      address: Joi.string().optional()
    }).required()
  }),

  validateTrip: Joi.object({
    validated: Joi.boolean().required(),
    corrections: Joi.object({
      mode: Joi.string().valid('walking', 'driving', 'public_transport', 'cycling').optional(),
      purpose: Joi.string().valid('work', 'school', 'shopping', 'other').optional(),
      companions: Joi.number().min(0).max(10).optional()
    }).optional()
  }),

  // Notification schemas
  sendNotification: Joi.object({
    userId: Joi.string().uuid().required(),
    type: Joi.string().valid('trip_validation', 'achievement', 'system', 'challenge').required(),
    title: Joi.string().max(100).required(),
    message: Joi.string().max(500).required(),
    data: Joi.object().optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional()
  }),

  getNotificationById: Joi.object({
    id: Joi.string().required()
  }),

  getNotificationsPagination: Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(100).optional(),
    unreadOnly: Joi.boolean().optional()
  }),

  // Analytics schemas
  logAnalyticsEvent: Joi.object({
    eventType: Joi.string().max(100).required(),
    eventData: Joi.object().required(),
    sessionId: Joi.string().optional(),
    deviceInfo: Joi.object({
      type: Joi.string().valid('mobile', 'tablet', 'desktop').optional(),
      platform: Joi.string().valid('ios', 'android', 'web').optional(),
      version: Joi.string().optional(),
      hasGPS: Joi.boolean().optional(),
      screenSize: Joi.string().optional()
    }).optional(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      accuracy: Joi.number().min(0).optional()
    }).optional()
  }),

  startSession: Joi.object({
    deviceInfo: Joi.object({
      type: Joi.string().valid('mobile', 'tablet', 'desktop').optional(),
      platform: Joi.string().valid('ios', 'android', 'web').optional(),
      version: Joi.string().optional(),
      hasGPS: Joi.boolean().optional(),
      screenSize: Joi.string().optional()
    }).optional()
  }),

  endSession: Joi.object({
    sessionId: Joi.string().required()
  }),

  getAnalyticsSummary: Joi.object({
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional()
  }),

  exportAnalytics: Joi.object({
    format: Joi.string().valid('json', 'csv').optional(),
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional()
  }),

  getAggregatedAnalytics: Joi.object({
    dateFrom: Joi.date().optional(),
    dateTo: Joi.date().optional(),
    anonymizeUsers: Joi.boolean().optional()
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  })
};

/**
 * Query parameter validation
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const message = error.details[0].message;
      sendError(res, `Query validation error: ${message}`, 400);
      return;
    }
    
    // Replace query with validated values
    req.query = value;
    next();
  };
};

/**
 * Parameter validation
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const message = error.details[0].message;
      sendError(res, `Parameter validation error: ${message}`, 400);
      return;
    }
    
    next();
  };
};

/**
 * Common parameter schemas
 */
export const paramSchemas = {
  id: Joi.object({
    id: Joi.string().required()
  }),
  uuid: Joi.object({
    uuid: Joi.string().uuid().required()
  })
};

// Trip Planner validation schemas (temporary addition)
export const tripPlannerSchemas = {
  createTripPlan: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    destinations: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        city: Joi.string().optional(),
        country: Joi.string().optional()
      })
    ).optional(),
    totalBudget: Joi.number().min(0).optional(),
    currency: Joi.string().length(3).optional(),
    notes: Joi.string().max(2000).optional()
  })
};