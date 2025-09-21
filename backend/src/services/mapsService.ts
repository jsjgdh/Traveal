import { config } from '../config/environment.js';
import logger from '../utils/logger.js';
import axios from 'axios';

interface LocationPoint {
  latitude: number;
  longitude: number;
}

interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  location: LocationPoint;
  type?: string;
}

interface GeocodeResult {
  address: string;
  location: LocationPoint;
  placeId?: string;
  formattedAddress: string;
}

interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps?: RouteStep[];
}

interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: LocationPoint;
  endLocation: LocationPoint;
}

interface AutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export class MapsService {
  private static currentProvider: 'google' | 'mapmyindia' = config.DEFAULT_MAP_PROVIDER as 'google' | 'mapmyindia';

  /**
   * Set the map provider for subsequent requests
   */
  static setProvider(provider: 'google' | 'mapmyindia'): void {
    this.currentProvider = provider;
    logger.info(`Maps provider switched to: ${provider}`);
  }

  /**
   * Get current map provider
   */
  static getCurrentProvider(): 'google' | 'mapmyindia' {
    return this.currentProvider;
  }

  /**
   * Check if map services are configured
   */
  static isConfigured(provider?: 'google' | 'mapmyindia'): boolean {
    const targetProvider = provider || this.currentProvider;
    
    if (targetProvider === 'google') {
      return !!(config.GOOGLE_MAPS_API_KEY);
    } else if (targetProvider === 'mapmyindia') {
      return !!(config.MAPMYINDIA_API_KEY && config.MAPMYINDIA_CLIENT_ID);
    }
    
    return false;
  }

  /**
   * Geocode an address to coordinates
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
      if (!config.MAP_GEOCODING_ENABLED) {
        logger.debug('Geocoding is disabled');
        return null;
      }

      if (this.currentProvider === 'google') {
        return await this.googleGeocode(address);
      } else if (this.currentProvider === 'mapmyindia') {
        return await this.mapMyIndiaGeocode(address);
      }

      logger.warn(`Unsupported map provider: ${this.currentProvider}`);
      return null;

    } catch (error) {
      logger.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(location: LocationPoint): Promise<GeocodeResult | null> {
    try {
      if (!config.MAP_GEOCODING_ENABLED) {
        logger.debug('Geocoding is disabled');
        return null;
      }

      if (this.currentProvider === 'google') {
        return await this.googleReverseGeocode(location);
      } else if (this.currentProvider === 'mapmyindia') {
        return await this.mapMyIndiaReverseGeocode(location);
      }

      logger.warn(`Unsupported map provider: ${this.currentProvider}`);
      return null;

    } catch (error) {
      logger.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get autocomplete suggestions for place search
   */
  static async getAutocompleteSuggestions(input: string, sessionToken?: string): Promise<AutocompleteResult[]> {
    try {
      if (this.currentProvider === 'google') {
        return await this.googleAutocomplete(input, sessionToken);
      } else if (this.currentProvider === 'mapmyindia') {
        return await this.mapMyIndiaAutocomplete(input);
      }

      logger.warn(`Unsupported map provider: ${this.currentProvider}`);
      return [];

    } catch (error) {
      logger.error('Error getting autocomplete suggestions:', error);
      return [];
    }
  }

  /**
   * Get place details by place ID
   */
  static async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      if (this.currentProvider === 'google') {
        return await this.googlePlaceDetails(placeId);
      } else if (this.currentProvider === 'mapmyindia') {
        return await this.mapMyIndiaPlaceDetails(placeId);
      }

