export interface ConsentData {
  locationData: {
    allowTracking: boolean;
    preciseLocation: boolean;
  };
  sensorData: {
    motionSensors: boolean;
    activityDetection: boolean;
  };
  usageAnalytics: {
    anonymousStats: boolean;
    crashReports: boolean;
  };
}

export interface UserPreferences {
  notificationSettings: {
    tripValidation: boolean;
    achievements: boolean;
    system: boolean;
    pushEnabled: boolean;
  };
  privacySettings: {
    dataRetentionDays: number;
    shareAggregatedData: boolean;
  };
  appSettings: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    units: 'metric' | 'imperial';
  };
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
  timestamp: Date;
}

export interface TripData {
  id?: string;
  userId: string;
  startLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  startTime: Date;
  endTime?: Date;
  distance?: number;
  mode?: 'walking' | 'driving' | 'public_transport' | 'cycling';
  purpose?: 'work' | 'school' | 'shopping' | 'other';
  companions?: number;
  validated?: boolean;
  isActive?: boolean;
  route?: LocationPoint[];
}

export interface AnonymizedTripData {
  id: string;
  startLocation: {
    latitude: number;
    longitude: number;
  };
  endLocation: {
    latitude: number;
    longitude: number;
  };
  startTime: Date;
  endTime: Date;
  distance: number;
  mode: string;
  purpose: string;
  companions: number;
  weekday: number;
  hour: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface NotificationData {
  type: 'trip_validation' | 'achievement' | 'system' | 'challenge';
  title: string;
  message: string;
  data?: any;
  userId: string;
}

export interface AnalyticsEventData {
  eventType: string;
  eventData: Record<string, any>;
  userId?: string;
  anonymized?: boolean;
}