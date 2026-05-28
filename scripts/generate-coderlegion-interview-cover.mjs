/**
 * CoderLegion interview feature cover — 1200×630 OG / article header.
 * Split-brain host-aware architecture · Pocket (B2C) | Open (B2B).
 *
 * Run: node scripts/generate-coderlegion-interview-cover.mjs
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

const black = '#000000';
const amber = '#f59e0b';
const amberDim = 'rgba(245,158,11,0.14)';
const fg = '#f4f4f5';
const fgMuted = '#a1a1aa';
const fgSub = '#71717a';
const stroke = '#27272a';
const strokeHi = 'rgba(245,158,11,0.4)';
const card = '#0a0a0a';
const cardHi = '#141414';
const indigo = '#6366f1';

const mono = 'Consolas, Courier New, Menlo, Liberation Mono, monospace';
const sans = 'Segoe UI, Helvetica Neue, Arial, sans-serif';

/** Layout grid — all coordinates derived from these constants */
const G = {
  splitX: W / 2,
  frame: { x: 24, y: 24, w: W - 48, h: H - 48 },
  ruleY: 100,
  kickerY: 68,
  headlineY: 112,
  headlineLine: 32,
  edgeLabelY: 168,
  panelTop: 184,
  panelH: 368,
  pad: 16,
  panelGutter: 24,
  left: { x: 40, w: 548 },
  right: { x: 612, w: 548 },
};

G.panelBottom = G.panelTop + G.panelH;
G.edgeLineY1 = G.panelTop + 12;
G.edgeLineY2 = G.panelBottom - 12;

G.left.innerX = G.left.x + G.pad;
G.left.innerW = G.left.w - G.pad * 2;
G.left.innerRight = G.left.innerX + G.left.innerW;

G.right.innerX = G.right.x + G.pad;
G.right.innerW = G.right.w - G.pad * 2;
G.right.innerRight = G.right.innerX + G.right.innerW;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function gridPattern(id, opacity) {
  return `
    <pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="${amber}" stroke-width="0.35" opacity="${opacity}"/>
    </pattern>`;
}

/** Micro data-flow lines — header band only, evenly spaced */
function headerStreams(innerX, innerRight, y0, y1, count = 3) {
  const span = y1 - y0;
  const step = span / (count + 1);
  let out = '';
  for (let i = 1; i <= count; i++) {
    const y = Math.round(y0 + step * i);
    const xEnd = innerRight - 20;
    const xStart = innerX + 20;
    const xMid = Math.round(xStart + (xEnd - xStart) * (0.55 + (i % 2) * 0.12));
    out += `<line x1="${xStart}" y1="${y}" x2="${xMid}" y2="${y}" stroke="${strokeHi}" stroke-width="1" opacity="0.45"/>`;
    out += `<circle cx="${xMid}" cy="${y}" r="2" fill="${amber}" opacity="0.75"/>`;
  }
  return out;
}

