import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/environment.js';
import { connectDB, disconnectDB } from './config/database.js';
import { sendError } from './utils/helpers.js';
import logger from './utils/logger.js';
import { AnonymizationService } from './services/anonymizationService.js';

// Import routes
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import sosRoutes from './routes/sos.js';
import mapsRoutes from './routes/maps.js';
import tripPlannerRoutes from './routes/tripPlanner.js';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Device-ID',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// System status endpoint
app.get('/status', (_req: Request, res: Response) => {
  res.status(200).json({
    server: 'running',
    database: 'connected',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    features: {
      authentication: true,
      tripTracking: true,
      anonymization: true,
      notifications: true,
      analytics: true,
      maps: true,
      sosEmergency: true
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/trip-planner', tripPlannerRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/maps', mapsRoutes);

// API documentation redirect
app.get('/docs', (_req: Request, res: Response) => {
  res.redirect('/api/docs');
});

app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    title: 'Traveal Backend API',
    version: '1.0.0',
    description: 'REST API for the Traveal government travel data collection app',
    baseUrl: `${req.protocol}://${req.get('host')}/api/v1`,
    endpoints: {
      authentication: {
        'POST /auth/register': 'Register new anonymous user',
        'POST /auth/login': 'Login with device ID',
        'GET /auth/me': 'Get user profile',
        'PUT /auth/consent': 'Update user consent',
        'PUT /auth/preferences': 'Update user preferences',
        'POST /auth/refresh': 'Refresh access token',
        'DELETE /auth/account': 'Delete user account'
      },
      trips: {
        'POST /trips': 'Create new trip',
        'GET /trips': 'Get user trips',
        'GET /trips/:id': 'Get specific trip',
        'PUT /trips/:id': 'Update trip',
        'DELETE /trips/:id': 'Delete trip',
        'POST /trips/:id/locations': 'Add location point',
        'GET /trips/active': 'Get active trip',
        'GET /trips/stats': 'Get trip statistics'
      },
      analytics: {
        'POST /analytics/events': 'Log analytics event',
        'GET /analytics/summary': 'Get user summary',
        'GET /analytics/export': 'Export anonymized data'
      },
      maps: {
        'GET /maps/provider': 'Get current map provider',
        'POST /maps/provider': 'Set map provider (google/mapmyindia)',
        'GET /maps/geocode': 'Geocode address to coordinates',
        'GET /maps/reverse-geocode': 'Reverse geocode coordinates to address',
        'GET /maps/autocomplete': 'Get place autocomplete suggestions',
        'GET /maps/place-details': 'Get place details by ID',
        'POST /maps/route': 'Calculate route between points',
        'POST /maps/static-map': 'Generate static map URL',
        'GET /maps/config': 'Get map service configuration',
        'GET /maps/test-providers': 'Test map provider connectivity'
      }
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      deviceId: 'X-Device-ID: <device-id>'
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// Global error handler
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return sendError(res, error.message, 400);
  }

  if (error.name === 'UnauthorizedError') {
    return sendError(res, 'Unauthorized', 401);
  }

  if (error.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  // Default error response  
  const statusCode = error.statusCode || error.status || 500;
  const message = config.isProduction ? 'Internal server error' : error.message;

  return sendError(res, message, statusCode);
});

// Graceful shutdown handler
let server: any;

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await disconnectDB();
      logger.info('Database disconnected');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize anonymization service
    AnonymizationService.initialize();

    // Start HTTP server
    server = app.listen(config.PORT, () => {
      logger.info(`🚀 Server running on port ${config.PORT}`);
      logger.info(`📝 Environment: ${config.NODE_ENV}`);
      logger.info(`🏥 Health check: http://localhost:${config.PORT}/health`);
      logger.info(`📚 API docs: http://localhost:${config.PORT}/docs`);
    });

    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export for testing
export { app, server };

// Start server if not in test environment
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});