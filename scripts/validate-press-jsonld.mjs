#!/usr/bin/env node
/**
 * scripts/validate-press-jsonld.mjs
 *
 * Boots Next, fetches /press, extracts every <script type="application/ld+json">
 * block, and validates each one for:
 *   - Valid JSON
 *   - @context === "https://schema.org"
 *   - @type present and one of: Organization, Person, SoftwareApplication, Article (or array of those)
 *
 * Used by .github/workflows/seo-validation.yml. Exits non-zero on any failure.
 */

import { setTimeout as sleep } from 'node:timers/promises';

const PRESS_URL = process.env.PRESS_URL || 'http://localhost:3001/press';
const ALLOWED_TYPES = new Set(['Organization', 'Person', 'SoftwareApplication', 'Article']);

async function main() {
  let lastErr;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const res = await fetch(PRESS_URL);
      if (res.ok) {
        const html = await res.text();
        return validate(html);
      }
      lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
    } catch (err) {
      lastErr = err;
    }
    await sleep(1000);
  }
  throw new Error(`Could not reach ${PRESS_URL} after 30s: ${lastErr?.message ?? lastErr}`);
}

function validate(html) {
  const blockRe =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g;
  const blocks = [];
  let match;
  while ((match = blockRe.exec(html)) !== null) {
    blocks.push(match[1]);
  }

  if (blocks.length === 0) {
    throw new Error('FAIL: /press has zero application/ld+json blocks.');
  }

  const failures = [];
  let totalEntities = 0;

  blocks.forEach((raw, idx) => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      failures.push(`Block #${idx + 1}: invalid JSON — ${err.message}`);
      return;
    }
    const docs = Array.isArray(parsed) ? parsed : [parsed];
    docs.forEach((doc, j) => {
      const path = `Block #${idx + 1}${docs.length > 1 ? `[${j}]` : ''}`;
      if (doc['@context'] !== 'https://schema.org') {
        failures.push(`${path}: @context !== https://schema.org (got ${JSON.stringify(doc['@context'])})`);
      }
      if (!doc['@type']) {
        failures.push(`${path}: missing @type`);
      } else if (!ALLOWED_TYPES.has(doc['@type'])) {
        failures.push(`${path}: @type "${doc['@type']}" is not in the canonical set ${[...ALLOWED_TYPES].join(', ')}`);
      }
      totalEntities += 1;
    });
  });

  if (failures.length > 0) {
    console.error('JSON-LD validation FAILED:');
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }

  console.log(
    `JSON-LD validation OK: ${blocks.length} block(s), ${totalEntities} schema.org entit${totalEntities === 1 ? 'y' : 'ies'} on /press.`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
