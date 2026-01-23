/**
 * Test Apollo API Connection
 * Verifies API key and plan access
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const apolloApiKey = process.env.APOLLO_API_KEY;

if (!apolloApiKey) {
  console.error('❌ APOLLO_API_KEY not found in environment');
  process.exit(1);
}

console.log(`🔑 API Key found: ${apolloApiKey.substring(0, 10)}...`);
console.log('');

// Test 1: Check API key validity
async function testApiKey() {
  console.log('🧪 Test 1: Verifying API key...');
  
  try {
    const response = await fetch('https://api.apollo.io/v1/auth/health', {
      method: 'GET',
      headers: {
        'X-Api-Key': apolloApiKey!,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API key is valid');
      console.log('   Response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ API key test failed: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ API key test error: ${error.message}`);
    return false;
  }
}

// Test 2: Try a simple search endpoint
async function testSearchEndpoint() {
  console.log('');
  console.log('🧪 Test 2: Testing search endpoint access...');
  
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apolloApiKey!,
      },
      body: JSON.stringify({
        person_titles: ['Independent Financial Advisor'],
        person_locations: ['United Kingdom'],
        per_page: 1, // Just test with 1 result
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Search endpoint accessible');
      console.log(`   Found ${data.people?.length || 0} results`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Search endpoint failed: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
  } catch (error: any) {
    console.log(`   ❌ Search endpoint error: ${error.message}`);
    return false;
  }
}

// Run tests
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Apollo API Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const keyValid = await testApiKey();
  const searchAccessible = await testSearchEndpoint();

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test Results:');
  console.log(`   API Key Valid: ${keyValid ? '✅' : '❌'}`);
  console.log(`   Search Accessible: ${searchAccessible ? '✅' : '❌'}`);
  console.log('');

  if (!keyValid) {
    console.log('⚠️  ACTION REQUIRED:');
    console.log('   1. Go to https://app.apollo.io/settings/api');
    console.log('   2. Generate a new API key (if upgraded recently)');
    console.log('   3. Update APOLLO_API_KEY in .env.local');
    console.log('');
  }

  if (!searchAccessible && keyValid) {
    console.log('⚠️  PLAN ISSUE:');
    console.log('   API key is valid but search endpoint requires paid plan');
    console.log('   Verify your Apollo plan includes API access');
    console.log('   Check: https://app.apollo.io/settings/billing');
    console.log('');
  }
}

main().catch(console.error);

