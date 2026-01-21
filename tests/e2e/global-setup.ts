import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Setup...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend to be ready...');
    await page.goto(`${process.env.API_BASE_URL || 'http://localhost:3000'}/health`);
    await page.waitForResponse(response => 
      response.url().includes('/health') && response.status() === 200,
      { timeout: 60000 }
    );
    console.log('✅ Backend is ready');
    
    // Wait for admin panel to be ready
    console.log('⏳ Waiting for admin panel to be ready...');
    await page.goto(`${process.env.BASE_URL || 'http://localhost:3001'}`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Admin panel is ready');
    
    // Setup test data
    console.log('📊 Setting up test data...');
    await setupTestData();
    console.log('✅ Test data setup complete');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎉 E2E Test Setup Complete!');
}

async function setupTestData() {
  // Create test admin user
  const adminData = {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Test Admin'
  };
  
  // Create test services
  const testServices = [
    {
      id: 'service-1',
      name: 'Blouse',
      category: 'women',
      basePrice: 500,
      estimatedTime: 120
    },
    {
      id: 'service-2',
      name: 'Kurti',
      category: 'women',
      basePrice: 800,
      estimatedTime: 180
    }
  ];
  
  // Create test location zones
  const testZones = [
    {
      id: 'mumbai',
      name: 'Mumbai',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    {
      id: 'delhi',
      name: 'Delhi',
      coordinates: { lat: 28.7041, lng: 77.1025 }
    }
  ];
  
  // Create test inventory
  const testInventory = [
    {
      zoneId: 'mumbai',
      colorName: 'Red',
      colorCode: '#FF0000',
      availableQuantity: 100
    },
    {
      zoneId: 'mumbai',
      colorName: 'Blue',
      colorCode: '#0000FF',
      availableQuantity: 150
    }
  ];
  
  console.log('Test data created successfully');
}

export default globalSetup;