/**
 * Export LinkedIn member profile cover at exact spec: 1584×396 (4:1).
 * Crops center band from source, then resizes with sharp (Lanczos).
 *
 * Usage:
 *   node scripts/export-linkedin-cover-linkedin-spec.mjs
 *   node scripts/export-linkedin-cover-linkedin-spec.mjs --input=path/to/source.png
 *
 * Outputs (public/marketing/):
 *   linkedin-abba-head-ai-community-cover-1584x396.png
 *   linkedin-abba-head-ai-community-cover-1584x396.jpg  (often best for LinkedIn upload)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'marketing');

/** LinkedIn personal profile background — official 4:1 */
const LI_W = 1584;
const LI_H = 396;
const LI_ASPECT = LI_W / LI_H; // 4.0

const MAX_BYTES = 8 * 1024 * 1024; // LinkedIn max ~8 MB

function parseInput(argv) {
  for (const a of argv) {
    const m = /^--input=(.+)$/.exec(a);
    if (m) return path.isAbsolute(m[1]) ? m[1] : path.resolve(root, m[1]);
  }
  const candidates = [
    path.join(outDir, 'linkedin-abba-head-ai-community-cover-sota.png'),
    path.join(
      process.env.USERPROFILE || '',
      '.cursor/projects/c-dev-pocket-portfolio-app/assets/linkedin-abba-head-ai-community-cover-sota.png'
    ),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  throw new Error('No source image found. Pass --input=path/to/source.png');
}

/**
 * Center crop to 4:1 (keeps horizontal full width when possible).
 */
function cropRect(meta) {
  const { width: w, height: h } = meta;
  const srcAspect = w / h;
  if (Math.abs(srcAspect - LI_ASPECT) < 0.01) {
    return { left: 0, top: 0, width: w, height: h };
  }
  if (srcAspect > LI_ASPECT) {
    const cropW = Math.round(h * LI_ASPECT);
    const left = Math.round((w - cropW) / 2);
    return { left, top: 0, width: cropW, height: h };
  }
  const cropH = Math.round(w / LI_ASPECT);
  const top = Math.round((h - cropH) / 2);
  return { left: 0, top, width: w, height: cropH };
}

async function writeOutputs(pipeline, baseName) {
  const pngPath = path.join(outDir, `${baseName}.png`);
  const jpgPath = path.join(outDir, `${baseName}.jpg`);

  const pngBuf = await pipeline.clone().png({ compressionLevel: 9 }).toBuffer();
  fs.writeFileSync(pngPath, pngBuf);

  let quality = 92;
  let jpgBuf = await pipeline.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
  while (jpgBuf.length > MAX_BYTES && quality > 60) {
    quality -= 5;
    jpgBuf = await pipeline.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
  }
  fs.writeFileSync(jpgPath, jpgBuf);

  const verify = await sharp(pngPath).metadata();
  console.log('Wrote', pngPath, `${verify.width}x${verify.height}`, `${Math.round(pngBuf.length / 1024)} KB`);
  console.log('Wrote', jpgPath, `${Math.round(jpgBuf.length / 1024)} KB`, `q=${quality}`);
  console.log('Aspect', (verify.width / verify.height).toFixed(4), '(target 4.0000)');

  if (verify.width !== LI_W || verify.height !== LI_H) {
    throw new Error(`Dimension mismatch: got ${verify.width}x${verify.height}`);
  }
}

async function main() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const inputPath = parseInput(process.argv.slice(2));
  const meta = await sharp(inputPath).metadata();
  console.log('Source:', inputPath, `${meta.width}x${meta.height}`, `aspect ${(meta.width / meta.height).toFixed(3)}`);

  const crop = cropRect(meta);
  console.log('Crop:', crop);

  const pipeline = sharp(inputPath)
    .extract(crop)
    .resize(LI_W, LI_H, { fit: 'fill', kernel: sharp.kernel.lanczos3 });

  await writeOutputs(pipeline, 'linkedin-abba-head-ai-community-cover-1584x396');

  // Alias for upload (overwrite 2× wireframe file name if present)
  const uploadPng = path.join(outDir, 'linkedin-abba-head-ai-community-cover.png');
  fs.copyFileSync(path.join(outDir, 'linkedin-abba-head-ai-community-cover-1584x396.png'), uploadPng);
  console.log('Wrote', uploadPng, '(upload copy)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
