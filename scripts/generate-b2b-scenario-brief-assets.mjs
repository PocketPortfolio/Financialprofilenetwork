/**
 * B2B Scenario Brief — brand-governed blog assets (Open Portfolio).
 * Palette: obsidian #09090b, amber #f59e0b, body #e2e8f0 (WCAG 4.5:1+ on obsidian).
 * Output: public/book-assets/b2b-scenario-briefs/bsb-NN-cover.png + bsb-NN-figure.png
 * Run: node scripts/generate-b2b-scenario-brief-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public/book-assets/b2b-scenario-briefs');

const amber = '#f59e0b';
const amberDim = 'rgba(245,158,11,0.12)';
const fg = '#e2e8f0';
const fgMuted = '#a1a1aa';
const fgSub = '#71717a';
const stroke = '#27272a';
const strokeHi = 'rgba(245,158,11,0.35)';
const card = '#141414';
const cardHi = '#18181b';
const obsidian = '#09090b';

const COVER_W = 1200;
const COVER_H = 630;
const COVER_OUT_W = 2400;
const FIG_W = 960;
const FIG_H = 420;
const FIG_OUT_W = 1920;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function obsidianShell({ kicker, title, subtitle, diagramSvg, w, h, footer }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0f10"/>
      <stop offset="50%" style="stop-color:${obsidian}"/>
      <stop offset="100%" style="stop-color:#050506"/>
    </linearGradient>
    <linearGradient id="glow" x1="80%" y1="0%" x2="100%" y2="60%">
      <stop offset="0%" style="stop-color:${amber};stop-opacity:0"/>
      <stop offset="100%" style="stop-color:${amber};stop-opacity:0.07"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" rx="4" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <line x1="24" y1="96" x2="${w - 24}" y2="96" stroke="${amber}" stroke-width="1" opacity="0.45"/>
  <text x="48" y="68" fill="${amber}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.18em">${esc(kicker)}</text>
  <text x="48" y="${Math.min(148, h * 0.28)}" fill="${fg}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="${w > 1000 ? 34 : 22}" font-weight="700">${esc(title)}</text>
  <text x="48" y="${Math.min(188, h * 0.36)}" fill="${fgMuted}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="${w > 1000 ? 15 : 13}" font-weight="400">${esc(subtitle)}</text>
  ${diagramSvg}
  <text x="48" y="${h - 28}" fill="${fgSub}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="10" letter-spacing="0.06em">${esc(footer)}</text>
</svg>`;
}

function arrow(x1, y1, x2, y2, color = amber) {
  return `
  <path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="2"/>
  <polygon points="${x2},${y1} ${x2 - 8},${y1 - 5} ${x2 - 8},${y1 + 5}" fill="${color}"/>`;
}

const briefs = [
  {
    n: '01',
    slug: 'data-chasm-wealth-management-llms',
    kicker: 'B2B SCENARIO BRIEF · CISO / INFOSEC',
    title: 'The Data Chasm',
    subtitle: 'Deploy LLMs without unbounded ledger custody',
    coverDiagram: () => {
      const y = 280;
      return `
  <rect x="48" y="${y}" width="200" height="88" rx="6" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="148" y="${y + 32}" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">Client ledger</text>
  <text x="148" y="${y + 52}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Never crosses</text>
  ${arrow(248, y + 44, 308, y + 44)}
  <rect x="318" y="${y + 12}" width="220" height="64" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="428" y="${y + 40}" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Bounded context</text>
  <text x="428" y="${y + 58}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Design target ≤4K tokens</text>
  ${arrow(538, y + 44, 598, y + 44, fgMuted)}
  <rect x="608" y="${y}" width="200" height="88" rx="6" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="708" y="${y + 44}" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Stateless LLM</text>`;
    },
    figureDiagram: () => {
      const y = 120;
      return `
  <text x="480" y="56" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Figure 1 — The Data Chasm</text>
  <rect x="40" y="${y}" width="220" height="200" rx="8" fill="${card}" stroke="${stroke}" stroke-width="1.2"/>
  <text x="150" y="${y + 36}" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">CLIENT PERIMETER</text>
  <text x="150" y="${y + 72}" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Raw ledger</text>
  <text x="150" y="${y + 96}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">IndexedDB · browser memory</text>
  <text x="150" y="${y + 168}" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Full CSV never required on server</text>
  ${arrow(260, y + 100, 340, y + 100)}
  <text x="300" y="${y + 88}" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Summary only</text>
  <rect x="350" y="${y + 40}" width="240" height="120" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="470" y="${y + 76}" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Sanitized context</text>
  <text x="470" y="${y + 100}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">buildPortfolioContext()</text>
  <text x="470" y="${y + 122}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Totals + top 10 holdings</text>
  ${arrow(590, y + 100, 670, y + 100, fgMuted)}
  <rect x="680" y="${y}" width="220" height="200" rx="8" fill="${card}" stroke="${stroke}" stroke-width="1.2"/>
  <text x="790" y="${y + 36}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">STATELESS API</text>
  <text x="790" y="${y + 72}" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600" text-anchor="middle">POST /api/ai/chat</text>
  <text x="790" y="${y + 96}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Stream reply · no ledger store</text>
  <path d="M 790 ${y + 180} L 150 ${y + 180}" stroke="${fgSub}" stroke-width="1.2" fill="none"/>
  <polygon points="150,${y + 180} 158,${y + 175} 158,${y + 185}" fill="${fgSub}"/>
  <text x="470" y="${y + 196}" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Streaming response · forgetful session</text>`;
    },
  },
  {
    n: '02',
    slug: 'bypassing-approved-supplier-list-compliance',
    kicker: 'B2B SCENARIO BRIEF · COMPLIANCE / ASL',
    title: 'Client-edge parse',
    subtitle: 'Shift the subprocessor story without central upload',
    coverDiagram: () => `
  <rect x="48" y="290" width="280" height="180" rx="8" fill="${card}" stroke="${amber}" stroke-width="1.2"/>
  <text x="188" y="328" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">BROWSER MEMORY</text>
  <text x="68" y="360" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">@pocket-portfolio/importer</text>
  <text x="68" y="384" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="11">Zero-upload parse · no CSV API</text>
  <rect x="360" y="290" width="280" height="180" rx="8" fill="${card}" stroke="${stroke}"/>
  <text x="500" y="328" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">SERVER PERIMETER</text>
  <text x="380" y="360" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="12">Receives bounded text only</text>`,
    figureDiagram: () => {
      const y = 130;
      const steps = ['Drop export', 'Parse locally', 'Build context', 'Stream inference'];
      const xs = [60, 280, 500, 720];
      return `
  <text x="480" y="56" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Figure 2 — Browser-side ETL (zero-upload)</text>
  ${steps
    .map(
      (label, i) => `
  <rect x="${xs[i]}" y="${y}" width="180" height="72" rx="6" fill="${i === 1 ? cardHi : card}" stroke="${i === 1 ? amber : stroke}" stroke-width="${i === 1 ? 1.5 : 1}"/>
  <text x="${xs[i] + 90}" y="${y + 42}" fill="${i === 1 ? amber : fg}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">${label}</text>
  ${i < 3 ? arrow(xs[i] + 180, y + 36, xs[i + 1], y + 36, i === 2 ? fgMuted : amber) : ''}`
    )
    .join('')}
  <text x="480" y="${y + 120}" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">No server-side file store for raw broker exports</text>`;
    },
  },
  {
    n: '03',
    slug: 'tier-1-wealth-byoc-sandbox-pattern',
    kicker: 'B2B SCENARIO BRIEF · PROCUREMENT',
    title: '90-day sandbox pattern',
    subtitle: 'Reference architecture — not a completed pilot',
    coverDiagram: () => `
  <rect x="48" y="280" width="1096" height="48" rx="4" fill="${card}" stroke="${stroke}"/>
  <text x="72" y="310" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Weeks 1–3 · Scope &amp; governance</text>
  <path d="M 600 340 L 600 372" stroke="${amber}" stroke-width="2"/>
  <polygon points="600,384 592,370 608,370" fill="${amber}"/>
  <rect x="320" y="392" width="560" height="72" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="600" y="424" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Weeks 4–8 · Edge prototype in your sandbox</text>
  <text x="600" y="446" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Weeks 9–12 · Controlled executive readout</text>`,
    figureDiagram: () => `
  <text x="480" y="56" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Figure 3 — BYOC perimeter (institution retains keys)</text>
  <rect x="40" y="110" width="400" height="240" rx="8" fill="${card}" stroke="${amber}" stroke-width="1.5"/>
  <text x="240" y="142" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">YOUR PERIMETER (BYOC)</text>
  <text x="60" y="178" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Identity · storage · model routing</text>
  <text x="60" y="204" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="11">Auth and ledger stores you approve</text>
  <rect x="520" y="110" width="400" height="240" rx="8" fill="${cardHi}" stroke="${strokeHi}" stroke-width="1.2"/>
  <text x="720" y="142" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">OPEN PORTFOLIO BOUNDARY</text>
  <text x="540" y="178" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Edge importer · context engine</text>
  <text x="540" y="204" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Stateless /api/ai/chat</text>
  <line x1="440" y1="230" x2="520" y2="230" stroke="${amber}" stroke-width="2"/>
  <polygon points="520,230 512,225 512,235" fill="${amber}"/>
  <text x="480" y="222" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="10" text-anchor="middle">Bounded egress</text>`,
  },
  {
    n: '04',
    slug: 'structuring-forgetful-sessions-financial-rag',
    kicker: 'B2B SCENARIO BRIEF · AI ENGINEERING',
    title: 'Forgetful sessions',
    subtitle: 'Aggregate first · no vector ledger on the inference path',
    coverDiagram: () => {
      const bx = [80, 200, 320, 440, 560];
      const bh = [100, 140, 180, 220, 260];
      return (
        bx
          .map(
            (x, i) =>
              `<rect x="${x}" y="${520 - bh[i]}" width="72" height="${bh[i]}" rx="4" fill="${amberDim}" stroke="${amber}" stroke-width="1" opacity="${0.35 + i * 0.12}"/>`
          )
          .join('') +
        `<text x="720" y="320" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="600">Token funnel</text>
  <text x="720" y="348" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11">Trades → aggregate → bounded context</text>
  <text x="720" y="372" fill="${fgSub}" font-family="Segoe UI, sans-serif" font-size="11">No durable vector index of client rows</text>`
      );
    },
    figureDiagram: () => `
  <text x="480" y="56" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Figure 4 — Token funnel (design target ≤4K)</text>
  <polygon points="480,90 720,170 480,170" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="600" y="148" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Full trade state (local)</text>
  <path d="M 480 190 L 480 220" stroke="${amber}" stroke-width="2"/>
  <polygon points="480,232 472,218 488,218" fill="${amber}"/>
  <rect x="340" y="240" width="280" height="56" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="480" y="274" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="700" text-anchor="middle">Aggregation · top N + totals</text>
  <path d="M 480 296 L 480 326" stroke="${amber}" stroke-width="2"/>
  <polygon points="480,338 472,324 488,324" fill="${amber}"/>
  <rect x="380" y="348" width="200" height="48" rx="6" fill="${card}" stroke="${stroke}"/>
  <text x="480" y="378" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">≤4K context string</text>`,
  },
  {
    n: '05',
    slug: 'dual-surface-monorepo-testing',
    kicker: 'B2B SCENARIO BRIEF · DILIGENCE',
    title: 'Dual-surface harness',
    subtitle: 'Retail chaos hardens enterprise procurement layers',
    coverDiagram: () => `
  <line x1="600" y1="260" x2="600" y2="520" stroke="${strokeHi}" stroke-width="1" stroke-dasharray="4 6"/>
  <rect x="52" y="280" width="500" height="220" rx="8" fill="${card}" stroke="${stroke}" stroke-width="1"/>
  <text x="302" y="318" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">POCKET · ADVERSARIAL HARNESS</text>
  <text x="72" y="360" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Real broker files · parser failures</text>
  <rect x="648" y="280" width="500" height="220" rx="8" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="898" y="318" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="700" text-anchor="middle">OPEN · PROCUREMENT SURFACE</text>
  <text x="668" y="360" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="12">Architecture · SDK · design partner</text>`,
    figureDiagram: () => `
  <text x="480" y="56" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" text-anchor="middle">Figure 5 — One monorepo · two surfaces</text>
  <rect x="40" y="120" width="880" height="56" rx="6" fill="${cardHi}" stroke="${amber}" stroke-width="1.5"/>
  <text x="480" y="154" fill="${amber}" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" text-anchor="middle">Shared substrate · packages/importer · contextBuilder · /api/ai/chat</text>
  <path d="M 240 176 L 240 210" stroke="${fgMuted}" stroke-width="1.5"/>
  <path d="M 720 176 L 720 210" stroke="${fgMuted}" stroke-width="1.5"/>
  <rect x="60" y="220" width="360" height="140" rx="8" fill="${card}" stroke="${stroke}"/>
  <text x="240" y="256" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">pocketportfolio.app</text>
  <text x="240" y="284" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Live chaos · MAU · npm downloads</text>
  <rect x="540" y="220" width="360" height="140" rx="8" fill="${card}" stroke="${amber}" stroke-width="1.2"/>
  <text x="720" y="256" fill="${fg}" font-family="Segoe UI, sans-serif" font-size="12" font-weight="600" text-anchor="middle">openportfolio.co.uk</text>
  <text x="720" y="284" fill="${fgMuted}" font-family="Segoe UI, sans-serif" font-size="11" text-anchor="middle">Tier-1 procurement · architecture narrative</text>`,
  },
];

function renderPng(svg, outPath, outWidth) {
  const resvg = new Resvg(Buffer.from(svg, 'utf8'), {
    fitTo: { mode: 'width', value: outWidth },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render();
  fs.writeFileSync(outPath, png.asPng());
  console.log('Wrote', outPath, `${png.width}x${png.height}`);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const b of briefs) {
  const footer = 'OPEN PORTFOLIO · B2B SCENARIO BRIEFS';
  const coverSvg = obsidianShell({
    kicker: b.kicker,
    title: b.title,
    subtitle: b.subtitle,
    diagramSvg: b.coverDiagram(),
    w: COVER_W,
    h: COVER_H,
    footer,
  });
  renderPng(coverSvg, path.join(outDir, `bsb-${b.n}-cover.png`), COVER_OUT_W);

  const figureSvg = obsidianShell({
    kicker: b.kicker,
    title: '',
    subtitle: '',
    diagramSvg: b.figureDiagram(),
    w: FIG_W,
    h: FIG_H,
    footer,
  });
  renderPng(figureSvg, path.join(outDir, `bsb-${b.n}-figure.png`), FIG_OUT_W);
}

fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# B2B Scenario Brief — blog assets

Brand-governed PNGs for Open Portfolio scenario posts (obsidian + amber terminal).

| Asset | Use |
| --- | --- |
| \`bsb-NN-cover.png\` | Frontmatter \`image:\` hero + OG |
| \`bsb-NN-figure.png\` | Inline diagram in post body |

Regenerate: \`node scripts/generate-b2b-scenario-brief-assets.mjs\`

**Gate:** Creative Studios + \`docs/seed/open-portfolio-web-sota-brief.md\` (WCAG body #e2e8f0 on #09090b, amber #f59e0b only).
`
);

console.log('Done — 10 assets in', outDir);
