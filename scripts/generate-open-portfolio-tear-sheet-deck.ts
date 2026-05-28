/**
 * Open Portfolio — Institutional Tear Sheet (PPTX + PDF).
 * Run: npm run build:open-tear-sheet
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { runOpenPortfolioTearSheetDeck } from './lib/open-portfolio-tear-sheet-deck';

async function main() {
  await runOpenPortfolioTearSheetDeck();
  const pdfScript = path.join(__dirname, 'generate-open-portfolio-tear-sheet-pdf.mjs');
  const r = spawnSync(process.execPath, [pdfScript], { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
