# 🚨 SOS Route Monitoring & Deviation Detection

## Overview

The **SOS Route Monitoring System** is an advanced safety feature that integrates **Maps API** with **Emergency Response** to detect when taxi drivers deviate from planned routes and automatically trigger safety alerts. This system is designed to enhance passenger safety during trips.

## 🔗 Maps API Integration

### Dual Provider Support
- **Google Maps API**: Primary provider with comprehensive global coverage
- **MapMyIndia API**: Regional provider optimized for Indian roads and addresses
- **Automatic Fallback**: Seamless switching between providers based on availability

### Route Calculation Features
- **Real-time Route Planning**: Calculate optimal routes using live traffic data
- **Multiple Route Options**: Compare different paths and select best route
- **Waypoint Support**: Handle multi-stop journeys
- **Route Optimization**: Consider traffic, tolls, and road conditions

## 🛡️ Route Deviation Detection

### How It Works

1. **Trip Initialization**
   ```typescript
   // Start route monitoring when trip begins
   const monitoring = await SOSService.startRouteMonitoring({
     userId: "user123",
     sosProfileId: "sos456",
     tripId: "trip789",
     plannedRoute: [], // Auto-calculated if empty
     deviationThreshold: 500, // 500 meters
     startTime: new Date(),
     destination: { latitude: 10.0261, longitude: 76.3125 },
     lastKnownLocation: { latitude: 9.9312, longitude: 76.2673 }
   });
   ```

2. **Maps API Route Calculation**
   ```typescript
   // If no planned route provided, calculate using Maps API
   const routeResult = await MapsService.calculateRoute(
     startLocation,  // Origin coordinates
     destination,    // Destination coordinates
     []             // Optional waypoints
   );
   ```

3. **Real-time Location Updates**
   ```typescript
   // Update location and check for deviation
   const deviationCheck = await SOSService.updateLocationAndCheckDeviation(
     monitoringId,
     currentLocation
   );
   ```

4. **Deviation Detection Algorithm**
   ```typescript
   // Enhanced algorithm considers:
   // - Distance to planned route points
   // - Distance to route segments (lines between points)
   // - Progressive escalation based on severity
   
   if (minDistance > threshold * 3) {
     suggestedAction = 'trigger_alert'; // Major deviation
   } else if (minDistance > threshold * 1.5) {
     suggestedAction = 'grace_period'; // Moderate deviation
   }
   ```

### Detection Thresholds

| Deviation Distance | Action | Description |
|-------------------|--------|-------------|
| < 500m | Continue | Normal route following |
| 500m - 750m | Grace Period | Minor deviation, 2-minute grace period |
| 750m - 1500m | Alert Warning | Moderate deviation, prepare for alert |
| > 1500m | Emergency Alert | Major deviation, trigger immediate alert |

## ⚡ Emergency Alert System

### Multi-Channel Notifications

1. **SMS Notifications** (via Twilio)
   ```typescript
   await SMSService.sendEmergencySMS(
     contact.phoneNumber,
     contact.name,
     triggerLocation,
     'route_deviation'
   );
   ```

2. **Email Alerts** (via SendGrid)
   ```typescript
   await EmailService.sendEmergencyEmail(
     contact.email,
     contact.name,
     triggerLocation,
     'route_deviation',
     alertDetails
   );
   ```

3. **Push Notifications**
   ```typescript
   await NotificationService.sendNotification(
     emergencyContactId,
     {
       type: 'system',
       title: '🚨 Emergency Alert',
       message: 'Someone in your emergency contacts needs assistance',
       data: { alertId, location, isEmergency: true }
     },
     'urgent'
   );
   ```

### Grace Period System

- **2-minute grace period** for moderate deviations
- **False alarm prevention** through user verification
- **Password verification** to cancel alerts:
  - **Full password**: Deactivates alert completely
  - **Partial password**: Activates stealth mode

### Stealth Mode

- **Discreet operation** when user is under duress
- **Silent notifications** to emergency contacts
- **Location tracking continues** without alerting the perpetrator
- **Authorities notified** through secure channels

## 🔧 Configuration

### API Keys Setup

Add these environment variables to your `.env` file:

```env
# Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
MAPMYINDIA_API_KEY=your_mapmyindia_api_key_here
MAPMYINDIA_CLIENT_ID=your_mapmyindia_client_id_here
DEFAULT_MAP_PROVIDER=google

# Maps Features
MAP_GEOCODING_ENABLED=true
MAP_ROUTING_ENABLED=true

# Emergency Services
SMS_SERVICE_API_KEY=your_twilio_api_key_here
EMAIL_SERVICE_API_KEY=your_sendgrid_api_key_here
EMERGENCY_PHONE_NUMBERS_DEFAULT=911
```

