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
  BOARD_OF_INVESTORS,
  DESIGN_CHALLENGE,
  LAST_HUMAN_VERIFIED,
  NUMBERS_SNAPSHOT,
  OPEN_ALIAS_ROUTES,
  OPEN_CANONICAL_HOST,
  OPEN_HOSTS,
  OPEN_URLS,
  PACKAGES,
  POSITIONING,
  SDK,
  SOVEREIGN_THRESHOLDS,
  SURFACE_ORG,
  SURFACE_POSITIONING,
  TAGLINE_LONG,
  TIER1_DESIGN_PARTNER,
  URLS,
  getSurfaceOrg,
  getSurfacePositioning,
} from '../../lib/canonical-claims';
import { ADAPTERS } from '@/src/import/registry';

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

describe('Design Partnership Challenge SSOT', () => {
  test('SDK.brokerAdapterCount stays pinned to ADAPTERS.length (drift guard)', () => {
    expect(
      SDK.brokerAdapterCount,
      `SDK.brokerAdapterCount (${SDK.brokerAdapterCount}) must equal ADAPTERS.length (${ADAPTERS.length}). Update lib/canonical-claims.ts when registry changes.`,
    ).toBe(ADAPTERS.length);
  });

  test('DESIGN_CHALLENGE.url matches URLS.designChallenge', () => {
    expect(DESIGN_CHALLENGE.url).toBe(URLS.designChallenge);
  });

  test('DESIGN_CHALLENGE.path is /designchallenge and url ends with it', () => {
    expect(DESIGN_CHALLENGE.path).toBe('/designchallenge');
    expect(DESIGN_CHALLENGE.url.endsWith('/designchallenge')).toBe(true);
  });

  test('DESIGN_CHALLENGE.footerCommunityLabel is set for GlobalFooter / marketing footers', () => {
    expect(typeof DESIGN_CHALLENGE.footerCommunityLabel).toBe('string');
    expect(DESIGN_CHALLENGE.footerCommunityLabel.length).toBeGreaterThan(0);
  });

  test('GitHub submission thread is a discussion URL', () => {
    expect(DESIGN_CHALLENGE.github.submissionThread).toMatch(
      /^https:\/\/github\.com\/PocketPortfolio\/Financialprofilenetwork\/discussions\/\d+$/,
    );
  });

  test('CoderLegion link points at the openfi-builders group', () => {
    expect(DESIGN_CHALLENGE.coderLegionGroup).toBe(
      'https://coderlegion.com/groups/openfi-builders',
    );
  });

  test('exactly four v1 verticals are surfaced (Healthcare, Defense, Finance, Energy)', () => {
    const ids = DESIGN_CHALLENGE.verticals.map((v) => v.id);
    expect(ids).toEqual(['healthcare', 'defense', 'finance', 'energy']);
  });

  test('OG image is the static sovereign-green hero card mirrored into /public/og', () => {
    expect(DESIGN_CHALLENGE.ogImage).toBe('/og/designchallenge.png');
    expect(DESIGN_CHALLENGE.ogImageWidth).toBe(1200);
    expect(DESIGN_CHALLENGE.ogImageHeight).toBe(627);
  });
});

describe('Institutional Funnel SSOT (Tier 1 + BIP)', () => {
  test('TIER1_DESIGN_PARTNER url matches URLS.tier1DesignPartner and path is stable', () => {
    expect(TIER1_DESIGN_PARTNER.path).toBe('/tier1designpartner');
    expect(TIER1_DESIGN_PARTNER.url).toBe(URLS.tier1DesignPartner);
    expect(TIER1_DESIGN_PARTNER.url.endsWith(TIER1_DESIGN_PARTNER.path)).toBe(true);
  });

  test('BOARD_OF_INVESTORS url matches URLS.boardOfInvestors and path is stable', () => {
    expect(BOARD_OF_INVESTORS.path).toBe('/board-of-investors');
    expect(BOARD_OF_INVESTORS.url).toBe(URLS.boardOfInvestors);
    expect(BOARD_OF_INVESTORS.url.endsWith(BOARD_OF_INVESTORS.path)).toBe(true);
  });

  test('BIP scarcity rule: maxSeats is pinned to 5', () => {
    expect(BOARD_OF_INVESTORS.maxSeats).toBe(5);
  });
});

