import { NextRequest, NextResponse } from 'next/server';
import { recordOpenPortfolioContactLead } from '@/lib/open-portfolio/contact-leads-firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * POST /api/open-portfolio/contact
 *
 * Accepts Open Portfolio (B2B) contact-form submissions and writes them to
 * Firestore. Reads surface in /admin/analytics via getOpenPortfolioLeadsAnalytics.
 *
 * Returns 200 on success, 400 on validation failure, 500 on persistence failure.
 * No tier or auth gate — this is the top-of-funnel capture for institutional
 * leads. Rate-limited by Vercel's default edge protections; if abuse becomes
 * an issue we can layer the existing rateLimit helper later.
 */

const VALID_CONTEXTS = new Set(['tier1', 'design-challenge', 'investor', 'grant', 'general']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  const company = typeof b.company === 'string' ? b.company.trim() : '';
  const role = typeof b.role === 'string' ? b.role.trim() : '';
  const context = typeof b.context === 'string' ? b.context.trim() : 'general';
  const source = typeof b.source === 'string' ? b.source.trim() : 'open_portfolio_landing';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!message || message.length < 8) {
    return NextResponse.json(
      { error: 'Please describe your audit-perimeter or substrate question (min 8 chars).' },
      { status: 400 },
    );
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: 'Message too long (max 4000 chars).' }, { status: 400 });
  }
  if (!VALID_CONTEXTS.has(context)) {
    return NextResponse.json({ error: 'Invalid context.' }, { status: 400 });
  }
  if (company.length > 200 || role.length > 200) {
    return NextResponse.json({ error: 'Company or role too long.' }, { status: 400 });
  }

  try {
    await recordOpenPortfolioContactLead({
      email,
      company: company || undefined,
      role: role || undefined,
      message,
      context: context as 'tier1' | 'design-challenge' | 'investor' | 'grant' | 'general',
      source,
    });
  } catch (e: unknown) {
    const m = e instanceof Error ? e.message : String(e);
    console.error('[open-portfolio/contact] persist failed:', m);
    return NextResponse.json({ error: 'Persistence failed. Please retry shortly.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
