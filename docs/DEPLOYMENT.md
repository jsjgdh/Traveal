# Deployment and Setup Guide

## Overview

This guide covers the complete deployment process for the Traveal application, from development setup to production deployment. The application consists of a React frontend and Node.js backend with SQLite (development) and MongoDB (production) database options.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Local Development](#local-development)
6. [Production Deployment](#production-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Environment Variables](#environment-variables)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (or yarn as alternative)
- **Git**: For version control
- **Docker** (optional): For containerized deployment

### Development Tools
- **Code Editor**: VS Code, WebStorm, or similar
- **Database Client**: DB Browser for SQLite, MongoDB Compass
- **API Testing**: Postman, Insomnia, or Thunder Client

### Verification Commands
```bash
# Check Node.js version
node --version  # Should be v18.x.x or higher

# Check npm version
npm --version   # Should be 8.x.x or higher

# Check Git installation
git --version

# Check Docker (if using)
docker --version
docker-compose --version
```

## Development Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/your-organization/traveal.git
cd traveal

# Or if using SSH
git clone git@github.com:your-organization/traveal.git
cd traveal
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
# Install frontend dependencies
npm install

# Verify installation
npm list --depth=0
```

#### Backend Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Return to root directory
cd ..
```

### 3. Verify Installation
```bash
# Check if all packages are installed correctly
npm run check-deps  # Custom script to verify dependencies

# Alternative manual check
ls node_modules     # Should contain packages
ls backend/node_modules  # Should contain backend packages
```

## Environment Configuration

### Frontend Environment Variables

Create `.env` file in the root directory:
```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=Traveal
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Optional: Analytics and monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Backend Environment Variables

Create `.env` file in the `backend` directory:
```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Privacy and Anonymization
ANONYMIZATION_RADIUS=100
TIME_ROUNDING_MINUTES=60
DATA_RETENTION_DAYS=90

# Optional: External Services
# REDIS_URL=redis://localhost:6379
# SENDGRID_API_KEY=your-sendgrid-key
# FCM_SERVER_KEY=your-firebase-server-key
```

### Environment Variable Security

#### Generate Secure Secrets
```bash
# Generate JWT secrets (Linux/macOS)
openssl rand -base64 64

# Generate JWT secrets (Windows)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Or use online generator (ensure HTTPS)
# https://generate-secret.vercel.app/64
```

#### Environment File Templates
```bash
# Copy example files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit with your values
nano .env
nano backend/.env
```

## Database Setup

### SQLite (Development)

#### Initialize Database
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Create database and apply schema
npx prisma db push

# Optional: Seed with sample data
npm run db:seed

# Verify database creation
ls -la prisma/dev.db
```

#### Database Management Commands
```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Create migration
npx prisma migrate dev --name "your-migration-name"

# Apply pending migrations
npx prisma migrate deploy
```

### MongoDB (Production)

#### Setup MongoDB
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Install MongoDB (macOS with Homebrew)
brew install mongodb/brew/mongodb-community

# Start MongoDB service
sudo systemctl start mongodb

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Configure for Production
```env
# Update backend/.env for production
DATABASE_URL="mongodb://username:password@localhost:27017/traveal"

# Or for MongoDB Atlas (cloud)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/traveal"
```

#### Migration from SQLite to MongoDB
```bash
# Export data from SQLite
cd backend
node scripts/export-sqlite-data.js > data-export.json

# Import to MongoDB
mongoimport --db traveal --collection users --file data-export-users.json
mongoimport --db traveal --collection trips --file data-export-trips.json
```

## Local Development

### Start Development Servers

#### Option 1: Manual Start (Recommended for debugging)
```bash
# Terminal 1: Backend server
cd backend
npm run dev
# Server starts on http://localhost:3001

# Terminal 2: Frontend development server
# (In new terminal, from root directory)
npm run dev
# Frontend starts on http://localhost:5173
```

#### Option 2: Concurrent Start
```bash
# Install concurrently (if not already installed)
npm install -g concurrently

# Start both servers simultaneously
npm run dev:all
```

### Development Workflow

#### Hot Reload Configuration
- **Frontend**: Vite provides instant hot reload
- **Backend**: tsx watch provides TypeScript hot reload
- **Database**: Prisma Studio for real-time database viewing

#### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api/v1
- **API Documentation**: http://localhost:3001/docs
- **Database Studio**: http://localhost:5555 (when running prisma studio)
- **Health Check**: http://localhost:3001/health

#### Development Scripts
```bash
# Frontend scripts
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests

# Backend scripts
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
npm run db:studio    # Open Prisma Studio
```

## Production Deployment

### Build Process

#### Frontend Build
```bash
# Build optimized frontend
npm run build

# Verify build output
ls -la dist/

# Test production build locally
npm run preview
```

#### Backend Build
```bash
# Build backend
cd backend
npm run build

# Verify build output
ls -la dist/

# Test production build
npm start
```

### Deployment Options

#### Option 1: Traditional Server Deployment

##### Frontend Deployment (Static Hosting)
```bash
# Build frontend
npm run build

# Deploy to static hosting (example: nginx)
sudo cp -r dist/* /var/www/html/

# Or deploy to CDN (example: AWS S3 + CloudFront)
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

##### Backend Deployment (Node.js Server)
```bash
# Deploy to server
scp -r backend/ user@your-server:/path/to/app/

# On server
cd /path/to/app/backend
npm install --production
npm run build
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start dist/app.js --name traveal-backend
pm2 save
pm2 startup
```

#### Option 2: Platform as a Service (PaaS)

##### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create applications
heroku create traveal-frontend
heroku create traveal-backend

# Configure environment variables
heroku config:set NODE_ENV=production -a traveal-backend
heroku config:set JWT_SECRET="your-production-secret" -a traveal-backend

# Deploy backend
cd backend
git add .
git commit -m "Deploy to production"
git push heroku main

# Deploy frontend
cd ..
echo "web: npm run preview" > Procfile
git add .
git commit -m "Deploy frontend"
git push heroku main
```

##### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel

# Production deployment
vercel --prod
```

##### Railway Deployment (Backend)
```bash
# Connect to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Environment Configuration for Production

#### Frontend Production Environment
```env
# .env.production
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_APP_NAME=Traveal
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

#### Backend Production Environment
```env
# backend/.env.production
NODE_ENV=production
PORT=3001

# Production database
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/traveal"

# Strong production secrets
JWT_SECRET="your-very-strong-production-secret-at-least-64-chars-long"
JWT_REFRESH_SECRET="your-very-strong-refresh-secret-at-least-64-chars-long"

# Production security settings
BCRYPT_ROUNDS=12
CORS_ORIGIN="https://your-frontend-domain.com"

# Tighter rate limiting for production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## Docker Deployment

### Docker Configuration

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S traveal -u 1001

USER traveal

EXPOSE 3001

CMD ["npm", "start"]
```

#### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://localhost:3001/api/v1
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongodb:27017/traveal
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=traveal
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Docker Deployment Commands
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3

# Stop services
docker-compose down

# Remove all data (WARNING: Destructive)
docker-compose down -v
```

## Environment Variables

### Complete Environment Variable Reference

#### Frontend Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | - | Backend API base URL |
| `VITE_APP_NAME` | No | Traveal | Application name |
| `VITE_APP_VERSION` | No | 1.0.0 | Application version |
| `VITE_ENVIRONMENT` | No | development | Environment name |

#### Backend Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | development | Node environment |
| `PORT` | No | 3001 | Server port |
| `DATABASE_URL` | Yes | - | Database connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | - | JWT refresh token secret |
| `JWT_EXPIRES_IN` | No | 15m | JWT token expiration |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token expiration |
| `BCRYPT_ROUNDS` | No | 10 | Password hashing rounds |
| `CORS_ORIGIN` | Yes | - | Allowed CORS origins |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Max requests per window |

### Environment Variable Validation
```bash
# Backend environment validation script
cd backend
node scripts/validate-env.js

# Check required variables
if [ -z "$JWT_SECRET" ]; then
  echo "Error: JWT_SECRET is required"
  exit 1
fi
```

## Monitoring and Maintenance

### Health Checks

#### Application Health Endpoints
```bash
# Backend health check
curl http://localhost:3001/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

#### Database Health Check
```bash
# SQLite health check
cd backend
npx prisma db ping

# MongoDB health check
mongosh --eval "db.adminCommand('ping')"
```

### Logging and Monitoring

#### Application Logs
```bash
# View application logs
tail -f backend/logs/app.log

# View error logs
tail -f backend/logs/error.log

# Using PM2
pm2 logs traveal-backend

# Using Docker
docker-compose logs -f backend
```

#### Performance Monitoring
```bash
# Monitor resource usage
htop

# Monitor disk usage
df -h

# Monitor memory usage
free -h

# Monitor application performance
node --inspect backend/dist/app.js
```

### Backup Strategies

#### Database Backup
```bash
# SQLite backup
cp backend/prisma/dev.db backups/backup-$(date +%Y%m%d-%H%M%S).db

# MongoDB backup
mongodump --db traveal --out backups/mongodb-$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mongodump --db traveal --out $BACKUP_DIR/mongodb-$DATE

# Compress backup
tar -czf $BACKUP_DIR/traveal-backup-$DATE.tar.gz $BACKUP_DIR/mongodb-$DATE

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "traveal-backup-*.tar.gz" -mtime +7 -delete
```

### Update and Maintenance

#### Application Updates
```bash
# Update dependencies
npm update
cd backend && npm update

# Security audit
npm audit
npm audit fix

# Update production deployment
git pull origin main
npm run build
pm2 restart traveal-backend
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001
netstat -tulpn | grep :3001

# Kill process
kill -9 PID

# Use different port
PORT=3002 npm run dev
```

#### Database Connection Issues
```bash
# Check database file permissions
ls -la backend/prisma/dev.db

# Check MongoDB connection
mongosh mongodb://localhost:27017/traveal

# Reset database
cd backend
npx prisma migrate reset
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# TypeScript errors
cd backend
npx tsc --noEmit
```

#### Environment Variable Issues
```bash
# Check if variables are loaded
echo $JWT_SECRET

# Load environment manually
source .env

# Validate environment
node -e "console.log(process.env.JWT_SECRET)"
```

### Performance Issues

#### Frontend Performance
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/

# Lighthouse audit
npx lighthouse http://localhost:5173

# Check for memory leaks
# Use browser dev tools Memory tab
```

#### Backend Performance
```bash
# Profile Node.js application
node --prof backend/dist/app.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt

# Monitor with clinic.js
npm install -g clinic
clinic doctor -- node backend/dist/app.js
```

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug mode
DEBUG=* npm run dev

# Specific debug namespaces
DEBUG=app:* npm run dev

# Frontend debug mode
VITE_DEBUG=true npm run dev
```

#### Development Tools
```bash
# Node.js inspector
node --inspect backend/dist/app.js

# Connect Chrome DevTools to
# chrome://inspect

# VS Code debugging
# Use .vscode/launch.json configuration
```

For additional support:
- [API Documentation](./API.md) for endpoint details
- [Database Documentation](./DATABASE.md) for schema information
- [Components Documentation](./COMPONENTS.md) for frontend architecture
- [Testing Guide](./TESTING.md) for testing procedures