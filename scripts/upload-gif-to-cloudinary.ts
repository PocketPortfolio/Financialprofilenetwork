/**
 * Upload 4K Dashboard Demo GIF to Cloudinary CDN
 * 
 * Usage:
 * 1. Sign up at https://cloudinary.com (free tier available)
 * 2. Get your credentials from Dashboard -> Settings -> Product Environment Credentials
 * 3. Add to .env.local:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 * 
 * 4. Run: npm run upload-gif-cloudinary
 */

import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Support both GIF and MP4 uploads
const gifPath = path.join(process.cwd(), 'public', 'dashboard-demo-4k.gif');
const mp4Path = path.join(process.cwd(), 'public', 'dashboard-demo-4k.mp4');
const filePath = fs.existsSync(mp4Path) ? mp4Path : gifPath;
const fileType = filePath.endsWith('.mp4') ? 'video' : 'image';
const fileName = filePath.endsWith('.mp4') ? 'dashboard-demo-4k.mp4' : 'dashboard-demo-4k.gif';

// Parse credentials - support both CLOUDINARY_URL and separate variables
let cloudName: string | undefined;
let apiKey: string | undefined;
let apiSecret: string | undefined;

// Try to parse from CLOUDINARY_URL first (check all variations)
const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_SECRET?.match(/cloudinary:\/\/[^=]+/)?.[0];
if (cloudinaryUrl) {
  // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    apiKey = urlMatch[1];
    apiSecret = urlMatch[2];
    cloudName = urlMatch[3];
    console.log('✅ Parsed credentials from CLOUDINARY_URL');
  }
}

// Fallback to separate variables if URL parsing failed
if (!cloudName || !apiKey || !apiSecret) {
  cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = process.env.CLOUDINARY_API_KEY;
  apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  // Clean up apiSecret if it contains CLOUDINARY_URL= prefix
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
  console.log('\n📋 To set up Cloudinary:');
  console.log('1. Sign up at https://cloudinary.com (free tier available)');
  console.log('2. Go to Dashboard -> Settings -> Product Environment Credentials');
  console.log('3. Copy Cloud Name, API Key, and API Secret');
  console.log('4. Add to .env.local (either format):');
  console.log('   Option A - Separate variables:');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  console.log('   Option B - Single URL:');
  console.log('   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name');
  console.log('\nThen run: npm run upload-gif-cloudinary');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ Error: File not found at ${filePath}`);
  process.exit(1);
}

const fileSize = fs.statSync(filePath).size;
const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

console.log(`🚀 Uploading 4K ${fileType.toUpperCase()} to Cloudinary...`);
console.log(`📁 File: ${filePath}`);
console.log(`📦 Size: ${fileSizeMB} MB\n`);

async function uploadGif() {
  try {
    // Use standard upload for MP4 (under 20MB) or upload_large for GIF (if > 10MB)
    const uploadOptions: any = {
      resource_type: fileType,
      folder: 'pocket-portfolio',
      public_id: fileType === 'video' ? 'dashboard-demo-4k' : 'dashboard-demo-4k',
      overwrite: true,
    };

    // Add chunk_size for large image files (GIF > 10MB)
    if (fileType === 'image' && fileSize > 10 * 1024 * 1024) {
      uploadOptions.chunk_size = 6000000; // 6MB chunks
    }

    // Keep original quality for 4K images only (not for video)
    if (fileType === 'image') {
      uploadOptions.flags = 'keep_iptc';
    }

    const result: any = await new Promise((resolve, reject) => {
      if (fileType === 'image' && fileSize > 10 * 1024 * 1024) {
        // Use upload_large for large images
        cloudinary.uploader.upload_large(filePath, uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      } else {
        // Use standard upload for videos or small images
        cloudinary.uploader.upload(filePath, uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      }
    });

    console.log('✅ Upload successful!');
    console.log(`\n🔗 CDN URL: ${result.secure_url}`);
    console.log(`📊 Format: ${result.format}`);
    console.log(`📏 Dimensions: ${result.width}x${result.height}`);
    console.log(`💾 Size: ${(result.bytes / (1024 * 1024)).toFixed(2)} MB`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Add this to your .env.local:');
    if (fileType === 'video') {
      console.log(`   NEXT_PUBLIC_DASHBOARD_DEMO_VIDEO_URL=${result.secure_url}`);
    } else {
      console.log(`   NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL=${result.secure_url}`);
    }
    console.log('\n2. Add to Vercel Environment Variables:');
    console.log('   - Go to Vercel Dashboard -> Project -> Settings -> Environment Variables');
    if (fileType === 'video') {
      console.log(`   - Add: NEXT_PUBLIC_DASHBOARD_DEMO_VIDEO_URL = ${result.secure_url}`);
    } else {
      console.log(`   - Add: NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL = ${result.secure_url}`);
    }
    console.log('   - Apply to: Production, Preview, Development');
    console.log('\n3. The landing page will automatically use this URL.');
    console.log('4. Commit and push the code changes.');
    
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    if (error.http_code) {
      console.error(`HTTP Code: ${error.http_code}`);
      if (error.http_code === 413) {
        console.error('\n⚠️  File too large for Cloudinary free tier (10MB limit).');
        console.error('💡 Options:');
        console.error('   1. Upgrade to Cloudinary paid plan');
        console.error('   2. Use AWS S3 + CloudFront');
        console.error('   3. Use Backblaze B2 + Cloudflare');
        console.error('   4. Compress GIF (reduces quality)');
      }
    }
    process.exit(1);
  }
}

uploadGif();

