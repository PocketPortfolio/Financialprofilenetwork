import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolType, action, metadata } = body;

    if (!toolType) {
      return NextResponse.json(
        { error: 'toolType is required' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    await db.collection('toolUsage').add({
      toolType,
      action: action || 'view',
      metadata: metadata || {},
      timestamp: Timestamp.now(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tool usage tracking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track usage' },
      { status: 500 }
    );
  }
}


