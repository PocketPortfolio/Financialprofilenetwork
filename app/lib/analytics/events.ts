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
