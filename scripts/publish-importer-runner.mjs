import http from 'node:http';
import { execFileSync } from 'node:child_process';

const PORT = Number(process.env.PORT || 8787);
const SECRET = process.env.NPM_PUBLISH_RUNNER_SECRET || '';
const REPO_DIR = process.env.REPO_DIR || process.cwd();

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sh(cwd, cmd, args) {
  return execFileSync(cmd, args, { cwd, stdio: 'pipe', encoding: 'utf8', env: process.env });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (req.url !== '/publish') return json(res, 404, { error: 'Not found' });

  const got = req.headers['x-runner-secret'];
  if (!SECRET || got !== SECRET) return json(res, 401, { error: 'Unauthorized' });

  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    try {
      const payload = JSON.parse(body || '{}');
      if (payload.package !== 'importer') return json(res, 400, { error: 'Unsupported package' });

      // NOTE: This runner must have:
      // - git, node, npm available
      // - NPM_TOKEN in env (granular token allowed by your npm org policy)
      // - REPO_DIR pointing at a checked out repo with correct remote
      const out = [];
      out.push(sh(REPO_DIR, 'git', ['fetch', '--tags', 'origin']));
      out.push(sh(REPO_DIR, 'git', ['checkout', 'main']));
      out.push(sh(REPO_DIR, 'git', ['pull', '--ff-only']));
      out.push(sh(REPO_DIR, 'npm', ['ci']));
      out.push(sh(REPO_DIR, 'npm', ['run', 'build:importer']));
      out.push(sh(`${REPO_DIR}/packages/importer`, 'npm', ['publish', '--access', 'public']));

      return json(res, 200, { success: true, output: out.map((s) => s.slice(0, 2000)) });
    } catch (e) {
      return json(res, 500, { success: false, error: String(e?.message || e) });
    }
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[publish-runner] listening on :${PORT} (repo=${REPO_DIR})`);
});