### SOS Profile Configuration

```typescript
const sosProfile = {
  userId: "user123",
  fullPassword: "emergency123",      // Deactivates alert
  partialPassword: "help",           // Activates stealth mode
  biometricEnabled: true,
  emergencyContacts: [
    {
      name: "Emergency Contact",
      phoneNumber: "+1234567890",
      email: "contact@example.com",
      relationship: "family",
      priority: 1,
      isActive: true
    }
  ],
  isEnabled: true,
  voiceLanguage: "en",
  backgroundPermissions: true
};
```

## 📊 Route Monitoring Dashboard

### Real-time Monitoring Data

```typescript
interface RouteMonitoringData {
  id: string;
  userId: string;
  tripId: string;
  plannedRoute: LocationPoint[];     // Calculated by Maps API
  currentRoute: LocationPoint[];     // Real-time location updates
  deviationThreshold: number;        // In meters
  isActive: boolean;
  startTime: Date;
  destination: LocationPoint;
  estimatedArrival: Date;           // From Maps API route calculation
  lastKnownLocation: LocationPoint;
  deviationDetected: boolean;
}
```

### Monitoring Metrics

- **Route Adherence**: Percentage of time on planned route
- **Deviation Events**: Number and severity of deviations
- **Response Time**: Time from detection to alert
- **False Alarm Rate**: Percentage of cancelled alerts
- **Emergency Response**: Active alert status and resolution

## 🔗 API Integration

### Start Route Monitoring
```bash
POST /api/v1/sos/monitoring/start
Content-Type: application/json

{
  "userId": "user123",
  "sosProfileId": "sos456",
  "tripId": "trip789",
  "deviationThreshold": 500,
  "destination": {
    "latitude": 10.0261,
    "longitude": 76.3125,
    "address": "Kochi, Kerala"
  },
  "lastKnownLocation": {
    "latitude": 9.9312,
    "longitude": 76.2673,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Update Location
```bash
POST /api/v1/sos/monitoring/update-location
Content-Type: application/json

{
  "monitoringId": "monitoring123",
  "currentLocation": {
    "latitude": 9.9350,
    "longitude": 76.2700,
    "timestamp": "2024-01-01T12:05:00Z"
  }
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "currentLocation": { "latitude": 9.9350, "longitude": 76.2700 },
    "isDeviated": false,
    "deviationDistance": 150,
    "suggestedAction": "continue",
    "deviationThreshold": 500
  }
}
```

## 🔒 Security & Privacy

### Data Protection
- **Location data encrypted** at rest and in transit
- **Automatic anonymization** after trip completion
- **Minimal data retention** - only essential for safety
- **GDPR compliant** with right to deletion

### Authentication
- **Device-based authentication** for anonymous users
- **Biometric verification** for SOS profile access
- **Multi-factor authentication** for emergency contacts
- **Secure password hashing** for emergency passwords

## 🚀 Deployment Notes

### Production Considerations

1. **API Rate Limits**
   - Google Maps: 40,000 requests/month free tier
   - MapMyIndia: Custom pricing for enterprise use
   - Implement caching for route calculations

2. **Scaling**
   - Use Redis for real-time location tracking
   - Implement WebSocket connections for live updates
   - Consider geospatial databases for large-scale deployment

3. **Monitoring**
   - Track API usage and costs
   - Monitor alert response times
   - Set up health checks for critical services

### Testing

```bash
# Run SOS service tests
cd backend
npm test -- --grep "SOSService"

# Test Maps API integration
npm test -- --grep "MapsService"

# Integration tests
npm test -- --grep "route monitoring"
```

## 📞 Emergency Protocols

### Alert Escalation

1. **Level 1**: Grace period notification to user
2. **Level 2**: Silent alert to emergency contacts
3. **Level 3**: Full emergency alert with location sharing
4. **Level 4**: Authorities notification (if configured)

### Contact Priority

Emergency contacts are notified in priority order:
1. **Primary contact** (usually family member)
2. **Secondary contact** (friend or colleague)
3. **Tertiary contact** (backup contact)
4. **Local authorities** (if enabled)

## 🛠️ Troubleshooting

### Common Issues

1. **Maps API not working**
   - Check API key configuration
   - Verify API quotas and billing
   - Test with both providers

2. **Route deviation false positives**
   - Adjust deviation threshold
   - Check GPS accuracy settings
   - Verify route calculation accuracy

3. **Emergency notifications not sending**
   - Verify SMS/Email service configuration
   - Check contact information validity
   - Test notification services

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
SOS_DEBUG=true
MAPS_DEBUG=true
```

---

**⚠️ Important**: This system is designed for safety and should be tested thoroughly before production deployment. Always have backup communication methods for emergency situations.

**Built for passenger safety and peace of mind** 🛡️