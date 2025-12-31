/**
 * Viral Loop Analytics
 * Track viral loop events (shares, referrals, conversions)
 */

import { ShareMetrics, ReferralData } from '../viral/types';

// gtag type is declared in app/lib/analytics/events.ts
// We extend it here by using index signature for custom parameters

/**
 * Track viral share event
 */
export function trackViralShare(metrics: ShareMetrics): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'viral_share', {
      event_category: 'Viral Loop',
      event_label: metrics.platform,
      value: 1,
      // @ts-ignore - custom parameters allowed by GA4
      custom_parameter_context: metrics.context || 'unknown',
      custom_parameter_url: metrics.url
    } as any);
  }
}

/**
 * Track referral event
 */
export function trackViralReferral(data: {
  action: 'click' | 'conversion';
  referralCode: string;
  source?: string;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'viral_referral', {
      event_category: 'Viral Loop',
      event_label: data.action,
      custom_parameter_source: data.source || 'unknown',
      value: data.action === 'conversion' ? 10 : 1, // Higher value for conversions
      // @ts-ignore - custom parameter not in base type but allowed by GA4
      custom_parameter_referral_code: data.referralCode
    } as any);
  }
}

/**
 * Track invite sent
 */
export function trackInviteSent(platform: 'email' | 'link' | 'social', count?: number): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'viral_invite_sent', {
      event_category: 'Viral Loop',
      event_label: platform,
      value: count || 1
    });
  }
}

/**
 * Track widget embed
 */
export function trackWidgetEmbed(source: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'viral_widget_embed', {
      event_category: 'Viral Loop',
      event_label: source,
      value: 1
    });
  }
}

// gtag type is declared in app/lib/analytics/events.ts
// We use type assertion for custom parameters that aren't in the base type

