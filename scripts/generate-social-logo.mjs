/**
 * Generate square-edge social media avatars from the SOCIAL-ONLY master SVG.
 *
 * Source : public/brand/social/pp-social-square.svg  (no rounded corners)
 * Output : public/brand/social/pp-social-square-{400,512,1024}.png
 *
 * Why this exists:
 *   LinkedIn/X/Meta apply a circular mask to avatar uploads. Our standard
 *   rounded-square monogram leaves dark cutouts visible at the corners of
 *   the inscribed circle. The square-edge variant fills edge-to-edge so the
 *   circular mask trims the corners cleanly.
 *
 * Size rationale:
 *   - 400  : LinkedIn personal profile minimum (also Twitter/X recommended)
 *   - 512  : Cross-platform retina sweet spot
 *   - 1024 : Future-proof, downscales beautifully for any platform
 *
 * Run: node scripts/generate-social-logo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public/brand/social/pp-social-square.svg');
const outDir = path.join(root, 'public/brand/social');

const SIZES = [400, 512, 1024];

const svg = fs.readFileSync(svgPath);

for (const size of SIZES) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render();
  const outPath = path.join(outDir, `pp-social-square-${size}.png`);
  fs.writeFileSync(outPath, png.asPng());
  console.log(`Written ${path.relative(root, outPath)} (${png.width}x${png.height})`);
}
