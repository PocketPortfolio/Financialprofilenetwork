/**
 * Autonomous Conversation Handler
 * 
 * Handles inbound emails and generates autonomous replies
 */

import { db } from '@/db/sales/client';
import { conversations, leads, auditLogs } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { generateAutonomousReply } from '@/lib/sales/compliance-kb';
import { generateEmail, sendEmail } from './outreach';
import { canContactLead } from '@/lib/sales/compliance';
import { checkCompliance } from '@/lib/sales/compliance';

const MIN_CONFIDENCE_THRESHOLD = 0.85; // Only auto-reply if confidence >= 85%

/**
 * Handle inbound email and generate autonomous reply if appropriate
 */
export async function handleInboundEmail(
  leadId: string,
  inboundEmailContent: string,
  subject: string,
  emailId: string,
  threadId?: string
): Promise<{ replied: boolean; reason: string; confidence?: number }> {
  // Fetch lead context
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    return { replied: false, reason: 'Lead not found' };
  }

  // Check if lead can be contacted
  const contactCheck = await canContactLead(leadId, db);
  if (!contactCheck.canContact) {
    return { replied: false, reason: contactCheck.reason || 'Cannot contact lead' };
  }

  // Check emergency stop
  if (process.env.EMERGENCY_STOP === 'true') {
    return { replied: false, reason: 'Emergency stop activated' };
  }

  // Try to generate autonomous reply from knowledge base
  const kbReply = generateAutonomousReply(inboundEmailContent, {
    companyName: lead.companyName,
    firstName: lead.firstName || undefined,
    techStack: lead.techStackTags || [],
  });

  if (kbReply && kbReply.confidence >= MIN_CONFIDENCE_THRESHOLD) {
    // Check compliance
    const compliance = checkCompliance(kbReply.reply);
    if (!compliance.passed) {
      return {
        replied: false,
        reason: `Compliance check failed: ${compliance.violations.join(', ')}`,
      };
    }

    // Send autonomous reply
    try {
      const { emailId: replyEmailId } = await sendEmail(
        lead.email,
        `Re: ${subject}`,
        kbReply.reply,
        leadId
      );

      // Save conversation
      await db.insert(conversations).values({
        leadId,
        type: 'AUTONOMOUS_REPLY',
        subject: `Re: ${subject}`,
        body: kbReply.reply,
        direction: 'outbound',
        emailId: replyEmailId,
        threadId: threadId || replyEmailId,
        aiReasoning: `Autonomous reply generated from knowledge base (Source: ${kbReply.source}, Confidence: ${Math.round(kbReply.confidence * 100)}%)`,
      });

      // Update lead status if appropriate
      if (inboundEmailContent.toLowerCase().includes('interested') || 
          inboundEmailContent.toLowerCase().includes('demo')) {
        await db.update(leads)
          .set({ status: 'INTERESTED', updatedAt: new Date() })
          .where(eq(leads.id, leadId));
      }

      // Log action
      await db.insert(auditLogs).values({
        leadId,
        action: 'AUTONOMOUS_REPLY_SENT',
        aiReasoning: `Pilot handled ${kbReply.source} (Confidence: ${Math.round(kbReply.confidence * 100)}%)`,
        metadata: {
          source: kbReply.source,
          confidence: kbReply.confidence,
          emailId: replyEmailId,
        },
      });

      return {
        replied: true,
        reason: `Autonomous reply sent (${kbReply.source}, ${Math.round(kbReply.confidence * 100)}% confidence)`,
        confidence: kbReply.confidence,
      };
    } catch (error: any) {
      return {
        replied: false,
        reason: `Failed to send reply: ${error.message}`,
      };
    }
  }

  // If no KB match or low confidence, try AI-generated reply
  try {
    const { email, reasoning } = await generateEmail(
      leadId,
      {
        firstName: lead.firstName || undefined,
        companyName: lead.companyName,
        techStack: lead.techStackTags || [],
        researchSummary: lead.researchSummary || undefined,
      },
      'objection_handling'
    );

    // Check compliance
    const compliance = checkCompliance(email.body);
    if (!compliance.passed) {
      return {
        replied: false,
        reason: `Compliance check failed: ${compliance.violations.join(', ')}`,
      };
    }

    // Send AI-generated reply
    const { emailId: replyEmailId } = await sendEmail(
      lead.email,
      `Re: ${subject}`,
      email.body,
      leadId
    );

    // Save conversation
    await db.insert(conversations).values({
      leadId,
      type: 'AI_REPLY',
      subject: `Re: ${subject}`,
      body: email.body,
      direction: 'outbound',
      emailId: replyEmailId,
      threadId: threadId || replyEmailId,
      aiReasoning: reasoning,
    });

    // Log action
    await db.insert(auditLogs).values({
      leadId,
      action: 'AI_REPLY_SENT',
      aiReasoning: reasoning,
      metadata: {
        emailId: replyEmailId,
        subject: email.subject,
      },
    });

    return {
      replied: true,
      reason: 'AI-generated reply sent',
      confidence: 0.80, // Default confidence for AI-generated
    };
  } catch (error: any) {
    return {
      replied: false,
      reason: `Failed to generate/send AI reply: ${error.message}`,
    };
  }
}


