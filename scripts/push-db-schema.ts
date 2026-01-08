/**
 * Push database schema to Supabase
 * Loads .env.local and runs drizzle-kit push
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.SUPABASE_SALES_DATABASE_URL) {
  console.error('❌ SUPABASE_SALES_DATABASE_URL is not set in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📤 Pushing database schema...\n');

try {
  // Run drizzle-kit push:pg with environment variables
  execSync('npx drizzle-kit push:pg', {
    stdio: 'inherit',
    env: {
      ...process.env,
      SUPABASE_SALES_DATABASE_URL: process.env.SUPABASE_SALES_DATABASE_URL,
    },
  });
  console.log('\n✅ Database schema pushed successfully!');
} catch (error) {
  console.error('\n❌ Failed to push database schema');
  process.exit(1);
}

