/**
 * Export Hybrid RAG architecture diagram for LinkedIn (1080x1080 and 1200x628).
 * Run: node scripts/export-si-hybrid-rag-for-linkedin.mjs
 * Output: docs/marketing/Sovereign_Intelligence_Hybrid_RAG_1080x1080.png, _1200x628.png
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'docs/book/figures/si-figure-02-hybrid-architecture.svg');
const marketingDir = path.join(root, 'docs/marketing');

const sizes = [
  { w: 1080, h: 1080, name: 'Sovereign_Intelligence_Hybrid_RAG_1080x1080.png' },
  { w: 1200, h: 628, name: 'Sovereign_Intelligence_Hybrid_RAG_1200x628.png' },
];

let svg = fs.readFileSync(svgPath, 'utf8');

for (const { w, h, name } of sizes) {
  const sizedSvg = svg.replace(/<svg\s/, `<svg width="${w}" height="${h}" `);
  const resvg = new Resvg(Buffer.from(sizedSvg));
  const pngData = resvg.render();
  const outPath = path.join(marketingDir, name);
  fs.mkdirSync(marketingDir, { recursive: true });
  fs.writeFileSync(outPath, pngData.asPng());
  console.log('Written', outPath, `(${pngData.width}x${pngData.height})`);
}

console.log('Done. Use these for LinkedIn post image or document carousel.');
