describe('Database Integration', () => {
  let authToken = '';
  let userId = '';
  
  before(() => {
    // Register a new user for testing
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/v1/auth/register',
      headers: {
        'X-Device-ID': 'cypress-test-device-' + Date.now()
      },
      body: {
        consentData: {
          locationData: {
            allowTracking: true,
            preciseLocation: true
          },
          sensorData: {
            motionSensors: true,
            activityDetection: true
          },
          usageAnalytics: {
            anonymousStats: true,
            crashReports: true
          }
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      userId = response.body.data.userId;
      
      // Login to get auth token
      cy.request({
        method: 'POST',
        url: 'http://localhost:3001/api/v1/auth/login',
        headers: {
          'X-Device-ID': 'cypress-test-device-' + Date.now()
        }
      }).then((loginResponse) => {
        expect(loginResponse.status).to.eq(200);
        authToken = loginResponse.body.data.tokens.accessToken;
      });
    });
  });

  it('creates and retrieves trips from database', () => {
    // Create a new trip
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/v1/trips',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        startLocation: {
          lat: 40.7128,
          lng: -74.0060
        },
        purpose: 'work',
        mode: 'car'
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.data.trip).to.have.property('id');
      expect(response.body.data.trip.startLocation.lat).to.eq(40.7128);
      expect(response.body.data.trip.purpose).to.eq('work');
      
      const tripId = response.body.data.trip.id;
      
      // Get the specific trip
      cy.request({
        method: 'GET',
        url: `http://localhost:3001/api/v1/trips/${tripId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((getResponse) => {
        expect(getResponse.status).to.eq(200);
        expect(getResponse.body.data.trip.id).to.eq(tripId);
        expect(getResponse.body.data.trip.startLocation.lat).to.eq(40.7128);
      });
      
      // Get user trips
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/trips',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((listResponse) => {
        expect(listResponse.status).to.eq(200);
        expect(listResponse.body.data.trips).to.be.an('array');
        expect(listResponse.body.data.trips.length).to.be.greaterThan(0);
      });
      
      // Get trip statistics
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/trips/stats',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((statsResponse) => {
        expect(statsResponse.status).to.eq(200);
        expect(statsResponse.body.data.stats).to.have.property('totalTrips');
        expect(statsResponse.body.data.stats).to.have.property('totalDistance');
      });
    });
  });

  it('logs and retrieves analytics events', () => {
    // Log an analytics event
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/v1/analytics/events',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        eventType: 'trip_start',
        eventData: {
          tripId: 'test-trip-123',
          location: { lat: 40.7128, lng: -74.0060 }
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('eventId');
      
      // Get user analytics summary
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/analytics/summary',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((summaryResponse) => {
        expect(summaryResponse.status).to.eq(200);
        expect(summaryResponse.body.data.analytics).to.have.property('totalEvents');
        expect(summaryResponse.body.data.analytics).to.have.property('eventTypes');
      });
    });
  });

  it('updates user profile and preferences', () => {
    // Update user preferences
    cy.request({
      method: 'PUT',
      url: 'http://localhost:3001/api/v1/auth/preferences',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        preferences: {
          notificationSettings: {
            tripValidation: true,
            achievements: true,
            system: true,
            pushEnabled: true
          },
          privacySettings: {
            dataRetentionDays: 180,
            shareAggregatedData: false
          },
          appSettings: {
            theme: 'dark',
            language: 'en',
            units: 'metric'
          }
        }
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      
      // Get user profile to verify updates
      cy.request({
        method: 'GET',
        url: 'http://localhost:3001/api/v1/auth/me',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((profileResponse) => {
        expect(profileResponse.status).to.eq(200);
        expect(profileResponse.body.data.user.preferences.appSettings.theme).to.eq('dark');
        expect(profileResponse.body.data.user.preferences.privacySettings.dataRetentionDays).to.eq(180);
      });
    });
  });

  it('handles authentication and authorization correctly', () => {
    // Test unauthorized access
    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/api/v1/auth/me',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
    
    // Test invalid token
    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/api/v1/auth/me',
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
    
    // Test valid token
    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/api/v1/auth/me',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.user).to.have.property('id');
    });
  });
});