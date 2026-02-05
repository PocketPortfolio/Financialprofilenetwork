/**
 * Process Historical STOP Emails Automatically
 * 
 * This script processes STOP emails that were received before the webhook was configured.
 * It reads email addresses from a file and automatically:
 * 1. Matches them to leads in the database
 * 2. Updates leads to DO_NOT_CONTACT with optOut=true
 * 3. Creates conversation records for audit trail
 * 4. Sends opt-out confirmation emails
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import { db } from '@/db/sales/client';
import { conversations, leads, auditLogs } from '@/db/sales/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { sendEmail } from '@/app/agent/outreach';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Send opt-out confirmation email
 */
async function sendOptOutConfirmation(
  leadEmail: string,
  leadId: string
): Promise<void> {
  try {
    const subject = 'You have been unsubscribed';
    const body = `Thank you for letting us know.

We have removed you from our mailing list and will no longer send you emails.

If you change your mind in the future, you can always reach out to us at ai@pocketportfolio.app.

Best regards,
Pocket Portfolio Team

---
This is an automated confirmation. You will not receive any further emails from us.`;

    await sendEmail(leadEmail, subject, body, leadId);
    
    // Log the confirmation email
    await db.insert(auditLogs).values({
      leadId,
      action: 'EMAIL_SENT',
      aiReasoning: 'Opt-out confirmation email sent to acknowledge unsubscribe request (historical processing)',
      metadata: {
        email: leadEmail,
        emailType: 'OPT_OUT_CONFIRMATION',
        timestamp: new Date().toISOString(),
        historicalProcessing: true,
      },
    });
    
    console.log(`   ✅ Confirmation email sent to ${leadEmail}`);
  } catch (error: any) {
    console.error(`   ❌ Failed to send confirmation to ${leadEmail}:`, error.message);
    // Don't throw - continue processing other leads
  }
}

/**
 * Process historical STOP emails from a file
 */
