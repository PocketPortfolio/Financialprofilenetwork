// Analytics events for Pocket Portfolio
// GA4 tracking functions for user interactions

// Google Sign-In tracking
export function trackGoogleSignIn(params?: string | { landingPage?: string; utmSource?: any; utmMedium?: any; utmCampaign?: any; utmContent?: any }) {
  if (typeof window !== 'undefined' && window.gtag) {
    const landingPage = typeof params === 'string' ? params : params?.landingPage || 'unknown';
    const utmSource = typeof params === 'object' ? params?.utmSource : undefined;
    const utmMedium = typeof params === 'object' ? params?.utmMedium : undefined;
    const utmCampaign = typeof params === 'object' ? params?.utmCampaign : undefined;
    
    window.gtag('event', 'auth_google_sign_in', {
      event_category: 'Authentication',
      event_label: landingPage,
      utm_source: utmSource || 'direct',
      utm_medium: utmMedium || 'organic',
      utm_campaign: utmCampaign || 'none',
      value: 1
    });
  }
}

// Landing page tracking
export function storeLandingPage(landingPage: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('landing_page', landingPage);
  }
}

export function getLandingPage(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('landing_page');
  }
  return null;
}

// UTM parameter tracking
export function getStoredUTMParameters(): any {
  if (typeof window !== 'undefined') {
    const utmSource = sessionStorage.getItem('utm_source');
    const utmMedium = sessionStorage.getItem('utm_medium');
    const utmCampaign = sessionStorage.getItem('utm_campaign');
    
    if (utmSource || utmMedium || utmCampaign) {
      return {
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      };
    }
  }
  return null;
}

// CSV Import tracking
export function trackCSVImportStart(source?: string | { source?: string }) {
  const sourceStr = typeof source === 'string' ? source : source?.source || 'unknown';
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'csv_import_start', {
      event_category: 'CSV Import',
      event_label: sourceStr,
      value: 1
    });
  }
}

export function trackCSVImportSuccess(broker?: string | { broker?: string; rowCount?: number; fileSize?: number }, tradeCount?: number) {
  const brokerStr = typeof broker === 'string' ? broker : broker?.broker || 'unknown';
  const count = tradeCount || (typeof broker === 'object' ? broker?.rowCount : undefined) || 0;
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'csv_import_success', {
      event_category: 'CSV Import',
      event_label: brokerStr,
      value: count
    });
  }
}

export function trackCSVImportError(error?: string | { errorType?: string; errorMessage?: string; broker?: string }) {
  const errorStr = typeof error === 'string' ? error : error?.errorMessage || 'unknown_error';
  const brokerStr = typeof error === 'object' ? error?.broker : undefined;
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'csv_import_error', {
      event_category: 'CSV Import',
      event_label: brokerStr || 'unknown',
      custom_parameter_error: errorStr,
      value: 0
    });
  }
}

/** Header row was auto-corrected via synonym/fuzzy pass (low-cardinality summary). */
export function trackCSVImportHeaderAutofix(params: { count: number; preview?: string }) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'csv_import_header_autofix', {
      event_category: 'CSV Import',
      event_label: 'header_normalize',
      value: params.count,
      ...(params.preview ? { custom_parameter_preview: params.preview.slice(0, 120) } : {}),
    });
  }
}

// Portfolio tracking events
export function trackPortfolioView() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'portfolio_view', {
      event_category: 'Portfolio',
      value: 1
    });
  }
}

export function trackTradeAdded(symbol: string, type: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'trade_added', {
      event_category: 'Trading',
      event_label: symbol,
      custom_parameter_type: type,
      value: 1
    });
  }
}

// Price data events
export function trackPriceDataRequest(symbol: string, source: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'price_data_request', {
      event_category: 'Price Data',
      event_label: symbol,
      custom_parameter_source: source,
      value: 1
    });
  }
}

// Navigation events
export function trackPageView(page: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      event_category: 'Navigation',
      event_label: page,
      value: 1
    });
  }
}

type BridgeCtaSource = 'json_api' | 'import_page' | 'unknown';

