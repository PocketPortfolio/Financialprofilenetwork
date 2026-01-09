/**
 * Test Cultural Guardrails
 * Execution Order 010: Verify "Respect" Protocol
 * 
 * Tests that the cultural guardrails correctly:
 * 1. Block emails to strict regions (CN, ES, JP, etc.)
 * 2. Allow emails to permissive regions (FR, DE, etc.)
 * 3. Allow emails to English-speaking regions (US, GB, etc.)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { canWeEmail, getRegionLockReason, isStrictRegion, determineOutreachLanguage, REGION_RULES } from '@/lib/sales/cultural-guardrails';

async function testCulturalGuardrails() {
  console.log('🧪 Testing Cultural Guardrails (Execution Order 010)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const supportedLanguages = ['en-US']; // Currently only English supported

  // Test 1: Strict Regions (Should BLOCK)
  console.log('📋 Test 1: Strict Regions (Should BLOCK)');
  const strictRegions = ['CN', 'ES', 'JP', 'KR', 'IT', 'RU', 'AR'];
  let strictBlocked = 0;
  let strictAllowed = 0;

  for (const region of strictRegions) {
    const canEmail = canWeEmail(region, supportedLanguages);
    const reason = getRegionLockReason(region, supportedLanguages);
    const isStrict = isStrictRegion(region);
    const requiredLang = determineOutreachLanguage(region);

    if (canEmail) {
      console.log(`   ❌ FAIL: ${region} should be BLOCKED but was allowed`);
      strictAllowed++;
    } else {
      console.log(`   ✅ PASS: ${region} correctly BLOCKED - ${reason}`);
      strictBlocked++;
    }
    console.log(`      - Is Strict: ${isStrict}`);
    console.log(`      - Required Language: ${requiredLang}`);
    console.log(`      - Rule: ${JSON.stringify(REGION_RULES[region])}`);
    console.log('');
  }

  // Test 2: Permissive Regions (Should ALLOW)
  console.log('📋 Test 2: Permissive Regions (Should ALLOW)');
  const permissiveRegions = ['FR', 'DE', 'BR', 'NL', 'SE', 'NO', 'DK', 'FI'];
  let permissiveBlocked = 0;
  let permissiveAllowed = 0;

  for (const region of permissiveRegions) {
    const canEmail = canWeEmail(region, supportedLanguages);
    const reason = getRegionLockReason(region, supportedLanguages);
    const isStrict = isStrictRegion(region);
    const requiredLang = determineOutreachLanguage(region);

    if (!canEmail) {
      console.log(`   ❌ FAIL: ${region} should be ALLOWED but was blocked - ${reason}`);
      permissiveBlocked++;
    } else {
      console.log(`   ✅ PASS: ${region} correctly ALLOWED`);
      permissiveAllowed++;
    }
    console.log(`      - Is Strict: ${isStrict}`);
    console.log(`      - Required Language: ${requiredLang}`);
    console.log(`      - Rule: ${JSON.stringify(REGION_RULES[region])}`);
    console.log('');
  }

  // Test 3: English-Speaking Regions (Should ALLOW)
  console.log('📋 Test 3: English-Speaking Regions (Should ALLOW)');
  const englishRegions = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
  let englishBlocked = 0;
  let englishAllowed = 0;

  for (const region of englishRegions) {
    const canEmail = canWeEmail(region, supportedLanguages);
    const reason = getRegionLockReason(region, supportedLanguages);
    const isStrict = isStrictRegion(region);
    const requiredLang = determineOutreachLanguage(region);

    if (!canEmail) {
      console.log(`   ❌ FAIL: ${region} should be ALLOWED but was blocked - ${reason}`);
      englishBlocked++;
    } else {
      console.log(`   ✅ PASS: ${region} correctly ALLOWED`);
      englishAllowed++;
    }
    console.log(`      - Is Strict: ${isStrict}`);
    console.log(`      - Required Language: ${requiredLang}`);
    console.log(`      - Rule: ${JSON.stringify(REGION_RULES[region])}`);
    console.log('');
  }

  // Test 4: Unknown Regions (Should ALLOW as safe default)
  console.log('📋 Test 4: Unknown Regions (Should ALLOW as safe default)');
  const unknownRegions = ['XX', 'ZZ', 'UNKNOWN'];
  let unknownBlocked = 0;
  let unknownAllowed = 0;

  for (const region of unknownRegions) {
    const canEmail = canWeEmail(region, supportedLanguages);
    const reason = getRegionLockReason(region, supportedLanguages);
    const isStrict = isStrictRegion(region);
    const requiredLang = determineOutreachLanguage(region);

    if (!canEmail) {
      console.log(`   ⚠️  WARN: ${region} (unknown) was blocked - ${reason}`);
      unknownBlocked++;
    } else {
      console.log(`   ✅ PASS: ${region} (unknown) correctly ALLOWED (safe default)`);
      unknownAllowed++;
    }
    console.log(`      - Is Strict: ${isStrict}`);
    console.log(`      - Required Language: ${requiredLang}`);
    console.log('');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary:');
  console.log(`   Strict Regions: ${strictBlocked}/${strictRegions.length} correctly blocked, ${strictAllowed} incorrectly allowed`);
  console.log(`   Permissive Regions: ${permissiveAllowed}/${permissiveRegions.length} correctly allowed, ${permissiveBlocked} incorrectly blocked`);
  console.log(`   English Regions: ${englishAllowed}/${englishRegions.length} correctly allowed, ${englishBlocked} incorrectly blocked`);
  console.log(`   Unknown Regions: ${unknownAllowed}/${unknownRegions.length} correctly allowed (safe default), ${unknownBlocked} incorrectly blocked`);
  console.log('');

  const totalTests = strictRegions.length + permissiveRegions.length + englishRegions.length + unknownRegions.length;
  const totalPassed = strictBlocked + permissiveAllowed + englishAllowed + unknownAllowed;
  const totalFailed = strictAllowed + permissiveBlocked + englishBlocked + unknownBlocked;

  if (totalFailed === 0) {
    console.log('✅ ALL TESTS PASSED: Cultural Guardrails are working correctly!');
    console.log(`   ${totalPassed}/${totalTests} tests passed`);
  } else {
    console.log(`❌ SOME TESTS FAILED: ${totalFailed} test(s) failed`);
    console.log(`   ${totalPassed}/${totalTests} tests passed`);
    process.exit(1);
  }
}

testCulturalGuardrails().catch(console.error);

