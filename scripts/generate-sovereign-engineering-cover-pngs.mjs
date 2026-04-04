/**
 * Renders Sovereign Engineering serial cover PNGs (2400x1260, 2x for crisp OG/social).
 * Output: public/book-assets/sovereign-engineering-covers/se-01.png ... se-12.png
 * Run: node scripts/generate-sovereign-engineering-cover-pngs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/book-assets/sovereign-engineering-covers');

const W = 1200;
const H = 630;
const OUT_W = 2400;

const amber = '#f59e0b';
const amberDim = 'rgba(245,158,11,0.12)';
const fg = '#f4f4f5';
const fgMuted = '#a1a1aa';
const fgSub = '#71717a';
const stroke = '#27272a';
const strokeHi = 'rgba(245,158,11,0.35)';
const card = '#141414';
const cardHi = '#18181b';

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
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f10"/>
      <stop offset="50%" style="stop-color:#0a0a0b"/>
      <stop offset="100%" style="stop-color:#050506"/>
    </linearGradient>
    <linearGradient id="glow" x1="80%" y1="0%" x2="100%" y2="60%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0.07"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <line x1="28" y1="108" x2="${W - 28}" y2="108" stroke="${amber}" stroke-width="1" opacity="0.45"/>
  <text x="52" y="78" fill="${amber}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.22em">${esc(kicker)}</text>
  <text x="52" y="168" fill="${fg}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="36" font-weight="700">${esc(title)}</text>
  <text x="52" y="212" fill="${fgMuted}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="15" font-weight="400">${esc(subtitle)}</text>
  ${diagramSvg}
  <text x="52" y="${H - 36}" fill="${fgSub}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="10" letter-spacing="0.06em">POCKET PORTFOLIO · SOVEREIGN ENGINEERING</text>
</svg>`;
}

const covers = [
  {
    n: '01',
    kicker: `SOVEREIGN ENGINEERING · PART 01`,
    title: 'The compliance trap',
    subtitle: 'Transient inference, not central ledgers',
    diagram: () => {
      const y = 300;
      const h = 76;
      return `
  <rect x="52" y="${y}" width="200" height="${h}" rx="6" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="152" y="${y + 38}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Data at rest</text>
  <text x="152" y="${y + 56}" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Central store risk</text>
  <path d="M 262 ${y + h / 2} L 318 ${y + h / 2}" stroke="${strokeHi}" stroke-width="2"/>
  <polygon points="318,${y + h / 2} 310,${y + h / 2 - 5} 310,${y + h / 2 + 5}" fill="${amber}" opacity="0.9"/>
  <rect x="328" y="${y}" width="240" height="${h}" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="448" y="${y + 38}" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Stateless API</text>
  <text x="448" y="${y + 56}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">No portfolio payload DB</text>
  <path d="M 578 ${y + h / 2} L 634 ${y + h / 2}" stroke="${strokeHi}" stroke-width="2"/>
  <polygon points="634,${y + h / 2} 626,${y + h / 2 - 5} 626,${y + h / 2 + 5}" fill="${fgSub}"/>
  <rect x="644" y="${y}" width="160" height="${h}" rx="6" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="724" y="${y + 44}" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Inference</text>`;
    },
  },
  {
    n: '02',
    kicker: 'SOVEREIGN ENGINEERING · PART 02',
    title: 'Split-brain architecture',
    subtitle: 'Client memory · stateless reasoning',
    diagram: () => `
  <line x1="600" y1="260" x2="600" y2="520" stroke="${strokeHi}" stroke-width="1" stroke-dasharray="4 6"/>
  <rect x="52" y="280" width="500" height="220" rx="8" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="302" y="318" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">CLIENT EDGE</text>
  <text x="72" y="360" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Trades &amp; positions in-browser</text>
  <text x="72" y="388" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">buildPortfolioContext()</text>
  <rect x="648" y="280" width="500" height="220" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1" opacity="0.95"/>
  <text x="898" y="318" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">STATELESS API</text>
  <text x="668" y="360" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">POST /api/ai/chat</text>
  <text x="668" y="388" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Stream out · no ledger store</text>`,
  },
  {
    n: '03',
    kicker: 'SOVEREIGN ENGINEERING · PART 03',
    title: 'Sanitization by construction',
    subtitle: 'Structural exclusion · top-N holdings',
    diagram: () => `
  <rect x="52" y="280" width="1096" height="48" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="72" y="310" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="12">Input: full trade history (in memory only)</text>
  <path d="M 600 340 L 600 380" stroke="${amber}" stroke-width="2"/>
  <polygon points="600,392 592,378 608,378" fill="${amber}"/>
  <rect x="320" y="400" width="560" height="100" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="438" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Edge compiler</text>
  <text x="600" y="462" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Totals + 10 lines max · fixed schema</text>`,
  },
  {
    n: '04',
    kicker: 'SOVEREIGN ENGINEERING · PART 04',
    title: 'Scale under spike load',
    subtitle: 'Routing, quotas, and referral integrity',
    diagram: () => {
      const bx = [80, 200, 320, 440, 560];
      const bh = [120, 180, 240, 280, 300];
      return (
        bx
          .map(
            (x, i) =>
              `<rect x="${x}" y="${520 - bh[i]}" width="72" height="${bh[i]}" rx="4" fill="${amberDim}" stroke="${amber}" stroke-width="1" opacity="${0.35 + i * 0.12}"/>`
          )
          .join('') +
        `<text x="720" y="320" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="13">Verify GA4 + ops metrics at publish.</text>
  <text x="720" y="348" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="11">Apex to www · streaming timeouts · hot writes</text>`
      );
    },
  },
  {
    n: '05',
    kicker: 'SOVEREIGN ENGINEERING · PART 05',
    title: 'Browser-local vault',
    subtitle: 'Guest storage · auth sync · prefs only',
    diagram: () => `
  <rect x="52" y="290" width="330" height="200" rx="8" fill="${card}" stroke="${amber}" stroke-width="1.2"/>
  <text x="217" y="330" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">GUEST</text>
  <text x="72" y="368" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11">localStorage trades</text>
  <rect x="410" y="290" width="330" height="200" rx="8" fill="${card}" stroke="${stroke}"/>
  <text x="575" y="330" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">SIGNED IN</text>
  <text x="430" y="368" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11">Cloud-backed positions</text>
  <rect x="768" y="290" width="380" height="200" rx="8" fill="${card}" stroke="${stroke}"/>
  <text x="958" y="330" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">UI PREFS</text>
  <text x="788" y="368" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="11">Zustand persist · partial state</text>`,
  },
  {
    n: '06',
    kicker: 'SOVEREIGN ENGINEERING · PART 06',
    title: 'Prompt grounding',
    subtitle: 'System · context · quotes · attachments',
    diagram: () => `
  <rect x="52" y="280" width="1096" height="56" rx="4" fill="${cardHi}" stroke="${amber}" stroke-width="1"/>
  <text x="72" y="314" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700">SYSTEM_PROMPT</text>
  <rect x="52" y="348" width="1096" height="48" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="72" y="378" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11">Portfolio context block (client-built)</text>
  <rect x="52" y="408" width="1096" height="48" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="72" y="438" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11">Live quotes + optional file (paid)</text>`,
  },
  {
    n: '07',
    kicker: 'SOVEREIGN ENGINEERING · PART 07',
    title: 'Referral loop',
    subtitle: 'Events without portfolio telemetry',
    diagram: () => `
  <ellipse cx="600" cy="400" rx="200" ry="120" fill="none" stroke="${strokeHi}" stroke-width="1.5"/>
  <rect x="520" y="360" width="160" height="80" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="395" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" text-anchor="middle">REF EVENT</text>
  <text x="600" y="418" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">click / conversion</text>
  <text x="320" y="320" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10">POST referral-event</text>
  <text x="320" y="460" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10">POST referral/complete</text>
  <path d="M 800 400 A 200 120 0 1 1 401 398" fill="none" stroke="${amber}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>`,
  },
  {
    n: '08',
    kicker: 'SOVEREIGN ENGINEERING · PART 08',
    title: 'Amber terminal email',
    subtitle: 'Brand as code · inline HTML tokens',
    diagram: () => `
  <rect x="200" y="270" width="800" height="260" rx="10" fill="#111111" stroke="#333333" stroke-width="1"/>
  <rect x="240" y="300" width="720" height="36" rx="2" fill="#1a1a1a" stroke="#2a2a2a"/>
  <text x="260" y="323" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="10" font-weight="600" letter-spacing="0.15em">LOCAL-FIRST · SOVEREIGN AI</text>
  <text x="260" y="380" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="22" font-weight="700">Product update</text>
  <text x="260" y="418" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="13">#0a0a0a surface · #f59e0b accent</text>`,
  },
  {
    n: '09',
    kicker: 'SOVEREIGN ENGINEERING · PART 09',
    title: 'Operator analytics',
    subtitle: 'Aggregates · not user ledgers',
    diagram: () => {
      let s = '';
      const x0 = 52;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const xi = x0 + col * 360;
          const yi = 290 + row * 110;
          const isPrimary = row === 0 && col === 0;
          s += `<rect x="${xi}" y="${yi}" width="340" height="95" rx="4" fill="${isPrimary ? cardHi : card}" stroke="${isPrimary ? amber : stroke}" stroke-width="${isPrimary ? 1.5 : 1}"/>`;
        }
      }
      s += `<text x="222" y="345" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Referrals</text>`;
      s += `<text x="582" y="345" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Revenue</text>`;
      s += `<text x="942" y="345" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Product usage</text>`;
      return s;
    },
  },
  {
    n: '10',
    kicker: 'SOVEREIGN ENGINEERING · PART 10 · ROADMAP',
    title: 'Beyond CSV',
    subtitle: 'Statements · extract · confirm · parse',
    diagram: () => `
  <rect x="80" y="320" width="180" height="220" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="170" y="440" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="12" text-anchor="middle">PDF</text>
  <path d="M 280 430 L 360 430" stroke="${amber}" stroke-width="2"/>
  <polygon points="360,430 348,424 348,436" fill="${amber}"/>
  <rect x="380" y="340" width="440" height="180" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1" stroke-dasharray="6 4"/>
  <text x="600" y="400" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Pipeline (roadmap)</text>
  <text x="600" y="428" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Human review before ledger</text>
  <path d="M 840 430 L 920 430" stroke="${amber}" stroke-width="2"/>
  <polygon points="920,430 908,424 908,436" fill="${amber}"/>
  <rect x="940" y="360" width="208" height="140" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="1044" y="445" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12" text-anchor="middle">Trades</text>`,
  },
  {
    n: '11',
    kicker: 'SOVEREIGN ENGINEERING · PART 11 · VISION',
    title: 'Institutional gateway',
    subtitle: 'Narrow data contract · stateless stream',
    diagram: () => `
  <rect x="80" y="340" width="280" height="150" rx="8" fill="${card}" stroke="${stroke}"/>
  <text x="220" y="395" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Bank edge</text>
  <text x="220" y="418" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Aggregated context</text>
  <path d="M 370 415 L 450 415" stroke="${amber}" stroke-width="2"/>
  <polygon points="450,415 438,409 438,421" fill="${amber}"/>
  <rect x="460" y="310" width="280" height="210" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="380" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" text-anchor="middle">STATELESS API</text>
  <text x="600" y="408" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">No vendor ledger store</text>
  <path d="M 750 415 L 830 415" stroke="${amber}" stroke-width="2"/>
  <polygon points="830,415 818,409 818,421" fill="${amber}"/>
  <rect x="840" y="350" width="308" height="130" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="994" y="425" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Model</text>`,
  },
  {
    n: '12',
    kicker: 'SOVEREIGN ENGINEERING · PART 12',
    title: 'Route to rise',
    subtitle: 'Shipped truth · honest roadmap',
    diagram: () => `
  <circle cx="600" cy="400" r="140" fill="none" stroke="${stroke}" stroke-width="1"/>
  <ellipse cx="600" cy="400" rx="260" ry="100" fill="none" stroke="${strokeHi}" stroke-width="1" transform="rotate(-8 600 400)"/>
  <circle cx="600" cy="400" r="10" fill="${amber}"/>
  <text x="600" y="250" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Build in public · distribute globally</text>`,
  },
];

function renderCover(c) {
  const diagram = typeof c.diagram === 'function' ? c.diagram() : c.diagram;
  const svg = baseShell(c.n, c.kicker, c.title, c.subtitle, diagram);
  const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: OUT_W },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render();
  const buf = png.asPng();
  const outPath = path.join(outDir, `se-${c.n}.png`);
  fs.writeFileSync(outPath, buf);
  console.log('Wrote', outPath, `${png.width}x${png.height}`);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const c of covers) {
  try {
    renderCover(c);
  } catch (e) {
    console.error('Failed se-' + c.n, e.message);
    process.exitCode = 1;
  }
}
