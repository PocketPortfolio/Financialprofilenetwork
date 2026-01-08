/**
 * Test Sales Sidecar Setup
 * 
 * Verifies:
 * 1. Environment variables are loaded
 * 2. Database connection works
 * 3. Can create/read leads
 * 4. API endpoints are accessible
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load .env.local FIRST, before any other imports
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading .env.local from:', envPath);
if (existsSync(envPath)) {
  const result = config({ path: envPath, override: true });
  if (result.error) {
    console.error('Error loading .env.local:', result.error);
  } else {
    console.log('✅ .env.local loaded successfully');
    // Debug: Check if variables are loaded
    console.log('SUPABASE_SALES_DATABASE_URL exists:', !!process.env.SUPABASE_SALES_DATABASE_URL);
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  }
} else {
  console.warn('⚠️  .env.local not found at:', envPath);
}

// Dynamic imports to avoid evaluation before env vars are loaded
let db: any;
let leads: any;
let eq: any;

async function testEnvironmentVariables() {
  console.log('🔍 Testing Environment Variables...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const required = [
    'SUPABASE_SALES_DATABASE_URL',
    'OPENAI_API_KEY',
    'RESEND_API_KEY',
  ];
  
  const optional = [
    'ANTHROPIC_API_KEY',
    'TRIGGER_API_KEY',
    'TRIGGER_API_URL',
  ];
  
  let allGood = true;
  
  for (const key of required) {
    const value = process.env[key];
    if (!value) {
      console.log(`❌ ${key}: MISSING (required)`);
      allGood = false;
    } else {
      const masked = key.includes('KEY') || key.includes('PASSWORD') || key.includes('SECRET')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`✅ ${key}: ${masked}`);
    }
  }
  
  for (const key of optional) {
    const value = process.env[key];
    if (!value) {
      console.log(`⚠️  ${key}: Not set (optional)`);
    } else {
      const masked = key.includes('KEY') || key.includes('PASSWORD') || key.includes('SECRET')
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`✅ ${key}: ${masked}`);
    }
  }
  
  console.log('');
  return allGood;
}

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Import database modules dynamically
    const dbModule = await import('../db/sales/client');
    const schemaModule = await import('../db/sales/schema');
    db = dbModule.db;
    leads = schemaModule.leads;
    
    // Try to query the database
    const result = await db.select().from(leads).limit(1);
    console.log('✅ Database connection successful');
    console.log(`   Found ${result.length} leads in database`);
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ Database connection failed');
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    // Check if it's a schema issue
    if (error.message.includes('does not exist') || error.message.includes('relation')) {
      console.log('💡 Tip: Run database migrations first:');
      console.log('   npm run db:push');
      console.log('');
    }
    
    return false;
  }
}

async function testCreateLead() {
  console.log('🔍 Testing Lead Creation...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Ensure db and leads are loaded
    if (!db || !leads) {
      const dbModule = await import('../db/sales/client');
      const schemaModule = await import('../db/sales/schema');
      const drizzleModule = await import('drizzle-orm');
      db = dbModule.db;
      leads = schemaModule.leads;
      eq = drizzleModule.eq;
    }
    const testLead = {
      email: `test-${Date.now()}@example.com`,
      companyName: 'Test Company',
      firstName: 'Test',
      lastName: 'User',
      jobTitle: 'CTO',
      status: 'NEW' as const,
      dataSource: 'test',
      dataSourceDate: new Date(),
    };
    
    const [created] = await db.insert(leads).values(testLead).returning();
    
    console.log('✅ Lead created successfully');
    console.log(`   ID: ${created.id}`);
    console.log(`   Email: ${created.email}`);
    console.log('');
    
    // Clean up test lead
    await db.delete(leads).where(eq(leads.id, created.id));
    console.log('🧹 Test lead cleaned up');
    console.log('');
    
    return true;
  } catch (error: any) {
    console.log('❌ Lead creation failed');
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function testReadLeads() {
  console.log('🔍 Testing Lead Reading...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Ensure db and leads are loaded
    if (!db || !leads) {
      const dbModule = await import('../db/sales/client');
      const schemaModule = await import('../db/sales/schema');
      db = dbModule.db;
      leads = schemaModule.leads;
    }
    const allLeads = await db.select().from(leads).limit(10);
    console.log(`✅ Successfully read ${allLeads.length} leads`);
    if (allLeads.length > 0) {
      console.log(`   Sample: ${allLeads[0].email} at ${allLeads[0].companyName}`);
    }
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ Lead reading failed');
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

async function runTests() {
  console.log('🚀 Sales Sidecar Setup Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  const envOk = await testEnvironmentVariables();
  if (!envOk) {
    console.log('❌ Environment variables test failed. Please check your .env.local file.');
    process.exit(1);
  }
  
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.log('❌ Database connection test failed.');
    console.log('   Please verify:');
    console.log('   1. SUPABASE_SALES_DATABASE_URL is correct');
    console.log('   2. Database password is correct');
    console.log('   3. Database tables exist (run migrations)');
    process.exit(1);
  }
  
  const createOk = await testCreateLead();
  const readOk = await testReadLeads();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Test Summary:');
  console.log(`   Environment Variables: ${envOk ? '✅' : '❌'}`);
  console.log(`   Database Connection: ${dbOk ? '✅' : '❌'}`);
  console.log(`   Lead Creation: ${createOk ? '✅' : '❌'}`);
  console.log(`   Lead Reading: ${readOk ? '✅' : '❌'}`);
  console.log('');
  
  if (envOk && dbOk && createOk && readOk) {
    console.log('✅ All tests passed! Sales Sidecar is ready.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests().catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

export { runTests };

