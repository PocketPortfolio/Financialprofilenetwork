/**
 * Create system_settings table for emergency stop and other system-wide flags
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function createSystemSettingsTable() {
  try {
    const connectionString = process.env.SUPABASE_SALES_DATABASE_URL;
    if (!connectionString) {
      throw new Error('SUPABASE_SALES_DATABASE_URL not set');
    }

    const sql = postgres(connectionString, {
      max: 1,
      ssl: { rejectUnauthorized: false },
      connect_timeout: 10,
    });

    console.log('🔍 Connecting to database...\n');

    // Create system_settings table
    console.log('Creating system_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT NOT NULL UNIQUE,
        value JSONB NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_by TEXT
      );
    `;
    console.log('✅ system_settings table created\n');

    // Create index on key for faster lookups
    console.log('Creating index on key...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
    `;
    console.log('✅ Index created\n');

    // Initialize emergency_stop setting if it doesn't exist
    console.log('Initializing emergency_stop setting...');
    const existing = await sql`
      SELECT * FROM system_settings WHERE key = 'emergency_stop';
    `;

    if (existing.length === 0) {
      // Check environment variable for initial value
      const initialValue = process.env.EMERGENCY_STOP === 'true';
      
      await sql`
        INSERT INTO system_settings (key, value, description, updated_by)
        VALUES ('emergency_stop', ${JSON.stringify(initialValue)}, 'Emergency stop flag - when true, all email sending is paused', 'migration')
      `;
      console.log(`✅ Emergency stop initialized to: ${initialValue}\n`);
    } else {
      console.log('✅ Emergency stop setting already exists\n');
    }

    await sql.end();
    console.log('✅ Migration complete!');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSystemSettingsTable();
}

export { createSystemSettingsTable };

