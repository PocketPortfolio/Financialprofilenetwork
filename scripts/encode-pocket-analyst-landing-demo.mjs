#!/usr/bin/env node
/**
 * Encode Pocket Analyst landing demo — jump-cut past "thinking…" dead air.
 *
 * Clip A: user message sent (~22s). Clip B: streaming response (~38s, no thinking UI).
 *
 * Usage: node scripts/encode-pocket-analyst-landing-demo.mjs [input.mp4]
 * Output: public/pocket-analyst-demo.mp4 + public/pocket-analyst-demo-poster.jpg
 *
 * Env: DEMO_JUMP_CUT=1  DEMO_PRE_START=22  DEMO_PRE_DURATION=1.2  DEMO_START=38  DEMO_DURATION=10
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
const tmpDir = path.join(root, 'public', 'marketing', '_pocket-analyst-encode-tmp');

const DEMO_JUMP_CUT = process.env.DEMO_JUMP_CUT !== '0';
const DEMO_PRE_START = Number(process.env.DEMO_PRE_START ?? 22);
const DEMO_PRE_DURATION = Number(process.env.DEMO_PRE_DURATION ?? 0);
const DEMO_START = Number(process.env.DEMO_START ?? 38);
const DEMO_DURATION = Number(process.env.DEMO_DURATION ?? 10);

if (!input) {
  console.error('Input not found. Pass path or place Newpocketanalyst.mp4 at repo root.');
  process.exit(1);
}

const q = (p) => (p.includes(' ') ? `"${p}"` : p);
const vf = 'scale=3840:-2:flags=lanczos';
const encode = '-c:v libx264 -preset medium -crf 20 -threads 8 -pix_fmt yuv420p -movflags +faststart -an';

console.log('Encoding landing Pocket Analyst demo…');
console.log(`  source: ${input}`);
if (DEMO_JUMP_CUT) {
  console.log(
    `  jump-cut: ${DEMO_PRE_START}s+${DEMO_PRE_DURATION}s → ${DEMO_START}s+${DEMO_DURATION}s (skips thinking)`,
  );
} else {
  console.log(`  trim: ${DEMO_START}s + ${DEMO_DURATION}s`);
}

fs.mkdirSync(tmpDir, { recursive: true });

if (DEMO_JUMP_CUT) {
  const pre = path.join(tmpDir, 'pre.mp4');
  const main = path.join(tmpDir, 'main.mp4');
  const list = path.join(tmpDir, 'concat.txt');
  execSync(
    `ffmpeg -y -ss ${DEMO_PRE_START} -i ${q(input)} -t ${DEMO_PRE_DURATION} -vf "${vf}" ${encode} ${q(pre)}`,
    { stdio: 'inherit', shell: true },
  );
  execSync(
    `ffmpeg -y -ss ${DEMO_START} -i ${q(input)} -t ${DEMO_DURATION} -vf "${vf}" ${encode} ${q(main)}`,
    { stdio: 'inherit', shell: true },
  );
  fs.writeFileSync(
    list,
    [pre, main].map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'),
    'utf8',
  );
  execSync(`ffmpeg -y -f concat -safe 0 -i ${q(list)} -c copy ${q(outMp4)}`, {
    stdio: 'inherit',
    shell: true,
  });
} else {
  execSync(
    `ffmpeg -y -ss ${DEMO_START} -i ${q(input)} -t ${DEMO_DURATION} -vf "${vf}" ${encode} ${q(outMp4)}`,
    { stdio: 'inherit', shell: true },
  );
}

console.log('Extracting poster (response frame)…');
execSync(`ffmpeg -y -ss 2 -i ${q(outMp4)} -frames:v 1 -update 1 -q:v 2 ${q(outPoster)}`, {
  stdio: 'inherit',
  shell: true,
});

if (process.env.KEEP_BUILD_TMP !== '1') {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const probe = execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${q(outMp4)}`,
  { encoding: 'utf8', shell: true },
).trim();
const mb = (fs.statSync(outMp4).size / (1024 * 1024)).toFixed(2);

console.log(`\nDone: ${outMp4} (${mb} MB, ${probe}s)`);
console.log(`      ${outPoster}`);
