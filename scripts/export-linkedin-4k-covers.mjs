/**
 * One-off: upscale marketing covers to 4K for LinkedIn.
 * Run: node scripts/export-linkedin-4k-covers.mjs
 */
import sharp from 'sharp';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dir = join(root, 'public', 'marketing');

const inputs = [
  'marketing-cover-post1-community.png',
  'marketing-cover-post2-technical.png',
];

const bg = { r: 15, g: 15, b: 18, alpha: 1 };

for (const name of inputs) {
  const input = join(dir, name);
  const base = name.replace(/\.png$/i, '');
  const w3840 = join(dir, `${base}-linkedin-4k-3840w.png`);
  const uhd = join(dir, `${base}-linkedin-4k-3840x2160.png`);

  await sharp(input)
    .resize({ width: 3840, withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(w3840);

  const resized = await sharp(input)
    .resize(3840, 2160, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  await sharp({
    create: {
      width: 3840,
      height: 2160,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(uhd);

  console.log('OK', basename(w3840), basename(uhd));
}
