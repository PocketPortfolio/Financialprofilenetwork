'use client';

import {
  trackCheckoutError,
  trackCheckoutRedirected,
  trackCheckoutSessionCreated,
  trackCheckoutStart,
  trackPaywallCtaClick,
  type MonetizationTriggerSource,
} from '@/app/lib/analytics/events';

function navigateHard(url: string) {
  if (typeof window === 'undefined') return;
  try {
    const win = window.top ?? window;
    win.location.href = url;
  } catch {
    window.location.href = url;
  }
}

/** Must match `PRICE_IDS.foundersClub.annual` in `app/sponsor/page.tsx` when env is unset. */
const DEFAULT_FOUNDERS_CLUB_ANNUAL_PRICE_ID = 'price_1TAWCxD4sftWa1WtEZtg2Oli';

export function getFoundersClubPriceId(): string | null {
  const id =
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL ||
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB ||
    DEFAULT_FOUNDERS_CLUB_ANNUAL_PRICE_ID;
  if (!id || id.includes('XXXXX')) return null;
  return id;
}

export type StartFoundersClubCheckoutParams = {
  email?: string;
  triggerSource: MonetizationTriggerSource;
  utm_source: string;
  utm_medium: string;
  utm_campaign?: string;
  utm_content?: string;
  /**
   * Default: throw if Stripe price env is missing (modals).
   * Banners use `redirect_sponsor` so users still reach the sponsor deck.
   */
  missingPriceBehavior?: 'throw' | 'redirect_sponsor';
};

/**
 * Hosted Stripe Checkout for UK Founder's Club (annual price id).
 * Mirrors sponsor page + AskAIModal session creation and redirect.
 */
export async function startFoundersClubCheckout(
  params: StartFoundersClubCheckoutParams
): Promise<void> {
  const priceId = getFoundersClubPriceId();
  const missing = params.missingPriceBehavior ?? 'throw';

  if (!priceId) {
    if (missing === 'redirect_sponsor') {
      const q = new URLSearchParams({
        utm_source: params.utm_source,
        utm_medium: params.utm_medium,
        utm_campaign: params.utm_campaign ?? 'founders_club',
        utm_content: params.utm_content ?? params.triggerSource,
      });
      navigateHard(`/sponsor?${q.toString()}`);
      return;
    }
    throw new Error('Checkout not configured. Please visit /sponsor to upgrade.');
  }

  // Analytics must never block checkout (sessionStorage / gtag / GA can throw in strict privacy modes).
  try {
    trackCheckoutStart(params.triggerSource, priceId, "UK Founder's Club", 'annual');
    trackPaywallCtaClick(params.triggerSource, '/api/create-checkout-session');
  } catch (analyticsErr) {
    console.warn('[checkout] analytics skipped', analyticsErr);
  }

  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      priceId,
      tierName: "UK Founder's Club",
      email: params.email ?? undefined,
      trigger_source: params.triggerSource,
      utm_source: params.utm_source,
      utm_medium: params.utm_medium,
      utm_campaign: params.utm_campaign ?? 'intent_trigger',
      utm_content: params.utm_content ?? params.triggerSource,
    }),
  });

  const raw = await res.text();

  let data: { error?: string; sessionId?: string; session_id?: string; url?: string } = {};
  try {
    if (raw) data = JSON.parse(raw) as typeof data;
  } catch {
    if (!res.ok) {
      trackCheckoutError(
        'session_create',
        'session_create_failed',
        raw.slice(0, 200),
        params.triggerSource,
        priceId
      );
      throw new Error(raw.slice(0, 200) || `Checkout failed (${res.status})`);
    }
    throw new Error('Invalid response from checkout');
  }

  if (!res.ok) {
    trackCheckoutError(
      'session_create',
      'session_create_failed',
      data?.error || `Checkout failed (${res.status})`,
      params.triggerSource,
      priceId
    );
    throw new Error(data.error || `Checkout failed (${res.status})`);
  }

  const sessionId = data.sessionId ?? data.session_id;

  if (sessionId) {
    try {
      trackCheckoutSessionCreated(
        sessionId,
        priceId,
        "UK Founder's Club",
        params.triggerSource
      );
    } catch {
      /* analytics only */
    }
  }

  const urlRaw = typeof data.url === 'string' ? data.url.trim() : '';
  const hostedUrl =
    urlRaw && (urlRaw.startsWith('https://') || urlRaw.startsWith('http://')) ? urlRaw : null;

  if (hostedUrl) {
    try {
      trackCheckoutRedirected(sessionId || 'unknown');
    } catch {
      /* analytics only */
    }
    navigateHard(hostedUrl);
    return;
  }
  if (sessionId) {
    try {
      trackCheckoutRedirected(sessionId);
    } catch {
      /* analytics only */
    }
    navigateHard(`https://checkout.stripe.com/c/pay/${sessionId}`);
    return;
  }

  trackCheckoutError(
    'redirect',
    'missing_checkout_target',
    'No checkout URL returned',
    params.triggerSource,
    priceId
  );
  throw new Error('No checkout URL returned');
}
