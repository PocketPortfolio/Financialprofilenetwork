/**
 * MODE 3: [CONVERSION_TELEMETRY] - The Funnel Optimization
 * Comprehensive conversion tracking and funnel analytics
 */

// gtag type is declared in app/lib/analytics/events.ts
// All custom parameters are supported via the extended type definition

// Funnel Stages
export type FunnelStage = 
  | 'landing'
  | 'signup_start'
  | 'signup_complete'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'first_import_start'
  | 'first_import_complete'
  | 'first_portfolio_view'
  | 'first_trade_added'
  | 'first_analysis_view'
  | 'activated';

// Micro-conversion Events
export type MicroConversionEvent =
  | 'button_click'
  | 'form_start'
  | 'form_field_focus'
  | 'form_field_complete'
  | 'link_click'
  | 'scroll_depth'
  | 'time_on_page'
  | 'video_play'
  | 'download_start'
  | 'tooltip_view';

// Conversion Funnel Interface
export interface ConversionFunnel {
  userId?: string;
  sessionId: string;
  funnelName: string;
  currentStage: FunnelStage;
  enteredAt: Date;
  completedAt?: Date;
  dropOffStage?: FunnelStage;
  attribution: AttributionData;
  metadata: Record<string, any>;
}

// Attribution Data
export interface AttributionData {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landingPage: string;
  firstTouch: Date;
  lastTouch: Date;
  touchpoints: Touchpoint[];
}

// Touchpoint
export interface Touchpoint {
  timestamp: Date;
  source: string;
  medium: string;
  campaign?: string;
  interaction: string;
}

// A/B Test Variant
export interface ABTestVariant {
  testId: string;
  variantId: string;
  variantName: string;
  isControl: boolean;
}

/**
 * Track funnel stage progression
 */
export function trackFunnelStage(
  stage: FunnelStage,
  funnelName: string = 'user_onboarding',
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sessionId = getOrCreateSessionId();
  const userId = getUserId();

  window.gtag('event', 'funnel_stage', {
    event_category: 'Conversion Funnel',
    event_label: stage,
    custom_parameter_funnel_name: funnelName,
    custom_parameter_session_id: sessionId,
    custom_parameter_user_id: userId || 'anonymous',
    custom_parameter_stage_order: getStageOrder(stage),
    ...(metadata && { custom_parameter_metadata: JSON.stringify(metadata) })
  });

  // Store funnel state
  storeFunnelState({
    userId: userId || undefined, // Convert null to undefined
    sessionId,
    funnelName,
    currentStage: stage,
    enteredAt: new Date(),
    attribution: getAttributionData(),
    metadata: metadata || {}
  });
}

/**
 * Track micro-conversion event
 */
export function trackMicroConversion(
  event: MicroConversionEvent,
  context: {
    elementId?: string;
    elementType?: string;
    page?: string;
    value?: number;
    metadata?: Record<string, any>;
  }
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'micro_conversion', {
    event_category: 'Micro Conversion',
    event_label: event,
    custom_parameter_element_id: context.elementId,
    custom_parameter_element_type: context.elementType,
    custom_parameter_page: context.page || window.location.pathname,
    custom_parameter_value: context.value || 1,
    ...(context.metadata && { custom_parameter_metadata: JSON.stringify(context.metadata) })
  });
}

/**
 * Track conversion (macro conversion)
 */
export function trackConversion(
  conversionType: string,
  value?: number,
  currency: string = 'USD',
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sessionId = getOrCreateSessionId();
  const userId = getUserId();
  const attribution = getAttributionData();

  window.gtag('event', 'conversion', {
    event_category: 'Conversion',
    event_label: conversionType,
    value: value || 1,
    currency: currency,
    custom_parameter_conversion_type: conversionType,
    custom_parameter_session_id: sessionId,
    custom_parameter_user_id: userId || 'anonymous',
    custom_parameter_source: attribution.source,
    custom_parameter_medium: attribution.medium,
    custom_parameter_campaign: attribution.campaign,
    ...(metadata && { custom_parameter_metadata: JSON.stringify(metadata) })
  });

  // Mark funnel as completed if applicable
  markFunnelCompleted(conversionType);
}

/**
 * Track funnel drop-off
 */
export function trackFunnelDropOff(
  stage: FunnelStage,
  reason?: string,
  metadata?: Record<string, any>
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const sessionId = getOrCreateSessionId();
  const funnelState = getFunnelState();

  window.gtag('event', 'funnel_drop_off', {
    event_category: 'Conversion Funnel',
    event_label: stage,
    custom_parameter_funnel_name: funnelState?.funnelName || 'unknown',
    custom_parameter_session_id: sessionId,
    custom_parameter_drop_off_stage: stage,
    custom_parameter_drop_off_reason: reason || 'unknown',
    custom_parameter_time_in_funnel: funnelState 
      ? Math.round((Date.now() - funnelState.enteredAt.getTime()) / 1000)
      : 0,
    ...(metadata && { custom_parameter_metadata: JSON.stringify(metadata) })
  });

  // Update funnel state
  if (funnelState) {
    updateFunnelState({
      ...funnelState,
      dropOffStage: stage
    });
  }
}

/**
 * Track A/B test exposure
 */
