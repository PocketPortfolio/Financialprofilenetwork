/**
 * Open Portfolio — 3-page Institutional Tear Sheet (PDF).
 * Source: docs/seed/open-portfolio-institutional-tear-sheet-2026-07-07.md
 *
 * Run: npm run generate:open-tear-sheet
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const MD = path.join(root, 'docs', 'seed', 'open-portfolio-institutional-tear-sheet-2026-07-07.md');
const OUT = path.join(root, 'docs', 'seed', 'Open_Portfolio_Institutional_Tear_Sheet_2026-07-07.pdf');

const CSS = `
  @page { size: A4 portrait; margin: 11mm 10mm 13mm 10mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 8.5pt;
    color: #e4e4e7;
    line-height: 1.38;
    margin: 0;
    padding: 0;
    background: #09090b;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    page-break-after: always;
    break-after: page;
  }
  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .page-header {
    border: 1px solid #3f3f46;
    border-left: 3px solid #f59e0b;
    padding: 7pt 10pt 6pt 10pt;
    margin-bottom: 10pt;
    background: #0c0c0e;
  }
  .page-header .kicker {
    font-family: ui-monospace, Consolas, "Courier New", monospace;
    font-size: 7pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #f59e0b;
    margin: 0 0 4pt 0;
  }
  .page-header .title {
    font-size: 13pt;
    font-weight: 700;
    color: #fafafa;
    margin: 0;
    line-height: 1.2;
  }
  h2 {
    font-size: 10pt;
    font-weight: 700;
    color: #fafafa;
    margin: 10pt 0 6pt 0;
    padding-bottom: 3pt;
    border-bottom: 1px solid #3f3f46;
  }
  h3 {
    font-size: 9pt;
    font-weight: 600;
    color: #f4f4f5;
    margin: 8pt 0 4pt 0;
  }
  p { margin: 4pt 0; color: #d4d4d8; }
  strong { color: #fafafa; font-weight: 600; }
  em { color: #a1a1aa; font-style: italic; font-size: 8pt; }
  ul { margin: 4pt 0 6pt 0; padding-left: 14pt; }
  li { margin: 2pt 0; color: #d4d4d8; }
  li::marker { color: #f59e0b; }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 7.5pt;
    margin: 6pt 0 8pt 0;
    table-layout: fixed;
  }
  th, td {
    border: 1px solid #3f3f46;
    padding: 4px 5px;
    vertical-align: top;
    word-wrap: break-word;
  }
  th {
    background: #18181b;
    color: #fafafa;
    font-weight: 600;
    text-align: left;
  }
  td { background: #0c0c0e; color: #d4d4d8; }
  code {
    font-family: ui-monospace, Consolas, monospace;
    font-size: 7pt;
    background: #18181b;
    color: #fbbf24;
    padding: 0 3px;
    border: 1px solid #3f3f46;
  }
  hr {
    border: none;
    border-top: 1px solid #27272a;
    margin: 8pt 0;
  }
  .page-footer {
    margin-top: 8pt;
    padding-top: 6pt;
    border-top: 1px solid #3f3f46;
    font-size: 7pt;
    color: #71717a;
    font-family: ui-monospace, Consolas, monospace;
  }
`;

const NPM_PACKAGES = [
  '@pocket-portfolio/importer',
  '@pocket-portfolio/fidelity-csv-export',
  '@pocket-portfolio/coinbase-transaction-parser',
  '@pocket-portfolio/etoro-history-importer',
  '@pocket-portfolio/robinhood-csv-parser',
  '@pocket-portfolio/trading212-to-json',
  '@pocket-portfolio/koinly-csv-parser',
  '@pocket-portfolio/turbotax-csv-parser',
  '@pocket-portfolio/ghostfolio-csv-parser',
  '@pocket-portfolio/sharesight-csv-parser',
  '@pocket-portfolio/universal-csv-importer',
];

/** TRAC-01 / TRAC-07 — align with lib/canonical-claims.ts NUMBERS_SNAPSHOT */
const TRAC_SNAPSHOT = {
  npmAllTime: 9389,
  npmAsOf: '2026-04-20',
  mau: 4669,
  mauAsOf: '2026-04-20',
};

