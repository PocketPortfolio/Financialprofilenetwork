/**
 * One-shot: after `npx vercel login`, upsert Wave 1 env to Vercel and redeploy.
 *
 *   node scripts/ops-prod-wave1-vercel-env.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const authPath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'com.vercel.cli',
  'Data',
  'auth.json'
);

function readEnvLocal(key) {
  const raw = fs.readFileSync('.env.local', 'utf8');
  const m = raw.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m?.[1]?.replace(/^["']|["']$/g, '').trim() || '';
}

if (!fs.existsSync(authPath)) {
  console.error('Missing Vercel CLI auth. Run: npx vercel login');
  process.exit(2);
}
const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = auth.token || auth.accessToken;
if (!token) {
  console.error('auth.json has no token. Run: npx vercel login');
  process.exit(2);
}

const project = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
process.env.VERCEL_TOKEN = token;
process.env.VERCEL_ORG_ID = project.orgId;
process.env.VERCEL_PROJECT_ID = project.projectId;
process.env.VERCEL_ENV_UPSERTS = JSON.stringify({
  GA4_MEASUREMENT_PROTOCOL_SECRET: readEnvLocal('GA4_MEASUREMENT_PROTOCOL_SECRET'),
  NEXT_PUBLIC_GA_MEASUREMENT_ID:
    readEnvLocal('NEXT_PUBLIC_GA_MEASUREMENT_ID') || 'G-9FQ2NBHY7H',
  PP_FIRST_PARTY_FETCH_SECRET:
    readEnvLocal('PP_FIRST_PARTY_FETCH_SECRET') || readEnvLocal('CRON_SECRET'),
});

const parsed = JSON.parse(process.env.VERCEL_ENV_UPSERTS);
if (!parsed.GA4_MEASUREMENT_PROTOCOL_SECRET) {
  console.error('GA4_MEASUREMENT_PROTOCOL_SECRET missing from .env.local');
  process.exit(2);
}

console.log('Upserting keys:', Object.keys(parsed).join(', '));
const r = spawnSync(process.execPath, ['scripts/ops-upsert-vercel-env-gha.mjs'], {
  stdio: 'inherit',
  env: process.env,
});
if (r.status !== 0) process.exit(r.status || 2);

const hook = readEnvLocal('VERCEL_DEPLOY_HOOK_URL');
if (hook) {
  const res = await fetch(hook, { method: 'POST' });
  console.log('Redeploy hook', res.status);
} else {
  console.log('No VERCEL_DEPLOY_HOOK_URL — trigger redeploy from Vercel Git or CLI.');
}
