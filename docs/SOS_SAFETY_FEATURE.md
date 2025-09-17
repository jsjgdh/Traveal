# SOS Safety Feature Documentation

## Overview

The **SOS Safety Feature** is a comprehensive emergency safety system designed to protect passengers during cab travel by detecting route deviations and triggering emergency protocols. The system provides multi-layered security with voice alerts, password protection, and emergency contact notifications.

## Key Features

### 🚨 Core Safety Features
- **Route Deviation Detection**: Monitors GPS location and detects when the vehicle deviates from the expected route
- **Emergency Alerts**: Automatic voice alerts in multiple languages when deviation is detected
- **Password Protection**: Two-level password system (full disable and stealth mode)
- **Emergency Contacts**: Automatic notification to pre-configured emergency contacts
- **Background Monitoring**: Continuous GPS monitoring even when app is in background
- **Tamper Detection**: Detects attempts to disable location services or close the app

### 🔒 Security Levels
1. **Full Password**: Completely stops the SOS alert and monitoring
2. **Partial Password (Stealth Mode)**: Silences alerts but continues monitoring and notifying emergency contacts
3. **No Password**: Full emergency protocol activation

### 🌍 Multi-Language Support
- English
- Spanish
- French
- German
- Hindi
- Malayalam (local language support)

## User Interface Components

### 1. SOS Manager (`/sos`)
Main interface for SOS functionality with:
- Real-time location tracking
- Route status monitoring
- Emergency alert controls
- Quick access to settings

### 2. SOS Settings (`/sos/settings`)
Comprehensive configuration interface:
- Emergency contacts management
- Password setup (full and partial)
- Voice alert language selection
- Biometric authentication settings
- Background permissions configuration

### 3. Voice Alert Test (`/sos/test`)
Testing interface for:
- Voice alert playback testing
- Language selection validation
- Audio output verification

### 4. Permission Setup (`/sos/permissions`)
Guided flow for setting up:
- Location permissions (always allow)
- Notification permissions
- Background app refresh
- Battery optimization exclusions

## Technical Architecture

### Backend Components

#### Database Schema
```sql
-- SOS Profile for user configuration
model SOSProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  fullPassword          String   // Encrypted - stops alarm entirely
  partialPassword       String   // Encrypted - silences alarm but continues monitoring
  emergencyContacts     Json     // Array of emergency contacts
  voiceLanguage         String   @default("en")
  biometricEnabled      Boolean  @default(false)
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

-- Route monitoring for active trips
model RouteMonitoring {
  id                    String   @id @default(cuid())
  tripId                String   @unique
  expectedRoute         Json     // Array of lat/lng points
  deviationThreshold    Float    @default(500) // meters
  isActive              Boolean  @default(true)
  alertTriggered        Boolean  @default(false)
  createdAt             DateTime @default(now())
}

-- SOS alerts and incidents
model SOSAlert {
  id                    String   @id @default(cuid())
  userId                String
  tripId                String
  alertType             String   // "route_deviation", "manual_trigger", "tamper_detected"
  location              Json     // Current lat/lng
  deviationDistance     Float?   // Distance from expected route
  passwordAttempts      Int      @default(0)
  isResolved            Boolean  @default(false)
  resolvedAt            DateTime?
  createdAt             DateTime @default(now())
}
```

#### API Endpoints

**SOS Profile Management:**
- `POST /api/v1/sos/profile` - Create/update SOS profile
- `GET /api/v1/sos/profile` - Get user's SOS profile
- `POST /api/v1/sos/verify-password` - Verify SOS password

**Route Monitoring:**
- `POST /api/v1/sos/start-monitoring` - Start route monitoring for a trip
- `POST /api/v1/sos/update-location` - Update current location
- `POST /api/v1/sos/stop-monitoring` - Stop route monitoring

**Emergency Alerts:**
- `POST /api/v1/sos/trigger-alert` - Manually trigger SOS alert
- `GET /api/v1/sos/alerts` - Get user's SOS alerts
- `POST /api/v1/sos/resolve-alert` - Resolve an active alert

### Frontend Components

#### Core Services

**SOS Service (`/src/services/sosService.js`)**
- Route deviation detection algorithms
- Password verification
- Emergency contact notifications
- Alert escalation logic

**Voice Alert Service (`/src/services/voiceAlertService.js`)**
- Multi-language voice synthesis
- Audio playback management
- Voice testing functionality

**Background Service Manager (`/src/services/backgroundServiceManager.js`)**
- GPS monitoring in background
- Permission management
- Battery optimization handling
- Service worker registration

#### React Components

**SOSManager.jsx**
- Main SOS interface
- Real-time location display
- Emergency controls
- Status monitoring

**SOSSettings.jsx**
- Configuration interface
- Emergency contacts management
- Password setup
- Language preferences

**SOSEmergencyAlert.jsx**
- Emergency alert modal
- Voice playback controls
- Password input interface
- Countdown timer

## Usage Workflow

### Initial Setup
1. **Access SOS Settings**: Navigate to Settings → SOS Safety
2. **Set Up Passwords**: 
   - Configure full password (stops all alerts)
   - Configure partial password (stealth mode)
