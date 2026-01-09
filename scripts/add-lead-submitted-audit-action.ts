/**
 * Migration: Add LEAD_SUBMITTED to audit_action enum
 * 
 * This script adds the LEAD_SUBMITTED value to the audit_action enum
 * for tracking external lead submissions via Neuron API
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function addLeadSubmittedAuditAction() {
  const dbUrl = process.env.SUPABASE_SALES_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔍 Adding LEAD_SUBMITTED to audit_action enum...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Check if LEAD_SUBMITTED already exists in audit_action enum
    const enumCheck = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'audit_action'
      ) 
      AND enumlabel = 'LEAD_SUBMITTED';
    `;

    if (enumCheck.length > 0) {
      console.log('✅ LEAD_SUBMITTED already exists in audit_action enum');
    } else {
      // Add LEAD_SUBMITTED to audit_action enum
      try {
        await sql`ALTER TYPE audit_action ADD VALUE 'LEAD_SUBMITTED';`;
        console.log('✅ Added LEAD_SUBMITTED to audit_action enum');
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.code === '42710') {
          console.log('✅ LEAD_SUBMITTED already exists (skipped)');
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('   Database now supports LEAD_SUBMITTED audit action');
    await sql.end();
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Error code:', error.code);
    await sql.end();
    process.exit(1);
  }
}

if (require.main === module) {
  addLeadSubmittedAuditAction()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