async function processHistoricalStopEmails(
  emailAddresses: string[],
  options: {
    sendConfirmations?: boolean;
    dryRun?: boolean;
  } = {}
) {
  const { sendConfirmations = true, dryRun = false } = options;

  console.log('🔄 Processing Historical STOP Emails');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📧 Email addresses to process: ${emailAddresses.length}`);
  console.log(`📋 Options: sendConfirmations=${sendConfirmations}, dryRun=${dryRun}\n`);

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  // Normalize email addresses (lowercase, trim)
  const normalizedEmails = emailAddresses.map(e => e.toLowerCase().trim()).filter(Boolean);
  
  if (normalizedEmails.length === 0) {
    console.log('❌ No valid email addresses provided');
    return;
  }

  // Find matching leads in database
  const matchingLeads = await db
    .select({
      id: leads.id,
      email: leads.email,
      companyName: leads.companyName,
      status: leads.status,
      optOut: leads.optOut,
    })
    .from(leads)
    .where(inArray(leads.email, normalizedEmails));

  console.log(`✅ Found ${matchingLeads.length} matching leads in database\n`);

  if (matchingLeads.length === 0) {
    console.log('⚠️  No matching leads found. These emails may not be in the database yet.');
    return;
  }

  // Separate leads that need updating vs already processed
  const needsUpdate = matchingLeads.filter(
    lead => lead.status !== 'DO_NOT_CONTACT' || lead.optOut !== true
  );
  const alreadyProcessed = matchingLeads.filter(
    lead => lead.status === 'DO_NOT_CONTACT' && lead.optOut === true
  );

  console.log(`📊 Status:`);
  console.log(`   ✅ Already processed: ${alreadyProcessed.length}`);
  console.log(`   🔄 Needs update: ${needsUpdate.length}\n`);

  if (needsUpdate.length === 0) {
    console.log('✅ All leads are already processed!\n');
    return;
  }

  // Show leads that will be updated
  console.log('📋 Leads to be updated:\n');
  for (const lead of needsUpdate) {
    console.log(`   - ${lead.email} (${lead.companyName})`);
    console.log(`     Current: status=${lead.status}, optOut=${lead.optOut}`);
    console.log(`     Will set: status=DO_NOT_CONTACT, optOut=true\n`);
  }

  if (dryRun) {
    console.log('⚠️  DRY RUN - Would update the above leads');
    return;
  }

  // Update leads
  console.log('🔄 Updating leads...\n');
  let updated = 0;
  let conversationsCreated = 0;
  let confirmationsSent = 0;
  let errors = 0;

  for (const lead of needsUpdate) {
    try {
      // Update lead status
      await db.update(leads)
        .set({
          status: 'DO_NOT_CONTACT',
          optOut: true,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));

      console.log(`✅ Updated: ${lead.email}`);

      // Create conversation record for audit trail
      await db.insert(conversations).values({
        leadId: lead.id,
        type: 'FOLLOW_UP',
        subject: 'Historical STOP - Manual Processing',
        body: 'STOP email received before webhook was configured. Processed automatically via historical processing script.',
        direction: 'inbound',
        classification: 'STOP',
        emailId: `historical-${lead.id}-${Date.now()}`,
      });

      conversationsCreated++;

      // Create audit log
      await db.insert(auditLogs).values({
        leadId: lead.id,
        action: 'STATUS_CHANGED',
        aiReasoning: 'Historical STOP email processed - lead opted out before webhook was configured',
        metadata: {
          previousStatus: lead.status,
          newStatus: 'DO_NOT_CONTACT',
          optOut: true,
          historicalProcessing: true,
          processedAt: new Date().toISOString(),
        },
      });

      // Send opt-out confirmation email
      if (sendConfirmations) {
        await sendOptOutConfirmation(lead.email, lead.id);
        confirmationsSent++;
      }

      updated++;
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`❌ Error processing ${lead.email}:`, error.message);
      errors++;
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Processing Summary:\n');
  console.log(`   ✅ Leads updated: ${updated}`);
  console.log(`   📝 Conversations created: ${conversationsCreated}`);
  console.log(`   📧 Confirmation emails sent: ${confirmationsSent}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   ✅ Already processed: ${alreadyProcessed.length}`);
  console.log(`   ⚠️  Not found in database: ${normalizedEmails.length - matchingLeads.length}\n`);

  // Show emails not found in database
  const foundEmails = new Set(matchingLeads.map(l => l.email.toLowerCase()));
  const notFoundEmails = normalizedEmails.filter(e => !foundEmails.has(e));
  
  if (notFoundEmails.length > 0) {
    console.log('⚠️  Email addresses not found in database:');
    for (const email of notFoundEmails) {
      console.log(`   - ${email}`);
    }
    console.log('');
  }
}

/**
 * Main function - reads email addresses from file or command line
 */
async function main() {
  // Get all arguments after script name
  // npm passes arguments after --, so we need to handle both cases
  const allArgs = process.argv.slice(2);
  
  // Filter out npm/node arguments and get actual user arguments
  const args = allArgs.filter(arg => 
    !arg.includes('node_modules') && 
    !arg.includes('ts-node') &&
    arg !== '--project' &&
    !arg.endsWith('.ts')
  );
  
  // Check for file path
  const fileIndex = args.indexOf('--file');
  const filePath = fileIndex >= 0 && fileIndex < args.length - 1 ? args[fileIndex + 1] : null;

  // Check for options
  const dryRun = args.includes('--dry-run');
  const noConfirmations = args.includes('--no-confirmations');

  let emailAddresses: string[] = [];

  if (filePath) {
    // Read from file
    console.log(`📂 Reading email addresses from: ${filePath}\n`);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      emailAddresses = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#') && line.includes('@'));
      
      console.log(`✅ Loaded ${emailAddresses.length} email addresses from file\n`);
    } catch (error: any) {
      console.error(`❌ Error reading file: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Read from command line arguments (filter out flags)
    emailAddresses = args.filter(arg => 
      !arg.startsWith('--') && 
      arg.includes('@') &&
      arg !== filePath
    );
    
    if (emailAddresses.length > 0) {
      console.log(`📧 Processing ${emailAddresses.length} email addresses from command line\n`);
    }
  }

  // Show usage if no emails provided
  if (emailAddresses.length === 0 && !filePath) {
    console.log('📧 Historical STOP Email Processor\n');
    console.log('Usage:');
    console.log('  npm run process-historical-stop -- --file path/to/emails.txt');
    console.log('  npm run process-historical-stop -- email1@example.com email2@example.com');
    console.log('  npm run process-historical-stop -- --file emails.txt --dry-run');
    console.log('  npm run process-historical-stop -- --file emails.txt --no-confirmations\n');
    console.log('Options:');
    console.log('  --file <path>        Read email addresses from file (one per line)');
    console.log('  --dry-run            Show what would be done without making changes');
    console.log('  --no-confirmations   Skip sending opt-out confirmation emails\n');
    process.exit(0);
  }

  if (emailAddresses.length === 0) {
    console.log('❌ No email addresses provided');
    process.exit(1);
  }

  try {
    await processHistoricalStopEmails(emailAddresses, {
      sendConfirmations: !noConfirmations,
      dryRun,
    });
    console.log('✅ Processing complete\n');
  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
