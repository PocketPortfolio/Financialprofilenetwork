/**
 * Script to inject Firebase configuration into firebase-messaging-sw.js
 * This runs during build to replace placeholders with actual environment variables
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'FIREBASE_API_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'FIREBASE_AUTH_DOMAIN',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'FIREBASE_PROJECT_ID',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'FIREBASE_MESSAGING_SENDER_ID',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'FIREBASE_APP_ID'
};

const swPath = path.join(process.cwd(), 'public', 'firebase-messaging-sw.js');

if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Replace placeholders with actual config values
  swContent = swContent.replace(/FIREBASE_API_KEY/g, firebaseConfig.apiKey);
  swContent = swContent.replace(/FIREBASE_AUTH_DOMAIN/g, firebaseConfig.authDomain);
  swContent = swContent.replace(/FIREBASE_PROJECT_ID/g, firebaseConfig.projectId);
  swContent = swContent.replace(/FIREBASE_STORAGE_BUCKET/g, firebaseConfig.storageBucket);
  swContent = swContent.replace(/FIREBASE_MESSAGING_SENDER_ID/g, firebaseConfig.messagingSenderId);
  swContent = swContent.replace(/FIREBASE_APP_ID/g, firebaseConfig.appId);
  
  fs.writeFileSync(swPath, swContent);
  console.log('✅ Firebase config injected into firebase-messaging-sw.js');
} else {
  console.warn('⚠️ firebase-messaging-sw.js not found, skipping injection');
}

