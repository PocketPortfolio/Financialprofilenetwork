/**
 * RBC Brewin Dolphin · Manchester design-partner replica.
 *
 * Gated sales skin — not a product SKU. Activate only on
 * `/demo/brewin` (or `?pilot=brewin`) AND an allowlisted email.
 * Leaving that route restores the operator's real book.
 * Overlay is in-memory. Never writes the synthetic book to Firestore.
 * Replica HUD freezes at GBP cost basis so live Yahoo cannot drift AZN off 22%.
 * Uses product light/dark tokens (amber SSOT). Banner must stay visible.
 */

import type { Trade } from '@/app/services/tradeService';

export const BREWIN_PILOT_QUERY = 'brewin';
export const BREWIN_PILOT_DATASET = 'brewin-mcr';

export const BREWIN_PILOT_EMAILS = ['abbalawal22s@gmail.com'] as const;

export const BREWIN_PILOT_CLIENT_LABEL = 'NW Founder — post-liquidity (SYNTHETIC)';

export const BREWIN_DESK_PROMPT =
  'This is a synthetic £2.8m founder book: 22% in a single UK listed name after a liquidity event, North America growth including semiconductors, sterling bonds, and a gold sleeve. Flag concentration and Consumer Duty conversation points before a review if the founder is considering a block sale of about 10% of that name. Do not give personal tax advice.';

const SEED_DATE = '2025-06-16';

/** Cost-basis sleeve targeting ~£2.8m in GBP-quoted instruments. */
export const BREWIN_PILOT_SEED = [
  { ticker: 'AZN', sleeve: 'Concentrated UK employer', weight: 0.22, qty: 5600, price: 110, currency: 'GBP' },
  { ticker: 'EQQQ', sleeve: 'North America growth', weight: 0.18, qty: 1200, price: 420, currency: 'GBP' },
  { ticker: 'IUIT', sleeve: 'North America / semis', weight: 0.1, qty: 12727, price: 22, currency: 'GBP' },
  { ticker: 'BP', sleeve: 'UK / EU core', weight: 0.08, qty: 49778, price: 4.5, currency: 'GBP' },
  { ticker: 'HSBA', sleeve: 'UK / EU core', weight: 0.08, qty: 34462, price: 6.5, currency: 'GBP' },
  { ticker: 'VGOV', sleeve: 'Sterling gilts', weight: 0.12, qty: 17684, price: 19, currency: 'GBP' },
  { ticker: 'SLXX', sleeve: 'Sterling credit', weight: 0.06, qty: 9882, price: 17, currency: 'GBP' },
  { ticker: 'SGLN', sleeve: 'Gold', weight: 0.08, qty: 4667, price: 48, currency: 'GBP' },
  { ticker: 'CSH2', sleeve: 'Cash', weight: 0.08, qty: 2055, price: 109, currency: 'GBP' },
] as const;

export function isBrewinPilotEmail(email: string | null | undefined): boolean {
  const normalised = email?.trim().toLowerCase() ?? '';
  return (BREWIN_PILOT_EMAILS as readonly string[]).includes(normalised);
}

export function isBrewinPilotRequested(pathname: string, search: string): boolean {
  if (pathname === '/demo/brewin' || pathname.startsWith('/demo/brewin/')) return true;
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return q.get('pilot') === BREWIN_PILOT_QUERY;
}

export function brewinPilotCostBasisGbp(): number {
  return BREWIN_PILOT_SEED.reduce((sum, row) => sum + row.qty * row.price, 0);
}

export function buildBrewinPilotDisplayTrades(uid = 'brewin-pilot'): Trade[] {
  const ts = { seconds: 1_750_000_000, nanoseconds: 0 } as Trade['createdAt'];
  return BREWIN_PILOT_SEED.map((row, i) => ({
    id: `brewin-pilot-${row.ticker}-${i}`,
    uid,
    ticker: row.ticker,
    qty: row.qty,
    price: row.price,
    date: SEED_DATE,
    type: 'BUY' as const,
    currency: row.currency,
    mock: true,
    createdAt: ts,
    updatedAt: ts,
  }));
}
