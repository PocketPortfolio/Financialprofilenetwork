import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export interface SeatAuth {
  uid: string;
  email: string;
}

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      throw error;
    }
  }
}

export function getDb() {
  initializeFirebaseAdmin();
  return getFirestore();
}

/**
 * Verify Bearer token and return uid + email. Returns null if missing/invalid.
 */
export async function verifySeatAuth(request: NextRequest): Promise<SeatAuth | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) return null;

  try {
    initializeFirebaseAdmin();
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const email = decoded.email;
    if (!email || !decoded.uid) return null;
    return { uid: decoded.uid, email };
  } catch {
    return null;
  }
}
