/**
 * Extract Firebase Admin credentials from JSON file and show .env.local format
 * 
 * Usage:
 *   ts-node --project scripts/tsconfig.json scripts/extract-firebase-env.ts path/to/serviceAccountKey.json
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const jsonPath = process.argv[2] || 'pocket-portfolio-67fa6-firebase-adminsdk-fbsvc-9784329544.json';

try {
  // Try to read from Downloads folder first, then current directory
  let jsonContent: string;
  let fullPath: string;
  
  try {
    // Try Downloads folder
    fullPath = resolve(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', jsonPath);
    jsonContent = readFileSync(fullPath, 'utf-8');
  } catch {
    // Try current directory
    fullPath = resolve(process.cwd(), jsonPath);
    jsonContent = readFileSync(fullPath, 'utf-8');
  }
  
  const serviceAccount = JSON.parse(jsonContent);
  
  console.log('✅ Successfully read Firebase service account JSON\n');
  console.log('='.repeat(60));
  console.log('\n📋 Add these lines to your .env.local file:\n');
  console.log('-'.repeat(60));
  console.log('\n# Firebase Admin SDK');
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  
  // Escape the private key for .env file (keep \n as literal \n)
  const escapedPrivateKey = serviceAccount.private_key.replace(/\n/g, '\\n');
  console.log(`FIREBASE_PRIVATE_KEY="${escapedPrivateKey}"`);
  console.log('\n' + '-'.repeat(60));
  console.log('\n✅ Copy the above 3 lines to your .env.local file');
  console.log('\n⚠️  Important: Keep the quotes around FIREBASE_PRIVATE_KEY!');
  console.log('\n📝 After adding, run: npm run verify-env\n');
  
} catch (error: any) {
  console.error('❌ Error:', error.message);
  console.log('\nUsage: ts-node scripts/extract-firebase-env.ts [path-to-json-file]');
  console.log('Or place the JSON file in Downloads folder with default name');
  process.exit(1);
}

