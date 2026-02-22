/**
 * Convert Sovereign Intelligence serial chapter header SVGs to 1000x420 PNG.
 * Reads content/coderlegion-sovereign-intelligence-serial/images/chapter-NN-header.svg,
 * renders at 1000x420, writes chapter-NN-header.png next to each SVG.
 * Run: node scripts/serial-covers-to-png.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const imagesDir = path.join(root, 'content/coderlegion-sovereign-intelligence-serial/images');

for (let n = 1; n <= 12; n++) {
  const name = `chapter-${String(n).padStart(2, '0')}-header`;
  const svgPath = path.join(imagesDir, `${name}.svg`);
  const outPath = path.join(imagesDir, `${name}.png`);

  if (!fs.existsSync(svgPath)) {
    console.warn('Skip (missing):', svgPath);
    continue;
  }

  let svg = fs.readFileSync(svgPath, 'utf8');
  // Force output size 1000x420: set width/height on root <svg> so Resvg renders at that size
  svg = svg.replace(/<svg\s/, '<svg width="1000" height="420" ');

  const resvg = new Resvg(Buffer.from(svg));
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  fs.writeFileSync(outPath, pngBuffer);
  console.log('Written', outPath, `(${pngData.width}x${pngData.height})`);
}

console.log('Done. Update cover_image in each post to ./images/chapter-NN-header.png');
