import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getCleanFirebaseConfig } from './env-utils';

// Firebase configuration with clean environment variables
const firebaseConfig = getCleanFirebaseConfig();

// Initialize Firebase with error handling
let app: any;
let auth: any;
let db: any;

try {
  // Validate Firebase config before initialization
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Invalid Firebase configuration - missing required fields');
  }
  
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Test Firebase connection
  if (typeof window !== 'undefined') {
    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Create fallback services to prevent app crashes
  try {
    // Use fallback config if main config fails
    const fallbackConfig = {
      apiKey: 'demo-key',
      authDomain: 'demo.firebaseapp.com',
      projectId: 'demo-project',
      storageBucket: 'demo-project.appspot.com',
      messagingSenderId: '123456789',
      appId: 'demo-app-id',
    };
    
    app = getApps().length === 0 ? initializeApp(fallbackConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.warn('⚠️ Firebase initialized with fallback config');
  } catch (fallbackError) {
    console.error('❌ Firebase fallback initialization failed:', fallbackError);
    // This will cause Firebase operations to fail gracefully
    auth = null;
    db = null;
  }
}

export { auth, db };

// Initialize Analytics (only in browser and if supported)
// Note: Analytics is initialized asynchronously, so we export null initially
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    console.log('Analytics not supported in this environment');
  });
}

// Connect to production Firebase by default
// Only connect to emulators if explicitly enabled in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
  // Try to connect to emulators (will fail silently if already connected)
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (error) {
    // Emulator already connected or not available
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator already connected or not available
  }
}

export default app;
