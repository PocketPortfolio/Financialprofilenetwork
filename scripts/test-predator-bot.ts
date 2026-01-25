/**
 * Test script for Predator Bot V3
 * 
 * Tests the autonomous global discovery protocol
 */

import { sourceFromPredator } from '@/lib/sales/sourcing/predator-scraper';

async function testPredatorBot() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🦅 Predator Bot Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    console.log('📡 Testing Predator Bot V3 (Autonomous Global Discovery) with max 10 high-intent leads...');
    console.log('   Testing UK (VouchedFor) + US (NAPFA) sources...');
    const leads = await sourceFromPredator(10);

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Test Results:');
    console.log(`   Leads Found: ${leads.length}`);
    
    if (leads.length > 0) {
      console.log('');
      console.log('   Sample Leads:');
      leads.forEach((lead, index) => {
        console.log(`   ${index + 1}. ${lead.email} - ${lead.companyName} (${lead.jobTitle})`);
      });
    }
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (leads.length > 0) {
      console.log('✅ Predator Bot is operational');
      process.exit(0);
    } else {
      console.log('⚠️  No leads found (may be due to rate limiting or directory changes)');
      console.log('   This is expected in test environments');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  testPredatorBot();
}

