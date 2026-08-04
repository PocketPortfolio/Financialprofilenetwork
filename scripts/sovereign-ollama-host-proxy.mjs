/**
 * Local reverse proxy: public tunnels → Ollama.
 * Rewrites Host to 127.0.0.1:11434 (Ollama 403s on foreign Host headers).
 *
 *   node scripts/sovereign-ollama-host-proxy.mjs
 *   # then tunnel to http://127.0.0.1:11435
 */
import http from 'http';

const LISTEN = Number(process.env.SOVEREIGN_PROXY_PORT || 11435);
const UPSTREAM = process.env.OLLAMA_UPSTREAM || '127.0.0.1';
const UP_PORT = Number(process.env.OLLAMA_UPSTREAM_PORT || 11434);

const server = http.createServer((req, res) => {
  const headers = { ...req.headers, host: `${UPSTREAM}:${UP_PORT}` };
  const opts = {
    hostname: UPSTREAM,
    port: UP_PORT,
    path: req.url,
    method: req.method,
    headers,
  };
  const proxy = http.request(opts, (up) => {
    res.writeHead(up.statusCode || 502, up.headers);
    up.pipe(res);
  });
  proxy.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`sovereign proxy upstream error: ${err.message}`);
  });
  req.pipe(proxy);
});

server.listen(LISTEN, '127.0.0.1', () => {
  console.log(
    `Sovereign Ollama host-proxy listening http://127.0.0.1:${LISTEN} → ${UPSTREAM}:${UP_PORT}`,
  );
});
