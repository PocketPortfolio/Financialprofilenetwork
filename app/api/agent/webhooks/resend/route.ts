import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { conversations, leads, auditLogs } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/agent/webhooks/resend
 * Handle inbound email webhooks from Resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Verify webhook signature (add Resend webhook secret verification)
    // const signature = request.headers.get('resend-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    if (type === 'email.received') {
      // Handle inbound email
      const { from, to, subject, text, html, headers } = data;

      // Extract lead ID from email tags or thread
      const leadId = headers?.['x-lead-id'] || extractLeadIdFromThread(headers);

      if (!leadId) {
        console.warn('No lead ID found in inbound email');
        return NextResponse.json({ success: true, message: 'No lead ID found' });
      }

      // Classify the email
      const classification = classifyEmail(text || html || '');

      // Save conversation
      await db.insert(conversations).values({
        leadId,
        type: classification === 'HUMAN_ESCALATION' ? 'HUMAN_ESCALATION' : 'FOLLOW_UP',
        subject: subject || 'Re: Previous email',
        body: text || html || '',
        direction: 'inbound',
        classification,
        emailId: data.id,
        threadId: headers?.['in-reply-to'] || headers?.['references'],
      });

      // Update lead status
      if (classification === 'INTERESTED') {
        await db.update(leads)
          .set({ status: 'INTERESTED', updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      } else if (classification === 'NOT_INTERESTED' || classification === 'STOP') {
        await db.update(leads)
          .set({ 
            status: 'DO_NOT_CONTACT', 
            optOut: true,
            updatedAt: new Date() 
          })
          .where(eq(leads.id, leadId));
      }

      // Audit log
      await db.insert(auditLogs).values({
        leadId,
        action: 'EMAIL_RECEIVED',
        aiReasoning: `Inbound email classified as: ${classification}`,
        metadata: {
          from,
          to,
          subject,
          classification,
        },
      });

      // AUTONOMOUS: Generate reply if appropriate (not for STOP, NOT_INTERESTED, or HUMAN_ESCALATION)
      if (classification !== 'STOP' && 
          classification !== 'NOT_INTERESTED' && 
          classification !== 'HUMAN_ESCALATION') {
        // Trigger autonomous reply in background (don't await to avoid blocking webhook)
        const { handleInboundEmail } = await import('@/app/agent/conversation-handler');
        handleInboundEmail(
          leadId,
          text || html || '',
          subject || 'Previous email',
          data.id,
          headers?.['in-reply-to'] || headers?.['references']
        ).catch((error) => {
          console.error('Failed to generate autonomous reply:', error);
          // Log error but don't fail webhook
          db.insert(auditLogs).values({
            leadId,
            action: 'AUTONOMOUS_REPLY_FAILED',
            aiReasoning: `Failed to generate autonomous reply: ${error.message}`,
            metadata: { error: error.message },
          }).catch(() => {});
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

function extractLeadIdFromThread(headers: Record<string, string>): string | null {
  // Extract from thread ID or email tags
  const threadId = headers?.['in-reply-to'] || headers?.['references'];
  // TODO: Implement thread-to-lead mapping
  return null;
}

function classifyEmail(content: string): 'INTERESTED' | 'NOT_INTERESTED' | 'OOO' | 'HUMAN_ESCALATION' | 'STOP' {
  const lowerContent = content.toLowerCase();

  // Check for opt-out keywords
  if (lowerContent.includes('stop') || lowerContent.includes('unsubscribe') || lowerContent.includes('not interested')) {
    return 'STOP';
  }

  // Check for interest
  if (lowerContent.includes('interested') || lowerContent.includes('tell me more') || lowerContent.includes('demo')) {
    return 'INTERESTED';
  }

  // Check for OOO
  if (lowerContent.includes('out of office') || lowerContent.includes('ooo') || lowerContent.includes('away')) {
    return 'OOO';
  }

  // Check for human escalation
  if (lowerContent.includes('speak to') || lowerContent.includes('human') || lowerContent.includes('call me')) {
    return 'HUMAN_ESCALATION';
  }

  return 'NOT_INTERESTED';
}





