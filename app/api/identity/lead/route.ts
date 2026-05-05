import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function getAdminDb() {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } catch (e) {
      console.error('[identity/lead] Firebase init error:', e);
    }
  }
  return getFirestore();
}

// Ultra-light client-scope throttle (per instance); avoids accidental loops.
let lastAcceptedAt = 0;

export async function POST(request: NextRequest) {
  try {
    const now = Date.now();
    if (now - lastAcceptedAt < 750) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    lastAcceptedAt = now;

    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const action = typeof body.action === 'string' ? body.action.trim().slice(0, 50) : 'unknown';
    const contextId = typeof body.context_id === 'string' ? body.context_id.trim().slice(0, 80) : null;
    const pagePath = typeof body.page_path === 'string' ? body.page_path.trim().slice(0, 200) : null;
    const firstTouch = body.first_touch && typeof body.first_touch === 'object' ? body.first_touch : null;

    if (!rawEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (isPlaceholderEmail(rawEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const validation = await validateEmail(rawEmail);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.reason ? `Invalid email: ${validation.reason}` : 'Invalid email' },
        { status: 400 }
      );
    }

    // Always try to record to /admin/analytics sink (Firestore), even if sales DB is unreachable.
    try {
      const adb = getAdminDb();
      await adb.collection('identityGateLeads').add({
        email: rawEmail,
        action,
        context_id: contextId,
        page_path: pagePath,
        first_touch: firstTouch,
        timestamp: Timestamp.now(),
      });
    } catch (fireErr) {
      console.error('[identity/lead] Firestore record failed:', fireErr);
    }

    try {
      // Idempotent: if lead exists, just audit and return ok.
      const existing = await db.select().from(leads).where(eq(leads.email, rawEmail)).limit(1);
      if (existing.length) {
        await db.insert(auditLogs).values({
          leadId: existing[0]!.id,
          action: 'LEAD_SUBMITTED',
          aiReasoning: `Identity gate triggered (${action})`,
          metadata: {
            kind: 'identity_gate',
            action,
            contextId,
            pagePath,
            firstTouch,
            ts: new Date().toISOString(),
          },
        });
        return NextResponse.json({ ok: true, deduped: true });
      }

      const [created] = await db
        .insert(leads)
        .values({
          email: rawEmail,
          companyName: 'Individual',
          jobTitle: 'User',
          dataSource: `identity_gate:${action}`,
          dataSourceDate: new Date(),
          status: 'NEW',
          score: 0,
          researchData: {
            kind: 'identity_gate',
            action,
            contextId,
            pagePath,
            firstTouch,
            ts: new Date().toISOString(),
          },
        })
        .returning({ id: leads.id });

      await db.insert(auditLogs).values({
        leadId: created!.id,
        action: 'LEAD_SUBMITTED',
        aiReasoning: `Identity gate captured (${action})`,
        metadata: {
          kind: 'identity_gate',
          action,
          contextId,
          pagePath,
          firstTouch,
          ts: new Date().toISOString(),
        },
      });

      return NextResponse.json({ ok: true });
    } catch (dbErr) {
      // Dev/prod hardening: don't block the user flow if sales DB is temporarily unreachable.
      console.error('[identity/lead] DB unreachable, accepting for later:', dbErr);
      return NextResponse.json({ ok: true, queued: true }, { status: 202 });
    }
  } catch (e) {
    console.error('[identity/lead]', e);
    return NextResponse.json({ error: 'Failed to capture lead' }, { status: 500 });
  }
}

