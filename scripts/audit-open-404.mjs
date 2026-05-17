#!/usr/bin/env node
/**
 * 404 / surface audit for Open Portfolio (B2B) — curl against open.localhost:3001.
 * B2B routes must return 200 with Open chrome. Consumer-only paths must 307 to Pocket (no O. 404).
 */
async function fetchOpenRedirectFirstHop(path) {
  const url = `http://open.localhost:3001${path}`;
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);
  const { stdout } = await execFileAsync('curl.exe', ['-sI', '--max-redirs', '0', url], {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  const statusMatch = stdout.match(/^HTTP\/[\d.]+ (\d+)/im);
  const status = statusMatch ? parseInt(statusMatch[1], 10) : 0;
  const locMatch = stdout.match(/^location:\s*(.+)$/im);
  const location = locMatch ? locMatch[1].trim().replace(/\r$/, '') : '';
  const targetsPocket =
    location.startsWith('http://localhost:3001') ||
    location.startsWith('http://127.0.0.1:3001') ||
    location.startsWith('https://www.pocketportfolio.app');
  return { status, location, targetsPocket };
}

/** Dev open.localhost serves Pocket routes via middleware next(); prod uses 307 to pocketportfolio.app. */
async function fetchConsumerPathFromOpen(path) {
  const r = await fetchOpenRedirectFirstHop(path);
  const ok = (r.status === 307 && r.targetsPocket) || r.status === 200;
  return { ...r, ok };
}

async function fetchOpen(path, fetchBody = false) {
  const url = `http://open.localhost:3001${path}`;
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);
  const args = fetchBody
    ? ['-sL', '--max-redirs', '6', '-w', '\n__HTTP_CODE__%{http_code}', url]
    : ['-sI', '-L', '--max-redirs', '6', url];
  const { stdout } = await execFileAsync('curl.exe', args, {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  let body = fetchBody ? stdout : '';
  let finalStatus = 0;
  if (fetchBody) {
    const parts = stdout.split('\n__HTTP_CODE__');
    body = parts[0] ?? '';
    finalStatus = parseInt(parts[1] ?? '0', 10);
  } else {
    const statusMatch = stdout.match(/^HTTP\/[\d.]+ (\d+)/gm);
    const statuses = statusMatch ? statusMatch.map((l) => parseInt(l.split(' ')[1], 10)) : [];
    finalStatus = statuses[statuses.length - 1] ?? 0;
  }
  const redirectLoop = (stdout.match(/^HTTP\/[\d.]+ 302/gm) ?? []).length >= 4;
  const isOpenNotFound =
    body.includes('This path is not on Open Portfolio.</h1>') ||
    body.includes('>404 · Route not on substrate<');
  const hasOpenChrome = body.includes('open-brand-header');
  return {
    status: finalStatus,
    isOpenNotFound,
    hasOpenChrome,
    redirectLoop,
  };
}

const B2B_PATHS = [
  '/',
  '/architecture',
  '/designchallenge',
  '/tier1designpartner',
  '/board-of-investors',
  '/sovereign-ai-grant',
  '/learn',
  '/learn/portfolio-beta',
  '/learn/sector-drift',
  '/learn/fee-drag',
  '/learn/sovereign-stack',
  '/learn/sovereign-finance',
  '/learn/realised-vs-unrealised',
  '/learn/dollar-cost-averaging',
  '/learn/local-first',
  '/learn/vendor-lock-in',
  '/learn/json-finance',
  '/playbooks/sovereign-strike',
  '/openbrokercsv',
  '/static/csv-etoro-to-openbrokercsv',
  '/static/portfolio-tracker',
  '/static/why-we-are-fast',
  '/stack-reveal',
  '/blog',
  '/press',
  '/press/abba-lawal',
  '/sponsor',
  '/privacy',
  '/terms',
  '/sponsor?tier=founder',
  '/open/architecture',
];

/** Must resolve on Open host with HTTP 200 (middleware passes through public/). */
const OPEN_PUBLIC_STATIC_ASSETS = [
  '/press/abba/abba-uk-black-business-show-820.webp',
  '/brand/pp-monogram-amber.svg',
];

/** Hit on Open host → must 307 to Pocket (consumer surface). */
const POCKET_REDIRECT_FROM_OPEN = [
  '/dashboard',
  '/features/google-drive-sync',
  '/for/advisors',
  '/tools',
  '/tools/risk-calculator',
];

async function main() {
  const failures = [];

  for (const p of B2B_PATHS) {
    try {
      const r = await fetchOpen(p, true);
      const bad = r.redirectLoop || r.isOpenNotFound || !r.hasOpenChrome;
      if (bad) failures.push({ path: p, reason: 'b2b-fail', ...r });
      console.log(`${bad ? '✗' : '✓'} ${p} ${bad ? 'FAIL' : 'OK'}`);
    } catch (e) {
      failures.push({ path: p, error: e.message });
      console.log(`✗ ${p} ERR ${e.message}`);
    }
  }

  for (const p of POCKET_REDIRECT_FROM_OPEN) {
    try {
      const r = await fetchConsumerPathFromOpen(p);
      if (!r.ok) failures.push({ path: p, reason: 'expected-passthrough-or-307-pocket', ...r });
      console.log(
        `${r.ok ? '✓' : '✗'} ${p} ${r.ok ? `OK (${r.status === 200 ? 'dev passthrough' : '307→Pocket'})` : `FAIL status=${r.status} loc=${r.location}`}`,
      );
    } catch (e) {
      failures.push({ path: p, error: e.message });
      console.log(`✗ ${p} ERR ${e.message}`);
    }
  }

  for (const p of OPEN_PUBLIC_STATIC_ASSETS) {
    try {
      const r = await fetchOpenRedirectFirstHop(p);
      const ok = r.status === 200;
      if (!ok) failures.push({ path: p, reason: 'static-asset-open-host', ...r });
      console.log(`${ok ? '✓' : '✗'} ${p} ${ok ? 'static 200' : `FAIL status=${r.status}`}`);
    } catch (e) {
      failures.push({ path: p, error: e.message });
      console.log(`✗ ${p} ERR ${e.message}`);
    }
  }

  console.log(`\n${failures.length} failures`);
  process.exit(failures.length > 0 ? 1 : 0);
}

main();
