/**
 * LinkedIn personal cover — Abba · Head of AI & Community Operations
 * Art-first v2: minimal copy (profile carries text). Amber terminal aesthetic.
 *
 * Spec: 1584×396 · 2× export for upload.
 * Run: node scripts/generate-linkedin-abba-ai-community-cover.mjs
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
const amberSoft = 'rgba(245,158,11,0.55)';
const amberDim = 'rgba(245,158,11,0.08)';
const amberGlow = 'rgba(245,158,11,0.22)';
const stroke = '#1f1f23';
const strokeHi = 'rgba(245,158,11,0.45)';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Perspective grid — recedes to vanishing point right */
function perspectiveGrid() {
  const vpX = 1180;
  const vpY = 198;
  let lines = '';
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const y = 40 + t * (H - 80);
    lines += `<line x1="0" y1="${y}" x2="${vpX}" y2="${vpY}" stroke="${stroke}" stroke-width="0.6" opacity="0.5"/>`;
  }
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const x = 80 + t * (W - 160);
    lines += `<line x1="${x}" y1="${H}" x2="${vpX}" y2="${vpY}" stroke="${stroke}" stroke-width="0.5" opacity="0.35"/>`;
  }
  return lines;
}

/** Bounded packet — wireframe cube */
function wireCube(cx, cy, size, rot = 0, opacity = 1) {
  const h = size * 0.42;
  const w = size * 0.5;
  const pts = [
    [-w, -h],
    [w, -h],
    [w, h],
    [-w, h],
    [-w * 0.6, -h - size * 0.35],
    [w * 0.6, -h - size * 0.35],
    [w + w * 0.6, -h + size * 0.08],
    [-w + w * 0.6, -h + size * 0.08],
  ];
  const rad = (rot * Math.PI) / 180;
  const tr = (px, py) => {
    const x = px * Math.cos(rad) - py * Math.sin(rad) + cx;
    const y = px * Math.sin(rad) + py * Math.cos(rad) + cy;
    return [x, y];
  };
  const p = pts.map(([x, y]) => tr(x, y));
  const face = `M ${p[0][0]} ${p[0][1]} L ${p[1][0]} ${p[1][1]} L ${p[2][0]} ${p[2][1]} L ${p[3][0]} ${p[3][1]} Z`;
  const top = `M ${p[0][0]} ${p[0][1]} L ${p[4][0]} ${p[4][1]} L ${p[5][0]} ${p[5][1]} L ${p[1][0]} ${p[1][1]}`;
  const side = `M ${p[1][0]} ${p[1][1]} L ${p[5][0]} ${p[5][1]} L ${p[6][0]} ${p[6][1]} L ${p[2][0]} ${p[2][1]}`;
  return `
  <g opacity="${opacity}">
    <path d="${face}" fill="${amberDim}" stroke="${amberSoft}" stroke-width="1.2"/>
    <path d="${top}" fill="none" stroke="${amber}" stroke-width="1.4"/>
    <path d="${side}" fill="none" stroke="${strokeHi}" stroke-width="1"/>
  </g>`;
}

/** Host-aware split — vertical edge beam */
function edgeBeam() {
  const x = 720;
  return `
  <line x1="${x}" y1="32" x2="${x}" y2="${H - 32}" stroke="${amber}" stroke-width="2" opacity="0.9"/>
  <rect x="${x - 4}" y="32" width="8" height="${H - 64}" fill="${amberGlow}" opacity="0.35" filter="url(#blur)"/>
  <circle cx="${x}" cy="${H / 2}" r="48" fill="none" stroke="${amber}" stroke-width="1" opacity="0.25"/>
  <circle cx="${x}" cy="${H / 2}" r="88" fill="none" stroke="${amberSoft}" stroke-width="0.6" opacity="0.15"/>`;
}

/** Constellation — community without labels */
function constellation() {
  const nodes = [
    [920, 118, 4],
    [1010, 92, 5],
    [1100, 130, 4],
    [1180, 88, 5],
    [1260, 140, 4],
    [1320, 100, 3],
    [980, 200, 4],
    [1080, 240, 5],
    [1200, 220, 4],
    [1280, 280, 3],
    [1120, 300, 4],
    [1380, 200, 3],
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [0, 6],
    [1, 6],
    [2, 7],
    [3, 7],
    [4, 8],
    [7, 9],
    [8, 9],
    [3, 10],
    [5, 11],
    [4, 11],
  ];
  let s = '';
  for (const [a, b] of links) {
    const [x1, y1] = nodes[a];
    const [x2, y2] = nodes[b];
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeHi}" stroke-width="0.9"/>`;
  }
  for (const [x, y, r] of nodes) {
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${bg}" stroke="${amber}" stroke-width="1.2"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r + 6}" fill="none" stroke="${amber}" stroke-width="0.4" opacity="0.35"/>`;
  }
  return s;
}

/** Flow arcs — abstract data motion */
function flowArcs() {
  return `
  <path d="M 180 280 Q 380 120 620 200" fill="none" stroke="${amberSoft}" stroke-width="1.2" opacity="0.5"/>
  <path d="M 220 320 Q 440 180 680 240" fill="none" stroke="${strokeHi}" stroke-width="0.8" opacity="0.4"/>
  <path d="M 140 200 Q 360 80 580 160" fill="none" stroke="${amberSoft}" stroke-width="0.7" opacity="0.35"/>
  <circle cx="620" cy="200" r="3" fill="${amber}"/>
  <circle cx="680" cy="240" r="2.5" fill="${amber}" opacity="0.7"/>
  <circle cx="580" cy="160" r="2" fill="${amber}" opacity="0.5"/>`;
}

function buildSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <radialGradient id="spotL" cx="25%" cy="50%" r="55%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.07"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0"/>
    </radialGradient>
    <radialGradient id="spotR" cx="85%" cy="35%" r="50%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0"/>
    </radialGradient>
    <linearGradient id="fadeL" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:0.3"/>
      <stop offset="28%" style="stop-color:${bg};stop-opacity:0.92"/>
      <stop offset="100%" style="stop-color:${bg};stop-opacity:0"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#spotL)"/>
  <rect width="100%" height="100%" fill="url(#spotR)"/>

  ${perspectiveGrid()}
  ${flowArcs()}

  ${wireCube(280, 200, 72, -12, 0.95)}
  ${wireCube(420, 260, 56, 8, 0.75)}
  ${wireCube(520, 140, 48, -6, 0.6)}
  ${wireCube(340, 120, 40, 14, 0.45)}

  ${edgeBeam()}
  ${constellation()}

  ${wireCube(1050, 280, 64, 10, 0.7)}
  ${wireCube(1220, 180, 52, -8, 0.55)}

  <rect x="0" y="0" width="520" height="${H}" fill="url(#fadeL)"/>

  <!-- Single monogram mark only — profile carries title -->
  <rect x="1320" y="28" width="3" height="48" fill="${amber}" opacity="0.85"/>
  <text x="1340" y="58" fill="${amber}" font-family="Consolas, Courier New, Menlo, monospace" font-size="11" font-weight="600" letter-spacing="0.28em" opacity="0.9">PP</text>
</svg>`;
}

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const svg = buildSvg();
  const svgPath = path.join(outDir, 'linkedin-abba-head-ai-community-cover.svg');
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
    const suffix = width === W ? '-1584x396' : '';
    const pngPath = path.join(outDir, `linkedin-abba-head-ai-community-cover${suffix}.png`);
    fs.writeFileSync(pngPath, png.asPng());
    console.log('Wrote', pngPath, `${png.width}x${png.height}`, label);
  }
  console.log('Wrote', svgPath);
}

main();
