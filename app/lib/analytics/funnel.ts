/**
 * MODE 3: Funnel Analytics & Visualization
 * Funnel drop-off analysis and optimization insights
 */

import { FunnelStage, ConversionFunnel } from './conversion';

// Funnel Metrics
export interface FunnelMetrics {
  funnelName: string;
  totalEntries: number;
  stageMetrics: StageMetrics[];
  overallConversionRate: number;
  dropOffRate: number;
  averageTimeToComplete: number; // seconds
  averageTimePerStage: Record<FunnelStage, number>;
}

// Stage Metrics
export interface StageMetrics {
  stage: FunnelStage;
  entries: number;
  completions: number;
  dropOffs: number;
  conversionRate: number; // % who proceed to next stage
  dropOffRate: number; // % who drop off at this stage
  averageTime: number; // seconds
}

// Funnel Drop-off Analysis
export interface DropOffAnalysis {
  stage: FunnelStage;
  dropOffCount: number;
  dropOffRate: number;
  commonReasons: DropOffReason[];
  recommendations: string[];
}

// Drop-off Reason
export interface DropOffReason {
  reason: string;
  count: number;
  percentage: number;
}

/**
 * Calculate funnel metrics from GA4 data
 * (This would typically be called server-side or via GA4 API)
 */
export function calculateFunnelMetrics(
  funnelData: ConversionFunnel[]
): FunnelMetrics {
  const totalEntries = funnelData.length;
  const completed = funnelData.filter(f => f.completedAt).length;
  const dropOffs = funnelData.filter(f => f.dropOffStage).length;

  const stageMetrics = calculateStageMetrics(funnelData);
  const overallConversionRate = totalEntries > 0 
    ? (completed / totalEntries) * 100 
    : 0;
  const dropOffRate = totalEntries > 0 
    ? (dropOffs / totalEntries) * 100 
    : 0;

  const completedFunnels = funnelData.filter(f => f.completedAt);
  const averageTimeToComplete = completedFunnels.length > 0
    ? completedFunnels.reduce((sum, f) => {
        const time = f.completedAt!.getTime() - f.enteredAt.getTime();
        return sum + time;
      }, 0) / completedFunnels.length / 1000 // Convert to seconds
    : 0;

  const averageTimePerStage = calculateAverageTimePerStage(funnelData);

  return {
    funnelName: funnelData[0]?.funnelName || 'unknown',
    totalEntries,
    stageMetrics,
    overallConversionRate,
    dropOffRate,
    averageTimeToComplete,
    averageTimePerStage
  };
}

/**
 * Analyze drop-offs for optimization recommendations
 */
export function analyzeDropOffs(
  funnelData: ConversionFunnel[]
): DropOffAnalysis[] {
  const dropOffs = funnelData.filter(f => f.dropOffStage);
  const stageGroups = groupBy(dropOffs, f => f.dropOffStage!);

  return Object.entries(stageGroups).map(([stage, funnels]) => {
    const stageStr = stage as FunnelStage;
    const totalAtStage = funnelData.filter(f => 
      getStageOrder(f.currentStage) >= getStageOrder(stageStr)
    ).length;
    
    const dropOffCount = funnels.length;
    const dropOffRate = totalAtStage > 0 
      ? (dropOffCount / totalAtStage) * 100 
      : 0;

    const reasons = extractDropOffReasons(funnels);
    const recommendations = generateRecommendations(stageStr, reasons);

    return {
      stage: stageStr,
      dropOffCount,
      dropOffRate,
      commonReasons: reasons,
      recommendations
    };
  });
}

// Helper Functions

