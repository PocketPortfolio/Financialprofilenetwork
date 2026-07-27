/**
 * Run AFTER `npx vercel login` (or with valid CLI auth.json token).
 * Sets PP_FIRST_PARTY_FETCH_SECRET = CRON_SECRET on production/preview/development.
 *
 *   node scripts/ops-set-pp-first-party-env.mjs
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

const authPath = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'com.vercel.cli',
  'Data',
  'auth.json'
);
const envLocal = fs.readFileSync('.env.local', 'utf8');
const secret =
  envLocal.match(/^PP_FIRST_PARTY_FETCH_SECRET=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, '').trim() ||
  envLocal.match(/^CRON_SECRET=(.*)$/m)?.[1]?.replace(/^["']|["']$/g, '').trim();

if (!secret) {
  console.error('Need PP_FIRST_PARTY_FETCH_SECRET or CRON_SECRET in .env.local');
  process.exit(2);
}

if (!fs.existsSync(authPath)) {
  console.error('Missing Vercel CLI auth. Run: npx vercel login');
  process.exit(2);
}

const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
const token = auth.token || auth.accessToken;
if (!token) {
  console.error('Vercel auth.json has no token. Run: npx vercel login');
  process.exit(2);
}

const project = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
const { projectId, orgId: teamId } = project;

async function vercel(apiPath, opts = {}) {
  const url = new URL(`https://api.vercel.com${apiPath}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

const list = await vercel(`/v9/projects/${projectId}/env`);
if (list.status !== 200) {
  console.error('env list failed', list.status, list.json);
  process.exit(2);
}

for (const target of ['production', 'preview', 'development']) {
  const existing = (list.json.envs || []).find(
    (e) => e.key === 'PP_FIRST_PARTY_FETCH_SECRET' && (e.target || []).includes(target)
  );
  if (existing?.id) {
    const upd = await vercel(`/v9/projects/${projectId}/env/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ value: secret, type: 'encrypted', target: existing.target }),
    });
    console.log('updated', target, upd.status);
  } else {
    const cre = await vercel(`/v10/projects/${projectId}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key: 'PP_FIRST_PARTY_FETCH_SECRET',
        value: secret,
        type: 'encrypted',
        target: [target],
      }),
    });
    console.log('created', target, cre.status);
  }
}

console.log('Done. Redeploy so Preview/Production pick up the secret.');
