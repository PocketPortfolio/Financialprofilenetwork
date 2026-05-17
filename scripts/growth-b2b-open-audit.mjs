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
  '/sitemap.xml',
  '/llms.txt',
];

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
  const sm = await probeFollow(`${BASE}/sitemap.xml`);
  push(`- \`/sitemap.xml\` (follow redirects): **${sm}** ${sm === 200 ? '✓' : '⚠'}`);
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
