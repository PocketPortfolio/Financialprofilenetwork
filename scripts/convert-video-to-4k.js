#!/usr/bin/env node
'use strict';
/**
 * Convert a video file to 4K (3840×2160) using ffmpeg.
 * Uses Lanczos scaling for better upscale quality.
 *
 * Usage: node scripts/convert-video-to-4k.js "path/to/Soverign AI.mp4"
 * Or:    node scripts/convert-video-to-4k.js "C:\Users\You\Videos\Soverign AI.mp4"
 *
 * Requires: ffmpeg on PATH (https://ffmpeg.org/download.html)
 * Output: same folder as input, filename_4k.mp4
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const inputPath = process.argv[2];
const WIDTH = 3840;
const HEIGHT = 2160;

if (!inputPath || !fs.existsSync(inputPath)) {
  console.error('Usage: node scripts/convert-video-to-4k.js "<path-to-video>.mp4"');
  console.error('Example: node scripts/convert-video-to-4k.js "C:\\Users\\fitne\\Videos\\Soverign AI.mp4"');
  process.exit(1);
}

const parsed = path.parse(path.resolve(inputPath));
const outputPath = path.join(parsed.dir, `${parsed.name}_4k.mp4`);

const scaleFilter = `scale=${WIDTH}:${HEIGHT}:flags=lanczos`;
const quote = (p) => (p.includes(' ') ? `"${p}"` : p);
const cmd = [
  'ffmpeg',
  '-i', quote(inputPath),
  '-vf', scaleFilter,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '23',
  '-c:a', 'copy',
  '-y',
  quote(outputPath),
].join(' ');

console.log('Converting to 4K (3840×2160)...');
console.log('Input:', inputPath);
console.log('Output:', outputPath);
try {
  execSync(cmd, { stdio: 'inherit', shell: true });
  console.log('Done:', outputPath);
} catch (e) {
  console.error('ffmpeg failed. Is ffmpeg installed and on PATH?');
  process.exit(1);
}
