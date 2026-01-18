import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const inputVideo = path.join(process.cwd(), 'newscreenshots.mp4');
const outputGif = path.join(process.cwd(), 'public', 'dashboard-demo-4k.gif');

// Ensure output directory exists
const outputDir = path.dirname(outputGif);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎬 Converting video to 4K GIF with high-quality settings...');
console.log(`Input: ${inputVideo}`);
console.log(`Output: ${outputGif}`);

try {
  // Two-pass approach for highest quality:
  // Pass 1: Generate optimal palette
  // Pass 2: Apply palette with high-quality dithering
  
  const palettePath = path.join(process.cwd(), 'public', 'palette.png');
  
  console.log('📊 Pass 1: Generating optimal palette...');
  execSync(
    `ffmpeg -y -i "${inputVideo}" -vf "fps=20,scale=3840:-1:flags=lanczos+accurate_rnd+full_chroma_int,palettegen=max_colors=256:reserve_transparent=0:stats_mode=full" "${palettePath}"`,
    { stdio: 'inherit' }
  );
  
  console.log('🎨 Pass 2: Applying palette with high-quality dithering...');
  execSync(
    `ffmpeg -y -i "${inputVideo}" -i "${palettePath}" -lavfi "fps=20,scale=3840:-1:flags=lanczos+accurate_rnd+full_chroma_int[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 "${outputGif}"`,
    { stdio: 'inherit' }
  );
  
  // Clean up palette file
  if (fs.existsSync(palettePath)) {
    fs.unlinkSync(palettePath);
  }
  
  const fileSize = fs.statSync(outputGif).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Success! Created 4K GIF: ${outputGif}`);
  console.log(`📦 File size: ${fileSizeMB} MB`);
  
} catch (error) {
  console.error('❌ Error converting video:', error);
  process.exit(1);
}





