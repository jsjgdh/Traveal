import { config } from './src/config/environment.js';
import { connectDB } from './src/config/database.js';
import logger from './src/utils/logger.js';

console.log('Starting debug server...');
console.log('Config:', {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  DATABASE_URL: config.DATABASE_URL
});

connectDB().then(async (connected) => {
  console.log('Database connection result:', connected);
  
  if (connected) {
    console.log('Database connected, trying to import app...');
    
    try {
      const { app } = await import('./src/app.js');
      console.log('App imported successfully');
      
      const server = app.listen(config.PORT, () => {
        console.log(`🚀 Server running on port ${config.PORT}`);
      });
      
      // Handle graceful shutdown
      process.on('SIGTERM', () => {
        console.log('SIGTERM received. Shutting down...');
        server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      });
      
    } catch (error) {
      console.error('Error importing or starting app:', error);
    }
  } else {
    console.log('Failed to connect to database');
  }
}).catch((error) => {
  console.error('Error in connectDB:', error);
});