function calculateStageMetrics(
  funnelData: ConversionFunnel[]
): StageMetrics[] {
  const stages: FunnelStage[] = [
    'landing',
    'signup_start',
    'signup_complete',
    'onboarding_start',
    'onboarding_complete',
    'first_import_start',
    'first_import_complete',
    'first_portfolio_view',
    'first_trade_added',
    'first_analysis_view',
    'activated'
  ];

  return stages.map((stage, index) => {
    const entries = funnelData.filter(f => 
      getStageOrder(f.currentStage) >= getStageOrder(stage)
    ).length;

    const nextStage = stages[index + 1];
    const completions = nextStage
      ? funnelData.filter(f => 
          getStageOrder(f.currentStage) >= getStageOrder(nextStage)
        ).length
      : funnelData.filter(f => f.completedAt).length;

    const dropOffs = funnelData.filter(f => 
      f.dropOffStage === stage
    ).length;

    const conversionRate = entries > 0 
      ? (completions / entries) * 100 
      : 0;
    
    const dropOffRate = entries > 0 
      ? (dropOffs / entries) * 100 
      : 0;

    const timeAtStage = funnelData
      .filter(f => getStageOrder(f.currentStage) === getStageOrder(stage))
      .map(f => {
        // Calculate time spent at this stage (simplified)
        return 0; // Would need actual timing data
      });

    const averageTime = timeAtStage.length > 0
      ? timeAtStage.reduce((a, b) => a + b, 0) / timeAtStage.length
      : 0;

    return {
      stage,
      entries,
      completions,
      dropOffs,
      conversionRate,
      dropOffRate,
      averageTime
    };
  });
}

function calculateAverageTimePerStage(
  funnelData: ConversionFunnel[]
): Record<FunnelStage, number> {
  // This would require detailed timing data per stage
  // For now, return placeholder
  const stages: FunnelStage[] = [
    'landing',
    'signup_start',
    'signup_complete',
    'onboarding_start',
    'onboarding_complete',
    'first_import_start',
    'first_import_complete',
    'first_portfolio_view',
    'first_trade_added',
    'first_analysis_view',
    'activated'
  ];

  const result: Record<string, number> = {};
  stages.forEach(stage => {
    result[stage] = 0; // Would calculate from actual data
  });

  return result as Record<FunnelStage, number>;
}

function extractDropOffReasons(
  funnels: ConversionFunnel[]
): DropOffReason[] {
  const reasonCounts: Record<string, number> = {};

  funnels.forEach(funnel => {
    const reason = funnel.metadata?.dropOffReason || 'unknown';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });

  const total = funnels.length;
  return Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

function generateRecommendations(
  stage: FunnelStage,
  reasons: DropOffReason[]
): string[] {
  const recommendations: string[] = [];

  // Stage-specific recommendations
  switch (stage) {
    case 'signup_start':
      recommendations.push('Simplify signup form');
      recommendations.push('Add social proof');
      recommendations.push('Reduce required fields');
      break;
    case 'signup_complete':
      recommendations.push('Improve email verification flow');
      recommendations.push('Add welcome message');
      break;
    case 'onboarding_start':
      recommendations.push('Make onboarding optional');
      recommendations.push('Reduce onboarding steps');
      break;
    case 'first_import_start':
      recommendations.push('Add sample CSV file');
      recommendations.push('Improve import instructions');
      recommendations.push('Add video tutorial');
      break;
    case 'first_import_complete':
      recommendations.push('Improve error handling');
      recommendations.push('Add better validation messages');
      break;
    default:
      recommendations.push('Review user feedback');
      recommendations.push('A/B test alternative flows');
  }

  // Reason-based recommendations
  if (reasons.some(r => r.reason.includes('error'))) {
    recommendations.push('Fix technical errors');
    recommendations.push('Improve error messaging');
  }

  if (reasons.some(r => r.reason.includes('timeout'))) {
    recommendations.push('Optimize page load times');
    recommendations.push('Add loading indicators');
  }

  return recommendations;
}

function getStageOrder(stage: FunnelStage): number {
  const order: Record<FunnelStage, number> = {
    landing: 1,
    signup_start: 2,
    signup_complete: 3,
    onboarding_start: 4,
    onboarding_complete: 5,
    first_import_start: 6,
    first_import_complete: 7,
    first_portfolio_view: 8,
    first_trade_added: 9,
    first_analysis_view: 10,
    activated: 11
  };
  return order[stage] || 0;
}

function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}


















