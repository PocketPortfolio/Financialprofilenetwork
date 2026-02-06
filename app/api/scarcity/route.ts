import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const MAX_BATCH_SIZE = 500;
const BASE_GHOST = 482; // Start display near "almost full"
const GHOST_DAILY_CREEP = 4; // Middle of random(2, 5) per day
const BATCH_2_START_COUNT = 12; // When batch flips, show "12/500" for new opportunity
const LAUNCH_EPOCH_MS = new Date('2026-01-01').getTime(); // Epoch for ghost creep

function getDb() {
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
  return getFirestore();
}

function getGhostSales(): number {
  const daysSinceLaunch = Math.floor((Date.now() - LAUNCH_EPOCH_MS) / (24 * 60 * 60 * 1000));
  return BASE_GHOST + Math.max(0, daysSinceLaunch) * GHOST_DAILY_CREEP;
}

export async function GET() {
  try {
    let realSales = 0;
    try {
      const db = getDb();
      const snapshot = await db.collection('apiKeys').count().get();
      realSales = snapshot.data().count ?? 0;
    } catch (err) {
      console.error('[scarcity] Firestore count failed:', err);
    }

    const ghostSales = getGhostSales();
    let totalDisplay = realSales + ghostSales;

    if (totalDisplay >= MAX_BATCH_SIZE) {
      return NextResponse.json({
        count: BATCH_2_START_COUNT,
        batch: 2,
        label: 'Batch 2: Filling Fast',
        remaining: MAX_BATCH_SIZE - BATCH_2_START_COUNT,
        max: MAX_BATCH_SIZE,
        progress: BATCH_2_START_COUNT / MAX_BATCH_SIZE,
      });
    }

    const remaining = MAX_BATCH_SIZE - totalDisplay;
    return NextResponse.json({
      count: totalDisplay,
      batch: 1,
      label: 'Batch 1: Almost Full',
      remaining,
      max: MAX_BATCH_SIZE,
      progress: totalDisplay / MAX_BATCH_SIZE,
    });
  } catch (error) {
    console.error('[scarcity] Error:', error);
    return NextResponse.json(
      { count: 482, batch: 1, label: 'Batch 1: Almost Full', remaining: 18, max: 500, progress: 0.964 },
      { status: 200 }
    );
  }
}
