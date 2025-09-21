import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate, optionalAuth, validateDeviceId } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { authLimiter, generalLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply general rate limiting to all auth routes
router.use(generalLimiter);

// Public routes (no authentication required)
router.post('/register', 
  authLimiter,
  validateDeviceId,
  validate(schemas.registerUser),
  AuthController.register
);

router.post('/login',
  authLimiter,
  validateDeviceId,
  AuthController.login
);

router.post('/refresh',
  validate(schemas.refreshToken),
  AuthController.refreshToken
);

router.get('/status',
  optionalAuth,
  AuthController.checkStatus
);

// Protected routes (authentication required)
router.get('/me',
  authenticate,
  AuthController.getProfile
);

router.put('/consent',
  authenticate,
  validate(schemas.updateConsent),
  AuthController.updateConsent
);

router.put('/preferences',
  authenticate,
  validate(schemas.updatePreferences),
  AuthController.updatePreferences
);

router.put('/profile',
  authenticate,
  AuthController.updateProfile
);

router.post('/export-data',
  authenticate,
  AuthController.requestDataExport
);

router.get('/export-requests',
  authenticate,
  AuthController.getExportRequests
);

router.get('/export/:requestId/download',
  authenticate,
  AuthController.downloadExportedData
);

router.delete('/account',
  authenticate,
  authLimiter,
  AuthController.deleteAccount
);

export default router;