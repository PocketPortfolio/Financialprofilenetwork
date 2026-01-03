/**
 * Verify Environment Variables Setup for Admin Dashboard
 * 
 * Usage:
 *   npm run verify-env
 * 
 * Or directly:
 *   ts-node --project scripts/tsconfig.json scripts/verify-env-setup.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env or .env.local file manually
function loadEnvFile() {
  // Try .env.local first, then .env
  const envFiles = ['.env.local', '.env'];
  let loaded = false;
  
  for (const envFile of envFiles) {
    try {
      const envPath = resolve(process.cwd(), envFile);
      const envContent = readFileSync(envPath, 'utf-8');
      loaded = true;
      
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
      
      console.log(`✅ Loaded ${envFile} file\n`);
      // Continue to check if we have all required variables, otherwise try next file
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        continue; // Try next file
      } else {
        console.log(`⚠️  Error loading ${envFile}: ${error.message}\n`);
      }
    }
  }
  
  if (!loaded) {
    console.log('⚠️  No .env.local or .env file found. Checking process.env only.\n');
  }
}

// Load environment variables
loadEnvFile();

// Check required environment variables
const requiredVars = {
  // Firebase Admin SDK
  'FIREBASE_PROJECT_ID': 'Firebase Admin - Project ID',
  'FIREBASE_CLIENT_EMAIL': 'Firebase Admin - Service Account Email',
  'FIREBASE_PRIVATE_KEY': 'Firebase Admin - Private Key',
  
  // Stripe
  'STRIPE_SECRET_KEY': 'Stripe - Secret Key',
  
  // Optional but recommended
  'STRIPE_WEBHOOK_SECRET': 'Stripe - Webhook Secret (optional)',
};

// Check Firebase Client (NEXT_PUBLIC_)
const clientVars = {
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase Client - Project ID',
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase Client - API Key',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase Client - Auth Domain',
};

console.log('🔍 Verifying Environment Variables Setup\n');
console.log('=' .repeat(60));

let allGood = true;

// Check required server-side variables
console.log('\n📋 Required Server-Side Variables:');
console.log('-'.repeat(60));

for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  const isSet = !!value;
  const isOptional = varName === 'STRIPE_WEBHOOK_SECRET';
  
  if (isSet) {
    // Validate format
    let isValid = true;
    let validationMsg = '';
    
    if (varName === 'FIREBASE_PROJECT_ID') {
      isValid = value.length > 0;
      validationMsg = isValid ? '✅ Valid' : '❌ Empty';
    } else if (varName === 'FIREBASE_CLIENT_EMAIL') {
      isValid = value.includes('@') && value.includes('.iam.gserviceaccount.com');
      validationMsg = isValid ? '✅ Valid format' : '⚠️  Check format (should be service account email)';
    } else if (varName === 'FIREBASE_PRIVATE_KEY') {
      isValid = value.includes('BEGIN PRIVATE KEY') && value.includes('END PRIVATE KEY');
      validationMsg = isValid ? '✅ Valid format' : '⚠️  Check format (should include BEGIN/END PRIVATE KEY)';
      // Show masked value
      const masked = value.substring(0, 20) + '...' + value.substring(value.length - 20);
      console.log(`  ${varName.padEnd(30)} ${isSet ? '✅ Set' : '❌ Missing'} - ${description}`);
      console.log(`    ${validationMsg}`);
      console.log(`    Value: ${masked}`);
      continue;
    } else if (varName === 'STRIPE_SECRET_KEY') {
      isValid = value.startsWith('sk_live_') || value.startsWith('sk_test_');
      validationMsg = isValid ? '✅ Valid format' : '⚠️  Should start with sk_live_ or sk_test_';
    } else if (varName === 'STRIPE_WEBHOOK_SECRET') {
      isValid = value.startsWith('whsec_');
      validationMsg = isValid ? '✅ Valid format' : '⚠️  Should start with whsec_';
    }
    
    console.log(`  ${varName.padEnd(30)} ✅ Set - ${description}`);
    if (validationMsg) {
      console.log(`    ${validationMsg}`);
    }
    
    if (!isValid && !isOptional) {
      allGood = false;
    }
  } else {
    if (isOptional) {
      console.log(`  ${varName.padEnd(30)} ⚠️  Optional - ${description}`);
    } else {
      console.log(`  ${varName.padEnd(30)} ❌ Missing - ${description}`);
      allGood = false;
    }
  }
}

// Check client-side variables
console.log('\n📋 Client-Side Variables (NEXT_PUBLIC_):');
console.log('-'.repeat(60));

for (const [varName, description] of Object.entries(clientVars)) {
  const value = process.env[varName];
  const isSet = !!value;
  
  if (isSet) {
    console.log(`  ${varName.padEnd(35)} ✅ Set - ${description}`);
  } else {
    console.log(`  ${varName.padEnd(35)} ⚠️  Missing - ${description} (may be in .env.local)`);
  }
}

// Summary
console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('\n✅ All required environment variables are set!');
  console.log('\n📝 Next steps:');
  console.log('  1. Run: npm run set-admin your-email@example.com');
  console.log('  2. Sign out and sign in again');
  console.log('  3. Visit: /admin/analytics');
} else {
  console.log('\n❌ Some required variables are missing or invalid.');
  console.log('\n📝 How to fix:');
  console.log('  1. Download service account key from Firebase Console');
  console.log('  2. Extract values from the JSON file:');
  console.log('     - project_id → FIREBASE_PROJECT_ID');
  console.log('     - client_email → FIREBASE_CLIENT_EMAIL');
  console.log('     - private_key → FIREBASE_PRIVATE_KEY (keep quotes and \\n)');
  console.log('  3. Get Stripe key from Stripe Dashboard → API Keys');
  console.log('  4. Add all to .env.local file');
  console.log('\n📖 See: docs/ENV-SETUP-ADMIN-DASHBOARD.md for detailed instructions');
}

console.log('\n');

