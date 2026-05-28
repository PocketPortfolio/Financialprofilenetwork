/**
 * LinkedIn POST cover image — Friday Vanguard (attach to feed post)
 * Spec: 1200×630 (1.91:1) · 2× export 2400×1260
 * NOT the profile background banner (1584×396).
 *
 * Run: node scripts/generate-linkedin-friday-vanguard-post-cover.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'marketing');

const W = 1200;
const H = 630;
const OUT_W = 2400;

const bg = '#09090b';
const amber = '#f59e0b';
const amberSoft = 'rgba(245,158,11,0.65)';
const amberDim = 'rgba(245,158,11,0.12)';
const amberGlow = 'rgba(245,158,11,0.28)';
const glass = 'rgba(24,24,27,0.55)';
const stroke = '#27272a';
const fgMuted = '#71717a';
const mono = 'Consolas, Courier New, Menlo, monospace';

function fiberMesh() {
  const panel = { x: 640, y: 72, w: 520, h: 486 };
  const nodes = [
    [720, 140, 6],
    [820, 110, 7],
    [940, 150, 6],
    [1040, 120, 7],
    [1100, 220, 8],
    [980, 260, 7],
    [860, 320, 6],
    [1000, 380, 7],
    [1120, 340, 6],
    [760, 280, 5],
    [900, 420, 6],
    [1060, 480, 5],
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [2, 5],
    [1, 9],
    [9, 0],
    [5, 10],
    [10, 7],
    [4, 8],
    [6, 10],
  ];
  let s = `
  <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="16" fill="${glass}" stroke="${stroke}" stroke-width="1"/>
  <rect x="${panel.x + 12}" y="${panel.y + 12}" width="${panel.w - 24}" height="${panel.h - 24}" fill="url(#glassSheen)" opacity="0.45"/>`;
  for (const [a, b] of links) {
    const [x1, y1] = nodes[a];
    const [x2, y2] = nodes[b];
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${amberSoft}" stroke-width="1.6" opacity="0.75"/>`;
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${amberGlow}" stroke-width="5" opacity="0.22" filter="url(#glow)"/>`;
  }
  for (const [x, y, r] of nodes) {
    s += `<circle cx="${x}" cy="${y}" r="${r + 12}" fill="${amberGlow}" opacity="0.3" filter="url(#glow)"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${bg}" stroke="${amber}" stroke-width="1.6"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r - 2}" fill="${amberDim}"/>`;
  }
  return s;
}

function fiberStrands() {
  const paths = [
    'M 520 520 C 620 420, 760 320, 900 200',
    'M 480 480 C 600 380, 720 280, 880 180',
    'M 560 560 C 680 460, 820 360, 960 240',
  ];
  return paths
    .map(
      (d) => `
  <path d="${d}" fill="none" stroke="${amberSoft}" stroke-width="1.4" opacity="0.4"/>
  <path d="${d}" fill="none" stroke="${amberGlow}" stroke-width="4" opacity="0.18" filter="url(#glow)"/>`
    )
    .join('');
}

function leftBand() {
  return `
  <text x="48" y="88" fill="${amber}" font-family="${mono}" font-size="11" letter-spacing="0.32em" opacity="0.9">OPEN PORTFOLIO</text>
  <text x="48" y="148" fill="#f4f4f5" font-family="${mono}" font-size="28" font-weight="700">Deployment trenches.</text>
  <text x="48" y="188" fill="${fgMuted}" font-family="${mono}" font-size="14">Reality check · governance · safe AI deploy</text>
  <line x1="48" y1="220" x2="420" y2="220" stroke="${stroke}" stroke-width="1"/>
  <text x="48" y="268" fill="${fgMuted}" font-family="${mono}" font-size="12" opacity="0.85">SaaS → AI-native · Who governs the model?</text>
  <text x="48" y="296" fill="${fgMuted}" font-family="${mono}" font-size="12" opacity="0.85">Executive perimeter · not trend-following</text>`;
}

function buildSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="${stroke}" stroke-width="0.5" opacity="0.6"/>
    </pattern>
    <linearGradient id="fadeL" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:1"/>
      <stop offset="70%" style="stop-color:${bg};stop-opacity:0.92"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0.5"/>
    </linearGradient>
    <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.08"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0.14"/>
    </linearGradient>
    <radialGradient id="spot" cx="78%" cy="42%" r="50%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.16"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.35"/>
  <rect width="100%" height="100%" fill="url(#spot)"/>

  ${fiberStrands()}
  ${fiberMesh()}
  ${leftBand()}

  <rect x="0" y="0" width="580" height="${H}" fill="url(#fadeL)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${stroke}" stroke-width="1" rx="4"/>
</svg>`;
}

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const base = 'linkedin-abba-friday-vanguard-post-cover';
  const svg = buildSvg();
  const svgPath = path.join(outDir, `${base}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');

  for (const [label, width] of [
    ['2×', OUT_W],
    ['1×', W],
  ]) {
    const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
      fitTo: { mode: 'width', value: width },
      font: { loadSystemFonts: true, defaultFontFamily: 'Consolas' },
    });
    const png = resvg.render();
    const suffix = width === W ? '-1200x630' : '';
    const pngPath = path.join(outDir, `${base}${suffix}.png`);
    fs.writeFileSync(pngPath, png.asPng());
    console.log('Wrote', pngPath, `${png.width}x${png.height}`, label);
  }
  console.log('Wrote', svgPath);
}

main();
