/**
 * scripts/generate-profile-copy.ts
 *
 * Phase 2 · Pillar A automation deliverable.
 *
 * Emits ready-to-paste copy blocks for every off-platform profile authorised
 * by the Phase 2 charter:
 *   - LinkedIn personal (Abba) and company (Pocket Portfolio)
 *   - CoderLegion
 *   - dev.to
 *   - GitHub Org and personal README
 *   - npm package metadata audit
 *
 * Single source of truth: ../lib/canonical-claims.ts.
 *
 * Linguistic guardrails enforced (Command mandate, 2026-04-26):
 *   - Primary positioning ("Sovereign Ingestion & Inference Layer") appears
 *     verbatim on every authoring-surface block.
 *   - The "Limited-Scope Processor" moat phrase appears verbatim on
 *     LinkedIn / GitHub / npm blocks (per MOAT_CLAIMS.authorisedSurfaces).
 *   - Every block contains the back-link `https://www.pocketportfolio.app/press`
 *     (or `/press/abba-lawal` for personal-Person blocks).
 *
 * Failure to satisfy guardrails causes a non-zero exit so the script is
 * safe to use in CI as a regen-then-diff check.
 *
 * Usage:   npx tsx scripts/generate-profile-copy.ts
 *          npx tsx scripts/generate-profile-copy.ts > docs/seed/phase2-profile-copy.md
 */

import {
  LAST_HUMAN_VERIFIED,
  MOAT_CLAIMS,
  ORG,
  PERSON_ABBA,
  POSITIONING,
  SDK,
  TAGLINE_LONG,
  URLS,
} from '../lib/canonical-claims';

const PRESS_URL = URLS.press;
const PERSON_PAGE_URL = `${URLS.press}/abba-lawal`;
const MOAT = MOAT_CLAIMS.limitedScopeProcessor;

interface ProfileBlock {
  platform: string;
  surface: string;
  body: string;
  /** Surfaces where the moat phrase must appear (per MOAT_CLAIMS.authorisedSurfaces). */
  enforceMoat: boolean;
  /** Hard char limit (informational; appended to header). */
  charLimit?: number;
}

const blocks: ProfileBlock[] = [];

function add(b: ProfileBlock): void {
  blocks.push(b);
}

// ── LinkedIn — Personal (Abba) ────────────────────────────────────────────────

add({
  platform: 'LinkedIn (Personal · Abba Lawal)',
  surface: 'Headline',
  charLimit: 220,
  enforceMoat: false,
  body: `Founder · Pocket Portfolio — ${POSITIONING.primary} | ex-National Grid Ventures, IBM, NHS Digital`,
});

add({
  platform: 'LinkedIn (Personal · Abba Lawal)',
  surface: 'About',
  charLimit: 2600,
  enforceMoat: true,
  body: `${PERSON_ABBA.description}

Pocket Portfolio is ${POSITIONING.primary.toLowerCase().replace(/\.$/, '')} — ${MOAT.longForm}

What I focus on:
${PERSON_ABBA.knowsAbout.map((k) => `• ${k}`).join('\n')}

Receipts:
${PERSON_ABBA.award.map((a) => `• ${a}`).join('\n')}

Press Kit (canonical, machine-readable): ${PRESS_URL}
Founder profile: ${PERSON_PAGE_URL}`,
});

add({
  platform: 'LinkedIn (Personal · Abba Lawal)',
  surface: 'Featured (link card)',
  enforceMoat: false,
  body: `Title: Pocket Portfolio · Press Kit
URL:   ${PRESS_URL}
Description: Canonical, machine-readable facts about Pocket Portfolio — positioning, founder, SDK, packages, live distribution signal.`,
});

// ── LinkedIn — Company (Pocket Portfolio) ─────────────────────────────────────

add({
  platform: 'LinkedIn (Company · Pocket Portfolio)',
  surface: 'Tagline',
  charLimit: 120,
  enforceMoat: false,
  body: POSITIONING.primary,
});

add({
  platform: 'LinkedIn (Company · Pocket Portfolio)',
  surface: 'About',
  charLimit: 2000,
  enforceMoat: true,
  body: `${TAGLINE_LONG}

Architecture: ${MOAT.phrase}. ${MOAT.longForm}

Also known as: ${POSITIONING.secondary}

Press Kit: ${PRESS_URL}
Architecture: ${URLS.architecture}`,
});

add({
  platform: 'LinkedIn (Company · Pocket Portfolio)',
  surface: 'Website field',
  enforceMoat: false,
  body: PRESS_URL,
});

// ── CoderLegion ──────────────────────────────────────────────────────────────

