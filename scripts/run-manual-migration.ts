/**
 * Run manual SQL migration for Sprint 4 schema updates
 * This is a workaround for drizzle-kit push:pg issues
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import postgres from 'postgres';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function runMigration() {
  if (!process.env.SUPABASE_SALES_DATABASE_URL) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log('📤 Running manual migration...\n');

  const sql = postgres(process.env.SUPABASE_SALES_DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Read SQL migration file
    const migrationSQL = readFileSync(
      resolve(process.cwd(), 'scripts/manual-migration.sql'),
      'utf-8'
    );

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await sql.unsafe(statement);
      }
    }

    await sql.end();
    console.log('\n✅ Migration completed successfully!');
    console.log('   Added fields: location, timezone, detected_language, detected_region, news_signals, scheduled_send_at');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();

