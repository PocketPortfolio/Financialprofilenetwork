import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, conversations, auditLogs } from '@/db/sales/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/agent/leads/[id]
 * Get a single lead with full context (conversations, audit logs, reasoning)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leadId } = await params;
  try {
    // Fetch lead
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

    // Fetch conversations with AI reasoning
    const leadConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.leadId, leadId))
      .orderBy(desc(conversations.createdAt));

    // Fetch audit logs
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.leadId, leadId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

    return NextResponse.json({
      lead,
      conversations: leadConversations,
      auditLogs: logs,
      // Latest AI reasoning from most recent conversation
      latestReasoning: leadConversations[0]?.aiReasoning || null,
      researchSummary: lead.researchSummary,
      researchData: lead.researchData,
    });
  } catch (error: any) {
    console.error('Error fetching lead details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lead details' },
      { status: 500 }
    );
  }
}

