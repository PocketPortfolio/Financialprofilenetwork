#!/usr/bin/env node
/**
 * Gate: Open bridge harness video must resolve before deploy.
 * Run: node scripts/verify-open-bridge-harness-video.mjs
 */
import { execSync } from 'node:child_process';

const CDN =
  'https://res.cloudinary.com/dknmhvm7a/video/upload/v1780578282/pocket-portfolio/pocket-analyst-demo.mp4';

function head(url) {
  try {
    const out = execSync(`curl -sI "${url}"`, { encoding: 'utf8', timeout: 15_000 });
    const status = out.match(/^HTTP\/\S+\s+(\d+)/m)?.[1];
    const len = out.match(/content-length:\s*(\d+)/i)?.[1];
    return { status: Number(status), len: Number(len) };
  } catch {
    return { status: 0, len: 0 };
  }
}

const { status, len } = head(CDN);
if (status !== 200 || len < 500_000) {
  console.error(`FAIL: harness CDN ${CDN} → HTTP ${status}, ${len} bytes`);
  process.exit(1);
}
console.log(`OK: harness CDN ${CDN} (${(len / 1e6).toFixed(2)} MB)`);
