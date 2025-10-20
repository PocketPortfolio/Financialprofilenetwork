/**
 * Environment variable utilities to ensure clean values
 * Handles potential newline/whitespace issues from deployment platforms
 */

export function getCleanEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    console.error(`Environment variable ${key} is required but not set or empty`);
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  // Remove any trailing whitespace, newlines, or carriage returns
  const cleaned = value.trim().replace(/[\r\n]+$/, '');
  
  if (cleaned === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    console.error(`Environment variable ${key} is empty after cleaning`);
    throw new Error(`Environment variable ${key} is empty after cleaning`);
  }
  
  return cleaned;
}

export function getCleanFirebaseConfig() {
  // Log environment variable status for debugging
  const envVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  // Check if any required vars are missing
  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => !value || value.trim() === '')
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missingVars);
    console.error('❌ Falling back to demo config - Firebase features will not work!');
    console.error('❌ Please set the following environment variables in Vercel:', missingVars.join(', '));
    
    // Return a minimal config to prevent app crashes but make it obvious it's broken
    return {
      apiKey: 'demo-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'demo-app-id',
    };
  }
  
  try {
    // Clean all environment variables
    const config = {
      apiKey: envVars.apiKey!.trim().replace(/[\r\n]+/g, ''),
      authDomain: envVars.authDomain!.trim().replace(/[\r\n]+/g, ''),
      projectId: envVars.projectId!.trim().replace(/[\r\n]+/g, ''),
      storageBucket: envVars.storageBucket!.trim().replace(/[\r\n]+/g, ''),
      messagingSenderId: envVars.messagingSenderId!.trim().replace(/[\r\n]+/g, ''),
      appId: envVars.appId!.trim().replace(/[\r\n]+/g, ''),
    };
    
    // Validate the cleaned config
    if (config.apiKey === 'demo-key' || config.projectId === 'demo-project') {
      throw new Error('Invalid Firebase config detected after cleaning');
    }
    
    console.log('✅ Firebase config loaded successfully');
    return config;
  } catch (error) {
    console.error('❌ Failed to get Firebase config:', error);
    console.error('❌ Falling back to demo config - Firebase features will not work!');
    
    // Return a minimal config to prevent app crashes
    return {
      apiKey: 'demo-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'demo-app-id',
    };
  }
}

export function getCleanGAId(): string | undefined {
  const value = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return value ? value.trim().replace(/[\r\n]+$/, '') : undefined;
}
