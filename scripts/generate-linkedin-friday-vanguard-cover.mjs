/**
 * LinkedIn PROFILE BACKGROUND banner — NOT post cover image.
 * Spec: 1584×396 (4:1) · left safe zone for profile photo overlap.
 * Post cover: scripts/generate-linkedin-friday-vanguard-post-cover.mjs (1200×630).
 *
 * Run: node scripts/generate-linkedin-friday-vanguard-cover.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'marketing');

const W = 1584;
const H = 396;
const OUT_W = 3168;

const bg = '#09090b';
const amber = '#f59e0b';
const amberSoft = 'rgba(245,158,11,0.65)';
const amberDim = 'rgba(245,158,11,0.12)';
const amberGlow = 'rgba(245,158,11,0.28)';
const glass = 'rgba(24,24,27,0.55)';
const stroke = '#27272a';

/** Fiber-optic node mesh — far right, glassmorphism panel */
function fiberMesh() {
  const baseX = 1080;
  const nodes = [
    [1180, 88, 5],
    [1280, 72, 6],
    [1380, 110, 5],
    [1320, 180, 7],
    [1420, 200, 5],
    [1240, 220, 6],
    [1360, 280, 5],
    [1480, 160, 4],
    [1500, 260, 4],
    [1120, 160, 4],
    [1200, 300, 5],
    [1450, 320, 4],
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 7],
    [1, 9],
    [9, 0],
    [1, 3],
    [3, 4],
    [4, 7],
    [3, 5],
    [5, 6],
    [6, 11],
    [4, 8],
    [8, 11],
    [2, 3],
    [5, 10],
    [10, 6],
  ];
  let s = `
  <rect x="${baseX - 40}" y="24" width="${W - baseX + 20}" height="${H - 48}" rx="12" fill="${glass}" stroke="${stroke}" stroke-width="1" opacity="0.85"/>
  <rect x="${baseX - 20}" y="40" width="${W - baseX}" height="${H - 80}" fill="url(#glassSheen)" opacity="0.4"/>`;
  for (const [a, b] of links) {
    const [x1, y1] = nodes[a];
    const [x2, y2] = nodes[b];
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${amberSoft}" stroke-width="1.4" opacity="0.7"/>`;
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${amberGlow}" stroke-width="4" opacity="0.25" filter="url(#glow)"/>`;
  }
  for (const [x, y, r] of nodes) {
    s += `<circle cx="${x}" cy="${y}" r="${r + 10}" fill="${amberGlow}" opacity="0.35" filter="url(#glow)"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${bg}" stroke="${amber}" stroke-width="1.5"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r - 1.5}" fill="${amberDim}"/>`;
  }
  return s;
}

/** Edge-lit amber strands — macro fiber feel */
function fiberStrands() {
  let s = '';
  const strands = [
    'M 1020 320 C 1120 280, 1240 200, 1320 120',
    'M 1040 340 C 1160 300, 1280 240, 1400 140',
    'M 1000 300 C 1100 260, 1200 180, 1280 100',
    'M 1060 360 C 1180 320, 1300 260, 1420 180',
  ];
  for (const d of strands) {
    s += `<path d="${d}" fill="none" stroke="${amberSoft}" stroke-width="1.2" opacity="0.45"/>`;
    s += `<path d="${d}" fill="none" stroke="${amberGlow}" stroke-width="3" opacity="0.2" filter="url(#glow)"/>`;
  }
  return s;
}

function buildSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:1"/>
      <stop offset="55%" style="stop-color:${bg};stop-opacity:0.98"/>
      <stop offset="72%" style="stop-color:${bg};stop-opacity:0.75"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0"/>
    </linearGradient>
    <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.06"/>
      <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.03"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0.1"/>
    </linearGradient>
    <radialGradient id="spotR" cx="92%" cy="45%" r="45%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.14"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0"/>
    </radialGradient>
  </defs>

  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#spotR)"/>

  ${fiberStrands()}
  ${fiberMesh()}

  <rect x="0" y="0" width="${Math.round(W * 0.58)}" height="${H}" fill="url(#fadeLeft)"/>
</svg>`;
}

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const base = 'linkedin-abba-friday-vanguard-cover';
  const svg = buildSvg();
  const svgPath = path.join(outDir, `${base}.svg`);
  fs.writeFileSync(svgPath, svg, 'utf8');

  for (const [label, width] of [
    ['2×', OUT_W],
    ['1×', W],
  ]) {
    const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
      fitTo: { mode: 'width', value: width },
      font: { loadSystemFonts: true },
    });
    const png = resvg.render();
    const suffix = width === W ? '-1584x396' : '';
    const pngPath = path.join(outDir, `${base}${suffix}.png`);
    fs.writeFileSync(pngPath, png.asPng());
    console.log('Wrote', pngPath, `${png.width}x${png.height}`, label);
  }
  console.log('Wrote', svgPath);
}

main();
