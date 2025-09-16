import express from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authenticate, requireOnboarding } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { apiRateLimit, inputValidation } from '../middleware/security.js';

const router = express.Router();

// Apply middleware to all routes
router.use(apiRateLimit);
router.use(authenticate);
router.use(requireOnboarding);
router.use(inputValidation);

// Analytics routes
router.post('/events',
  validate(schemas.logAnalyticsEvent),
  AnalyticsController.logEvent
);

router.post('/sessions/start',
  validate(schemas.startSession),
  AnalyticsController.startSession
);

router.post('/sessions/:sessionId/end',
  validate(schemas.endSession),
  AnalyticsController.endSession
);

router.get('/summary',
  validate(schemas.getAnalyticsSummary),
  AnalyticsController.getUserAnalytics
);

router.get('/export',
  validate(schemas.exportAnalytics),
  AnalyticsController.exportAnalyticsData
);

// Aggregated analytics (admin/research use)
router.get('/aggregated',
  validate(schemas.getAggregatedAnalytics),
  AnalyticsController.getAggregatedAnalytics
);

router.get('/health',
  AnalyticsController.getHealthMetrics
);

export default router;