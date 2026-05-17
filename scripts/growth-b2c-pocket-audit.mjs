#!/usr/bin/env node
/**
 * Pocket B2C growth programme — technical verification pass (production probes).
 * Does not replace GSC, GA4, CrUX, or competitive SERP research.
 *
 * Usage: node scripts/growth-b2c-pocket-audit.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.pocketportfolio.app';
const UA = { 'user-agent': 'PocketGrowthAudit/1.1 (+engineering-local)' };

async function probeManual(url) {
  const res = await fetch(url, { redirect: 'manual', headers: UA });
  const loc = res.headers.get('location') || '';
  return { status: res.status, location: loc };
}

async function probeFollow(url) {
  const res = await fetch(url, { redirect: 'follow', headers: UA });
  return res.status;
}

async function main() {
  const lines = [];
  const push = (s) => {
    lines.push(s);
    console.log(s);
  };

  push('# Pocket B2C growth audit — automated probe output');
  push('');
  push(`_Generated ${new Date().toISOString()} · production GET probes · ${BASE}_`);
  push('');
  push('## Phase 1 — Sitemap index (36-stream invariant)');
  const indexRes = await fetch(`${BASE}/sitemap.xml`, { headers: UA });
  const indexXml = await indexRes.text();
  const locs = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  push(`- Index HTTP: **${indexRes.status}**`);
  push(`- Child \`<loc>\` count: **${locs.length}**`);
  const needPrefix = [
    'sitemap-static-v3.xml',
    'sitemap-imports-v3.xml',
    'sitemap-tools-v3.xml',
    'sitemap-blog-v3.xml',
  ];
  let ok = indexRes.status === 200 && locs.length === 36;
  for (const p of needPrefix) {
    const hit = locs.some((l) => l.endsWith(p));
    push(`- shard \`${p}\`: ${hit ? '✓' : '✗ MISSING'}`);
    if (!hit) ok = false;
  }
  const tc = locs.filter((l) => /sitemap-tickers-\d+-v3\.xml$/.test(l)).length;
  const rc = locs.filter((l) => /sitemap-risk-\d+-v3\.xml$/.test(l)).length;
  push(`- Ticker shards: **${tc}**/16`);
  push(`- Risk shards: **${rc}**/16`);
  if (tc !== 16 || rc !== 16) ok = false;
  push(`- **Result:** ${ok ? 'PASS — 36 child streams' : 'FAIL — count mismatch'}`);
  push('');

  push('## Phase 1 — Path-scoped Pocket → Open (redirect sanity)');
  const arch = await probeManual(`${BASE}/architecture`);
  const archOk =
    arch.status >= 300 &&
    arch.status < 400 &&
    arch.location.includes('www.openportfolio.co.uk/architecture');
  push(`- \`/architecture\`: ${archOk ? 'PASS' : 'FAIL'} (${arch.status} → ${arch.location || 'no Location'})`);

  const founder = await probeManual(`${BASE}/press/abba-lawal`);
  const founderOk =
    founder.status >= 300 &&
    founder.status < 400 &&
    founder.location.includes('www.openportfolio.co.uk');
  push(`- \`/press/abba-lawal\`: ${founderOk ? 'PASS' : 'FAIL'} (${founder.status} → ${founder.location || '—'})`);

  const home = await probeManual(`${BASE}/`);
  const homeOk = home.status === 200 || (home.status >= 300 && home.location.includes('pocketportfolio.app'));
  push(`- \`/\` (manual): ${homeOk ? 'PASS' : 'FAIL'} (${home.status})`);

  const press = await probeFollow(`${BASE}/press`);
  push(`- \`/press\` (follow): ${press === 200 ? 'PASS' : `FAIL (${press})`}`);

  push('');
  push('## Phase 1 — Sample Pocket money URLs (200 expected)');
  for (const p of ['/for/advisors', '/tools', '/learn/json-finance', '/cheapest-portfolio-tracker-no-subscription']) {
    const st = await probeFollow(`${BASE}${p}`);
    push(`- \`${p}\`: **${st}** ${st === 200 ? '✓' : '⚠'}`);
  }

  push('');
  push('## Phase 0 — Manual / Growth-owned (NOT RUN HERE)');
  push('- GSC property verification + Coverage dashboard snapshot');
  push('- GA4 hostname-filter view + KPI baseline export (organic branded vs non-branded)');
  push('- Release tag SSOT on `main` (git/Vercel)');

  push('');
  push('## Phase 2 — Repo hint (glossary vs static sitemap)');
  push('- Cross-check `app/learn/*/page.tsx` (Pocket glossary slugs) vs `app/sitemap-static.ts` after each glossary ship; rebuild `npm run build:sitemaps` before indexing assertions.');
  push('- Sovereign learn pillars intentionally Open-canonical — omitting them from Pocket static sitemap is expected.');

  push('');
  push('## Phase 3 — Manual');
  push('- UK SERP grid + competitor velocity spreadsheet');
  push('- GA4 exploration: verify advisor_tool funnel events in Explorations');

  const outFile = path.join(ROOT, 'docs/command/growth-b2c-audit-automated-probe.md');
  await fs.writeFile(outFile, lines.join('\n'), 'utf8');
  console.log(`\n[audit] Wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
