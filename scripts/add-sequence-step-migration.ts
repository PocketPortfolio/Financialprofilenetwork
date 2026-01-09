/**
 * Migration: Add sequence_step column and UNQUALIFIED status
 * v2.1: Iron Rail Sequence State Machine
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function addSequenceStepMigration() {
  const dbUrl = process.env.SUPABASE_SALES_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ SUPABASE_SALES_DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔍 Adding sequence_step column and UNQUALIFIED status...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const sql = postgres(dbUrl, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    connect_timeout: 10,
  });

  try {
    // 1. Check if UNQUALIFIED already exists in enum
    const enumCheck = await sql`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'lead_status'
      ) 
      AND enumlabel = 'UNQUALIFIED';
    `;

    if (enumCheck.length > 0) {
      console.log('✅ UNQUALIFIED status already exists in lead_status enum');
    } else {
      // Add UNQUALIFIED to lead_status enum (before DO_NOT_CONTACT)
      await sql`
        ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'UNQUALIFIED' BEFORE 'DO_NOT_CONTACT';
      `;
      console.log('✅ Added UNQUALIFIED to lead_status enum');
    }

    // 2. Check if sequence_step column exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' 
      AND column_name = 'sequence_step';
    `;

    if (columnCheck.length > 0) {
      console.log('✅ sequence_step column already exists');
    } else {
      // Add sequence_step column
      await sql`
        ALTER TABLE leads 
        ADD COLUMN sequence_step INTEGER DEFAULT 0;
      `;
      console.log('✅ Added sequence_step column to leads table');
      
      // Update existing leads: set sequence_step based on outbound email count
      await sql`
        UPDATE leads
        SET sequence_step = CASE
          WHEN (
            SELECT COUNT(*) 
            FROM conversations 
            WHERE conversations.lead_id = leads.id 
            AND conversations.direction = 'outbound'
          ) = 0 THEN 0
          WHEN (
            SELECT COUNT(*) 
            FROM conversations 
            WHERE conversations.lead_id = leads.id 
            AND conversations.direction = 'outbound'
          ) = 1 THEN 1
          WHEN (
            SELECT COUNT(*) 
            FROM conversations 
            WHERE conversations.lead_id = leads.id 
            AND conversations.direction = 'outbound'
          ) = 2 THEN 2
          WHEN (
            SELECT COUNT(*) 
            FROM conversations 
            WHERE conversations.lead_id = leads.id 
            AND conversations.direction = 'outbound'
          ) = 3 THEN 3
          ELSE 4
        END;
      `;
      console.log('✅ Updated existing leads with sequence_step based on email count');
    }

    console.log('\n✅ Migration completed successfully!');
    await sql.end();
  } catch (error: any) {
    // PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE, so handle gracefully
    if (error.message?.includes('already exists') || error.code === '42710') {
      console.log('✅ Enum values/columns already exist (skipped)');
      await sql.end();
      return;
    }
    console.error('\n❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

addSequenceStepMigration();

