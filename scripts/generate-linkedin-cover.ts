/**
 * LinkedIn / Open Graph cover — 1200×627 PNG.
 *
 * Usage:
 *   npm run build:linkedin-cover -- --output=shaping-the-future-cover.png
 *   npm run build:linkedin-cover -- --output=dist/foo.png --preset=ct2-sovereign-v5
 */
import path from 'node:path';
import { generateLinkedinCoverPng, type LinkedinCoverPreset } from './lib/linkedin-cover';

function parseArgs(argv: string[]): { output?: string; preset?: LinkedinCoverPreset } {
  let output: string | undefined;
  let preset: LinkedinCoverPreset | undefined;
  for (const a of argv) {
    const om = /^--output=(.+)$/.exec(a);
    if (om) output = om[1];
    const pm = /^--preset=(.+)$/.exec(a);
    if (pm) {
      const v = pm[1] as LinkedinCoverPreset;
      if (v === 'ct1-receipt-architecture' || v === 'ct2-sovereign-v5') preset = v;
      else throw new Error(`Unknown --preset=${pm[1]}. Use: ct1-receipt-architecture | ct2-sovereign-v5`);
    }
  }
  return { output, preset };
}

const repoRoot = path.resolve(__dirname, '..');
const { output, preset } = parseArgs(process.argv.slice(2));
const outPath = output
  ? path.isAbsolute(output)
    ? output
    : path.resolve(process.cwd(), output)
  : path.resolve(process.cwd(), 'shaping-the-future-cover.png');

try {
  generateLinkedinCoverPng({ root: repoRoot, outPath, preset: preset ?? 'ct1-receipt-architecture' });
  console.log(`Wrote ${outPath}`);
} catch (e) {
  console.error(e);
  process.exit(1);
}
