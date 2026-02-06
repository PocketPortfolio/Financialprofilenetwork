/**
 * Analyze DO_NOT_CONTACT Leads
 * 
 * This script checks why leads have DO_NOT_CONTACT status
 * and whether they should have optOut=true
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq, sql, desc } from 'drizzle-orm';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function analyzeDoNotContactLeads() {
  console.log('🔍 Analyzing DO_NOT_CONTACT Leads');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get all DO_NOT_CONTACT leads
    const doNotContactLeads = await db
      .select({
        id: leads.id,
        email: leads.email,
        companyName: leads.companyName,
        status: leads.status,
        optOut: leads.optOut,
        researchSummary: leads.researchSummary,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
      })
      .from(leads)
      .where(eq(leads.status, 'DO_NOT_CONTACT'))
      .orderBy(desc(leads.updatedAt))
      .limit(50);

    console.log(`📊 Found ${doNotContactLeads.length} DO_NOT_CONTACT leads (showing first 50)\n`);

    // Categorize them
    const withOptOut = doNotContactLeads.filter(l => l.optOut === true);
    const withoutOptOut = doNotContactLeads.filter(l => l.optOut !== true);

    console.log(`   ✅ With optOut=true: ${withOptOut.length}`);
    console.log(`   ⚠️  Without optOut=true: ${withoutOptOut.length}\n`);

    // Check audit logs for these leads to understand why they're DO_NOT_CONTACT
    console.log('📋 Sample DO_NOT_CONTACT Leads (without optOut):\n');
    
    for (const lead of withoutOptOut.slice(0, 10)) {
      // Get recent audit logs for this lead
      const recentLogs = await db
        .select({
          action: auditLogs.action,
          aiReasoning: auditLogs.aiReasoning,
          metadata: auditLogs.metadata,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .where(eq(auditLogs.leadId, lead.id))
        .orderBy(desc(auditLogs.createdAt))
        .limit(5);

      console.log(`   📧 ${lead.email} (${lead.companyName})`);
      console.log(`      Status: ${lead.status}, OptOut: ${lead.optOut}`);
      console.log(`      Updated: ${lead.updatedAt.toISOString()}`);
      
      if (lead.researchSummary) {
        const summary = lead.researchSummary.substring(0, 100);
        console.log(`      Summary: ${summary}...`);
      }

      // Check for status change logs
      const statusLogs = recentLogs.filter(log => 
        log.action === 'STATUS_CHANGED' || 
        log.aiReasoning?.toLowerCase().includes('do_not_contact') ||
        log.aiReasoning?.toLowerCase().includes('opt') ||
        log.aiReasoning?.toLowerCase().includes('unsubscribe')
      );

      if (statusLogs.length > 0) {
        console.log(`      Recent status changes:`);
        for (const log of statusLogs.slice(0, 2)) {
          console.log(`         - ${log.action}: ${log.aiReasoning || 'No reasoning'}`);
        }
      } else if (recentLogs.length > 0) {
        console.log(`      Recent activity: ${recentLogs[0].action}`);
      } else {
        console.log(`      No recent audit logs`);
      }
      console.log('');
    }

    // Check for patterns in research summaries
    console.log('🔍 Common Reasons for DO_NOT_CONTACT:\n');
    
    const placeholderEmails = doNotContactLeads.filter(l => 
      l.researchSummary?.toLowerCase().includes('placeholder') ||
      l.email.includes('placeholder')
    );
    
    const invalidEmails = doNotContactLeads.filter(l => 
      l.researchSummary?.toLowerCase().includes('invalid') ||
      l.researchSummary?.toLowerCase().includes('no mx')
    );

    const sequenceComplete = doNotContactLeads.filter(l => 
      l.researchSummary?.toLowerCase().includes('sequence') ||
      l.researchSummary?.toLowerCase().includes('all 4')
    );

    console.log(`   📧 Placeholder emails: ${placeholderEmails.length}`);
    console.log(`   ❌ Invalid emails: ${invalidEmails.length}`);
    console.log(`   📨 Sequence complete: ${sequenceComplete.length}`);
    console.log(`   🛑 Opt-out related: ${withOptOut.length}`);
    console.log(`   ❓ Other reasons: ${doNotContactLeads.length - placeholderEmails.length - invalidEmails.length - sequenceComplete.length - withOptOut.length}\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:\n');
    console.log(`   Total DO_NOT_CONTACT leads: ${doNotContactLeads.length}`);
    console.log(`   With optOut=true: ${withOptOut.length} (${Math.round((withOptOut.length / doNotContactLeads.length) * 100)}%)`);
    console.log(`   Without optOut=true: ${withoutOptOut.length} (${Math.round((withoutOptOut.length / doNotContactLeads.length) * 100)}%)`);
    console.log(`\n   Breakdown:`);
    console.log(`   - Placeholder emails: ${placeholderEmails.length}`);
    console.log(`   - Invalid emails: ${invalidEmails.length}`);
    console.log(`   - Sequence complete: ${sequenceComplete.length}`);
    console.log(`   - Opt-out related: ${withOptOut.length}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('ℹ️  Note: DO_NOT_CONTACT status can be set for various reasons:');
    console.log('   - Opt-out requests (should have optOut=true)');
    console.log('   - Invalid/placeholder emails');
    console.log('   - Email sequence completed with no response');
    console.log('   - Other business logic reasons\n');

  } catch (error: any) {
    console.error('❌ Error analyzing DO_NOT_CONTACT leads:', error);
    throw error;
  }
}

// Run the analysis
analyzeDoNotContactLeads()
  .then(() => {
    console.log('✅ Analysis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
