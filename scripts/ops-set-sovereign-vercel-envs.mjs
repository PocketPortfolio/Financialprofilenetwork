/**
 * Upsert Sovereign AI / Ask AI hosted-node envs on Vercel (prod + preview + development).
 *
 * Usage:
 *   node scripts/ops-set-sovereign-vercel-envs.mjs
 *   node scripts/ops-set-sovereign-vercel-envs.mjs --base-url https://POD-11434.proxy.runpod.net/v1
 *   node scripts/ops-set-sovereign-vercel-envs.mjs --redeploy
 *
 * Reads OLLAMA_BASE_URL from argv --base-url, else env OLLAMA_BASE_URL, else .env.local.
 * Sets NEXT_PUBLIC_ENABLE_LOCAL_AI=true and model IDs. Optional OLLAMA_API_KEY from env/.env.local.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

function parseArgs(argv) {
  const out = { baseUrl: null, redeploy: false, apiKey: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--redeploy') out.redeploy = true;
    else if (a === '--base-url') out.baseUrl = argv[++i];
    else if (a === '--api-key') out.apiKey = argv[++i];
  }
  return out;
}

function readEnvLocal() {
  const p = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(p)) return {};
  /** @type {Record<string, string>} */
  const map = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    map[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return map;
}

function vercelAuth() {
  const authPath = path.join(
    os.homedir(),
    'AppData',
    'Roaming',
    'com.vercel.cli',
    'Data',
    'auth.json',
  );
  if (!fs.existsSync(authPath)) throw new Error('Run: npx vercel login');
  const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  const token = auth.token || auth.accessToken;
  if (!token) throw new Error('No Vercel token in auth.json');
  const project = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
  return { token, orgId: project.orgId, projectId: project.projectId };
}

async function main() {
  const args = parseArgs(process.argv);
  const local = readEnvLocal();
  const baseUrl = (
    args.baseUrl ||
    process.env.OLLAMA_BASE_URL ||
    local.OLLAMA_BASE_URL ||
    ''
  )
    .trim()
    .replace(/\/$/, '');
  if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    console.error(
      'Refusing to set Vercel OLLAMA_BASE_URL to localhost.\n' +
        'Pass a public OpenAI-compat URL, e.g.\n' +
        '  node scripts/ops-set-sovereign-vercel-envs.mjs --base-url https://xxxx-11434.proxy.runpod.net/v1 --redeploy',
    );
    process.exit(2);
  }
  if (!baseUrl.endsWith('/v1') && !baseUrl.includes('/v1')) {
    console.warn('WARNING: base URL should usually end with /v1 (OpenAI-compat). Got:', baseUrl);
  }

  const defaultModel =
    process.env.OLLAMA_DEFAULT_MODEL ||
    local.OLLAMA_DEFAULT_MODEL ||
    'deepseek-r1:7b-qwen-distill-q4_K_M';
  const reasoningModel =
    process.env.OLLAMA_REASONING_MODEL ||
    local.OLLAMA_REASONING_MODEL ||
    'deepseek-r1:7b-qwen-distill-q4_K_M';
  const apiKey =
    args.apiKey ||
    process.env.OLLAMA_API_KEY ||
    local.OLLAMA_API_KEY ||
    '';

  /** @type {Record<string, string>} */
  const upserts = {
    NEXT_PUBLIC_ENABLE_LOCAL_AI: 'true',
    OLLAMA_BASE_URL: baseUrl,
    OLLAMA_DEFAULT_MODEL: defaultModel,
    OLLAMA_REASONING_MODEL: reasoningModel,
  };
  if (apiKey) upserts.OLLAMA_API_KEY = apiKey;

  const { token, orgId, projectId } = vercelAuth();
  console.log('Upserting Sovereign envs for project', projectId);
  console.log('OLLAMA_BASE_URL=', baseUrl);
  console.log('models=', defaultModel, '|', reasoningModel);
  console.log('OLLAMA_API_KEY=', apiKey ? '(set)' : '(unset)');

  const r = spawnSync(process.execPath, ['scripts/ops-upsert-vercel-env-gha.mjs'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VERCEL_TOKEN: token,
      VERCEL_ORG_ID: orgId,
      VERCEL_PROJECT_ID: projectId,
      VERCEL_ENV_UPSERTS: JSON.stringify(upserts),
    },
  });
  if (r.status !== 0) process.exit(r.status || 1);

  // Keep local pointer for ops (does not commit).
  let raw = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
  const setLine = (key, value) => {
    const re = new RegExp(`^${key}=.*$`, 'm');
    if (re.test(raw)) raw = raw.replace(re, `${key}=${value}`);
    else raw = `${raw.trimEnd()}\n${key}=${value}\n`;
  };
  setLine('OLLAMA_BASE_URL', baseUrl);
  setLine('NEXT_PUBLIC_ENABLE_LOCAL_AI', 'true');
  setLine('OLLAMA_DEFAULT_MODEL', defaultModel);
  setLine('OLLAMA_REASONING_MODEL', reasoningModel);
  fs.writeFileSync('.env.local', raw);
  console.log('.env.local updated with public base URL (gitignored)');

  if (args.redeploy) {
    const hook = local.VERCEL_DEPLOY_HOOK_URL || process.env.VERCEL_DEPLOY_HOOK_URL;
    if (hook) {
      const res = await fetch(hook.trim(), { method: 'POST' });
      console.log('deploy_hook', res.status);
    } else {
      const dep = spawnSync('npx', ['vercel', 'deploy', '--prod', '--yes'], {
        stdio: 'inherit',
        shell: true,
      });
      if (dep.status !== 0) {
        console.warn('Redeploy CLI failed; trigger from Vercel dashboard.');
      }
    }
  } else {
    console.log('Skip redeploy (pass --redeploy). NEXT_PUBLIC_* needs a new build.');
  }

  console.log('SOVEREIGN_VERCEL_ENVS_DONE');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
