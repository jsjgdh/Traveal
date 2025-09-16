# Traveal Backend API Documentation

## Overview

The Traveal Backend API is a RESTful API built with Node.js, Express, and TypeScript. It provides secure, privacy-compliant endpoints for travel data collection, user management, and analytics for the government travel research project.

### Base URL
- Development: `http://localhost:3001/api/v1`
- Production: `https://your-domain.com/api/v1`

### Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Additionally, include your device ID in the X-Device-ID header:
```
X-Device-ID: <your-device-id>
```

## API Endpoints

### Health & Status

#### GET /health
Check server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

#### GET /status
Get detailed system status.

**Response:**
```json
{
  "server": "running",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "features": {
    "authentication": true,
    "tripTracking": true,
    "anonymization": true,
    "notifications": true,
    "analytics": true
  }
}
```

### Authentication Endpoints

#### POST /auth/register
Register a new anonymous user with device ID.

**Headers:**
- `X-Device-ID: <device-id>` (required)

**Request Body:**
```json
{
  "consentData": {
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
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "uuid": "anon_456",
      "onboarded": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 900
    }
  }
}
```

#### POST /auth/login
Login with existing device ID.

**Headers:**
- `X-Device-ID: <device-id>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "uuid": "anon_456",
      "onboarded": true
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 900
    }
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token",
    "expiresIn": 900
  }
}
```

#### GET /auth/me
Get current user profile.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "uuid": "anon_456",
      "onboarded": true,
      "consentData": { /* consent object */ },
      "preferences": { /* preferences object */ },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### PUT /auth/consent
Update user consent preferences.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "consentData": {
    "locationData": {
      "allowTracking": true,
      "preciseLocation": false
    },
    "sensorData": {
      "motionSensors": true,
      "activityDetection": false
    },
    "usageAnalytics": {
      "anonymousStats": true,
      "crashReports": true
    }
  }
}
```

#### PUT /auth/preferences
Update user preferences.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "preferences": {
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
}
```

#### DELETE /auth/account
Delete user account and all associated data (GDPR compliance).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "message": "Account and all associated data deleted successfully"
}
```

### Trip Management Endpoints

#### POST /trips
Create a new trip.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "startLocation": {
    "latitude": 9.9312,
    "longitude": 76.2673,
    "address": "Kochi, Kerala"
  },
  "startTime": "2024-01-15T10:30:00.000Z",
  "mode": "driving",
  "purpose": "work",
  "companions": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trip_123",
      "userId": "user_123",
      "startLocation": {
        "latitude": 9.9312,
        "longitude": 76.2673,
        "address": "Kochi, Kerala"
      },
      "startTime": "2024-01-15T10:30:00.000Z",
      "mode": "driving",
      "purpose": "work",
      "companions": 1,
      "isActive": true,
      "validated": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### GET /trips
Get user trips with pagination.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of trips per page (default: 10, max: 50)
- `mode` (optional): Filter by transportation mode
- `validated` (optional): Filter by validation status

**Response:**
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "trip_123",
        "startLocation": { /* location object */ },
        "endLocation": { /* location object */ },
        "startTime": "2024-01-15T10:30:00.000Z",
        "endTime": "2024-01-15T11:00:00.000Z",
        "distance": 15.5,
        "mode": "driving",
        "purpose": "work",
        "validated": true
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### GET /trips/active
Get currently active trip.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trip_123",
      "startLocation": { /* location object */ },
      "startTime": "2024-01-15T10:30:00.000Z",
      "mode": "driving",
      "isActive": true
    }
  }
}
```

