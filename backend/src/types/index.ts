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

// SOS Safety Feature Types
export interface SOSProfileData {
  id?: string;
  userId: string;
  fullPassword: string;
  partialPassword: string;
  biometricEnabled: boolean;
  emergencyContacts: EmergencyContact[];
  isEnabled: boolean;
  voiceLanguage: string;
  backgroundPermissions: boolean;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  priority: number;
  isActive: boolean;
}

export interface RouteMonitoringData {
  id?: string;
  userId: string;
  sosProfileId: string;
  tripId?: string;
  plannedRoute: LocationPoint[];
  currentRoute: LocationPoint[];
  deviationThreshold: number;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  destination: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  estimatedArrival?: Date;
  lastKnownLocation: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  deviationDetected: boolean;
}

export interface SOSAlertData {
  id?: string;
  userId: string;
  sosProfileId: string;
  routeMonitoringId?: string;
  alertType: 'route_deviation' | 'manual_trigger' | 'tamper_detection' | 'panic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'triggered' | 'grace_period' | 'confirmed' | 'false_alarm' | 'resolved';
  triggerLocation: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  deviationDistance?: number;
  gracePeriodEnd?: Date;
  voiceAlertPlayed: boolean;
  passwordAttempts: number;
  maxPasswordAttempts: number;
  isStealthMode: boolean;
  authoritiesNotified: boolean;
  contactsNotified: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  alertData?: Record<string, any>;
}

export interface SOSLogData {
  id?: string;
  sosAlertId: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface VoiceAlertData {
  messageText: string;
  language: string;
  localArea: string;
  isStealthMode: boolean;
}

export interface RouteDeviationCheck {
  currentLocation: LocationPoint;
  plannedRoute: LocationPoint[];
  deviationThreshold: number;
  isDeviated: boolean;
  deviationDistance?: number;
  suggestedAction: 'continue' | 'grace_period' | 'trigger_alert';
}