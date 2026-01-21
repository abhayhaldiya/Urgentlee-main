/**
 * End-to-End Test: Admin Panel Functionality
 * Tests admin panel operations and management features
 */

import { test, expect } from '@playwright/test';

const ADMIN_PANEL_URL = process.env.ADMIN_PANEL_URL || 'http://localhost:3001';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Admin Panel E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login to admin panel
    await page.goto(`${ADMIN_PANEL_URL}/login`);
    
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForURL(`${ADMIN_PANEL_URL}/dashboard`);
  });

  test('Dashboard Overview', async ({ page }) => {
    // Check dashboard elements
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-tailors"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-kyc"]')).toBeVisible();

    // Check charts are rendered
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status-chart"]')).toBeVisible();
  });

  test('Tailor KYC Management', async ({ page }) => {
    // Navigate to KYC pending page
    await page.click('[data-testid="tailors-menu"]');
    await page.click('[data-testid="kyc-pending-link"]');
    
    await page.waitForURL(`${ADMIN_PANEL_URL}/tailors/kyc-pending`);

    // Check if KYC applications are listed
    const kycApplications = page.locator('[data-testid="kyc-application"]');
    
    if (await kycApplications.count() > 0) {
      // Click on first application
      await kycApplications.first().click();
      
      // Check KYC details are displayed
      await expect(page.locator('[data-testid="kyc-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="aadhaar-images"]')).toBeVisible();
      await expect(page.locator('[data-testid="pan-images"]')).toBeVisible();
      
      // Test approval
      await page.click('[data-testid="approve-button"]');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('Order Management', async ({ page }) => {
    // Navigate to orders page
    await page.click('[data-testid="orders-menu"]');
    
    await page.waitForURL(`${ADMIN_PANEL_URL}/orders`);

    // Test order filtering
    await page.selectOption('[data-testid="status-filter"]', 'active');
    await page.click('[data-testid="apply-filter"]');
    
    // Check filtered results
    const orderRows = page.locator('[data-testid="order-row"]');
    
    if (await orderRows.count() > 0) {
      // Click on first order
      await orderRows.first().click();
      
      // Check order details
      await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="customer-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="tailor-info"]')).toBeVisible();
      
      // Test order reassignment
      await page.click('[data-testid="reassign-button"]');
      await page.selectOption('[data-testid="tailor-select"]', { index: 1 });
      await page.click('[data-testid="confirm-reassign"]');
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('Payment Management', async ({ page }) => {
    // Navigate to payments page
    await page.click('[data-testid="payments-menu"]');
    
    await page.waitForURL(`${ADMIN_PANEL_URL}/payments`);

    // Check payment overview
    await expect(page.locator('[data-testid="total-payments"]')).toBeVisible();
    await expect(page.locator('[data-testid="held-payments"]')).toBeVisible();
    await expect(page.locator('[data-testid="released-payments"]')).toBeVisible();

    // Navigate to held payments
    await page.click('[data-testid="held-payments-link"]');
    
    const heldPayments = page.locator('[data-testid="held-payment"]');
    
    if (await heldPayments.count() > 0) {
      // Test payment release
      await heldPayments.first().locator('[data-testid="release-button"]').click();
      await page.fill('[data-testid="release-reason"]', 'Service completed successfully');
      await page.click('[data-testid="confirm-release"]');
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('Inventory Management', async ({ page }) => {
    // Navigate to inventory page
    await page.click('[data-testid="inventory-menu"]');
    
    await page.waitForURL(`${ADMIN_PANEL_URL}/inventory`);

    // Test zone selection
    await page.selectOption('[data-testid="zone-select"]', 'mumbai');
    
    // Check inventory items
    await expect(page.locator('[data-testid="inventory-grid"]')).toBeVisible();
    
    const inventoryItems = page.locator('[data-testid="inventory-item"]');
    
    if (await inventoryItems.count() > 0) {
      // Test stock update
      await inventoryItems.first().locator('[data-testid="edit-stock"]').click();
      await page.fill('[data-testid="stock-quantity"]', '100');
      await page.click('[data-testid="save-stock"]');
      
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('Analytics and Reports', async ({ page }) => {
    // Navigate to dashboard for analytics
    await page.goto(`${ADMIN_PANEL_URL}/dashboard`);

    // Test date range selection
    await page.click('[data-testid="date-range-picker"]');
    await page.click('[data-testid="last-30-days"]');
    
    // Wait for charts to update
    await page.waitForTimeout(2000);
    
    // Check if charts are updated
    await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-trends"]')).toBeVisible();
    
    // Test export functionality
    await page.click('[data-testid="export-report"]');
    await page.selectOption('[data-testid="report-type"]', 'orders');
    await page.click('[data-testid="generate-report"]');
    
    // Check download starts
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-report"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('orders_report');
  });

  test('Real-time Updates', async ({ page }) => {
    // Navigate to orders page
    await page.goto(`${ADMIN_PANEL_URL}/orders`);
    
    // Check for real-time update indicators
    await expect(page.locator('[data-testid="live-indicator"]')).toBeVisible();
    
    // Simulate new order creation (via API)
    const response = await page.request.post(`${API_BASE_URL}/test/create-order`, {
      data: {
        testOrder: true
      }
    });
    
    if (response.ok()) {
      // Wait for real-time update
      await page.waitForTimeout(3000);
      
      // Check if new order appears
      const orderCount = await page.locator('[data-testid="order-row"]').count();
      expect(orderCount).toBeGreaterThan(0);
    }
  });

  test('Responsive Design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check layout adapts
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
});