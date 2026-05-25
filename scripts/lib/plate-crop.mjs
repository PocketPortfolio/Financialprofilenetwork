/**
 * Crop deck plates into unique 16:9 landing PNGs (no duplicate full frames).
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT_W = 3840;
const OUT_H = 2160;

/**
 * @param {object} opts
 * @param {string} opts.srcPath
 * @param {string} opts.destPath
 * @param {{ left: number; top: number; width: number; height: number }} opts.region fractions 0–1
 */
export async function bakePlate16x9({ srcPath, destPath, region }) {
  const meta = await sharp(srcPath).metadata();
  const sw = meta.width ?? 2560;
  const sh = meta.height ?? 1440;

  const left = Math.max(0, Math.floor(sw * region.left));
  const top = Math.max(0, Math.floor(sh * region.top));
  const width = Math.min(sw - left, Math.floor(sw * region.width));
  const height = Math.min(sh - top, Math.floor(sh * region.height));

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  await sharp(srcPath)
    .extract({ left, top, width, height })
    .resize(OUT_W, OUT_H, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 6 })
    .toFile(destPath);
}

/**
 * @param {string} srcPath
 * @param {string} destPath
 */
export async function bakeFullPlate16x9(srcPath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  await sharp(srcPath)
    .resize(OUT_W, OUT_H, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 6 })
    .toFile(destPath);
}

export async function fileHashPrefix(filePath) {
  const buf = await fs.promises.readFile(filePath);
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
}
