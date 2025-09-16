#!/bin/bash
# Production deployment script for Traveal

set -e  # Exit on any error

echo "🚀 Starting Traveal production deployment..."

# Configuration
PROJECT_NAME="traveal"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
COMPOSE_FILE="docker-compose.yml"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Check if environment file exists
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env.production" ]; then
        print_warning ".env.production file not found. Creating template..."
        cp .env.example .env.production
        print_error "Please configure .env.production file with production values and run the script again."
        exit 1
    fi
    
    # Validate critical environment variables
    source .env.production
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "your_super_secure_jwt_secret_change_in_production" ]; then
        print_error "JWT_SECRET must be set to a secure value in .env.production"
        exit 1
    fi
    
    if [ -z "$ENCRYPTION_KEY" ] || [ "$ENCRYPTION_KEY" == "your_super_secure_encryption_key_change_in_production" ]; then
        print_error "ENCRYPTION_KEY must be set to a secure value in .env.production"
        exit 1
    fi
    
    print_success "Environment configuration validated"
}

# Create backup of existing deployment
create_backup() {
    if [ "$(docker ps -q -f name=${PROJECT_NAME})" ]; then
        print_status "Creating backup of current deployment..."
        
        mkdir -p "$BACKUP_DIR"
        
        # Backup MongoDB data
        docker exec ${PROJECT_NAME}-mongodb mongodump --archive="$BACKUP_DIR/mongodb_backup.archive" --gzip
        
        # Backup environment file
        cp .env.production "$BACKUP_DIR/"
        
        # Export current container versions
        docker-compose ps > "$BACKUP_DIR/container_versions.txt"
        
        print_success "Backup created at $BACKUP_DIR"
    else
        print_status "No existing deployment found, skipping backup"
    fi
}

# Pull latest images
pull_images() {
    print_status "Pulling latest Docker images..."
    docker-compose -f $COMPOSE_FILE pull
    print_success "Images updated"
}

# Build custom images
build_images() {
    print_status "Building application images..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    print_success "Images built successfully"
}

# Deploy services
deploy_services() {
    print_status "Deploying services..."
    
    # Start with database services first
    docker-compose -f $COMPOSE_FILE up -d mongodb redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 30
    
    # Start backend service
    docker-compose -f $COMPOSE_FILE up -d backend
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    sleep 20
    
    # Start remaining services
    docker-compose -f $COMPOSE_FILE up -d
    
    print_success "All services deployed"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    backend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")
    if [ "$backend_health" != "200" ]; then
        print_error "Backend health check failed (HTTP $backend_health)"
        return 1
    fi
    
    # Check frontend health
    frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "000")
    if [ "$frontend_health" != "200" ]; then
        print_error "Frontend health check failed (HTTP $frontend_health)"
        return 1
    fi
    
    # Check MongoDB
    mongo_status=$(docker exec ${PROJECT_NAME}-mongodb mongo --eval "db.adminCommand('ismaster')" --quiet | grep '"ismaster" : true' || echo "")
    if [ -z "$mongo_status" ]; then
        print_error "MongoDB health check failed"
        return 1
    fi
    
    # Check Redis
    redis_status=$(docker exec ${PROJECT_NAME}-redis redis-cli ping || echo "")
    if [ "$redis_status" != "PONG" ]; then
        print_error "Redis health check failed"
        return 1
    fi
    
    print_success "All health checks passed"
    return 0
}

# Cleanup old images and containers
cleanup() {
    print_status "Cleaning up old images and containers..."
    docker system prune -f
    docker image prune -f
    print_success "Cleanup completed"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo "===================="
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    
    print_status "Service URLs:"
    echo "Frontend: http://localhost"
    echo "Backend API: http://localhost:3001"
    echo "API Health: http://localhost:3001/health"
    echo "API Docs: http://localhost:3001/docs"
    echo ""
    
    print_status "To view logs:"
    echo "docker-compose logs -f [service_name]"
    echo ""
    
    print_status "To stop all services:"
    echo "docker-compose down"
}

# Rollback function
rollback() {
    print_error "Deployment failed. Rolling back..."
    
    if [ -d "$BACKUP_DIR" ]; then
        # Stop current containers
        docker-compose -f $COMPOSE_FILE down
        
        # Restore environment
        cp "$BACKUP_DIR/.env.production" .env.production
        
        # Restore MongoDB data
        docker-compose -f $COMPOSE_FILE up -d mongodb
        sleep 30
        docker exec ${PROJECT_NAME}-mongodb mongorestore --archive="$BACKUP_DIR/mongodb_backup.archive" --gzip --drop
        
        # Start all services
        docker-compose -f $COMPOSE_FILE up -d
        
        print_warning "Rollback completed"
    else
        print_error "No backup found for rollback"
    fi
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    
    # Trap errors for rollback
    trap rollback ERR
    
    check_dependencies
    check_environment
    create_backup
    pull_images
    build_images
    deploy_services
    
    if health_check; then
        cleanup
        show_status
        print_success "🎉 Deployment completed successfully!"
    else
        print_error "Health checks failed. Check service logs for details."
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "health")
        health_check
        ;;
    "status")
        show_status
        ;;
    "rollback")
        rollback
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|health|status|rollback|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full deployment process (default)"
        echo "  health   - Run health checks only"
        echo "  status   - Show current deployment status"
        echo "  rollback - Rollback to previous deployment"
        echo "  cleanup  - Clean up old Docker images"
        exit 1
        ;;
esac