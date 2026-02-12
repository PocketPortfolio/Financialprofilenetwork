/**
 * Convert email-safe logo SVG to public/brand/pp-monogram.png (no Chrome required).
 * Uses pp-monogram-email.svg (real "P" shape, #0d2818 bg, white mark).
 * Run: node scripts/svg-to-png-resvg.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public/brand/pp-monogram-email.svg');
const outPath = path.join(root, 'public/brand/pp-monogram.png');

const svg = fs.readFileSync(svgPath);
const opts = {
  fitTo: { mode: 'width', value: 80 },
};
const resvg = new Resvg(svg, opts);
const pngData = resvg.render();
const pngBuffer = pngData.asPng();
fs.writeFileSync(outPath, pngBuffer);
console.log('Written', outPath, `(${pngData.width}x${pngData.height})`);
