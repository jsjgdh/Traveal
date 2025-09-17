import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3010;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Simple test server is running'
  });
});

app.get('/status', (req, res) => {
  res.json({
    server: 'running',
    environment: 'test',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoints for testing
app.post('/api/v1/auth/register', (req, res) => {
  const { consentData } = req.body;
  const deviceId = req.headers['x-device-id'];
  
  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: 'Device ID required',
      code: 'DEVICE_ID_REQUIRED'
    });
  }
  
  if (!consentData || typeof consentData !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Valid consent data required',
      code: 'INVALID_CONSENT_DATA'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      userId: `user_${Date.now()}`,
      deviceId: deviceId,
      registeredAt: new Date().toISOString()
    }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const deviceId = req.headers['x-device-id'];
  
  if (!deviceId) {
    return res.status(400).json({
      success: false,
      message: 'Device ID required',
      code: 'DEVICE_ID_REQUIRED'
    });
  }
  
  // Simulate successful login
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: `user_${Date.now()}`,
        deviceId: deviceId,
        isAnonymous: true
      },
      tokens: {
        accessToken: `test_token_${Date.now()}`,
        refreshToken: `refresh_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }
    }
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }
  
  res.json({
    success: true,
    data: {
      user: {
        id: `user_${Date.now()}`,
        isAnonymous: true,
        createdAt: new Date().toISOString(),
        consentData: {
          locationData: { allowTracking: true, preciseLocation: true },
          sensorData: { motionSensors: true, activityDetection: true },
          usageAnalytics: { anonymousStats: true, crashReports: true }
        }
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
});