# Tailor Booking Platform

A comprehensive tailor booking platform that connects users with professional tailors through a unified backend infrastructure. The platform consists of three client applications sharing a Node.js backend with PostgreSQL database and Redis caching.

## 🏗️ Architecture

- **User Mobile App**: React Native app for customers to book tailoring services
- **Tailor Mobile App**: React Native app for tailors to manage orders and services  
- **Admin Web Panel**: React web application for platform administration
- **Backend API**: Node.js + Express serverless API with PostgreSQL and Redis
- **Shared Types**: TypeScript type definitions shared across all applications

## 🚀 Tech Stack

### Frontend
- **Mobile Apps**: React Native with Expo
- **Admin Panel**: Next.js with React
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper, Material-UI

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and distributed locks
- **File Storage**: Backblaze B2
- **Authentication**: JWT with OTP verification

### External Services
- **Payments**: Razorpay
- **SMS/OTP**: Twilio or MSG91
- **Push Notifications**: Firebase Cloud Messaging
- **Maps**: Google Maps API
- **Deployment**: Vercel (all components)

## 📱 Applications

### User Mobile App
- OTP-based authentication
- Location-based service discovery
- Service customization and booking
- Payment processing with Razorpay
- Real-time order tracking
- Fabric color detection and matching

### Tailor Mobile App  
- Tailor registration with KYC verification
- Order management and assignment
- Service execution with OTP verification
- Earnings and performance tracking
- Availability management

### Admin Web Panel
- Tailor KYC approval workflow
- Order management and reassignment
- Inventory management across zones
- Payment processing and refunds
- Analytics and reporting dashboard

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and pnpm 8+
- PostgreSQL database
- Redis server
- Expo CLI for mobile development

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd tailor-booking-platform
pnpm install
```

2. **Set up environment variables**
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your configuration
```

3. **Set up database**
```bash
cd apps/backend
pnpm run db:generate
pnpm run db:push
```

4. **Start development servers**
```bash
# Start all services
pnpm run dev

# Or start individually
cd apps/backend && pnpm run dev
cd apps/user-app && pnpm start
cd apps/tailor-app && pnpm start  
cd apps/admin-panel && pnpm run dev
```

## 📁 Project Structure

```
tailor-booking-platform/
├── apps/
│   ├── backend/           # Node.js API server
│   ├── user-app/          # User React Native app
│   ├── tailor-app/        # Tailor React Native app
│   └── admin-panel/       # Admin React web app
├── packages/
│   └── shared-types/      # Shared TypeScript types
├── package.json           # Root package.json with workspaces
└── turbo.json            # Turborepo configuration
```

## 🔧 Configuration

### Environment Variables

The backend requires the following environment variables:

- **Database**: `DATABASE_URL`, `REDIS_URL`
- **Authentication**: `JWT_SECRET`, `JWT_EXPIRES_IN`
- **External Services**: Twilio, Razorpay, Firebase, Backblaze B2, Google Maps API keys
- **Platform Settings**: Commission rates, payment hold duration, slot lock duration

See `apps/backend/.env.example` for complete configuration.

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key entities include:

- **Users & Tailors**: Authentication and profile management
- **Services & Customizations**: Service catalog and options
- **Orders & Payments**: Booking lifecycle and payment processing
- **Location & Inventory**: Zone-based service availability and fabric inventory
- **KYC & Verification**: Tailor onboarding and document verification

## 🚀 Deployment

The platform is designed for deployment on Vercel:

- **Backend**: Deployed as serverless functions
- **Admin Panel**: Static site deployment
- **Mobile Apps**: Built and distributed through app stores
- **Database**: PostgreSQL on cloud provider (e.g., Supabase, Railway)
- **Redis**: Cloud Redis instance (e.g., Upstash, Redis Cloud)

## 📋 Features

### Core Features
- ✅ OTP-based authentication for all user types
- ✅ Location-based service discovery and tailor matching
- ✅ Dynamic service customization with real-time pricing
- ✅ Fabric color detection and inventory matching
- ✅ Slot-based booking with distributed locking
- ✅ Integrated payment processing with Razorpay
- ✅ Real-time order tracking and status updates
- ✅ Tailor KYC verification workflow
- ✅ Commission-based payment distribution
- ✅ Multi-channel notifications (Push + SMS)

### Advanced Features
- 🔄 Real-time synchronization across all clients
- 📊 Comprehensive analytics and reporting
- 🎨 Fabric color detection using image processing
- 🔒 Distributed slot locking to prevent double booking
- 💰 Automated payment holds and commission calculation
- 📱 Cross-platform mobile applications
- 🌍 Location-based service and inventory management

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and service-level testing
- **Property-Based Tests**: Universal correctness properties
- **Integration Tests**: End-to-end workflow testing
- **API Tests**: Backend endpoint validation

```bash
# Run all tests
pnpm run test

# Run tests for specific app
cd apps/backend && pnpm test
```

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the development team for contribution guidelines.

---

**Theme Color**: #d42584
**Platform**: Multi-client (Mobile + Web)
**Architecture**: Microservices with shared backend