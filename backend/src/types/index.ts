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

// Trip Planner Feature Types
export interface TripPlan {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  destinations: TripDestination[];
  itinerary: ItineraryItem[];
  companions: TripCompanion[];
  contacts: EmergencyContact[];
  bookingOrganizer: BookingItem[];
  notes: string;
  packingList: PackingItem[];
  isShared: boolean;
  shareToken?: string;
  sharePermissions: SharePermission[];
  status: 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
  totalBudget?: number;
  actualSpent?: number;
  currency?: string;
  offlineData?: OfflineItineraryData;
  createdAt: Date;
  updatedAt: Date;
}

export interface TripDestination {
  id?: string;
  tripPlanId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  arrivalDate: Date;
  departureDate: Date;
  accommodation?: {
    name: string;
    address: string;
    checkIn: Date;
    checkOut: Date;
    bookingReference?: string;
  };
  order: number;
  notes?: string;
  isFromHiddenGems?: boolean;
  hiddenGemId?: string;
}

export interface ItineraryItem {
  id?: string;
  tripPlanId: string;
  destinationId?: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  title: string;
  description?: string;
  type: 'accommodation' | 'activity' | 'transportation' | 'meal' | 'meeting' | 'other';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
  };
  cost?: number;
  currency?: string;
  bookingReference?: string;
  confirmationNumber?: string;
  notes?: string;
  reminders: ReminderSettings[];
  isFromHiddenGems?: boolean;
  hiddenGemId?: string;
  order: number;
}

export interface TripCompanion {
  id?: string;
  tripPlanId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'organizer' | 'participant' | 'emergency_contact';
  permissions: 'view' | 'edit' | 'admin';
  inviteStatus: 'pending' | 'accepted' | 'declined';
  inviteToken?: string;
  joinedAt?: Date;
}

export interface BookingItem {
  id?: string;
  tripPlanId: string;
  type: 'flight' | 'hotel' | 'train' | 'bus' | 'car_rental' | 'activity' | 'other';
  title: string;
  bookingReference: string;
  confirmationNumber?: string;
  provider: string;
  cost?: number;
  currency?: string;
  bookingDate: Date;
  travelDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  receipts: ReceiptFile[];
  notes?: string;
  details: Record<string, any>;
}

export interface ReceiptFile {
  id?: string;
  bookingItemId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface PackingItem {
  id?: string;
  tripPlanId: string;
  category: 'clothing' | 'electronics' | 'documents' | 'toiletries' | 'medications' | 'other';
  item: string;
  quantity: number;
  isPacked: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  packedAt?: Date;
}

export interface ReminderSettings {
  id?: string;
  itineraryItemId: string;
  type: 'departure' | 'check_in' | 'reservation' | 'activity' | 'custom';
  timeBeforeEvent: number; // minutes
  isActive: boolean;
  notificationSent?: boolean;
  customMessage?: string;
}

export interface SharePermission {
  id?: string;
  tripPlanId: string;
  userId?: string;
  email?: string;
  phoneNumber?: string;
  permissions: 'view' | 'edit' | 'admin';
  inviteStatus: 'pending' | 'accepted' | 'declined';
  inviteToken?: string;
  sharedAt: Date;
  acceptedAt?: Date;
}

export interface OfflineItineraryData {
  id?: string;
  tripPlanId: string;
  data: Record<string, any>;
  lastSyncAt: Date;
  version: number;
  mapData?: {
    routes: any[];
    markers: any[];
    bounds: any;
  };
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'attraction' | 'transport' | 'other';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating?: number;
  priceLevel?: number;
  photos?: string[];
  reviews?: PlaceReview[];
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  openingHours?: any;
  isFromHiddenGems?: boolean;
  hiddenGemId?: string;
}

export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  date: Date;
}

export interface TripExportOptions {
  format: 'pdf' | 'image' | 'json' | 'ical';
  includeMap: boolean;
  includeBookings: boolean;
  includePackingList: boolean;
  includeNotes: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}