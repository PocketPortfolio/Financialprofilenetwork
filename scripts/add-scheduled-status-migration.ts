/**
 * Migration: Add SCHEDULED status to lead_status enum
 * Add EMAIL_SCHEDULED to audit_action enum
 * 
 * CRITICAL: This fixes the "invalid input value for enum lead_status: SCHEDULED" error
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function addScheduledStatus() {
  const dbUrl = process.env.SUPABASE_SALES_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔍 Adding SCHEDULED status to database enum...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Check if SCHEDULED already exists in lead_status enum
    const enumCheck = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'lead_status'
      ) 
      AND enumlabel = 'SCHEDULED';
    `;

    if (enumCheck.length > 0) {
      console.log('✅ SCHEDULED status already exists in lead_status enum');
    } else {
      // Add SCHEDULED to lead_status enum
      // Note: PostgreSQL doesn't support "AFTER" in ADD VALUE, so we add it and it will be at the end
      // The order doesn't matter for functionality
      try {
        await sql`ALTER TYPE lead_status ADD VALUE 'SCHEDULED';`;
        console.log('✅ Added SCHEDULED to lead_status enum');
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.code === '42710') {
          console.log('✅ SCHEDULED already exists (skipped)');
        } else {
          throw error;
        }
      }
    }

    // Check if EMAIL_SCHEDULED already exists in audit_action enum
    const auditCheck = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'audit_action'
      ) 
      AND enumlabel = 'EMAIL_SCHEDULED';
    `;

    if (auditCheck.length > 0) {
      console.log('✅ EMAIL_SCHEDULED already exists in audit_action enum');
    } else {
      // Add EMAIL_SCHEDULED to audit_action enum
      try {
        await sql`ALTER TYPE audit_action ADD VALUE 'EMAIL_SCHEDULED';`;
        console.log('✅ Added EMAIL_SCHEDULED to audit_action enum');
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.code === '42710') {
          console.log('✅ EMAIL_SCHEDULED already exists (skipped)');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('   Database now supports SCHEDULED status and EMAIL_SCHEDULED action');
    await sql.end();
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Error code:', error.code);
    await sql.end();
    process.exit(1);
  }
}

if (require.main === module) {
  addScheduledStatus()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { addScheduledStatus };

