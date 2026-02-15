import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await getAuth().verifyIdToken(token);
    const tokenEmail = (decoded as { email?: string }).email?.toLowerCase?.();
    const adminAllowlist = (process.env.ADMIN_EMAIL_OVERRIDE ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const allowedByClaim = !!decoded.claims?.admin;
    const allowedByEmail = tokenEmail && adminAllowlist.includes(tokenEmail);
    if (!allowedByClaim && !allowedByEmail) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'ADMIN_CLAIM_REQUIRED', hint: 'You must sign out completely and sign back in (or open this page in an incognito window and sign in) so your token includes the admin claim. Admin was set via: npm run set-admin YOUR_EMAIL' },
        { status: 403 }
      );
    }

    const db = getDb();
    const snapshot = await db
      .collection('supportSubmissions')
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get();

    const submissions = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        email: d.email,
        name: d.name,
        subject: d.subject,
        message: d.message,
        attachmentCount: d.attachmentCount ?? 0,
        attachmentNames: d.attachmentNames ?? [],
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });

    return NextResponse.json({ submissions });
  } catch (err) {
    console.error('[Admin Support API] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
