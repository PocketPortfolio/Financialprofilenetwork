import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { recalculateLeadScore } from '@/app/agent/researcher';

// Next.js route configuration
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';

/**
 * POST /api/agent/leads/[id]/recalculate-score
 * Recalculate confidence score for an existing lead
 * 
 * Note: Using catch-all route [...id] instead of [id] to work around Next.js 15 routing bug
 * where single-segment dynamic routes return 404 in production.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string[] }> } // Changed: id is now string[] for catch-all route
) {
  const resolvedParams = await params;
  // Extract id from array (first element) - catch-all route workaround for Next.js 15
  const leadId = resolvedParams.id?.[0];
  
  if (!leadId) {
    return NextResponse.json(
      { error: 'Lead ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const newScore = await recalculateLeadScore(leadId);
    
    return NextResponse.json({
      success: true,
      leadId,
      score: newScore,
      message: `Score recalculated: ${newScore}/100`,
    });
  } catch (error: any) {
    console.error('Error recalculating score:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to recalculate score' },
      { status: 500 }
    );
  }
}

