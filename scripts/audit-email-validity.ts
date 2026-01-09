/**
 * Audit Email Validity Script
 * 
 * Scans ALL existing leads in database and validates emails.
 * Updates invalid emails to UNQUALIFIED status (Archive).
 * 
 * This should be run periodically to clean up existing leads.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, ne } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';

async function auditEmailValidity() {
  console.log('🔍 Auditing email validity for all leads...\n');

  // Get all leads (excluding already archived ones)
  const allLeads = await db
    .select({
      id: leads.id,
      email: leads.email,
      companyName: leads.companyName,
      status: leads.status,
    })
    .from(leads)
    .where(ne(leads.status, 'DO_NOT_CONTACT')); // Skip already archived

  console.log(`   Found ${allLeads.length} leads to validate\n`);

  if (allLeads.length === 0) {
    console.log('✅ No leads to validate');
    return;
  }

  let valid = 0;
  let invalid = 0;
  let updated = 0;
  let errors = 0;

  // Process in batches to avoid overwhelming DNS
  const BATCH_SIZE = 10;
  const DELAY_MS = 200; // 200ms delay between batches

  for (let i = 0; i < allLeads.length; i += BATCH_SIZE) {
    const batch = allLeads.slice(i, i + BATCH_SIZE);
    
    for (const lead of batch) {
      try {
        const validation = await validateEmail(lead.email);
        
        if (validation.isValid) {
          valid++;
        } else {
          invalid++;
          console.log(`   ❌ Invalid: ${lead.email} (${lead.companyName}) - ${validation.reason}`);
          
          // Update to UNQUALIFIED status
          await db.update(leads)
            .set({
              status: 'UNQUALIFIED',
              updatedAt: new Date(),
            })
            .where(eq(leads.id, lead.id));
          
          // Log the status change
          await db.insert(auditLogs).values({
            leadId: lead.id,
            action: 'STATUS_CHANGED',
            aiReasoning: `Email validation failed: ${validation.reason} - marked as UNQUALIFIED`,
            metadata: {
              previousStatus: lead.status,
              newStatus: 'UNQUALIFIED',
              validationReason: validation.reason,
            },
          });
          
          updated++;
        }
      } catch (error: any) {
        errors++;
        console.error(`   ⚠️  Error validating ${lead.email}:`, error.message);
      }
    }
    
    // Rate limit DNS lookups
    if (i + BATCH_SIZE < allLeads.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`\n✅ Email validation audit complete:`);
  console.log(`   - Valid: ${valid}/${allLeads.length}`);
  console.log(`   - Invalid: ${invalid}/${allLeads.length}`);
  console.log(`   - Updated to UNQUALIFIED: ${updated}`);
  console.log(`   - Errors: ${errors}`);
}

auditEmailValidity().catch(console.error);

