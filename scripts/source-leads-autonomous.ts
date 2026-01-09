/**
 * Autonomous Lead Sourcing Script
 * 
 * Sources leads from:
 * - GitHub hiring repositories
 * - YC company lists
 * - Public "Hiring" posts
 * 
 * Target: 50 qualified CTOs/day
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, ilike } from 'drizzle-orm';
import { sourceFromGitHubHiring } from '@/lib/sales/sourcing/github-hiring-scraper';
import { generateLookalikeLeads } from '@/lib/sales/sourcing/lookalike-seeding';
import { isPlaceholderEmail, resolveEmailFromGitHub } from '@/lib/sales/email-resolution';
import { validateEmail } from '@/lib/sales/email-validation';
import { getRevenueDrivenDecisions } from '@/lib/sales/revenue-driver';
const QUALIFYING_TITLES = [
  // Corporate-focused titles (prioritize for $1k sponsorships)
  'CTO',
  'Chief Technology Officer',
  'VP Engineering',
  'VP of Engineering',
  'Head of Engineering',
  'Engineering Director',
  'Technical Co-Founder',
  'Co-Founder & CTO',
  // Add corporate decision-makers
  'Founder',
  'Co-Founder',
  'Head of Product',
  'VP Product',
];

interface LeadCandidate {
  email: string;
  firstName?: string;
  lastName?: string;
  companyName: string;
  jobTitle: string;
  linkedinUrl?: string;
  dataSource: string;
}

/**
 * Source leads from GitHub hiring repositories
 * Sprint 4: Hybrid Sourcing - GitHub Hiring Scraper
 */
async function sourceFromGitHub(): Promise<LeadCandidate[]> {
  console.log('🔍 Searching GitHub for Corporate/Fintech hiring...');
  
  // Use the new GitHub hiring scraper module
  const githubToken = process.env.GITHUB_TOKEN;
  const githubLeads = await sourceFromGitHubHiring(githubToken);
  
  // Convert to LeadCandidate format
  return githubLeads.map(lead => ({
    email: lead.email,
    firstName: lead.firstName,
    lastName: lead.lastName,
    companyName: lead.companyName,
    jobTitle: lead.jobTitle,
    linkedinUrl: undefined,
    dataSource: lead.dataSource,
  }));
}

/**
 * Source leads from YC company list
 * UPDATED: Filter for fintech companies
 */
async function sourceFromYC(): Promise<LeadCandidate[]> {
  const candidates: LeadCandidate[] = [];
  
  console.log('🔍 Searching YC company list for Fintech companies...');
  
  // UPDATED: Filter YC companies for:
  // - Fintech category
  // - Companies with 10+ employees (Corporate Sponsor targets)
  // - CTO/VP Engineering contacts
  
  // In production, this would:
  // 1. Fetch YC company list (if API available)
  // 2. Filter for fintech/financial services companies
  // 3. Find CTO/VP Engineering contacts at companies with 10+ employees
  
  // For now, return empty array
  // TODO: Implement YC company list integration
  console.log('⚠️  YC sourcing not yet implemented (requires YC API or scraping)');
  
  return candidates;
}

/**
 * Source leads from public hiring posts
 * UPDATED: Prioritize corporate/fintech posts
 */
async function sourceFromHiringPosts(): Promise<LeadCandidate[]> {
  const candidates: LeadCandidate[] = [];
  
  console.log('🔍 Searching public hiring posts for Corporate/Fintech roles...');
  
  // UPDATED: Sources with corporate focus:
  // - Hacker News "Who's Hiring" - filter for fintech/financial services
  // - Twitter/X posts with #hiring #fintech #cto
  // - LinkedIn posts from fintech companies
  
  // For now, return empty array
  // TODO: Implement hiring post scraping
  console.log('⚠️  Hiring post sourcing not yet implemented');
  
  return candidates;
}

/**
 * Check if lead already exists
 */
async function leadExists(email: string, companyName: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(leads)
    .where(
      eq(leads.email, email)
    )
    .limit(1);
  
  return existing.length > 0;
}

/**
 * Qualify lead (check if title matches)
 */
function qualifyLead(candidate: LeadCandidate): boolean {
  const title = candidate.jobTitle?.toLowerCase() || '';
  return QUALIFYING_TITLES.some(qualifyingTitle => 
    title.includes(qualifyingTitle.toLowerCase())
  );
}

/**
 * Main sourcing function
 * v2.1: Revenue-driven dynamic volume adjustment
 */
