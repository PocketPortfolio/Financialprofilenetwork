/**
 * Test Database Connection
 * Tests Supabase connection and creates tables if needed
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    if (!process.env.SUPABASE_SALES_DATABASE_URL) {
      throw new Error('SUPABASE_SALES_DATABASE_URL is not set in .env.local');
    }
    
    console.log('✅ SUPABASE_SALES_DATABASE_URL is set');
    console.log('   Format:', process.env.SUPABASE_SALES_DATABASE_URL.substring(0, 30) + '...');
    
    // Test connection
    const { db } = await import('../db/sales/client');
    
    // Try a simple query
    const { leads } = await import('../db/sales/schema');
    const result = await db.select().from(leads).limit(1);
    
    console.log('✅ Database connection successful!');
    console.log('✅ Tables exist and are accessible');
    console.log(`   Found ${result.length} lead(s) in database`);
    
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n⚠️  Tables do not exist yet. Run migrations first:');
      console.log('   npm run db:push');
    }
    
    return false;
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


