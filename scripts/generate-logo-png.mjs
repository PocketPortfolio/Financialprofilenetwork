#!/usr/bin/env node
/**
 * Generates public/brand/pp-monogram.png from solid brand color (dark blue #0b1220).
 * Use this when SVG/data-URI logo doesn't render in email clients (e.g. Outlook).
 * For a proper "P" logo, run scripts/svg-to-png-puppeteer.mjs with Chrome, or export from design tool.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'public', 'brand', 'pp-monogram.png');

const W = 80;
const H = 80;
// Brand dark blue from SVG: #0b1220
const R = 11, G = 18, B = 32, A = 255;

const data = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  data[i * 4 + 0] = R;
  data[i * 4 + 1] = G;
  data[i * 4 + 2] = B;
  data[i * 4 + 3] = A;
}

const png = { width: W, height: H, data };
const buf = PNG.sync.write(png);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log('Wrote', outPath);