async function sourceLeadsAutonomous() {
  console.log('🚀 Autonomous Lead Sourcing Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // v2.1: Calculate dynamic target based on revenue gap
  const allLeads = await db.select().from(leads);
  const revenueDecisions = getRevenueDrivenDecisions(allLeads.map(lead => ({
    id: lead.id,
    status: lead.status,
    score: lead.score || 0,
    dealTier: (lead.researchData as any)?.dealTier || null,
    researchData: lead.researchData as any,
  })));
  
  // Use dynamic target (clamped to safety limits)
  const MIN_LEADS_PER_DAY = 20;
  const MAX_LEADS_PER_DAY = 200;
  const DYNAMIC_TARGET = Math.max(
    MIN_LEADS_PER_DAY,
    Math.min(MAX_LEADS_PER_DAY, revenueDecisions.requiredLeadVolume)
  );
  
  console.log(`📊 Revenue-Driven Sourcing:`);
  console.log(`   Current Revenue: £${revenueDecisions.currentRevenue.toLocaleString()}`);
  console.log(`   Projected Revenue: £${revenueDecisions.projectedRevenue.toLocaleString()}`);
  console.log(`   Revenue Gap: £${revenueDecisions.revenueGap.toLocaleString()}`);
  console.log(`   Action: ${revenueDecisions.adjustment.action.toUpperCase()}`);
  console.log(`   Target: ${DYNAMIC_TARGET} qualified leads/day (Revenue-driven)`);
  console.log(`   Reason: ${revenueDecisions.adjustment.reason}`);
  console.log('');

  const allCandidates: LeadCandidate[] = [];
  
  // Source from multiple channels
  const [githubLeads, ycLeads, hiringLeads] = await Promise.all([
    sourceFromGitHub(),
    sourceFromYC(),
    sourceFromHiringPosts(),
  ]);
  
  allCandidates.push(...githubLeads, ...ycLeads, ...hiringLeads);
  
  // Sprint 4: Lookalike Seeding (if we have good leads)
  if (allCandidates.length < DYNAMIC_TARGET) {
    console.log('🔍 Generating lookalike leads from high-scoring existing leads...');
    const lookalikeLeads = await generateLookalikeLeads(70, DYNAMIC_TARGET - allCandidates.length);
    const lookalikeCandidates: LeadCandidate[] = lookalikeLeads.map(lead => ({
      email: lead.email,
      companyName: lead.companyName,
      jobTitle: lead.jobTitle,
      dataSource: lead.dataSource,
    }));
    allCandidates.push(...lookalikeCandidates);
    console.log(`✅ Generated ${lookalikeCandidates.length} lookalike leads`);
  }
  
  console.log(`📊 Found ${allCandidates.length} total candidates`);
  
  // Qualify leads
  const qualified = allCandidates.filter(qualifyLead);
  console.log(`✅ ${qualified.length} candidates qualified (CTO/VP Engineering)`);
  
  // Check for duplicates and create new leads
  let created = 0;
  let skipped = 0;
  let rejected = 0;
  
  for (const candidate of qualified) {
    // CRITICAL: Reject placeholder emails - they should never be inserted
    if (isPlaceholderEmail(candidate.email)) {
      console.log(`⚠️  Rejecting placeholder email: ${candidate.email} for ${candidate.companyName}`);
      rejected++;
      continue;
    }
    
    // Try to resolve placeholder emails if they exist (shouldn't happen, but safety check)
    let emailToUse = candidate.email;
    if (isPlaceholderEmail(emailToUse)) {
      console.log(`   🔍 Attempting to resolve placeholder email for ${candidate.companyName}...`);
      const githubUsername = emailToUse.includes('@github-hiring.placeholder')
        ? emailToUse.split('@')[0]
        : candidate.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const resolution = await resolveEmailFromGitHub(
        githubUsername,
        candidate.companyName,
        process.env.GITHUB_TOKEN
      );
      
      if (resolution.email && resolution.confidence >= 50 && !isPlaceholderEmail(resolution.email)) {
        emailToUse = resolution.email;
        console.log(`   ✅ Resolved to: ${emailToUse} (confidence: ${resolution.confidence}%)`);
      } else {
        console.log(`   ❌ Could not resolve placeholder email - skipping lead`);
        rejected++;
        continue;
      }
    }
    
    // PHASE 1: Validate email with MX record check (v2.1)
    const validation = await validateEmail(emailToUse);
    if (!validation.isValid) {
      console.log(`⚠️  Rejecting invalid email: ${emailToUse} for ${candidate.companyName} - ${validation.reason}`);
      rejected++;
      continue;
    }
    
    if (await leadExists(emailToUse, candidate.companyName)) {
      skipped++;
      continue;
    }
    
    try {
      await db.insert(leads).values({
        email: emailToUse,
        firstName: candidate.firstName || null,
        lastName: candidate.lastName || null,
        companyName: candidate.companyName,
        jobTitle: candidate.jobTitle,
        linkedinUrl: candidate.linkedinUrl || null,
        dataSource: candidate.dataSource,
        dataSourceDate: new Date(),
        status: 'NEW',
        score: 0,
      });
      
      created++;
      console.log(`✅ Created lead: ${emailToUse} at ${candidate.companyName}`);
    } catch (error: any) {
      console.error(`❌ Failed to create lead ${emailToUse}:`, error.message);
    }
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary:`);
  console.log(`   Created: ${created} new leads`);
  console.log(`   Skipped: ${skipped} duplicates`);
  console.log(`   Rejected: ${rejected} placeholder/invalid emails`);
  console.log(`   Target: ${DYNAMIC_TARGET} leads/day (Revenue-driven)`);
  console.log(`   Progress: ${created}/${DYNAMIC_TARGET} (${Math.round((created / DYNAMIC_TARGET) * 100)}%)`);
  console.log('');
  
  if (rejected > 0) {
    console.log(`⚠️  Warning: ${rejected} leads rejected due to placeholder/invalid emails`);
    console.log('   Placeholder emails are not allowed - leads must have real email addresses');
  }
  
  if (created < DYNAMIC_TARGET) {
    console.log(`⚠️  Warning: Only ${created} leads created, target is ${DYNAMIC_TARGET}`);
    console.log('   Consider implementing additional sourcing channels');
  } else {
    console.log('✅ Target met!');
  }
}

// Run if called directly
if (require.main === module) {
  sourceLeadsAutonomous()
    .then(() => {
      console.log('✅ Lead sourcing completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Lead sourcing failed:', error);
      process.exit(1);
    });
}

export { sourceLeadsAutonomous };

