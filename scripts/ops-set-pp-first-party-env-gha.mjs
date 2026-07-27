/**
 * GitHub Actions variant: uses VERCEL_TOKEN + org/project from env.
 * Sets PP_FIRST_PARTY_FETCH_SECRET from SECRET env (or CRON_SECRET).
 *
 *   SECRET=... VERCEL_TOKEN=... VERCEL_ORG_ID=... VERCEL_PROJECT_ID=... node scripts/ops-set-pp-first-party-env-gha.mjs
 */
const token = process.env.VERCEL_TOKEN?.trim();
const teamId = process.env.VERCEL_ORG_ID?.trim();
const projectId = process.env.VERCEL_PROJECT_ID?.trim();
const secret =
  process.env.SECRET?.trim() ||
  process.env.PP_FIRST_PARTY_FETCH_SECRET?.trim() ||
  process.env.CRON_SECRET?.trim();

if (!token || !teamId || !projectId || !secret) {
  console.error('Need VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, and SECRET');
  process.exit(2);
}

async function vercel(apiPath, opts = {}) {
  const url = new URL(`https://api.vercel.com${apiPath}`);
  url.searchParams.set('teamId', teamId);
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
  console.error('env list failed', list.status, JSON.stringify(list.json));
  process.exit(2);
}

const hasCron = (list.json.envs || []).some((e) => e.key === 'CRON_SECRET');
console.log('CRON_SECRET present on project:', hasCron);

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
    console.log('created', target, cre.status, cre.json?.error || 'ok');
  }
}

console.log('Done. Redeploy so Preview/Production pick up the secret.');
