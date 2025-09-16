import express from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate, requireOnboarding } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { apiRateLimit, inputValidation } from '../middleware/security.js';

const router = express.Router();

// Apply middleware to all routes
router.use(apiRateLimit);
router.use(authenticate);
router.use(requireOnboarding);
router.use(inputValidation);

// Notification management routes
router.get('/',
  validate(schemas.getNotificationsPagination),
  NotificationController.getUserNotifications
);

router.get('/stats',
  NotificationController.getNotificationStats
);

router.put('/:id/read',
  validate(schemas.getNotificationById),
  NotificationController.markAsRead
);

router.put('/read-all',
  NotificationController.markAllAsRead
);

router.delete('/:id',
  validate(schemas.getNotificationById),
  NotificationController.deleteNotification
);

router.delete('/clear-all',
  NotificationController.clearAllNotifications
);

// Admin/system routes (would require admin authentication in production)
router.post('/send',
  validate(schemas.sendNotification),
  NotificationController.sendNotification
);

export default router;