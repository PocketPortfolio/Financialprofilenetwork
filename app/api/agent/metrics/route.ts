import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads, auditLogs, conversations } from '@/db/sales/schema';
import { desc, eq, gte, and, or } from 'drizzle-orm';
import { getRevenueMetrics } from '@/lib/sales/revenueCalculator';
import { getRevenueDrivenDecisions } from '@/lib/sales/revenue-driver';

// Next.js route configuration for dynamic routes in production
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/agent/metrics
 * Get comprehensive sales metrics including revenue calculations
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all leads
    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));

    // Calculate revenue metrics
    const revenueMetrics = getRevenueMetrics(allLeads.map(lead => ({
      id: lead.id,
      status: lead.status,
      score: lead.score || 0,
      dealTier: (lead.researchData as any)?.dealTier || null,
      researchData: lead.researchData as any,
    })));

    // Calculate emails sent today (including scheduled emails)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const emailsToday = await db
      .select()
      .from(auditLogs)
      .where(and(
        or(
          eq(auditLogs.action, 'EMAIL_SENT'),
          eq(auditLogs.action, 'EMAIL_SCHEDULED')
        ),
        gte(auditLogs.createdAt, today)
      ));

    // Calculate reply rate
    const totalOutbound = await db
      .select()
      .from(conversations)
      .where(eq(conversations.direction, 'outbound'));

    const totalInbound = await db
      .select()
      .from(conversations)
      .where(eq(conversations.direction, 'inbound'));

    const replyRate = totalOutbound.length > 0 
      ? (totalInbound.length / totalOutbound.length) * 100 
      : 0;

    // Status counts
    const statusCounts = {
      total: allLeads.length,
      new: allLeads.filter(l => l.status === 'NEW' as any).length,
      researching: allLeads.filter(l => l.status === 'RESEARCHING' as any).length,
      contacted: allLeads.filter(l => (l.status === 'CONTACTED' as any) || (l.status === 'REPLIED' as any)).length,
      interested: allLeads.filter(l => l.status === 'INTERESTED' as any).length,
      negotiating: allLeads.filter(l => l.status === 'NEGOTIATING' as any).length,
      converted: allLeads.filter(l => l.status === 'CONVERTED' as any).length,
      doNotContact: allLeads.filter(l => l.status === 'DO_NOT_CONTACT' as any).length,
    };

    // Calculate revenue velocity (projected monthly revenue)
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysElapsed = new Date().getDate();
    const revenueVelocity = daysElapsed > 0 
      ? (revenueMetrics.currentRevenue / daysElapsed) * daysInMonth
      : revenueMetrics.projectedRevenue;

    // Get revenue-driven decisions
    const revenueDecisions = getRevenueDrivenDecisions(allLeads.map(lead => ({
      id: lead.id,
      status: lead.status,
      score: lead.score || 0,
      dealTier: (lead.researchData as any)?.dealTier || null,
      researchData: lead.researchData as any,
    })));

    return NextResponse.json({
      revenue: revenueMetrics,
      revenueVelocity: Math.round(revenueVelocity),
      revenueDecisions: {
        requiredLeadVolume: revenueDecisions.requiredLeadVolume,
        currentLeadVolume: revenueDecisions.currentLeadVolume,
        adjustment: revenueDecisions.adjustment,
      },
      activity: {
        emailsSentToday: emailsToday.length,
        replyRate: Math.round(replyRate * 10) / 10,
        totalOutbound: totalOutbound.length,
        totalInbound: totalInbound.length,
      },
      statusCounts,
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

