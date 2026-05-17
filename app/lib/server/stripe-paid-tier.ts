import Stripe from 'stripe';

/** Same defaults as admin analytics / sponsor — keep in sync for tier fallback. */
const SPONSOR_PRICE_IDS = {
  corporateSponsorMonthly:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE || 'price_1SeZigD4sftWa1WtTODsYpwE',
  corporateSponsorAnnual:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL || 'price_1SgPLzD4sftWa1WtzrgPU5tj',
  foundersClubMonthly:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY || 'price_1TAWC9D4sftWa1WtO7Nwk7Vd',
  foundersClubAnnual:
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL || 'price_1TAWCxD4sftWa1WtEZtg2Oli',
  foundersClubLegacy: 'price_1Sg3ykD4sftWa1Wtheztc1hR',
};

/** Env historically had a one-character typo vs admin defaults; accept both. */
const FOUNDERS_CLUB_ANNUAL_ALIASES = [
  SPONSOR_PRICE_IDS.foundersClubAnnual,
  'price_1TAWCxD4sftWa1WtEZtg2OIi',
];

const FOUNDERS_CLUB_PRICE_IDS = new Set([
  SPONSOR_PRICE_IDS.foundersClubMonthly,
  ...FOUNDERS_CLUB_ANNUAL_ALIASES,
  SPONSOR_PRICE_IDS.foundersClubLegacy,
]);

const CORPORATE_PRICE_IDS = new Set([
  SPONSOR_PRICE_IDS.corporateSponsorMonthly,
  SPONSOR_PRICE_IDS.corporateSponsorAnnual,
]);

/** Subscriptions that should still unlock paid product access. */
const SUBSCRIPTION_OK = new Set(['active', 'trialing', 'past_due']);

export type StripePaidTierResult = {
  tier: 'foundersClub' | 'corporateSponsor' | null;
  themeAccess: 'founder' | 'corporate' | null;
};

function subscriptionItemPriceId(it: Stripe.SubscriptionItem): string | null {
  const p = it.price;
  if (typeof p === 'string') return p;
  if (p && typeof p === 'object' && 'id' in p && typeof (p as Stripe.Price).id === 'string') {
    return (p as Stripe.Price).id;
  }
  return null;
}

async function listCustomerIdsForEmail(stripe: Stripe, normalized: string): Promise<string[]> {
  const fromList = await stripe.customers.list({ email: normalized, limit: 10 });
  const ids = new Set(fromList.data.map((c) => c.id));
  if (ids.size > 0) return [...ids];
  try {
    const escaped = normalized.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const searched = await stripe.customers.search({
      query: `email:'${escaped}'`,
      limit: 10,
    });
    for (const c of searched.data) ids.add(c.id);
  } catch {
    /* Search API disabled or bad query — list path is enough for most accounts */
  }
  return [...ids];
}

/**
 * Resolve Founders Club / Corporate from Stripe when Firestore is unavailable.
 * Uses customer list by email + subscriptions with status=all (filtered locally).
 */
export async function resolvePaidTierFromStripeEmail(
  email: string
): Promise<StripePaidTierResult> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !email?.includes('@')) {
    return { tier: null, themeAccess: null };
  }

  const stripe = new Stripe(secret, { apiVersion: '2025-11-17.clover' });
  const normalized = email.trim().toLowerCase();

  const customerIds = await listCustomerIdsForEmail(stripe, normalized);
  for (const customerId of customerIds) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.items.data.price'],
      limit: 25,
    });
    for (const sub of subs.data) {
      if (!SUBSCRIPTION_OK.has(sub.status)) continue;
      const priceIds = sub.items.data
        .map((it) => subscriptionItemPriceId(it))
        .filter((id): id is string => typeof id === 'string');
      if (priceIds.some((id) => FOUNDERS_CLUB_PRICE_IDS.has(id))) {
        return { tier: 'foundersClub', themeAccess: 'founder' };
      }
      if (priceIds.some((id) => CORPORATE_PRICE_IDS.has(id))) {
        return { tier: 'corporateSponsor', themeAccess: 'corporate' };
      }
    }
  }

  return { tier: null, themeAccess: null };
}
