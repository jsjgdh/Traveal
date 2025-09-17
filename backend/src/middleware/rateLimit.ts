import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config/environment';
import { sendError } from '../utils/helpers';
import logger from '../utils/logger';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: config.RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return sendError(res, 'Too many requests, please try again later.', 429);
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    return sendError(res, 'Too many authentication attempts, please try again later.', 429);
  }
});

/**
 * Location data rate limiter
 */
export const locationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 location updates per minute
  message: {
    success: false,
    message: 'Too many location updates, please slow down.'
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Location rate limit exceeded for IP: ${req.ip}`);
    return sendError(res, 'Too many location updates, please slow down.', 429);
  }
});

/**
 * Analytics rate limiter
 */
export const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 analytics events per minute
  message: {
    success: false,
    message: 'Too many analytics events, please slow down.'
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Analytics rate limit exceeded for IP: ${req.ip}`);
    return sendError(res, 'Too many analytics events, please slow down.', 429);
  }
});