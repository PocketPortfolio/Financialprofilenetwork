/**
 * One-time script to set admin custom claim for a user
 * 
 * Usage:
 *   npm run set-admin YOUR_EMAIL
 * 
 * Or directly:
 *   ts-node scripts/set-admin-claim.ts YOUR_EMAIL
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env or .env.local file manually
function loadEnvFile() {
  // Try .env.local first, then .env
  const envFiles = ['.env.local', '.env'];
  
  for (const envFile of envFiles) {
    try {
      const envPath = resolve(process.cwd(), envFile);
      const envContent = readFileSync(envPath, 'utf-8');
      
      // Simple parser - handle key=value pairs (including multi-line values)
      const lines = envContent.split('\n');
      let currentKey: string | null = null;
      let currentValue: string[] = [];
      let inQuotedValue = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Skip comments and empty lines (unless we're in a multi-line value)
        if (!currentKey && (!trimmed || trimmed.startsWith('#'))) {
          continue;
        }
        
        // If we're building a multi-line value
        if (currentKey) {
          // Check if this line ends the quoted value
          if (inQuotedValue && trimmed.endsWith('"')) {
            currentValue.push(line.slice(0, -1)); // Remove trailing quote
            const finalValue = currentValue.join('\n');
            // Remove leading quote if present
            const cleanValue = finalValue.startsWith('"') ? finalValue.slice(1) : finalValue;
            process.env[currentKey] = cleanValue.replace(/\\n/g, '\n');
            currentKey = null;
            currentValue = [];
            inQuotedValue = false;
          } else {
            currentValue.push(line);
          }
          continue;
        }
        
        // Look for key=value on a single line
        const equalIndex = trimmed.indexOf('=');
        if (equalIndex <= 0) continue;
        
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1);
        
        // Check if value starts with quote (multi-line)
        if (value.trim().startsWith('"') && !value.trim().endsWith('"')) {
          // Multi-line quoted value
          currentKey = key;
          inQuotedValue = true;
          currentValue = [value.trim().slice(1)]; // Remove leading quote
        } else {
          // Single line value
          value = value.trim();
          
          // Remove surrounding quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          // Convert \n escape sequences to actual newlines for FIREBASE_PRIVATE_KEY
          if (key === 'FIREBASE_PRIVATE_KEY') {
            value = value.replace(/\\n/g, '\n');
          }
          
          // Only set if not already in process.env
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      
      // Handle any remaining multi-line value
      if (currentKey && currentValue.length > 0) {
        const finalValue = currentValue.join('\n');
        const cleanValue = finalValue.startsWith('"') ? finalValue.slice(1) : finalValue;
        process.env[currentKey] = cleanValue.replace(/\\n/g, '\n');
      }
      
      // Check if we got the required variables, if so we're done
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        break;
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        continue; // Try next file
      }
      // Silently fail for other errors
    }
  }
}

// Load environment variables
loadEnvFile();

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email is required');
  console.log('Usage: npx tsx scripts/set-admin-claim.ts YOUR_EMAIL');
  process.exit(1);
}

// Check for required environment variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Error: Missing Firebase Admin credentials in .env.local');
  console.log('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

// Initialize Firebase Admin
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

async function setAdminClaim() {
  try {
    const auth = getAuth();
    
    // Find user by email
    const user = await auth.getUserByEmail(email);
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Set admin custom claim
    await auth.setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`✅ Admin claim set successfully for ${email}`);
    console.log(`   User UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log('\n⚠️  Important: User must sign out and sign in again for the claim to take effect.');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error setting admin claim:', error.message);
    process.exit(1);
  }
}

setAdminClaim();

