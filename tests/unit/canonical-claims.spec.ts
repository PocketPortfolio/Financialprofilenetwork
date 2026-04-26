/**
 * tests/unit/canonical-claims.spec.ts
 *
 * The four Sovereign Thresholds — every PR is gated on these.
 *
 *  #1  One-liner discipline   — primary OR secondary positioning appears verbatim
 *                                in TAGLINE_LONG and is exposed as the canonical slogan.
 *  #2  Signal floor           — minPackages and minBrokerAdapters never regress.
 *  #3  Resolution rule        — every NUMBERS_SNAPSHOT row carries a NUMBERS-PACK row ID.
 *  #4  Recency rule           — LAST_HUMAN_VERIFIED is within SOVEREIGN_THRESHOLDS.maxAgeDays.
 *
 * If any of these fails, the PR cannot merge and `npm run ci` will block deploy.
 */

import { describe, expect, test } from 'vitest';

import {
  LAST_HUMAN_VERIFIED,
  NUMBERS_SNAPSHOT,
  PACKAGES,
  POSITIONING,
  SDK,
  SOVEREIGN_THRESHOLDS,
  TAGLINE_LONG,
} from '../../lib/canonical-claims';

describe('Sovereign Threshold #1 — one-liner discipline', () => {
  test('primary positioning is non-empty and exposed', () => {
    expect(POSITIONING.primary.length).toBeGreaterThan(8);
    expect(POSITIONING.secondary.length).toBeGreaterThan(8);
  });

  test('TAGLINE_LONG contains primary OR secondary phrasing verbatim', () => {
    const candidates = SOVEREIGN_THRESHOLDS.oneLinerCandidates;
    const longLower = TAGLINE_LONG.toLowerCase();
    // Strip trailing period so "X." matches "X" embedded in a sentence.
    const matched = candidates.some((c) =>
      longLower.includes(c.replace(/\.$/, '').toLowerCase()),
    );
    expect(
      matched,
      `TAGLINE_LONG must echo POSITIONING.primary or POSITIONING.secondary verbatim. Got:\n${TAGLINE_LONG}`,
    ).toBe(true);
  });
});

describe('Sovereign Threshold #2 — signal floor', () => {
  test('canonical package count meets minimum', () => {
    expect(PACKAGES.length).toBeGreaterThanOrEqual(SOVEREIGN_THRESHOLDS.minPackages);
  });

  test('package list has no duplicates and matches /api/npm-stats order discipline', () => {
    const names = PACKAGES.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
    // First entry must be the core SDK — npm-stats route depends on this anchor.
    expect(names[0]).toBe(SDK.name);
  });

  test('exactly one core SDK; remainder are adapter aliases', () => {
    const cores = PACKAGES.filter((p) => p.category === 'core');
    expect(cores).toHaveLength(1);
    expect(cores[0].name).toBe(SDK.name);
  });

  test('broker adapter floor meets minimum (SDK-04)', () => {
    expect(SDK.brokerAdapterCount).toBeGreaterThanOrEqual(SOVEREIGN_THRESHOLDS.minBrokerAdapters);
  });
});

describe('Sovereign Threshold #3 — resolution rule', () => {
  test('every NUMBERS_SNAPSHOT row carries a NUMBERS-PACK row ID', () => {
    expect(NUMBERS_SNAPSHOT.length).toBeGreaterThan(0);
    for (const row of NUMBERS_SNAPSHOT) {
      expect(
        SOVEREIGN_THRESHOLDS.numbersPackIdPattern.test(row.numbersPackRowId),
        `Row "${row.label}" has malformed NUMBERS-PACK ID: "${row.numbersPackRowId}"`,
      ).toBe(true);
    }
  });

  test('every NUMBERS_SNAPSHOT row has a non-empty asOf date in YYYY-MM-DD form', () => {
    const dateShape = /^\d{4}-\d{2}-\d{2}$/;
    for (const row of NUMBERS_SNAPSHOT) {
      expect(
        dateShape.test(row.asOf),
        `Row "${row.label}" has malformed asOf: "${row.asOf}"`,
      ).toBe(true);
    }
  });

  test('row IDs are unique', () => {
    const ids = NUMBERS_SNAPSHOT.map((r) => r.numbersPackRowId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Sovereign Threshold #4 — recency rule (the discipline trigger)', () => {
  test('LAST_HUMAN_VERIFIED parses to a real date', () => {
    const parsed = new Date(LAST_HUMAN_VERIFIED);
    expect(Number.isNaN(parsed.getTime())).toBe(false);
  });

  test('LAST_HUMAN_VERIFIED is within SOVEREIGN_THRESHOLDS.maxAgeDays', () => {
    const verified = new Date(LAST_HUMAN_VERIFIED);
    const now = new Date();
    const ageDays = Math.floor((now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24));
    expect(
      ageDays,
      `LAST_HUMAN_VERIFIED (${LAST_HUMAN_VERIFIED}) is ${ageDays} days old. Refresh lib/canonical-claims.ts before any production build.`,
    ).toBeLessThanOrEqual(SOVEREIGN_THRESHOLDS.maxAgeDays);
  });

  test('LAST_HUMAN_VERIFIED is not in the future (typo guard)', () => {
    const verified = new Date(LAST_HUMAN_VERIFIED);
    const now = new Date();
    expect(verified.getTime()).toBeLessThanOrEqual(now.getTime() + 24 * 60 * 60 * 1000);
  });
});
