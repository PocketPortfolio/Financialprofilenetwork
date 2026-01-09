/**
 * Revenue Calculator for Sales Sidecar
 * Calculates projected revenue based on lead status and REAL product catalog
 */

import { getBestProductForLead, getMonthlyRevenueValue, type Product } from '@/lib/stripe/product-catalog';

export interface Lead {
  id: string;
  status: string;
  score: number;
  dealTier?: 'corporateSponsor' | 'foundersClub' | 'featureVoter' | 'codeSupporter' | null;
  researchData?: {
    employeeCount?: number;
    companyType?: string;
  };
}

export interface RevenueMetrics {
  currentRevenue: number;
  projectedRevenue: number;
  pipelineValue: number;
  targetRevenue: number;
  progressPercentage: number;
}

const STAGE_PROBABILITIES = {
  'NEW': 0.05,
  'RESEARCHING': 0.10,
  'CONTACTED': 0.15,
  'REPLIED': 0.25,
  'INTERESTED': 0.40,
  'NEGOTIATING': 0.60,
  'CONVERTED': 1.0,
  'NOT_INTERESTED': 0,
  'DO_NOT_CONTACT': 0,
} as const;

const TARGET_REVENUE = 8333; // £8,333/month (£100k/year) - v2.1

/**
 * Classify deal tier based on company size (returns product catalog ID)
 */
export function classifyDealTier(employeeCount?: number, companyType?: string): 'corporateSponsor' | 'foundersClub' | 'featureVoter' | 'codeSupporter' {
  if (employeeCount && employeeCount >= 10) {
    return 'corporateSponsor'; // Highest value - prioritize for revenue target
  } else if (employeeCount && employeeCount >= 5) {
    return 'featureVoter';
  } else {
    return 'foundersClub'; // Default for individuals/small teams
  }
}

/**
 * Get deal size for a lead based on REAL products
 */
export function getDealSize(lead: Lead): number {
  // Use explicit dealTier if set (must match product catalog IDs)
  if (lead.dealTier) {
    const product = getBestProductForLead({
      employeeCount: lead.researchData?.employeeCount,
      companyType: lead.researchData?.companyType,
    });
    return getMonthlyRevenueValue(product);
  }
  
  // Infer from research data
  const product = getBestProductForLead({
    employeeCount: lead.researchData?.employeeCount,
    companyType: lead.researchData?.companyType,
    isIndividual: !lead.researchData?.employeeCount || (lead.researchData.employeeCount ? lead.researchData.employeeCount < 10 : true),
  });
  
  return getMonthlyRevenueValue(product);
}

/**
 * Calculate projected revenue from leads
 */
export function calculateProjectedRevenue(leads: Lead[]): number {
  return leads
    .filter(lead => lead.status !== 'UNQUALIFIED') // v2.1: Exclude invalid emails
    .reduce((total, lead) => {
      const dealSize = getDealSize(lead);
      const probability = STAGE_PROBABILITIES[lead.status as keyof typeof STAGE_PROBABILITIES] || 0;
      return total + (dealSize * probability);
    }, 0);
}

/**
 * Calculate current revenue (only from converted leads)
 */
export function calculateCurrentRevenue(leads: Lead[]): number {
  return leads
    .filter(lead => lead.status === 'CONVERTED')
    .reduce((total, lead) => {
      const dealSize = getDealSize(lead);
      return total + dealSize;
    }, 0);
}

/**
 * Calculate pipeline value (sum of all potential deals)
 */
export function calculatePipelineValue(leads: Lead[]): number {
  return leads
    .filter(lead => 
      lead.status !== 'NOT_INTERESTED' && 
      lead.status !== 'DO_NOT_CONTACT' &&
      lead.status !== 'CONVERTED' &&
      lead.status !== 'UNQUALIFIED' // v2.1: Exclude invalid emails from pipeline
    )
    .reduce((total, lead) => {
      const dealSize = getDealSize(lead);
      return total + dealSize;
    }, 0);
}

/**
 * Get comprehensive revenue metrics
 */
export function getRevenueMetrics(leads: Lead[]): RevenueMetrics {
  const currentRevenue = calculateCurrentRevenue(leads);
  const projectedRevenue = calculateProjectedRevenue(leads);
  const pipelineValue = calculatePipelineValue(leads);
  const progressPercentage = Math.min(100, (currentRevenue / TARGET_REVENUE) * 100);

  return {
    currentRevenue,
    projectedRevenue,
    pipelineValue,
    targetRevenue: TARGET_REVENUE,
    progressPercentage,
  };
}




