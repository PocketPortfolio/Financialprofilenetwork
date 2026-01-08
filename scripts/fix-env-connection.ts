/**
 * Fix .env.local - Ensure only pooler connection string exists
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');

try {
  const content = readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');
  
  const newLines: string[] = [];
  let foundPooler = false;
  let foundAny = false;
  
  for (const line of lines) {
    if (line.trim().startsWith('SUPABASE_SALES_DATABASE_URL=')) {
      foundAny = true;
      if (line.includes('pooler.supabase.com')) {
        // This is the pooler connection - keep it and add SSL if needed
        if (!line.includes('sslmode=')) {
          const cleanLine = line.trim().replace(/\?.*$/, '').replace(/\s*$/, '');
          newLines.push(`${cleanLine}?sslmode=require`);
        } else {
          newLines.push(line);
        }
        foundPooler = true;
      } else {
        // Old direct connection - comment it out
        newLines.push(`# ${line.trim()}`);
      }
    } else {
      newLines.push(line);
    }
  }
  
  // If no pooler connection found, add it
  if (!foundPooler) {
    // Find where to insert it (after other SUPABASE vars)
    let insertIndex = newLines.findIndex(line => 
      line.includes('SUPABASE_SALES_URL') || 
      line.includes('SUPABASE_SALES_ANON_KEY')
    );
    
    if (insertIndex === -1) {
      insertIndex = newLines.length;
    } else {
      insertIndex += 1;
    }
    
    newLines.splice(insertIndex, 0, '');
    newLines.splice(insertIndex + 1, 0, '# Session Pooler (IPv4 compatible)');
    newLines.splice(insertIndex + 2, 0, 'SUPABASE_SALES_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require');
  }
  
  writeFileSync(envPath, newLines.join('\n'), 'utf-8');
  console.log('✅ .env.local updated successfully');
  console.log('   Using Session Pooler connection with SSL');
  
} catch (error: any) {
  console.error('❌ Error updating .env.local:', error.message);
  process.exit(1);
}


