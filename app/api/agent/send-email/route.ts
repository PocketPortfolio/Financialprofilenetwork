import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, conversations, auditLogs } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { generateEmail, sendEmail } from '@/app/agent/outreach';
import { canContactLead } from '@/lib/sales/compliance';
import { isRealFirstName } from '@/lib/sales/name-validation';
// WAR MODE: kv import removed - no rate limiting (Directive 011)

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/agent/send-email
 * Send an AI-generated email to a lead
 */
export async function POST(request: NextRequest) {
  try {
    const { leadId, emailType = 'initial' } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId is required' },
        { status: 400 }
      );
    }

    // Check emergency stop
    const { isEmergencyStopActive } = await import('@/lib/sales/emergency-stop');
    if (await isEmergencyStopActive()) {
      return NextResponse.json(
        { error: 'Emergency stop activated. All outbound emails are paused.' },
        { status: 503 }
      );
    }

    // Check if lead can be contacted
    const contactCheck = await canContactLead(leadId, db);
    if (!contactCheck.canContact) {
      return NextResponse.json(
        { error: contactCheck.reason },
        { status: 403 }
      );
    }

    // WAR MODE: Rate limiting removed (Directive 011)
    // No quota checks - send immediately

    // Fetch lead data
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Generate email
    const { email, reasoning } = await generateEmail(
      leadId,
      {
        firstName: lead.firstName || undefined,
        firstNameReliable: lead.firstName ? isRealFirstName(lead.firstName) : false,
        companyName: lead.companyName,
        techStack: lead.techStackTags || [],
        researchSummary: lead.researchSummary || undefined,
      },
      emailType as 'initial' | 'follow_up' | 'objection_handling'
    );

    // Send email
    const { emailId, threadId } = await sendEmail(
      lead.email,
      email.subject,
      email.body,
      leadId
    );

    // WAR MODE: Rate limit tracking removed (Directive 011)

    // Save conversation
    await db.insert(conversations).values({
      leadId,
      type: emailType === 'initial' ? 'INITIAL_OUTREACH' : 'FOLLOW_UP',
      subject: email.subject,
      body: email.body,
      direction: 'outbound',
      aiModel: 'gpt-4o',
      aiReasoning: reasoning,
      emailId,
      threadId,
    });

    // Update lead
    await db.update(leads)
      .set({
        status: 'CONTACTED',
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));

    // Audit log
    await db.insert(auditLogs).values({
      leadId,
      action: 'EMAIL_SENT',
      aiReasoning: reasoning,
      metadata: {
        emailId,
        threadId,
        emailType,
        subject: email.subject,
      },
    });

    return NextResponse.json({
      success: true,
      emailId,
      threadId,
      subject: email.subject,
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}


