#!/usr/bin/env node

/**
 * Setup script to create sample tailors for Gurugram zone
 * Run with: node scripts/setup-gurugram-tailors.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupGurugramTailors() {
  try {
    console.log('🧵 Setting up sample tailors for Gurugram zone...');

    // Find the Gurugram zone
    const gurugramZone = await prisma.locationZone.findFirst({
      where: {
        city: 'Gurugram',
        state: 'Haryana',
        isActive: true
      }
    });

    if (!gurugramZone) {
      console.error('❌ Gurugram zone not found. Please run setup-gurugram-zone.js first.');
      process.exit(1);
    }

    console.log(`✅ Found Gurugram zone: ${gurugramZone.name}`);

    // Sample tailors data
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

    // Create tailors
    for (const tailorData of tailorsData) {
      // Create tailor
      const tailor = await prisma.tailor.upsert({
        where: { phoneNumber: tailorData.phoneNumber },
        update: {
          name: tailorData.name,
          email: tailorData.email,
          age: tailorData.age,
          profileImage: tailorData.profileImage,
          kycStatus: 'APPROVED', // Pre-approved for demo
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
          kycStatus: 'APPROVED', // Pre-approved for demo
          isAvailable: true,
          rating: tailorData.rating,
          totalOrders: tailorData.totalOrders
        }
      });

      // Create KYC data (mock data for demo)
      await prisma.kYCData.upsert({
        where: { tailorId: tailor.id },
        update: {
          aadhaarNumber: '1234-5678-9012',
          aadhaarFrontImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=Aadhaar+Front',
          aadhaarBackImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=Aadhaar+Back',
          panNumber: 'ABCDE1234F',
          panFrontImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=PAN+Front',
          panBackImage: 'https://via.placeholder.com/400x250/cccccc/000000?text=PAN+Back',
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

      console.log(`✅ Created tailor: ${tailor.name} (${tailor.phoneNumber})`);
    }

    console.log('\n🎉 Gurugram tailors setup completed successfully!');
    console.log(`Created ${tailorsData.length} tailors in ${gurugramZone.name}`);
    console.log('All tailors are KYC approved and available for assignments');

    // Show summary
    const totalTailors = await prisma.tailor.count({
      where: {
        locationZones: {
          some: {
            zoneId: gurugramZone.id,
            isActive: true
          }
        }
      }
    });

    console.log(`\n📊 Zone Summary:`);
    console.log(`Zone: ${gurugramZone.name}`);
    console.log(`Total Tailors: ${totalTailors}`);
    console.log(`Available Tailors: ${totalTailors}`);

  } catch (error) {
    console.error('❌ Error setting up Gurugram tailors:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupGurugramTailors()
    .then(() => {
      console.log('\n✨ Tailors setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tailors setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupGurugramTailors };