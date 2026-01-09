/**
 * Revenue-Driven Volume Adjustment
 * 
 * Automatically adjusts prospecting volume based on revenue gap
 * UPDATED: Uses REAL products, prioritizes Corporate Sponsors
 */

import { getRevenueMetrics } from './revenueCalculator';
import type { Lead } from './revenueCalculator';
import { getBestProductForLead, getMonthlyRevenueValue } from '@/lib/stripe/product-catalog';

const TARGET_REVENUE = 8333; // £8,333/month (£100k/year) - v2.1
const BASE_LEADS_PER_DAY = 50;
const MAX_LEADS_PER_DAY = 200; // Safety limit
const MIN_LEADS_PER_DAY = 20; // Minimum to maintain pipeline

/**
 * Calculate required lead volume based on revenue gap
 * UPDATED: Uses REAL products, prioritizes Corporate Sponsors
 */
export function calculateRequiredLeadVolume(
  currentRevenue: number,
  projectedRevenue: number,
  daysRemainingInMonth: number
): number {
  const revenueGap = TARGET_REVENUE - currentRevenue;
  const projectedGap = TARGET_REVENUE - projectedRevenue;
  
  // If we're ahead of target, maintain base volume
  if (projectedRevenue >= TARGET_REVENUE) {
    return BASE_LEADS_PER_DAY;
  }
  
  const revenueNeededPerDay = projectedGap / daysRemainingInMonth;
  
  // REAL PRODUCT MATH:
  // Corporate Sponsor: $1,000/year = $83.33/month (highest value)
  // Founders Club: £100 lifetime = £8.33/month (annualized)
  // To hit £5k/month, we need ~60 Corporate Sponsors OR ~600 Founders Club
  
  // Prioritize Corporate Sponsors (highest value)
  const corporateSponsor = getBestProductForLead({ employeeCount: 50 });
  const corporateMonthlyValue = getMonthlyRevenueValue(corporateSponsor);
  
  // Conservative conversion rate: 2% of leads convert
  const estimatedConversionRate = 0.02;
  const revenuePerLead = corporateMonthlyValue * estimatedConversionRate;
  
  // Calculate leads needed (prioritizing corporate sponsors)
  const leadsNeededPerDay = Math.ceil(revenueNeededPerDay / revenuePerLead);
  
  // Clamp to safety limits
  const adjustedVolume = Math.max(
    MIN_LEADS_PER_DAY,
    Math.min(MAX_LEADS_PER_DAY, leadsNeededPerDay)
  );
  
  return adjustedVolume;
}

/**
 * Get revenue-driven decisions
 */
export function getRevenueDrivenDecisions(leads: Lead[]): {
  currentRevenue: number;
  projectedRevenue: number;
  targetRevenue: number;
  revenueGap: number;
  requiredLeadVolume: number;
  currentLeadVolume: number;
  adjustment: {
    action: 'increase' | 'decrease' | 'maintain';
    reason: string;
    newVolume: number;
  };
} {
  const metrics = getRevenueMetrics(leads);
  const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  
  const requiredVolume = calculateRequiredLeadVolume(
    metrics.currentRevenue,
    metrics.projectedRevenue,
    daysRemaining
  );
  
  const currentVolume = BASE_LEADS_PER_DAY; // This would come from actual sourcing stats
  
  let action: 'increase' | 'decrease' | 'maintain';
  let reason: string;
  
  if (requiredVolume > currentVolume) {
    action = 'increase';
    reason = `Revenue at £${metrics.currentRevenue.toLocaleString()}, projected £${metrics.projectedRevenue.toLocaleString()}. Need ${requiredVolume} leads/day to hit £${TARGET_REVENUE.toLocaleString()} target.`;
  } else if (requiredVolume < currentVolume) {
    action = 'decrease';
    reason = `Revenue ahead of pace. Can reduce to ${requiredVolume} leads/day while maintaining target.`;
  } else {
    action = 'maintain';
    reason = `Revenue on track. Maintaining ${currentVolume} leads/day.`;
  }
  
  return {
    currentRevenue: metrics.currentRevenue,
    projectedRevenue: metrics.projectedRevenue,
    targetRevenue: TARGET_REVENUE,
    revenueGap: TARGET_REVENUE - metrics.projectedRevenue,
    requiredLeadVolume: requiredVolume,
    currentLeadVolume: currentVolume,
    adjustment: {
      action,
      reason,
      newVolume: requiredVolume,
    },
  };
}

/**
 * Generate AI decision log message
 */
export function generateDecisionLog(decisions: ReturnType<typeof getRevenueDrivenDecisions>): string {
  const { adjustment, currentRevenue, projectedRevenue, revenueGap } = decisions;
  
  return `Revenue at £${currentRevenue.toLocaleString()}, projected £${projectedRevenue.toLocaleString()}. ${adjustment.reason} Adjusting prospecting volume to ${adjustment.newVolume} leads/day.`;
}

