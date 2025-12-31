/**
 * MODE 3: A/B Testing Framework
 * Infrastructure for running conversion optimization experiments
 */

import { ABTestVariant, trackABTestExposure, trackABTestConversion } from './conversion';

// A/B Test Configuration
export interface ABTestConfig {
  testId: string;
  testName: string;
  description: string;
  variants: VariantConfig[];
  trafficSplit: number; // 0-100, percentage of traffic to include
  startDate: Date;
  endDate?: Date;
  conversionEvents: string[];
  isActive: boolean;
}

// Variant Configuration
export interface VariantConfig {
  variantId: string;
  variantName: string;
  isControl: boolean;
  weight: number; // Relative weight for traffic distribution
  config: Record<string, any>; // Variant-specific configuration
}

// A/B Test Result
export interface ABTestResult {
  testId: string;
  variantResults: VariantResult[];
  statisticalSignificance: number; // 0-1
  winner?: string;
  confidence: 'low' | 'medium' | 'high';
  recommendation: string;
}

// Variant Result
export interface VariantResult {
  variantId: string;
  variantName: string;
  isControl: boolean;
  exposures: number;
  conversions: number;
  conversionRate: number;
  averageValue?: number;
  lift?: number; // % lift vs control
}

/**
 * Initialize A/B test
 */
export function initializeABTest(config: ABTestConfig): ABTestVariant | null {
  if (typeof window === 'undefined') return null;

  // Check if test is active
  if (!config.isActive) return null;

  // Check date range
  const now = new Date();
  if (now < config.startDate || (config.endDate && now > config.endDate)) {
    return null;
  }

  // Check if user is already assigned
  const existing = getABTestVariant(config.testId);
  if (existing) {
    return existing;
  }

  // Check traffic split
  const userHash = hashUserId();
  const trafficPercent = userHash % 100;
  if (trafficPercent >= config.trafficSplit) {
    return null; // User not in test
  }

  // Assign variant based on weights
  const variant = assignVariant(config.variants);
  
  if (variant) {
    const abVariant: ABTestVariant = {
      testId: config.testId,
      variantId: variant.variantId,
      variantName: variant.variantName,
      isControl: variant.isControl
    };

    trackABTestExposure(abVariant);
    return abVariant;
  }

  return null;
}

/**
 * Get current A/B test variant for a test
 */
export function getABTestVariant(testId: string): ABTestVariant | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('ab_test_variants');
    if (!stored) return null;
    
    const variants: Record<string, ABTestVariant> = JSON.parse(stored);
    return variants[testId] || null;
  } catch {
    return null;
  }
}

/**
 * Track conversion for A/B test
 */
export function trackABConversion(
  testId: string,
  conversionType: string,
  value?: number
): void {
  trackABTestConversion(testId, conversionType, value);
}

/**
 * Calculate A/B test results
 * (Typically done server-side with GA4 data)
 */
export function calculateABTestResults(
  testId: string,
  variantData: VariantResult[]
): ABTestResult {
  const control = variantData.find(v => v.isControl);
  const variants = variantData.filter(v => !v.isControl);

  if (!control) {
    return {
      testId,
      variantResults: variantData,
      statisticalSignificance: 0,
      confidence: 'low',
      recommendation: 'No control variant found'
    };
  }

  // Calculate lift for each variant
  const results = variants.map(variant => {
    const lift = control.conversionRate > 0
      ? ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100
      : 0;

    return {
      ...variant,
      lift
    };
  });

  // Find winner (highest conversion rate with sufficient sample size)
  const winner = results
    .filter(v => v.exposures >= 100) // Minimum sample size
    .sort((a, b) => b.conversionRate - a.conversionRate)[0];

  // Calculate statistical significance (simplified)
  const significance = calculateSignificance(control, winner || control);

  // Determine confidence
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (significance >= 0.95 && winner && winner.exposures >= 1000) {
    confidence = 'high';
  } else if (significance >= 0.90 && winner && winner.exposures >= 500) {
    confidence = 'medium';
  }

  // Generate recommendation
  let recommendation = '';
  if (winner && winner.lift && winner.lift > 0) {
    recommendation = `Variant "${winner.variantName}" shows ${winner.lift.toFixed(1)}% lift. Consider implementing.`;
  } else if (winner && winner.lift && winner.lift < 0) {
    recommendation = `Control performs better. Keep current implementation.`;
  } else {
    recommendation = `No significant difference. Continue testing or refine variants.`;
  }

  return {
    testId,
    variantResults: [control, ...results],
    statisticalSignificance: significance,
    winner: winner?.variantId,
    confidence,
    recommendation
  };
}

