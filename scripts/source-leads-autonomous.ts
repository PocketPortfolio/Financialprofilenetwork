/**
 * Autonomous Lead Sourcing Script
 * 
 * Sources leads from:
 * - GitHub hiring repositories (v2.1: Resolves emails before returning)
 * - YC company lists
 * - Public "Hiring" posts
 * 
 * v2.1 Features:
 * - Revenue-driven dynamic targeting
 * - Retry logic: Keeps sourcing until target is met (max 5 rounds)
 * - Email resolution: No placeholder emails returned
 * - Auto-replenishment: Replaces UNQUALIFIED leads automatically
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
import { sourceFromYC as sourceFromYCScraper } from '@/lib/sales/sourcing/yc-scraper';
import { sourceFromHiringPosts as sourceFromHNScraper } from '@/lib/sales/sourcing/hiring-posts-scraper';
import { sourceFromCrunchbase } from '@/lib/sales/sourcing/crunchbase-scraper';
import { sourceFromProductHunt } from '@/lib/sales/sourcing/producthunt-scraper';
import { sourceFromReddit } from '@/lib/sales/sourcing/reddit-scraper';
import { sourceFromTwitter } from '@/lib/sales/sourcing/twitter-scraper';
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
 * v2.1: Passes maxLeads parameter for retry logic
 */
