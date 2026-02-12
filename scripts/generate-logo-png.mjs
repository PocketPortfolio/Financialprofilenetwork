#!/usr/bin/env node
/**
 * Generates public/brand/pp-monogram.png for email header.
 * Baked background: #0d2818 (dark green) so contrast exists even when clients strip CSS.
 * White "mark" in center so logo is visible regardless of container background.
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
// Baked background: header green #0d2818 (R=13, G=40, B=24)
const BG_R = 13, BG_G = 40, BG_B = 24;
// White mark in center (simple rect; replace with proper "P" from design tool if needed)
const WHITE = 255;
const INSET = 20; // white rect from 20..60 x 20..60

const data = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const inRect = x >= INSET && x < W - INSET && y >= INSET && y < H - INSET;
    const v = (x + y) % 2; // slight variation so PNG doesn't collapse to ~200 bytes
    if (inRect) {
      data[i + 0] = Math.max(0, WHITE - v);
      data[i + 1] = Math.max(0, WHITE - v);
      data[i + 2] = Math.max(0, WHITE - v);
    } else {
      data[i + 0] = Math.min(255, BG_R + v);
      data[i + 1] = Math.min(255, BG_G + v);
      data[i + 2] = Math.min(255, BG_B + v);
    }
    data[i + 3] = 255;
  }
}

const png = { width: W, height: H, data };
const buf = PNG.sync.write(png);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log('Wrote', outPath);
