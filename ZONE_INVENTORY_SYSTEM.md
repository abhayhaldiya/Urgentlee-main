# Zone and Inventory Management System

## Overview

The Zone and Inventory Management System enables location-based service delivery for the tailor booking platform. It ensures that users only see services available in their area and automatically assigns tailors from the same region.

## Key Features

### 🗺️ **Location Zones**
- **Geographic Coverage**: Each zone has a center point and radius (e.g., 25km for Gurugram)
- **Service Availability**: Services are mapped to specific zones
- **Tailor Assignment**: Tailors are assigned to zones they can serve
- **Automatic Detection**: User location is automatically mapped to the appropriate zone

### 🎨 **Inventory Management**
- **Zone-specific Inventory**: Each zone has its own fabric color inventory
- **Real-time Tracking**: Available and reserved quantities are tracked
- **Admin Management**: Admins can manage inventory across all zones
- **Color Matching**: Fabric colors are matched to user preferences

### 🧵 **Tailor Zone Assignment**
- **Geographic Restriction**: Tailors can only serve assigned zones
- **Automatic Assignment**: Orders are automatically assigned to available tailors in the same zone
- **Load Balancing**: Assignment algorithm considers tailor ratings and workload

## Implementation Details

### Database Schema

```sql
-- Location Zones
LocationZone {
  id: String (Primary Key)
  name: String (e.g., "Gurugram Central")
  city: String (e.g., "Gurugram")
  state: String (e.g., "Haryana")
  coordinates: JSON { lat, lng, radius }
  isActive: Boolean
}

-- Zone-specific Inventory
ColorInventory {
  id: String (Primary Key)
  zoneId: String (Foreign Key)
  colorName: String (e.g., "Royal Blue")
  colorCode: String (e.g., "RB001")
  hexValue: String (e.g., "#4169E1")
  availableQuantity: Int
  reservedQuantity: Int
  isActive: Boolean
}

-- Tailor Zone Assignments
TailorZone {
  tailorId: String (Foreign Key)
  zoneId: String (Foreign Key)
  isActive: Boolean
}

-- Service Zone Availability
ServiceZone {
  serviceId: String (Foreign Key)
  zoneId: String (Foreign Key)
  isActive: Boolean
}
```

### API Endpoints

#### Zone Availability
```typescript
// Check if services are available at coordinates
POST /api/v1/zone-availability/check
Body: { latitude: number, longitude: number }

// Get all available zones
GET /api/v1/zone-availability/zones

// Find nearest zone to coordinates
POST /api/v1/zone-availability/nearest-zone
Body: { latitude: number, longitude: number }
```

#### Admin Inventory Management
```typescript
// Get zones for admin panel
GET /api/v1/admin/inventory/zones

// Get inventory for specific zone
GET /api/v1/admin/inventory/zones/:zoneId

// Update inventory quantity
PATCH /api/v1/admin/inventory/:inventoryId
Body: { quantity: number }

// Add new inventory item
POST /api/v1/admin/inventory
Body: { zoneId, colorName, colorCode, hexValue, availableQuantity }
```

## Gurugram Zone Setup

### Zone Configuration
- **Name**: Gurugram Central
- **Location**: Gurugram, Haryana, India
- **Coverage**: 25km radius from center (28.4595, 77.0266)
- **Services**: 5 tailoring services available
- **Inventory**: 15 fabric colors in stock
- **Tailors**: 5 approved and available tailors

### Available Services
1. **Shirt Tailoring** - ₹800 (3 hours)
2. **Trouser Tailoring** - ₹600 (2 hours)
3. **Suit Tailoring** - ₹2500 (8 hours)
4. **Kurta Tailoring** - ₹500 (2.5 hours)
5. **Dress Tailoring** - ₹900 (3.3 hours)

### Sample Tailors
- **Rajesh Kumar** (4.8⭐, 150 orders)
- **Suresh Sharma** (4.6⭐, 120 orders)
- **Amit Singh** (4.7⭐, 95 orders)
- **Vikram Gupta** (4.9⭐, 200 orders)
- **Manoj Verma** (4.5⭐, 80 orders)

## User Experience Flow