async function sourceFromGitHub(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching GitHub for Corporate/Fintech hiring...');
  
  // Use the new GitHub hiring scraper module
  const githubToken = process.env.GITHUB_TOKEN;
  const githubLeads = await sourceFromGitHubHiring(githubToken, maxLeads);
  
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
 * v2.1: Strategic Diversification - Channel 2 (High-Ticket Targets)
 */
async function sourceFromYC(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching YC company list for Fintech/DevTools companies...');
  
  const ycLeads = await sourceFromYCScraper(maxLeads);
  
  // Convert to LeadCandidate format
  return ycLeads.map(lead => ({
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
 * Source leads from public hiring posts
 * v2.1: Strategic Diversification - Channel 3 (High-Intent)
 */
async function sourceFromHiringPosts(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching HN "Who is Hiring" threads for active hiring companies...');
  
  const hnLeads = await sourceFromHNScraper(maxLeads);
  
  // Convert to LeadCandidate format
  return hnLeads.map(lead => ({
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
 * Source leads from Crunchbase
 * v2.1: Strategic Diversification - Channel 4
 */
async function sourceFromCrunchbaseWrapper(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching Crunchbase for Fintech/DevTools companies...');
  
  const crunchbaseLeads = await sourceFromCrunchbase(maxLeads);
  
  return crunchbaseLeads.map(lead => ({
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
 * Source leads from Product Hunt
 * v2.1: Strategic Diversification - Channel 5
 */
async function sourceFromProductHuntWrapper(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching Product Hunt for Fintech/DevTools products...');
  
  const producthuntLeads = await sourceFromProductHunt(maxLeads);
  
  return producthuntLeads.map(lead => ({
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
 * Source leads from Reddit
 * v2.1: Strategic Diversification - Channel 6
 */
async function sourceFromRedditWrapper(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching Reddit for Fintech/DevTools hiring posts...');
  
  const redditLeads = await sourceFromReddit(maxLeads);
  
  return redditLeads.map(lead => ({
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
 * Source leads from Twitter/X
 * v2.1: Strategic Diversification - Channel 7
 */
async function sourceFromTwitterWrapper(maxLeads?: number): Promise<LeadCandidate[]> {
  console.log('🔍 Searching Twitter/X for Fintech/DevTools hiring posts...');
  
  const twitterLeads = await sourceFromTwitter(maxLeads);
  
  return twitterLeads.map(lead => ({
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
  
  // WAR MODE: Unlimited sourcing (Directive 011)
  const MIN_LEADS_PER_DAY = 20;
  const MAX_LEADS_PER_DAY = 10000; // Effectively unlimited (was 200)
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

  let created = 0;
  let skipped = 0;
  let rejected = 0;
  // WAR MODE: Scale rounds dynamically based on target (Directive 011 - 10K/day)
  // For 10K target: ~10 rounds needed (1000 leads/round with 3 channels)
  const MAX_ROUNDS = Math.max(5, Math.ceil(DYNAMIC_TARGET / 1000)); // Scale with target, min 5
  const ROUND_DELAY_MS = 2000; // 2 second delay between rounds

  console.log(`🔄 Sourcing Strategy: ${MAX_ROUNDS} rounds max, target: ${DYNAMIC_TARGET} leads/day`);

  // v2.1: Retry logic - Keep sourcing until target is met or max rounds reached
  for (let round = 1; round <= MAX_ROUNDS && created < DYNAMIC_TARGET; round++) {
    if (round > 1) {
      console.log(`\n🔄 Round ${round}/${MAX_ROUNDS}: Continuing to source leads (${created}/${DYNAMIC_TARGET} created)...`);
      await new Promise(resolve => setTimeout(resolve, ROUND_DELAY_MS));
    }

    const allCandidates: LeadCandidate[] = [];
    const remainingNeeded = DYNAMIC_TARGET - created;
    
    // Source from multiple channels
    // WAR MODE: Remove 300 cap, scale with target (Directive 011 - 10K/day)
    // Request 3x needed to account for rejections/deduplication, but scale up to 10K
    const targetToRequest = Math.min(remainingNeeded * 3, Math.max(300, DYNAMIC_TARGET / MAX_ROUNDS));
    
    console.log(`📡 Round ${round}: Sourcing up to ${targetToRequest} candidates...`);
    
    // WAR MODE: Multi-channel sourcing for 10K/day capacity
    const [githubLeads, ycLeads, hiringLeads, crunchbaseLeads, producthuntLeads, redditLeads, twitterLeads] = await Promise.all([
      sourceFromGitHub(targetToRequest), // Channel 1: GitHub
      sourceFromYC(targetToRequest), // Channel 2: YC
      sourceFromHiringPosts(targetToRequest), // Channel 3: HN
      sourceFromCrunchbaseWrapper(targetToRequest), // Channel 4: Crunchbase
      sourceFromProductHuntWrapper(targetToRequest), // Channel 5: Product Hunt
      sourceFromRedditWrapper(targetToRequest), // Channel 6: Reddit
      sourceFromTwitterWrapper(targetToRequest), // Channel 7: Twitter
    ]);
    
    allCandidates.push(
      ...githubLeads, 
      ...ycLeads, 
      ...hiringLeads,
      ...crunchbaseLeads,
      ...producthuntLeads,
      ...redditLeads,
      ...twitterLeads
    );
    
    // Sprint 4: Lookalike Seeding (if we have good leads and still need more)
    if (allCandidates.length < remainingNeeded) {
      console.log(`🔍 Generating lookalike leads from high-scoring existing leads...`);
      const lookalikeLeads = await generateLookalikeLeads(70, remainingNeeded - allCandidates.length);
      const lookalikeCandidates: LeadCandidate[] = lookalikeLeads.map(lead => ({
        email: lead.email,
        companyName: lead.companyName,
        jobTitle: lead.jobTitle,
        dataSource: lead.dataSource,
      }));
      allCandidates.push(...lookalikeCandidates);
      console.log(`✅ Generated ${lookalikeCandidates.length} lookalike leads`);
    }
    
    console.log(`📊 Round ${round}: Found ${allCandidates.length} total candidates`);
    
    // Qualify leads
    const qualified = allCandidates.filter(qualifyLead);
    console.log(`✅ Round ${round}: ${qualified.length} candidates qualified (CTO/VP Engineering)`);
    
    // Process candidates
    for (const candidate of qualified) {
      if (created >= DYNAMIC_TARGET) {
        break; // Target met, stop processing
      }

      // CRITICAL: Reject placeholder emails - they should never be inserted
      // (This shouldn't happen now since GitHub scraper resolves emails, but safety check)
      if (isPlaceholderEmail(candidate.email)) {
        rejected++;
        continue;
      }
      
      // Email should already be resolved and validated by GitHub scraper
      // But validate again as safety check
      const validation = await validateEmail(candidate.email);
      if (!validation.isValid) {
        rejected++;
        continue;
      }
      
      if (await leadExists(candidate.email, candidate.companyName)) {
        skipped++;
        continue;
      }
      
      try {
        await db.insert(leads).values({
          email: candidate.email,
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
        console.log(`✅ Created lead: ${candidate.email} at ${candidate.companyName} (${created}/${DYNAMIC_TARGET})`);
      } catch (error: any) {
        console.error(`❌ Failed to create lead ${candidate.email}:`, error.message);
        rejected++;
      }
    }

    // If we didn't get enough, try another round with expanded search
    if (created < DYNAMIC_TARGET && round < MAX_ROUNDS) {
      console.log(`⚠️  Round ${round}: Only ${created}/${DYNAMIC_TARGET} leads created. Continuing to next round...`);
    }
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Final Summary:`);
  console.log(`   Created: ${created} new leads`);
  console.log(`   Skipped: ${skipped} duplicates`);
  console.log(`   Rejected: ${rejected} invalid emails`);
  console.log(`   Target: ${DYNAMIC_TARGET} leads/day (Revenue-driven)`);
  console.log(`   Progress: ${created}/${DYNAMIC_TARGET} (${Math.round((created / DYNAMIC_TARGET) * 100)}%)`);
  console.log('');
  
  if (rejected > 0) {
    console.log(`⚠️  Note: ${rejected} leads rejected due to invalid emails`);
  }
  
  if (created >= DYNAMIC_TARGET) {
    console.log('✅ Target met!');
  } else if (created > 0) {
    console.log(`⚠️  Partial success: ${created}/${DYNAMIC_TARGET} leads created`);
    console.log('   System will retry in next scheduled run');
  } else {
    console.log(`❌ No leads created. Check sourcing channels and GitHub token.`);
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

