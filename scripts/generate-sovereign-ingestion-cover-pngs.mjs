/**
 * Sovereign Ingestion serial — 12 cover PNGs (2400×1260, 2× OG).
 * Output: public/book-assets/sovereign-ingestion-covers/ing-01.png … ing-12.png
 * Run: node scripts/generate-sovereign-ingestion-cover-pngs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/book-assets/sovereign-ingestion-covers');
const svgDir = path.join(root, 'content/coderlegion-sovereign-ingestion-serial/images');

const W = 1200;
const H = 630;
const OUT_W = 2400;

const bg = '#09090b';
const amber = '#f59e0b';
const amberDim = 'rgba(245,158,11,0.14)';
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

function baseShell(part, kicker, title, subtitle, diagramSvg) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${amber}" stroke-width="0.3" opacity="0.06"/>
    </pattern>
    <linearGradient id="glow" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0.06"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <line x1="24" y1="96" x2="${W - 24}" y2="96" stroke="${amber}" stroke-width="1" opacity="0.45"/>
  <text x="48" y="72" fill="${amber}" font-family="${mono}" font-size="10" font-weight="600" letter-spacing="0.2em">${esc(kicker)}</text>
  <text x="48" y="152" fill="${fg}" font-family="${sans}" font-size="32" font-weight="700">${esc(title)}</text>
  <text x="48" y="188" fill="${fgMuted}" font-family="${sans}" font-size="14">${esc(subtitle)}</text>
  ${diagramSvg}
  <text x="48" y="${H - 32}" fill="${fgSub}" font-family="${mono}" font-size="9" letter-spacing="0.06em">POCKET PORTFOLIO · SOVEREIGN INGESTION &amp; STATELESS INFERENCE</text>
</svg>`;
}

const covers = [
  {
    n: '01',
    kicker: 'SOVEREIGN INGESTION · PART 01',
    title: 'Invariant boundaries',
    subtitle: 'One deployment · host-aware dual surface',
    diagram: () => `
  <line x1="600" y1="230" x2="600" y2="540" stroke="${amber}" stroke-width="2" opacity="0.85"/>
  <text x="600" y="218" fill="${amber}" font-family="${mono}" font-size="9" font-weight="700" text-anchor="middle" letter-spacing="0.12em">MIDDLEWARE</text>
  <rect x="48" y="250" width="520" height="270" rx="6" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="68" y="286" fill="${amber}" font-family="${mono}" font-size="11" font-weight="700">POCKET · B2C</text>
  <text x="68" y="312" fill="${fgSub}" font-family="${mono}" font-size="9">www.pocketportfolio.app</text>
  <text x="68" y="340" fill="${fgMuted}" font-family="${mono}" font-size="9">app/landing · dashboard harness</text>
  <rect x="632" y="250" width="520" height="270" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1"/>
  <text x="652" y="286" fill="${amber}" font-family="${mono}" font-size="11" font-weight="700">OPEN · B2B</text>
  <text x="652" y="312" fill="${fgSub}" font-family="${mono}" font-size="9">www.openportfolio.co.uk</text>
  <text x="652" y="340" fill="${fgMuted}" font-family="${mono}" font-size="9">app/open/* rewrite · 308 canonical</text>`,
  },
  {
    n: '02',
    kicker: 'SOVEREIGN INGESTION · PART 02',
    title: 'Sanitization by construction',
    subtitle: 'buildPortfolioContext · totals + top-N',
    diagram: () => `
  <rect x="48" y="260" width="1104" height="44" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="68" y="288" fill="${fgSub}" font-family="${mono}" font-size="10">IN: Trade[] in memory (full corpus)</text>
  <path d="M 600 310 L 600 350" stroke="${amber}" stroke-width="2"/>
  <polygon points="600,362 592,348 608,348" fill="${amber}"/>
  <rect x="280" y="370" width="640" height="120" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="410" fill="${amber}" font-family="${mono}" font-size="13" font-weight="700" text-anchor="middle">contextBuilder.ts</text>
  <text x="600" y="438" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">TOP_HOLDINGS_COUNT = 10 · fixed template</text>
  <text x="600" y="462" fill="${fgSub}" font-family="${mono}" font-size="9" text-anchor="middle">no raw ledger rows · no account ids</text>`,
  },
  {
    n: '03',
    kicker: 'SOVEREIGN INGESTION · PART 03',
    title: 'Stateless inference',
    subtitle: 'POST /api/ai/chat · stream · quota metadata',
    diagram: () => `
  <rect x="48" y="280" width="320" height="200" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="208" y="320" fill="${fgMuted}" font-family="${mono}" font-size="11" text-anchor="middle">bounded context</text>
  <text x="208" y="342" fill="${fgSub}" font-family="${mono}" font-size="9" text-anchor="middle">ephemeral per request</text>
  <path d="M 378 380 L 458 380" stroke="${strokeHi}" stroke-width="2"/>
  <polygon points="458,380 446,374 446,386" fill="${amber}"/>
  <rect x="468" y="300" width="264" height="160" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="350" fill="${amber}" font-family="${mono}" font-size="12" font-weight="700" text-anchor="middle">route.ts</text>
  <text x="600" y="378" fill="${fgMuted}" font-family="${mono}" font-size="9" text-anchor="middle">no portfolio payload DB</text>
  <text x="600" y="400" fill="${fgSub}" font-family="${mono}" font-size="9" text-anchor="middle">Firestore/KV · quota only</text>
  <path d="M 742 380 L 822 380" stroke="${strokeHi}" stroke-width="2"/>
  <polygon points="822,380 810,374 810,386" fill="${fgSub}"/>
  <rect x="832" y="320" width="320" height="120" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="992" y="390" fill="${fg}" font-family="${mono}" font-size="12" text-anchor="middle">LLM stream</text>`,
  },
  {
    n: '04',
    kicker: 'SOVEREIGN INGESTION · PART 04',
    title: 'Persistence honesty',
    subtitle: 'Guest localStorage · auth Firebase · cache',
    diagram: () => `
  <rect x="48" y="270" width="340" height="210" rx="6" fill="${card}" stroke="${amber}" stroke-width="1.2"/>
  <text x="218" y="310" fill="${amber}" font-family="${mono}" font-size="10" font-weight="700" text-anchor="middle">GUEST</text>
  <text x="68" y="350" fill="${fgMuted}" font-family="${mono}" font-size="10">localStorage trades</text>
  <rect x="410" y="270" width="340" height="210" rx="6" fill="${cardHi}" stroke="${stroke}"/>
  <text x="580" y="310" fill="${fgMuted}" font-family="${mono}" font-size="10" font-weight="700" text-anchor="middle">AUTH</text>
  <text x="430" y="350" fill="${fgMuted}" font-family="${mono}" font-size="10">Firebase authoritative</text>
  <rect x="772" y="270" width="380" height="210" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="962" y="310" fill="${fgSub}" font-family="${mono}" font-size="10" font-weight="700" text-anchor="middle">IndexedDB</text>
  <text x="792" y="350" fill="${fgSub}" font-family="${mono}" font-size="10">Firestore SDK cache</text>`,
  },
  {
    n: '05',
    kicker: 'SOVEREIGN INGESTION · PART 05',
    title: 'Ingestion interface',
    subtitle: '@pocket-portfolio/importer · MIT · client parse',
    diagram: () => `
  <rect x="48" y="280" width="200" height="180" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="148" y="380" fill="${fgSub}" font-family="${mono}" font-size="11" text-anchor="middle">broker CSV</text>
  <path d="M 258 370 L 338 370" stroke="${amber}" stroke-width="2"/>
  <polygon points="338,370 326,364 326,376" fill="${amber}"/>
  <rect x="348" y="300" width="504" height="140" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="340" fill="${amber}" font-family="${mono}" font-size="12" font-weight="700" text-anchor="middle">packages/importer</text>
  <text x="600" y="368" fill="${fgMuted}" font-family="${mono}" font-size="9" text-anchor="middle">adapters → normalize → Trade[]</text>
  <text x="600" y="390" fill="${fgSub}" font-family="${mono}" font-size="9" text-anchor="middle">universal inference · adversarial tests</text>
  <path d="M 862 370 L 942 370" stroke="${strokeHi}" stroke-width="2"/>
  <rect x="952" y="320" width="200" height="100" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="1052" y="380" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">OpenBrokerCSV</text>`,
  },
  {
    n: '06',
    kicker: 'SOVEREIGN INGESTION · PART 06',
    title: 'Evaluation harness',
    subtitle: 'B2C landing · live adversarial stress',
    diagram: () => `
  <rect x="48" y="260" width="1104" height="220" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1"/>
  <text x="68" y="300" fill="${amber}" font-family="${mono}" font-size="11" font-weight="700">app/landing/page.tsx</text>
  <text x="68" y="328" fill="${fgMuted}" font-family="${mono}" font-size="9">CommunityContent · import flows · whale-scale UX</text>
  <rect x="68" y="360" width="1040" height="96" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="88" y="395" fill="${fgSub}" font-family="${mono}" font-size="9">feeds Open SDK claims · not a plugin marketplace</text>
  <text x="88" y="418" fill="${fgMuted}" font-family="${mono}" font-size="9">README-OSS-WORKFLOW · GitHub Discussions</text>`,
  },
  {
    n: '07',
    kicker: 'SOVEREIGN INGESTION · PART 07',
    title: 'Unit economics at edge',
    subtitle: 'Client rollups before paid inference',
    diagram: () => `
  <rect x="48" y="320" width="480" height="160" rx="6" fill="${card}" stroke="${amber}" stroke-width="1.2"/>
  <text x="288" y="360" fill="${amber}" font-family="${mono}" font-size="11" font-weight="700" text-anchor="middle">BROWSER AGGREGATION</text>
  <text x="68" y="400" fill="${fgMuted}" font-family="${mono}" font-size="9">dashboard math · contextBuilder</text>
  <text x="68" y="422" fill="${fgSub}" font-family="${mono}" font-size="9">narrow LLM hop · Firebase still auth store</text>
  <path d="M 538 400 L 618 400" stroke="${strokeHi}" stroke-width="2"/>
  <rect x="628" y="340" width="524" height="100" rx="6" fill="${cardHi}" stroke="${stroke}"/>
  <text x="890" y="385" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">avoid central analytics mirror of full ledger</text>`,
  },
  {
    n: '08',
    kicker: 'SOVEREIGN INGESTION · PART 08',
    title: 'Limited-scope processor',
    subtitle: 'GDPR Art. 5(1)(c) · minimisation by design',
    diagram: () => `
  <rect x="48" y="280" width="340" height="200" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="218" y="330" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">metadata lane</text>
  <text x="218" y="352" fill="${fgSub}" font-family="${mono}" font-size="9" text-anchor="middle">quota · tier · analytics</text>
  <rect x="430" y="300" width="340" height="160" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="350" fill="${amber}" font-family="${mono}" font-size="11" font-weight="700" text-anchor="middle">bounded corpus</text>
  <text x="600" y="378" fill="${fgMuted}" font-family="${mono}" font-size="9" text-anchor="middle">truncated CSV preview · top-N context</text>
  <rect x="812" y="280" width="340" height="200" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="982" y="330" fill="${fgSub}" font-family="${mono}" font-size="10" text-anchor="middle">engineering narrative</text>
  <text x="982" y="352" fill="${fgSub}" font-family="${mono}" font-size="8" text-anchor="middle">not legal advice</text>`,
  },
  {
    n: '09',
    kicker: 'SOVEREIGN INGESTION · PART 09',
    title: 'Search moat',
    subtitle: 'build-llms-txt · Pocket vs Open manifests',
    diagram: () => `
  <rect x="48" y="290" width="520" height="190" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="308" y="330" fill="${amber}" font-family="${mono}" font-size="10" font-weight="700" text-anchor="middle">public/llms.txt</text>
  <text x="68" y="360" fill="${fgMuted}" font-family="${mono}" font-size="9">B2C machine-readable identity</text>
  <rect x="592" y="290" width="560" height="190" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1"/>
  <text x="872" y="330" fill="${amber}" font-family="${mono}" font-size="10" font-weight="700" text-anchor="middle">public/open/llms.txt</text>
  <text x="612" y="360" fill="${fgMuted}" font-family="${mono}" font-size="9">B2B procurement surface · D7 deploy gate</text>`,
  },
  {
    n: '10',
    kicker: 'SOVEREIGN INGESTION · PART 10',
    title: 'Production gates',
    subtitle: 'CTO · DevOps · Product · release sequence',
    diagram: () => {
      const labels = ['CTO C1–C3', 'DevOps D1–D7', 'Product smoke', 'Release ship'];
      return labels
        .map((l, i) => {
          const x = 48 + i * 280;
          return `<rect x="${x}" y="300" width="260" height="170" rx="4" fill="${i === 0 ? cardHi : card}" stroke="${i === 0 ? amber : stroke}" stroke-width="1"/>
  <text x="${x + 130}" y="395" fill="${i === 0 ? amber : fgMuted}" font-family="${mono}" font-size="12" font-weight="700" text-anchor="middle">${esc(l)}</text>`;
        })
        .join('');
    },
  },
  {
    n: '11',
    kicker: 'SOVEREIGN INGESTION · PART 11',
    title: 'Terminal UX narrative',
    subtitle: '#f59e0b accent · no fintech-blue defaults',
    diagram: () => `
  <rect x="200" y="270" width="800" height="240" rx="8" fill="#0a0a0a" stroke="${stroke}" stroke-width="1"/>
  <rect x="240" y="300" width="720" height="32" rx="2" fill="${cardHi}" stroke="${stroke}"/>
  <text x="260" y="322" fill="${amber}" font-family="${mono}" font-size="10" font-weight="600" letter-spacing="0.12em">var(--accent-warm) · TERMINAL DENSITY</text>
  <line x1="240" y1="360" x2="960" y2="360" stroke="${stroke}" stroke-width="1"/>
  <line x1="240" y1="400" x2="720" y2="400" stroke="${stroke}" stroke-width="1"/>
  <line x1="240" y1="440" x2="880" y2="440" stroke="${stroke}" stroke-width="1"/>
  <text x="260" y="480" fill="${fgSub}" font-family="${mono}" font-size="9">exclude bg-blue-500 · #0070f3 gradients</text>`,
  },
  {
    n: '12',
    kicker: 'SOVEREIGN INGESTION · PART 12',
    title: 'Financial interaction workflow',
    subtitle: 'inspectable protocol · honest roadmap',
    diagram: () => `
  <circle cx="600" cy="400" r="120" fill="none" stroke="${strokeHi}" stroke-width="1"/>
  <circle cx="600" cy="400" r="8" fill="${amber}"/>
  <text x="600" y="280" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">importer</text>
  <text x="780" y="400" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">inference boundary</text>
  <text x="600" y="520" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">dual-surface GTM</text>
  <text x="420" y="400" fill="${fgMuted}" font-family="${mono}" font-size="10" text-anchor="middle">calibration SSOT</text>
  <text x="600" y="560" fill="${fgSub}" font-family="${mono}" font-size="8" text-anchor="middle">OSS loops real · no plugin marketplace yet</text>`,
  },
];

function renderCover(c) {
  const diagram = typeof c.diagram === 'function' ? c.diagram() : c.diagram;
  const svg = baseShell(c.n, c.kicker, c.title, c.subtitle, diagram);
  const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: OUT_W },
    font: { loadSystemFonts: true, defaultFontFamily: 'Consolas' },
  });
  const png = resvg.render();
  const buf = png.asPng();
  const pngPath = path.join(outDir, `ing-${c.n}.png`);
  const svgPath = path.join(svgDir, `ing-${c.n}-cover.svg`);
  fs.writeFileSync(pngPath, buf);
  fs.writeFileSync(svgPath, svg, 'utf8');
  console.log('Wrote', pngPath, `${png.width}x${png.height}`);
  console.log('Wrote', svgPath);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(svgDir)) fs.mkdirSync(svgDir, { recursive: true });

for (const c of covers) {
  try {
    renderCover(c);
  } catch (e) {
    console.error('Failed ing-' + c.n, e.message);
    process.exitCode = 1;
  }
}
