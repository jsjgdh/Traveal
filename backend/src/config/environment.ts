import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  MONGODB_URI: process.env.MONGODB_URI,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Redis Configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Push Notifications
  FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,
  VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
  
  // SMS/Email Notifications
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@traveal.app',
  
  // Emergency Services
  EMERGENCY_PHONE_NUMBERS: {
    IN: '112', // India
    US: '911', // United States
    UK: '999', // United Kingdom
    EU: '112', // European Union
    DEFAULT: '112'
  },
  
  // Map Services Configuration
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_PLACES_API_KEY: process.env.GOOGLE_MAPS_PLACES_API_KEY,
  MAPMYINDIA_API_KEY: process.env.MAPMYINDIA_API_KEY,
  MAPMYINDIA_CLIENT_ID: process.env.MAPMYINDIA_CLIENT_ID,
  MAPMYINDIA_CLIENT_SECRET: process.env.MAPMYINDIA_CLIENT_SECRET,
  
  // Map Service Settings
  DEFAULT_MAP_PROVIDER: process.env.DEFAULT_MAP_PROVIDER || 'google', // 'google' or 'mapmyindia'
  MAP_GEOCODING_ENABLED: process.env.MAP_GEOCODING_ENABLED === 'true',
  MAP_ROUTING_ENABLED: process.env.MAP_ROUTING_ENABLED === 'true',
  
  // Security Configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'fallback-encryption-key-change-in-production',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
  
  // Trip Detection Configuration
  TRIP_MIN_DISTANCE: parseFloat(process.env.TRIP_MIN_DISTANCE || '50'),
  TRIP_MIN_DURATION: parseInt(process.env.TRIP_MIN_DURATION || '300', 10),
  LOCATION_ACCURACY_THRESHOLD: parseFloat(process.env.LOCATION_ACCURACY_THRESHOLD || '100'),
  
  // Data Anonymization
  ANONYMIZATION_RADIUS: parseFloat(process.env.ANONYMIZATION_RADIUS || '100'),
  TIME_ROUNDING_MINUTES: parseInt(process.env.TIME_ROUNDING_MINUTES || '60', 10),
  
  // Environment Checks
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validation
if (!config.JWT_SECRET || config.JWT_SECRET === 'fallback-jwt-secret') {
  if (config.isProduction) {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('⚠️  Using fallback JWT_SECRET. Set JWT_SECRET in production!');
}

if (!config.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET === 'fallback-refresh-secret') {
  if (config.isProduction) {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
  console.warn('⚠️  Using fallback JWT_REFRESH_SECRET. Set JWT_REFRESH_SECRET in production!');
}