/**
 * Production-Safe Database Migration
 * 
 * SAFETY FEATURES:
 * - Idempotent: Safe to run multiple times
 * - Non-destructive: Only adds columns, never drops
 * - Verified: Checks schema before and after
 * - Fails fast: Exits on critical errors
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

// Load environment variables (production uses Vercel env vars)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

if (!isProduction) {
  config({ path: resolve(process.cwd(), '.env.local') });
}

const REQUIRED_COLUMNS = [
  { name: 'location', type: 'TEXT', nullable: true },
  { name: 'timezone', type: 'TEXT', nullable: true },
  { name: 'detected_language', type: 'TEXT', nullable: true },
  { name: 'detected_region', type: 'TEXT', nullable: true },
  { name: 'news_signals', type: 'JSONB', nullable: true },
  { name: 'scheduled_send_at', type: 'TIMESTAMP', nullable: true },
];

async function productionMigration() {
  const dbUrl = process.env.SUPABASE_SALES_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔍 Production Database Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Step 1: Verify table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leads'
      );
    `;

    if (!tableCheck[0].exists) {
      console.error('❌ CRITICAL: leads table does not exist in production!');
      console.error('   Run: npm run db:create first');
      await sql.end();
      process.exit(1);
    }

    console.log('✅ leads table exists');

    // Step 2: Check existing columns
    const existingColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads'
      AND column_name = ANY(${REQUIRED_COLUMNS.map(c => c.name)})
    `;

    const existingColumnNames = existingColumns.map((c: any) => c.column_name);
    const missingColumns = REQUIRED_COLUMNS.filter(
      col => !existingColumnNames.includes(col.name)
    );

    if (missingColumns.length === 0) {
      console.log('✅ All required columns exist - no migration needed');
      await sql.end();
      return;
    }

    // Step 3: Add missing columns (idempotent)
    console.log(`\n📤 Adding ${missingColumns.length} missing column(s)...`);
    
    for (const col of missingColumns) {
      try {
        let sqlType = col.type;
        if (sqlType === 'TEXT') sqlType = 'TEXT';
        else if (sqlType === 'JSONB') sqlType = 'JSONB';
        else if (sqlType === 'TIMESTAMP') sqlType = 'TIMESTAMP';

        await sql.unsafe(
          `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ${col.name} ${sqlType};`
        );
        console.log(`   ✅ Added ${col.name}`);
      } catch (error: any) {
        // Column might already exist (race condition)
        if (error.message?.includes('already exists') || error.code === '42701') {
          console.log(`   ⏭️  ${col.name} already exists (skipped)`);
        } else {
          console.error(`   ❌ Failed to add ${col.name}: ${error.message}`);
          throw error; // Fail fast on unexpected errors
        }
      }
    }

    // Step 4: Create indexes (idempotent)
    console.log('\n📊 Creating indexes...');
    try {
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_leads_timezone 
        ON leads(timezone) 
        WHERE timezone IS NOT NULL;
      `);
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_leads_scheduled_send_at 
        ON leads(scheduled_send_at) 
        WHERE scheduled_send_at IS NOT NULL;
      `);
      console.log('   ✅ Indexes created');
    } catch (error: any) {
      console.log('   ⏭️  Indexes already exist (skipped)');
    }

    // Step 5: Final verification
    const finalCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads'
      AND column_name = ANY(${REQUIRED_COLUMNS.map(c => c.name)})
    `;

    const finalColumnNames = finalCheck.map((c: any) => c.column_name);
    
    if (finalColumnNames.length === REQUIRED_COLUMNS.length) {
      console.log('\n✅ Migration completed successfully!');
      console.log(`   Verified ${finalColumnNames.length}/${REQUIRED_COLUMNS.length} columns exist`);
    } else {
      console.error(`\n❌ Migration incomplete: Only ${finalColumnNames.length}/${REQUIRED_COLUMNS.length} columns found`);
      await sql.end();
      process.exit(1);
    }

    await sql.end();
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

productionMigration();

