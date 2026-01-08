/**
 * Resolve Placeholder Emails
 * Attempts to resolve placeholder emails using GitHub API
 * Archives leads that cannot be resolved
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { like, or, eq } from 'drizzle-orm';
import { resolveEmailFromGitHub, isPlaceholderEmail } from '@/lib/sales/email-resolution';

async function resolvePlaceholders() {
  console.log('🔍 Resolving placeholder emails...\n');

  // Find all placeholder leads
  const placeholderLeads = await db
    .select()
    .from(leads)
    .where(
      or(
        like(leads.email, '%.placeholder'),
        like(leads.email, '%@similar.%'),
        like(leads.email, '%@github-hiring.%')
      )
    );

  console.log(`   Found ${placeholderLeads.length} placeholder leads to resolve\n`);

  if (placeholderLeads.length === 0) {
    console.log('✅ No placeholder leads found');
    return { resolved: 0, archived: 0 };
  }

  let resolved = 0;
  let archived = 0;

  for (const lead of placeholderLeads) {
    try {
      // Extract GitHub username from placeholder email
      const githubUsername = lead.email.includes('@github-hiring.placeholder')
        ? lead.email.split('@')[0]
        : lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');

      console.log(`   Resolving ${lead.companyName} (${lead.email})...`);

      const resolution = await resolveEmailFromGitHub(
        githubUsername,
        lead.companyName,
        process.env.GITHUB_TOKEN
      );

      if (resolution.email && resolution.confidence >= 50) {
        // Update with resolved email
        await db.update(leads)
          .set({ 
            email: resolution.email,
            updatedAt: new Date()
          })
          .where(eq(leads.id, lead.id));
        console.log(`     ✅ Resolved: ${resolution.email} (confidence: ${resolution.confidence}%, source: ${resolution.source})`);
        resolved++;
      } else {
        // Cannot resolve - mark as DO_NOT_CONTACT
        await db.update(leads)
          .set({ 
            status: 'DO_NOT_CONTACT',
            researchSummary: 'Email could not be resolved from placeholder',
            updatedAt: new Date()
          })
          .where(eq(leads.id, lead.id));
        console.log(`     ❌ Cannot resolve - marked as DO_NOT_CONTACT`);
        archived++;
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`     ❌ Error resolving ${lead.companyName}:`, error.message);
      // Mark as DO_NOT_CONTACT on error
      await db.update(leads)
        .set({ 
          status: 'DO_NOT_CONTACT',
          researchSummary: `Email resolution error: ${error.message}`,
          updatedAt: new Date()
        })
        .where(eq(leads.id, lead.id));
      archived++;
    }
  }

  console.log(`\n📊 Resolution Results:`);
  console.log(`   Resolved: ${resolved}`);
  console.log(`   Archived: ${archived}`);

  return { resolved, archived };
}

resolvePlaceholders().catch(console.error);

