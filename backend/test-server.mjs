console.log('Starting backend server...');

try {
  const { config } = await import('./src/config/environment.js');
  console.log('Config loaded:', config.NODE_ENV);
  
  const { app } = await import('./src/app.js');
  console.log('App imported successfully');
  
  app.listen(3001, () => {
    console.log('✅ Server running on port 3001');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
}