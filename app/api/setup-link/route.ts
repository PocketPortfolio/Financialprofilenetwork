import { NextRequest, NextResponse } from 'next/server';
import { sendStackRevealEmail } from '@/lib/stack-reveal/resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pocketportfolio.app';

/**
 * POST /api/setup-link
 * Mobile Activation Bridge (Mandate 3): capture email and send a secure setup link to the user.
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('[setup-link] RESEND_API_KEY is not set; cannot send email.');
      return NextResponse.json(
        { error: 'Email service is not configured. Please try again later.' },
        { status: 503 }
      );
    }

    const setupUrl = `${DASHBOARD_URL.replace(/\/$/, '')}/dashboard`;
    const subject = 'Your Pocket Portfolio setup link — open on desktop';
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1f2937;">
        <p style="font-size:16px;line-height:1.6;margin-bottom:16px;">Pocket Portfolio is a desktop-grade pro tool. Use the link below to open the app on your computer and get started.</p>
        <p style="margin:24px 0;">
          <a href="${setupUrl}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#000;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Open Pocket Portfolio on desktop</a>
        </p>
        <p style="font-size:14px;color:#6b7280;margin-top:24px;">If you didn't request this, you can ignore this email.</p>
        <p style="font-size:12px;color:#9ca3af;margin-top:32px;">Pocket Portfolio — local-first portfolio tracking.</p>
      </div>
    `;

    const result = await sendStackRevealEmail(email, subject, html);
    if (result.error) {
      console.error('[setup-link] Resend error:', result.error);
      return NextResponse.json(
        { error: 'We couldn’t send the email. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[setup-link] Email sent to:', email, 'id:', result.id);
    return NextResponse.json({ success: true, message: 'Setup link sent. Check your email.' });
  } catch (err) {
    console.error('[setup-link] Error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