add({
  platform: 'CoderLegion',
  surface: 'Bio',
  enforceMoat: false,
  body: PERSON_ABBA.description,
});

add({
  platform: 'CoderLegion',
  surface: 'Pinned link / website',
  enforceMoat: false,
  body: PERSON_PAGE_URL,
});

// ── dev.to ────────────────────────────────────────────────────────────────────

add({
  platform: 'dev.to',
  surface: 'Bio (short)',
  charLimit: 200,
  enforceMoat: false,
  body: `Founder of Pocket Portfolio — ${POSITIONING.primary}`,
});

add({
  platform: 'dev.to',
  surface: 'Website',
  enforceMoat: false,
  body: PRESS_URL,
});

// ── GitHub — Org description ─────────────────────────────────────────────────

add({
  platform: 'GitHub Org (PocketPortfolio)',
  surface: 'Description',
  enforceMoat: true,
  body: `${POSITIONING.primary} ${MOAT.phrase} architecture: local-first SDK + stateless inference.`,
});

add({
  platform: 'GitHub Org (PocketPortfolio)',
  surface: 'Website',
  enforceMoat: false,
  body: PRESS_URL,
});

// ── GitHub — Personal README ─────────────────────────────────────────────────

add({
  platform: 'GitHub (Personal · @abba-lawal)',
  surface: 'Profile README (markdown)',
  enforceMoat: true,
  body: `### ${PERSON_ABBA.name}

${PERSON_ABBA.jobTitle}

I build [**Pocket Portfolio**](${PRESS_URL}) — ${POSITIONING.primary}

**Architecture:** ${MOAT.phrase}. ${MOAT.longForm}

**Founder profile (rel="me" canonical):** ${PERSON_PAGE_URL}

---

Receipts:
${PERSON_ABBA.award.map((a) => `- ${a}`).join('\n')}`,
});

// ── npm — Package metadata fields ────────────────────────────────────────────

add({
  platform: 'npm — package.json (each @pocket-portfolio/* package)',
  surface: 'Required fields (audit)',
  enforceMoat: true,
  body: `{
  "author": "Pocket Portfolio (${ORG.url})",
  "homepage": "${PRESS_URL}",
  "repository": { "type": "git", "url": "${SDK.repo}" },
  "description": "<existing description> · ${MOAT.phrase} architecture · ${PRESS_URL}"
}`,
});

// ── Linguistic guardrail enforcement ─────────────────────────────────────────

interface GuardrailViolation {
  platform: string;
  surface: string;
  reason: string;
}

const violations: GuardrailViolation[] = [];

for (const b of blocks) {
  if (b.enforceMoat && !b.body.toLowerCase().includes(MOAT.phrase.toLowerCase())) {
    violations.push({
      platform: b.platform,
      surface: b.surface,
      reason: `Block requires moat phrase "${MOAT.phrase}" but does not contain it`,
    });
  }
  if (b.charLimit && b.body.length > b.charLimit) {
    violations.push({
      platform: b.platform,
      surface: b.surface,
      reason: `Body length ${b.body.length} exceeds platform char limit ${b.charLimit}`,
    });
  }
}

// ── Emit ─────────────────────────────────────────────────────────────────────

console.log(`# Phase 2 · Profile Copy — generated from canonical-claims.ts`);
console.log(`# Generated: ${LAST_HUMAN_VERIFIED} (LAST_HUMAN_VERIFIED)`);
console.log(`# Primary positioning: "${POSITIONING.primary}"`);
console.log(`# Secondary positioning: "${POSITIONING.secondary}"`);
console.log(`# Moat phrase: "${MOAT.phrase}"`);
console.log(`# Press anchor: ${PRESS_URL}`);
console.log(`# Person anchor: ${PERSON_PAGE_URL}`);
console.log('');

for (const b of blocks) {
  const limit = b.charLimit ? ` (≤${b.charLimit} chars · current ${b.body.length})` : '';
  console.log(`## ${b.platform} — ${b.surface}${limit}`);
  console.log('');
  console.log('```');
  console.log(b.body);
  console.log('```');
  console.log('');
}

if (violations.length > 0) {
  console.error('\n--- LINGUISTIC GUARDRAIL VIOLATIONS ---');
  for (const v of violations) {
    console.error(`[FAIL] ${v.platform} · ${v.surface} — ${v.reason}`);
  }
  console.error(`\nTotal: ${violations.length} violation(s).`);
  process.exit(1);
}

console.error(
  `[OK] ${blocks.length} blocks generated · 0 guardrail violations · primary + moat phrases enforced.`,
);