function tickerTable(innerX, innerRight, tableTop) {
  const inset = 12;
  const colTicker = innerX + inset;
  const colStatus = innerX + 136;
  const colLatency = innerRight - inset;
  const tableH = 200;
  const headerY = tableTop + 24;
  const row0 = tableTop + 48;
  const rowStep = 34;

  const rows = [
    ['AAPL', 'ingest ✓', '0.12ms'],
    ['VWRL.L', 'normalize ✓', '0.08ms'],
    ['BTC-USD', 'adversarial ✓', '0.31ms'],
    ['TSLA', 'fuzz pass ✓', '0.19ms'],
    ['MSFT', 'harness ✓', '0.11ms'],
  ];

  const body = rows
    .map((row, i) => {
      const y = row0 + i * rowStep;
      return `
  <text x="${colTicker}" y="${y}" fill="${fgMuted}" font-family="${mono}" font-size="11">${esc(row[0])}</text>
  <text x="${colStatus}" y="${y}" fill="${amber}" font-family="${mono}" font-size="10">${esc(row[1])}</text>
  <text x="${colLatency}" y="${y}" fill="${fgSub}" font-family="${mono}" font-size="10" text-anchor="end">${esc(row[2])}</text>`;
    })
    .join('');

  return `
  <rect x="${innerX}" y="${tableTop}" width="${innerRight - innerX}" height="${tableH}" rx="4" fill="${cardHi}" stroke="${stroke}" stroke-width="1"/>
  <line x1="${innerX + 12}" y1="${tableTop + 36}" x2="${innerRight - 12}" y2="${tableTop + 36}" stroke="${stroke}" stroke-width="1"/>
  <text x="${colTicker}" y="${headerY}" fill="${fgSub}" font-family="${mono}" font-size="9">TICKER</text>
  <text x="${colStatus}" y="${headerY}" fill="${fgSub}" font-family="${mono}" font-size="9">STATUS</text>
  <text x="${colLatency}" y="${headerY}" fill="${fgSub}" font-family="${mono}" font-size="9" text-anchor="end">LATENCY</text>
  ${body}`;
}

function sovereignReceipt(innerX, innerRight) {
  const rx = innerX;
  const rw = innerRight - innerX;
  const rh = 108;
  const ry = G.panelTop + G.pad + 92;
  const inset = 20;
  const sepY = ry + Math.round(rh / 2);
  const pocW = 104;
  const pocH = 72;
  const pocX = innerRight - inset - pocW;
  const pocY = ry + Math.round((rh - pocH) / 2);
  const textLeft = rx + inset;
  const sepX1 = rx + inset;
  const sepX2 = pocX - 16;

  return `
  <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="6" fill="${cardHi}" stroke="${stroke}" stroke-width="1"/>
  <text x="${textLeft}" y="${ry + 22}" fill="${fgSub}" font-family="${mono}" font-size="9" letter-spacing="0.08em">VERIFIED SUBSTRATE RECEIPT</text>
  <text x="${textLeft}" y="${ry + 48}" fill="${fg}" font-family="${mono}" font-size="20" font-weight="700">£7B</text>
  <text x="${textLeft + 56}" y="${ry + 48}" fill="${fgMuted}" font-family="${mono}" font-size="11">managed asset substrate</text>
  <line x1="${sepX1}" y1="${sepY}" x2="${sepX2}" y2="${sepY}" stroke="${stroke}" stroke-width="1"/>
  <text x="${textLeft}" y="${ry + rh - 22}" fill="${fg}" font-family="${mono}" font-size="20" font-weight="700">4.7B</text>
  <text x="${textLeft + 56}" y="${ry + rh - 22}" fill="${fgMuted}" font-family="${mono}" font-size="11">data points · Whale Watch</text>
  <rect x="${pocX}" y="${pocY}" width="${pocW}" height="${pocH}" rx="4" fill="${amberDim}" stroke="${amber}" stroke-width="1"/>
  <text x="${pocX + pocW / 2}" y="${pocY + 30}" fill="${amber}" font-family="${mono}" font-size="9" font-weight="700" text-anchor="middle">POC</text>
  <text x="${pocX + pocW / 2}" y="${pocY + 48}" fill="${fgMuted}" font-family="${mono}" font-size="8" text-anchor="middle">VALIDATED</text>`;
}

