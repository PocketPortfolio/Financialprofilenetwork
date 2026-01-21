import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, auditLogs } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

    // Check for duplicates
    const existing = await db
      .select()
      .from(leads)
      .where(eq(leads.email, body.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'You are already on the priority queue!',
        leadId: existing[0].id,
        duplicate: true,
      });
    }

    // Parse name into firstName/lastName if provided
    const nameParts = body.firstName?.trim().split(/\s+/) || [];
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(' ') || null;

    // Insert new lead
    const [newLead] = await db.insert(leads).values({
      email: body.email.toLowerCase().trim(),
      firstName: firstName,
      lastName: lastName,
      companyName: body.companyName.trim(),
      jobTitle: null,
      location: null,
      dataSource: `waitlist_${body.source || 'unknown'}`,
      status: 'NEW',
      score: 0,
      researchData: {
        submittedVia: 'waitlist_page',
        submittedAt: new Date().toISOString(),
        source: body.source || 'unknown',
      },
    }).returning({ id: leads.id });

    // Log submission
    await db.insert(auditLogs).values({
      leadId: newLead.id,
      action: 'LEAD_SUBMITTED',
      aiReasoning: `Lead submitted via Waitlist Page from source: ${body.source || 'unknown'}`,
      metadata: {
        source: body.source || 'unknown',
        submittedAt: new Date().toISOString(),
      },
    });

    console.log(`✅ Waitlist lead submitted: ${body.email} at ${body.companyName}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the priority queue!',
      leadId: newLead.id,
    });
  } catch (error: any) {
    console.error('❌ Waitlist submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit lead' },
      { status: 500 }
    );
  }
}

