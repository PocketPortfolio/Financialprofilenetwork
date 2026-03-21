import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { validateEmail } from '@/lib/sales/email-validation';
import { isPlaceholderEmail } from '@/lib/sales/email-resolution';
import {
  buildChallengeTeamNotifyHtml,
  buildChallengeUserReplyHtml,
  injectChallengeEmailLogo,
} from '@/lib/challenge/challenge-lead-email';
import { recordArchitectureChallengeLead } from '@/lib/challenge/challenge-leads-firestore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FROM = process.env.MAIL_FROM || 'Pocket Portfolio <ai@pocketportfolio.app>';
const NOTIFY_TO =
  process.env.CHALLENGE_LEAD_TO?.trim() ||
  process.env.SUPPORT_EMAIL_TO?.trim() ||
  'ai@pocketportfolio.app';

const BLUEPRINT_URL = 'https://www.pocketportfolio.app/book/sovereign-intelligence';
const JOIN_URL = 'https://www.pocketportfolio.app/join';
const CHALLENGE_URL = 'https://www.pocketportfolio.app/challenge';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body.email === 'string' ? body.email.trim() : '';
    if (!raw) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (isPlaceholderEmail(raw)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    const validation = await validateEmail(raw);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.reason ? `Invalid email: ${validation.reason}` : 'Invalid email' },
        { status: 400 }
      );
    }

    const email = raw.toLowerCase();

    try {
      await recordArchitectureChallengeLead(email);
    } catch (persistErr) {
      console.error('[challenge/lead] Firestore persist failed:', persistErr);
    }

    const resend = getResend();

    if (resend) {
      const notifyHtml = injectChallengeEmailLogo(
        buildChallengeTeamNotifyHtml({ leadEmail: email, challengeUrl: CHALLENGE_URL })
      );
      const userHtml = injectChallengeEmailLogo(
        buildChallengeUserReplyHtml({
          blueprintUrl: BLUEPRINT_URL,
          joinUrl: JOIN_URL,
          challengeUrl: CHALLENGE_URL,
        })
      );

      const [toTeam, toUser] = await Promise.all([
        resend.emails.send({
          from: FROM,
          to: NOTIFY_TO,
          subject: `[Challenge] Lead: ${email}`,
          html: notifyHtml,
          tags: [{ name: 'campaign', value: 'architecture_challenge' }],
        } as any),
        resend.emails.send({
          from: FROM,
          to: email,
          subject: 'Your sovereign architecture resources — Pocket Portfolio',
          html: userHtml,
          tags: [{ name: 'campaign', value: 'architecture_challenge_reply' }],
        } as any),
      ]);

      if (toTeam.error || toUser.error) {
        console.error('[challenge/lead] Resend error', toTeam.error || toUser.error);
        return NextResponse.json(
          { error: 'Could not complete signup. Try again later.' },
          { status: 502 }
        );
      }
    } else {
      console.warn('[challenge/lead] RESEND_API_KEY unset — lead accepted but not emailed:', email);
    }

    return NextResponse.json({
      ok: true,
      message: resend
        ? 'Check your inbox for links to the technical blueprint and join flow.'
        : 'Thanks — your interest is recorded.',
    });
  } catch (e) {
    console.error('[challenge/lead]', e);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