function bottomFlowCards(innerX, innerRight) {
  const gap = 12;
  const cardH = 56;
  const cardW = Math.floor((innerRight - innerX - gap * 2) / 3);
  const rowY = G.panelBottom - G.pad - cardH;
  const cards = [
    { label: 'middleware', value: 'host-aware split', accent: false },
    { label: 'network edge', value: '308 → Open canonical', accent: false },
    { label: 'dual-surface', value: 'one repo · domain rewrite', accent: true },
  ];

  return cards
    .map((c, i) => {
      const x = innerX + i * (cardW + gap);
      const labelY = rowY + 22;
      const valueY = rowY + 40;
      const fill = c.accent ? amberDim : card;
      const border = c.accent ? amber : stroke;
      const labelFill = c.accent ? amber : fgSub;
      return `
  <rect x="${x}" y="${rowY}" width="${cardW}" height="${cardH}" rx="4" fill="${fill}" stroke="${border}" stroke-width="1"/>
  <text x="${x + 14}" y="${labelY}" fill="${labelFill}" font-family="${mono}" font-size="8" font-weight="${c.accent ? 700 : 400}">${esc(c.label)}</text>
  <text x="${x + 14}" y="${valueY}" fill="${fgMuted}" font-family="${mono}" font-size="9">${esc(c.value)}</text>`;
    })
    .join('');
}

function panelChrome(side) {
  const p = side === 'left' ? G.left : G.right;
  const innerX = side === 'left' ? G.left.innerX : G.right.innerX;
  const innerRight = side === 'left' ? G.left.innerRight : G.right.innerRight;
  const textX = innerX + 12;
  const titleY1 = G.panelTop + G.pad + 14;
  const titleY2 = titleY1 + 20;
  const titleY3 = titleY1 + 50;
  const titleY4 = titleY1 + 70;
  const streamY0 = titleY4 + 8;
  const streamY1 = streamY0 + 36;

  if (side === 'left') {
    return `
  <rect x="${p.x}" y="${G.panelTop}" width="${p.w}" height="${G.panelH}" rx="6" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="${textX}" y="${titleY1}" fill="${amber}" font-family="${mono}" font-size="12" font-weight="700" letter-spacing="0.06em">POCKET PORTFOLIO</text>
  <text x="${textX}" y="${titleY2}" fill="${fgSub}" font-family="${mono}" font-size="10">pocketportfolio.app · B2C harness</text>
  <text x="${textX}" y="${titleY3}" fill="${fgMuted}" font-family="${mono}" font-size="10">High-fidelity adversarial test harness</text>
  <text x="${textX}" y="${titleY4}" fill="${fgSub}" font-family="${mono}" font-size="9">millions of simulated retail tickers · edge-first ingest</text>
  ${headerStreams(innerX, innerRight, streamY0, streamY1)}
  ${tickerTable(innerX, innerRight, G.panelTop + G.pad + 98)}
  <text x="${textX}" y="${G.panelBottom - 10}" fill="${amber}" font-family="${mono}" font-size="9" opacity="0.85">stateless ingest · in-browser adapters · IndexedDB vault</text>`;
  }

  return `
  <rect x="${p.x}" y="${G.panelTop}" width="${p.w}" height="${G.panelH}" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1"/>
  <text x="${textX}" y="${titleY1}" fill="${amber}" font-family="${mono}" font-size="12" font-weight="700" letter-spacing="0.06em">OPEN PORTFOLIO</text>
  <text x="${textX}" y="${titleY2}" fill="${fgSub}" font-family="${mono}" font-size="10">openportfolio.co.uk · sovereign gateway</text>
  <text x="${textX}" y="${titleY3}" fill="${fgMuted}" font-family="${mono}" font-size="10">Deterministic compliance surface · procurement guardrails</text>
  ${headerStreams(innerX, innerRight, streamY0, streamY1)}
  ${sovereignReceipt(innerX, innerRight)}
  ${bottomFlowCards(innerX, innerRight)}`;
}

