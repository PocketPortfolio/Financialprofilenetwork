#!/usr/bin/env node
/**
 * Open Portfolio B2B growth programme — technical verification pass (production probes).
 * Does not replace GSC, GA4, CrUX, or competitive SERP research.
 *
 * Usage: node scripts/growth-b2b-open-audit.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.openportfolio.co.uk';
const UA = { 'user-agent': 'OpenGrowthAudit/1.0 (+engineering-local)' };

/** Representative Open URLs — aligned with OPEN_ALIAS_ROUTES marketing anchors */
const SAMPLE_PATHS = [
  '/',
  '/architecture',
  '/designchallenge',
  '/board-of-investors',
  '/blog',
  '/blog/the-complete-guide-to-api-error-responses',
  '/blog/data-chasm-wealth-management-llms',
  '/blog/bypassing-approved-supplier-list-compliance',
  '/blog/tier-1-wealth-byoc-sandbox-pattern',
  '/blog/structuring-forgetful-sessions-financial-rag',
  '/blog/dual-surface-monorepo-testing',
  '/sitemap.xml',
  '/llms.txt',
];

const POCKET_B2C_BLOG_GATE =
  'https://www.pocketportfolio.app/blog/the-efficient-market-hypothesis-still-relevant';

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

  push('# Open Portfolio B2B growth audit — automated probe output');
  push('');
  push(`_Generated ${new Date().toISOString()} · production GET probes · ${BASE}_`);
  push('');

  push('## Open sitemap');
  const smRes = await fetch(`${BASE}/sitemap.xml`, { redirect: 'follow', headers: UA });
  const sm = smRes.status;
  const smText = sm === 200 ? await smRes.text() : '';
  const blogLocs = smText ? (smText.match(/\/blog\//g) ?? []).length : 0;
  push(`- \`/sitemap.xml\` (follow redirects): **${sm}** ${sm === 200 ? '✓' : '⚠'}`);
  push(`- Blog post \`<loc>\` rows (approx): **${blogLocs}** ${blogLocs > 50 ? '✓' : '⚠ (Phase 2 expects Open-category posts listed)'}`);
  push('');

  push('## Pocket B2C blog gate (cross-surface)');
  const pocketBlog = await probeFollow(POCKET_B2C_BLOG_GATE);
  push(`- B2C slug: **${pocketBlog}** ${pocketBlog === 200 ? '✓' : '⚠'}`);
  push('');

  push('## Sample Open URLs (200 expected)');
  for (const p of SAMPLE_PATHS) {
    const st = await probeFollow(`${BASE}${p}`);
    push(`- \`${p}\`: **${st}** ${st === 200 ? '✓' : '⚠'}`);
  }

  push('');
  push('## Manual — Growth-owned (NOT RUN HERE)');
  push('- GSC property verification + Coverage snapshot (`growth-b2b-stage3-dashboard-playbook.md`)');
  push('- GA4 hostname-filter exploration + KPI baseline export');

  const outFile = path.join(ROOT, 'docs/command/growth-b2b-open-audit-automated-probe.md');
  await fs.writeFile(outFile, lines.join('\n'), 'utf8');
  console.log(`\n[audit:b2b-open] Wrote ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
