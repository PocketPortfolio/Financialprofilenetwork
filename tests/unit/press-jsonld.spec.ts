/**
 * tests/unit/press-jsonld.spec.ts
 *
 * Smoke-tests for the JSON-LD builders that render on /press. We intentionally
 * unit-test the builders rather than the React tree because:
 *   - Server components can't be cleanly rendered under jsdom.
 *   - The CI press-jsonld job does an end-to-end fetch separately.
 *
 * What this spec defends:
 *   - Required Schema.org fields are present on every block.
 *   - Snapshot-vs-live discipline: InteractionCounter ONLY appears when the
 *     signal is genuinely live, so answer engines never quote a frozen
 *     fallback as a verified live count.
 *   - Breadcrumb and WebPage shapes are well-formed (no orphaned nodes).
 */

import { describe, expect, test } from 'vitest';

import {
  buildOrganizationLd,
  buildPersonLd,
  buildSoftwareApplicationLd,
  buildArticlesLd,
  buildWebPageLd,
  buildBreadcrumbLd,
} from '../../app/press/jsonld';
import { ORG, PACKAGES, POSITIONING } from '../../lib/canonical-claims';

const liveSignal = { totalDownloads: 9389, lastUpdated: '2026-04-20', source: 'live' as const };
const snapshotSignal = {
  totalDownloads: 9389,
  lastUpdated: '2026-04-20',
  source: 'snapshot' as const,
};

describe('Organization JSON-LD', () => {
  test('has required Schema.org fields', () => {
    const ld = buildOrganizationLd(liveSignal);
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Organization');
    expect(ld.name).toBe(ORG.name);
    expect(ld.url).toBe(ORG.url);
    expect(ld.logo).toBe(ORG.logo);
    expect(ld.foundingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('exposes both primary and secondary positioning', () => {
    const ld = buildOrganizationLd(liveSignal);
    expect(ld.slogan).toBe(POSITIONING.primary);
    expect(ld.alternateName).toBe(POSITIONING.secondary);
  });

  test('emits InteractionCounter ONLY when source is live', () => {
    const liveLd = buildOrganizationLd(liveSignal);
    const snapshotLd = buildOrganizationLd(snapshotSignal);
    expect(liveLd).toHaveProperty('interactionStatistic');
    expect(snapshotLd).not.toHaveProperty('interactionStatistic');
  });

  test('InteractionCounter is dated and typed correctly', () => {
    const ld = buildOrganizationLd(liveSignal);
    const counter = (ld as { interactionStatistic?: Record<string, unknown> }).interactionStatistic;
    expect(counter).toBeDefined();
    expect(counter?.['@type']).toBe('InteractionCounter');
    expect(counter?.userInteractionCount).toBe(liveSignal.totalDownloads);
    expect(counter?.observationDate).toBe(liveSignal.lastUpdated);
  });
});

describe('Person JSON-LD', () => {
  test('alumniOf entries carry both name and url', () => {
    const ld = buildPersonLd();
    expect(Array.isArray(ld.alumniOf)).toBe(true);
    for (const entry of ld.alumniOf) {
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('url');
      expect(String(entry.url)).toMatch(/^https?:\/\//);
    }
  });

  test('worksFor references the Organization @id (no orphan nodes)', () => {
    const ld = buildPersonLd();
    expect(ld.worksFor['@id']).toBe(`${ORG.url}#organization`);
  });
});

describe('SoftwareApplication[] JSON-LD', () => {
  test('one entry per canonical package', () => {
    const ld = buildSoftwareApplicationLd();
    expect(ld).toHaveLength(PACKAGES.length);
  });

  test('every entry has @type SoftwareApplication and a SPDX-style license URL', () => {
    const ld = buildSoftwareApplicationLd();
    for (const entry of ld) {
      expect(entry['@type']).toBe('SoftwareApplication');
      expect(entry.license).toMatch(/^https:\/\/opensource\.org\/licenses\//);
    }
  });
});

describe('Article[] JSON-LD', () => {
  test('every article has headline, url, and datePublished', () => {
    const ld = buildArticlesLd();
    expect(ld.length).toBeGreaterThan(0);
    for (const entry of ld) {
      expect(entry.headline.length).toBeGreaterThan(0);
      expect(entry.url).toMatch(/^https:\/\//);
      expect(entry.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('WebPage JSON-LD', () => {
  test('has dateModified and lastReviewed signals', () => {
    const ld = buildWebPageLd({
      dateModified: '2026-04-26',
      lastHumanVerified: '2026-04-26',
    });
    expect(ld['@type']).toBe('WebPage');
    expect(ld.dateModified).toBe('2026-04-26');
    expect(ld.lastReviewed).toBe('2026-04-26');
    expect(ld.isPartOf['@type']).toBe('WebSite');
  });
});

describe('BreadcrumbList JSON-LD', () => {
  test('positions are 1-indexed and contiguous', () => {
    const ld = buildBreadcrumbLd();
    expect(ld['@type']).toBe('BreadcrumbList');
    const positions = ld.itemListElement.map((i) => i.position);
    expect(positions).toEqual(positions.map((_, idx) => idx + 1));
  });

  test('terminal item points at /press, not the home origin', () => {
    const ld = buildBreadcrumbLd();
    const last = ld.itemListElement[ld.itemListElement.length - 1];
    expect(last.item).toMatch(/\/press$/);
  });
});