function buildSvg() {
  const headlineL1 = 'Sovereign Architecture: Building the';
  const headlineL2 = 'Stateless Financial Ingest.';
  const tags = ['#fca', '#compliance', '#stateless', '#importer'];
  const tagY = G.panelBottom + 22;
  const tagX0 = G.left.innerX + 12;
  const tagGap = 116;
  const ribbonW = 296;
  const ribbonX = G.frame.x + G.frame.w - ribbonW - 28;

  const tagRow = tags
    .map((t, i) => {
      const x = tagX0 + i * tagGap;
      return `<text x="${x}" y="${tagY}" fill="${amber}" font-family="${mono}" font-size="11" font-weight="600">${esc(t)}</text>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${gridPattern('gridL', 0.05)}
    ${gridPattern('gridR', 0.04)}
    <linearGradient id="indigoAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${indigo};stop-opacity:0"/>
      <stop offset="40%" style="stop-color:${indigo};stop-opacity:0.35"/>
      <stop offset="100%" style="stop-color:${indigo};stop-opacity:0"/>
    </linearGradient>
    <linearGradient id="edgeGlow" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0"/>
      <stop offset="40%" style="stop-color:${amber};stop-opacity:0.9"/>
      <stop offset="60%" style="stop-color:${amber};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="${black}"/>
  <rect x="0" y="0" width="${G.splitX}" height="${H}" fill="url(#gridL)"/>
  <rect x="${G.splitX}" y="0" width="${G.splitX}" height="${H}" fill="url(#gridR)"/>

  <rect x="${G.frame.x}" y="${G.frame.y}" width="${G.frame.w}" height="${G.frame.h}" rx="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <line x1="${G.frame.x}" y1="${G.ruleY}" x2="${G.frame.x + G.frame.w}" y2="${G.ruleY}" stroke="${amber}" stroke-width="1" opacity="0.4"/>

  <text x="${G.frame.x + 28}" y="${G.kickerY}" fill="${amber}" font-family="${mono}" font-size="10" font-weight="600" letter-spacing="0.2em">CODERLEGION · INTERVIEW FEATURE</text>
  <rect x="${ribbonX}" y="48" width="${ribbonW}" height="28" rx="3" fill="url(#indigoAccent)" opacity="0.25"/>
  <text x="${ribbonX + ribbonW / 2}" y="67" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle" letter-spacing="0.06em">JOURNEY LABS · BUILD IN PUBLIC</text>

  <text x="${G.frame.x + 28}" y="${G.headlineY}" fill="${fg}" font-family="${sans}" font-size="24" font-weight="700">${esc(headlineL1)}</text>
  <text x="${G.frame.x + 28}" y="${G.headlineY + G.headlineLine}" fill="${fg}" font-family="${sans}" font-size="24" font-weight="700">${esc(headlineL2)}</text>

  <line x1="${G.splitX}" y1="${G.edgeLineY1}" x2="${G.splitX}" y2="${G.edgeLineY2}" stroke="${amber}" stroke-width="2" opacity="0.95"/>
  <rect x="${G.splitX - 3}" y="${G.edgeLineY1}" width="6" height="${G.edgeLineY2 - G.edgeLineY1}" fill="url(#edgeGlow)" opacity="0.35"/>
  <text x="${G.splitX}" y="${G.edgeLabelY}" fill="${amber}" font-family="${mono}" font-size="9" font-weight="700" text-anchor="middle" letter-spacing="0.14em" dominant-baseline="middle">HOST-AWARE EDGE</text>

  ${panelChrome('left')}
  ${panelChrome('right')}

  ${tagRow}
  <text x="${tagX0}" y="${H - 26}" fill="${fgSub}" font-family="${mono}" font-size="9" letter-spacing="0.05em">POCKET PORTFOLIO × CODERLEGION · SOVEREIGN STACK</text>
</svg>`;
}

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const svg = buildSvg();
  const svgPath = path.join(outDir, 'coderlegion-interview-cover.svg');
  fs.writeFileSync(svgPath, svg, 'utf8');

  const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: OUT_W },
    font: { loadSystemFonts: true, defaultFontFamily: 'Consolas' },
  });
  const png = resvg.render();
  const outPath = path.join(outDir, 'coderlegion-interview-cover.png');
  fs.writeFileSync(outPath, png.asPng());

  console.log('Wrote', svgPath);
  console.log('Wrote', outPath, `${png.width}x${png.height}`);
}

main();
