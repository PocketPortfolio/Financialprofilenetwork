import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { classifyDealTier } from '@/lib/sales/revenueCalculator';
import { detectCultureAndLanguage } from '@/lib/sales/cultural-intelligence';
import { resolveLocationToTimezone } from '@/lib/sales/timezone-utils';

export interface LeadResearchData {
  companyName: string;
  techStack: string[];
  recentHires?: Array<{ title: string; date: string }>;
  fundingStage?: string;
  employeeCount?: number;
  summary: string;
  dealTier?: 'corporateSponsor' | 'foundersClub' | 'featureVoter' | 'codeSupporter';
  newsSignals?: Array<{
    type: 'funding' | 'hiring' | 'cto_announcement' | 'product_launch';
    date: string;
    description: string;
    source: string;
    relevance: number; // 0-100
  }>;
  location?: string;
  timezone?: string;
  detectedLanguage?: string;
  detectedRegion?: string;
}

/**
 * Enrich a lead with research data
 * This would integrate with Apollo, Proxycurl, or similar
 */
export async function enrichLead(leadId: string): Promise<LeadResearchData> {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  // TODO: Integrate with Apollo API or Proxycurl
  // For now, extract from existing research data or use defaults
  const existingResearch = (lead.researchData as any) || {};
  
  // NEW: Detect news signals
  const newsSignals = await detectNewsSignals(lead.companyName);
  
  // NEW: Detect culture and language
  const culturalContext = await detectCultureAndLanguage(
    lead.firstName || undefined,
    lead.lastName || undefined,
    lead.companyName,
    existingResearch.location || lead.location || undefined
  );
  
  // NEW: Resolve timezone from location
  const location = existingResearch.location || lead.location;
  const timezone = location ? await resolveLocationToTimezone(location) : null;
  
  const researchData: LeadResearchData = {
    companyName: lead.companyName,
    techStack: lead.techStackTags || [],
    summary: lead.researchSummary || 'Research pending',
    // Extract from existing research data if available
    employeeCount: existingResearch.employeeCount,
    recentHires: existingResearch.recentHires,
    fundingStage: existingResearch.fundingStage,
    newsSignals, // NEW
    location, // NEW
    timezone: timezone || undefined, // NEW
    detectedLanguage: culturalContext.detectedLanguage, // NEW
    detectedRegion: culturalContext.detectedRegion, // NEW
  };

  // Classify deal tier based on company size
  if (researchData.employeeCount) {
    researchData.dealTier = classifyDealTier(researchData.employeeCount);
  }

  // Calculate confidence score
  const calculatedScore = scoreLead(researchData);

  // Update lead with research, score, and cultural intelligence
  await db.update(leads)
    .set({
      researchData: researchData as any,
      researchSummary: researchData.summary,
      techStackTags: researchData.techStack,
      status: 'RESEARCHING',
      score: calculatedScore,
      // NEW: Save cultural intelligence and timezone
      location: researchData.location,
      timezone: researchData.timezone,
      detectedLanguage: researchData.detectedLanguage,
      detectedRegion: researchData.detectedRegion,
      newsSignals: researchData.newsSignals,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  return researchData;
}

/**
 * Score a lead (0-100) based on fit
 */
export function scoreLead(research: LeadResearchData): number {
  let score = 0;

  // Tech stack match (40 points)
  const targetTech = ['React', 'Next.js', 'TypeScript', 'Node.js'];
  const matches = research.techStack.filter(tech => 
    targetTech.some(target => tech.toLowerCase().includes(target.toLowerCase()))
  );
  score += (matches.length / targetTech.length) * 40;

  // Company size (20 points) - prefer 10-500 employees
  if (research.employeeCount) {
    if (research.employeeCount >= 10 && research.employeeCount <= 500) {
      score += 20;
    } else if (research.employeeCount < 10 || research.employeeCount > 500) {
      score += 10;
    }
  }

  // Recent engineering hires (20 points)
  if (research.recentHires && research.recentHires.length > 0) {
    score += Math.min(20, research.recentHires.length * 5);
  }

  // Funding stage (20 points) - prefer Series A-C
  if (research.fundingStage) {
    const fundingScores: Record<string, number> = {
      'Series A': 20,
      'Series B': 18,
      'Series C': 15,
      'Seed': 10,
    };
    score += fundingScores[research.fundingStage] || 5;
  }

  return Math.round(Math.min(100, score));
}

/**
 * Recalculate and update score for an existing lead
 * Useful for leads that were enriched before score calculation was implemented
 */
export async function recalculateLeadScore(leadId: string): Promise<number> {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }

  const existingResearch = (lead.researchData as any) || {};
  const researchData: LeadResearchData = {
    companyName: lead.companyName,
    techStack: lead.techStackTags || [],
    summary: lead.researchSummary || 'Research pending',
    employeeCount: existingResearch.employeeCount,
    recentHires: existingResearch.recentHires,
    fundingStage: existingResearch.fundingStage,
  };

  const calculatedScore = scoreLead(researchData);

  await db.update(leads)
    .set({
      score: calculatedScore,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  return calculatedScore;
}

/**
 * Detect news signals for a company
 * Sprint 4: Event-Based Triggers
 * In production, would use:
 * - Google News API
 * - Crunchbase API
 * - Twitter/X API for announcements
 * - LinkedIn API for hiring posts
 */
async function detectNewsSignals(companyName: string): Promise<LeadResearchData['newsSignals']> {
  // TODO: Implement actual news signal detection
  // For now, return empty array - this would be implemented with:
  // 1. Google News API search for company name
  // 2. Crunchbase API for funding rounds
  // 3. LinkedIn API for hiring announcements
  // 4. Twitter/X API for product launches
  
  // Placeholder: Would return structured news signals
  // Example structure:
  /*
  return [
    {
      type: 'funding' as const,
      date: new Date().toISOString(),
      description: `${companyName} announced Series B funding of $10M last week`,
      source: 'Crunchbase',
      relevance: 95,
    },
  ];
  */
  
  return []; // Return empty for now - to be implemented with actual APIs
}


