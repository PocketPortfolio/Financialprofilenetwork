/**
 * Debug script to see what environment variables are being loaded
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 Debugging Environment Variables\n');
console.log('='.repeat(60));

// Check which files exist
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  try {
    const envPath = resolve(process.cwd(), envFile);
    const stats = require('fs').statSync(envPath);
    console.log(`✅ ${envFile} exists (${stats.size} bytes)`);
  } catch {
    console.log(`❌ ${envFile} does not exist`);
  }
}

console.log('\n📋 Checking for required variables in files:\n');

for (const envFile of envFiles) {
  try {
    const envPath = resolve(process.cwd(), envFile);
    const content = readFileSync(envPath, 'utf-8');
    
    console.log(`\n📄 ${envFile}:`);
    console.log('-'.repeat(60));
    
    const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'STRIPE_SECRET_KEY'];
    
    for (const key of required) {
      if (content.includes(key)) {
        const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
        if (match) {
          const value = match[1].trim();
          const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
          console.log(`  ✅ ${key}: Found (${preview})`);
        } else {
          console.log(`  ⚠️  ${key}: Mentioned but no value found`);
        }
      } else {
        console.log(`  ❌ ${key}: Not found`);
      }
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.log(`  ⚠️  Error reading ${envFile}: ${error.message}`);
    }
  }
}

console.log('\n📋 Current process.env values:\n');
const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'STRIPE_SECRET_KEY'];
for (const key of required) {
  const value = process.env[key];
  if (value) {
    const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
    console.log(`  ✅ ${key}: ${preview}`);
  } else {
    console.log(`  ❌ ${key}: Not set`);
  }
}

console.log('\n');


