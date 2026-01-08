/**
 * Verify and fix database schema
 * Checks if tables and columns exist, creates/updates as needed
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function verifyAndFixSchema() {
  if (!process.env.SUPABASE_SALES_DATABASE_URL) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log('🔍 Verifying database schema...\n');

  const sql = postgres(process.env.SUPABASE_SALES_DATABASE_URL, {
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    // Check if leads table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'leads'
      );
    `;

    if (!tableCheck[0].exists) {
      console.log('❌ leads table does not exist. Run: npm run db:create');
      await sql.end();
      process.exit(1);
    }

    console.log('✅ leads table exists');

    // Check which columns exist
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads'
      ORDER BY column_name;
    `;

    const existingColumns = columns.map((c: any) => c.column_name);
    console.log(`\n📊 Found ${existingColumns.length} columns in leads table`);

    // Required Sprint 4 columns
    const requiredColumns = [
      { name: 'location', type: 'TEXT' },
      { name: 'timezone', type: 'TEXT' },
      { name: 'detected_language', type: 'TEXT' },
      { name: 'detected_region', type: 'TEXT' },
      { name: 'news_signals', type: 'JSONB' },
      { name: 'scheduled_send_at', type: 'TIMESTAMP' },
    ];

    const missingColumns = requiredColumns.filter(
      col => !existingColumns.includes(col.name)
    );

    if (missingColumns.length === 0) {
      console.log('✅ All Sprint 4 columns exist');
    } else {
      console.log(`\n⚠️  Missing ${missingColumns.length} column(s):`);
      missingColumns.forEach(col => console.log(`   - ${col.name} (${col.type})`));

      console.log('\n📤 Adding missing columns...');
      
      for (const col of missingColumns) {
        try {
          if (col.type === 'JSONB') {
            await sql.unsafe(`ALTER TABLE leads ADD COLUMN ${col.name} JSONB;`);
          } else if (col.type === 'TIMESTAMP') {
            await sql.unsafe(`ALTER TABLE leads ADD COLUMN ${col.name} TIMESTAMP;`);
          } else {
            await sql.unsafe(`ALTER TABLE leads ADD COLUMN ${col.name} TEXT;`);
          }
          console.log(`   ✅ Added ${col.name}`);
        } catch (error: any) {
          if (error.message.includes('already exists') || error.code === '42701') {
            console.log(`   ⏭️  ${col.name} already exists (skipping)`);
          } else {
            console.error(`   ❌ Failed to add ${col.name}: ${error.message}`);
          }
        }
      }
    }

    // Create indexes
    console.log('\n📊 Creating indexes...');
    try {
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_leads_timezone 
        ON leads(timezone) 
        WHERE timezone IS NOT NULL;
      `);
      console.log('   ✅ Index on timezone created');
    } catch (error: any) {
      console.log('   ⏭️  Index on timezone already exists');
    }

    try {
      await sql.unsafe(`
        CREATE INDEX IF NOT EXISTS idx_leads_scheduled_send_at 
        ON leads(scheduled_send_at) 
        WHERE scheduled_send_at IS NOT NULL;
      `);
      console.log('   ✅ Index on scheduled_send_at created');
    } catch (error: any) {
      console.log('   ⏭️  Index on scheduled_send_at already exists');
    }

    // Final verification
    console.log('\n🔍 Final verification...');
    const finalCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'leads'
      AND column_name IN ('location', 'timezone', 'detected_language', 'detected_region', 'news_signals', 'scheduled_send_at')
      ORDER BY column_name;
    `;

    const finalColumns = finalCheck.map((c: any) => c.column_name);
    console.log(`✅ Verified ${finalColumns.length}/6 Sprint 4 columns exist:`);
    finalColumns.forEach(col => console.log(`   - ${col}`));

    if (finalColumns.length === 6) {
      console.log('\n✅ Schema verification complete! All Sprint 4 fields are present.');
    } else {
      console.log(`\n⚠️  Warning: Only ${finalColumns.length}/6 columns found. Some may need manual addition.`);
    }

    await sql.end();
    return true;
  } catch (error: any) {
    console.error('\n❌ Schema verification failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

verifyAndFixSchema();

