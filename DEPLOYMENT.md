# Deployment Guide

This guide covers the deployment setup for the Tailor Booking Platform across all environments.

## Prerequisites

1. **Vercel Account**: Create accounts and projects for backend and admin panel
2. **GitHub Repository**: Push code to GitHub for CI/CD integration
3. **External Services**: Set up accounts for all required external services

## Required Secrets

### GitHub Secrets

Add these secrets to your GitHub repository settings:

```bash
# Vercel Configuration
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_BACKEND_PROJECT_ID=your-backend-project-id
VERCEL_ADMIN_PROJECT_ID=your-admin-project-id

# Production URLs (for health checks)
BACKEND_URL=https://your-backend.vercel.app
ADMIN_PANEL_URL=https://your-admin.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# External Services
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-key
FIREBASE_CLIENT_EMAIL=your-firebase-email
B2_KEY_ID=your-b2-key
B2_APPLICATION_KEY=your-b2-secret
GOOGLE_MAPS_API_KEY=your-maps-key
```

## Environment Setup

### 1. Development Environment

```bash
# Clone repository
git clone <repository-url>
cd tailor-booking-platform

# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/admin-panel/.env.example apps/admin-panel/.env.local
cp apps/user-app/.env.example apps/user-app/.env
cp apps/tailor-app/.env.example apps/tailor-app/.env

# Set up database
cd apps/backend
pnpm db:push
pnpm db:generate

# Start development servers
cd ../..
pnpm dev
```

### 2. Production Environment Setup

#### Backend (Vercel)

1. Create new Vercel project for backend
2. Connect to GitHub repository
3. Set root directory to `apps/backend`
4. Configure environment variables in Vercel dashboard
5. Deploy using GitHub Actions or manual deployment

#### Admin Panel (Vercel)

1. Create new Vercel project for admin panel
2. Connect to GitHub repository  
3. Set root directory to `apps/admin-panel`
4. Configure environment variables in Vercel dashboard
5. Deploy using GitHub Actions or manual deployment

#### Mobile Apps (Expo/EAS)

1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Login to Expo: `eas login`
3. Configure EAS build profiles in `eas.json`
4. Build for production: `eas build --platform all`
5. Submit to app stores: `eas submit`

## Database Setup

### Production Database

1. **PostgreSQL**: Use managed service (Supabase, Railway, or AWS RDS)
2. **Redis**: Use managed service (Upstash, Railway, or AWS ElastiCache)

```sql
-- Create production database
CREATE DATABASE tailor_booking_prod;

-- Run migrations
cd apps/backend
DATABASE_URL="your-prod-url" pnpm db:migrate
```

### Backup Strategy

```bash
# Daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_20240101.sql
```

## External Services Configuration

### 1. Razorpay Setup

1. Create Razorpay account
2. Generate API keys (live mode for production)
3. Configure webhooks for payment status updates
4. Set up payment methods (UPI, cards, net banking)

### 2. Twilio/SMS Setup

1. Create Twilio account
2. Purchase phone number for SMS
3. Configure messaging service
4. Set up OTP templates

### 3. Firebase Setup

1. Create Firebase project
2. Enable Cloud Messaging
3. Generate service account key
4. Configure push notification certificates

### 4. Backblaze B2 Setup

1. Create Backblaze account
2. Create B2 bucket for file storage
3. Generate application keys
4. Configure CORS for web uploads

### 5. Google Maps Setup

1. Create Google Cloud project
2. Enable Maps JavaScript API, Geocoding API
3. Generate API key
4. Configure API restrictions

## CI/CD Pipeline

The GitHub Actions workflows handle:

1. **Continuous Integration**:
   - Dependency installation and caching
   - Linting and type checking
   - Unit and integration testing
   - Build verification

2. **Continuous Deployment**:
   - Automatic deployment on main branch
   - Environment-specific configurations
   - Database migrations
   - Health checks

### Manual Deployment

If needed, deploy manually:

```bash
# Backend
cd apps/backend
vercel --prod

# Admin Panel
cd apps/admin-panel
vercel --prod

# Mobile Apps
cd apps/user-app
eas build --platform all
eas submit --platform all
```

## Monitoring and Logging

### 1. Application Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging

### 2. Infrastructure Monitoring

- **Uptime monitoring**: Use services like Pingdom or UptimeRobot
- **Database monitoring**: Built-in metrics from managed services
- **API monitoring**: Track response times and error rates

### 3. Logging Strategy

```javascript
// Structured logging
const logger = {
  info: (message, meta) => console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date() })),
  error: (message, error) => console.error(JSON.stringify({ level: 'error', message, error: error.stack, timestamp: new Date() })),
  warn: (message, meta) => console.warn(JSON.stringify({ level: 'warn', message, meta, timestamp: new Date() }))
}
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to repository
2. **API Security**: Implement rate limiting and authentication
3. **Database Security**: Use connection pooling and read replicas
4. **File Upload Security**: Validate file types and sizes
5. **HTTPS**: Ensure all communications are encrypted

## Scaling Considerations

1. **Database**: Use read replicas for read-heavy operations
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Use Vercel's CDN for static assets
4. **Background Jobs**: Implement queue system for heavy operations
5. **Load Balancing**: Vercel handles this automatically

## Troubleshooting

### Common Issues

1. **Build Failures**: Check dependency versions and build logs
2. **Database Connection**: Verify connection strings and network access
3. **Environment Variables**: Ensure all required variables are set
4. **External Service Limits**: Monitor API quotas and rate limits

### Debug Commands

```bash
# Check build logs
vercel logs <deployment-url>

# Test database connection
cd apps/backend && pnpm db:studio

# Validate environment
cd apps/backend && node -e "console.log(process.env)"
```

## Rollback Strategy

1. **Vercel Deployments**: Use Vercel dashboard to rollback to previous deployment
2. **Database**: Restore from backup if schema changes are involved
3. **Mobile Apps**: Release hotfix version through app stores

## Support and Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Security Patches**: Monitor and apply security updates
3. **Performance Monitoring**: Regular performance audits
4. **Backup Verification**: Test backup restoration regularly