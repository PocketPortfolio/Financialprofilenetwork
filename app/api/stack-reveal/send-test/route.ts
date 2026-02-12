import { NextRequest, NextResponse } from 'next/server';
import { getSubject, buildHtmlForWeek, getUnsubscribeUrl } from '@/lib/stack-reveal/email-templates';
import { sendStackRevealEmail } from '@/lib/stack-reveal/resend';
import type { StackRevealWeek } from '@/lib/stack-reveal/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TARGET_TEST_EMAIL = 'abbalawal22s@gmail.com';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let to = process.env.STACK_REVEAL_TEST_EMAIL || TARGET_TEST_EMAIL;
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.email && typeof body.email === 'string') to = body.email;
  } catch {}

  const results: { week: number; subject: string; id?: string; error?: string }[] = [];

  for (let week = 1; week <= 4; week++) {
    const subject = getSubject(week as StackRevealWeek);
    const html = buildHtmlForWeek(week as StackRevealWeek, {
      greeting: 'Hi there,',
      uid: 'test-review',
      isGoogleUser: true,
    });
    const result = await sendStackRevealEmail(to, subject, html, getUnsubscribeUrl('test-review'));
    results.push({
      week,
      subject,
      id: result.id,
      error: result.error,
    });
  }

  const allOk = results.every((r) => !r.error);
  return NextResponse.json({
    success: allOk,
    to,
    results,
    message: allOk ? `Sent all 4 test emails to ${to}` : 'Some sends failed',
  });
}
