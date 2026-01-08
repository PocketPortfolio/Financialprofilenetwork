/**
 * Autonomous Inbound Email Processing Script
 * 
 * Processes inbound emails that need replies
 * Runs every hour via GitHub Actions
 */

import { db } from '@/db/sales/client';
import { conversations, leads } from '@/db/sales/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { handleInboundEmail } from '@/app/agent/conversation-handler';

/**
 * Process inbound emails that need replies
 */
async function processInboundAutonomous() {
  console.log('📬 Processing Inbound Emails');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Find inbound emails from last 24 hours that don't have replies yet
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inboundEmails = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.direction, 'inbound'),
        eq(conversations.classification, 'FOLLOW_UP') // Only process follow-ups, not escalations
      )
    )
    .orderBy(conversations.createdAt);
  
  console.log(`   Found ${inboundEmails.length} inbound emails to process`);
  
  let replied = 0;
  let skipped = 0;
  
  for (const email of inboundEmails) {
    // Check if we already replied to this thread
    const existingReplies = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.leadId, email.leadId),
          eq(conversations.direction, 'outbound'),
          eq(conversations.threadId, email.threadId || email.emailId)
        )
      )
      .limit(1);
    
    if (existingReplies.length > 0) {
      skipped++;
      continue;
    }
    
    // Get lead info
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, email.leadId))
      .limit(1);
    
    if (!lead) {
      skipped++;
      continue;
    }
    
    console.log(`   Processing: ${lead.email} - "${email.subject || 'No subject'}"`);
    
    const result = await handleInboundEmail(
      email.leadId,
      email.body,
      email.subject || 'Previous email',
      email.emailId || '',
      email.threadId || undefined
    );
    
    if (result.replied) {
      replied++;
      console.log(`   ✅ Replied (${result.reason})`);
    } else {
      skipped++;
      console.log(`   ⏭️  Skipped: ${result.reason}`);
    }
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Replied: ${replied} emails`);
  console.log(`   Skipped: ${skipped} emails`);
  console.log('');
}

// Run if called directly
if (require.main === module) {
  processInboundAutonomous()
    .then(() => {
      console.log('✅ Inbound processing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Inbound processing failed:', error);
      process.exit(1);
    });
}

export { processInboundAutonomous };