describe('Dual-Surface Bifurcation SSOT (CEO mandate 2026-05-15)', () => {
  test('SURFACE_POSITIONING covers both pocket and open surfaces with distinct primaries', () => {
    expect(SURFACE_POSITIONING.pocket.primary.length).toBeGreaterThan(8);
    expect(SURFACE_POSITIONING.open.primary.length).toBeGreaterThan(8);
    expect(SURFACE_POSITIONING.pocket.primary).not.toBe(SURFACE_POSITIONING.open.primary);
  });

  test('SURFACE_POSITIONING.open.primary echoes the canonical POSITIONING.primary', () => {
    expect(SURFACE_POSITIONING.open.primary).toBe(POSITIONING.primary);
  });

  test('SURFACE_ORG carries distinct names and URLs per surface', () => {
    expect(SURFACE_ORG.pocket.name).toBe('Pocket Portfolio');
    expect(SURFACE_ORG.open.name).toBe('Open Portfolio');
    expect(SURFACE_ORG.pocket.url).toMatch(/pocketportfolio\.app$/);
    expect(SURFACE_ORG.open.url).toMatch(/openportfolio\.co\.uk$/);
  });

  test('SURFACE_ORG.pocket.url is identical to URLS.home (back-compat invariant)', () => {
    expect(SURFACE_ORG.pocket.url).toBe(URLS.home);
  });

  test('OPEN_CANONICAL_HOST is the apex www.openportfolio.co.uk', () => {
    expect(OPEN_CANONICAL_HOST).toBe('www.openportfolio.co.uk');
  });

  test('OPEN_HOSTS includes both .co.uk and the parked .uk variants', () => {
    expect(OPEN_HOSTS).toContain('openportfolio.co.uk');
    expect(OPEN_HOSTS).toContain('www.openportfolio.co.uk');
    expect(OPEN_HOSTS).toContain('openportfolio.uk');
    expect(OPEN_HOSTS).toContain('www.openportfolio.uk');
  });

  test('OPEN_HOSTS contains the canonical host', () => {
    expect((OPEN_HOSTS as readonly string[]).includes(OPEN_CANONICAL_HOST)).toBe(true);
  });

  test('every OPEN_URLS entry points at the openportfolio.co.uk canonical host', () => {
    for (const [key, value] of Object.entries(OPEN_URLS)) {
      expect(value, `OPEN_URLS.${key} must point at openportfolio.co.uk`).toMatch(
        /^https:\/\/www\.openportfolio\.co\.uk(\/|$)/,
      );
    }
  });

  test('OPEN_ALIAS_ROUTES lists exactly the 21 B2B surfaces (CEO mandate + performance dossier)', () => {
    expect(OPEN_ALIAS_ROUTES).toHaveLength(21);
    const paths = OPEN_ALIAS_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  test('every OPEN_ALIAS_ROUTES openUrl ends with the route path', () => {
    for (const route of OPEN_ALIAS_ROUTES) {
      expect(route.openUrl.endsWith(route.path)).toBe(true);
      expect(route.openUrl.startsWith('https://www.openportfolio.co.uk')).toBe(true);
    }
  });

  test('OPEN_ALIAS_ROUTES include the architectural anchors (architecture, designchallenge, BIP)', () => {
    const paths = OPEN_ALIAS_ROUTES.map((r) => r.path);
    expect(paths).toContain('/architecture');
    expect(paths).toContain('/designchallenge');
    expect(paths).toContain('/tier1designpartner');
    expect(paths).toContain('/board-of-investors');
  });

  test('helpers return the correct surface block', () => {
    expect(getSurfaceOrg('pocket').name).toBe('Pocket Portfolio');
    expect(getSurfaceOrg('open').name).toBe('Open Portfolio');
    expect(getSurfacePositioning('pocket').primary).toBe(SURFACE_POSITIONING.pocket.primary);
    expect(getSurfacePositioning('open').primary).toBe(POSITIONING.primary);
  });
});
