/**
 * Cleanup Test Leads
 * 
 * Removes test leads created by test scripts (example.com, test.com, etc.)
 * Also marks any leads with test data sources as UNQUALIFIED
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { sql, or, like, eq } from 'drizzle-orm';

/**
 * Cleanup test leads
 */
async function cleanupTestLeads() {
  console.log('🧹 Cleaning up test leads...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Find test leads by email domain
    const testDomains = [
      '@example.com',
      '@example.org',
      '@example.net',
      '@test.com',
      '@test.local',
      '@invalid.com',
      '@fake.com',
      '@dummy.com',
      '@sample.com',
    ];
    
    // Build query to find test leads - use broader patterns
    const conditions = [
      // Match any email containing test domains
      like(leads.email, '%@example.com'),
      like(leads.email, '%@example.org'),
      like(leads.email, '%@example.net'),
      like(leads.email, '%@test.com'),
      like(leads.email, '%@test.local'),
      like(leads.email, '%@invalid.com'),
      like(leads.email, '%@fake.com'),
      like(leads.email, '%@dummy.com'),
      like(leads.email, '%@sample.com'),
      // Also match emails with "test" or "example" anywhere
      like(leads.email, '%test%'),
      like(leads.email, '%example%'),
      // Check for test company names
      like(leads.companyName, '%Test%'),
      like(leads.companyName, '%test%'),
      // Check for test data sources
      like(leads.dataSource, '%test%'),
      like(leads.dataSource, '%neuron_test%'),
      like(leads.dataSource, '%neuron_bulk_test%'),
      like(leads.dataSource, '%public_%'),
    ];
    
    // Find test leads
    const testLeads = await db
      .select({
        id: leads.id,
        email: leads.email,
        companyName: leads.companyName,
        dataSource: leads.dataSource,
        status: leads.status,
      })
      .from(leads)
      .where(or(...conditions));
    
    console.log(`📊 Found ${testLeads.length} test leads to remove`);
    
    if (testLeads.length === 0) {
      console.log('✅ No test leads found. Database is clean!');
      return;
    }
    
    // Show sample of what will be deleted
    console.log('\n📋 Sample test leads to be removed:');
    testLeads.slice(0, 10).forEach(lead => {
      console.log(`   - ${lead.email} (${lead.companyName}) [${lead.dataSource}]`);
    });
    if (testLeads.length > 10) {
      console.log(`   ... and ${testLeads.length - 10} more`);
    }
    
    // Delete test leads
    const deleted = await db
      .delete(leads)
      .where(or(...conditions))
      .returning({ 
        id: leads.id,
        email: leads.email,
        companyName: leads.companyName,
      });
    
    console.log(`\n✅ Deleted ${deleted.length} test leads`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Cleanup complete!');
    
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  }
}

// Run cleanup
cleanupTestLeads()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
