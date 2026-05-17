/**
 * Codebase-native campaign bundle: markdown, manifest (URL checks), covers.
 *
 * Usage:
 *   npm run build:campaign -- --name=shaping-the-future
 */
import fs from 'node:fs';
import path from 'node:path';
import { generateLinkedinCoverPng } from './lib/linkedin-cover';
import {
  SHAPING_THE_FUTURE_POST_CANONICAL,
  SHAPING_THE_FUTURE_POST_FEED_RAW,
  SHAPING_THE_FUTURE_URLS,
  stripInternalCitationMarkers,
} from './lib/campaigns/shaping-the-future';

const CAMPAIGN_DATE_DIR = '2026-05-05';

function parseName(argv: string[]): string {
  for (const a of argv) {
    const m = /^--name=(.+)$/.exec(a);
    if (m) return (m[1] || '').trim().toLowerCase();
  }
  throw new Error('Missing --name=shaping-the-future');
}

async function probeUrl(url: string): Promise<{ url: string; ok: boolean; status?: number; error?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { Range: 'bytes=0-0', 'User-Agent': 'PocketPortfolio-campaign-manifest/1.0' },
    });
    clearTimeout(t);
    const ok = res.ok || res.status === 206;
    return { url, ok, status: res.status };
  } catch (e) {
    clearTimeout(t);
    const msg = e instanceof Error ? e.message : String(e);
    return { url, ok: false, error: msg };
  }
}

async function main(): Promise<void> {
  const name = parseName(process.argv.slice(2));
  if (name !== 'shaping-the-future') {
    throw new Error(`Unknown campaign --name=${name}. Supported: shaping-the-future`);
  }

  const repoRoot = path.resolve(__dirname, '..');
  const outDir = path.join(repoRoot, 'dist', 'campaigns', CAMPAIGN_DATE_DIR, name);
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'POST.md'), SHAPING_THE_FUTURE_POST_CANONICAL, 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'POST-feed-linkedin.md'),
    stripInternalCitationMarkers(SHAPING_THE_FUTURE_POST_FEED_RAW),
    'utf8'
  );

  generateLinkedinCoverPng({
    root: repoRoot,
    outPath: path.join(outDir, 'cover-ct1-receipt-architecture.png'),
    preset: 'ct1-receipt-architecture',
  });
  generateLinkedinCoverPng({
    root: repoRoot,
    outPath: path.join(outDir, 'cover-ct2-sovereign-v5.png'),
    preset: 'ct2-sovereign-v5',
  });

  const checks = await Promise.all([...SHAPING_THE_FUTURE_URLS].map((u) => probeUrl(u)));
  const manifest = {
    campaign: name,
    generatedAt: new Date().toISOString(),
    paths: {
      canonicalPost: 'POST.md',
      feedVariantPost: 'POST-feed-linkedin.md',
      coverCt1: 'cover-ct1-receipt-architecture.png',
      coverCt2V5: 'cover-ct2-sovereign-v5.png',
    },
    urlIntegrity: checks,
    allUrlsOk: checks.every((c) => c.ok),
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Campaign bundle written to ${outDir}`);
  console.log(manifest.allUrlsOk ? 'All URLs responded OK.' : 'Some URL checks failed — see manifest.json');
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
