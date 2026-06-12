/**
 * Corporate LinkedIn — Split-Brain video V2 (silent, motion-first).
 *
 * V2 fixes (Creative Studios):
 * - No slow typing — UI clip starts at Send / thinking / streaming response
 * - Animated Data Chasm diagram (amber packet crosses the wire)
 * - No audio
 *
 * Usage: node scripts/generate-corporate-split-brain-linkedin-video.mjs [demo.mp4]
 *
 * Env overrides:
 *   DEMO_JUMP_CUT=1 (default) — skip "Pocket Analyst is thinking…" dead air
 *   DEMO_PRE_START=22  DEMO_PRE_DURATION=1.2  (user message sent)
 *   DEMO_START=38  DEMO_DURATION=10  (streaming response, no thinking indicator)
 *   DIAGRAM_SECONDS=6  INTRO_SECONDS=2.5
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'marketing');
const tmpDir = path.join(root, 'public', 'marketing', '_split-brain-video-build');

const W = 1920;
const H = 1080;
const OUT_W_4K = 3840;
const FPS = 24;

const amber = '#f59e0b';
const fg = '#e2e8f0';
const fgMuted = '#a1a1aa';
const fgSub = '#71717a';
const stroke = '#27272a';
const card = '#141414';
const cardHi = '#18181b';
const obsidian = '#09090b';

const DEMO_CANDIDATES = [
  path.join(root, 'Newpocketanalyst.mp4'),
  path.join(root, 'public', 'pocket-analyst-demo.mp4'),
  path.join(root, 'latestherovideo.mp4'),
];

const INTRO_SEC = Number(process.env.INTRO_SECONDS ?? 2.5);
const OUTRO_SEC = 2.5;
const DIAGRAM_SEC = Number(process.env.DIAGRAM_SECONDS ?? 6);
const DEMO_JUMP_CUT = process.env.DEMO_JUMP_CUT !== '0';
const DEMO_PRE_START = Number(process.env.DEMO_PRE_START ?? 22);
const DEMO_PRE_DURATION = Number(process.env.DEMO_PRE_DURATION ?? 0);
const DEMO_START = Number(process.env.DEMO_START ?? 38);
const DEMO_DURATION = Number(process.env.DEMO_DURATION ?? 10);

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function q(p) {
  return p.includes(' ') || p.includes('&') ? `"${p.replace(/"/g, '\\"')}"` : p;
}

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', shell: true, cwd: root });
}

function pngFromSvg(svg, outPath) {
  const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: true },
  });
  fs.writeFileSync(outPath, resvg.render().asPng());
}

function slideSvg({ kicker, title, subtitle, extra = '' }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f10"/>
      <stop offset="50%" style="stop-color:${obsidian}"/>
      <stop offset="100%" style="stop-color:#050506"/>
    </linearGradient>
    <linearGradient id="glow" x1="85%" y1="0%" x2="100%" y2="55%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0.08"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="48" y="48" width="${W - 96}" height="${H - 96}" rx="6" fill="none" stroke="${stroke}" stroke-width="2"/>
  <line x1="48" y1="140" x2="${W - 48}" y2="140" stroke="${amber}" stroke-width="1.5" opacity="0.5"/>
  <text x="96" y="110" fill="${amber}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="0.2em">${esc(kicker)}</text>
  <text x="96" y="220" fill="${fg}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="56" font-weight="700">${esc(title)}</text>
  <text x="96" y="290" fill="${fgMuted}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="28">${esc(subtitle)}</text>
  ${extra}
  <text x="96" y="${H - 72}" fill="${fgSub}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="18" letter-spacing="0.08em">POCKET PORTFOLIO · SOVEREIGN INFRASTRUCTURE</text>
</svg>`;
}

/** Animated diagram frame — progress 0..1 moves amber bounded-context packet */
function animatedFlowSvg(progress) {
  const p = Math.max(0, Math.min(1, progress));
  const x1 = 306;
  const x2 = 860;
  const x3 = 1514;
  const y = 580;
  let px;
  let label;
  if (p < 0.45) {
    const t = p / 0.45;
    px = x1 + (x2 - x1) * t;
    label = 'Building bounded context (client-side)';
  } else if (p < 0.85) {
    const t = (p - 0.45) / 0.4;
    px = x2 + (x3 - x2) * t;
    label = 'Sanitized payload crosses the wire';
  } else {
    px = x3;
    label = 'Forgetful session · stream back';
  }
  const trail = Math.round(180 * (1 - p));
  const arrow1 = p > 0.08 ? Math.min(1, (p - 0.08) / 0.35) : 0;
  const arrow2 = p > 0.5 ? Math.min(1, (p - 0.5) / 0.35) : 0;
  const streamBack = p > 0.88 ? Math.min(1, (p - 0.88) / 0.12) : 0;

  return slideSvg({
    kicker: 'THE DATA CHASM',
    title: 'Warehouse-to-Infer ends here',
    subtitle: label,
    extra: `
  <text x="960" y="360" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="20" font-weight="600" text-anchor="middle">Figure — Split-Brain data flow (animated)</text>
  <rect x="96" y="400" width="420" height="400" rx="10" fill="${card}" stroke="${stroke}" stroke-width="2"/>
  <text x="306" y="450" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="20" font-weight="700" text-anchor="middle">CLIENT PERIMETER</text>
  <text x="120" y="500" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="22">Raw ledger · browser memory</text>
  <text x="120" y="540" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="18">Never crosses the network</text>
  <path d="M 516 ${y} L ${516 + 104 * arrow1} ${y}" stroke="${amber}" stroke-width="4" opacity="${arrow1}"/>
  <polygon points="${516 + 104 * arrow1},${y} ${506 + 104 * arrow1},${y - 8} ${506 + 104 * arrow1},${y + 8}" fill="${amber}" opacity="${arrow1}"/>
  <rect x="640" y="440" width="440" height="320" rx="10" fill="${cardHi}" stroke="${amber}" stroke-width="2.5"/>
  <text x="860" y="490" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="20" font-weight="700" text-anchor="middle">BOUNDED CONTEXT</text>
  <text x="660" y="540" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="22">Totals + top 10 holdings</text>
  <path d="M 1080 ${y} L ${1080 + 104 * arrow2} ${y}" stroke="${fgMuted}" stroke-width="4" opacity="${arrow2}"/>
  <polygon points="${1080 + 104 * arrow2},${y} ${1070 + 104 * arrow2},${y - 8} ${1070 + 104 * arrow2},${y + 8}" fill="${fgMuted}" opacity="${arrow2}"/>
  <rect x="1204" y="400" width="620" height="400" rx="10" fill="${card}" stroke="${stroke}" stroke-width="2"/>
  <text x="1514" y="450" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="20" font-weight="700" text-anchor="middle">STATELESS INFERENCE</text>
  <text x="1228" y="500" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="22">POST /api/ai/chat</text>
  <circle cx="${Math.round(px)}" cy="${y}" r="22" fill="${amber}" opacity="0.95"/>
  <circle cx="${Math.round(px)}" cy="${y}" r="34" fill="none" stroke="${amber}" stroke-width="2" opacity="0.45"/>
  <circle cx="${Math.round(px - 40)}" cy="${y}" r="14" fill="${amber}" opacity="${trail / 255}"/>
  <path d="M 1514 ${y + 120} L 306 ${y + 120}" stroke="${amber}" stroke-width="3" opacity="${streamBack * 0.85}" stroke-dasharray="12 10"/>
  <polygon points="306,${y + 120} 318,${y + 112} 318,${y + 128}" fill="${amber}" opacity="${streamBack}"/>
  <text x="910" y="${y + 168}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="18" text-anchor="middle" opacity="${streamBack}">Streaming response — ledger stays client-side</text>
`,
  });
}