      logger.warn(`Unsupported map provider: ${this.currentProvider}`);
      return null;

    } catch (error) {
      logger.error('Error getting place details:', error);
      return null;
    }
  }

  /**
   * Calculate route between two points
   */
  static async calculateRoute(
    origin: LocationPoint | string,
    destination: LocationPoint | string,
    waypoints?: (LocationPoint | string)[]
  ): Promise<RouteResult | null> {
    try {
      if (!config.MAP_ROUTING_ENABLED) {
        logger.debug('Routing is disabled');
        return null;
      }

      if (this.currentProvider === 'google') {
        return await this.googleDirections(origin, destination, waypoints);
      } else if (this.currentProvider === 'mapmyindia') {
        return await this.mapMyIndiaDirections(origin, destination, waypoints);
      }

      logger.warn(`Unsupported map provider: ${this.currentProvider}`);
      return null;

    } catch (error) {
      logger.error('Error calculating route:', error);
      return null;
    }
  }

  /**
   * Generate static map URL
   */
  static generateStaticMapUrl(
    center: LocationPoint,
    zoom: number = 15,
    size: { width: number; height: number } = { width: 600, height: 400 },
    markers?: Array<{ location: LocationPoint; label?: string; color?: string }>
  ): string {
    try {
      if (this.currentProvider === 'google') {
        return this.generateGoogleStaticMapUrl(center, zoom, size, markers);
      } else if (this.currentProvider === 'mapmyindia') {
        return this.generateMapMyIndiaStaticMapUrl(center, zoom, size, markers);
      }

      logger.warn(`Unsupported map provider: ${this.currentProvider}`);
      return '';

    } catch (error) {
      logger.error('Error generating static map URL:', error);
      return '';
    }
  }

  // Google Maps API implementations
  private static async googleGeocode(address: string): Promise<GeocodeResult | null> {
    if (!this.isConfigured('google')) {
      logger.warn('Google Maps API not configured');
      return null;
    }

    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      address,
      key: config.GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng
        },
        placeId: result.place_id,
        formattedAddress: result.formatted_address
      };
    }

    return null;
  }

  private static async googleReverseGeocode(location: LocationPoint): Promise<GeocodeResult | null> {
    if (!this.isConfigured('google')) {
      logger.warn('Google Maps API not configured');
      return null;
    }

    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      latlng: `${location.latitude},${location.longitude}`,
      key: config.GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        location,
        placeId: result.place_id,
        formattedAddress: result.formatted_address
      };
    }

    return null;
  }

  private static async googleAutocomplete(input: string, sessionToken?: string): Promise<AutocompleteResult[]> {
    if (!this.isConfigured('google')) {
      logger.warn('Google Maps API not configured');
      return [];
    }

    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params: any = {
      input,
      key: config.GOOGLE_MAPS_API_KEY
    };

    if (sessionToken) {
      params.sessiontoken = sessionToken;
    }

    const response = await axios.get(url, { params });
    
    if (response.data.status === 'OK') {
      return response.data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text || ''
      }));
    }

    return [];
  }

  private static async googlePlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.isConfigured('google')) {
      logger.warn('Google Maps API not configured');
      return null;
    }

    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const params = {
      place_id: placeId,
      fields: 'name,formatted_address,geometry,place_id,types',
      key: config.GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === 'OK') {
      const result = response.data.result;
      return {
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng
        },
        type: result.types?.[0]
      };
    }

    return null;
  }

  private static async googleDirections(
    origin: LocationPoint | string,
    destination: LocationPoint | string,
    waypoints?: (LocationPoint | string)[]
  ): Promise<RouteResult | null> {
    if (!this.isConfigured('google')) {
      logger.warn('Google Maps API not configured');
      return null;
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    const params: any = {
      origin: typeof origin === 'string' ? origin : `${origin.latitude},${origin.longitude}`,
      destination: typeof destination === 'string' ? destination : `${destination.latitude},${destination.longitude}`,
      key: config.GOOGLE_MAPS_API_KEY
    };

    if (waypoints && waypoints.length > 0) {
      params.waypoints = waypoints.map(wp => 
        typeof wp === 'string' ? wp : `${wp.latitude},${wp.longitude}`
      ).join('|');
    }

    const response = await axios.get(url, { params });
    
    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        distance: leg.distance.value,
        duration: leg.duration.value,
        polyline: route.overview_polyline.points,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance.value,
          duration: step.duration.value,
          startLocation: {
            latitude: step.start_location.lat,
            longitude: step.start_location.lng
          },
          endLocation: {
            latitude: step.end_location.lat,
            longitude: step.end_location.lng
          }
        }))
      };
    }

    return null;
  }

  private static generateGoogleStaticMapUrl(
    center: LocationPoint,
    zoom: number,
    size: { width: number; height: number },
    markers?: Array<{ location: LocationPoint; label?: string; color?: string }>
  ): string {
    if (!this.isConfigured('google')) {
      return '';
    }

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: `${center.latitude},${center.longitude}`,
      zoom: zoom.toString(),
      size: `${size.width}x${size.height}`,
      key: config.GOOGLE_MAPS_API_KEY!
    });

    if (markers) {
      markers.forEach(marker => {
        const markerParam = `${marker.color || 'red'}|${marker.label || ''}|${marker.location.latitude},${marker.location.longitude}`;
        params.append('markers', markerParam);
      });
    }

    return `${baseUrl}?${params.toString()}`;
  }

  // MapMyIndia API implementations
  private static async mapMyIndiaGeocode(address: string): Promise<GeocodeResult | null> {
    if (!this.isConfigured('mapmyindia')) {
      logger.warn('MapMyIndia API not configured');
      return null;
    }

    // MapMyIndia Geocoding API
    const url = 'https://atlas.mapmyindia.com/api/places/geocode';
    const params = {
      address,
      rest_key: config.MAPMYINDIA_API_KEY
    };

    try {
      const response = await axios.get(url, { params });
      
      if (response.data.copResults && response.data.copResults.length > 0) {
        const result = response.data.copResults[0];
        return {
          address: result.formatted_address,
          location: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lng)
          },
          placeId: result.place_id,
          formattedAddress: result.formatted_address
        };
      }
    } catch (error) {
      logger.error('MapMyIndia geocoding error:', error);
    }

    return null;
  }

  private static async mapMyIndiaReverseGeocode(location: LocationPoint): Promise<GeocodeResult | null> {
    if (!this.isConfigured('mapmyindia')) {
      logger.warn('MapMyIndia API not configured');
      return null;
    }

    // MapMyIndia Reverse Geocoding API
    const url = 'https://apis.mapmyindia.com/advancedmaps/v1/{rest_key}/rev_geocode';
    const actualUrl = url.replace('{rest_key}', config.MAPMYINDIA_API_KEY!);
    
    const params = {
      lat: location.latitude,
      lng: location.longitude
    };

    try {
      const response = await axios.get(actualUrl, { params });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          address: result.formatted_address,
          location,
          formattedAddress: result.formatted_address
        };
      }
    } catch (error) {
      logger.error('MapMyIndia reverse geocoding error:', error);
    }

    return null;
  }

  private static async mapMyIndiaAutocomplete(input: string): Promise<AutocompleteResult[]> {
    if (!this.isConfigured('mapmyindia')) {
      logger.warn('MapMyIndia API not configured');
      return [];
    }

    // MapMyIndia Autosuggest API
    const url = 'https://atlas.mapmyindia.com/api/places/search/json';
    const params = {
      query: input,
      rest_key: config.MAPMYINDIA_API_KEY
    };

    try {
      const response = await axios.get(url, { params });
      
      if (response.data.suggestedLocations) {
        return response.data.suggestedLocations.map((suggestion: any) => ({
          placeId: suggestion.place_id || suggestion.eLoc,
          description: suggestion.placeName,
          mainText: suggestion.placeName,
          secondaryText: suggestion.placeAddress || ''
        }));
      }
    } catch (error) {
      logger.error('MapMyIndia autocomplete error:', error);
    }

    return [];
  }

  private static async mapMyIndiaPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.isConfigured('mapmyindia')) {
      logger.warn('MapMyIndia API not configured');
      return null;
    }

    // MapMyIndia Place Details API
    const url = 'https://atlas.mapmyindia.com/api/places/details/json';
    const params = {
      place_id: placeId,
      rest_key: config.MAPMYINDIA_API_KEY
    };

    try {
      const response = await axios.get(url, { params });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          placeId,
          name: result.placeName,
          address: result.placeAddress,
          location: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lng)
          }
        };
      }
    } catch (error) {
      logger.error('MapMyIndia place details error:', error);
    }

    return null;
  }

  private static async mapMyIndiaDirections(
    origin: LocationPoint | string,
    destination: LocationPoint | string,
    waypoints?: (LocationPoint | string)[]
  ): Promise<RouteResult | null> {
    if (!this.isConfigured('mapmyindia')) {
      logger.warn('MapMyIndia API not configured');
      return null;
    }

    // MapMyIndia Routing API
    const url = 'https://apis.mapmyindia.com/advancedmaps/v1/{rest_key}/route_adv/driving';
    const actualUrl = url.replace('{rest_key}', config.MAPMYINDIA_API_KEY!);
    
    const originStr = typeof origin === 'string' ? origin : `${origin.longitude},${origin.latitude}`;
    const destStr = typeof destination === 'string' ? destination : `${destination.longitude},${destination.latitude}`;
    
    const params: any = {
      start: originStr,
      destination: destStr
    };

    if (waypoints && waypoints.length > 0) {
      params.waypoints = waypoints.map(wp => 
        typeof wp === 'string' ? wp : `${wp.longitude},${wp.latitude}`
      ).join(';');
    }

    try {
      const response = await axios.get(actualUrl, { params });
      
      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        
        return {
          distance: route.distance * 1000, // Convert km to meters
          duration: route.duration,
          polyline: route.geometry || '',
          steps: route.legs?.[0]?.steps?.map((step: any) => ({
            instruction: step.maneuver?.instruction || '',
            distance: step.distance * 1000,
            duration: step.duration,
            startLocation: {
              latitude: step.intersections?.[0]?.location?.[1] || 0,
              longitude: step.intersections?.[0]?.location?.[0] || 0
            },
            endLocation: {
              latitude: step.intersections?.[step.intersections?.length - 1]?.location?.[1] || 0,
              longitude: step.intersections?.[step.intersections?.length - 1]?.location?.[0] || 0
            }
          })) || []
        };
      }
    } catch (error) {
      logger.error('MapMyIndia directions error:', error);
    }

    return null;
  }

  private static generateMapMyIndiaStaticMapUrl(
    center: LocationPoint,
    zoom: number,
    size: { width: number; height: number },
    markers?: Array<{ location: LocationPoint; label?: string; color?: string }>
  ): string {
    if (!this.isConfigured('mapmyindia')) {
      return '';
    }

    // MapMyIndia Static Maps API
    const baseUrl = 'https://apis.mapmyindia.com/advancedmaps/v1/{rest_key}/still_image';
    const actualUrl = baseUrl.replace('{rest_key}', config.MAPMYINDIA_API_KEY!);
    
    const params = new URLSearchParams({
      center: `${center.longitude},${center.latitude}`,
      zoom: zoom.toString(),
      size: `${size.width}x${size.height}`
    });

    if (markers) {
      const markerStr = markers.map(marker => 
        `${marker.location.longitude},${marker.location.latitude}`
      ).join('|');
      params.append('markers', markerStr);
    }

    return `${actualUrl}?${params.toString()}`;
  }

  /**
   * Test both map providers
   */
  static async testMapProviders(): Promise<{ google: boolean; mapmyindia: boolean }> {
    const results = { google: false, mapmyindia: false };

    // Test Google Maps
    if (this.isConfigured('google')) {
      try {
        this.setProvider('google');
        const testResult = await this.geocodeAddress('New Delhi, India');
        results.google = testResult !== null;
      } catch (error) {
        logger.error('Google Maps test failed:', error);
      }
    }

    // Test MapMyIndia
    if (this.isConfigured('mapmyindia')) {
      try {
        this.setProvider('mapmyindia');
        const testResult = await this.geocodeAddress('New Delhi, India');
        results.mapmyindia = testResult !== null;
      } catch (error) {
        logger.error('MapMyIndia test failed:', error);
      }
    }

    // Reset to default provider
    this.setProvider(config.DEFAULT_MAP_PROVIDER as 'google' | 'mapmyindia');

    return results;
  }
}