/**
 * Deploy RunPod Serverless (PAYG scale-to-zero) sovereign endpoints + wire Vercel.
 * No git commit/push.
 *
 * Requires RUNPOD_API_KEY in .env.local and account balance >= $0.01.
 *
 *   node scripts/ops-deploy-runpod-serverless-sovereign.mjs
 *   node scripts/ops-deploy-runpod-serverless-sovereign.mjs --redeploy-vercel
 *   node scripts/ops-deploy-runpod-serverless-sovereign.mjs --wait-funds
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

const REST = 'https://rest.runpod.io/v1';
const IMAGE = 'runpod/worker-v1-vllm:v2.23.0';
const MODEL_LLAMA_HF = 'Qwen/Qwen2.5-7B-Instruct'; // temporary until Meta Llama + HF_TOKEN; served as llama3.1 ID
const MODEL_R1_HF = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B';
const SERVED_LLAMA = 'llama3.1:8b-instruct-q4_K_M';
const SERVED_R1 = 'deepseek-r1:7b-qwen-distill-q4_K_M';

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

function apiKey() {
  const key = (process.env.RUNPOD_API_KEY || readEnvLocal().RUNPOD_API_KEY || '').trim();
  if (!key) {
    console.error('Missing RUNPOD_API_KEY in env / .env.local');
    process.exit(2);
  }
  return key;
}

async function rest(key, method, apiPath, body) {
  const res = await fetch(`${REST}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 800) };
  }
  return { status: res.status, json, text };
}

async function balance(key) {
  const url = `https://api.runpod.io/graphql?api_key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ myself { clientBalance email } }' }),
  });
  const j = await res.json();
  return Number(j?.data?.myself?.clientBalance ?? 0);
}

async function ensureTemplate(key, name, modelName, servedName, extraEnv = {}) {
  const list = await rest(key, 'GET', '/templates');
  const templates = Array.isArray(list.json) ? list.json : [];
  const existing = templates.find((t) => t.name === name);
  if (existing?.id) {
    console.log('reuse_template', name, existing.id);
    return existing.id;
  }
  const env = {
    MODEL_NAME: modelName,
    MAX_MODEL_LEN: '8192',
    RAW_OPENAI_OUTPUT: '1',
    OPENAI_SERVED_MODEL_NAME_OVERRIDE: servedName,
    GPU_MEMORY_UTILIZATION: '0.90',
    ...extraEnv,
  };
  const hf = process.env.HF_TOKEN || readEnvLocal().HF_TOKEN || readEnvLocal().HUGGING_FACE_HUB_TOKEN;
  if (hf) env.HF_TOKEN = hf;

  const created = await rest(key, 'POST', '/templates', {
    name,
    imageName: IMAGE,
    isServerless: true,
    containerDiskInGb: 50,
    volumeInGb: 0,
    ports: ['8000/http'],
    env,
  });
  if (created.status !== 201 && created.status !== 200) {
    console.error('template_fail', name, created.status, created.text.slice(0, 500));
    process.exit(1);
  }
  console.log('created_template', name, created.json.id);
  return created.json.id;
}

async function ensureEndpoint(key, name, templateId) {
  const list = await rest(key, 'GET', '/endpoints');
  const endpoints = Array.isArray(list.json) ? list.json : [];
  const existing = endpoints.find((e) => e.name === name);
  if (existing?.id) {
    console.log('reuse_endpoint', name, existing.id);
    return existing.id;
  }
  const created = await rest(key, 'POST', '/endpoints', {
    name,
    templateId,
    computeType: 'GPU',
    gpuTypeIds: [
      'NVIDIA GeForce RTX 4090',
      'NVIDIA RTX A5000',
      'NVIDIA GeForce RTX 3090',
      'NVIDIA A40',
    ],
    workersMin: 0,
    workersMax: 2,
    idleTimeout: 10,
    scalerType: 'QUEUE_DELAY',
    scalerValue: 4,
    flashboot: true,
  });
  if (created.status !== 200 && created.status !== 201) {
    console.error('endpoint_fail', name, created.status, created.text.slice(0, 600));
    if (String(created.text).includes('balance') || String(created.text).includes('$0.01')) {
      console.error(
        'Fund wallet (>= $0.01, recommend $20–50): https://console.runpod.io/user/billing',
      );
    }
    process.exit(1);
  }
  console.log('created_endpoint', name, created.json.id);
  return created.json.id;
}

function baseUrl(endpointId) {
  return `https://api.runpod.ai/v2/${endpointId}/openai/v1`;
}

function upsertLocal(map) {
  const p = path.join(process.cwd(), '.env.local');
  let raw = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  for (const [k, v] of Object.entries(map)) {
    const re = new RegExp(`^${k}=.*$`, 'm');
    if (re.test(raw)) raw = raw.replace(re, `${k}=${v}`);
    else raw = `${raw.trimEnd()}\n${k}=${v}\n`;
  }
  fs.writeFileSync(p, raw);
  console.log('.env.local updated (gitignored)');
}

function wireVercel(key, llamaUrl, r1Url, redeploy) {
  const upserts = {
    NEXT_PUBLIC_ENABLE_LOCAL_AI: 'true',
    OLLAMA_LLAMA_BASE_URL: llamaUrl,
    OLLAMA_REASONING_BASE_URL: r1Url,
    OLLAMA_BASE_URL: llamaUrl,
    OLLAMA_DEFAULT_MODEL: SERVED_LLAMA,
    OLLAMA_REASONING_MODEL: SERVED_R1,
    OLLAMA_API_KEY: key,
  };
  upsertLocal(upserts);

  const authPath = path.join(
    os.homedir(),
    'AppData',
    'Roaming',
    'com.vercel.cli',
    'Data',
    'auth.json',
  );
  const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'));
  const token = auth.token || auth.accessToken;
  const project = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
  const r = spawnSync(process.execPath, ['scripts/ops-upsert-vercel-env-gha.mjs'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VERCEL_TOKEN: token,
      VERCEL_ORG_ID: project.orgId,
      VERCEL_PROJECT_ID: project.projectId,
      VERCEL_ENV_UPSERTS: JSON.stringify(upserts),
    },
  });
  if (r.status !== 0) process.exit(r.status || 1);

  if (redeploy) {
    const hook = readEnvLocal().VERCEL_DEPLOY_HOOK_URL || process.env.VERCEL_DEPLOY_HOOK_URL;
    if (hook) {
      return fetch(hook.trim(), { method: 'POST' }).then((res) =>
        console.log('deploy_hook', res.status),
      );
    }
    console.log('No VERCEL_DEPLOY_HOOK_URL — trigger redeploy in dashboard if needed.');
  }
}

async function smoke(key, url, model) {
  console.log('smoke', model, url);
  const res = await fetch(`${url}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'User-Agent': 'pocket-portfolio-sovereign/1.0',
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    }),
  });
  const text = await res.text();
  console.log('smoke_status', res.status, text.slice(0, 280));
  return res.ok;
}

async function waitFunds(key, maxMs = 30 * 60 * 1000) {
  const start = Date.now();
  console.log('Waiting for RunPod balance >= $0.01 … https://console.runpod.io/user/billing');
  while (Date.now() - start < maxMs) {
    const bal = await balance(key);
    console.log(new Date().toISOString(), 'balance=', bal);
    if (bal >= 0.01) return bal;
    await new Promise((r) => setTimeout(r, 20000));
  }
  throw new Error('Timed out waiting for funds');
}

async function main() {
  const redeploy = process.argv.includes('--redeploy-vercel');
  const wait = process.argv.includes('--wait-funds');
  const key = apiKey();
  let bal = await balance(key);
  console.log('balance', bal);
  if (bal < 0.01) {
    if (!wait) {
      console.error('Balance too low. Re-run with --wait-funds after topping up, or top up now.');
      process.exit(2);
    }
    bal = await waitFunds(key);
  }

  const r1Tpl = await ensureTemplate(key, 'op-vllm-worker-r1', MODEL_R1_HF, SERVED_R1, {
    REASONING_PARSER: 'deepseek_r1',
  });
  const llamaTpl = await ensureTemplate(
    key,
    'op-vllm-worker-llama31',
    MODEL_LLAMA_HF,
    SERVED_LLAMA,
  );

  const r1Ep = await ensureEndpoint(key, 'op-sovereign-r1', r1Tpl);
  const llamaEp = await ensureEndpoint(key, 'op-sovereign-llama31', llamaTpl);

  const llamaUrl = baseUrl(llamaEp);
  const r1Url = baseUrl(r1Ep);
  console.log('LLAMA', llamaUrl);
  console.log('R1', r1Url);

  await wireVercel(key, llamaUrl, r1Url, redeploy);

  // Cold-start smoke (may take several minutes first time)
  const okLlama = await smoke(key, llamaUrl, SERVED_LLAMA);
  const okR1 = await smoke(key, r1Url, SERVED_R1);
  if (!okLlama || !okR1) {
    console.warn(
      'Smoke incomplete (cold start / HF gate). Llama needs HF_TOKEN for meta-llama if gated.',
    );
  }
  console.log('RUNPOD_SERVERLESS_PAYG_LIVE workersMin=0');
  console.log('Idle cost ≈ $0 GPU; billed per-second only while serving.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
