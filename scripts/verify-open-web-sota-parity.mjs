#!/usr/bin/env node
/**
 * Gate: Operation SOTA Parity — verify landing plates + SSOT before deploy.
 * SSOT: docs/seed/open-portfolio-web-sota-brief.md
 *
 * Run: npm run verify:open-web-sota
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VISUALS_TS = path.join(ROOT, 'lib', 'open-landing-visuals.ts');
const PLATES_DIR = path.join(ROOT, 'public', 'open', 'landing', 'plates');
const MANIFEST = path.join(PLATES_DIR, 'manifest.json');
const OLV = path.join(ROOT, 'app', 'open', '_components', 'OpenLandingVisual.tsx');
const LEGACY_FORBIDDEN = [
  'hero-sovereign-layer.png',
  'privacy-architecture.png',
  'regulatory-stakes.png',
  'BriefingRoomFace',
  'HeroDataGravityBlock',
  'srcSvg',
];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}

function pass(msg) {
  console.log(`OK: ${msg}`);
}

function main() {
  let ok = true;
  const markFail = (msg) => {
    ok = false;
    fail(msg);
  };

  if (!fs.existsSync(VISUALS_TS)) {
    markFail('missing lib/open-landing-visuals.ts');
    process.exit(1);
  }

  const visualsSrc = fs.readFileSync(VISUALS_TS, 'utf8');
  const olvSrc = fs.readFileSync(OLV, 'utf8');

  for (const token of LEGACY_FORBIDDEN) {
    if (visualsSrc.includes(token) || olvSrc.includes(token)) {
      markFail(`legacy visual debt still referenced: ${token}`);
    }
  }

  const platePaths = [
    ...visualsSrc.matchAll(/plateSrc\('([a-z0-9-]+\.png)'\)/g),
    ...visualsSrc.matchAll(/\$\{PLATES\}\/([a-z0-9-]+\.png)/g),
    ...visualsSrc.matchAll(/\/open\/landing\/plates\/([a-z0-9-]+\.png)/g),
  ].map((m) => m[1]);
  const uniquePaths = [...new Set(platePaths)];

  if (uniquePaths.length < 8) {
    markFail(`expected 8 distinct plate paths in SSOT, found ${uniquePaths.length}`);
  }

  for (const file of uniquePaths) {
    const abs = path.join(PLATES_DIR, file);
    if (!fs.existsSync(abs)) {
      markFail(`missing plate: public/open/landing/plates/${file}`);
    } else if (fs.statSync(abs).size < 100_000) {
      markFail(`plate too small (corrupt?): ${file}`);
    } else {
      pass(`plate exists: ${file}`);
    }
  }

  if (!visualsSrc.includes("overlay: 'exposure'") || !visualsSrc.includes("overlay: 'moat'")) {
    markFail('threat/subHero HTML overlays not configured in SSOT');
  } else {
    pass('exposure + moat overlays configured');
  }

  if (!fs.existsSync(MANIFEST)) {
    markFail('missing plates/manifest.json — run npm run sync:open-web-plates');
  } else {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    if (!Array.isArray(manifest.plates) || manifest.plates.length < 8) {
      markFail('manifest incomplete');
    } else {
      pass(`manifest: ${manifest.plates.length} plates synced at ${manifest.syncedAt}`);
    }

    const bySrc = new Map();
    for (const p of manifest.plates) {
      const list = bySrc.get(p.src) ?? [];
      list.push(p.dest);
      bySrc.set(p.src, list);
    }
    for (const [src, dests] of bySrc) {
      if (dests.length > 1) {
        pass(`shared deck source ${src} → ${dests.length} unique baked outputs`);
      }
    }

    const hashes = manifest.plates?.map((p) => p.hash) ?? [];
    const uniqueHashes = new Set(hashes);
    if (hashes.length >= 8 && uniqueHashes.size < hashes.length) {
      markFail('duplicate plate hashes in manifest — re-run sync with baked crops');
    } else if (hashes.length >= 8 && uniqueHashes.size === hashes.length) {
      pass(`all ${uniqueHashes.size} plate hashes are byte-distinct`);
    }
  }

  if (!visualsSrc.includes('headlineAlign')) {
    markFail('headlineAlign metadata missing from SSOT');
  } else {
    pass('headline ↔ art alignment documented per slot');
  }

  if (ok && !process.exitCode) {
    console.log('\nSOTA parity gate: PASS (engineering). Run Epic 4.1 visual sign-off before outbound.');
  } else {
    console.log('\nSOTA parity gate: FAIL');
    process.exit(1);
  }
}

main();
