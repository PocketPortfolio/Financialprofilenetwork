#!/usr/bin/env node
/**
 * Generate a CycloneDX SBOM for Tier-1 procurement / diligence packs.
 * Output: docs/seed/phase2-evidence/sbom-cyclonedx.json (+ .xml optional via --xml)
 *
 * Usage:
 *   npm run sbom
 *   npm run sbom -- --xml
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'seed', 'phase2-evidence');
const outJson = path.join(outDir, 'sbom-cyclonedx.json');
const outXml = path.join(outDir, 'sbom-cyclonedx.xml');

const wantXml = process.argv.includes('--xml');

fs.mkdirSync(outDir, { recursive: true });

const args = [
  '--output-file',
  outJson,
  '--output-reproducible',
  '--mc-type',
  'application',
  '--short-PURLs',
  '--ignore-npm-errors',
];

if (wantXml) {
  args.push('--output-format', 'XML', '--output-file', outXml);
}

const bin = path.join(
  root,
  'node_modules',
  '@cyclonedx',
  'cyclonedx-npm',
  'bin',
  'cyclonedx-npm-cli.js',
);

const result = spawnSync(process.execPath, [bin, ...args], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '1' },
});

if (result.status !== 0) {
  console.error('[sbom] CycloneDX generation failed');
  process.exit(result.status ?? 1);
}

if (!fs.existsSync(outJson)) {
  console.error('[sbom] Expected output missing:', outJson);
  process.exit(1);
}

const stat = fs.statSync(outJson);
const meta = JSON.parse(fs.readFileSync(outJson, 'utf8'));
const componentCount = meta?.components?.length ?? 0;

console.log(
  `[sbom] Wrote ${outJson} (${componentCount} components, ${(stat.size / 1024).toFixed(1)} KiB)`,
);
if (wantXml && fs.existsSync(outXml)) {
  console.log(`[sbom] Wrote ${outXml}`);
}
