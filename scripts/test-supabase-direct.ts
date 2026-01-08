/**
 * Direct Supabase Connection Test
 * Tests connection using postgres library directly
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testDirectConnection() {
  try {
    console.log('🔍 Testing direct Supabase connection...\n');
    
    const connectionString = process.env.SUPABASE_SALES_DATABASE_URL;
    if (!connectionString) {
      throw new Error('SUPABASE_SALES_DATABASE_URL not set');
    }
    
    console.log('Connection string format:', connectionString.substring(0, 50) + '...');
    
    // Parse URL to verify
    const url = new URL(connectionString);
    console.log('Parsed hostname:', url.hostname);
    console.log('Parsed port:', url.port);
    console.log('Parsed user:', url.username);
    console.log('');
    
    // Try connection with SSL
    console.log('Attempting connection with SSL...');
    const sql = postgres(connectionString, {
      max: 1,
      ssl: { rejectUnauthorized: false },
      connect_timeout: 10,
    });
    
    // Test query
    const result = await sql`SELECT version() as version, current_database() as database`;
    console.log('✅ Connection successful!');
    console.log('   Database:', result[0].database);
    console.log('   PostgreSQL version:', result[0].version.substring(0, 50));
    console.log('');
    
    // Check if tables exist
    console.log('Checking for sales tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('leads', 'conversations', 'audit_logs', 'embeddings')
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No sales tables found. Need to run migrations.');
      console.log('   Run: npm run db:push');
    } else {
      console.log(`✅ Found ${tables.length} table(s):`);
      tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    }
    
    await sql.end();
    return true;
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error details:', error);
    return false;
  }
}

testDirectConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


