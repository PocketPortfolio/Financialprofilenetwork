import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, conversations, auditLogs } from '@/db/sales/schema';
import { eq, desc } from 'drizzle-orm';

// Next.js route configuration for dynamic routes in production
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0; // Force no caching - ensure fresh data
export const fetchCache = 'force-no-store'; // Force no fetch caching - workaround for Next.js 15 routing bug

/**
 * GET /api/agent/leads/[id]
 * Get a single lead with full context (conversations, audit logs, reasoning)
 * 
 * Note: Using catch-all route [...id] instead of [id] to work around Next.js 15 routing bug
 * where single-segment dynamic routes return 404 in production.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> } // Changed: id is now string[] for catch-all route
) {
  // Add logging to verify route is being called
  console.log('[LEAD-DETAILS] Route handler invoked');
  
  const resolvedParams = await params;
  // Extract id from array (first element) - catch-all route workaround for Next.js 15
  const leadId = resolvedParams.id?.[0];
  
  if (!leadId) {
    console.log('[LEAD-DETAILS] No lead ID provided');
    return NextResponse.json(
      { error: 'Lead ID is required' },
      { status: 400 }
    );
  }
  
  console.log(`[LEAD-DETAILS] Extracted leadId: ${leadId}`);
  
  try {
    // Fetch lead
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (!lead) {
      console.log(`[LEAD-DETAILS] Lead not found: ${leadId}`);
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    console.log(`[LEAD-DETAILS] Lead found: ${lead.companyName}`);

    // Fetch conversations with AI reasoning (handle empty/null gracefully)
    let leadConversations: any[] = [];
    try {
      leadConversations = await db
        .select()
        .from(conversations)
        .where(eq(conversations.leadId, leadId))
        .orderBy(desc(conversations.createdAt));
    } catch (err: any) {
      console.warn(`[LEAD-DETAILS] Non-critical error fetching conversations for ${leadId}:`, err.message);
      // Continue with empty array - not a fatal error
    }

    // Fetch audit logs (handle empty/null gracefully)
    let logs: any[] = [];
    try {
      logs = await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.leadId, leadId))
        .orderBy(desc(auditLogs.createdAt))
        .limit(50);
    } catch (err: any) {
      console.warn(`[LEAD-DETAILS] Non-critical error fetching audit logs for ${leadId}:`, err.message);
      // Continue with empty array - not a fatal error
    }

    console.log(`[LEAD-DETAILS] Returning data for ${leadId}`);
    return NextResponse.json({
      lead,
      conversations: leadConversations || [],
      auditLogs: logs || [],
      // Latest AI reasoning from most recent conversation
      latestReasoning: leadConversations?.[0]?.aiReasoning || null,
      researchSummary: lead.researchSummary || null,
      researchData: lead.researchData || null,
    });
  } catch (error: any) {
    console.error('[LEAD-DETAILS] Critical error fetching lead details:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch lead details',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

