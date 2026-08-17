import { describe, expect, it } from 'vitest';
import {
  brewinPilotCostBasisGbp,
  BREWIN_PILOT_SEED,
  buildBrewinPilotDisplayTrades,
  isBrewinPilotEmail,
  isBrewinPilotRequested,
} from '@/app/lib/demo/brewin-manchester-pilot';
import { isUkListedTicker } from '@/app/lib/markets/ukListedTickers';
import { formatHudMoney } from '@/app/lib/utils/currencyFormatter';
import { isDashboardShellPath } from '@/lib/dashboard-shell';

describe('Brewin Manchester pilot gate', () => {
  it('allowlists only the named operator email', () => {
    expect(isBrewinPilotEmail('abbalawal22s@gmail.com')).toBe(true);
    expect(isBrewinPilotEmail('Abbalawal22s@gmail.com')).toBe(true);
    expect(isBrewinPilotEmail('someone@brewin.co.uk')).toBe(false);
    expect(isBrewinPilotEmail(null)).toBe(false);
  });

  it('requires an explicit pilot path or query', () => {
    expect(isBrewinPilotRequested('/dashboard', '?pilot=brewin')).toBe(true);
    expect(isBrewinPilotRequested('/demo/brewin', '')).toBe(true);
    expect(isBrewinPilotRequested('/dashboard', '')).toBe(false);
    expect(isBrewinPilotRequested('/positions', '')).toBe(false);
    expect(isBrewinPilotRequested('/dashboard', '?pilot=other')).toBe(false);
  });

  it('treats the replica path as a desktop dashboard shell so the marketing footer cannot collapse the pane', () => {
    expect(isDashboardShellPath('/demo/brewin')).toBe(true);
    expect(isDashboardShellPath('/dashboard')).toBe(true);
  });

  it('pins AZN at 22% of the £2.8m cost book', () => {
    const azn = BREWIN_PILOT_SEED.find((row) => row.ticker === 'AZN');
    expect(azn).toBeDefined();
    const cost = brewinPilotCostBasisGbp();
    expect((azn!.qty * azn!.price) / cost).toBeCloseTo(0.22, 3);
    const usTech = BREWIN_PILOT_SEED.filter((row) => row.ticker === 'EQQQ' || row.ticker === 'IUIT');
    const usTechWeight = usTech.reduce((sum, row) => sum + row.weight, 0);
    expect(usTechWeight).toBeCloseTo(0.28, 8);
  });

  it('seeds a ~£2.8m GBP founder book that sums to 100%', () => {
    const weight = BREWIN_PILOT_SEED.reduce((sum, row) => sum + row.weight, 0);
    expect(weight).toBeCloseTo(1, 8);
    expect(brewinPilotCostBasisGbp()).toBeGreaterThan(2_700_000);
    expect(brewinPilotCostBasisGbp()).toBeLessThan(2_900_000);
    const trades = buildBrewinPilotDisplayTrades();
    expect(trades.every((t) => t.mock)).toBe(true);
    expect(trades.map((t) => t.ticker)).toContain('AZN');
  });

  it('quotes replica LSE sleeves as .L on the shared UK list', () => {
    expect(isUkListedTicker('CSH2')).toBe(true);
    expect(isUkListedTicker('EQQQ')).toBe(true);
    expect(isUkListedTicker('AZN')).toBe(true);
    expect(isUkListedTicker('AAPL')).toBe(false);
  });

  it('formats replica HUD money as sterling without changing USD default', () => {
    expect(formatHudMoney(2800000, 'GBP', 0)).toMatch(/£2,800,000/);
    expect(formatHudMoney(100, 'USD')).toMatch(/\$100\.00/);
  });

  it('tags overlay rows as synthetic so they cannot be mistaken for Firestore trades', () => {
    const trades = buildBrewinPilotDisplayTrades('operator-uid');
    expect(trades.every((t) => t.id.startsWith('brewin-pilot-'))).toBe(true);
    expect(trades.every((t) => t.uid === 'operator-uid')).toBe(true);
    expect(new Set(trades.map((t) => t.ticker)).size).toBe(BREWIN_PILOT_SEED.length);
  });
});
