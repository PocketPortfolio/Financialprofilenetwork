import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/sales/client';
import { leads } from '@/db/sales/schema';
import { eq } from 'drizzle-orm';
import { recalculateLeadScore } from '@/app/agent/researcher';

/**
 * POST /api/agent/leads/[id]/recalculate-score
 * Recalculate confidence score for an existing lead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: leadId } = await params;
  
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

