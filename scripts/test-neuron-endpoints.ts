/**
 * Test Neuron Webhook Endpoints
 * 
 * Tests the external lead submission system (Neuron endpoints)
 * Verifies: Single submission, bulk submission, and public API
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Use localhost for testing, override with NEXT_PUBLIC_APP_URL if needed
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const NEURON_API_KEY = process.env.NEURON_API_KEY || 'test-key';

interface TestResult {
  endpoint: string;
  status: 'PASS' | 'FAIL';
  message: string;
  leadId?: string;
}

/**
 * Test single lead submission (authenticated)
 */
async function testSingleSubmission(): Promise<TestResult> {
  try {
    console.log('🧪 Testing: POST /api/agent/neurons/submit-lead');
    
    const response = await fetch(`${BASE_URL}/api/agent/neurons/submit-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEURON_API_KEY}`,
      },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        companyName: 'Test Company Neuron',
        jobTitle: 'CTO',
        firstName: 'Test',
        lastName: 'User',
        source: 'neuron_test',
        metadata: {
          testRun: true,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    let data: any;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.log(`   ⚠️  Response not JSON: ${response.status} ${response.statusText}`);
      data = { error: `Invalid JSON response: ${response.statusText}` };
    }

    if (response.ok && data.success) {
      console.log(`   ✅ Success: Lead submitted (ID: ${data.leadId})`);
      return {
        endpoint: '/api/agent/neurons/submit-lead',
        status: 'PASS',
        message: 'Single lead submission successful',
        leadId: data.leadId,
      };
    } else {
      console.log(`   ❌ Failed: ${data.error || response.statusText}`);
      return {
        endpoint: '/api/agent/neurons/submit-lead',
        status: 'FAIL',
        message: data.error || response.statusText,
      };
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: '/api/agent/neurons/submit-lead',
      status: 'FAIL',
      message: error.message,
    };
  }
}

/**
 * Test bulk lead submission (authenticated)
 */
async function testBulkSubmission(): Promise<TestResult> {
  try {
    console.log('🧪 Testing: POST /api/agent/neurons/bulk-submit');
    
    const testLeads = [
      {
        email: `bulk-test-1-${Date.now()}@example.com`,
        companyName: 'Bulk Test Company 1',
        jobTitle: 'CTO',
      },
      {
        email: `bulk-test-2-${Date.now()}@example.com`,
        companyName: 'Bulk Test Company 2',
        jobTitle: 'VP Engineering',
      },
    ];

    const response = await fetch(`${BASE_URL}/api/agent/neurons/bulk-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEURON_API_KEY}`,
      },
      body: JSON.stringify({
        leads: testLeads,
        source: 'neuron_bulk_test',
      }),
    });

    let data: any;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.log(`   ⚠️  Response not JSON: ${response.status} ${response.statusText}`);
      data = { error: `Invalid JSON response: ${response.statusText}` };
    }

    if (response.ok && data.success) {
      console.log(`   ✅ Success: ${data.results.submitted} leads submitted`);
      return {
        endpoint: '/api/agent/neurons/bulk-submit',
        status: 'PASS',
        message: `Bulk submission successful: ${data.results.submitted} submitted`,
      };
    } else {
      console.log(`   ❌ Failed: ${data.error || response.statusText}`);
      return {
        endpoint: '/api/agent/neurons/bulk-submit',
        status: 'FAIL',
        message: data.error || response.statusText,
      };
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: '/api/agent/neurons/bulk-submit',
      status: 'FAIL',
      message: error.message,
    };
  }
}

/**
 * Test public lead submission (rate-limited, no auth)
 */
async function testPublicSubmission(): Promise<TestResult> {
  try {
    console.log('🧪 Testing: POST /api/public/lead-submission');
    
    const response = await fetch(`${BASE_URL}/api/public/lead-submission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `public-test-${Date.now()}@example.com`,
        companyName: 'Public Test Company',
        jobTitle: 'CTO',
        source: 'public_test',
      }),
    });

    let data: any;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.log(`   ⚠️  Response not JSON: ${response.status} ${response.statusText}`);
      data = { error: `Invalid JSON response: ${response.statusText}` };
    }

    if (response.ok && data.success) {
      console.log(`   ✅ Success: Public lead submitted (ID: ${data.leadId})`);
      return {
        endpoint: '/api/public/lead-submission',
        status: 'PASS',
        message: 'Public submission successful',
        leadId: data.leadId,
      };
    } else {
      console.log(`   ❌ Failed: ${data.error || response.statusText}`);
      return {
        endpoint: '/api/public/lead-submission',
        status: 'FAIL',
        message: data.error || response.statusText,
      };
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: '/api/public/lead-submission',
      status: 'FAIL',
      message: error.message,
    };
  }
}

/**
 * Test unauthorized access (should fail)
 */
async function testUnauthorizedAccess(): Promise<TestResult> {
  try {
    console.log('🧪 Testing: Unauthorized access (should fail)');
    
    const response = await fetch(`${BASE_URL}/api/agent/neurons/submit-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify({
        email: `unauthorized-test-${Date.now()}@example.com`,
        companyName: 'Unauthorized Test',
        source: 'unauthorized_test',
      }),
    });

    if (response.status === 401) {
      console.log(`   ✅ Success: Correctly rejected unauthorized access`);
      return {
        endpoint: '/api/agent/neurons/submit-lead (unauthorized)',
        status: 'PASS',
        message: 'Security check working - unauthorized access rejected',
      };
    } else {
      let data: any;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (error) {
        data = {};
      }
      console.log(`   ⚠️  Warning: Expected 401, got ${response.status}`);
      return {
        endpoint: '/api/agent/neurons/submit-lead (unauthorized)',
        status: 'FAIL',
        message: `Security issue: Expected 401, got ${response.status}`,
      };
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      endpoint: '/api/agent/neurons/submit-lead (unauthorized)',
      status: 'FAIL',
      message: error.message,
    };
  }
}

/**
 * Run all Neuron endpoint tests
 */
async function testNeuronEndpoints() {
  console.log('🧠 Testing Neuron Webhook Endpoints');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Key: ${NEURON_API_KEY ? 'Configured' : 'Not configured (using test-key)'}`);
  console.log('');
  console.log('⚠️  WARNING: This test creates test leads with @example.com emails.');
  console.log('   These will be automatically rejected by email validation in production.');
  console.log('   Run "npm run cleanup-test-leads" after testing to remove test data.');
  console.log('');
  
  const results: TestResult[] = [];

  // Test 1: Single submission (authenticated)
  results.push(await testSingleSubmission());
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Bulk submission (authenticated)
  results.push(await testBulkSubmission());
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Public submission (no auth, rate-limited)
  results.push(await testPublicSubmission());
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Unauthorized access (should fail)
  results.push(await testUnauthorizedAccess());

  // Print Summary
  console.log('\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.endpoint}:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);
    if (result.leadId) {
      console.log(`   Lead ID: ${result.leadId}`);
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📈 Overall: ${passed} passed, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  if (failed === 0) {
    console.log('✅ All Neuron endpoints operational - Ready for production');
    process.exit(0);
  } else {
    console.log('❌ Some Neuron endpoints failed - Review before production');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  testNeuronEndpoints()
    .catch((error) => {
      console.error('❌ Neuron endpoint test failed:', error);
      process.exit(1);
    });
}

