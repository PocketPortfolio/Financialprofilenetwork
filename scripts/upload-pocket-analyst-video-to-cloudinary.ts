/**
 * Upload Pocket Analyst demo video to Cloudinary (same flow as dashboard demo).
 *
 * Usage:
 * 1. Put your video in the project: public/pocketanalyst.mp4 (or .MP4)
 * 2. Cloudinary credentials already in .env.local (same as dashboard video)
 * 3. Run: npm run upload-pocket-analyst-cloudinary
 * 4. Copy the printed URL into .env.local and Vercel as NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL
 */

import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const candidates = [
  path.join(process.cwd(), 'public', 'pocketanalyst.mp4'),
  path.join(process.cwd(), 'public', 'pocketanalyst.MP4'),
  path.join(process.cwd(), 'public', 'pocket-analyst-demo.mp4'),
];
const filePath = candidates.find((p) => fs.existsSync(p));
if (!filePath) {
  console.error('❌ No video file found. Place your file at one of:');
  candidates.forEach((p) => console.error(`   ${p}`));
  process.exit(1);
}
const pathToUpload: string = filePath;

let cloudName: string | undefined;
let apiKey: string | undefined;
let apiSecret: string | undefined;

const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_SECRET?.match(/cloudinary:\/\/[^=]+/)?.[0];
if (cloudinaryUrl) {
  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    apiKey = urlMatch[1];
    apiSecret = urlMatch[2];
    cloudName = urlMatch[3];
    console.log('✅ Parsed credentials from CLOUDINARY_URL');
  }
}

if (!cloudName || !apiKey || !apiSecret) {
  cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = process.env.CLOUDINARY_API_KEY;
  apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (apiSecret && apiSecret.includes('cloudinary://')) {
    const urlMatch = apiSecret.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (urlMatch) {
      apiKey = urlMatch[1];
      apiSecret = urlMatch[2];
      cloudName = urlMatch[3];
    }
  }
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary credentials not in .env.local (same as for dashboard video upload).');
  process.exit(1);
}

const fileSize = fs.statSync(filePath).size;
const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

console.log('🚀 Uploading Pocket Analyst demo video to Cloudinary...');
console.log(`📁 File: ${filePath}`);
console.log(`📦 Size: ${fileSizeMB} MB\n`);

async function upload() {
  try {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(pathToUpload, {
        resource_type: 'video',
        folder: 'pocket-portfolio',
        public_id: 'pocket-analyst-demo',
        overwrite: true,
      }, (err, res) => (err ? reject(err) : resolve(res)));
    });

    console.log('✅ Upload successful!');
    console.log(`\n🔗 CDN URL: ${result.secure_url}`);
    console.log('\n📝 Add this URL to .env.local and Vercel:\n');
    console.log(`NEXT_PUBLIC_POCKET_ANALYST_VIDEO_URL=${result.secure_url}`);
    console.log('\nThen restart dev server (or redeploy on Vercel).');
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    if (error.http_code === 413) {
      console.error('\n⚠️  File too large for Cloudinary free tier. Compress or use a shorter clip.');
    }
    process.exit(1);
  }
}

upload();
