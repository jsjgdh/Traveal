# Database Schema Documentation

## Overview

The Traveal application uses SQLite for development and is designed to be easily migrated to MongoDB for production. The database schema is managed using Prisma ORM, which provides type-safe database access and migration capabilities.

## Database Configuration

### Development (SQLite)
```env
DATABASE_URL="file:./dev.db"
```

### Production (MongoDB - Migration Ready)
```env
DATABASE_URL="mongodb://username:password@localhost:27017/traveal"
```

## Schema Overview

The database consists of 6 main entities designed to support government-grade travel data collection while maintaining user privacy and GDPR compliance.

```mermaid
erDiagram
    User ||--o{ Trip : has
    User ||--o{ Notification : receives
    User ||--o{ AnalyticsEvent : generates
    Trip ||--o{ LocationPoint : contains
    
    User {
        string id PK
        string uuid UK "Anonymous identifier"
        string deviceId UK "Device identifier"
        string consentData "JSON: Privacy consent"
        boolean onboarded
        string preferences "JSON: User preferences"
        datetime createdAt
        datetime updatedAt
    }
    
    Trip {
        string id PK
        string userId FK
        float startLatitude
        float startLongitude
        float endLatitude
        float endLongitude
        string startAddress
        string endAddress
        datetime startTime
        datetime endTime
        float distance
        string mode "walking|driving|public_transport|cycling"
        string purpose "work|school|shopping|other"
        int companions
        boolean validated
        boolean isActive
        string anonymizedData "JSON: Anonymized trip data"
        datetime createdAt
        datetime updatedAt
    }
    
    LocationPoint {
        string id PK
        string tripId FK
        float latitude
        float longitude
        float accuracy
        float speed
        float altitude
        datetime timestamp
        datetime createdAt
    }
    
    Notification {
        string id PK
        string userId FK
        string type "trip_validation|achievement|system"
        string title
        string message
        string data "JSON: Additional data"
        boolean read
        datetime createdAt
    }
    
    AnalyticsEvent {
        string id PK
        string userId FK
        string eventType
        string eventData "JSON: Event data"
        boolean anonymized
        datetime createdAt
    }
    
    AppConfig {
        string id PK
        string key UK
        string value "JSON: Configuration value"
        datetime updatedAt
    }
```

## Detailed Schema

### Users Table (`users`)

Stores anonymous user data with privacy-compliant design.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique user identifier |
| `uuid` | String | Unique, Required | Anonymous user identifier for external references |
| `deviceId` | String | Unique, Optional | Device-specific identifier |
| `consentData` | String | Required | JSON string containing privacy consent settings |
| `onboarded` | Boolean | Default: false | Whether user completed onboarding process |
| `preferences` | String | Optional | JSON string containing user preferences |
| `createdAt` | DateTime | Auto-generated | Account creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Consent Data Structure:**
```json
{
  "locationData": {
    "allowTracking": true,
    "preciseLocation": true
  },
  "sensorData": {
    "motionSensors": true,
    "activityDetection": true
  },
  "usageAnalytics": {
    "anonymousStats": true,
    "crashReports": true
  }
}
```

**Preferences Structure:**
```json
{
  "notificationSettings": {
    "tripValidation": true,
    "achievements": true,
    "system": false,
    "pushEnabled": true
  },
  "privacySettings": {
    "dataRetentionDays": 90,
    "shareAggregatedData": true
  },
  "appSettings": {
    "theme": "dark",
    "language": "en",
    "units": "metric"
  }
}
```

### Trips Table (`trips`)

Stores trip data for government transportation research.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique trip identifier |
| `userId` | String | Foreign Key → users.id, Cascade Delete | Trip owner |
| `startLatitude` | Float | Required | Trip start latitude coordinate |
| `startLongitude` | Float | Required | Trip start longitude coordinate |
| `endLatitude` | Float | Optional | Trip end latitude coordinate |
| `endLongitude` | Float | Optional | Trip end longitude coordinate |
| `startAddress` | String | Optional | Human-readable start address |
| `endAddress` | String | Optional | Human-readable end address |
| `startTime` | DateTime | Required | Trip start timestamp |
| `endTime` | DateTime | Optional | Trip end timestamp |
| `distance` | Float | Optional | Trip distance in kilometers |
| `mode` | String | Optional | Transportation mode (enum) |
| `purpose` | String | Optional | Trip purpose (enum) |
| `companions` | Integer | Default: 0 | Number of trip companions |
| `validated` | Boolean | Default: false | User validation status |
| `isActive` | Boolean | Default: false | Whether trip is currently active |
| `anonymizedData` | String | Optional | JSON string of anonymized trip data |
| `createdAt` | DateTime | Auto-generated | Trip creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Transportation Modes:**
- `walking` - Walking or hiking
- `driving` - Personal vehicle
- `public_transport` - Bus, train, metro
- `cycling` - Bicycle or e-bike

