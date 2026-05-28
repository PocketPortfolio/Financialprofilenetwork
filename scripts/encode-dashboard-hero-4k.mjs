#!/usr/bin/env node
/**
 * Encode landing hero dashboard demo to 3840-wide H.264 (web-optimized).
 *
 * Usage: node scripts/encode-dashboard-hero-4k.mjs [input.mp4]
 * Default input: ./latestherovideo.mp4
 * Output: public/dashboard-demo-4k.mp4 + public/dashboard-demo-4k-poster.jpg
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.resolve(root, process.argv[2] ?? 'latestherovideo.mp4');
const outMp4 = path.join(root, 'public', 'dashboard-demo-4k.mp4');
const outPoster = path.join(root, 'public', 'dashboard-demo-4k-poster.jpg');

if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(1);
}

const q = (p) => (p.includes(' ') ? `"${p}"` : p);

console.log('Encoding 4K dashboard hero…');
execSync(
  [
    'ffmpeg -y',
    `-i ${q(input)}`,
    '-vf "scale=3840:-2:flags=lanczos"',
    '-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p',
    '-movflags +faststart -an',
    q(outMp4),
  ].join(' '),
  { stdio: 'inherit', shell: true },
);

console.log('Extracting poster frame…');
execSync(
  `ffmpeg -y -ss 3 -i ${q(outMp4)} -frames:v 1 -update 1 -q:v 2 ${q(outPoster)}`,
  { stdio: 'inherit', shell: true },
);

console.log('Done:', outMp4, outPoster);
