/**
 * Upload 4K Sovereign Sync Video to Cloudinary CDN
 * 
 * Usage:
 * 1. Ensure Cloudinary credentials are in .env.local
 * 2. Run: npx tsx scripts/upload-sync-video-to-cloudinary.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const videoPath = path.join(process.cwd(), 'public', 'sovereign-sync-4k.mp4');

// Parse credentials - support both CLOUDINARY_URL and separate variables
let cloudName: string | undefined;
let apiKey: string | undefined;
let apiSecret: string | undefined;

// Try to parse from CLOUDINARY_URL first
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

// Fallback to separate variables
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
      console.log('✅ Parsed credentials from CLOUDINARY_API_SECRET');
    }
  }
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Cloudinary credentials not found in environment variables');
  process.exit(1);
}

if (!fs.existsSync(videoPath)) {
  console.error(`❌ Error: File not found at ${videoPath}`);
  process.exit(1);
}

const fileSize = fs.statSync(videoPath).size;
const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

console.log(`🚀 Uploading 4K Sovereign Sync video to Cloudinary...`);
console.log(`📁 File: ${videoPath}`);
console.log(`📦 Size: ${fileSizeMB} MB\n`);

async function uploadVideo() {
  try {
    const uploadOptions: any = {
      resource_type: 'video',
      folder: 'pocket-portfolio',
      public_id: 'sovereign-sync-4k',
      overwrite: true,
    };

    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(videoPath, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    console.log('✅ Upload successful!');
    console.log(`\n🔗 CDN URL: ${result.secure_url}`);
    console.log(`📊 Format: ${result.format}`);
    console.log(`📏 Dimensions: ${result.width}x${result.height}`);
    console.log(`💾 Size: ${(result.bytes / (1024 * 1024)).toFixed(2)} MB`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Add this to your .env.local:');
    console.log(`   NEXT_PUBLIC_SYNC_DEMO_VIDEO_URL=${result.secure_url}`);
    console.log('\n2. Add to Vercel Environment Variables:');
    console.log('   - Go to Vercel Dashboard -> Project -> Settings -> Environment Variables');
    console.log(`   - Add: NEXT_PUBLIC_SYNC_DEMO_VIDEO_URL = ${result.secure_url}`);
    console.log('   - Apply to: Production, Preview, Development');
    console.log('\n3. The Google Drive sync page will automatically use this URL.');
    console.log('4. Commit and push the code changes.');
    
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    if (error.http_code) {
      console.error(`HTTP Code: ${error.http_code}`);
      if (error.http_code === 413) {
        console.error('\n⚠️  File too large for Cloudinary free tier (10MB limit).');
        console.error('💡 Options:');
        console.error('   1. Upgrade to Cloudinary paid plan');
        console.error('   2. Compress video further (reduces quality)');
      }
    }
    process.exit(1);
  }
}

uploadVideo();
