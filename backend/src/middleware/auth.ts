import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { sendError } from '@/utils/helpers';
import logger from '@/utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        uuid: string;
        deviceId?: string;
        onboarded: boolean;
        consentData: any;
        preferences?: any;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      sendError(res, 'Authorization header missing', 401);
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      sendError(res, 'Token missing', 401);
      return;
    }

    // Verify token
    const decoded = AuthService.verifyAccessToken(token);
    
    if (!decoded) {
      sendError(res, 'Invalid or expired token', 401);
      return;
    }

    // Get user from database
    const user = await AuthService.getUserByUuid(decoded.userId);
    
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    sendError(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't fail if not
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      next();
      return;
    }

    const decoded = AuthService.verifyAccessToken(token);
    
    if (decoded) {
      const user = await AuthService.getUserByUuid(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if there's an error
    next();
  }
};

/**
 * Require onboarding middleware
 * Ensures user has completed onboarding
 */
export const requireOnboarding = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required', 401);
    return;
  }

  if (!req.user.onboarded) {
    sendError(res, 'Onboarding required', 403);
    return;
  }

  next();
};

/**
 * Require consent middleware
 * Ensures user has given required consent
 */
export const requireConsent = (requiredConsent: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const consentData = req.user.consentData;
    
    for (const consent of requiredConsent) {
      const [category, permission] = consent.split('.');
      
      if (!consentData[category]?.[permission]) {
        sendError(res, `Consent required: ${consent}`, 403);
        return;
      }
    }

    next();
  };
};

/**
 * Device ID validation middleware
 */
export const validateDeviceId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const deviceId = req.headers['x-device-id'] as string;
  
  if (!deviceId) {
    sendError(res, 'Device ID required', 400);
    return;
  }

  // Basic validation - should be UUID format or similar
  if (deviceId.length < 16 || deviceId.length > 128) {
    sendError(res, 'Invalid device ID format', 400);
    return;
  }

  next();
};