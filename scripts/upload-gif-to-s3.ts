/**
 * Upload 4K Dashboard Demo GIF to AWS S3
 * 
 * Usage:
 * 1. Set up AWS credentials (via AWS CLI or environment variables)
 * 2. Create an S3 bucket (or use existing)
 * 3. Add to .env.local:
 *    AWS_REGION=us-east-1
 *    AWS_S3_BUCKET=your-bucket-name
 *    AWS_ACCESS_KEY_ID=your_access_key
 *    AWS_SECRET_ACCESS_KEY=your_secret_key
 * 
 * 4. Run: npm run upload-gif-s3
 */

import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const gifPath = path.join(process.cwd(), 'public', 'dashboard-demo-4k.gif');

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.AWS_S3_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!bucket || !accessKeyId || !secretAccessKey) {
  console.error('❌ Error: AWS credentials not found in environment variables');
  console.log('\n📋 To set up AWS S3:');
  console.log('1. Create an AWS account (free tier available)');
  console.log('2. Create an S3 bucket');
  console.log('3. Create IAM user with S3 upload permissions');
  console.log('4. Get Access Key ID and Secret Access Key');
  console.log('5. Add to .env.local:');
  console.log('   AWS_REGION=us-east-1');
  console.log('   AWS_S3_BUCKET=your-bucket-name');
  console.log('   AWS_ACCESS_KEY_ID=your_access_key');
  console.log('   AWS_SECRET_ACCESS_KEY=your_secret_key');
  console.log('\nThen run: npm run upload-gif-s3');
  process.exit(1);
}

if (!fs.existsSync(gifPath)) {
  console.error(`❌ Error: File not found at ${gifPath}`);
  process.exit(1);
}

const fileSize = fs.statSync(gifPath).size;
const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

console.log('🚀 Uploading 4K GIF to AWS S3...');
console.log(`📁 File: ${gifPath}`);
console.log(`📦 Size: ${fileSizeMB} MB`);
console.log(`🌍 Region: ${region}`);
console.log(`🪣 Bucket: ${bucket}\n`);

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

async function uploadGif() {
  try {
    const fileStream = fs.createReadStream(gifPath);
    const key = 'dashboard-demo-4k.gif';
    
    // Use multipart upload for large files
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: 'image/gif',
        CacheControl: 'public, max-age=31536000', // 1 year cache
      },
      // Use multipart upload for files > 5MB
      partSize: 10 * 1024 * 1024, // 10MB parts
    });

    const result = await upload.done();
    
    // Construct public URL (if bucket is public) or CloudFront URL
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    
    console.log('✅ Upload successful!');
    console.log(`\n🔗 S3 URL: ${publicUrl}`);
    console.log(`📦 ETag: ${result.ETag}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your S3 bucket is public or set up CloudFront distribution');
    console.log('2. If using CloudFront, use the CloudFront URL instead');
    console.log('3. Add to .env.local:');
    console.log(`   NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL=${publicUrl}`);
    console.log('\n4. Add to Vercel Environment Variables:');
    console.log('   - Go to Vercel Dashboard -> Project -> Settings -> Environment Variables');
    console.log(`   - Add: NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL = ${publicUrl}`);
    console.log('   - Apply to: Production, Preview, Development');
    console.log('\n5. The landing page will automatically use this URL.');
    console.log('6. Commit and push the code changes.');
    
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    if (error.$metadata) {
      console.error(`HTTP Code: ${error.$metadata.httpStatusCode}`);
    }
    process.exit(1);
  }
}

uploadGif();