**Trip Purposes:**
- `work` - Work-related travel
- `school` - Educational travel
- `shopping` - Shopping or errands
- `other` - Other purposes

### Location Points Table (`location_points`)

Stores GPS tracking points for trip routes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique location point identifier |
| `tripId` | String | Foreign Key → trips.id, Cascade Delete | Associated trip |
| `latitude` | Float | Required | GPS latitude coordinate |
| `longitude` | Float | Required | GPS longitude coordinate |
| `accuracy` | Float | Optional | GPS accuracy in meters |
| `speed` | Float | Optional | Speed in km/h at this point |
| `altitude` | Float | Optional | Altitude in meters |
| `timestamp` | DateTime | Required | Location capture timestamp |
| `createdAt` | DateTime | Auto-generated | Record creation timestamp |

### Notifications Table (`notifications`)

Stores user notifications and system messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique notification identifier |
| `userId` | String | Foreign Key → users.id, Cascade Delete | Notification recipient |
| `type` | String | Required | Notification type (enum) |
| `title` | String | Required | Notification title |
| `message` | String | Required | Notification message content |
| `data` | String | Optional | JSON string with additional data |
| `read` | Boolean | Default: false | Read status |
| `createdAt` | DateTime | Auto-generated | Notification creation timestamp |

**Notification Types:**
- `trip_validation` - Trip validation requests
- `achievement` - Achievement unlocks
- `system` - System messages and updates
- `challenge` - Weekly challenges

### Analytics Events Table (`analytics_events`)

Stores anonymized analytics and usage data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique event identifier |
| `userId` | String | Foreign Key → users.id, Set Null | Event source user (optional) |
| `eventType` | String | Required | Type of analytics event |
| `eventData` | String | Required | JSON string containing event data |
| `anonymized` | Boolean | Default: true | Whether event data is anonymized |
| `createdAt` | DateTime | Auto-generated | Event timestamp |

**Common Event Types:**
- `trip_started` - Trip initiation
- `trip_completed` - Trip completion
- `achievement_unlocked` - Achievement earned
- `settings_changed` - Settings modification
- `app_opened` - Application launch
- `feature_used` - Feature interaction

### App Configuration Table (`app_config`)

Stores application-wide configuration settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String | Primary Key, CUID | Unique configuration identifier |
| `key` | String | Unique, Required | Configuration key |
| `value` | String | Required | JSON string containing configuration value |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

## Data Relationships

### User → Trips (One-to-Many)
- One user can have multiple trips
- Trips are deleted when user is deleted (CASCADE)
- Foreign key: `trips.userId → users.id`

### Trip → Location Points (One-to-Many)
- One trip can have multiple GPS tracking points
- Location points are deleted when trip is deleted (CASCADE)
- Foreign key: `location_points.tripId → trips.id`

### User → Notifications (One-to-Many)
- One user can receive multiple notifications
- Notifications are deleted when user is deleted (CASCADE)
- Foreign key: `notifications.userId → users.id`

### User → Analytics Events (One-to-Many)
- One user can generate multiple analytics events
- User reference is set to NULL when user is deleted (SET NULL)
- Foreign key: `analytics_events.userId → users.id`

## Indexes and Performance

### Recommended Indexes

