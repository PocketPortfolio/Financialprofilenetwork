/**
 * Comprehensive Sales System Test
 * Tests all components of the Zero-Touch Revenue Engine
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
}

const results: TestResult[] = [];

function addResult(name: string, status: 'pass' | 'fail' | 'skip', message: string) {
  results.push({ name, status, message });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  console.log(`${icon} ${name}: ${message}`);
}

async function testEnvironmentVariables() {
  console.log('\n📋 Testing Environment Variables...\n');
  
  const required = [
    'SUPABASE_SALES_DATABASE_URL',
    'RESEND_API_KEY',
    'OPENAI_API_KEY',
  ];
  
  const optional = [
    'ANTHROPIC_API_KEY',
    'TRIGGER_API_KEY',
    'TRIGGER_API_URL',
  ];
  
  for (const key of required) {
    if (process.env[key]) {
      addResult(key, 'pass', `Set (${process.env[key]!.substring(0, 20)}...)`);
    } else {
      addResult(key, 'fail', 'NOT SET (required)');
    }
  }
  
  for (const key of optional) {
    if (process.env[key]) {
      addResult(key, 'pass', `Set (${process.env[key]!.substring(0, 20)}...)`);
    } else {
      addResult(key, 'skip', 'Not set (optional)');
    }
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection...\n');
  
  try {
    if (!process.env.SUPABASE_SALES_DATABASE_URL) {
      addResult('Database Connection', 'fail', 'SUPABASE_SALES_DATABASE_URL not set');
      return;
    }
    
    // Check connection string format
    const url = process.env.SUPABASE_SALES_DATABASE_URL;
    if (!url.startsWith('postgresql://')) {
      addResult('Database Connection', 'fail', 'Invalid connection string format (should start with postgresql://)');
      return;
    }
    
    // Try to import and connect
    const { db } = await import('../db/sales/client');
    const { leads } = await import('../db/sales/schema');
    
    // Test query
    const testQuery = await db.select().from(leads).limit(1);
    addResult('Database Connection', 'pass', 'Connected successfully');
    addResult('Database Tables', 'pass', 'Tables exist and are accessible');
    
  } catch (error: any) {
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      addResult('Database Connection', 'fail', `DNS resolution failed. Check connection string: ${error.message}`);
    } else if (error.message.includes('does not exist')) {
      addResult('Database Tables', 'fail', 'Tables do not exist. Run: npm run db:push');
    } else {
      addResult('Database Connection', 'fail', error.message);
    }
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...\n');
  
  const baseUrl = 'http://localhost:3001';
  
  // Test metrics endpoint
  try {
    const response = await fetch(`${baseUrl}/api/agent/metrics`);
    if (response.ok) {
      const data = await response.json();
      addResult('Metrics API', 'pass', 'Endpoint accessible');
    } else {
      addResult('Metrics API', 'fail', `HTTP ${response.status}: ${await response.text()}`);
    }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      addResult('Metrics API', 'skip', 'Server not running. Start with: npm run dev');
    } else {
      addResult('Metrics API', 'fail', error.message);
    }
  }
  
  // Test leads endpoint
  try {
    const response = await fetch(`${baseUrl}/api/agent/leads`);
    if (response.ok) {
      addResult('Leads API', 'pass', 'Endpoint accessible');
    } else {
      addResult('Leads API', 'fail', `HTTP ${response.status}`);
    }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      addResult('Leads API', 'skip', 'Server not running');
    } else {
      addResult('Leads API', 'fail', error.message);
    }
  }
}

async function testConfiguration() {
  console.log('\n⚙️  Testing Configuration...\n');
  
  // Check sales rate limit
  const rateLimit = process.env.SALES_RATE_LIMIT_PER_DAY || '50';
  addResult('Rate Limit', 'pass', `Set to ${rateLimit} emails/day`);
  
  // Check emergency stop
  const emergencyStop = process.env.EMERGENCY_STOP === 'true';
  addResult('Emergency Stop', emergencyStop ? 'fail' : 'pass', emergencyStop ? 'ACTIVATED (emails disabled)' : 'Not activated');
}

async function runTests() {
  console.log('🚀 Zero-Touch Revenue Engine - System Test');
  console.log('=' .repeat(50));
  
  await testEnvironmentVariables();
  await testDatabaseConnection();
  await testConfiguration();
  await testAPIEndpoints();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary\n');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (failed === 0) {
    console.log('✅ All critical tests passed!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3001/admin/sales');
    console.log('2. Create a test lead');
    console.log('3. Test email generation');
  } else {
    console.log('⚠️  Some tests failed. Please fix the issues above.');
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


