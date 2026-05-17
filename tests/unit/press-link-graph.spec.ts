/**
 * tests/unit/press-link-graph.spec.ts
 *
 * Authority-graph invariant for Phase 2 (Pillar C-1).
 *
 * The /press kit MUST link out to the dedicated founder Person page
 * (/press/abba-lawal). Without that edge, the Person page is an orphan node:
 * Googlebot, GPTBot, and PerplexityBot have no internal path to discover it,
 * so it accrues neither crawl budget nor authority transfer from the press
 * kit's existing inbound links.
 *
 * This spec defends the edge at the source level (a static read of
 * app/press/page.tsx) so it survives any refactor that doesn't touch the
 * page's HTML output explicitly.
 *
 * Why a source-level test rather than a rendered-DOM test:
 *   - /press is a server component with async data-fetching that's awkward
 *     to render under jsdom.
 *   - The CI seo-smoke e2e job covers the live render against a deployed
 *     environment; this unit test catches the regression earlier (before CI
 *     spins up a browser) and runs in milliseconds.
 */

import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { URLS } from '../../lib/canonical-claims';

const PRESS_PAGE_SOURCE = readFileSync(
  resolve(__dirname, '../../app/press/page.tsx'),
  'utf8',
);

const ABBA_PAGE_SOURCE = readFileSync(
  resolve(__dirname, '../../app/press/abba-lawal/page.tsx'),
  'utf8',
);

describe('/press -> /press/abba-lawal link graph', () => {
  test('SSOT exposes a canonical URL constant for the founder page', () => {
    expect(URLS.personAbba).toBe('https://www.pocketportfolio.app/press/abba-lawal');
  });

  test('/press source contains at least one href to /press/abba-lawal', () => {
    const matches = PRESS_PAGE_SOURCE.match(/href="\/press\/abba-lawal"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  test('/press source links the founder name AND has an explicit "full profile" CTA', () => {
    // Entity-name anchor = strongest SEO signal (descriptive text == person);
    // action CTA = strongest human-navigation signal. Both must exist.
    const linkCount = (PRESS_PAGE_SOURCE.match(/href="\/press\/abba-lawal"/g) ?? []).length;
    expect(linkCount).toBeGreaterThanOrEqual(2);
    expect(PRESS_PAGE_SOURCE).toMatch(/Read full founder profile/i);
  });

  test('/press source includes /press/abba-lawal in the canonical references list', () => {
    // The "Canonical references" section is the structured outbound-link
    // surface that crawlers parse; the founder page must appear there
    // alongside /architecture, /llms.txt, and the npm/GitHub URLs.
    expect(PRESS_PAGE_SOURCE).toMatch(/Founder profile:/);
  });
});

describe('/press/abba-lawal entity wiring', () => {
  test('Person page derives PAGE_URL from the SSOT (no hardcoded slug)', () => {
    // Slug duplication is a refactor hazard. PAGE_URL must be sourced from
    // URLS.personAbba; literal occurrences are tolerated only for the
    // metadata path and the file-header comment.
    expect(ABBA_PAGE_SOURCE).toMatch(/const\s+PAGE_URL\s*=\s*URLS\.personAbba\b/);
    const literalSlug = (ABBA_PAGE_SOURCE.match(/\/press\/abba-lawal/g) ?? []).length;
    expect(literalSlug).toBeLessThanOrEqual(3);
  });
});