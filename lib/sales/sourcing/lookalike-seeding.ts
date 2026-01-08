/**
 * Lookalike Seeding: Use existing good leads to find similar profiles
 * Sprint 4: Hybrid Sourcing Module
 */

import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq, and, gte, or } from 'drizzle-orm';

interface LookalikeLead {
  email: string;
  companyName: string;
  jobTitle: string;
  dataSource: 'lookalike';
  seedLeadId: string; // Reference to the "good" lead we're matching
  similarityScore: number; // 0-100
}

/**
 * Generate lookalike leads based on high-scoring existing leads
 * Uses Google Search queries to find similar companies/profiles
 */
export async function generateLookalikeLeads(
  minScore: number = 70,
  maxLeads: number = 10
): Promise<LookalikeLead[]> {
  // Find high-scoring leads (good examples)
  const goodLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        gte(leads.score, minScore),
        or(
          eq(leads.status, 'CONVERTED'),
          eq(leads.status, 'INTERESTED')
        )
      )
    )
    .limit(5);

  if (goodLeads.length === 0) {
    console.log('⚠️  No high-scoring leads found for lookalike seeding');
    return [];
  }

  const lookalikes: LookalikeLead[] = [];

  for (const seedLead of goodLeads) {
    const researchData = seedLead.researchData as any;
    
    // Generate Google Search queries based on seed lead
    const queries = [
      `"Competitor to ${seedLead.companyName}" CTO`,
      `"Similar to ${seedLead.companyName}" VP Engineering`,
      `${researchData?.techStack?.[0] || 'React'} companies hiring CTO`,
      `${seedLead.companyName} alternative fintech CTO`,
    ];

    // In production, would use Google Custom Search API or similar
    // For now, create structured lookalike leads based on seed data
    for (const query of queries.slice(0, 2)) { // Limit to 2 queries per seed
      // Simulate finding similar companies
      // In production, this would:
      // 1. Execute Google Search query
      // 2. Parse results for company names
      // 3. Find CTO/VP Engineering contacts at those companies
      // 4. Score similarity based on tech stack, industry, size
      
      lookalikes.push({
        email: `lookalike-${seedLead.id.substring(0, 8)}@similar.placeholder`,
        companyName: `Similar to ${seedLead.companyName}`,
        jobTitle: 'CTO',
        dataSource: 'lookalike',
        seedLeadId: seedLead.id,
        similarityScore: 75, // Would calculate based on actual matching
      });
    }
  }

  // Deduplicate and limit
  const uniqueLookalikes = lookalikes
    .filter((lead, index, self) => 
      index === self.findIndex(l => l.companyName === lead.companyName)
    )
    .slice(0, maxLeads);

  console.log(`✅ Lookalike seeding: Generated ${uniqueLookalikes.length} lookalike leads from ${goodLeads.length} seed leads`);

  return uniqueLookalikes;
}

/**
 * Calculate similarity score between two leads
 * Based on tech stack, company size, industry, etc.
 */
export function calculateSimilarityScore(
  seedLead: { researchData?: any; techStackTags?: string[] },
  candidateLead: { researchData?: any; techStackTags?: string[] }
): number {
  let score = 0;
  let factors = 0;

  // Tech stack similarity (40 points)
  const seedTech = seedLead.techStackTags || [];
  const candidateTech = candidateLead.techStackTags || [];
  const commonTech = seedTech.filter(tech => candidateTech.includes(tech));
  if (seedTech.length > 0) {
    score += (commonTech.length / seedTech.length) * 40;
    factors++;
  }

  // Company size similarity (30 points)
  const seedSize = (seedLead.researchData as any)?.employeeCount;
  const candidateSize = (candidateLead.researchData as any)?.employeeCount;
  if (seedSize && candidateSize) {
    const sizeDiff = Math.abs(seedSize - candidateSize) / Math.max(seedSize, candidateSize);
    score += (1 - Math.min(sizeDiff, 1)) * 30;
    factors++;
  }

  // Industry similarity (30 points)
  // Would need industry classification in researchData
  // For now, assume similar if tech stack matches

  return factors > 0 ? Math.round(score / factors) : 50; // Default to 50 if no factors
}

