#!/usr/bin/env node

/**
 * Setup script to create Gurugram zone and sample inventory
 * Run with: node scripts/setup-gurugram-zone.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupGurugramZone() {
  try {
    console.log('🚀 Setting up Gurugram zone and inventory...');

    // Gurugram coordinates (approximate center)
    const gurugramCenter = {
      latitude: 28.4595,
      longitude: 77.0266
    };

    // Create Gurugram zone
    const gurugramZone = await prisma.locationZone.upsert({
      where: {
        // Use a composite key approach by checking existing zones
        id: 'gurugram-haryana-india' // We'll use a predictable ID
      },
      update: {
        name: 'Gurugram Central',
        city: 'Gurugram',
        state: 'Haryana',
        coordinates: {
          lat: gurugramCenter.latitude,
          lng: gurugramCenter.longitude,
          radius: 25 // 25km radius to cover most of Gurugram
        },
        isActive: true
      },
      create: {
        id: 'gurugram-haryana-india',
        name: 'Gurugram Central',
        city: 'Gurugram',
        state: 'Haryana',
        coordinates: {
          lat: gurugramCenter.latitude,
          lng: gurugramCenter.longitude,
          radius: 25 // 25km radius to cover most of Gurugram
        },
        isActive: true
      }
    });

    console.log('✅ Created Gurugram zone:', gurugramZone.name);

    // Sample fabric colors for Gurugram inventory
    const fabricColors = [
      { name: 'Royal Blue', code: 'RB001', hex: '#4169E1', quantity: 50 },
      { name: 'Deep Red', code: 'DR002', hex: '#DC143C', quantity: 45 },
      { name: 'Forest Green', code: 'FG003', hex: '#228B22', quantity: 40 },
      { name: 'Golden Yellow', code: 'GY004', hex: '#FFD700', quantity: 35 },
      { name: 'Pure White', code: 'PW005', hex: '#FFFFFF', quantity: 60 },
      { name: 'Jet Black', code: 'JB006', hex: '#000000', quantity: 55 },
      { name: 'Maroon', code: 'MR007', hex: '#800000', quantity: 30 },
      { name: 'Navy Blue', code: 'NB008', hex: '#000080', quantity: 42 },
      { name: 'Cream', code: 'CR009', hex: '#F5F5DC', quantity: 38 },
      { name: 'Burgundy', code: 'BG010', hex: '#800020', quantity: 25 },
      { name: 'Olive Green', code: 'OG011', hex: '#808000', quantity: 33 },
      { name: 'Silver Grey', code: 'SG012', hex: '#C0C0C0', quantity: 28 },
      { name: 'Rose Pink', code: 'RP013', hex: '#FF69B4', quantity: 22 },
      { name: 'Chocolate Brown', code: 'CB014', hex: '#D2691E', quantity: 31 },
      { name: 'Turquoise', code: 'TQ015', hex: '#40E0D0', quantity: 27 }
    ];

    // Create inventory items
    for (const color of fabricColors) {
      await prisma.colorInventory.upsert({
        where: {
          zoneId_colorCode: {
            zoneId: gurugramZone.id,
            colorCode: color.code
          }
        },
        update: {
          colorName: color.name,
          hexValue: color.hex,
          availableQuantity: color.quantity,
          isActive: true
        },
        create: {
          zoneId: gurugramZone.id,
          colorName: color.name,
          colorCode: color.code,
          hexValue: color.hex,
          availableQuantity: color.quantity,
          reservedQuantity: 0,
          isActive: true
        }
      });
    }

    console.log(`✅ Created ${fabricColors.length} fabric colors in inventory`);

    // Get all services and make them available in Gurugram zone
    const services = await prisma.service.findMany({
      where: { isActive: true }
    });

    for (const service of services) {
      await prisma.serviceZone.upsert({
        where: {
          serviceId_zoneId: {
            serviceId: service.id,
            zoneId: gurugramZone.id
          }
        },
        update: {
          isActive: true
        },
        create: {
          serviceId: service.id,
          zoneId: gurugramZone.id,
          isActive: true
        }
      });
    }

    console.log(`✅ Made ${services.length} services available in Gurugram zone`);

    console.log('\n🎉 Gurugram zone setup completed successfully!');
    console.log(`Zone ID: ${gurugramZone.id}`);
    console.log(`Zone Name: ${gurugramZone.name}`);
    console.log(`Coverage: ${gurugramZone.city}, ${gurugramZone.state}`);
    console.log(`Radius: 25km from center (${gurugramCenter.latitude}, ${gurugramCenter.longitude})`);

  } catch (error) {
    console.error('❌ Error setting up Gurugram zone:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupGurugramZone()
    .then(() => {
      console.log('\n✨ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupGurugramZone };