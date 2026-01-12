import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const inputGif = path.join(process.cwd(), 'public', 'dashboard-demo-4k.gif');
const outputMp4 = path.join(process.cwd(), 'public', 'dashboard-demo-4k.mp4');

// Check if original video exists (better quality source)
const originalVideo = path.join(process.cwd(), 'newscreenshots.mp4');
const inputSource = fs.existsSync(originalVideo) ? originalVideo : inputGif;

if (!fs.existsSync(inputSource)) {
  console.error(`❌ Error: Source file not found at ${inputSource}`);
  process.exit(1);
}

console.log('🎬 Converting to 4K looping MP4 (industry standard)...');
console.log(`Input: ${inputSource}`);
console.log(`Output: ${outputMp4}`);

try {
  // Convert to MP4 with H.264 codec, optimized for web
  // -preset slow: Better compression
  // -crf 18: High quality (lower = better, 18 is visually lossless)
  // -pix_fmt yuv420p: Maximum compatibility
  // -movflags +faststart: Enables streaming (starts playing while downloading)
  // -vf "fps=20": Match original GIF frame rate
  // -an: No audio (silent loop)
  
  execSync(
    `ffmpeg -y -i "${inputSource}" -vf "fps=20,scale=3840:-1:flags=lanczos" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an "${outputMp4}"`,
    { stdio: 'inherit' }
  );
  
  const fileSize = fs.statSync(outputMp4).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Success! Created 4K MP4: ${outputMp4}`);
  console.log(`📦 File size: ${fileSizeMB} MB`);
  console.log(`\n📝 Next: Upload to Cloudinary and update environment variable`);
  
} catch (error) {
  console.error('❌ Error converting:', error);
  process.exit(1);
}