```sql
-- User lookup by device ID
CREATE INDEX idx_users_device_id ON users(deviceId);

-- Trip queries by user
CREATE INDEX idx_trips_user_id ON trips(userId);
CREATE INDEX idx_trips_user_active ON trips(userId, isActive);
CREATE INDEX idx_trips_created_at ON trips(createdAt);

-- Location point queries
CREATE INDEX idx_location_points_trip_id ON location_points(tripId);
CREATE INDEX idx_location_points_timestamp ON location_points(timestamp);

-- Notification queries
CREATE INDEX idx_notifications_user_id ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(userId, read);

-- Analytics queries
CREATE INDEX idx_analytics_events_user_id ON analytics_events(userId);
CREATE INDEX idx_analytics_events_type ON analytics_events(eventType);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(createdAt);

-- App config lookup
CREATE INDEX idx_app_config_key ON app_config(key);
```

### Query Performance Considerations

1. **Trip Queries**: Always filter by `userId` first
2. **Location Points**: Use timestamp ranges for route queries
3. **Analytics**: Partition by date for large datasets
4. **Notifications**: Index on `(userId, read)` for unread count queries

## Data Privacy and GDPR Compliance

### Privacy Features

1. **Anonymous Identifiers**: Users have both internal `id` and public `uuid`
2. **Consent Management**: Explicit consent storage and validation
3. **Data Anonymization**: Automatic anonymization after retention period
4. **Soft References**: Analytics events use nullable user references

### Data Retention Policy

```typescript
// Implemented in AnonymizationService
const RETENTION_POLICIES = {
  locationPoints: 30,      // Days before anonymization
  tripDetails: 90,         // Days before detailed data removal
  analyticsEvents: 365,    // Days before event anonymization
  notifications: 30        // Days before notification cleanup
};
```

### GDPR Compliance Features

1. **Right to be Forgotten**: Complete user data deletion
2. **Data Portability**: Export functionality for user data
3. **Consent Management**: Granular privacy controls
4. **Data Minimization**: Only collect necessary data
5. **Purpose Limitation**: Data used only for stated purposes

## Database Operations

### Common Queries

#### Get User with Trips
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    trips: {
      orderBy: { createdAt: 'desc' },
      take: 10
    }
  }
});
```

#### Get Trip with Route
```typescript
const trip = await prisma.trip.findUnique({
  where: { id: tripId },
  include: {
    locationPoints: {
      orderBy: { timestamp: 'asc' }
    }
  }
});
```

#### Create Trip with Validation
```typescript
const trip = await prisma.trip.create({
  data: {
    userId,
    startLatitude,
    startLongitude,
    startTime: new Date(),
    mode,
    purpose,
    companions,
    isActive: true
  }
});
```

#### Analytics Event Aggregation
```typescript
const eventCounts = await prisma.analyticsEvent.groupBy({
  by: ['eventType'],
  where: {
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    }
  },
  _count: {
    id: true
  }
});
```

## Migration and Maintenance

### Database Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Apply schema changes to database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name "add_new_feature"

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Backup and Recovery

#### SQLite Backup
```bash
# Create backup
cp dev.db dev_backup_$(date +%Y%m%d).db

# Restore from backup
cp dev_backup_20240115.db dev.db
```

#### MongoDB Migration (Production)
```bash
# Export from SQLite
node scripts/export-sqlite-data.js > data.json

# Import to MongoDB
mongoimport --db traveal --collection users data.json
```

### Data Cleanup and Maintenance

#### Anonymization Script
```typescript
// Run daily via cron job
async function anonymizeOldData() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  // Anonymize location points
  await prisma.locationPoint.updateMany({
    where: {
      createdAt: { lt: cutoffDate }
    },
    data: {
      latitude: Math.floor(Math.random() * 180 - 90),
      longitude: Math.floor(Math.random() * 360 - 180)
    }
  });
}
```

## Troubleshooting

### Common Issues

#### Connection Problems
```bash
# Check database file permissions
ls -la backend/prisma/dev.db

# Verify DATABASE_URL
echo $DATABASE_URL
```

#### Schema Sync Issues
```bash
# Reset and regenerate
npx prisma migrate reset
npx prisma generate
npx prisma db push
```

#### Performance Issues
```bash
# Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM trips WHERE userId = ?;

# Check database size
du -h backend/prisma/dev.db
```

For more database-related documentation, see:
- [API Documentation](./API.md) for endpoint schemas
- [Deployment Guide](./DEPLOYMENT.md) for production database setup
- [Testing Guide](./TESTING.md) for database testing strategies