// MongoDB initialization script for Traveal
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization for Traveal...');

// Switch to traveal database
db = db.getSiblingDB('traveal');

// Create application user
db.createUser({
  user: 'traveal_app',
  pwd: 'traveal_app_password_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'traveal'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['uuid', 'deviceId', 'consentData', 'onboarded'],
      properties: {
        uuid: {
          bsonType: 'string',
          description: 'Unique user identifier'
        },
        deviceId: {
          bsonType: 'string',
          description: 'Device identifier'
        },
        consentData: {
          bsonType: 'object',
          description: 'User consent information'
        },
        preferences: {
          bsonType: 'object',
          description: 'User preferences'
        },
        onboarded: {
          bsonType: 'bool',
          description: 'Onboarding completion status'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

db.createCollection('trips', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'startLatitude', 'startLongitude', 'startTime'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'Reference to user'
        },
        startLatitude: {
          bsonType: 'double',
          minimum: -90,
          maximum: 90,
          description: 'Starting latitude'
        },
        startLongitude: {
          bsonType: 'double',
          minimum: -180,
          maximum: 180,
          description: 'Starting longitude'
        },
        endLatitude: {
          bsonType: ['double', 'null'],
          minimum: -90,
          maximum: 90,
          description: 'Ending latitude'
        },
        endLongitude: {
          bsonType: ['double', 'null'],
          minimum: -180,
          maximum: 180,
          description: 'Ending longitude'
        },
        startTime: {
          bsonType: 'date',
          description: 'Trip start time'
        },
        endTime: {
          bsonType: ['date', 'null'],
          description: 'Trip end time'
        },
        distance: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'Trip distance in meters'
        },
        mode: {
          bsonType: ['string', 'null'],
          enum: ['walking', 'cycling', 'driving', 'public_transport', 'other'],
          description: 'Transportation mode'
        },
        purpose: {
          bsonType: ['string', 'null'],
          enum: ['work', 'school', 'shopping', 'leisure', 'medical', 'social', 'other'],
          description: 'Trip purpose'
        },
        companions: {
          bsonType: ['int', 'null'],
          minimum: 0,
          description: 'Number of companions'
        },
        validated: {
          bsonType: 'bool',
          description: 'User validation status'
        },
        isActive: {
          bsonType: 'bool',
          description: 'Whether trip is currently active'
        }
      }
    }
  }
});

db.createCollection('locationPoints', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tripId', 'latitude', 'longitude', 'timestamp'],
      properties: {
        tripId: {
          bsonType: 'string',
          description: 'Reference to trip'
        },
        latitude: {
          bsonType: 'double',
          minimum: -90,
          maximum: 90,
          description: 'Location latitude'
        },
        longitude: {
          bsonType: 'double',
          minimum: -180,
          maximum: 180,
          description: 'Location longitude'
        },
        accuracy: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'GPS accuracy in meters'
        },
        speed: {
          bsonType: ['double', 'null'],
          minimum: 0,
          description: 'Speed in m/s'
        },
        altitude: {
          bsonType: ['double', 'null'],
          description: 'Altitude in meters'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Location timestamp'
        }
      }
    }
  }
});

db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'title', 'message'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'Reference to user'
        },
        type: {
          bsonType: 'string',
          enum: ['trip_validation', 'achievement', 'system', 'challenge'],
          description: 'Notification type'
        },
        title: {
          bsonType: 'string',
          maxLength: 100,
          description: 'Notification title'
        },
        message: {
          bsonType: 'string',
          maxLength: 500,
          description: 'Notification message'
        },
        data: {
          bsonType: ['object', 'null'],
          description: 'Additional notification data'
        },
        read: {
          bsonType: 'bool',
          description: 'Read status'
        },
        priority: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Notification priority'
        }
      }
    }
  }
});

db.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['eventType', 'timestamp'],
      properties: {
        userId: {
          bsonType: ['string', 'null'],
          description: 'Reference to user (can be null for anonymous events)'
        },
        eventType: {
          bsonType: 'string',
          maxLength: 100,
          description: 'Type of analytics event'
        },
        eventData: {
          bsonType: 'object',
          description: 'Event data payload'
        },
        sessionId: {
          bsonType: ['string', 'null'],
          description: 'Session identifier'
        },
        deviceInfo: {
          bsonType: ['object', 'null'],
          description: 'Device information'
        },
        location: {
          bsonType: ['object', 'null'],
          description: 'Location data (anonymized)'
        },
        anonymized: {
          bsonType: 'bool',
          description: 'Whether data is anonymized'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Event timestamp'
        }
      }
    }
  }
});

// Create indexes for performance
print('Creating indexes...');

// User indexes
db.users.createIndex({ 'uuid': 1 }, { unique: true });
db.users.createIndex({ 'deviceId': 1 }, { unique: true });
db.users.createIndex({ 'createdAt': 1 });

// Trip indexes
db.trips.createIndex({ 'userId': 1 });
db.trips.createIndex({ 'startTime': 1 });
db.trips.createIndex({ 'isActive': 1 });
db.trips.createIndex({ 'validated': 1 });
db.trips.createIndex({ 'mode': 1 });
db.trips.createIndex({ 'purpose': 1 });

// Location point indexes
db.locationPoints.createIndex({ 'tripId': 1 });
db.locationPoints.createIndex({ 'timestamp': 1 });

// Notification indexes
db.notifications.createIndex({ 'userId': 1 });
db.notifications.createIndex({ 'read': 1 });
db.notifications.createIndex({ 'type': 1 });
db.notifications.createIndex({ 'createdAt': 1 });

// Analytics indexes
db.analytics.createIndex({ 'userId': 1 });
db.analytics.createIndex({ 'eventType': 1 });
db.analytics.createIndex({ 'timestamp': 1 });
db.analytics.createIndex({ 'sessionId': 1 });

// TTL indexes for data retention
db.notifications.createIndex({ 'createdAt': 1 }, { expireAfterSeconds: 2592000 }); // 30 days
db.analytics.createIndex({ 'timestamp': 1 }, { expireAfterSeconds: 7776000 }); // 90 days

print('MongoDB initialization completed successfully!');