export function trackBridgeToTerminalCtaClick(args: {
  source: BridgeCtaSource;
  destination: string;
  contextId?: string; // ticker symbol, broker slug, etc.
  ctaId?: string; // e.g. 'open_terminal'
  /** A/B arm from NEXT_PUBLIC_BRIDGE_CTA_VARIANT — unchanged experiment split. */
  bridgeVariant?: 'A' | 'B';
  /** Semantic hook bucket for json-api title rotation (GA4 custom dimension). */
  bridgeHook?: 'sovereign' | 'local_first' | 'private_ledger';
}) {
  if (typeof window === 'undefined') return;
  const utm = getCurrentUtm();
  trackEvent('bridge_to_terminal_cta_click', {
    source: args.source,
    destination: args.destination,
    context_id: args.contextId || 'null',
    cta_id: args.ctaId || 'open_terminal',
    bridge_variant: args.bridgeVariant ?? 'null',
    bridge_hook: args.bridgeHook ?? 'null',
    page_path: window.location.pathname,
    utm_source: utm.utm_source || 'direct',
    utm_medium: utm.utm_medium || 'bridge_cta',
    utm_campaign: utm.utm_campaign || 'activation',
    utm_content: utm.utm_content || (args.contextId || 'null'),
    timestamp: new Date().toISOString(),
  });
}

export function trackBridgeToTerminalSecondaryClick(args: {
  source: BridgeCtaSource;
  destination: string;
  contextId?: string;
  linkId?: string; // e.g. 'how_local_first_works'
}) {
  if (typeof window === 'undefined') return;
  const utm = getCurrentUtm();
  trackEvent('bridge_to_terminal_secondary_click', {
    source: args.source,
    destination: args.destination,
    context_id: args.contextId || 'null',
    link_id: args.linkId || 'how_it_works',
    page_path: window.location.pathname,
    utm_source: utm.utm_source || 'direct',
    utm_medium: utm.utm_medium || 'bridge_cta',
    utm_campaign: utm.utm_campaign || 'activation',
    utm_content: utm.utm_content || (args.contextId || 'null'),
    timestamp: new Date().toISOString(),
  });
}

// Blog post tracking
export function trackBlogPostClick(title: string, platform: string, url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'blog_post_click', {
      event_category: 'Blog',
      event_label: title,
      custom_parameter_platform: platform,
      custom_parameter_url: url,
      value: 1
    });
  }
}

export function trackBlogPlatformView(platform: string, action: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'blog_platform_view', {
      event_category: 'Blog',
      event_label: platform,
      custom_parameter_action: action,
      value: 1
    });
  }
}

// Error tracking
export function trackError(error: string, context?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'error', {
      event_category: 'Error',
      event_label: error,
      custom_parameter_context: context || 'unknown',
      value: 0
    });
  }
}

const CONVERSION_FUNNEL_EVENTS = ['lead_magnet_clicked', 'mobile_setup_requested', 'quota_upgrade_initiated'] as const;

export type MonetizationTriggerSource =
  | 'csv_import_success'
  | 'risk_metric_unlock_attempt'
  | 'ai_file_attachment_attempt'
  | 'sponsor_page_direct'
  | 'global_founders_banner'
  | 'dashboard_founders_banner';

const PAYWALL_IMPRESSION_KEY = 'pp_paywall_impressions_v1';
const MONETIZATION_SESSION_KEY = 'pp_monetization_session_id';

function getMonetizationSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const existing = sessionStorage.getItem(MONETIZATION_SESSION_KEY);
  if (existing) return existing;
  const created = `ms_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(MONETIZATION_SESSION_KEY, created);
  return created;
}

function getCurrentUtm() {
  if (typeof window === 'undefined') return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };
  const qs = new URLSearchParams(window.location.search);
  const fromSession = (k: string) => sessionStorage.getItem(k);
  return {
    utm_source: qs.get('utm_source') || fromSession('utm_source'),
    utm_medium: qs.get('utm_medium') || fromSession('utm_medium'),
    utm_campaign: qs.get('utm_campaign') || fromSession('utm_campaign'),
    utm_content: qs.get('utm_content') || fromSession('utm_content'),
  };
}

async function syncMonetizationIntentToFirestore(
  kind: 'paywall_impression' | 'checkout_start',
  triggerSource: string
) {
  if (typeof window === 'undefined') return;
  try {
    const { auth } = await import('@/app/lib/firebase');
    if (!auth?.currentUser) return;
    const idToken = await auth.currentUser.getIdToken();
    await fetch('/api/user/monetization-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ kind, triggerSource }),
    });
  } catch {
    /* ignore */
  }
}

function logMonetizationFunnelEvent(
  eventType: 'paywall_impression' | 'checkout_start',
  triggerSource: string,
  pagePath?: string
) {
  if (typeof window === 'undefined') return;
  void fetch('/api/analytics/monetization-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      trigger_source: triggerSource,
      page_path: pagePath || window.location.pathname,
      session_id: getMonetizationSessionId(),
    }),
  });
}

export function trackPaywallImpression(triggerSource: MonetizationTriggerSource, pagePath?: string, tier?: string | null) {
  if (typeof window === 'undefined') return;
  const key = `${triggerSource}::${window.location.pathname}`;
  const existingRaw = sessionStorage.getItem(PAYWALL_IMPRESSION_KEY);
  const existing = existingRaw ? JSON.parse(existingRaw) as string[] : [];
  if (existing.includes(key)) return;
  existing.push(key);
  sessionStorage.setItem(PAYWALL_IMPRESSION_KEY, JSON.stringify(existing));

  const utm = getCurrentUtm();
  trackEvent('paywall_impression', {
    session_id: getMonetizationSessionId(),
    trigger_source: triggerSource,
    page_path: pagePath || window.location.pathname,
    tier: tier || 'null',
    utm_source: utm.utm_source || 'direct',
    utm_medium: utm.utm_medium || 'paywall',
    utm_campaign: utm.utm_campaign || 'intent_trigger',
    utm_content: utm.utm_content || triggerSource,
    timestamp: new Date().toISOString(),
  });
  void syncMonetizationIntentToFirestore('paywall_impression', triggerSource);
  logMonetizationFunnelEvent('paywall_impression', triggerSource, pagePath || window.location.pathname);
}

export function trackPaywallCtaClick(
  triggerSource: MonetizationTriggerSource,
  destination: string,
  pagePath?: string,
  tier?: string | null,
  ctaId: string = 'upgrade_founders_primary'
) {
  const utm = getCurrentUtm();
  trackEvent('paywall_cta_click', {
    session_id: getMonetizationSessionId(),
    trigger_source: triggerSource,
    cta_id: ctaId,
    destination,
    page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : 'server'),
    tier: tier || 'null',
    utm_source: utm.utm_source || 'direct',
    utm_medium: utm.utm_medium || 'paywall',
    utm_campaign: utm.utm_campaign || 'intent_trigger',
    utm_content: utm.utm_content || triggerSource,
    timestamp: new Date().toISOString(),
  });
}

export function trackCheckoutStart(
  triggerSource: MonetizationTriggerSource,
  priceId: string,
  tierName: string,
  billingInterval?: 'monthly' | 'annual' | null
) {
  const utm = getCurrentUtm();
  trackEvent('checkout_start', {
    session_id: getMonetizationSessionId(),
    trigger_source: triggerSource,
    price_id: priceId,
    tier_name: tierName,
    billing_interval: billingInterval || 'null',
    page_path: typeof window !== 'undefined' ? window.location.pathname : 'server',
    utm_source: utm.utm_source || 'direct',
    utm_medium: utm.utm_medium || 'checkout',
    utm_campaign: utm.utm_campaign || 'intent_trigger',
    utm_content: utm.utm_content || triggerSource,
    timestamp: new Date().toISOString(),
  });
  void syncMonetizationIntentToFirestore('checkout_start', triggerSource);
  logMonetizationFunnelEvent('checkout_start', triggerSource);
}

export function trackCheckoutSessionCreated(stripeSessionId: string, priceId: string, tierName: string, triggerSource: MonetizationTriggerSource) {
  trackEvent('checkout_session_created', {
    session_id: getMonetizationSessionId(),
    stripe_session_id: stripeSessionId,
    price_id: priceId,
    tier_name: tierName,
    trigger_source: triggerSource,
    timestamp: new Date().toISOString(),
  });
}

export function trackCheckoutRedirected(stripeSessionId: string, redirectTarget: string = 'stripe_checkout_url') {
  trackEvent('checkout_redirected', {
    session_id: getMonetizationSessionId(),
    stripe_session_id: stripeSessionId,
    redirect_target: redirectTarget,
    timestamp: new Date().toISOString(),
  });
}

export function trackCheckoutError(
  errorStage: 'session_create' | 'stripe_init' | 'redirect',
  errorCode: string,
  errorMessage: string,
  triggerSource?: MonetizationTriggerSource,
  priceId?: string
) {
  trackEvent('checkout_error', {
    session_id: getMonetizationSessionId(),
    trigger_source: triggerSource || 'sponsor_page_direct',
    error_stage: errorStage,
    error_code: errorCode,
    error_message: errorMessage.slice(0, 200),
    price_id: priceId || 'null',
    timestamp: new Date().toISOString(),
  });
}

const STRIPE_CHECKOUT_ANALYTICS_KEY = 'pp_stripe_checkout_analytics_';

export type StripeCheckoutAnalyticsItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

/**
 * GA4 recommended ecommerce `purchase` + existing `checkout_success_page_view`.
 * Deduplicated per Stripe Checkout session id (browser sessionStorage).
 */
export function trackStripeCheckoutCompleteAnalytics(args: {
  transaction_id: string;
  value: number;
  currency: string;
  items: StripeCheckoutAnalyticsItem[];
  tier_name?: string | null;
  has_api_key_hint?: boolean | null;
}) {
  if (typeof window === 'undefined') return;
  const key = STRIPE_CHECKOUT_ANALYTICS_KEY + args.transaction_id;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');

  const itemsPayload = args.items.map((i) => ({
    item_id: i.item_id,
    item_name: i.item_name,
    price: i.price,
    quantity: i.quantity,
  }));

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: args.transaction_id,
      value: args.value,
      currency: args.currency,
      tax: 0,
      shipping: 0,
      items: itemsPayload,
      event_category: 'Ecommerce',
    });
  }

  trackEvent('checkout_success_page_view', {
    session_id: getMonetizationSessionId(),
    stripe_session_id: args.transaction_id,
    tier_name: args.tier_name || 'null',
    has_api_key: String(!!args.has_api_key_hint),
    value: args.value,
    currency: args.currency,
    timestamp: new Date().toISOString(),
  });
}

/** Prefer `trackStripeCheckoutCompleteAnalytics` on `/sponsor/success` so GA4 receives `purchase`. */
export function trackCheckoutSuccessPageView(stripeSessionId: string, tierName?: string | null, hasApiKey?: boolean | null) {
  trackEvent('checkout_success_page_view', {
    session_id: getMonetizationSessionId(),
    stripe_session_id: stripeSessionId,
    tier_name: tierName || 'null',
    has_api_key: String(!!hasApiKey),
    timestamp: new Date().toISOString(),
  });
}

// Conversion funnel events (Lead Magnet, Mobile Setup, Quota Upgrade) — GA4 + /admin/analytics.
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'Conversion',
      ...params,
    });
  }
  // Also log to backend for /admin/analytics
  if (typeof window !== 'undefined' && CONVERSION_FUNNEL_EVENTS.includes(eventName as (typeof CONVERSION_FUNNEL_EVENTS)[number])) {
    const ticker = params && typeof params.ticker === 'string' ? params.ticker : undefined;
    fetch('/api/analytics/conversion-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, ...(ticker ? { ticker } : {}) }),
    }).catch(() => {});
  }
}

// Feature Announcement tracking
export function trackFeatureAnnouncementView() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_feature_announcement', {
      event_category: 'Feature Announcement',
      event_label: 'sovereign_sync',
      value: 1
    });
  }
}

export function trackFeatureUpgradeClick() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click_feature_upgrade', {
      event_category: 'Feature Announcement',
      event_label: 'sovereign_sync',
      value: 1
    });
  }
}

export function trackSyncSessionStart() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sync_session_start', {
      event_category: 'Sovereign Sync',
      event_label: 'google_drive_sync',
      value: 1
    });
  }
}

// TypeScript declarations for gtag
// Extended to support all custom parameters from conversion.ts, viral.ts, and events.ts
declare global {
  interface Window {
    gtag: (
      command: 'event',
      action: string,
      parameters: {
        event_category?: string;
        event_label?: string;
        value?: number;
        currency?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
        // Events.ts parameters
        custom_parameter_error?: string;
        custom_parameter_type?: string;
        custom_parameter_source?: string;
        custom_parameter_context?: string;
        custom_parameter_platform?: string;
        custom_parameter_url?: string;
        custom_parameter_action?: string;
        // Conversion.ts parameters
        custom_parameter_funnel_name?: string;
        custom_parameter_session_id?: string;
        custom_parameter_user_id?: string;
        custom_parameter_stage_order?: number;
        custom_parameter_metadata?: string;
        custom_parameter_element_id?: string;
        custom_parameter_element_type?: string;
        custom_parameter_page?: string;
        custom_parameter_value?: number;
        custom_parameter_conversion_type?: string;
        custom_parameter_drop_off_stage?: string;
        custom_parameter_drop_off_reason?: string;
        custom_parameter_time_in_funnel?: number;
        custom_parameter_test_id?: string;
        custom_parameter_variant_id?: string;
        custom_parameter_variant_name?: string;
        custom_parameter_is_control?: string;
        custom_parameter_depth?: number;
        custom_parameter_seconds?: number;
        // Viral.ts parameters
        custom_parameter_referral_code?: string;
        // Allow additional custom parameters for future extensibility
        [key: string]: any;
      }
    ) => void;
  }
}
