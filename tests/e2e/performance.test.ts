/**
 * End-to-End Test: Performance and Load Testing
 * Tests system performance under various load conditions
 */

import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Performance Tests', () => {
  test('API Response Times', async ({ request }) => {
    const endpoints = [
      '/health',
      '/services',
      '/auth/send-otp',
      '/users/profile'
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      let response;
      if (endpoint === '/users/profile') {
        // This endpoint requires authentication
        response = await request.get(`${API_BASE_URL}${endpoint}`, {
          headers: { 'Authorization': 'Bearer test-token' }
        });
      } else if (endpoint === '/auth/send-otp') {
        response = await request.post(`${API_BASE_URL}${endpoint}`, {
          data: { phoneNumber: '+919000000000', userType: 'user' }
        });
      } else {
        response = await request.get(`${API_BASE_URL}${endpoint}`);
      }
      
      const responseTime = Date.now() - startTime;
      
      console.log(`${endpoint}: ${responseTime}ms`);
      
      // API responses should be under 2 seconds
      expect(responseTime).toBeLessThan(2000);
      
      // Health endpoint should be very fast
      if (endpoint === '/health') {
        expect(responseTime).toBeLessThan(500);
      }
    }
  });

  test('Concurrent User Registration', async ({ request }) => {
    const concurrentUsers = 10;
    const promises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      const phoneNumber = `+91900000${String(i).padStart(4, '0')}`;
      
      const promise = request.post(`${API_BASE_URL}/auth/send-otp`, {
        data: {
          phoneNumber,
          userType: 'user'
        }
      });
      
      promises.push(promise);
    }

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    // All requests should complete
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });

    // Concurrent requests should complete within reasonable time
    expect(totalTime).toBeLessThan(5000);
    
    console.log(`${concurrentUsers} concurrent registrations completed in ${totalTime}ms`);
  });

  test('Database Query Performance', async ({ request }) => {
    // Test complex queries
    const queries = [
      '/services?location=mumbai&category=women',
      '/orders?status=active&limit=50',
      '/tailors?zone=mumbai&available=true',
      '/analytics/orders?period=30d'
    ];

    for (const query of queries) {
      const startTime = Date.now();
      
      const response = await request.get(`${API_BASE_URL}${query}`, {
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      
      const queryTime = Date.now() - startTime;
      
      console.log(`Query ${query}: ${queryTime}ms`);
      
      // Database queries should be optimized
      expect(queryTime).toBeLessThan(1000);
    }
  });

  test('File Upload Performance', async ({ request }) => {
    // Test different file sizes
    const fileSizes = [
      { name: 'small', size: 100 * 1024 }, // 100KB
      { name: 'medium', size: 1024 * 1024 }, // 1MB
      { name: 'large', size: 5 * 1024 * 1024 } // 5MB
    ];

    for (const fileSize of fileSizes) {
      const fakeFileData = Buffer.alloc(fileSize.size, 'x');
      
      const startTime = Date.now();
      
      const response = await request.post(`${API_BASE_URL}/upload/test`, {
        headers: { 'Authorization': 'Bearer test-token' },
        multipart: {
          file: {
            name: `test-${fileSize.name}.jpg`,
            mimeType: 'image/jpeg',
            buffer: fakeFileData
          }
        }
      });
      
      const uploadTime = Date.now() - startTime;
      
      console.log(`Upload ${fileSize.name} (${fileSize.size} bytes): ${uploadTime}ms`);
      
      // Upload time should be reasonable based on file size
      const expectedMaxTime = Math.max(2000, fileSize.size / 1024); // 1KB per ms minimum
      expect(uploadTime).toBeLessThan(expectedMaxTime);
    }
  });

  test('Memory Usage Monitoring', async ({ request }) => {
    // Monitor memory usage during operations
    const initialMemory = await request.get(`${API_BASE_URL}/debug/memory`);
    const initialData = await initialMemory.json();
    
    // Perform memory-intensive operations
    const operations = [];
    for (let i = 0; i < 100; i++) {
      operations.push(
        request.post(`${API_BASE_URL}/test/memory-intensive`, {
          data: { iteration: i }
        })
      );
    }
    
    await Promise.all(operations);
    
    // Check memory after operations
    const finalMemory = await request.get(`${API_BASE_URL}/debug/memory`);
    const finalData = await finalMemory.json();
    
    // Memory usage should not increase dramatically
    const memoryIncrease = finalData.heapUsed - initialData.heapUsed;
    const memoryIncreasePercent = (memoryIncrease / initialData.heapUsed) * 100;
    
    console.log(`Memory increase: ${memoryIncreasePercent.toFixed(2)}%`);
    
    // Memory increase should be reasonable (less than 50%)
    expect(memoryIncreasePercent).toBeLessThan(50);
  });

  test('Cache Performance', async ({ request }) => {
    const cacheKey = 'test-performance-cache';
    
    // First request (cache miss)
    const startTime1 = Date.now();
    const response1 = await request.get(`${API_BASE_URL}/cache/test/${cacheKey}`);
    const time1 = Date.now() - startTime1;
    
    expect(response1.ok()).toBeTruthy();
    
    // Second request (cache hit)
    const startTime2 = Date.now();
    const response2 = await request.get(`${API_BASE_URL}/cache/test/${cacheKey}`);
    const time2 = Date.now() - startTime2;
    
    expect(response2.ok()).toBeTruthy();
    
    console.log(`Cache miss: ${time1}ms, Cache hit: ${time2}ms`);
    
    // Cache hit should be significantly faster
    expect(time2).toBeLessThan(time1 * 0.5);
    expect(time2).toBeLessThan(100); // Cache hits should be very fast
  });

  test('Slot Locking Performance', async ({ request }) => {
    // Test concurrent slot booking
    const slotId = 'test-slot-performance';
    const concurrentBookings = 20;
    
    const bookingPromises = [];
    
    for (let i = 0; i < concurrentBookings; i++) {
      const userToken = `test-user-${i}`;
      
      const promise = request.post(`${API_BASE_URL}/slots/${slotId}/reserve`, {
        headers: { 'Authorization': `Bearer ${userToken}` },
        data: { userId: `user-${i}` }
      });
      
      bookingPromises.push(promise);
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(bookingPromises);
    const totalTime = Date.now() - startTime;
    
    // Only one booking should succeed
    const successfulBookings = responses.filter(r => r.ok()).length;
    expect(successfulBookings).toBe(1);
    
    // All responses should be received quickly
    expect(totalTime).toBeLessThan(3000);
    
    console.log(`${concurrentBookings} concurrent slot bookings processed in ${totalTime}ms`);
  });

  test('Real-time Updates Performance', async ({ request }) => {
    // Test WebSocket connection performance
    const connections = 10;
    const messages = 50;
    
    // Simulate multiple WebSocket connections
    const connectionPromises = [];
    
    for (let i = 0; i < connections; i++) {
      const promise = request.post(`${API_BASE_URL}/websocket/test-connection`, {
        data: { connectionId: `conn-${i}` }
      });
      
      connectionPromises.push(promise);
    }
    
    await Promise.all(connectionPromises);
    
    // Send multiple messages
    const messagePromises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < messages; i++) {
      const promise = request.post(`${API_BASE_URL}/websocket/broadcast`, {
        data: {
          type: 'order_update',
          payload: { orderId: `order-${i}`, status: 'updated' }
        }
      });
      
      messagePromises.push(promise);
    }
    
    await Promise.all(messagePromises);
    const totalTime = Date.now() - startTime;
    
    console.log(`${messages} real-time messages sent to ${connections} connections in ${totalTime}ms`);
    
    // Real-time updates should be fast
    expect(totalTime).toBeLessThan(2000);
  });

  test('Search Performance', async ({ request }) => {
    const searchQueries = [
      'blouse',
      'kurti designer',
      'suit wedding',
      'alteration',
      'mumbai tailor'
    ];
    
    for (const query of searchQueries) {
      const startTime = Date.now();
      
      const response = await request.get(`${API_BASE_URL}/search`, {
        params: { q: query, limit: 20 }
      });
      
      const searchTime = Date.now() - startTime;
      
      expect(response.ok()).toBeTruthy();
      
      console.log(`Search "${query}": ${searchTime}ms`);
      
      // Search should be fast
      expect(searchTime).toBeLessThan(1000);
    }
  });
});