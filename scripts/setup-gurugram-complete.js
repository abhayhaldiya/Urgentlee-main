#!/usr/bin/env node

/**
 * Complete setup script for Gurugram zone with services, inventory, and tailors
 * Run with: node scripts/setup-gurugram-complete.js
 */

const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function setupGurugramComplete() {
  try {
    console.log('🚀 Setting up complete Gurugram zone infrastructure...\n');

    // Step 1: Create Gurugram zone
    console.log('📍 Step 1: Creating Gurugram location zone...');
    
    const gurugramCenter = {
      latitude: 28.4595,
      longitude: 77.0266
    };

    const gurugramZone = await prisma.locationZone.upsert({
      where: {
        id: 'gurugram-zone-1'
      },
      update: {
        name: 'Gurugram Central',
        city: 'Gurugram',
        state: 'Haryana',
        coordinates: {
          lat: gurugramCenter.latitude,
          lng: gurugramCenter.longitude,
          radius: 25 // 25km radius
        },
        isActive: true
      },
      create: {
        id: 'gurugram-zone-1',
        name: 'Gurugram Central',
        city: 'Gurugram',
        state: 'Haryana',
        coordinates: {
          lat: gurugramCenter.latitude,
          lng: gurugramCenter.longitude,
          radius: 25
        },
        isActive: true
      }
    });

    console.log(`✅ Created zone: ${gurugramZone.name} (${gurugramZone.city}, ${gurugramZone.state})`);

    // Step 2: Create sample services if they don't exist
    console.log('\n🛍️ Step 2: Setting up services...');
    
    const servicesData = [
      {
        name: 'Shirt Tailoring',
        description: 'Custom shirt stitching and alterations',
        category: 'Formal Wear',
        basePrice: 800,
        estimatedTime: 180 // 3 hours
      },
      {
        name: 'Trouser Tailoring',
        description: 'Custom trouser stitching and fitting',
        category: 'Formal Wear',
        basePrice: 600,
        estimatedTime: 120 // 2 hours
      },
      {
        name: 'Suit Tailoring',
        description: 'Complete suit stitching with jacket and trouser',
        category: 'Formal Wear',
        basePrice: 2500,
        estimatedTime: 480 // 8 hours
      },
      {
        name: 'Kurta Tailoring',
        description: 'Traditional kurta stitching and embellishments',
        category: 'Traditional Wear',
        basePrice: 500,
        estimatedTime: 150 // 2.5 hours
      },
      {
        name: 'Dress Tailoring',
        description: 'Custom dress stitching and alterations',
        category: 'Casual Wear',
        basePrice: 900,
        estimatedTime: 200 // 3.3 hours
      }
    ];

    for (const serviceData of servicesData) {
      const service = await prisma.service.upsert({
        where: {
          name: serviceData.name
        },
        update: serviceData,
        create: serviceData
      });

      // Make service available in Gurugram zone
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

      console.log(`✅ Service: ${service.name} - ₹${service.basePrice}`);
    }

    // Step 3: Create fabric inventory
    console.log('\n🎨 Step 3: Setting up fabric inventory...');
    
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

    // Step 4: Create sample tailors
    console.log('\n🧵 Step 4: Setting up tailors...');
    
    const tailorsData = [
      {
        phoneNumber: '+919876543210',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        age: 35,
        profileImage: 'https://via.placeholder.com/150/1f77b4/ffffff?text=RK',
        rating: 4.8,
        totalOrders: 150
      },
      {
        phoneNumber: '+919876543211',
        name: 'Suresh Sharma',
        email: 'suresh.sharma@example.com',
        age: 42,
        profileImage: 'https://via.placeholder.com/150/ff7f0e/ffffff?text=SS',
        rating: 4.6,
        totalOrders: 120
      },
      {
        phoneNumber: '+919876543212',
        name: 'Amit Singh',
        email: 'amit.singh@example.com',
        age: 28,
        profileImage: 'https://via.placeholder.com/150/2ca02c/ffffff?text=AS',
        rating: 4.7,
        totalOrders: 95
      },
      {
        phoneNumber: '+919876543213',
        name: 'Vikram Gupta',
        email: 'vikram.gupta@example.com',
        age: 38,
        profileImage: 'https://via.placeholder.com/150/d62728/ffffff?text=VG',
        rating: 4.9,
        totalOrders: 200
      },
      {
        phoneNumber: '+919876543214',
        name: 'Manoj Verma',
        email: 'manoj.verma@example.com',
        age: 31,
        profileImage: 'https://via.placeholder.com/150/9467bd/ffffff?text=MV',
        rating: 4.5,
        totalOrders: 80
      }
    ];

    for (const tailorData of tailorsData) {
      // Create tailor
      const tailor = await prisma.tailor.upsert({
        where: { phoneNumber: tailorData.phoneNumber },
        update: {
          name: tailorData.name,
          email: tailorData.email,
          age: tailorData.age,
          profileImage: tailorData.profileImage,
          kycStatus: 'APPROVED',
          isAvailable: true,
          rating: tailorData.rating,
          totalOrders: tailorData.totalOrders
        },
        create: {
          phoneNumber: tailorData.phoneNumber,
          name: tailorData.name,
          email: tailorData.email,
          age: tailorData.age,
          profileImage: tailorData.profileImage,
          kycStatus: 'APPROVED',
          isAvailable: true,
          rating: tailorData.rating,
          totalOrders: tailorData.totalOrders
        }
      });

      // Create KYC data
      await prisma.kYCData.upsert({
        where: { tailorId: tailor.id },
        update: {
          verificationStatus: 'APPROVED',
          verifiedAt: new Date()
        },
        create: {
          tailorId: tailor.id,
          aadhaarNumber: '1234-5678-9012',
          aadhaarFrontImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=Aadhaar+Front',
          aadhaarBackImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=Aadhaar+Back',
          panNumber: 'ABCDE1234F',
          panFrontImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=PAN+Front',
          panBackImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=PAN+Back',
          verificationStatus: 'APPROVED',
          verifiedAt: new Date()
        }
      });

      // Assign tailor to Gurugram zone
      await prisma.tailorZone.upsert({
        where: {
          tailorId_zoneId: {
            tailorId: tailor.id,
            zoneId: gurugramZone.id
          }
        },
        update: {
          isActive: true
        },
        create: {
          tailorId: tailor.id,
          zoneId: gurugramZone.id,
          isActive: true
        }
      });

      console.log(`✅ Tailor: ${tailor.name} (Rating: ${tailor.rating}⭐)`);
    }

    // Step 5: Generate summary
    console.log('\n📊 Setup Summary:');
    console.log('═'.repeat(50));
    
    const [totalServices, totalInventory, totalTailors] = await Promise.all([
      prisma.service.count({
        where: {
          zones: {
            some: {
              zoneId: gurugramZone.id,
              isActive: true
            }
          }
        }
      }),
      prisma.colorInventory.count({
        where: {
          zoneId: gurugramZone.id,
          isActive: true
        }
      }),
      prisma.tailor.count({
        where: {
          locationZones: {
            some: {
              zoneId: gurugramZone.id,
              isActive: true
            }
          },
          kycStatus: 'APPROVED'
        }
      })
    ]);

    console.log(`🏙️  Zone: ${gurugramZone.name}`);
    console.log(`📍 Location: ${gurugramZone.city}, ${gurugramZone.state}`);
    console.log(`📐 Coverage: 25km radius from (${gurugramCenter.latitude}, ${gurugramCenter.longitude})`);
    console.log(`🛍️  Services: ${totalServices} available`);
    console.log(`🎨 Inventory: ${totalInventory} fabric colors`);
    console.log(`🧵 Tailors: ${totalTailors} approved and available`);
    
    console.log('\n🎉 Gurugram zone setup completed successfully!');
    console.log('\n📱 Users in Gurugram can now:');
    console.log('   • See available services in their area');
    console.log('   • Browse fabric colors and place orders');
    console.log('   • Get automatically assigned to local tailors');
    console.log('\n🔧 Admin panel ready for:');
    console.log('   • Managing inventory across zones');
    console.log('   • Monitoring tailor assignments');
    console.log('   • Tracking orders and payments');

  } catch (error) {
    console.error('❌ Error setting up Gurugram zone:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupGurugramComplete()
    .then(() => {
      console.log('\n✨ Complete setup finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupGurugramComplete };