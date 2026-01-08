/**
 * Schema Verification (Read-Only)
 * Verifies database schema matches code expectations
 * Used in CI/CD to block deployments if schema is incorrect
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!isProduction) {
  config({ path: resolve(process.cwd(), '.env.local') });
}

const REQUIRED_COLUMNS = [
  'location', 'timezone', 'detected_language', 
  'detected_region', 'news_signals', 'scheduled_send_at'
];

async function verifySchema() {
  const dbUrl = process.env.SUPABASE_SALES_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Check table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leads'
      );
    `;

    if (!tableCheck[0].exists) {
      console.error('❌ leads table does not exist');
      await sql.end();
      process.exit(1);
    }

    // Check columns exist
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads'
      AND column_name = ANY(${REQUIRED_COLUMNS})
    `;

    const existingColumns = columns.map((c: any) => c.column_name);
    const missingColumns = REQUIRED_COLUMNS.filter(
      col => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      console.error(`❌ Missing ${missingColumns.length} required column(s):`);
      missingColumns.forEach(col => console.error(`   - ${col}`));
      console.error('\nRun migration: npm run db:migrate:prod');
      await sql.end();
      process.exit(1);
    }

    console.log('✅ Schema verification passed');
    console.log(`   All ${REQUIRED_COLUMNS.length} required columns exist`);
    
    await sql.end();
  } catch (error: any) {
    console.error('❌ Schema verification failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

verifySchema();

