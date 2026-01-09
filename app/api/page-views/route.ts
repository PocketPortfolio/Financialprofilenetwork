import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
    const { path, converted, sessionId, conversionType } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'path is required' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    
    // If this is a conversion, we need to find and update the original page view
    if (converted && sessionId) {
      // Find the original page view for this session and path
      // Look for the most recent non-converted view within the last 30 minutes
      const thirtyMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000));
      const pageViewsRef = db.collection('pageViews');
      
      try {
        // Query without orderBy first to avoid index requirements
        // We'll sort in memory if needed
        let snapshot = await pageViewsRef
          .where('path', '==', path)
          .where('sessionId', '==', sessionId)
          .where('converted', '==', false)
          .get();
        
        // Filter by timestamp in memory and get the most recent
        const validViews = snapshot.docs
          .filter(doc => {
            const docTimestamp = doc.data().timestamp as Timestamp;
            return docTimestamp && docTimestamp >= thirtyMinutesAgo;
          })
          .sort((a, b) => {
            const aTime = (a.data().timestamp as Timestamp)?.toMillis() || 0;
            const bTime = (b.data().timestamp as Timestamp)?.toMillis() || 0;
            return bTime - aTime; // Most recent first
          });
        
        if (validViews.length > 0) {
          // Update the original page view to mark it as converted
          const doc = validViews[0];
          await doc.ref.update({
            converted: true,
            convertedAt: Timestamp.now(),
            conversionType: conversionType || 'signup'
          });
          
          return NextResponse.json({ success: true, updated: true });
        }
      } catch (error: any) {
        // If query fails, log the error for debugging
        console.warn('Failed to find original page view for conversion:', error.message);
      }
      
      // If no original view found, don't create a duplicate conversion record
      // This prevents double-counting - we only want to mark existing views as converted
      return NextResponse.json({ 
        success: true, 
        updated: false,
        message: 'No original page view found to mark as converted'
      });
    }
    
    // Only create new page view records for actual page views (not conversions)
    if (!converted) {
      await db.collection('pageViews').add({
        path,
        converted: false,
        sessionId: sessionId || null,
        timestamp: Timestamp.now(),
        convertedAt: null,
        conversionType: null,
        userAgent: request.headers.get('user-agent') || 'unknown',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Page view tracking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track page view' },
      { status: 500 }
    );
  }
}

