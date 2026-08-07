/**
 * Soft-launch concurrency: scale op-sovereign-r1 for multi-user Ask AI.
 * - workersMin=1 → keep one warm (no 3min cold for first ask)
 * - workersMax=5 → concurrent Sovereign without one-GPU queue stampede
 * - idleTimeout=600 → stay warm between asks; still scales toward min
 *
 * Usage: node scripts/ops-soft-launch-sovereign-capacity.mjs
 */
import fs from 'fs';

const EP = 'sci7vw5ovb0xnd';
const REST = 'https://rest.runpod.io/v1';

function envLocal() {
  const map = {};
  try {
    for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) map[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  } catch {
    /* ignore */
  }
  return map;
}

const local = envLocal();
const key = local.RUNPOD_API_KEY || local.OLLAMA_API_KEY;
if (!key) {
  console.error('Need RUNPOD_API_KEY or OLLAMA_API_KEY in .env.local');
  process.exit(2);
}

const body = {
  workersMin: 1,
  workersMax: 5,
  idleTimeout: 600,
};

const get = await fetch(`${REST}/endpoints/${EP}`, {
  headers: { Authorization: `Bearer ${key}` },
});
const before = await get.json();
console.log(
  'BEFORE',
  JSON.stringify({
    name: before.name,
    workersMin: before.workersMin,
    workersMax: before.workersMax,
    idleTimeout: before.idleTimeout,
  }),
);

const patch = await fetch(`${REST}/endpoints/${EP}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});
const afterText = await patch.text();
let after;
try {
  after = JSON.parse(afterText);
} catch {
  after = { raw: afterText };
}
console.log('PATCH', patch.status);
console.log(
  'AFTER',
  JSON.stringify({
    name: after.name,
    workersMin: after.workersMin,
    workersMax: after.workersMax,
    idleTimeout: after.idleTimeout,
  }),
);

if (!patch.ok) {
  console.error(afterText.slice(0, 500));
  process.exit(1);
}

// Probe warm path
const t0 = Date.now();
const models = await fetch(`https://api.runpod.ai/v2/${EP}/openai/v1/models`, {
  headers: { Authorization: `Bearer ${key}` },
  signal: AbortSignal.timeout(60_000),
}).catch((e) => ({ ok: false, status: 0, err: e }));
console.log(
  'MODELS_PROBE',
  JSON.stringify({
    ok: !!models.ok,
    status: models.status || 0,
    ms: Date.now() - t0,
  }),
);

console.log('SOFT_LAUNCH_CAPACITY_OK');