#### GET /trips/stats
Get user trip statistics.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTrips": 25,
    "totalDistance": 487.5,
    "totalDuration": 1850,
    "averageDistance": 19.5,
    "mostCommonMode": "driving",
    "mostCommonPurpose": "work",
    "thisWeek": {
      "trips": 5,
      "distance": 85.2
    },
    "thisMonth": {
      "trips": 18,
      "distance": 324.8
    }
  }
}
```

#### GET /trips/:id
Get specific trip by ID.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trip_123",
      "startLocation": { /* location object */ },
      "endLocation": { /* location object */ },
      "startTime": "2024-01-15T10:30:00.000Z",
      "endTime": "2024-01-15T11:00:00.000Z",
      "distance": 15.5,
      "mode": "driving",
      "purpose": "work",
      "companions": 1,
      "validated": true,
      "route": [
        {
          "latitude": 9.9312,
          "longitude": 76.2673,
          "timestamp": "2024-01-15T10:30:00.000Z",
          "accuracy": 5.0,
          "speed": 45.5
        }
      ]
    }
  }
}
```

#### PUT /trips/:id
Update trip details.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "endLocation": {
    "latitude": 9.9816,
    "longitude": 76.2999,
    "address": "Ernakulam, Kerala"
  },
  "endTime": "2024-01-15T11:00:00.000Z",
  "distance": 15.5,
  "mode": "driving",
  "purpose": "work",
  "companions": 1
}
```

#### POST /trips/:id/end
End an active trip.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "endLocation": {
    "latitude": 9.9816,
    "longitude": 76.2999,
    "address": "Ernakulam, Kerala"
  },
  "endTime": "2024-01-15T11:00:00.000Z"
}
```

#### POST /trips/:id/locations
Add location point to trip route.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "latitude": 9.9550,
  "longitude": 76.2850,
  "accuracy": 5.0,
  "speed": 35.2,
  "altitude": 10.5,
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

#### POST /trips/:id/validate
Validate trip details for government compliance.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "validated": true,
  "validationNotes": "Trip verified by user"
}
```

#### DELETE /trips/:id
Delete a trip.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "message": "Trip deleted successfully"
}
```

### Analytics Endpoints

#### POST /analytics/events
Log analytics event.

**Headers:**
- `Authorization: Bearer <token>` (optional for anonymous events)

**Request Body:**
```json
{
  "eventType": "trip_completed",
  "eventData": {
    "duration": 1800,
    "distance": 15.5,
    "mode": "driving"
  },
  "anonymized": true
}
```

#### GET /analytics/summary
Get user analytics summary.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 125,
    "lastSevenDays": {
      "tripStarted": 5,
      "tripCompleted": 5,
      "achievementUnlocked": 2
    },
    "categories": {
      "trips": 45,
      "achievements": 12,
      "settings": 8
    }
  }
}
```

#### GET /analytics/export
Export anonymized user data (GDPR compliance).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "exportUrl": "https://api.example.com/exports/user_123_20240115.json",
    "expiresAt": "2024-01-16T10:30:00.000Z",
    "format": "json",
    "anonymized": true
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Codes
- `INVALID_DEVICE_ID` - Device ID is missing or invalid
- `USER_NOT_FOUND` - User not found
- `TRIP_NOT_FOUND` - Trip not found
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Auth endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per 15 minutes
- **Geolocation endpoints**: 300 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  uuid: string;           // Anonymous identifier
  deviceId?: string;      // Device identifier
  consentData: ConsentData;
  onboarded: boolean;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### Trip Model
```typescript
interface Trip {
  id: string;
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
  companions: number;
  validated: boolean;
  isActive: boolean;
  route?: LocationPoint[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Location Point Model
```typescript
interface LocationPoint {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
  timestamp: Date;
  createdAt: Date;
}
```

## Privacy & Security

### Data Anonymization
- All location data is automatically anonymized after 24 hours
- Personal identifiers are removed from analytics data
- IP addresses are not stored
- Device IDs are hashed for security

### Security Measures
- JWT tokens with short expiration times
- Refresh token rotation
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS protection
- Security headers (Helmet.js)

### GDPR Compliance
- Right to data deletion (`DELETE /auth/account`)
- Data export functionality (`GET /analytics/export`)
- Explicit consent management
- Data retention policies
- Anonymization procedures

## Testing

### Running Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Example Test Request
```javascript
// Using fetch
const response = await fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'X-Device-ID': 'your-device-id',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

## Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="sqlite:./prod.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Production Deployment
```bash
npm run build
npm start
```

For detailed deployment instructions, see the [Deployment Guide](./DEPLOYMENT.md).