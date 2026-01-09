import { NextRequest, NextResponse } from 'next/server';
import { recalculateLeadScore } from '@/app/agent/researcher';

// Next.js route configuration for production
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/agent/leads/recalculate-score
 * Recalculate confidence score for an existing lead
 * 
 * Request body: { leadId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { leadId } = await request.json();
    
    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required in request body' },
        { status: 400 }
      );
    }
    
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