3. **Add Emergency Contacts**: Add at least 2 emergency contacts
4. **Grant Permissions**: Allow location, notifications, and background access
5. **Test Voice Alerts**: Verify audio output and language preferences

### During Trip Monitoring
1. **Start Monitoring**: SOS automatically activates when trip begins
2. **Route Tracking**: System monitors GPS location against expected route
3. **Deviation Detection**: Alert triggered if deviation exceeds threshold (500m default)
4. **Emergency Protocol**:
   - Voice alert plays repeatedly
   - 30-second countdown to enter password
   - Emergency contacts notified if no password entered
   - Background monitoring continues even in stealth mode

### Emergency Response
1. **Alert Triggered**: Voice plays "EMERGENCY: Route deviation detected"
2. **Password Options**:
   - **Full Password**: Stops all alerts and monitoring
   - **Partial Password**: Silences alerts but continues background monitoring
   - **No Password**: Full emergency protocol activation
3. **Contact Notification**: Emergency contacts receive location and alert details
4. **Escalation**: Alerts continue until resolved or emergency services contacted

## Security Considerations

### Password Security
- All passwords are encrypted using bcrypt with salt rounds
- Passwords are never stored in plain text
- Failed password attempts are logged and rate-limited

### Location Privacy
- Location data is encrypted in transit
- Precise coordinates are only shared during active emergencies
- Historical location data follows user consent preferences

### Emergency Contact Protection
- Contact information is encrypted at rest
- Contacts only receive notifications during genuine emergencies
- Users control what information is shared

## Configuration Options

### SOS Profile Settings
```javascript
{
  fullPassword: "encrypted_password",
  partialPassword: "encrypted_password", 
  emergencyContacts: [
    {
      name: "Emergency Contact 1",
      phone: "+1234567890",
      email: "contact@example.com",
      relationship: "family"
    }
  ],
  voiceLanguage: "en",
  biometricEnabled: true,
  alertSettings: {
    deviationThreshold: 500, // meters
    alertDelay: 30, // seconds
    voiceRepeatInterval: 10, // seconds
    maxPasswordAttempts: 3
  }
}
```

### Route Monitoring Settings
```javascript
{
  expectedRoute: [
    { lat: 10.0267, lng: 76.3105 }, // Start point
    { lat: 10.0157, lng: 76.2986 }, // Waypoint
    { lat: 10.0089, lng: 76.2831 }  // End point
  ],
  deviationThreshold: 500, // meters
  checkInterval: 10000, // milliseconds
  graceDistance: 200 // meters before triggering
}
```

## Testing and Validation

### Manual Testing
1. **Route Deviation Simulation**: Test with simulated GPS coordinates
2. **Password Verification**: Test both full and partial passwords
3. **Voice Alert Testing**: Verify all supported languages
4. **Emergency Contact Notification**: Test contact notification flow
5. **Background Monitoring**: Test app backgrounding and location updates

### Automated Testing
- Unit tests for route deviation algorithms
- Integration tests for emergency workflows
- End-to-end tests for complete user journeys
- Performance tests for battery impact

## Troubleshooting

### Common Issues

**Location Not Updating**
- Check location permissions (should be "Always")
- Verify GPS signal strength
- Ensure battery optimization is disabled for the app

**Voice Alerts Not Playing**
- Check device volume settings
- Verify browser audio permissions
- Test with different languages in settings

**Emergency Contacts Not Notified**
- Verify contact information is correct
- Check network connectivity
- Ensure app has notification permissions

**Background Monitoring Stopped**
- Check battery optimization settings
- Verify background app refresh is enabled
- Restart the monitoring service

### Error Codes
- `SOS_001`: Location permission denied
- `SOS_002`: Invalid route configuration
- `SOS_003`: Emergency contact notification failed
- `SOS_004`: Password verification failed
- `SOS_005`: Voice synthesis not supported

## Privacy and Compliance

### Data Handling
- Location data is processed locally when possible
- Emergency data is encrypted in transit and at rest
- User has full control over data sharing preferences
- Automatic data deletion after configurable retention period

### GDPR Compliance
- Right to data portability
- Right to erasure (delete account)
- Data processing consent management
- Transparent data usage policies

## Future Enhancements

### Planned Features
- **AI-Powered Route Prediction**: Machine learning for better route deviation detection
- **Integration with Emergency Services**: Direct connection to local emergency response
- **Family Tracking**: Real-time location sharing with family members
- **Offline Emergency Mode**: Emergency functionality when network is unavailable
- **Advanced Biometrics**: Face recognition and voice authentication
- **Panic Button**: Physical button integration for emergency activation

### Technical Improvements
- Enhanced battery optimization
- Improved location accuracy
- Faster alert response times
- Better offline functionality
- Advanced encryption methods

## Support and Contact

For technical support or feature requests related to the SOS Safety Feature:

- **Technical Documentation**: `/docs/technical/sos-api.md`
- **User Guide**: Available in-app under Settings → Help → SOS Safety
- **Emergency**: In case of actual emergency, contact local emergency services immediately

---

*This documentation is maintained by the Traveal development team and updated with each feature release.*