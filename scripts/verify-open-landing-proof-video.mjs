#!/usr/bin/env node
/**
 * Gate: Open landing enterprise GTM proof MP4s must exist on disk and remain
 * deployable (not excluded by .vercelignore). Prevents the 2026-10 regression
 * where blanket `*.mp4` shipped a 404 HTML body that browsers report as
 * MEDIA_ELEMENT_ERROR: Format error.
 *
 * Run: npm run verify:open-landing-proof-video
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED = [
  'public/marketing/open-landing-enterprise-gtm-1080.mp4',
  'public/marketing/open-landing-enterprise-gtm-4k.mp4',
  'public/marketing/open-landing-enterprise-gtm-poster.jpg',
];

/** Minimal ISO BMFF / MP4 signature check (`ftyp` at byte 4). */
function looksLikeMp4(buf) {
  return buf.length >= 8 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70;
}

function vercelIgnoreAllowsPublicMp4(ignoreText) {
  const lines = ignoreText
    .split(/\r?\n/)
    .map((l) => l.replace(/#.*$/, '').trim())
    .filter(Boolean);

  const hasBlanketMp4 = lines.some((l) => l === '*.mp4' || l === '*.MP4');
  if (!hasBlanketMp4) return true;

  // gitignore-style: last matching pattern wins; negation must re-include public/
  const allowPublic = lines.some(
    (l) =>
      l === '!public/**/*.mp4' ||
      l === '!public/**/*.MP4' ||
      l === '!public/marketing/**/*.mp4' ||
      l === '!public/marketing/**/*.MP4',
  );
  return allowPublic;
}

let failed = false;

for (const rel of REQUIRED) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    console.error(`FAIL: missing ${rel}`);
    failed = true;
    continue;
  }
  const st = fs.statSync(abs);
  if (st.size < 1024) {
    console.error(`FAIL: ${rel} too small (${st.size} bytes) — likely LFS pointer or empty`);
    failed = true;
    continue;
  }
  if (rel.endsWith('.mp4')) {
    const head = Buffer.alloc(12);
    const fd = fs.openSync(abs, 'r');
    fs.readSync(fd, head, 0, 12, 0);
    fs.closeSync(fd);
    if (!looksLikeMp4(head)) {
      console.error(`FAIL: ${rel} is not a valid MP4 (missing ftyp)`);
      failed = true;
      continue;
    }
  }
  console.log(`OK: ${rel} (${(st.size / 1024).toFixed(1)} KiB)`);
}

const ignorePath = path.join(root, '.vercelignore');
if (!fs.existsSync(ignorePath)) {
  console.error('FAIL: .vercelignore missing');
  failed = true;
} else {
  const ignoreText = fs.readFileSync(ignorePath, 'utf8');
  if (!vercelIgnoreAllowsPublicMp4(ignoreText)) {
    console.error(
      'FAIL: .vercelignore excludes *.mp4 without !public/**/*.mp4 (or marketing) negation — Open landing proof will 404 on Vercel',
    );
    failed = true;
  } else {
    console.log('OK: .vercelignore allows public/**/*.mp4 deploy');
  }
}

// SSOT paths in canonical-claims must still point at these filenames
const claimsPath = path.join(root, 'lib/canonical-claims.ts');
const claims = fs.readFileSync(claimsPath, 'utf8');
for (const needle of [
  'open-landing-enterprise-gtm-1080.mp4',
  'open-landing-enterprise-gtm-4k.mp4',
  'open-landing-enterprise-gtm-poster.jpg',
]) {
  if (!claims.includes(needle)) {
    console.error(`FAIL: lib/canonical-claims.ts missing OPEN_LANDING_VIDEO ref to ${needle}`);
    failed = true;
  }
}
if (!failed) console.log('OK: OPEN_LANDING_VIDEO SSOT filenames present');

if (failed) process.exit(1);
console.log('PASS: Open landing proof video deploy gate');
