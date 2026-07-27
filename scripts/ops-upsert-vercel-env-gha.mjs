/**
 * Upsert one or more encrypted env vars on Vercel (Preview + Production + Development).
 *
 * Env:
 *   VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
 *   VERCEL_ENV_UPSERTS = JSON object { "KEY": "value", ... }
 *     OR single: VERCEL_ENV_KEY + SECRET (or VERCEL_ENV_VALUE)
 *
 *   node scripts/ops-upsert-vercel-env-gha.mjs
 */
const token = process.env.VERCEL_TOKEN?.trim();
const teamId = process.env.VERCEL_ORG_ID?.trim();
const projectId = process.env.VERCEL_PROJECT_ID?.trim();

if (!token || !teamId || !projectId) {
  console.error('Need VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID');
  process.exit(2);
}

/** @type {Record<string, string>} */
let upserts = {};
if (process.env.VERCEL_ENV_UPSERTS?.trim()) {
  try {
    upserts = JSON.parse(process.env.VERCEL_ENV_UPSERTS);
  } catch (e) {
    console.error('VERCEL_ENV_UPSERTS must be JSON', e);
    process.exit(2);
  }
} else {
  const key = process.env.VERCEL_ENV_KEY?.trim();
  const value =
    process.env.SECRET?.trim() ||
    process.env.VERCEL_ENV_VALUE?.trim() ||
    process.env.GA4_MEASUREMENT_PROTOCOL_SECRET?.trim();
  if (!key || !value) {
    console.error('Need VERCEL_ENV_UPSERTS JSON or VERCEL_ENV_KEY + SECRET');
    process.exit(2);
  }
  upserts[key] = value;
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

const envs = list.json.envs || [];
const targets = ['production', 'preview', 'development'];

for (const [key, value] of Object.entries(upserts)) {
  if (!value) {
    console.error('empty value for', key);
    process.exit(2);
  }
  for (const target of targets) {
    const existing = envs.find((e) => e.key === key && (e.target || []).includes(target));
    if (existing?.id) {
      const upd = await vercel(`/v9/projects/${projectId}/env/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ value, type: 'encrypted', target: existing.target }),
      });
      console.log(key, 'updated', target, upd.status);
    } else {
      const cre = await vercel(`/v10/projects/${projectId}/env`, {
        method: 'POST',
        body: JSON.stringify({
          key,
          value,
          type: 'encrypted',
          target: [target],
        }),
      });
      console.log(key, 'created', target, cre.status, cre.json?.error || 'ok');
    }
  }
}

console.log('Done. Redeploy so runtimes pick up env.');
