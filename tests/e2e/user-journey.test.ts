/**
 * End-to-End Test: Complete User Journey
 * Tests the complete user flow from registration to service completion
 */

import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ADMIN_PANEL_URL = process.env.ADMIN_PANEL_URL || 'http://localhost:3001';

test.describe('Complete User Journey', () => {
  let userPhone: string;
  let tailorPhone: string;
  let orderId: string;
  let userToken: string;
  let tailorToken: string;

  test.beforeAll(async () => {
    // Generate unique phone numbers for this test run
    const timestamp = Date.now();
    userPhone = `+91900000${timestamp.toString().slice(-4)}`;
    tailorPhone = `+91800000${timestamp.toString().slice(-4)}`;
  });

  test('User Registration and Authentication', async ({ request }) => {
    // Send OTP for user registration
    const otpResponse = await request.post(`${API_BASE_URL}/auth/send-otp`, {
      data: {
        phoneNumber: userPhone,
        userType: 'user'
      }
    });
    
    expect(otpResponse.ok()).toBeTruthy();
    const otpData = await otpResponse.json();
    expect(otpData.success).toBe(true);

    // Verify OTP (using test OTP in development)
    const verifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: {
        otpId: otpData.otpId,
        otp: '123456' // Test OTP
      }
    });

    expect(verifyResponse.ok()).toBeTruthy();
    const verifyData = await verifyResponse.json();
    expect(verifyData.success).toBe(true);
    expect(verifyData.isNewUser).toBe(true);
    
    userToken = verifyData.token;
  });

  test('User Profile Creation', async ({ request }) => {
    const profileResponse = await request.post(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        gender: 'female'
      }
    });

    expect(profileResponse.ok()).toBeTruthy();
    const profileData = await profileResponse.json();
    expect(profileData.success).toBe(true);
  });

  test('Tailor Registration and KYC', async ({ request }) => {
    // Tailor registration
    const tailorOtpResponse = await request.post(`${API_BASE_URL}/auth/send-otp`, {
      data: {
        phoneNumber: tailorPhone,
        userType: 'tailor'
      }
    });
    
    expect(tailorOtpResponse.ok()).toBeTruthy();
    const tailorOtpData = await tailorOtpResponse.json();

    const tailorVerifyResponse = await request.post(`${API_BASE_URL}/auth/verify-otp`, {
      data: {
        otpId: tailorOtpData.otpId,
        otp: '123456'
      }
    });

    const tailorVerifyData = await tailorVerifyResponse.json();
    tailorToken = tailorVerifyData.token;

    // Submit KYC
    const kycResponse = await request.post(`${API_BASE_URL}/tailors/kyc`, {
      headers: {
        'Authorization': `Bearer ${tailorToken}`
      },
      data: {
        name: 'Test Tailor',
        email: 'testtailor@example.com',
        age: 30,
        aadhaarNumber: '123456789012',
        panNumber: 'ABCDE1234F',
        // Mock file uploads
        aadhaarFrontImage: 'mock-aadhaar-front.jpg',
        aadhaarBackImage: 'mock-aadhaar-back.jpg',
        panFrontImage: 'mock-pan-front.jpg',
        profileImage: 'mock-profile.jpg'
      }
    });

    expect(kycResponse.ok()).toBeTruthy();
  });

  test('Admin KYC Approval', async ({ request }) => {
    // Admin login (assuming admin credentials are set)
    const adminLoginResponse = await request.post(`${API_BASE_URL}/admin/login`, {
      data: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    });

    const adminData = await adminLoginResponse.json();
    const adminToken = adminData.token;

    // Get pending KYC applications
    const pendingKycResponse = await request.get(`${API_BASE_URL}/admin/kyc/pending`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const pendingKyc = await pendingKycResponse.json();
    const tailorKyc = pendingKyc.data.find((kyc: any) => kyc.tailor.phoneNumber === tailorPhone);

    // Approve KYC
    const approveResponse = await request.post(`${API_BASE_URL}/admin/kyc/${tailorKyc.id}/approve`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(approveResponse.ok()).toBeTruthy();
  });

  test('User Location Setup', async ({ request }) => {
    const locationResponse = await request.post(`${API_BASE_URL}/users/location`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      data: {
        type: 'manual',
        address: {
          addressLine1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          latitude: 19.0760,
          longitude: 72.8777
        }
      }
    });

    expect(locationResponse.ok()).toBeTruthy();
  });

  test('Service Discovery and Selection', async ({ request }) => {
    // Get available services
    const servicesResponse = await request.get(`${API_BASE_URL}/services`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(servicesResponse.ok()).toBeTruthy();
    const servicesData = await servicesResponse.json();
    expect(servicesData.data.length).toBeGreaterThan(0);

    // Get sub-services for first service
    const serviceId = servicesData.data[0].id;
    const subServicesResponse = await request.get(`${API_BASE_URL}/services/${serviceId}/sub-services`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(subServicesResponse.ok()).toBeTruthy();
  });

  test('Service Booking Flow', async ({ request }) => {
    // Create booking
    const bookingResponse = await request.post(`${API_BASE_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      data: {
        serviceId: 'service-1',
        subServiceId: 'sub-service-1',
        customizations: [
          {
            optionId: 'option-1',
            choiceId: 'choice-1'
          }
        ],
        measurements: {
          bust: 36,
          waist: 30,
          hip: 38
        },
        fabricColor: 'red',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        scheduledTime: '10:00'
      }
    });

    expect(bookingResponse.ok()).toBeTruthy();
    const bookingData = await bookingResponse.json();
    orderId = bookingData.orderId;
  });

  test('Payment Processing', async ({ request }) => {
    // Create payment order
    const paymentOrderResponse = await request.post(`${API_BASE_URL}/payments/create-order`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      data: {
        orderId: orderId
      }
    });

    expect(paymentOrderResponse.ok()).toBeTruthy();
    const paymentOrderData = await paymentOrderResponse.json();

    // Simulate payment success
    const paymentSuccessResponse = await request.post(`${API_BASE_URL}/payments/verify`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      data: {
        razorpayOrderId: paymentOrderData.razorpayOrderId,
        razorpayPaymentId: 'mock_payment_id',
        razorpaySignature: 'mock_signature'
      }
    });

    expect(paymentSuccessResponse.ok()).toBeTruthy();
  });

  test('Order Tracking and Status Updates', async ({ request }) => {
    // Check order status
    const orderResponse = await request.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(orderResponse.ok()).toBeTruthy();
    const orderData = await orderResponse.json();
    expect(orderData.data.status).toBe('confirmed');
  });

  test('Service Execution with OTP', async ({ request }) => {
    // Generate start service OTP
    const startOtpResponse = await request.post(`${API_BASE_URL}/orders/${orderId}/start-otp`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(startOtpResponse.ok()).toBeTruthy();
    const startOtpData = await startOtpResponse.json();

    // Tailor verifies start OTP
    const verifyStartResponse = await request.post(`${API_BASE_URL}/orders/${orderId}/verify-start`, {
      headers: {
        'Authorization': `Bearer ${tailorToken}`
      },
      data: {
        otp: startOtpData.otp
      }
    });

    expect(verifyStartResponse.ok()).toBeTruthy();

    // Generate completion OTP
    const completeOtpResponse = await request.post(`${API_BASE_URL}/orders/${orderId}/complete-otp`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    const completeOtpData = await completeOtpResponse.json();

    // Tailor verifies completion OTP
    const verifyCompleteResponse = await request.post(`${API_BASE_URL}/orders/${orderId}/verify-complete`, {
      headers: {
        'Authorization': `Bearer ${tailorToken}`
      },
      data: {
        otp: completeOtpData.otp
      }
    });

    expect(verifyCompleteResponse.ok()).toBeTruthy();
  });

  test('Payment Release and Commission', async ({ request }) => {
    // Wait for payment hold period (simulated)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check payment status
    const paymentStatusResponse = await request.get(`${API_BASE_URL}/orders/${orderId}/payment-status`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(paymentStatusResponse.ok()).toBeTruthy();
    const paymentStatus = await paymentStatusResponse.json();
    expect(paymentStatus.data.status).toBe('released');
  });

  test('Real-time Notifications', async ({ request }) => {
    // Test notification delivery (mock)
    const notificationResponse = await request.get(`${API_BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    expect(notificationResponse.ok()).toBeTruthy();
    const notifications = await notificationResponse.json();
    expect(notifications.data.length).toBeGreaterThan(0);
  });
});