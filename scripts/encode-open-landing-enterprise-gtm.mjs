/**
 * Open Portfolio landing — enterprise GTM composite (Creative Studios).
 *
 * Brand hygiene (Open channel):
 *   - Bookends use Open Portfolio O. monogram (`public/brand/op-monogram-amber.png`)
 *   - Exit URL is openportfolio.co.uk only (no Pocket wordmark / P. logo)
 *   - Architecture footer remastered to OPEN PORTFOLIO
 *   - Product beat: cover consumer P. chrome; OP badge (live harness on Open substrate)
 *
 * Shape:
 *   [intro]  Open Portfolio + OPEN INTELLIGENCE (O. logo)
 *   [product] brief NEW GTM harness scene
 *   [arch]   Split-Brain diagram (enterprise)
 *   [exit]   Open Portfolio + OPEN INTELLIGENCE + openportfolio.co.uk
 *
 * Usage: npm run encode:open-landing-enterprise-gtm
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(root, 'public', 'marketing', '_open-enterprise-gtm-tmp');
const outDir = path.join(root, 'public', 'marketing');

const v4 = path.join(root, 'exports', 'sovereign-ai-harness-demo-gtm-cut-v4-branded.mp4');
const opMono = path.join(root, 'public', 'brand', 'op-monogram-amber.png');
const splitBrain1080 = path.join(outDir, 'corporate-split-brain-linkedin-1080.mp4');

const out1080 = path.join(outDir, 'open-landing-enterprise-gtm-1080.mp4');
const out4k = path.join(outDir, 'open-landing-enterprise-gtm-4k.mp4');
const outPoster = path.join(outDir, 'open-landing-enterprise-gtm-poster.jpg');
const introStillOut = path.join(outDir, 'open-landing-enterprise-gtm-intro.jpg');
const exitStillOut = path.join(outDir, 'open-landing-enterprise-gtm-exit.jpg');

const PLATE_W = 3840;
const PLATE_H = 2160;
const W = 1920;
const H = 1080;
const FPS = 30;
const AMBER = '#F59E0B';
const WHITE = '#FAFAFA';
const MUTED = 'rgba(250,250,250,0.55)';
const OBSIDIAN = { r: 9, g: 9, b: 11, alpha: 1 };

const INTRO_SEC = Number(process.env.INTRO_SECONDS ?? 2);
const EXIT_SEC = Number(process.env.EXIT_SECONDS ?? 2.5);
const PRODUCT_START = Number(process.env.PRODUCT_START ?? 2);
const PRODUCT_DURATION = Number(process.env.PRODUCT_DURATION ?? 6);
const DIAGRAM_START = Number(process.env.DIAGRAM_START ?? 7.5);
const DIAGRAM_DURATION = Number(process.env.DIAGRAM_DURATION ?? 6);

function q(p) {
  return `"${p.replace(/"/g, '\\"')}"`;
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true, cwd: root });
}

for (const p of [v4, opMono, splitBrain1080]) {
  if (!fs.existsSync(p)) {
    console.error('Missing required asset:', p);
    process.exit(1);
  }
}

fs.mkdirSync(tmp, { recursive: true });

async function openPlate({ footer }) {
  const logoBuf = await sharp(opMono).resize(220, 220, { fit: 'contain' }).png().toBuffer();
  const titleSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${PLATE_W}" height="${PLATE_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#09090B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#09090B"/>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="54%" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="96" font-weight="700" fill="${WHITE}" letter-spacing="4">Open Portfolio</text>
  <text x="50%" y="62%" text-anchor="middle" font-family="ui-monospace, Menlo, Consolas, monospace"
    font-size="42" font-weight="500" fill="${MUTED}" letter-spacing="10">OPEN INTELLIGENCE</text>
  ${
    footer
      ? `<text x="50%" y="88%" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
    font-size="36" font-weight="500" fill="${AMBER}" letter-spacing="2">${footer}</text>`
      : ''
  }
</svg>`);

  return sharp({
    create: { width: PLATE_W, height: PLATE_H, channels: 4, background: OBSIDIAN },
  })
    .composite([
      { input: titleSvg, top: 0, left: 0 },
      { input: logoBuf, top: Math.round(PLATE_H * 0.28), left: Math.round((PLATE_W - 220) / 2) },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

console.log('Rendering Open Portfolio bookends (O. monogram)…');
const introJpg = path.join(tmp, 'op-intro.jpg');
const exitJpg = path.join(tmp, 'op-exit.jpg');
fs.writeFileSync(introJpg, await openPlate({ footer: null }));
fs.writeFileSync(
  exitJpg,
  await openPlate({ footer: 'openportfolio.co.uk' }),
);
fs.copyFileSync(introJpg, introStillOut);
fs.copyFileSync(exitJpg, exitStillOut);
fs.copyFileSync(introJpg, outPoster);

const vfPad = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:#09090b,fps=${FPS},format=yuv420p`;
const encodeSilent = `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r ${FPS} -an -movflags +faststart`;

const introMp4 = path.join(tmp, '01-intro.mp4');
const productRaw = path.join(tmp, '02-product-raw.mp4');
const productMp4 = path.join(tmp, '02-product.mp4');
const diagramRaw = path.join(tmp, '03-diagram-raw.mp4');
const diagramMp4 = path.join(tmp, '03-diagram.mp4');
const exitMp4 = path.join(tmp, '04-exit.mp4');
const opBadge = path.join(tmp, 'op-badge-64.png');
const concatList = path.join(tmp, 'concat.txt');
const merged = path.join(tmp, 'merged.mp4');

await sharp(opMono).resize(64, 64, { fit: 'contain' }).png().toFile(opBadge);

console.log('Open enterprise GTM composite (Open channel brand hygiene)…');
console.log(
  `  intro=${INTRO_SEC}s  product@${PRODUCT_START}+${PRODUCT_DURATION}s  diagram@${DIAGRAM_START}+${DIAGRAM_DURATION}s  exit=${EXIT_SEC}s`,
);

console.log('1/5 Intro (Open Portfolio O.)…');
run(
  [
    'ffmpeg -y',
    `-loop 1 -i ${q(introJpg)}`,
    `-t ${INTRO_SEC}`,
    `-vf "${vfPad},fade=t=in:st=0:d=0.3,fade=t=out:st=${Math.max(0, INTRO_SEC - 0.35)}:d=0.35"`,
    encodeSilent,
    q(introMp4),
  ].join(' '),
);

console.log('2/5 Product (brief GTM scene — cover Pocket chrome, OP badge)…');
run(
  [
    'ffmpeg -y',
    `-ss ${PRODUCT_START} -i ${q(v4)}`,
    `-t ${PRODUCT_DURATION}`,
    `-vf "${vfPad}"`,
    encodeSilent,
    q(productRaw),
  ].join(' '),
);
// Cover top-left consumer wordmark; stamp Open Portfolio O. + channel label.
run(
  [
    'ffmpeg -y',
    `-i ${q(productRaw)}`,
    `-i ${q(opBadge)}`,
    `-filter_complex "[0:v]drawbox=x=12:y=10:w=300:h=52:color=0x09090b@1:t=fill[base];[base][1:v]overlay=20:14[v1];[v1]drawtext=text='Open Portfolio':fontcolor=0xfafafa:fontsize=18:x=92:y=28:font='Segoe UI'[vout]"`,
    '-map "[vout]"',
    encodeSilent,
    q(productMp4),
  ].join(' '),
);

console.log('3/5 Architecture diagram (OPEN PORTFOLIO footer)…');
run(
  [
    'ffmpeg -y',
    `-ss ${DIAGRAM_START} -i ${q(splitBrain1080)}`,
    `-t ${DIAGRAM_DURATION}`,
    `-vf "${vfPad}"`,
    encodeSilent,
    q(diagramRaw),
  ].join(' '),
);
run(
  [
    'ffmpeg -y',
    `-i ${q(diagramRaw)}`,
    `-vf "drawbox=x=48:y=1000:w=900:h=40:color=0x09090b@1:t=fill,drawtext=text='OPEN PORTFOLIO  ·  SOVEREIGN INFRASTRUCTURE':fontcolor=0x71717a:fontsize=18:x=96:y=1010:font='Segoe UI'"`,
    encodeSilent,
    q(diagramMp4),
  ].join(' '),
);

console.log('4/5 Exit (Open Portfolio O. + openportfolio.co.uk)…');
run(
  [
    'ffmpeg -y',
    `-loop 1 -i ${q(exitJpg)}`,
    `-t ${EXIT_SEC}`,
    `-vf "${vfPad},fade=t=in:st=0:d=0.35,fade=t=out:st=${Math.max(0, EXIT_SEC - 0.4)}:d=0.4"`,
    encodeSilent,
    q(exitMp4),
  ].join(' '),
);

fs.writeFileSync(
  concatList,
  [introMp4, productMp4, diagramMp4, exitMp4]
    .map((f) => `file '${f.replace(/\\/g, '/')}'`)
    .join('\n'),
  'utf8',
);

console.log('5/5 Concat + 4K…');
run(`ffmpeg -y -f concat -safe 0 -i ${q(concatList)} -c copy -an ${q(merged)}`);
fs.copyFileSync(merged, out1080);

run(
  [
    'ffmpeg -y -an',
    `-i ${q(merged)}`,
    '-vf "scale=3840:2160:flags=lanczos,setsar=1"',
    '-c:v libx264 -preset medium -crf 20 -threads 8 -pix_fmt yuv420p',
    '-movflags +faststart -an',
    q(out4k),
  ].join(' '),
);

const probe = execSync(
  `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${q(out1080)}`,
  { encoding: 'utf8', shell: true },
).trim();

if (process.env.KEEP_OPEN_ENTERPRISE_TMP !== '1') {
  for (const f of [
    introMp4,
    productRaw,
    productMp4,
    diagramRaw,
    diagramMp4,
    exitMp4,
    concatList,
    merged,
    opBadge,
    introJpg,
    exitJpg,
  ]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
}

console.log('\nDone (Open Portfolio channel — O. monogram hygiene):');
console.log(' ', out4k);
console.log(' ', out1080, `(${probe}s)`);
console.log(' ', outPoster);
console.log(' ', introStillOut);
console.log(' ', exitStillOut);
