import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/admin/require-admin-request';
import {
  getOpenPortfolioLeadById,
  promoteLeadToQualifiedOpportunity,
  type OpenPortfolioLeadPayload,
} from '@/lib/open-portfolio/contact-leads-firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CHANNELS = new Set(['organic', 'ai', 'authority', 'outbound', 'unknown']);

/**
 * CCO promote: inquiry → qualified_opportunity.
 * POST /api/admin/open-leads/:id/promote
 * Body: { attributionChannel?, note? }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRequest(request);
  } catch (e: unknown) {
    const err = e as { status?: number; code?: string; message?: string };
    return NextResponse.json(
      { error: err.message ?? 'Unauthorized', code: err.code },
      { status: err.status ?? 401 },
    );
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: 'Missing lead id' }, { status: 400 });
  }

  const existing = await getOpenPortfolioLeadById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  let body: { attributionChannel?: string; note?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const attributionChannel = (
    CHANNELS.has(body.attributionChannel ?? '')
      ? body.attributionChannel
      : existing.attributionChannel ?? 'unknown'
  ) as OpenPortfolioLeadPayload['attributionChannel'];

  await promoteLeadToQualifiedOpportunity(id, {
    attributionChannel,
    note: typeof body.note === 'string' ? body.note.slice(0, 500) : undefined,
  });

  return NextResponse.json({
    ok: true,
    leadId: id,
    pipelineStage: 'qualified_opportunity',
    attributionChannel,
    company: existing.company ?? null,
    email: existing.email,
  });
}
