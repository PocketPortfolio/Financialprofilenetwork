import fs from 'fs';
import { Agent, fetch as undiciFetch } from 'node:undici';

const longAgent = new Agent({
  headersTimeout: 900_000,
  bodyTimeout: 900_000,
  connectTimeout: 120_000,
});

function envLocal() {
  const map = {};
  for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) map[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return map;
}

async function chat(key, baseUrl, model, label) {
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
  const t0 = Date.now();
  const res = await undiciFetch(url, {
    method: 'POST',
    dispatcher: longAgent,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      max_tokens: 12,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    }),
  });
  const text = await res.text();
  console.log(label, res.status, `${Date.now() - t0}ms`, text.slice(0, 240));
  return res.ok;
}

const local = envLocal();
const key = local.RUNPOD_API_KEY || local.OLLAMA_API_KEY;
const llama = local.OLLAMA_LLAMA_BASE_URL;
const r1 = local.OLLAMA_REASONING_BASE_URL;
if (!key || !llama || !r1) {
  console.error('Need RUNPOD_API_KEY, OLLAMA_LLAMA_BASE_URL, OLLAMA_REASONING_BASE_URL in .env.local');
  process.exit(2);
}

const okR1 = await chat(key, r1, local.OLLAMA_REASONING_MODEL || 'deepseek-r1:7b-qwen-distill-q4_K_M', 'R1');
const okLlama = await chat(key, llama, local.OLLAMA_DEFAULT_MODEL || 'llama3.1:8b-instruct-q4_K_M', 'SOV');

const pods = await (
  await fetch('https://rest.runpod.io/v1/pods', { headers: { Authorization: `Bearer ${key}` } })
).json();
const eps = await (
  await fetch('https://rest.runpod.io/v1/endpoints', { headers: { Authorization: `Bearer ${key}` } })
).json();
console.log(
  'PAYG_CHECK',
  JSON.stringify({
    pods: (pods || []).length,
    endpoints: (eps || []).map((e) => ({
      name: e.name,
      min: e.workersMin,
      max: e.workersMax,
      idle: e.idleTimeout,
    })),
  }),
);
console.log(okR1 && okLlama ? 'MANDATE_SMOKE_BOTH_OK' : 'MANDATE_SMOKE_PARTIAL');
process.exit(okR1 && okLlama ? 0 : 1);
