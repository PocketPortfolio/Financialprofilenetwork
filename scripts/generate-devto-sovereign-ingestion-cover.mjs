/**
 * dev.to cover — Sovereign Ingestion 12-part series consolidation.
 * 1200×630 OG · 2400×1260 export.
 *
 * Run: node scripts/generate-devto-sovereign-ingestion-cover.mjs
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
const amberDim = 'rgba(245,158,11,0.12)';
const fg = '#f4f4f5';
const fgMuted = '#a1a1aa';
const fgSub = '#71717a';
const stroke = '#27272a';
const strokeHi = 'rgba(245,158,11,0.4)';
const card = '#0a0a0a';
const cardHi = '#141414';
const mono = 'Consolas, Courier New, Menlo, monospace';
const sans = 'Segoe UI, Helvetica Neue, Arial, sans-serif';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function partGrid() {
  const cols = 4;
  const rows = 3;
  const pad = 48;
  const gridX = 620;
  const gridY = 228;
  const cellW = 128;
  const cellH = 52;
  const gap = 10;
  let out = '';
  for (let i = 0; i < 12; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = gridX + col * (cellW + gap);
    const y = gridY + row * (cellH + gap);
    const n = String(i + 1).padStart(2, '0');
    const accent = i === 0 || i === 11;
    out += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" fill="${accent ? amberDim : card}" stroke="${accent ? amber : stroke}" stroke-width="1"/>`;
    out += `<text x="${x + 14}" y="${y + 22}" fill="${accent ? amber : fgSub}" font-family="${mono}" font-size="9" font-weight="700">PART ${n}</text>`;
    const labels = [
      'boundaries',
      'sanitization',
      'inference',
      'persistence',
      'importer',
      'harness',
      'economics',
      'compliance',
      'search moat',
      'prod gates',
      'terminal UX',
      'workflow',
    ];
    out += `<text x="${x + 14}" y="${y + 40}" fill="${fgMuted}" font-family="${mono}" font-size="8">${esc(labels[i])}</text>`;
  }
  return out;
}

function buildSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="${amber}" stroke-width="0.35" opacity="0.05"/>
    </pattern>
    <linearGradient id="edgeGlow" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0"/>
      <stop offset="45%" style="stop-color:${amber};stop-opacity:0.85"/>
      <stop offset="55%" style="stop-color:${amber};stop-opacity:0.85"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <line x1="24" y1="96" x2="${W - 24}" y2="96" stroke="${amber}" stroke-width="1" opacity="0.4"/>

  <text x="48" y="72" fill="${amber}" font-family="${mono}" font-size="10" font-weight="600" letter-spacing="0.18em">DEV.TO · SERIES CONSOLIDATION</text>
  <text x="48" y="148" fill="${fg}" font-family="${sans}" font-size="32" font-weight="700">Sovereign Ingestion &amp;</text>
  <text x="48" y="188" fill="${fg}" font-family="${sans}" font-size="32" font-weight="700">Stateless Inference</text>

  <rect x="48" y="228" width="540" height="320" rx="6" fill="${cardHi}" stroke="${stroke}" stroke-width="1"/>
  <line x1="318" y1="248" x2="318" y2="528" stroke="url(#edgeGlow)" stroke-width="2"/>
  <text x="68" y="262" fill="${amber}" font-family="${mono}" font-size="10" font-weight="700">POCKET · harness</text>
  <text x="338" y="262" fill="${amber}" font-family="${mono}" font-size="10" font-weight="700">OPEN · gateway</text>
  <text x="68" y="290" fill="${fgSub}" font-family="${mono}" font-size="9">middleware.ts · one monorepo</text>
  <text x="68" y="320" fill="${fgMuted}" font-family="${mono}" font-size="9">contextBuilder → /api/ai/chat</text>
  <text x="68" y="350" fill="${fgMuted}" font-family="${mono}" font-size="9">@pocket-portfolio/importer (MIT)</text>
  <rect x="68" y="380" width="220" height="140" rx="4" fill="${card}" stroke="${strokeHi}" stroke-width="1"/>
  <text x="88" y="412" fill="${fgSub}" font-family="${mono}" font-size="8">BOUNDED CONTEXT</text>
  <text x="88" y="434" fill="${fgMuted}" font-family="${mono}" font-size="9">totals + top-N only</text>
  <rect x="308" y="380" width="260" height="140" rx="4" fill="${amberDim}" stroke="${amber}" stroke-width="1"/>
  <text x="328" y="412" fill="${amber}" font-family="${mono}" font-size="8" font-weight="700">CLONE-AND-GREP MOAT</text>
  <text x="328" y="434" fill="${fgMuted}" font-family="${mono}" font-size="9">calibration ledger SSOT</text>
  <text x="328" y="456" fill="${fgMuted}" font-family="${mono}" font-size="9">deploy gates · llms.txt</text>

  ${partGrid()}

  <text x="48" y="${H - 28}" fill="${fgSub}" font-family="${mono}" font-size="9" letter-spacing="0.05em">POCKET PORTFOLIO · CODERLEGION · OPEN PORTFOLIO</text>
</svg>`;
}

function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const svg = buildSvg();
  const svgPath = path.join(outDir, 'devto-sovereign-ingestion-serial-cover.svg');
  fs.writeFileSync(svgPath, svg, 'utf8');

  const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: OUT_W },
    font: { loadSystemFonts: true, defaultFontFamily: 'Consolas' },
  });
  const png = resvg.render();
  const pngPath = path.join(outDir, 'devto-sovereign-ingestion-serial-cover.png');
  fs.writeFileSync(pngPath, png.asPng());

  console.log('Wrote', svgPath);
  console.log('Wrote', pngPath, `${png.width}x${png.height}`);
}

main();
