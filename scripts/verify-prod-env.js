const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
let secret = '';
try {
  const content = fs.readFileSync(envPath, 'utf8');
  const m = content.match(/CRON_SECRET=(.+?)(?:\r?\n|$)/);
  if (m) secret = m[1].trim().replace(/^["']|["']$/g, '');
} catch (e) {}

const url = 'https://www.pocketportfolio.app/api/stack-reveal/verify-env';
fetch(url, { headers: { Authorization: 'Bearer ' + secret } })
  .then((r) => r.json().then((j) => ({ status: r.status, body: j })).catch(() => ({ status: r.status, body: null })))
  .then((x) => console.log(JSON.stringify(x, null, 2)))
  .catch((e) => console.log(JSON.stringify({ error: e.message })));