### 1. Location Detection
```typescript
// User opens app
// GPS coordinates detected: (28.4595, 77.0266)
// System checks zone availability
const availability = await checkZoneAvailability(coordinates);

if (availability.available) {
  // Show services for Gurugram zone
  showServices(availability.services);
} else {
  // Show "Services coming soon" message
  showComingSoonMessage();
}
```

### 2. Service Discovery
```typescript
// User in Gurugram sees available services
const services = await getServicesInZone(zoneId);
// Returns: Shirt, Trouser, Suit, Kurta, Dress tailoring
```

### 3. Fabric Selection
```typescript
// User selects fabric color
const inventory = await getZoneInventory(zoneId);
// Shows available colors with quantities
// User selects "Royal Blue" (50 units available)
```

### 4. Order Placement
```typescript
// System automatically assigns tailor from same zone
const tailor = await assignTailorInZone({
  zoneId: "gurugram-zone-1",
  scheduledDate: orderDate,
  scheduledTime: orderTime
});
// Assigns best available tailor (e.g., Vikram Gupta)
```

## Admin Panel Features

### Zone Management
- View all active zones
- Monitor service coverage areas
- Add new zones for expansion

### Inventory Control
- **Zone Selection**: Choose zone to manage
- **Color Management**: Add/update fabric colors
- **Quantity Tracking**: Monitor available vs reserved stock
- **Real-time Updates**: Inventory updates reflect immediately

### Tailor Assignment
- View tailors by zone
- Monitor tailor availability
- Reassign orders between tailors
- Track performance metrics

## Setup Instructions

### 1. Run Setup Script
```bash
# From backend directory
node scripts/setup-gurugram-complete.js
```

### 2. Verify Setup
```bash
# Test zone availability
node scripts/test-zone-availability.js
```

### 3. Access Admin Panel
```
http://localhost:3000/inventory
```

## Expansion Strategy

### Adding New Zones
1. **Market Research**: Identify target cities
2. **Zone Creation**: Define coverage area and center point
3. **Tailor Onboarding**: Recruit and verify local tailors
4. **Inventory Setup**: Stock fabric colors for the zone
5. **Service Mapping**: Enable services for the new zone

### Example: Adding Delhi Zone
```javascript
const delhiZone = {
  name: 'Delhi NCR',
  city: 'New Delhi',
  state: 'Delhi',
  centerCoordinates: { latitude: 28.6139, longitude: 77.2090 },
  radiusKm: 30
};
```

## Business Logic

### Service Availability Rules
- Users can only see services available in their zone
- Orders can only be placed if user is within a covered zone
- "Services coming soon" message shown for uncovered areas

### Tailor Assignment Algorithm
1. **Zone Filtering**: Only consider tailors in the same zone
2. **Availability Check**: Ensure tailor is available at requested time
3. **Rating Priority**: Prefer higher-rated tailors
4. **Load Balancing**: Distribute orders fairly among tailors
5. **Random Selection**: Among top candidates to avoid bias

### Inventory Management
- **Reservation System**: Quantities reserved during order process
- **Automatic Release**: Reserved quantities released if payment fails
- **Low Stock Alerts**: Notifications when inventory runs low
- **Zone-specific Tracking**: Each zone maintains separate inventory

## Monitoring and Analytics

### Key Metrics
- **Zone Coverage**: Percentage of user requests within covered zones
- **Service Utilization**: Most popular services by zone
- **Tailor Performance**: Ratings and completion rates by zone
- **Inventory Turnover**: Fabric color popularity and stock levels

### Admin Dashboard
- Real-time zone performance metrics
- Inventory alerts and recommendations
- Tailor workload distribution
- Service demand patterns

## Future Enhancements

### Planned Features
1. **Dynamic Zones**: AI-powered zone boundary optimization
2. **Predictive Inventory**: ML-based stock level predictions
3. **Multi-zone Tailors**: Allow tailors to serve multiple zones
4. **Mobile Zones**: Temporary service areas for events
5. **Franchise Management**: Zone-based franchise operations

### Technical Improvements
- **Caching**: Redis-based zone lookup caching
- **Real-time Updates**: WebSocket-based inventory updates
- **Geofencing**: More precise location-based service delivery
- **Analytics**: Advanced reporting and insights dashboard