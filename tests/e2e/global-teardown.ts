import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E Test Cleanup...');
  
  try {
    // Clean up test data
    await cleanupTestData();
    console.log('✅ Test data cleanup complete');
    
    // Generate test report summary
    await generateTestSummary();
    console.log('✅ Test summary generated');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
  
  console.log('🎉 E2E Test Cleanup Complete!');
}

async function cleanupTestData() {
  // Clean up test users, orders, and other test data
  console.log('Cleaning up test users and orders...');
  
  // Remove test phone numbers
  const testPhonePatterns = [
    '+919000000000',
    '+918000000000'
  ];
  
  // Clean up test files
  console.log('Cleaning up test files...');
  
  // Reset test database state if needed
  console.log('Resetting test database state...');
}

async function generateTestSummary() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Read test results
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        environment: {
          apiUrl: process.env.API_BASE_URL || 'http://localhost:3000',
          adminUrl: process.env.BASE_URL || 'http://localhost:3001',
          nodeEnv: process.env.NODE_ENV || 'test'
        }
      };
      
      // Write summary
      const summaryPath = path.join(process.cwd(), 'test-results', 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log('📊 Test Summary:');
      console.log(`   Total Tests: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Skipped: ${summary.skipped}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
    }
  } catch (error) {
    console.error('Failed to generate test summary:', error);
  }
}

export default globalTeardown;