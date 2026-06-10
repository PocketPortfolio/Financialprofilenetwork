#!/usr/bin/env node
/**
 * Gate: Operation SOTA Parity (B2C) — verify Pocket landing plates + SSOT.
 * SSOT: docs/seed/pocket-portfolio-web-sota-brief.md
 *
 * Run: npm run verify:pocket-web-sota
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const VISUALS_TS = path.join(ROOT, 'lib/pocket-landing-visuals.ts');
const PLATES_DIR = path.join(ROOT, 'public/pocket/landing/plates');
const MANIFEST = path.join(PLATES_DIR, 'manifest.json');
const LANDING_PAGE = path.join(ROOT, 'app/landing/page.tsx');
const CONTROL_LANDING_PAGE = path.join(ROOT, 'app/landing/ControlLandingPage.tsx');
const POCKET_COMPONENTS = path.join(ROOT, 'app/components/pocket-landing');

const BRIEFING_CARD = path.join(ROOT, 'app/components/newsroom/NewsRoomBriefingCard.tsx');

const LEGACY_FORBIDDEN = [
  '/newsroom/art/',
  'icon-terminal.svg',
  'icon-google-drive.svg',
  'icon-founders-crown.svg',
  'brand-card',
  '🚫',
  'rgba(16, 185, 129',
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
    markFail('missing lib/pocket-landing-visuals.ts');
    process.exit(1);
  }

  const visualsSrc = fs.readFileSync(VISUALS_TS, 'utf8');
  const landingSrc = fs.existsSync(LANDING_PAGE) ? fs.readFileSync(LANDING_PAGE, 'utf8') : '';
  const controlLandingSrc = fs.existsSync(CONTROL_LANDING_PAGE)
    ? fs.readFileSync(CONTROL_LANDING_PAGE, 'utf8')
    : '';
  const landingOrchestratorSrc = `${landingSrc}\n${controlLandingSrc}`;
  const cardSrc = fs.existsSync(BRIEFING_CARD) ? fs.readFileSync(BRIEFING_CARD, 'utf8') : '';

  const pocketComponentSrc = fs.existsSync(POCKET_COMPONENTS)
    ? fs
        .readdirSync(POCKET_COMPONENTS)
        .filter((f) => f.endsWith('.tsx'))
        .map((f) => fs.readFileSync(path.join(POCKET_COMPONENTS, f), 'utf8'))
        .join('\n')
    : '';

  for (const token of LEGACY_FORBIDDEN) {
    if (pocketComponentSrc.includes(token)) {
      markFail(`legacy visual debt in pocket-landing components: ${token}`);
    }
    if (token === '/newsroom/art/' && cardSrc.includes(token) && !cardSrc.includes('plateUrlForBriefing')) {
      markFail('newsroom still uses legacy SVG art path without plate router');
    }
  }

  const plateFiles = [...visualsSrc.matchAll(/plateFile: '([a-z0-9-]+\.png)'/g)].map((m) => m[1]);
  const uniquePaths = [...new Set(plateFiles)];

  if (uniquePaths.length < 11) {
    markFail(`expected 11 distinct plate paths in SSOT, found ${uniquePaths.length}`);
  }

  for (const file of uniquePaths) {
    const abs = path.join(PLATES_DIR, file);
    if (!fs.existsSync(abs)) {
      markFail(`missing plate: public/pocket/landing/plates/${file}`);
    } else if (fs.statSync(abs).size < 50_000) {
      markFail(`plate too small (corrupt?): ${file}`);
    } else {
      pass(`plate exists: ${file}`);
    }
  }

  if (!pocketComponentSrc.includes('FinPillarsCarousel')) {
    markFail('FinPillarsCarousel section component missing');
  } else {
    pass('FIN pillars scroll carousel wired in section');
  }

  const overlays = ['metrics', 'adFreeInvariant', 'portal'];
  for (const ov of overlays) {
    if (!visualsSrc.includes(`overlay: '${ov}'`)) {
      markFail(`overlay '${ov}' not configured in SSOT`);
    }
  }
  if (overlays.every((ov) => visualsSrc.includes(`overlay: '${ov}'`))) {
    pass('metrics + adFree + portal overlays configured');
  }

  if (!fs.existsSync(MANIFEST)) {
    markFail('missing plates/manifest.json — run npm run sync:pocket-web-plates');
  } else {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    if (!Array.isArray(manifest.plates) || manifest.plates.length < 11) {
      markFail('manifest incomplete');
    } else {
      pass(`manifest: ${manifest.plates.length} plates synced at ${manifest.syncedAt}`);
    }

    const hashes = manifest.plates?.map((p) => p.hash) ?? [];
    const uniqueHashes = new Set(hashes);
    if (hashes.length >= 11 && uniqueHashes.size < hashes.length) {
      markFail('duplicate plate hashes in manifest — re-run sync with baked crops');
    } else if (hashes.length >= 11 && uniqueHashes.size === hashes.length) {
      pass(`all ${uniqueHashes.size} plate hashes are byte-distinct`);
    }
  }

  if (!visualsSrc.includes('headlineAlign')) {
    markFail('headlineAlign metadata missing from SSOT');
  } else {
    pass('headline ↔ art alignment documented per slot');
  }

  if (
    !landingOrchestratorSrc.includes('ProductPortalSection') ||
    !landingOrchestratorSrc.includes('WhyChooseSection')
  ) {
    markFail('landing page must orchestrate extracted SOTA section components');
  } else {
    pass('landing page wires SOTA section components');
  }

  if (!pocketComponentSrc.includes('pocket-landing-sota')) {
    markFail('landing sections missing .pocket-landing-sota wrapper');
  } else {
    pass('landing-scoped SOTA wrapper present');
  }

  if (ok && !process.exitCode) {
    console.log('\nPocket SOTA parity gate: PASS (engineering). Run Epic 4.1 visual sign-off before outbound.');
  } else {
    console.log('\nPocket SOTA parity gate: FAIL');
    process.exit(1);
  }
}

main();