function pngToMp4(png, mp4, seconds) {
  run(
    [
      'ffmpeg -y',
      `-loop 1 -i ${q(png)}`,
      `-t ${seconds}`,
      `-vf "scale=${W}:${H}:flags=lanczos,format=yuv420p"`,
      `-r ${FPS}`,
      '-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -an',
      q(mp4),
    ].join(' '),
  );
}

function framesToMp4(framesDir, mp4, fps) {
  run(
    [
      'ffmpeg -y',
      `-framerate ${fps} -i ${q(path.join(framesDir, 'frame_%04d.png'))}`,
      `-vf "scale=${W}:${H}:flags=lanczos,format=yuv420p"`,
      '-c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -an',
      q(mp4),
    ].join(' '),
  );
}

function resolveDemoInput(cliArg) {
  if (cliArg && fs.existsSync(path.resolve(root, cliArg))) return path.resolve(root, cliArg);
  for (const c of DEMO_CANDIDATES) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/** Outro title card — also used as the landing-page video poster (SSOT). */
function outroSlideSvg() {
  return slideSvg({
    kicker: 'OPEN PORTFOLIO',
    title: 'Explore the architecture',
    subtitle: 'openportfolio.co.uk/architecture',
  });
}

/** Upscale vector outro PNG to 4K JPEG for crisp poster on the O. landing player. */
function exportOutroPoster(outroPng, outPoster) {
  run(
    [
      'ffmpeg -y -i',
      q(outroPng),
      '-vf "scale=3840:2160:flags=lanczos"',
      '-q:v 2 -update 1',
      q(outPoster),
    ].join(' '),
  );
}

function exportPosterOnly() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const outPoster = path.join(outDir, 'corporate-split-brain-linkedin-poster.jpg');
  const outroPng = path.join(tmpDir, 'outro.png');
  pngFromSvg(outroSlideSvg(), outroPng);
  exportOutroPoster(outroPng, outPoster);

  if (process.env.KEEP_BUILD_TMP !== '1') {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log('Poster (4K outro frame):', outPoster);
}

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const demoIn = resolveDemoInput(process.argv[2]);
  if (!demoIn) {
    console.error('No demo MP4 found.');
    process.exit(1);
  }

  const out1080 = path.join(outDir, 'corporate-split-brain-linkedin-1080.mp4');
  const out4k = path.join(outDir, 'corporate-split-brain-linkedin-4k.mp4');
  const outGif = path.join(outDir, 'corporate-split-brain-linkedin.gif');
  const outPoster = path.join(outDir, 'corporate-split-brain-linkedin-poster.jpg');

  console.log(
    'V2 build — demo',
    demoIn,
    DEMO_JUMP_CUT
      ? `jump-cut pre=${DEMO_PRE_START}s+${DEMO_PRE_DURATION}s → response=${DEMO_START}s+${DEMO_DURATION}s`
      : `start=${DEMO_START}s duration=${DEMO_DURATION}s`,
  );

  const introPng = path.join(tmpDir, 'intro.png');
  const introMp4 = path.join(tmpDir, 'intro.mp4');
  pngFromSvg(
    slideSvg({
      kicker: 'SOVEREIGN INFRASTRUCTURE',
      title: 'Split-Brain Architecture',
      subtitle: 'Move compute to the edge — not the ledger to the cloud',
    }),
    introPng,
  );
  pngToMp4(introPng, introMp4, INTRO_SEC);

  const demoMp4 = path.join(tmpDir, 'demo.mp4');
  const demoVf = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:${obsidian},format=yuv420p`;
  const demoEncode = `-r ${FPS} -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -an`;

  if (DEMO_JUMP_CUT) {
    const demoMainMp4 = path.join(tmpDir, 'demo-main.mp4');
    run(
      [
        'ffmpeg -y',
        `-ss ${DEMO_START} -i ${q(demoIn)}`,
        `-t ${DEMO_DURATION}`,
        `-vf "${demoVf}"`,
        demoEncode,
        q(demoMainMp4),
      ].join(' '),
    );
    if (DEMO_PRE_DURATION > 0) {
      const demoPreMp4 = path.join(tmpDir, 'demo-pre.mp4');
      const demoConcatList = path.join(tmpDir, 'demo-concat.txt');
      run(
        [
          'ffmpeg -y',
          `-ss ${DEMO_PRE_START} -i ${q(demoIn)}`,
          `-t ${DEMO_PRE_DURATION}`,
          `-vf "${demoVf}"`,
          demoEncode,
          q(demoPreMp4),
        ].join(' '),
      );
      fs.writeFileSync(
        demoConcatList,
        [demoPreMp4, demoMainMp4].map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'),
        'utf8',
      );
      run(['ffmpeg -y', `-f concat -safe 0 -i ${q(demoConcatList)}`, '-c copy -an', q(demoMp4)].join(' '));
    } else {
      fs.copyFileSync(demoMainMp4, demoMp4);
    }
  } else {
    run(
      [
        'ffmpeg -y',
        `-ss ${DEMO_START} -i ${q(demoIn)}`,
        `-t ${DEMO_DURATION}`,
        `-vf "${demoVf}"`,
        demoEncode,
        q(demoMp4),
      ].join(' '),
    );
  }

  const framesDir = path.join(tmpDir, 'flow-frames');
  fs.mkdirSync(framesDir, { recursive: true });
  const frameCount = Math.round(DIAGRAM_SEC * FPS);
  for (let i = 0; i < frameCount; i++) {
    const progress = frameCount <= 1 ? 1 : i / (frameCount - 1);
    pngFromSvg(animatedFlowSvg(progress), path.join(framesDir, `frame_${String(i + 1).padStart(4, '0')}.png`));
  }
  const flowMp4 = path.join(tmpDir, 'flow.mp4');
  framesToMp4(framesDir, flowMp4, FPS);

  const outroPng = path.join(tmpDir, 'outro.png');
  const outroMp4 = path.join(tmpDir, 'outro.mp4');
  pngFromSvg(outroSlideSvg(), outroPng);
  pngToMp4(outroPng, outroMp4, OUTRO_SEC);

  const concatList = path.join(tmpDir, 'concat.txt');
  const merged = path.join(tmpDir, 'merged.mp4');
  fs.writeFileSync(
    concatList,
    [introMp4, demoMp4, flowMp4, outroMp4].map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'),
    'utf8',
  );

  run(['ffmpeg -y', `-f concat -safe 0 -i ${q(concatList)}`, '-c copy -an', q(merged)].join(' '));
  fs.copyFileSync(merged, out1080);

  // 4K pass: medium preset + thread cap avoids x264 malloc failures on Windows
  try {
    run(
      [
        'ffmpeg -y -an',
        `-i ${q(merged)}`,
        `-vf "scale=${OUT_W_4K}:-2:flags=lanczos"`,
        '-c:v libx264 -preset medium -crf 20 -threads 8 -pix_fmt yuv420p',
        '-movflags +faststart -an',
        q(out4k),
      ].join(' '),
    );
  } catch {
    console.warn('4K upscale failed — LinkedIn feed can use 1080p master:', out1080);
    if (fs.existsSync(out4k)) fs.unlinkSync(out4k);
  }

  run(
    [
      'ffmpeg -y -an',
      `-i ${q(merged)}`,
      '-vf "fps=12,scale=1080:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer"',
      '-an -loop 0',
      q(outGif),
    ].join(' '),
  );

  exportOutroPoster(outroPng, outPoster);

  if (process.env.KEEP_BUILD_TMP !== '1') {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const probe = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${q(out1080)}`,
    { encoding: 'utf8', shell: true },
  ).trim();

  console.log('\nV2 Done (silent):');
  console.log(' ', out4k);
  console.log(' ', out1080, `(${probe}s)`);
  console.log(' ', outGif);
  console.log(' ', outPoster);
}

try {
  if (process.argv.includes('--poster-only')) {
    exportPosterOnly();
  } else {
    main();
  }
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
}