// Helper Functions

function assignVariant(variants: VariantConfig[]): VariantConfig | null {
  if (variants.length === 0) return null;

  // Calculate total weight
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  
  // Generate random number based on user ID hash for consistency
  const hash = hashUserId();
  const random = hash % totalWeight;

  // Assign based on weighted distribution
  let currentWeight = 0;
  for (const variant of variants) {
    currentWeight += variant.weight;
    if (random < currentWeight) {
      return variant;
    }
  }

  // Fallback to first variant
  return variants[0];
}

function hashUserId(): number {
  if (typeof window === 'undefined') return Math.random() * 100;
  
  // Use user ID if available, otherwise use session ID
  const userId = localStorage.getItem('user_id') || 
    sessionStorage.getItem('ga_session_id') || 
    'anonymous';
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

function calculateSignificance(
  control: VariantResult,
  variant: VariantResult
): number {
  // Simplified statistical significance calculation
  // In production, use proper statistical tests (chi-square, z-test, etc.)
  
  if (control.exposures === 0 || variant.exposures === 0) return 0;

  const controlRate = control.conversionRate / 100;
  const variantRate = variant.conversionRate / 100;

  // Z-test approximation
  const pooledRate = (control.conversions + variant.conversions) / 
    (control.exposures + variant.exposures);
  
  const se = Math.sqrt(
    pooledRate * (1 - pooledRate) * 
    (1 / control.exposures + 1 / variant.exposures)
  );

  if (se === 0) return 0;

  const z = (variantRate - controlRate) / se;
  
  // Convert z-score to p-value (simplified)
  const pValue = 1 - Math.abs(z) / 3; // Rough approximation
  
  return Math.max(0, Math.min(1, pValue));
}

/**
 * Predefined A/B Test Configurations
 */

// Example: Signup Button Color Test
export const SIGNUP_BUTTON_COLOR_TEST: ABTestConfig = {
  testId: 'signup_button_color',
  testName: 'Signup Button Color Optimization',
  description: 'Test different button colors to improve signup conversion',
  trafficSplit: 50, // 50% of traffic
  startDate: new Date(),
  isActive: false, // Set to true to activate
  conversionEvents: ['signup_complete'],
  variants: [
    {
      variantId: 'control',
      variantName: 'Current (Blue)',
      isControl: true,
      weight: 50,
      config: { color: 'blue' }
    },
    {
      variantId: 'variant_a',
      variantName: 'Green',
      isControl: false,
      weight: 50,
      config: { color: 'green' }
    }
  ]
};

// Example: Landing Page Headline Test
export const LANDING_HEADLINE_TEST: ABTestConfig = {
  testId: 'landing_headline',
  testName: 'Landing Page Headline Optimization',
  description: 'Test different headlines to improve engagement',
  trafficSplit: 50,
  startDate: new Date(),
  isActive: false,
  conversionEvents: ['signup_start', 'signup_complete'],
  variants: [
    {
      variantId: 'control',
      variantName: 'Current Headline',
      isControl: true,
      weight: 50,
      config: { headline: 'Track Your Portfolio Like a Pro' }
    },
    {
      variantId: 'variant_a',
      variantName: 'Benefit-Focused',
      isControl: false,
      weight: 50,
      config: { headline: 'Free Portfolio Tracker for Smart Investors' }
    }
  ]
};


















