/**
 * tests/unit/sameAs-shape.spec.ts
 *
 * Phase 2 · Pillar B-2: shape invariants on every URL declared in
 * ORG.sameAs and PERSON_ABBA.sameAs. These run on every PR — failure
 * blocks merge.
 *
 * Invariants enforced:
 *   - Each URL is HTTPS (no http://).
 *   - Each URL is well-formed (URL constructor doesn't throw).
 *   - No leading/trailing whitespace.
 *   - Host belongs to the approved domain set (Sovereign Identity Surfaces).
 *   - No duplicate URLs within or across the two arrays.
 *
 * The reciprocity probe (B-1) is a separate, network-bound CI job.
 */

import { describe, expect, test } from 'vitest';

import { ORG, PERSON_ABBA } from '../../lib/canonical-claims';

/**
 * Domains authorised as Sovereign Identity Surfaces. Adding a new domain here
 * is a deliberate Command-level decision (it expands the off-platform
 * authority graph), not a casual edit.
 */
const APPROVED_HOSTS = new Set<string>([
  'github.com',
  'www.npmjs.com',
  'www.linkedin.com',
  'coderlegion.com',
  'dev.to',
]);

const allUrls: ReadonlyArray<{ url: string; owner: 'ORG' | 'PERSON_ABBA' }> = [
  ...ORG.sameAs.map((u) => ({ url: u, owner: 'ORG' as const })),
  ...PERSON_ABBA.sameAs.map((u) => ({ url: u, owner: 'PERSON_ABBA' as const })),
];

describe('Pillar B-2 · sameAs URL shape invariants', () => {
  test.each(allUrls)('$url ($owner): is HTTPS', ({ url }) => {
    expect(url.startsWith('https://'), `URL must use HTTPS: ${url}`).toBe(true);
  });

  test.each(allUrls)('$url ($owner): well-formed', ({ url }) => {
    expect(() => new URL(url)).not.toThrow();
  });

  test.each(allUrls)('$url ($owner): no surrounding whitespace', ({ url }) => {
    expect(url).toBe(url.trim());
  });

  test.each(allUrls)('$url ($owner): host is in approved domain set', ({ url }) => {
    const host = new URL(url).host;
    expect(
      APPROVED_HOSTS.has(host),
      `Host "${host}" is not in APPROVED_HOSTS. Update tests/unit/sameAs-shape.spec.ts deliberately.`,
    ).toBe(true);
  });

  test('no duplicate URLs across ORG.sameAs', () => {
    const set = new Set(ORG.sameAs);
    expect(set.size).toBe(ORG.sameAs.length);
  });

  test('no duplicate URLs across PERSON_ABBA.sameAs', () => {
    const set = new Set(PERSON_ABBA.sameAs);
    expect(set.size).toBe(PERSON_ABBA.sameAs.length);
  });

  test('ORG.sameAs has at least 4 sovereign surfaces', () => {
    expect(ORG.sameAs.length).toBeGreaterThanOrEqual(4);
  });

  test('PERSON_ABBA.sameAs has at least 2 sovereign surfaces', () => {
    expect(PERSON_ABBA.sameAs.length).toBeGreaterThanOrEqual(2);
  });
});