export function trackABTestExposure(variant: ABTestVariant): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'ab_test_exposure', {
    event_category: 'A/B Testing',
    event_label: variant.testId,
    custom_parameter_test_id: variant.testId,
    custom_parameter_variant_id: variant.variantId,
    custom_parameter_variant_name: variant.variantName,
    custom_parameter_is_control: variant.isControl ? 'true' : 'false'
  });

  // Store variant assignment
  storeABTestVariant(variant);
}

/**
 * Track A/B test conversion
 */
export function trackABTestConversion(
  testId: string,
  conversionType: string,
  value?: number
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const variant = getABTestVariant(testId);

  if (!variant) return;

  window.gtag('event', 'ab_test_conversion', {
    event_category: 'A/B Testing',
    event_label: conversionType,
    value: value || 1,
    custom_parameter_test_id: testId,
    custom_parameter_variant_id: variant.variantId,
    custom_parameter_variant_name: variant.variantName,
    custom_parameter_is_control: variant.isControl ? 'true' : 'false',
    custom_parameter_conversion_type: conversionType
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number, page?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const milestones = [25, 50, 75, 90, 100];
  const milestone = milestones.find(m => depth >= m && depth < m + 5);

  if (milestone) {
    window.gtag('event', 'scroll_depth', {
      event_category: 'Engagement',
      event_label: `${milestone}%`,
      custom_parameter_depth: milestone,
      custom_parameter_page: page || window.location.pathname
    });
  }
}

/**
 * Track time on page
 */
export function trackTimeOnPage(seconds: number, page?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const milestones = [30, 60, 120, 300, 600]; // 30s, 1m, 2m, 5m, 10m
  const milestone = milestones.find(m => seconds >= m && seconds < m + 10);

  if (milestone) {
    window.gtag('event', 'time_on_page', {
      event_category: 'Engagement',
      event_label: `${milestone}s`,
      custom_parameter_seconds: milestone,
      custom_parameter_page: page || window.location.pathname
    });
  }
}

// Helper Functions

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('ga_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ga_session_id', sessionId);
  }
  return sessionId;
}

function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  // Get from auth state or localStorage
  return localStorage.getItem('user_id') || null;
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

function getAttributionData(): AttributionData {
  if (typeof window === 'undefined') {
    return {
      source: 'unknown',
      medium: 'unknown',
      landingPage: 'unknown',
      firstTouch: new Date(),
      lastTouch: new Date(),
      touchpoints: []
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer;
  
  const source = urlParams.get('utm_source') || 
    sessionStorage.getItem('utm_source') || 
    (referrer ? new URL(referrer).hostname : 'direct');
  
  const medium = urlParams.get('utm_medium') || 
    sessionStorage.getItem('utm_medium') || 
    'organic';
  
  const campaign = urlParams.get('utm_campaign') || 
    sessionStorage.getItem('utm_campaign') || 
    undefined;

  const landingPage = sessionStorage.getItem('landing_page') || 
    window.location.pathname;

  // Store UTM parameters
  if (urlParams.get('utm_source')) {
    sessionStorage.setItem('utm_source', source);
  }
  if (urlParams.get('utm_medium')) {
    sessionStorage.setItem('utm_medium', medium);
  }
  if (campaign) {
    sessionStorage.setItem('utm_campaign', campaign);
  }

  return {
    source,
    medium,
    campaign,
    landingPage,
    firstTouch: new Date(),
    lastTouch: new Date(),
    touchpoints: [{
      timestamp: new Date(),
      source,
      medium,
      campaign,
      interaction: 'page_view'
    }]
  };
}

function storeFunnelState(state: ConversionFunnel): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('funnel_state', JSON.stringify({
    ...state,
    enteredAt: state.enteredAt.toISOString(),
    completedAt: state.completedAt?.toISOString(),
    attribution: {
      ...state.attribution,
      firstTouch: state.attribution.firstTouch.toISOString(),
      lastTouch: state.attribution.lastTouch.toISOString(),
      touchpoints: state.attribution.touchpoints.map(tp => ({
        ...tp,
        timestamp: tp.timestamp.toISOString()
      }))
    }
  }));
}

function getFunnelState(): ConversionFunnel | null {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem('funnel_state');
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      enteredAt: new Date(parsed.enteredAt),
      completedAt: parsed.completedAt ? new Date(parsed.completedAt) : undefined,
      attribution: {
        ...parsed.attribution,
        firstTouch: new Date(parsed.attribution.firstTouch),
        lastTouch: new Date(parsed.attribution.lastTouch),
        touchpoints: parsed.attribution.touchpoints.map((tp: any) => ({
          ...tp,
          timestamp: new Date(tp.timestamp)
        }))
      }
    };
  } catch {
    return null;
  }
}

function updateFunnelState(state: ConversionFunnel): void {
  storeFunnelState(state);
}

function markFunnelCompleted(conversionType: string): void {
  const state = getFunnelState();
  if (state) {
    updateFunnelState({
      ...state,
      completedAt: new Date(),
      currentStage: 'activated' as FunnelStage
    });
  }
}

function storeABTestVariant(variant: ABTestVariant): void {
  if (typeof window === 'undefined') return;
  const variants = getABTestVariants();
  variants[variant.testId] = variant;
  localStorage.setItem('ab_test_variants', JSON.stringify(variants));
}

function getABTestVariant(testId: string): ABTestVariant | null {
  if (typeof window === 'undefined') return null;
  const variants = getABTestVariants();
  return variants[testId] || null;
}

function getABTestVariants(): Record<string, ABTestVariant> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem('ab_test_variants');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

