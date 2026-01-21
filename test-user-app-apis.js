#!/usr/bin/env node

/**
 * Test script to verify user app APIs are working correctly
 * Run with: node test-user-app-apis.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testUserAppAPIs() {
  console.log('🧪 Testing User App APIs...\n');

  try {
    // Test 1: Zone detection
    console.log('1️⃣ Testing zone detection...');
    const zoneResponse = await axios.post(`${API_BASE_URL}/location/zone`, {
      latitude: 28.4595,
      longitude: 77.0266
    });
    
    console.log('Zone Response:', JSON.stringify(zoneResponse.data, null, 2));
    
    if (zoneResponse.data.success && zoneResponse.data.data?.zoneId) {
      console.log('✅ Zone detection working');
      const zoneId = zoneResponse.data.data.zoneId;
      
      // Test 2: Service discovery
      console.log('\n2️⃣ Testing service discovery...');
      const servicesResponse = await axios.post(`${API_BASE_URL}/services/get-services`, {
        zoneId: zoneId
      });
      
      console.log('Services Response:', JSON.stringify(servicesResponse.data, null, 2));
      
      if (servicesResponse.data.success && servicesResponse.data.data?.services) {
        console.log(`✅ Service discovery working - ${servicesResponse.data.data.services.length} services found`);
        
        // Test 3: Location save (without auth - should work with auto zone detection)
        console.log('\n3️⃣ Testing location save (without auth)...');
        try {
          const saveResponse = await axios.post(`${API_BASE_URL}/location/save`, {
            latitude: 28.4595,
            longitude: 77.0266,
            address: 'Test Location, Gurugram'
          });
          
          console.log('Save Response:', JSON.stringify(saveResponse.data, null, 2));
          console.log('✅ Location save working (auto zone detection)');
        } catch (saveError) {
          console.log('⚠️ Location save failed (expected without auth):', saveError.response?.data?.error?.message);
        }
        
      } else {
        console.log('❌ Service discovery failed - no services found');
      }
    } else {
      console.log('❌ Zone detection failed');
    }

    console.log('\n🎉 API tests completed!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testUserAppAPIs();