import { describe, expect, it } from 'vitest';
import {
  isSymbolIndexAllowlisted,
  symbolFarmRobots,
  TOP_100_SYMBOL_INDEX_ALLOWLIST,
} from '@/lib/seo/symbol-index-allowlist';

describe('symbol-index-allowlist', () => {
  it('indexes liquid allowlisted names', () => {
    expect(isSymbolIndexAllowlisted('AAPL')).toBe(true);
    expect(isSymbolIndexAllowlisted('spy')).toBe(true);
    expect(isSymbolIndexAllowlisted('NVDA')).toBe(true);
    expect(isSymbolIndexAllowlisted('PLTR')).toBe(true);
    expect(isSymbolIndexAllowlisted('BTC')).toBe(true);
  });

  it('noindexes farm residue tickers', () => {
    expect(isSymbolIndexAllowlisted('XINXX')).toBe(false);
    expect(isSymbolIndexAllowlisted('xvlxx')).toBe(false);
    expect(isSymbolIndexAllowlisted('MCODX')).toBe(false);
    expect(symbolFarmRobots('XINXX')).toEqual({ index: false, follow: true });
  });

  it('keeps allowlist bounded near Top-100', () => {
    expect(TOP_100_SYMBOL_INDEX_ALLOWLIST.length).toBeGreaterThanOrEqual(80);
    expect(TOP_100_SYMBOL_INDEX_ALLOWLIST.length).toBeLessThanOrEqual(160);
  });

  it('indexes allowlisted with index:true robots', () => {
    expect(symbolFarmRobots('SPY')).toEqual({ index: true, follow: true });
  });
});
