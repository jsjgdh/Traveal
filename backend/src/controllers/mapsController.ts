import { Request, Response } from 'express';
import { MapsService } from '../services/mapsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/helpers.js';
import logger from '../utils/logger.js';

export class MapsController {
  /**
   * Get current map provider
   * GET /api/v1/maps/provider
   */
  static getCurrentProvider = asyncHandler(async (req: Request, res: Response) => {
    const provider = MapsService.getCurrentProvider();
    return sendSuccess(res, { provider }, 'Current map provider retrieved');
  });

  /**
   * Set map provider
   * POST /api/v1/maps/provider
   */
  static setProvider = asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.body;

    if (!provider || !['google', 'mapmyindia'].includes(provider)) {
      return sendError(res, 'Invalid provider. Must be "google" or "mapmyindia"', 400);
    }

    if (!MapsService.isConfigured(provider)) {
      return sendError(res, `${provider} maps service is not configured`, 400);
    }

    MapsService.setProvider(provider);
    return sendSuccess(res, { provider }, `Map provider set to ${provider}`);
  });

  /**
   * Geocode an address
   * GET /api/v1/maps/geocode?address=New+Delhi
   */
  static geocodeAddress = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return sendError(res, 'Address parameter is required', 400);
    }

    try {
      const result = await MapsService.geocodeAddress(address);
      
      if (result) {
        return sendSuccess(res, result, 'Address geocoded successfully');
      } else {
        return sendError(res, 'Unable to geocode address', 404);
      }
    } catch (error) {
      logger.error('Geocoding error:', error);
      return sendError(res, 'Geocoding service error', 500);
    }
  });

  /**
   * Reverse geocode coordinates
   * GET /api/v1/maps/reverse-geocode?lat=28.6139&lng=77.2090
   */
  static reverseGeocode = asyncHandler(async (req: Request, res: Response) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return sendError(res, 'Latitude and longitude parameters are required', 400);
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return sendError(res, 'Invalid latitude or longitude values', 400);
    }

    try {
      const result = await MapsService.reverseGeocode({ latitude, longitude });
      
      if (result) {
        return sendSuccess(res, result, 'Coordinates reverse geocoded successfully');
      } else {
        return sendError(res, 'Unable to reverse geocode coordinates', 404);
      }
    } catch (error) {
      logger.error('Reverse geocoding error:', error);
      return sendError(res, 'Reverse geocoding service error', 500);
    }
  });

  /**
   * Get autocomplete suggestions
   * GET /api/v1/maps/autocomplete?input=New+Delhi&sessionToken=abc123
   */
  static getAutocompleteSuggestions = asyncHandler(async (req: Request, res: Response) => {
    const { input, sessionToken } = req.query;

    if (!input || typeof input !== 'string') {
      return sendError(res, 'Input parameter is required', 400);
    }

    if (input.length < 2) {
      return sendError(res, 'Input must be at least 2 characters long', 400);
    }

    try {
      const suggestions = await MapsService.getAutocompleteSuggestions(
        input,
        sessionToken as string
      );
      
      return sendSuccess(res, { suggestions }, 'Autocomplete suggestions retrieved');
    } catch (error) {
      logger.error('Autocomplete error:', error);
      return sendError(res, 'Autocomplete service error', 500);
    }
  });

  /**
   * Get place details
   * GET /api/v1/maps/place-details?placeId=ChIJLbZ-NFv9DDkRzk0gTkm3wlI
   */
  static getPlaceDetails = asyncHandler(async (req: Request, res: Response) => {
    const { placeId } = req.query;

    if (!placeId || typeof placeId !== 'string') {
      return sendError(res, 'Place ID parameter is required', 400);
    }

    try {
      const details = await MapsService.getPlaceDetails(placeId);
      
      if (details) {
        return sendSuccess(res, details, 'Place details retrieved successfully');
      } else {
        return sendError(res, 'Place not found', 404);
      }
    } catch (error) {
      logger.error('Place details error:', error);
      return sendError(res, 'Place details service error', 500);
    }
  });

  /**
   * Calculate route between two points
   * POST /api/v1/maps/route
   */
  static calculateRoute = asyncHandler(async (req: Request, res: Response) => {
    const { origin, destination, waypoints } = req.body;

    if (!origin || !destination) {
      return sendError(res, 'Origin and destination are required', 400);
    }

    try {
      const route = await MapsService.calculateRoute(origin, destination, waypoints);
      
      if (route) {
        return sendSuccess(res, route, 'Route calculated successfully');
      } else {
        return sendError(res, 'Unable to calculate route', 404);
      }
    } catch (error) {
      logger.error('Route calculation error:', error);
      return sendError(res, 'Route calculation service error', 500);
    }
  });

  /**
   * Generate static map URL
   * POST /api/v1/maps/static-map
   */
  static generateStaticMap = asyncHandler(async (req: Request, res: Response) => {
    const { center, zoom = 15, size = { width: 600, height: 400 }, markers } = req.body;

    if (!center || !center.latitude || !center.longitude) {
      return sendError(res, 'Center coordinates are required', 400);
    }

    try {
      const mapUrl = MapsService.generateStaticMapUrl(center, zoom, size, markers);
      
      if (mapUrl) {
        return sendSuccess(res, { mapUrl }, 'Static map URL generated successfully');
      } else {
        return sendError(res, 'Unable to generate static map URL', 500);
      }
    } catch (error) {
      logger.error('Static map generation error:', error);
      return sendError(res, 'Static map generation error', 500);
    }
  });

  /**
   * Test map providers
   * GET /api/v1/maps/test-providers
   */
  static testProviders = asyncHandler(async (req: Request, res: Response) => {
    try {
      const results = await MapsService.testMapProviders();
      
      return sendSuccess(res, {
        google: {
          configured: MapsService.isConfigured('google'),
          working: results.google
        },
        mapmyindia: {
          configured: MapsService.isConfigured('mapmyindia'),
          working: results.mapmyindia
        },
        currentProvider: MapsService.getCurrentProvider()
      }, 'Map providers tested successfully');
    } catch (error) {
      logger.error('Provider test error:', error);
      return sendError(res, 'Provider test error', 500);
    }
  });

  /**
   * Get map configuration status
   * GET /api/v1/maps/config
   */
  static getMapConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = {
      currentProvider: MapsService.getCurrentProvider(),
      providers: {
        google: {
          configured: MapsService.isConfigured('google'),
          features: {
            geocoding: true,
            reverseGeocoding: true,
            autocomplete: true,
            placeDetails: true,
            routing: true,
            staticMaps: true
          }
        },
        mapmyindia: {
          configured: MapsService.isConfigured('mapmyindia'),
          features: {
            geocoding: true,
            reverseGeocoding: true,
            autocomplete: true,
            placeDetails: true,
            routing: true,
            staticMaps: true
          }
        }
      }
    };

    return sendSuccess(res, config, 'Map configuration retrieved successfully');
  });
}