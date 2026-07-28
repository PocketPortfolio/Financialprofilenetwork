/**
 * scripts/build-llms-txt.ts
 *
 * Regenerates public/llms.txt and public/open/llms.txt from lib/llms-feed.ts (SSOT).
 * Dynamic edge routes (app/llms.txt/route.ts) use the same builders at runtime.
 *
 * Run: npm run build:llms
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildOpenLlmsSummary, buildPocketLlmsSummary } from '../lib/llms-feed';

const root = resolve(__dirname, '..');

const pocketPath = resolve(root, 'public', 'llms.txt');
writeFileSync(pocketPath, buildPocketLlmsSummary(), { encoding: 'utf8' });
console.log(`[build-llms-txt] wrote ${pocketPath}`);

const openPath = resolve(root, 'public', 'open', 'llms.txt');
writeFileSync(openPath, buildOpenLlmsSummary(), { encoding: 'utf8' });
console.log(`[build-llms-txt] wrote ${openPath}`);
