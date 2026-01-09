/**
 * Test Email Validation
 * 
 * Verifies that test domains are properly blocked
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

async function testEmailValidation() {
  console.log('🧪 Testing Email Validation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const testCases = [
    // Test domains (should be blocked)
    { email: 'test@example.com', shouldBlock: true, reason: 'RFC 2606 test domain' },
    { email: 'user@example.org', shouldBlock: true, reason: 'RFC 2606 test domain' },
    { email: 'test@test.com', shouldBlock: true, reason: 'Test domain' },
    { email: 'test@invalid.com', shouldBlock: true, reason: 'Invalid domain' },
    { email: 'public-test-123@example.com', shouldBlock: true, reason: 'Test email pattern' },
    { email: 'bulk-test-1-123@example.com', shouldBlock: true, reason: 'Test email pattern' },
    
    // Valid emails (should pass) - using real domains with MX records
    { email: 'cto@github.com', shouldBlock: false, reason: 'Valid email (real domain)' },
    { email: 'founder@google.com', shouldBlock: false, reason: 'Valid email (real domain)' },
    
    // Placeholder patterns (should be blocked)
    { email: 'user.placeholder@company.com', shouldBlock: true, reason: 'Placeholder pattern' },
    { email: 'user@similar.company.com', shouldBlock: true, reason: 'Placeholder pattern' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const isPlaceholder = isPlaceholderEmail(testCase.email);
    const validation = await validateEmail(testCase.email);
    const isBlocked = isPlaceholder || !validation.isValid;
    
    const result = isBlocked === testCase.shouldBlock ? '✅' : '❌';
    const status = isBlocked ? 'BLOCKED' : 'ALLOWED';
    
    console.log(`${result} ${testCase.email}`);
    console.log(`   Expected: ${testCase.shouldBlock ? 'BLOCKED' : 'ALLOWED'}, Got: ${status}`);
    console.log(`   Reason: ${testCase.reason}`);
    if (isPlaceholder) {
      console.log(`   Placeholder check: ✅ Blocked`);
    } else if (!validation.isValid) {
      console.log(`   Validation: ❌ ${validation.reason}`);
    } else {
      console.log(`   Validation: ✅ Passed`);
    }
    console.log('');
    
    if (isBlocked === testCase.shouldBlock) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('✅ All tests passed! Email validation is working correctly.');
  } else {
    console.log('❌ Some tests failed. Review the validation logic.');
  }
  
  return failed === 0;
}

// Run tests
testEmailValidation()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

