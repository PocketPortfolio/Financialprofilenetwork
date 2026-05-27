#!/usr/bin/env node
/**
 * Phase 0 — export CodeQL open alerts and compute runtime scope projection.
 * Usage: node scripts/export-codeql-baseline.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join('docs', 'seed', 'phase2-evidence');
fs.mkdirSync(outDir, { recursive: true });

const raw = execSync(
  'gh api "repos/PocketPortfolio/Financialprofilenetwork/code-scanning/alerts?state=open&per_page=100"',
  { encoding: 'utf8', shell: true },
);

fs.writeFileSync(path.join(outDir, 'codeql-baseline-pre-scope-20260527.json'), raw);

const data = JSON.parse(raw);
const alerts = data.map((a) => ({
  id: a.number,
  rule: a.rule.id,
  severity: a.rule.severity,
  path: a.most_recent_instance.location.path,
}));

function isPhase0Excluded(p) {
  return (
    /^(scripts|coverage|src_backup|tests_backup|playwright-report)\//.test(p) ||
    /\.html$/i.test(p) ||
    p === 'zero-server-stack-marketing.html'
  );
}

function isRuntimeScope(p) {
  return /^(app|lib|packages\/importer\/src)\//.test(p) || p === 'middleware.ts';
}

const excluded = alerts.filter((a) => isPhase0Excluded(a.path));
const inRuntime = alerts.filter((a) => isRuntimeScope(a.path) && !isPhase0Excluded(a.path));
const other = alerts.filter((a) => !isPhase0Excluded(a.path) && !isRuntimeScope(a.path));

const summary = {
  capturedAt: new Date().toISOString().slice(0, 10),
  branch: 'main',
  totalOpen: alerts.length,
  phase0Excluded: excluded.length,
  projectedRuntimeBaseline: inRuntime.length,
  otherOutOfScopePaths: other.length,
  excludedAlerts: excluded,
  runtimeAlerts: inRuntime,
  otherAlerts: other,
  note:
    'Phase 0 CodeQL config scopes analysis to app/, lib/, packages/importer/src/, middleware.ts. Full rescan requires green CodeQL CI.',
};

fs.writeFileSync(
  path.join(outDir, 'codeql-baseline-runtime-projection-20260527.json'),
  JSON.stringify(summary, null, 2),
);

console.log(
  JSON.stringify(
    {
      total: summary.totalOpen,
      phase0Excluded: summary.phase0Excluded,
      projectedRuntimeBaseline: summary.projectedRuntimeBaseline,
      other: summary.otherOutOfScopePaths,
    },
    null,
    2,
  ),
);
