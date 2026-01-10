/**
 * Archive Invalid Emails Script
 * 
 * Marks all leads with invalid emails as UNQUALIFIED
 * This includes:
 * - Placeholder emails (.placeholder, @similar.*, @github-hiring.*)
 * - Test domains (@example.com, @test.com, etc.)
 * - Disposable email providers
 * - Emails with no MX records
 * - Bounced/delayed emails (from webhook events)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, or, like, sql, inArray } from 'drizzle-orm';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';
import { validateEmail } from '@/lib/sales/email-validation';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function archiveInvalidEmails() {
  console.log('🧹 Archiving Invalid Emails');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    let archived = 0;

    // Step 1: Archive placeholder emails
    console.log('📧 Step 1: Archiving placeholder emails...');
    const placeholderLeads = await db
      .select({ id: leads.id, email: leads.email, companyName: leads.companyName })
      .from(leads)
      .where(
        sql`(${leads.email} LIKE '%.placeholder' OR ${leads.email} LIKE '%@similar.%' OR ${leads.email} LIKE '%@github-hiring.%') AND ${leads.status} != 'UNQUALIFIED'`
      );

    for (const lead of placeholderLeads) {
      await db.update(leads)
        .set({
          status: 'UNQUALIFIED',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Invalid email archive: Placeholder email detected',
        metadata: {
          previousStatus: 'NEW',
          newStatus: 'UNQUALIFIED',
          archiveReason: 'placeholder_email',
          email: lead.email,
        },
      });

      archived++;
      console.log(`   ✅ Archived: ${lead.email} at ${lead.companyName}`);
    }

    console.log(`   📊 Archived ${placeholderLeads.length} placeholder emails`);

    // Step 2: Archive test domain emails
    console.log('');
    console.log('📧 Step 2: Archiving test domain emails...');
    const testDomainLeads = await db
      .select({ id: leads.id, email: leads.email, companyName: leads.companyName })
      .from(leads)
      .where(
        sql`(${leads.email} LIKE '%@example.com' OR ${leads.email} LIKE '%@example.org' OR ${leads.email} LIKE '%@example.net' OR ${leads.email} LIKE '%@test.com' OR ${leads.email} LIKE '%@test.local' OR ${leads.email} LIKE '%@invalid.com' OR ${leads.email} LIKE '%@fake.com' OR ${leads.email} LIKE '%@dummy.com' OR ${leads.email} LIKE '%@sample.com') AND ${leads.status} != 'UNQUALIFIED'`
      );

    for (const lead of testDomainLeads) {
      await db.update(leads)
        .set({
          status: 'UNQUALIFIED',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Invalid email archive: Test domain detected',
        metadata: {
          previousStatus: 'NEW',
          newStatus: 'UNQUALIFIED',
          archiveReason: 'test_domain',
          email: lead.email,
        },
      });

      archived++;
      console.log(`   ✅ Archived: ${lead.email} at ${lead.companyName}`);
    }

    console.log(`   📊 Archived ${testDomainLeads.length} test domain emails`);

    // Step 3: Archive disposable email providers
    console.log('');
    console.log('📧 Step 3: Archiving disposable email providers...');
    const disposableProviders = [
      'tempmail.com',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'throwaway.email',
      'getnada.com',
      'mohmal.com',
      'yopmail.com',
      'maildrop.cc',
      'trashmail.com',
      'temp-mail.org',
      'mailnesia.com',
      'mintemail.com',
      'sharklasers.com',
      'grr.la',
      'guerrillamailblock.com',
    ];

    const disposableConditions = disposableProviders.map(provider =>
      sql`${leads.email} LIKE ${`%@${provider}`}`
    );

    const disposableLeads = await db
      .select({ id: leads.id, email: leads.email, companyName: leads.companyName })
      .from(leads)
      .where(
        sql`(${sql.join(disposableConditions, sql` OR `)}) AND ${leads.status} != 'UNQUALIFIED'`
      );

    for (const lead of disposableLeads) {
      await db.update(leads)
        .set({
          status: 'UNQUALIFIED',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Invalid email archive: Disposable email provider detected',
        metadata: {
          previousStatus: 'NEW',
          newStatus: 'UNQUALIFIED',
          archiveReason: 'disposable_provider',
          email: lead.email,
        },
      });

      archived++;
      console.log(`   ✅ Archived: ${lead.email} at ${lead.companyName}`);
    }

    console.log(`   📊 Archived ${disposableLeads.length} disposable provider emails`);

    // Step 4: Archive bounced/delayed emails (from webhook events)
    console.log('');
    console.log('📧 Step 4: Archiving bounced/delayed emails...');
    const deadEmailLogs = await db
      .select({
        leadId: auditLogs.leadId,
        emailId: sql<string>`${auditLogs.metadata}->>'emailId'`,
        deliveryStatus: sql<string>`${auditLogs.metadata}->>'deliveryStatus'`,
      })
      .from(auditLogs)
      .where(
        sql`${auditLogs.metadata}->>'deliveryStatus' IN ('bounced', 'delivery_delayed', 'failed') AND ${auditLogs.leadId} IS NOT NULL`
      );

    const deadLeadIds = [...new Set(deadEmailLogs.map((log: any) => log.leadId).filter(Boolean))];

    let deadLeads: Array<{ id: string; email: string; companyName: string }> = [];
    if (deadLeadIds.length > 0) {
      deadLeads = await db
        .select({ id: leads.id, email: leads.email, companyName: leads.companyName })
        .from(leads)
        .where(
          sql`${leads.id} = ANY(${deadLeadIds}) AND ${leads.status} != 'UNQUALIFIED'`
        );

      for (const lead of deadLeads) {
        await db.update(leads)
          .set({
            status: 'UNQUALIFIED',
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));

        await db.insert(auditLogs).values({
          leadId: lead.id,
          action: 'STATUS_CHANGED',
          aiReasoning: 'Invalid email archive: Email bounced/delayed',
          metadata: {
            previousStatus: 'CONTACTED',
            newStatus: 'UNQUALIFIED',
            archiveReason: 'bounced_or_delayed',
            email: lead.email,
          },
        });

        archived++;
        console.log(`   ✅ Archived: ${lead.email} at ${lead.companyName}`);
      }

      console.log(`   📊 Archived ${deadLeads.length} bounced/delayed emails`);
    } else {
      console.log(`   📊 No bounced/delayed emails found`);
    }

    // Step 5: Validate remaining emails and archive invalid ones
    console.log('');
    console.log('📧 Step 5: Validating remaining emails (this may take a while)...');
    const remainingLeads = await db
      .select({ id: leads.id, email: leads.email, companyName: leads.companyName })
      .from(leads)
      .where(
        sql`${leads.status} NOT IN ('UNQUALIFIED', 'DO_NOT_CONTACT', 'CONVERTED')`
      )
      .limit(100); // Process in batches to avoid timeout

    let validated = 0;
    let invalidFound = 0;

    for (const lead of remainingLeads) {
      // Skip if already placeholder (shouldn't happen, but safety check)
      if (isPlaceholderEmail(lead.email)) {
        await db.update(leads)
          .set({ status: 'UNQUALIFIED', updatedAt: new Date() })
          .where(eq(leads.id, lead.id));
        invalidFound++;
        archived++;
        continue;
      }

      // Validate email
      const validation = await validateEmail(lead.email);
      if (!validation.isValid) {
        await db.update(leads)
          .set({
            status: 'UNQUALIFIED',
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));

        await db.insert(auditLogs).values({
          leadId: lead.id,
          action: 'STATUS_CHANGED',
          aiReasoning: `Invalid email archive: ${validation.reason}`,
          metadata: {
            previousStatus: 'NEW',
            newStatus: 'UNQUALIFIED',
            archiveReason: 'validation_failed',
            validationReason: validation.reason,
            email: lead.email,
          },
        });

        invalidFound++;
        archived++;
        console.log(`   ❌ Invalid: ${lead.email} - ${validation.reason}`);
      } else {
        validated++;
      }

      // Small delay to avoid overwhelming DNS
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`   📊 Validated ${remainingLeads.length} emails: ${validated} valid, ${invalidFound} invalid`);

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Archive complete: ${archived} leads marked as UNQUALIFIED`);
    console.log(`   This will trigger Auto-Replenishment to source fresh leads`);
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Placeholder emails: ${placeholderLeads.length}`);
    console.log(`   - Test domain emails: ${testDomainLeads.length}`);
    console.log(`   - Disposable providers: ${disposableLeads.length}`);
    console.log(`   - Bounced/delayed: ${deadLeadIds.length > 0 ? deadLeads.length : 0}`);
    console.log(`   - Validation failed: ${invalidFound}`);
    console.log(`   - Total archived: ${archived}`);
  } catch (error: any) {
    console.error('❌ Error archiving invalid emails:', error);
    throw error;
  }
}

// Execute
archiveInvalidEmails()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

