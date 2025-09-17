import { Response } from 'express';
import { ApiResponse } from '../types';
import logger from './logger';

/**
 * Send standardized API response
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  data?: T,
  message?: string,
  pagination?: any
): Response => {
  const response: ApiResponse<T> = {
    success,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(pagination && { pagination })
  };

  return res.status(statusCode).json(response);
};

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
  pagination?: any
): Response => {
  return sendResponse(res, statusCode, true, data, message, pagination);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: any
): Response => {
  // Log error for debugging
  if (error) {
    logger.error('API Error:', error);
  }

  return sendResponse(res, statusCode, false, undefined, message);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convert to meters
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Fuzzy location for privacy (add random offset within radius)
 */
export const fuzzyLocation = (
  lat: number,
  lon: number,
  radiusMeters: number = 100
): { latitude: number; longitude: number } => {
  const radiusInDegrees = radiusMeters / 111000; // Approximate conversion
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  return {
    latitude: lat + x,
    longitude: lon + y
  };
};

/**
 * Round time to nearest interval
 */
export const roundTime = (date: Date, minutesToRound: number = 60): Date => {
  const ms = 1000 * 60 * minutesToRound;
  return new Date(Math.round(date.getTime() / ms) * ms);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate pagination metadata
 */
export const getPagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages: totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Sleep utility for testing/debugging
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};