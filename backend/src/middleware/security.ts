import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config/environment.js';
import { sendError } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Advanced Security Middleware Suite
 * Implements government-grade security measures
 */

/**
 * CSRF Protection Middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    sendError(res, 'Invalid CSRF token', 403);
    return;
  }

  next();
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session) {
    req.session = {};
  }
  
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
};

/**
 * XSS Protection Middleware
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Set XSS protection headers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * SQL Injection Prevention Middleware
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /'[\s]*;[\s]*--/gi,
    /'[\s]*;[\s]*\/\*/gi,
    /\/\*.*\*\//gi,
    /--[\s]*.*/gi,
    /'[\s]*OR[\s]+'[\s]*=[\s]*'/gi,
    /'[\s]*AND[\s]+'[\s]*=[\s]*'/gi,
    /\b(xp_|sp_|exec|execute)\b/gi
  ];

  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    return sqlPatterns.some(pattern => pattern.test(value));
  };

  const scanObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForSQLInjection(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.some(scanObject);
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(scanObject);
    }
    
    return false;
  };

  // Check request body
  if (req.body && scanObject(req.body)) {
    logger.warn(`SQL injection attempt detected from IP: ${req.ip}`);
    sendError(res, 'Invalid request parameters', 400);
    return;
  }

  // Check query parameters
  if (req.query && scanObject(req.query)) {
    logger.warn(`SQL injection attempt detected in query from IP: ${req.ip}`);
    sendError(res, 'Invalid query parameters', 400);
    return;
  }

  next();
};

/**
 * Advanced Rate Limiting with different tiers
 */
export const createAdvancedRateLimit = (options: {
  windowMs?: number;
  max?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: options.keyGenerator || ((req: Request) => {
      // Combine IP and User-Agent for more specific rate limiting
      const userAgent = req.get('User-Agent') || 'unknown';
      const ip = req.ip || 'unknown';
      return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
    }),
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      sendError(res, 'Too many requests, please try again later', 429);
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * API Authentication Rate Limiting
 */
export const authRateLimit = createAdvancedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true
});

/**
 * General API Rate Limiting
 */
export const apiRateLimit = createAdvancedRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // 1000 requests per 15 minutes
  skipSuccessfulRequests: false
});

/**
 * Strict Rate Limiting for sensitive endpoints
 */
export const strictRateLimit = createAdvancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  skipSuccessfulRequests: false
});

/**
 * Input Validation and Sanitization
 */
export const inputValidation = (req: Request, res: Response, next: NextFunction): void => {
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      sendError(res, 'Invalid Content-Type. Expected application/json', 400);
      return;
    }
  }

  // Validate request size
  const maxBodySize = 10 * 1024 * 1024; // 10MB
  if (req.get('content-length') && parseInt(req.get('content-length')!) > maxBodySize) {
    sendError(res, 'Request body too large', 413);
    return;
  }

  // Validate required headers
  const requiredHeaders = ['user-agent'];
  for (const header of requiredHeaders) {
    if (!req.get(header)) {
      sendError(res, `Missing required header: ${header}`, 400);
      return;
    }
  }

  next();
};

/**
 * Request Sanitization
 */
export const requestSanitization = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize headers
  const dangerousHeaders = ['x-forwarded-host', 'x-forwarded-proto'];
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });

  // Sanitize and validate JSON body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeAndValidateObject(req.body);
  }

  next();
};

/**
 * Geolocation Validation
 */
export const geolocationValidation = (req: Request, res: Response, next: NextFunction): void => {
  const { latitude, longitude } = req.body;

  if (latitude !== undefined || longitude !== undefined) {
    // Validate latitude
    if (latitude !== undefined) {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        sendError(res, 'Invalid latitude. Must be between -90 and 90', 400);
        return;
      }
      req.body.latitude = lat;
    }

    // Validate longitude
    if (longitude !== undefined) {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        sendError(res, 'Invalid longitude. Must be between -180 and 180', 400);
        return;
      }
      req.body.longitude = lng;
    }
  }

  next();
};

/**
 * Device ID Validation
 */
export const deviceIdValidation = (req: Request, res: Response, next: NextFunction): void => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    sendError(res, 'Device ID required', 400);
    return;
  }

  // Validate device ID format (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(deviceId)) {
    sendError(res, 'Invalid device ID format', 400);
    return;
  }

  next();
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Enhanced security headers
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('X-Powered-By', ''); // Remove Express signature
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none'; " +
    "base-uri 'self';"
  );

  // HSTS (HTTP Strict Transport Security)
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

/**
 * Request Logging for Security Monitoring
 */
export const securityLogging = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log security-relevant request information
  const securityInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    timestamp: new Date().toISOString(),
    sessionId: req.session?.id,
    userId: req.user?.id
  };

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//, // Directory traversal
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript injection
    /vbscript:/i, // VBScript injection
    /onload=/i, // Event handler injection
    /(union|select|insert|delete|update|drop|create|alter|exec)/i // SQL injection
  ];

  const requestString = JSON.stringify(req.body) + req.url + (req.get('User-Agent') || '');
  const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (hasSuspiciousPattern) {
    logger.warn('Suspicious request detected', securityInfo);
  }

  // Log response time on completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests
      logger.warn('Slow request detected', { ...securityInfo, duration, statusCode: res.statusCode });
    }
  });

  next();
};

/**
 * Bot Detection Middleware
 */
export const botDetection = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent') || '';
  
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /php/i,
    /automated/i, /scanner/i
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  if (isBot) {
    logger.info(`Bot detected: ${userAgent} from IP: ${req.ip}`);
    // You might want to apply different rate limits or restrictions for bots
    req.isBot = true;
  }

  next();
};

/**
 * Sanitize a single string value
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize an object recursively
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Enhanced sanitization with validation
 */
function sanitizeAndValidateObject(obj: any, maxDepth: number = 10): any {
  if (maxDepth <= 0) {
    throw new Error('Object structure too deep');
  }

  if (typeof obj === 'string') {
    if (obj.length > 10000) { // Prevent extremely long strings
      throw new Error('String value too long');
    }
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    if (obj.length > 1000) { // Prevent extremely large arrays
      throw new Error('Array too large');
    }
    return obj.map(item => sanitizeAndValidateObject(item, maxDepth - 1));
  }
  
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length > 100) { // Prevent objects with too many properties
      throw new Error('Object has too many properties');
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey.length > 100) { // Prevent extremely long property names
        throw new Error('Property name too long');
      }
      sanitized[sanitizedKey] = sanitizeAndValidateObject(value, maxDepth - 1);
    }
    return sanitized;
  }
  
  return obj;
}

// Extend Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      isBot?: boolean;
      session?: {
        id?: string;
        csrfToken?: string;
        [key: string]: any;
      };
    }
  }
}