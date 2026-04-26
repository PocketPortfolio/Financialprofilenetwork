/**
 * tests/unit/moat-claims.spec.ts
 *
 * Phase 2 · Day-0.5 companion: enforces evidenceRefs file-existence for every
 * MOAT_CLAIMS entry. If a moat claim's evidence ref is deleted or renamed
 * without updating the SSOT, this test fails — preventing off-platform copy
 * (LinkedIn, GitHub, npm) from making technical claims that no longer
 * resolve to in-repo evidence.
 *
 * Authorised by Unified Command 2026-04-26 (Phase 2 charter ratification).
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

import { LAST_HUMAN_VERIFIED, MOAT_CLAIMS } from '../../lib/canonical-claims';

const REPO_ROOT = resolve(__dirname, '..', '..');

const moatEntries = Object.entries(MOAT_CLAIMS);

describe('MOAT_CLAIMS · phrase shape', () => {
  test.each(moatEntries)('%s has a non-empty phrase', (key, claim) => {
    expect(claim.phrase.length).toBeGreaterThan(3);
  });

  test.each(moatEntries)('%s has a non-empty longForm', (key, claim) => {
    expect(claim.longForm.length).toBeGreaterThan(20);
  });

  test.each(moatEntries)('%s phrase appears verbatim in longForm (case-insensitive)', (key, claim) => {
    expect(
      claim.longForm.toLowerCase().includes(claim.phrase.toLowerCase()),
      `MoatClaim "${key}": phrase "${claim.phrase}" must appear in longForm.`,
    ).toBe(true);
  });

  test.each(moatEntries)('%s asOf is within recency window', (key, claim) => {
    expect(claim.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(claim.asOf <= LAST_HUMAN_VERIFIED).toBe(true);
  });

  test.each(moatEntries)('%s has at least one authorised surface', (key, claim) => {
    expect(claim.authorisedSurfaces.length).toBeGreaterThanOrEqual(1);
  });
});

describe('MOAT_CLAIMS · evidenceRefs resolve to in-repo paths', () => {
  test.each(moatEntries)('%s evidenceRefs all exist on disk', (key, claim) => {
    expect(claim.evidenceRefs.length).toBeGreaterThanOrEqual(1);
    for (const ref of claim.evidenceRefs) {
      const fullPath = resolve(REPO_ROOT, ref);
      expect(
        existsSync(fullPath),
        `MoatClaim "${key}": evidenceRef "${ref}" does not exist (expected ${fullPath}). Either restore the file or remove the ref from MOAT_CLAIMS.`,
      ).toBe(true);
    }
  });
});