async function fetchPackageTotal(packageName) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const endDateStr = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/2010-01-01:${endDateStr}/${encodeURIComponent(packageName)}`,
      { headers: { Accept: 'application/json' }, signal: controller.signal }
    );
    if (!response.ok) return 0;
    const data = await response.json();
    return data.downloads ?? 0;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchLiveNpmAggregate() {
  const results = await Promise.all(NPM_PACKAGES.map((name) => fetchPackageTotal(name)));
  return {
    totalDownloads: results.reduce((sum, n) => sum + n, 0),
    fetchedAt: new Date().toISOString(),
    packageCount: NPM_PACKAGES.length,
  };
}

async function loadMetrics() {
  const mauK =
    TRAC_SNAPSHOT.mau >= 1000
      ? `${(TRAC_SNAPSHOT.mau / 1000).toFixed(1)}K`
      : String(TRAC_SNAPSHOT.mau);
  let npmFormatted = TRAC_SNAPSHOT.npmAllTime.toLocaleString('en-GB');
  let npmAsOf = TRAC_SNAPSHOT.npmAsOf;
  let npmLiveNote = '';
  try {
    const live = await fetchLiveNpmAggregate();
    if (live.totalDownloads > 0) {
      npmFormatted = live.totalDownloads.toLocaleString('en-GB');
      npmAsOf = live.fetchedAt.split('T')[0] ?? npmAsOf;
      npmLiveNote = ' · live npm API';
      console.log(`Live npm: ${npmFormatted} (${live.packageCount} packages)`);
    }
  } catch (err) {
    console.warn('Live npm fetch failed — TRAC-01 snapshot', err);
  }
  return {
    NPM_DOWNLOADS: npmFormatted,
    MAU: mauK,
    MAU_AS_OF: TRAC_SNAPSHOT.mauAsOf,
    NPM_AS_OF: npmAsOf,
    NPM_LIVE_NOTE: npmLiveNote,
  };
}

function applyTokens(text, tokens) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => tokens[key] ?? `{{${key}}}`);
}

function markdownToPages(md) {
  const lines = md.split('\n');
  let start = 0;
  while (start < lines.length && !lines[start].startsWith('## Page 1')) start += 1;
  const body = lines.slice(start).join('\n');
  const chunks = body.split(/^## Page \d+ — /m).filter(Boolean);
  return chunks.map((chunk, i) => {
    const pageNum = i + 1;
    const titles = [
      'The Sovereign Mandate',
      'Architecture & Traction',
      'Technical Due Diligence',
    ];
    const kickers = [
      'Open Portfolio · Institutional Tear Sheet · Page 1 of 3',
      'Open Portfolio · Institutional Tear Sheet · Page 2 of 3',
      'Open Portfolio · Institutional Tear Sheet · Page 3 of 3',
    ];
    const title = titles[i] ?? `Page ${pageNum}`;
    const content = chunk.replace(/^[^\n]+\n/, '');
    const html = marked.parse(content, { gfm: true, breaks: false });
    return { pageNum, kicker: kickers[i], title, html };
  });
}

async function main() {
  if (!fs.existsSync(MD)) {
    console.error('Missing source:', MD);
    process.exit(1);
  }
  const tokens = await loadMetrics();
  const md = applyTokens(fs.readFileSync(MD, 'utf8'), tokens);
  const pages = markdownToPages(md);

  const pagesHtml = pages
    .map(
      (p) => `
  <section class="page">
    <header class="page-header">
      <p class="kicker">${p.kicker}</p>
      <p class="title">${p.title}</p>
    </header>
    ${p.html}
    <p class="page-footer">Open Portfolio · Confidential · SovereignAI North-West · 7 July 2026</p>
  </section>`
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <title>Open Portfolio — Institutional Tear Sheet</title>
  <style>${CSS}</style>
</head>
<body>
${pagesHtml}
</body>
</html>`;

  const outDir = path.dirname(OUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: OUT,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '9mm', bottom: '12mm', left: '9mm' },
    });
  } finally {
    await browser.close();
  }
  console.log('Wrote', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
