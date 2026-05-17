/**
 * Generate Open Portfolio (O.) brand PNGs from the master SVG.
 *
 * Source : public/brand/op-monogram-amber.svg
 * Output : public/brand/op-monogram-amber.png  (1024x1024 — used as canonical CDN logo)
 *          public/brand/op-icon.png            (256x256  — parallel to pp-icon.png used by <Logo /> )
 *
 * This is the O. parallel of scripts/generate-social-logo.mjs. The PNG outputs
 * are required by lib/canonical-claims.ts SURFACE_ORG.open.logo (https URL)
 * and app/components/Logo.tsx (when variant='open').
 *
 * Run: node scripts/generate-open-logo.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public/brand/op-monogram-amber.svg');

const TARGETS = [
  { out: 'public/brand/op-monogram-amber.png', size: 1024, source: svgPath },
  { out: 'public/brand/op-icon.png', size: 256, source: svgPath },
  {
    out: 'public/open/og/open-portfolio-default.png',
    width: 1200,
    source: path.join(root, 'public/open/og/open-portfolio-default.svg'),
  },
];

for (const target of TARGETS) {
  const svgBuf = fs.readFileSync(target.source);
  const resvg = new Resvg(svgBuf, {
    fitTo: target.width
      ? { mode: 'width', value: target.width }
      : { mode: 'width', value: target.size },
  });
  const png = resvg.render();
  const outPath = path.join(root, target.out);
  fs.writeFileSync(outPath, png.asPng());
  console.log(`Written ${target.out} (${png.width}x${png.height})`);
}
