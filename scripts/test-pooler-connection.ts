/**
 * Test Session Pooler Connection
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testPoolerConnection() {
  try {
    console.log('🔍 Testing Session Pooler connection...\n');
    
    const connectionString = process.env.SUPABASE_SALES_DATABASE_URL;
    if (!connectionString) {
      throw new Error('SUPABASE_SALES_DATABASE_URL not set');
    }
    
    console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':***@'));
    console.log('');
    
    // Parse URL
    const url = new URL(connectionString);
    console.log('Hostname:', url.hostname);
    console.log('Port:', url.port);
    console.log('Username:', url.username);
    console.log('');
    
    // Test connection with SSL
    console.log('Attempting connection...');
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
    if (error.hostname) {
      console.error('   Hostname:', error.hostname);
    }
    return false;
  }
}

testPoolerConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


