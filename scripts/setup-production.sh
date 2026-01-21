#!/bin/bash

# Production Environment Setup Script
# This script helps set up the production environment for the Tailor Booking Platform

set -e

echo "🚀 Setting up Tailor Booking Platform Production Environment"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed. Installing..."
        npm install -g vercel@latest
    fi
    
    print_status "All dependencies are available"
}

# Setup environment files
setup_environment() {
    echo "Setting up environment files..."
    
    # Root environment
    if [ ! -f .env ]; then
        cp .env.example .env
        print_status "Created root .env file"
    else
        print_warning "Root .env file already exists"
    fi
    
    # Backend environment
    if [ ! -f apps/backend/.env ]; then
        cp apps/backend/.env.example apps/backend/.env
        print_status "Created backend .env file"
    else
        print_warning "Backend .env file already exists"
    fi
    
    # Admin panel environment
    if [ ! -f apps/admin-panel/.env.local ]; then
        cp apps/admin-panel/.env.example apps/admin-panel/.env.local
        print_status "Created admin panel .env.local file"
    else
        print_warning "Admin panel .env.local file already exists"
    fi
    
    # User app environment
    if [ ! -f apps/user-app/.env ]; then
        cp apps/user-app/.env.example apps/user-app/.env
        print_status "Created user app .env file"
    else
        print_warning "User app .env file already exists"
    fi
    
    # Tailor app environment
    if [ ! -f apps/tailor-app/.env ]; then
        cp apps/tailor-app/.env.example apps/tailor-app/.env
        print_status "Created tailor app .env file"
    else
        print_warning "Tailor app .env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    echo "Installing dependencies..."
    pnpm install --frozen-lockfile
    print_status "Dependencies installed"
}

# Setup database
setup_database() {
    echo "Setting up database..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set. Skipping database setup."
        print_warning "Please set DATABASE_URL in apps/backend/.env and run 'cd apps/backend && pnpm db:push'"
        return
    fi
    
    cd apps/backend
    
    # Generate Prisma client
    pnpm db:generate
    print_status "Generated Prisma client"
    
    # Push database schema
    pnpm db:push
    print_status "Database schema updated"
    
    cd ../..
}

# Verify build
verify_build() {
    echo "Verifying build process..."
    
    # Build all packages
    pnpm build
    print_status "All packages built successfully"
}

# Setup monitoring and logging
setup_monitoring() {
    echo "Setting up monitoring configuration..."
    
    # Create monitoring configuration
    cat > monitoring.json << EOF
{
  "healthChecks": {
    "backend": {
      "url": "\${BACKEND_URL}/health",
      "interval": "5m",
      "timeout": "30s"
    },
    "adminPanel": {
      "url": "\${ADMIN_PANEL_URL}",
      "interval": "5m",
      "timeout": "30s"
    }
  },
  "alerts": {
    "email": "\${ADMIN_EMAIL}",
    "slack": "\${SLACK_WEBHOOK_URL}"
  },
  "logging": {
    "level": "info",
    "format": "json",
    "retention": "30d"
  }
}
EOF
    
    print_status "Monitoring configuration created"
}

# Create backup script
create_backup_script() {
    echo "Creating backup script..."
    
    cat > scripts/backup-database.sh << 'EOF'
#!/bin/bash

# Database Backup Script
set -e

BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed successfully"
EOF
    
    chmod +x scripts/backup-database.sh
    print_status "Backup script created"
}

# Create health check endpoint
create_health_check() {
    echo "Creating health check configuration..."
    
    # Health check for backend (if not exists)
    if [ ! -f apps/backend/src/routes/health.ts ]; then
        mkdir -p apps/backend/src/routes
        cat > apps/backend/src/routes/health.ts << 'EOF'
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'redis';

const router = Router();
const prisma = new PrismaClient();
const redis = Redis.createClient({ url: process.env.REDIS_URL });

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis connection
    await redis.ping();
    
    // Check external services (optional)
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        version: process.env.npm_package_version || '1.0.0'
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
EOF
        print_status "Health check endpoint created"
    else
        print_warning "Health check endpoint already exists"
    fi
}

# Main execution
main() {
    echo "Starting production environment setup..."
    
    check_dependencies
    setup_environment
    install_dependencies
    setup_database
    verify_build
    setup_monitoring
    create_backup_script
    create_health_check
    
    echo ""
    echo "🎉 Production environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables in .env files with production values"
    echo "2. Set up external services (Razorpay, Twilio, Firebase, etc.)"
    echo "3. Configure Vercel projects and deploy"
    echo "4. Set up monitoring and alerting"
    echo "5. Test the complete system"
    echo ""
    echo "For detailed instructions, see DEPLOYMENT.md"
}

# Run main function
main "$@"