import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { auditLogs, leads } from '@/db/sales/schema';
import { desc, inArray } from 'drizzle-orm';

/**
 * GET /api/agent/audit-feed
 * Get recent audit logs for the action feed
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    // Fetch lead details for logs that have leadId
    const leadIds = logs.filter(log => log.leadId).map(log => log.leadId!);
    const leadsMap = new Map();
    
    if (leadIds.length > 0) {
      const fetchedLeads = await db
        .select({
          id: leads.id,
          email: leads.email,
          companyName: leads.companyName,
        })
        .from(leads)
        .where(inArray(leads.id, leadIds));
      
      fetchedLeads.forEach(lead => {
        leadsMap.set(lead.id, lead);
      });
    }

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        aiReasoning: log.aiReasoning,
        metadata: log.metadata,
        createdAt: log.createdAt,
        lead: log.leadId && leadsMap.has(log.leadId) ? {
          id: leadsMap.get(log.leadId)!.id,
          email: leadsMap.get(log.leadId)!.email,
          companyName: leadsMap.get(log.leadId)!.companyName,
        } : null,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching audit feed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch audit feed' },
      { status: 500 }
    );
  }
}

