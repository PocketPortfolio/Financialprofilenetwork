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
      console.error('[waitlist/submit] Firebase init error:', e);
    }
  }
  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, companyName' },
        { status: 400 }
      );
    }

    // Validate email format
    if (isPlaceholderEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email: placeholder emails not allowed' },
        { status: 400 }
      );
    }

    // Validate email with MX check
    const validation = await validateEmail(body.email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: `Invalid email: ${validation.reason}` },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();
    const source = typeof body.source === 'string' ? body.source.trim().slice(0, 120) : 'unknown';
    const firstNameRaw = typeof body.firstName === 'string' ? body.firstName.trim().slice(0, 100) : '';
    const companyName = String(body.companyName).trim().slice(0, 140);

    // Always record to /admin/analytics sink (Firestore), even if sales DB is unreachable.
    try {
      const adb = getAdminDb();
      await adb.collection('waitlistLeads').add({
        email,
        first_name: firstNameRaw || null,
        company_name: companyName,
        source,
        timestamp: Timestamp.now(),
      });
    } catch (fireErr) {
      console.error('[waitlist/submit] Firestore record failed:', fireErr);
    }

    // Best-effort: also write to sales DB (used by /admin/sales). Do not block UX on DB failures.
    try {
      const existing = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
      if (existing.length > 0) {
        return NextResponse.json({
          success: true,
          message: 'You are already on the priority queue!',
          leadId: existing[0].id,
          duplicate: true,
        });
      }

      const nameParts = firstNameRaw ? firstNameRaw.split(/\s+/) : [];
      const firstName = nameParts[0] || null;
      const lastName = nameParts.slice(1).join(' ') || null;

      const [newLead] = await db
        .insert(leads)
        .values({
          email,
          firstName,
          lastName,
          companyName,
          jobTitle: null,
          location: null,
          dataSource: `waitlist_${source}`,
          status: 'NEW',
          score: 0,
          researchData: {
            submittedVia: 'waitlist_page',
            submittedAt: new Date().toISOString(),
            source,
          },
        })
        .returning({ id: leads.id });

      await db.insert(auditLogs).values({
        leadId: newLead.id,
        action: 'LEAD_SUBMITTED',
        aiReasoning: `Lead submitted via Waitlist Page from source: ${source}`,
        metadata: {
          source,
          submittedAt: new Date().toISOString(),
        },
      });

      console.log(`✅ Waitlist lead submitted: ${email} at ${companyName}`);

      return NextResponse.json({
        success: true,
        message: 'Successfully joined the priority queue!',
        leadId: newLead.id,
      });
    } catch (dbErr) {
      console.error('❌ Waitlist sales DB error (non-blocking):', dbErr);
      return NextResponse.json(
        {
          success: true,
          message: 'Successfully joined the priority queue!',
          queued: true,
        },
        { status: 202 }
      );
    }
  } catch (error: any) {
    console.error('❌ Waitlist submission error:', error);
    // Never leak internal errors to the client.
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}

