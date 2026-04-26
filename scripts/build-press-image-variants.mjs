/**
 * scripts/build-press-image-variants.mjs
 *
 * Phase 2 - Pillar C-1 (image asset).
 *
 * Builds responsive press-grade variants of the founder photo from a single
 * source asset. Pixel resampling only (Lanczos3 + light unsharp mask). NO
 * generative synthesis - the founder's likeness must remain artifact-backed.
 *
 * Source : public/press/abba/IMG_9086-original.png  (820 x 1024)
 * Output : public/press/abba/abba-uk-black-business-show-{w}.{avif|webp|jpg}
 *          for w in {820, 1640, 3072}
 *
 * Note on "4K": the source is ~0.84 MP (820x1024). True UHD 4K is ~8 MP
 * (3840x2160). We resample to 3072 wide (~12 MP at the original aspect
 * ratio) which is sufficient to render crisply on a 4K display at
 * realistic on-page widths (page caps at 780px content column => DPR 4
 * needs only 3120px source width). Beyond that, additional pixels add
 * file weight without improving perceived quality.
 *
 * Re-run with:  node scripts/build-press-image-variants.mjs
 */

import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(ROOT, 'public', 'press', 'abba', 'IMG_9086-original.png');
const OUT_DIR = path.join(ROOT, 'public', 'press', 'abba');
const STEM = 'abba-uk-black-business-show';

// Target widths (px, long axis preserved by sharp.resize-by-width)
const WIDTHS = [820, 1640, 3072];

await mkdir(OUT_DIR, { recursive: true });

const meta = await sharp(SRC).metadata();
console.log(`source: ${SRC}`);
console.log(`        ${meta.width}x${meta.height}px  format=${meta.format}  size=${(await stat(SRC)).size}b`);

const results = [];

for (const w of WIDTHS) {
  const base = sharp(SRC)
    // Lanczos3 is the gold standard for non-AI photo upscaling.
    .resize({ width: w, kernel: sharp.kernel.lanczos3, withoutEnlargement: false })
    // Light unsharp mask to recover apparent crispness lost in resampling.
    // sigma=0.6 / flat=1.0 / jagged=1.5 - conservative; protects skin tones.
    .sharpen({ sigma: 0.6, m1: 1.0, m2: 1.5 })
    .withMetadata({ density: 96 });

  for (const fmt of ['avif', 'webp', 'jpg']) {
    const outPath = path.join(OUT_DIR, `${STEM}-${w}.${fmt}`);
    let pipe = base.clone();
    if (fmt === 'avif') pipe = pipe.avif({ quality: 60, effort: 6 });
    else if (fmt === 'webp') pipe = pipe.webp({ quality: 82, effort: 5 });
    else pipe = pipe.jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:2:0' });
    const info = await pipe.toFile(outPath);
    const bytes = (await stat(outPath)).size;
    results.push({ width: w, fmt, bytes, outPath: path.relative(ROOT, outPath) });
    console.log(`  -> ${path.relative(ROOT, outPath).padEnd(60)}  ${info.width}x${info.height}  ${(bytes / 1024).toFixed(1).padStart(7)} KB`);
  }
}

console.log('');
console.log(`built ${results.length} variants in ${path.relative(ROOT, OUT_DIR)}`);