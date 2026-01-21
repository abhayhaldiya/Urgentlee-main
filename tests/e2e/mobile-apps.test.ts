/**
 * End-to-End Test: Mobile Apps Integration
 * Tests mobile app functionality and API integration
 */

import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Mobile Apps E2E Tests', () => {
  let userToken: string;
  let tailorToken: string;

  test.beforeAll(async ({ request }) => {
    // Setup test users
    const userPhone = `+91900000${Date.now().toString().slice(-4)}`;
    const tailorPhone = `+91800000${Date.now().toString().slice(-4)}`;

    // Register user
    const userOtpResponse = await request.post(`${API_BASE_URL}/auth/send-otp`, {
      data: { phoneNumber: userPhone, userType: 'user' }
    });
    const userOtpData = await userOtpResponse.json();
    
    const userVerifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: { otpId: userOtpData.otpId, otp: '123456' }
    });
    const userData = await userVerifyResponse.json();
    userToken = userData.token;

    // Register tailor
    const tailorOtpResponse = await request.post(`${API_BASE_URL}/auth/send-otp`, {
      data: { phoneNumber: tailorPhone, userType: 'tailor' }
    });
    const tailorOtpData = await tailorOtpResponse.json();
    
    const tailorVerifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: { otpId: tailorOtpData.otpId, otp: '123456' }
    });
    const tailorData = await tailorVerifyResponse.json();
    tailorToken = tailorData.token;
  });

  test('User App - Authentication Flow', async ({ request }) => {
    // Test token validation
    const profileResponse = await request.get(`${API_BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    expect(profileResponse.ok()).toBeTruthy();
    
    // Test token refresh
    const refreshResponse = await request.post(`${API_BASE_URL}/auth/refresh`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    expect(refreshResponse.ok()).toBeTruthy();
  });

  test('User App - Location Services', async ({ request }) => {
    // Test location update
    const locationResponse = await request.post(`${API_BASE_URL}/users/location`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        type: 'gps',
        coordinates: {
          latitude: 19.0760,
          longitude: 72.8777
        }
      }
    });
    
    expect(locationResponse.ok()).toBeTruthy();
    
    // Test location-based services
    const servicesResponse = await request.get(`${API_BASE_URL}/services/nearby`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    expect(servicesResponse.ok()).toBeTruthy();
    const servicesData = await servicesResponse.json();
    expect(servicesData.data).toBeDefined();
  });

  test('User App - Service Booking', async ({ request }) => {
    // Test service selection
    const servicesResponse = await request.get(`${API_BASE_URL}/services`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    const services = await servicesResponse.json();
    expect(services.data.length).toBeGreaterThan(0);
    
    // Test customization options
    const customizationResponse = await request.get(`${API_BASE_URL}/services/${services.data[0].id}/customizations`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    expect(customizationResponse.ok()).toBeTruthy();
    
    // Test price calculation
    const priceResponse = await request.post(`${API_BASE_URL}/bookings/calculate-price`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        serviceId: services.data[0].id,
        customizations: []
      }
    });
    
    expect(priceResponse.ok()).toBeTruthy();
  });

  test('User App - Payment Integration', async ({ request }) => {
    // Create test booking
    const bookingResponse = await request.post(`${API_BASE_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        serviceId: 'test-service',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        scheduledTime: '10:00'
      }
    });
    
    const booking = await bookingResponse.json();
    
    // Test payment order creation
    const paymentOrderResponse = await request.post(`${API_BASE_URL}/payments/create-order`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: { orderId: booking.orderId }
    });
    
    expect(paymentOrderResponse.ok()).toBeTruthy();
    const paymentOrder = await paymentOrderResponse.json();
    expect(paymentOrder.razorpayOrderId).toBeDefined();
  });

  test('Tailor App - KYC Submission', async ({ request }) => {
    // Test KYC data submission
    const kycResponse = await request.post(`${API_BASE_URL}/tailors/kyc`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` },
      data: {
        name: 'Test Tailor',
        email: 'testtailor@example.com',
        age: 30,
        aadhaarNumber: '123456789012',
        panNumber: 'ABCDE1234F'
      }
    });
    
    expect(kycResponse.ok()).toBeTruthy();
    
    // Test KYC status check
    const statusResponse = await request.get(`${API_BASE_URL}/tailors/kyc-status`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` }
    });
    
    expect(statusResponse.ok()).toBeTruthy();
    const status = await statusResponse.json();
    expect(status.data.status).toBe('pending');
  });

  test('Tailor App - Order Management', async ({ request }) => {
    // Test getting assigned orders
    const ordersResponse = await request.get(`${API_BASE_URL}/tailors/orders`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` }
    });
    
    expect(ordersResponse.ok()).toBeTruthy();
    
    // Test availability management
    const availabilityResponse = await request.post(`${API_BASE_URL}/tailors/availability`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` },
      data: {
        isAvailable: false,
        reason: 'Personal work'
      }
    });
    
    expect(availabilityResponse.ok()).toBeTruthy();
  });

  test('Real-time Synchronization', async ({ request }) => {
    // Create order as user
    const orderResponse = await request.post(`${API_BASE_URL}/bookings`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        serviceId: 'test-service',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    const order = await orderResponse.json();
    
    // Check if tailor receives the order
    const tailorOrdersResponse = await request.get(`${API_BASE_URL}/tailors/orders`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` }
    });
    
    const tailorOrders = await tailorOrdersResponse.json();
    const assignedOrder = tailorOrders.data.find((o: any) => o.id === order.orderId);
    
    expect(assignedOrder).toBeDefined();
  });

  test('Push Notification Integration', async ({ request }) => {
    // Register device token for user
    const userTokenResponse = await request.post(`${API_BASE_URL}/notifications/register-device`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        deviceToken: 'test-user-device-token',
        platform: 'android'
      }
    });
    
    expect(userTokenResponse.ok()).toBeTruthy();
    
    // Register device token for tailor
    const tailorTokenResponse = await request.post(`${API_BASE_URL}/notifications/register-device`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` },
      data: {
        deviceToken: 'test-tailor-device-token',
        platform: 'ios'
      }
    });
    
    expect(tailorTokenResponse.ok()).toBeTruthy();
    
    // Test notification sending
    const notificationResponse = await request.post(`${API_BASE_URL}/notifications/send-test`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        title: 'Test Notification',
        body: 'This is a test notification'
      }
    });
    
    expect(notificationResponse.ok()).toBeTruthy();
  });

  test('File Upload Integration', async ({ request }) => {
    // Test image upload for user (reference images)
    const userUploadResponse = await request.post(`${API_BASE_URL}/upload/reference-image`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      multipart: {
        file: {
          name: 'test-image.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data')
        }
      }
    });
    
    expect(userUploadResponse.ok()).toBeTruthy();
    
    // Test document upload for tailor (KYC documents)
    const tailorUploadResponse = await request.post(`${API_BASE_URL}/upload/kyc-document`, {
      headers: { 'Authorization': `Bearer ${tailorToken}` },
      multipart: {
        file: {
          name: 'aadhaar.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-document-data')
        }
      }
    });
    
    expect(tailorUploadResponse.ok()).toBeTruthy();
  });

  test('Offline Capability', async ({ request }) => {
    // Test data caching
    const cacheResponse = await request.get(`${API_BASE_URL}/cache/user-data`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    expect(cacheResponse.ok()).toBeTruthy();
    
    // Test offline queue
    const queueResponse = await request.post(`${API_BASE_URL}/offline/queue-action`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        action: 'update_profile',
        data: { name: 'Updated Name' },
        timestamp: Date.now()
      }
    });
    
    expect(queueResponse.ok()).toBeTruthy();
  });

  test('Error Handling and Recovery', async ({ request }) => {
    // Test invalid token handling
    const invalidTokenResponse = await request.get(`${API_BASE_URL}/users/profile`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    
    expect(invalidTokenResponse.status()).toBe(401);
    
    // Test network error simulation
    const timeoutResponse = await request.get(`${API_BASE_URL}/test/timeout`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      timeout: 1000
    });
    
    // Should handle timeout gracefully
    expect(timeoutResponse.ok() || timeoutResponse.status() === 408).toBeTruthy();
  });
});