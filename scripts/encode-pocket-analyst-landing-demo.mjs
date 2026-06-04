#!/usr/bin/env node
/**
 * Encode Pocket Analyst landing demo — action-first (no slow typing).
 *
 * Trims source from Send / thinking / streaming (~20s mark in screen capture).
 *
 * Usage: node scripts/encode-pocket-analyst-landing-demo.mjs [input.mp4]
 * Default input: ./Newpocketanalyst.mp4
 * Output: public/pocket-analyst-demo.mp4 + public/pocket-analyst-demo-poster.jpg
 *
 * Env: DEMO_START=20  DEMO_DURATION=28  (seconds)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  path.resolve(root, process.argv[2] ?? 'Newpocketanalyst.mp4'),
  path.join(root, 'public', 'pocketanalyst.mp4'),
];
const input = candidates.find((p) => fs.existsSync(p));
const outMp4 = path.join(root, 'public', 'pocket-analyst-demo.mp4');
const outPoster = path.join(root, 'public', 'pocket-analyst-demo-poster.jpg');

const DEMO_START = Number(process.env.DEMO_START ?? 20);
const DEMO_DURATION = Number(process.env.DEMO_DURATION ?? 28);

if (!input) {
  console.error('Input not found. Pass path or place Newpocketanalyst.mp4 at repo root.');
  process.exit(1);
}

const q = (p) => (p.includes(' ') ? `"${p}"` : p);

console.log(`Encoding landing Pocket Analyst demo…`);
console.log(`  source: ${input}`);
console.log(`  trim:   ${DEMO_START}s + ${DEMO_DURATION}s (skips typing)`);

execSync(
  [
    'ffmpeg -y',
    `-ss ${DEMO_START}`,
    `-i ${q(input)}`,
    `-t ${DEMO_DURATION}`,
    '-vf "scale=3840:-2:flags=lanczos"',
    '-c:v libx264 -preset medium -crf 20 -threads 8 -pix_fmt yuv420p',
    '-movflags +faststart -an',
    q(outMp4),
  ].join(' '),
  { stdio: 'inherit', shell: true },
);

console.log('Extracting poster (streaming frame)…');
execSync(
  `ffmpeg -y -ss 6 -i ${q(outMp4)} -frames:v 1 -update 1 -q:v 2 ${q(outPoster)}`,
  { stdio: 'inherit', shell: true },
);

const probe = execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${q(outMp4)}`,
  { encoding: 'utf8', shell: true },
).trim();
const mb = (fs.statSync(outMp4).size / (1024 * 1024)).toFixed(2);

console.log(`\nDone: ${outMp4} (${mb} MB, ${probe}s)`);
console.log(`      ${outPoster}`);
console.log('\nNext: npm run upload-pocket-analyst-cloudinary');
console.log('      Bump POCKET_ANALYST_BRANDED_VERSION in lib/landing-product-video.ts');
