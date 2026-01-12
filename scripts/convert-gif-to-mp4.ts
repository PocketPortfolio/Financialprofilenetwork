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
  // -profile:v high: Use High profile for better quality
  // -level 4.2: H.264 level for 4K support
  // -vf "scale=3840:-1:flags=lanczos+accurate_rnd+full_chroma_int": Better scaling with accurate rounding
  // -r 30: Preserve original frame rate (30fps) instead of converting to 20fps
  // -g 30: Keyframe interval matching frame rate for smooth playback
  // -an: No audio (silent loop)
  
  execSync(
    `ffmpeg -y -i "${inputSource}" -vf "scale=3840:-1:flags=lanczos+accurate_rnd+full_chroma_int" -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.2 -pix_fmt yuv420p -r 30 -g 30 -movflags +faststart -an "${outputMp4}"`,
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

