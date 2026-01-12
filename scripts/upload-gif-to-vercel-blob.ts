/**
 * Upload 4K Dashboard Demo GIF to Vercel Blob
 * 
 * Usage:
 * 1. Get your Vercel Blob Read-Write Token from:
 *    https://vercel.com/dashboard -> Your Project -> Storage -> Blob -> Settings
 * 
 * 2. Run: BLOB_READ_WRITE_TOKEN=your_token npm run upload-gif
 * 
 * Or set it in .env.local:
 * BLOB_READ_WRITE_TOKEN=your_token
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const gifPath = path.join(process.cwd(), 'public', 'dashboard-demo-4k.gif');
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

if (!blobToken) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is required');
  console.log('\n📋 To get your token:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Storage -> Blob -> Settings');
  console.log('4. Copy the Read-Write Token');
  console.log('\nThen run:');
  console.log('  BLOB_READ_WRITE_TOKEN=your_token npm run upload-gif');
  process.exit(1);
}

if (!fs.existsSync(gifPath)) {
  console.error(`❌ Error: File not found at ${gifPath}`);
  process.exit(1);
}

console.log('🚀 Uploading 4K GIF to Vercel Blob...');
console.log(`📁 File: ${gifPath}`);
console.log(`📦 Size: ${(fs.statSync(gifPath).size / (1024 * 1024)).toFixed(2)} MB\n`);

try {
  const output = execSync(
    `npx vercel blob put "${gifPath}" --rw-token "${blobToken}"`,
    { encoding: 'utf-8', stdio: 'pipe' }
  );
  
  // Vercel CLI outputs the URL, extract it
  const urlMatch = output.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const blobUrl = urlMatch[0];
    console.log('✅ Upload successful!');
    console.log(`\n🔗 Blob URL: ${blobUrl}`);
    console.log('\n📝 Next steps:');
    console.log('1. Add this to your .env.local:');
    console.log(`   NEXT_PUBLIC_DASHBOARD_DEMO_GIF_URL=${blobUrl}`);
    console.log('\n2. The landing page will automatically use this URL.');
    console.log('3. Commit and push the code changes.');
  } else {
    console.log('✅ Upload completed, but could not extract URL from output:');
    console.log(output);
  }
} catch (error: any) {
  console.error('❌ Upload failed:', error.message);
  if (error.stdout) console.log('Output:', error.stdout);
  if (error.stderr) console.error('Error:', error.stderr);
  process.exit(1);
}

