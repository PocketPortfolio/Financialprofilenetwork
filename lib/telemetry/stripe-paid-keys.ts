import Stripe from 'stripe';

const PAID_PRICE_IDS = new Set(
  [
    process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_CODE_SUPPORTER_ANNUAL,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FEATURE_VOTER_ANNUAL,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_CORPORATE_ANNUAL,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_MONTHLY,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB_ANNUAL,
    process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDERS_CLUB,
    'price_1SeZh7D4sftWa1WtWsDwvQu5',
    'price_1SgPGYD4sftWa1WtLgEjFV93',
    'price_1SeZhnD4sftWa1WtP5GdZ5cT',
    'price_1SgPHJD4sftWa1WtW03Tzald',
    'price_1SeZigD4sftWa1WtTODsYpwE',
    'price_1SgPLzD4sftWa1WtzrgPU5tj',
    'price_1TAWC9D4sftWa1WtO7Nwk7Vd',
    'price_1TAWCxD4sftWa1WtEZtg2Oli',
    'price_1TAWCxD4sftWa1WtEZtg2OIi',
  ].filter((id): id is string => Boolean(id)),
);

const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

export interface StripePaidKeysPin {
  paidKeys: number;
  mrrGbp: number;
  day28Pass: boolean;
  configured: boolean;
}

export async function fetchStripePaidKeysPin(): Promise<StripePaidKeysPin> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return { paidKeys: 0, mrrGbp: 0, day28Pass: false, configured: false };
  }

  const stripe = new Stripe(secret, { apiVersion: '2025-11-17.clover' });
  const subscriptions = await stripe.subscriptions.list({
    status: 'all',
    limit: 100,
    expand: ['data.items.data.price'],
  });

  let paidKeys = 0;
  let mrrGbp = 0;

  for (const sub of subscriptions.data) {
    if (!LIVE_STATUSES.has(sub.status)) continue;
    let counted = false;
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price?.id || !PAID_PRICE_IDS.has(price.id)) continue;
      if (!counted) {
        paidKeys += 1;
        counted = true;
      }
      if (price.recurring && price.unit_amount) {
        const amount = price.unit_amount / 100;
        mrrGbp += price.recurring.interval === 'year' ? amount / 12 : amount;
      }
    }
  }

  return {
    paidKeys,
    mrrGbp: Math.round(mrrGbp * 100) / 100,
    day28Pass: paidKeys >= 1,
    configured: true,
  };
}
